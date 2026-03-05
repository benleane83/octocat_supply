/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: API endpoints for managing orders
 */

/**
 * @swagger
 * /api/orders/checkout:
 *   post:
 *     summary: Create an order with items atomically (checkout)
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - branchId
 *               - items
 *             properties:
 *               branchId:
 *                 type: integer
 *                 description: The ID of the branch placing the order
 *               items:
 *                 type: array
 *                 description: Array of products to order
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       description: The ID of the product
 *                     quantity:
 *                       type: integer
 *                       description: Quantity to order
 *           example:
 *             branchId: 1
 *             items:
 *               - productId: 1
 *                 quantity: 2
 *               - productId: 3
 *                 quantity: 1
 *     responses:
 *       201:
 *         description: Order created successfully with all items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *                 details:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderDetail'
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Product not found
 *       500:
 *         description: Transaction failed, order rolled back
 *
 * /api/orders:
 *   get:
 *     summary: Returns all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *
 * /api/orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *   put:
 *     summary: Update an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *   delete:
 *     summary: Delete an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       204:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 */

import express from 'express';
import { Order } from '../models/order';
import { OrderDetail } from '../models/orderDetail';
import { getOrdersRepository } from '../repositories/ordersRepo';
import { getOrderDetailsRepository } from '../repositories/orderDetailsRepo';
import { getProductsRepository } from '../repositories/productsRepo';
import { getDatabase } from '../db/sqlite';
import { handleDatabaseError, NotFoundError } from '../utils/errors';

const router = express.Router();

interface CheckoutRequest {
  branchId: number;
  items: Array<{ productId: number; quantity: number }>;
}

interface CheckoutResponse {
  order: Order;
  details: OrderDetail[];
}

// Checkout endpoint - create order with items atomically
router.post('/checkout', async (req, res, next) => {
  try {
    const { branchId, items } = req.body as CheckoutRequest;

    // Validate request
    if (!branchId || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Invalid request: branchId and items array required' });
      return;
    }

    // Generate order name and description
    const now = new Date();
    const orderName = `Order – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    const orderDescription = `Order placed on ${now.toLocaleString()}`;
    const orderDate = now.toISOString();

    const db = await getDatabase();
    const ordersRepo = await getOrdersRepository();
    const orderDetailsRepo = await getOrderDetailsRepository();
    const productsRepo = await getProductsRepository();

    let createdOrder: Order | null = null;
    const details: OrderDetail[] = [];

    try {
      // Start transaction
      await db.run('BEGIN TRANSACTION');

      // Create the order
      createdOrder = await ordersRepo.create({
        branchId,
        orderDate,
        name: orderName,
        description: orderDescription,
        status: 'pending',
      });

      // Create order details for each item
      for (const item of items) {
        const { productId, quantity } = item;

        if (!productId || !quantity || quantity <= 0) {
          throw new Error('Invalid item: productId and positive quantity required');
        }

        // Get product to snapshot price
        const product = await productsRepo.findById(productId);
        if (!product) {
          throw new NotFoundError('Product', productId);
        }

        // Create order detail with snapshotted price
        const orderDetail = await orderDetailsRepo.create({
          orderId: createdOrder.orderId,
          productId,
          quantity,
          unitPrice: product.price,
          notes: '',
        });

        details.push(orderDetail);
      }

      // Commit transaction
      await db.run('COMMIT');

      res.status(201).json({ order: createdOrder, details });
    } catch (error) {
      // Rollback on any error
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
    } else {
      next(error);
    }
  }
});

// Create a new order
router.post('/', async (req, res, next) => {
  try {
    const repo = await getOrdersRepository();
    const newOrder = await repo.create(req.body as Omit<Order, 'orderId'>);
    res.status(201).json(newOrder);
  } catch (error) {
    next(error);
  }
});

// Get all orders
router.get('/', async (req, res, next) => {
  try {
    const repo = await getOrdersRepository();
    const orders = await repo.findAll();

    // Non-linear pattern example: duplicate destructuring in object
    if (orders.length > 0) {
      const { orderId: id, orderId: duplicateId } = orders[0];
      console.log('Non-linear pattern in order routes:', id, duplicateId);
    }

    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// Get an order by ID
router.get('/:id', async (req, res, next) => {
  try {
    const repo = await getOrdersRepository();
    const order = await repo.findById(parseInt(req.params.id));
    if (order) {
      res.json(order);
    } else {
      res.status(404).send('Order not found');
    }
  } catch (error) {
    next(error);
  }
});

// Update an order by ID
router.put('/:id', async (req, res, next) => {
  try {
    const repo = await getOrdersRepository();
    const updatedOrder = await repo.update(parseInt(req.params.id), req.body);
    res.json(updatedOrder);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send('Order not found');
    } else {
      next(error);
    }
  }
});

// Delete an order by ID
router.delete('/:id', async (req, res, next) => {
  try {
    const repo = await getOrdersRepository();
    await repo.delete(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send('Order not found');
    } else {
      next(error);
    }
  }
});

export default router;
