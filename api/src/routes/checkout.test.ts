import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import checkoutRouter from './checkout';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('Checkout API', () => {
  beforeEach(async () => {
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    const db = await getDatabase();

    // Seed: headquarters → branch → supplier → products
    await db.run('INSERT INTO headquarters (headquarters_id, name) VALUES (?, ?)', [1, 'HQ One']);
    await db.run(
      'INSERT INTO branches (branch_id, headquarters_id, name) VALUES (?, ?, ?)',
      [1, 1, 'Main Branch'],
    );
    await db.run(
      'INSERT INTO suppliers (supplier_id, name) VALUES (?, ?)',
      [1, 'Test Supplier'],
    );
    await db.run(
      'INSERT INTO products (product_id, supplier_id, name, price, sku, unit, img_name, discount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [1, 1, 'Cat Bowl', 9.99, 'SKU-001', 'each', 'cat-bowl.png', 0],
    );
    await db.run(
      'INSERT INTO products (product_id, supplier_id, name, price, sku, unit, img_name, discount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [2, 1, 'Cat Toy', 4.99, 'SKU-002', 'each', 'cat-toy.png', 0.1],
    );

    app = express();
    app.use(express.json());
    app.use('/api/checkout', checkoutRouter);
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create an order for a valid cart', async () => {
    const payload = {
      branchId: 1,
      lineItems: [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 3 },
      ],
    };

    const response = await request(app).post('/api/checkout').send(payload);

    expect(response.status).toBe(201);
    expect(response.body.orderId).toBeDefined();
    expect(response.body.branchId).toBe(1);
    expect(response.body.status).toBe('pending');
    expect(response.body.details).toHaveLength(2);

    const detail1 = response.body.details.find(
      (d: { productId: number }) => d.productId === 1,
    );
    expect(detail1.quantity).toBe(2);
    expect(detail1.unitPrice).toBeCloseTo(9.99);

    const detail2 = response.body.details.find(
      (d: { productId: number }) => d.productId === 2,
    );
    expect(detail2.quantity).toBe(3);
    expect(detail2.unitPrice).toBeCloseTo(4.491); // 4.99 * 0.9
  });

  it('should resolve server-side discounted price', async () => {
    const payload = {
      branchId: 1,
      lineItems: [{ productId: 2, quantity: 1 }],
    };

    const response = await request(app).post('/api/checkout').send(payload);

    expect(response.status).toBe(201);
    const detail = response.body.details[0];
    expect(detail.unitPrice).toBeCloseTo(4.99 * 0.9);
  });

  it('should return 400 for an empty lineItems array', async () => {
    const payload = { branchId: 1, lineItems: [] };
    const response = await request(app).post('/api/checkout').send(payload);
    expect(response.status).toBe(400);
  });

  it('should return 400 when lineItems is missing', async () => {
    const response = await request(app).post('/api/checkout').send({ branchId: 1 });
    expect(response.status).toBe(400);
  });

  it('should return 400 when branchId is missing', async () => {
    const response = await request(app)
      .post('/api/checkout')
      .send({ lineItems: [{ productId: 1, quantity: 1 }] });
    expect(response.status).toBe(400);
  });

  it('should return 400 for a quantity less than 1', async () => {
    const payload = {
      branchId: 1,
      lineItems: [{ productId: 1, quantity: 0 }],
    };
    const response = await request(app).post('/api/checkout').send(payload);
    expect(response.status).toBe(400);
  });

  it('should return 404 for an invalid product ID', async () => {
    const payload = {
      branchId: 1,
      lineItems: [{ productId: 9999, quantity: 1 }],
    };
    const response = await request(app).post('/api/checkout').send(payload);
    expect(response.status).toBe(404);
  });

  it('should return 404 for an invalid branch ID', async () => {
    const payload = {
      branchId: 9999,
      lineItems: [{ productId: 1, quantity: 1 }],
    };
    const response = await request(app).post('/api/checkout').send(payload);
    expect(response.status).toBe(404);
  });

  it('should persist order and order_details in the database', async () => {
    const payload = {
      branchId: 1,
      lineItems: [{ productId: 1, quantity: 5 }],
    };

    const response = await request(app).post('/api/checkout').send(payload);
    expect(response.status).toBe(201);

    const db = await getDatabase();
    const order = await db.get<{ order_id: number; branch_id: number; status: string }>(
      'SELECT * FROM orders WHERE order_id = ?',
      [response.body.orderId],
    );
    expect(order).toBeDefined();
    if (order) {
      expect(order.branch_id).toBe(1);
      expect(order.status).toBe('pending');
    }

    const details = await db.all<{ product_id: number; quantity: number; unit_price: number }>(
      'SELECT * FROM order_details WHERE order_id = ?',
      [response.body.orderId],
    );
    expect(details).toHaveLength(1);
    expect(details[0].quantity).toBe(5);
  });
});
