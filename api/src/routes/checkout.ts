/**
 * @swagger
 * tags:
 *   name: Checkout
 *   description: Guest checkout – create an order from a cart
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CheckoutLineItem:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         productId:
 *           type: integer
 *           description: ID of the product to order
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: Number of units to order
 *     CheckoutRequest:
 *       type: object
 *       required:
 *         - branchId
 *         - lineItems
 *       properties:
 *         branchId:
 *           type: integer
 *           description: ID of the branch that will receive the order
 *         lineItems:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/CheckoutLineItem'
 *     CheckoutOrderDetail:
 *       type: object
 *       properties:
 *         productId:
 *           type: integer
 *         quantity:
 *           type: integer
 *         unitPrice:
 *           type: number
 *           format: float
 *     CheckoutResponse:
 *       type: object
 *       properties:
 *         orderId:
 *           type: integer
 *         branchId:
 *           type: integer
 *         orderDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *         details:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CheckoutOrderDetail'
 *
 * /api/checkout:
 *   post:
 *     summary: Submit a guest cart for checkout
 *     tags: [Checkout]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CheckoutResponse'
 *       400:
 *         description: Validation error (empty cart, invalid quantity, missing branchId)
 *       404:
 *         description: Product or branch not found
 *       500:
 *         description: Internal server error
 */

import express from 'express';
import { getDatabase } from '../db/sqlite';
import { ValidationError, NotFoundError } from '../utils/errors';

interface LineItemInput {
  productId: number;
  quantity: number;
}

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { branchId, lineItems } = req.body as {
      branchId: unknown;
      lineItems: unknown;
    };

    // ── Input validation ──────────────────────────────────────────────────
    if (!branchId || typeof branchId !== 'number' || !Number.isInteger(branchId)) {
      throw new ValidationError('branchId must be a positive integer');
    }
    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      throw new ValidationError('lineItems must be a non-empty array');
    }

    const validatedItems: LineItemInput[] = [];
    for (const item of lineItems) {
      const li = item as Record<string, unknown>;
      if (
        !li.productId ||
        typeof li.productId !== 'number' ||
        !Number.isInteger(li.productId) ||
        !li.quantity ||
        typeof li.quantity !== 'number' ||
        !Number.isInteger(li.quantity) ||
        li.quantity < 1
      ) {
        throw new ValidationError(
          'Each line item must have an integer productId and a quantity of at least 1',
        );
      }
      validatedItems.push({ productId: li.productId as number, quantity: li.quantity as number });
    }

    const db = await getDatabase();

    // ── Validate branch exists ────────────────────────────────────────────
    const branch = await db.get<{ branch_id: number }>(
      'SELECT branch_id FROM branches WHERE branch_id = ?',
      [branchId],
    );
    if (!branch) {
      throw new NotFoundError('Branch', branchId);
    }

    // ── Resolve product prices (server-side) ──────────────────────────────
    type ProductRow = { product_id: number; price: number; discount: number | null };
    const productMap = new Map<number, { price: number; discount: number }>();

    for (const item of validatedItems) {
      const product = await db.get<ProductRow>(
        'SELECT product_id, price, discount FROM products WHERE product_id = ?',
        [item.productId],
      );
      if (!product) {
        throw new NotFoundError('Product', item.productId);
      }
      productMap.set(item.productId, {
        price: product.price,
        discount: product.discount ?? 0,
      });
    }

    // ── Transactional write ───────────────────────────────────────────────
    const orderDate = new Date().toISOString();

    const result = db.db.transaction(() => {
      const orderStmt = db.db.prepare(
        'INSERT INTO orders (branch_id, order_date, name, status) VALUES (?, ?, ?, ?)',
      );
      const orderResult = orderStmt.run(branchId, orderDate, 'Guest Checkout Order', 'pending');
      const orderId = Number(orderResult.lastInsertRowid);

      const detailStmt = db.db.prepare(
        'INSERT INTO order_details (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
      );

      const details: { productId: number; quantity: number; unitPrice: number }[] = [];
      for (const item of validatedItems) {
        const productInfo = productMap.get(item.productId);
        if (!productInfo) {
          throw new NotFoundError('Product', item.productId);
        }
        const { price, discount } = productInfo;
        const unitPrice = price * (1 - discount);
        detailStmt.run(orderId, item.productId, item.quantity, unitPrice);
        details.push({ productId: item.productId, quantity: item.quantity, unitPrice });
      }

      return { orderId, branchId, orderDate, status: 'pending', details };
    })();

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
