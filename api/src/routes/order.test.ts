import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import orderRouter from './order';
import { runMigrations } from '../db/migrate';
import { closeDatabase, getDatabase } from '../db/sqlite';
import { errorHandler } from '../utils/errors';

let app: express.Express;

describe('Order Checkout API', () => {
  beforeEach(async () => {
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    const db = await getDatabase();

    // Seed supplier
    await db.run(
      'INSERT INTO suppliers (supplier_id, name, contact_person, email, phone) VALUES (?, ?, ?, ?, ?)',
      [1, 'Test Supplier', 'Alice', 'alice@test.com', '555-0000'],
    );

    // Seed products
    await db.run(
      'INSERT INTO products (product_id, supplier_id, name, description, price, sku, unit, img_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [1, 1, 'Widget A', 'A great widget', 10.0, 'SKU-001', 'each', 'widget-a.png'],
    );
    await db.run(
      'INSERT INTO products (product_id, supplier_id, name, description, price, sku, unit, img_name, discount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [2, 1, 'Widget B', 'A discounted widget', 20.0, 'SKU-002', 'each', 'widget-b.png', 0.25],
    );

    // Seed headquarters and branch
    await db.run('INSERT INTO headquarters (headquarters_id, name) VALUES (?, ?)', [
      1,
      'HQ One',
    ]);
    await db.run(
      'INSERT INTO branches (branch_id, headquarters_id, name, description, address, contact_person, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [1, 1, 'Main Branch', 'Main branch', '1 Main St', 'Bob', 'bob@test.com', '555-0001'],
    );

    app = express();
    app.use(express.json());
    app.use('/orders', orderRouter);
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it('should create an order with correct server-side discounted unit price', async () => {
    const response = await request(app)
      .post('/orders/checkout')
      .send({
        branchId: 1,
        items: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.orderId).toBeDefined();
    expect(response.body.status).toBe('pending');
    expect(response.body.orderDate).toBeDefined();
    expect(response.body.items).toHaveLength(2);

    const itemA = response.body.items.find((i: { productId: number }) => i.productId === 1);
    const itemB = response.body.items.find((i: { productId: number }) => i.productId === 2);

    expect(itemA).toBeDefined();
    expect(itemA.unitPrice).toBeCloseTo(10.0);
    expect(itemA.quantity).toBe(2);

    expect(itemB).toBeDefined();
    // 20.0 * (1 - 0.25) = 15.0
    expect(itemB.unitPrice).toBeCloseTo(15.0);
    expect(itemB.quantity).toBe(1);

    // total = 10*2 + 15*1 = 35
    expect(response.body.total).toBeCloseTo(35.0);
  });

  it('should return 400 for an empty items array', async () => {
    const response = await request(app)
      .post('/orders/checkout')
      .send({ branchId: 1, items: [] });

    expect(response.status).toBe(400);
  });

  it('should return 400 for invalid quantity (zero)', async () => {
    const response = await request(app)
      .post('/orders/checkout')
      .send({ branchId: 1, items: [{ productId: 1, quantity: 0 }] });

    expect(response.status).toBe(400);
  });

  it('should return 400 for invalid quantity (negative)', async () => {
    const response = await request(app)
      .post('/orders/checkout')
      .send({ branchId: 1, items: [{ productId: 1, quantity: -1 }] });

    expect(response.status).toBe(400);
  });

  it('should return 404 for a missing product', async () => {
    const response = await request(app)
      .post('/orders/checkout')
      .send({ branchId: 1, items: [{ productId: 9999, quantity: 1 }] });

    expect(response.status).toBe(404);
  });

  it('should return 404 for a missing branch', async () => {
    const response = await request(app)
      .post('/orders/checkout')
      .send({ branchId: 9999, items: [{ productId: 1, quantity: 1 }] });

    expect(response.status).toBe(404);
  });
});
