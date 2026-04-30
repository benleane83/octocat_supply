/**
 * Repository for orders data access
 */

import { getDatabase, DatabaseConnection } from '../db/sqlite';
import { Order } from '../models/order';
import { CheckoutRequest, CheckoutResponse, CheckoutResponseItem } from '../models/orderCheckout';
import { handleDatabaseError, NotFoundError, ValidationError } from '../utils/errors';
import { buildInsertSQL, buildUpdateSQL, objectToCamelCase, mapDatabaseRows, DatabaseRow, generatePlaceholders } from '../utils/sql';

export class OrdersRepository {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  /**
   * Get all orders
   */
  async findAll(): Promise<Order[]> {
    try {
      const rows = await this.db.all<DatabaseRow>('SELECT * FROM orders ORDER BY order_id');
      return mapDatabaseRows<Order>(rows);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Get order by ID
   */
  async findById(id: number): Promise<Order | null> {
    try {
      const row = await this.db.get<DatabaseRow>('SELECT * FROM orders WHERE order_id = ?', [id]);
      return row ? objectToCamelCase<Order>(row) : null;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Create a new order
   */
  async create(order: Omit<Order, 'orderId'>): Promise<Order> {
    try {
      const { sql, values } = buildInsertSQL('orders', order);
      const result = await this.db.run(sql, values);

      const createdOrder = await this.findById(result.lastID || 0);
      if (!createdOrder) {
        throw new Error('Failed to retrieve created order');
      }

      return createdOrder;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Update order by ID
   */
  async update(id: number, order: Partial<Omit<Order, 'orderId'>>): Promise<Order> {
    try {
      const { sql, values } = buildUpdateSQL('orders', order, 'order_id = ?');
      const result = await this.db.run(sql, [...values, id]);

      if (result.changes === 0) {
        throw new NotFoundError('Order', id);
      }

      const updatedOrder = await this.findById(id);
      if (!updatedOrder) {
        throw new Error('Failed to retrieve updated order');
      }

      return updatedOrder;
    } catch (error) {
      handleDatabaseError(error, 'Order', id);
    }
  }

  /**
   * Delete order by ID
   */
  async delete(id: number): Promise<void> {
    try {
      const result = await this.db.run('DELETE FROM orders WHERE order_id = ?', [id]);

      if (result.changes === 0) {
        throw new NotFoundError('Order', id);
      }
    } catch (error) {
      handleDatabaseError(error, 'Order', id);
    }
  }

  /**
   * Check if order exists
   */
  async exists(id: number): Promise<boolean> {
    try {
      const result = await this.db.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM orders WHERE order_id = ?',
        [id],
      );
      return (result?.count || 0) > 0;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Find orders by branch ID
   */
  async findByBranchId(branchId: number): Promise<Order[]> {
    try {
      const rows = await this.db.all<DatabaseRow>(
        'SELECT * FROM orders WHERE branch_id = ? ORDER BY order_date DESC',
        [branchId],
      );
      return mapDatabaseRows<Order>(rows);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Find orders by status
   */
  async findByStatus(status: string): Promise<Order[]> {
    try {
      const rows = await this.db.all<DatabaseRow>(
        'SELECT * FROM orders WHERE status = ? ORDER BY order_date DESC',
        [status],
      );
      return mapDatabaseRows<Order>(rows);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Find orders by date range
   */
  async findByDateRange(startDate: string, endDate: string): Promise<Order[]> {
    try {
      const rows = await this.db.all<DatabaseRow>(
        'SELECT * FROM orders WHERE order_date >= ? AND order_date <= ? ORDER BY order_date DESC',
        [startDate, endDate],
      );
      return mapDatabaseRows<Order>(rows);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Create an order transactionally from a guest cart checkout request.
   * Validates input, resolves server-side prices, and inserts the order and
   * all order_details atomically using better-sqlite3 transactions.
   */
  async createFromCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
    // --- Input validation ---
    if (!Number.isInteger(request.branchId) || request.branchId <= 0) {
      throw new ValidationError('branchId must be a positive integer');
    }
    if (!Array.isArray(request.items) || request.items.length === 0) {
      throw new ValidationError('items must be a non-empty array');
    }
    for (const item of request.items) {
      if (!Number.isInteger(item.productId) || item.productId <= 0) {
        throw new ValidationError('Each item must have a positive integer productId');
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new ValidationError('Each item quantity must be a positive integer');
      }
    }

    // --- Validate branch exists ---
    const branchRow = await this.db.get<DatabaseRow>(
      'SELECT branch_id FROM branches WHERE branch_id = ?',
      [request.branchId],
    );
    if (!branchRow) {
      throw new NotFoundError('Branch', request.branchId);
    }

    // --- Batch-fetch products ---
    const productIds = request.items.map((i) => i.productId);
    const placeholders = generatePlaceholders(productIds.length);
    const productRows = await this.db.all<DatabaseRow>(
      `SELECT product_id, price, discount FROM products WHERE product_id IN (${placeholders})`,
      productIds,
    );

    type ProductRow = { productId: number; price: number; discount: number | null };
    const productMap = new Map<number, ProductRow>();
    for (const row of productRows) {
      const r = objectToCamelCase<ProductRow>(row);
      productMap.set(r.productId, r);
    }

    // Verify all requested products exist
    for (const item of request.items) {
      if (!productMap.has(item.productId)) {
        throw new NotFoundError('Product', item.productId);
      }
    }

    // --- Transactional insert ---
    const orderDate = new Date().toISOString();

    const txn = this.db.db.transaction(() => {
      // Insert order
      const orderStmt = this.db.db.prepare(
        'INSERT INTO orders (branch_id, name, description, status, order_date) VALUES (?, ?, ?, ?, ?)',
      );
      const orderResult = orderStmt.run(
        request.branchId,
        'Shopping cart order',
        'Created from guest cart checkout',
        'pending',
        orderDate,
      );
      const orderId =
        typeof orderResult.lastInsertRowid === 'bigint'
          ? Number(orderResult.lastInsertRowid)
          : orderResult.lastInsertRowid;

      // Insert order_details
      const detailStmt = this.db.db.prepare(
        'INSERT INTO order_details (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
      );
      const detailRows: CheckoutResponseItem[] = [];

      for (const item of request.items) {
        const product = productMap.get(item.productId)!;
        const unitPrice =
          product.discount != null && product.discount > 0
            ? product.price * (1 - product.discount)
            : product.price;

        const detailResult = detailStmt.run(orderId, item.productId, item.quantity, unitPrice);
        const detailId =
          typeof detailResult.lastInsertRowid === 'bigint'
            ? Number(detailResult.lastInsertRowid)
            : detailResult.lastInsertRowid;

        detailRows.push({
          orderDetailId: detailId as number,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
        });
      }

      return { orderId: orderId as number, detailRows };
    });

    try {
      const { orderId, detailRows } = txn() as {
        orderId: number;
        detailRows: CheckoutResponseItem[];
      };

      const total = detailRows.reduce((sum, d) => sum + d.unitPrice * d.quantity, 0);

      return {
        orderId,
        status: 'pending',
        orderDate,
        items: detailRows,
        total,
      };
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

// Factory function to create repository instance
export async function createOrdersRepository(isTest: boolean = false): Promise<OrdersRepository> {
  const db = await getDatabase(isTest);
  return new OrdersRepository(db);
}

// Singleton instance for default usage
let ordersRepo: OrdersRepository | null = null;

export async function getOrdersRepository(isTest: boolean = false): Promise<OrdersRepository> {
  const isTestEnv = isTest || process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
  if (isTestEnv) {
    return createOrdersRepository(true);
  }
  if (!ordersRepo) {
    ordersRepo = await createOrdersRepository(false);
  }
  return ordersRepo;
}
