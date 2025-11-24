/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: API endpoints for managing orders
 */

/**
 * @swagger
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
import { handleDatabaseError, NotFoundError, ValidationError } from '../utils/errors';

const router = express.Router();

// Create a new order with order details
router.post('/', async (req, res, next) => {
  try {
    const { items, ...orderData } = req.body;

    // Validate order data
    if (!orderData.branchId || !orderData.name) {
      throw new ValidationError('Missing required fields: branchId and name are required');
    }

    // Validate items if provided
    if (items && (!Array.isArray(items) || items.length === 0)) {
      throw new ValidationError('Items must be a non-empty array');
    }

    const ordersRepo = await getOrdersRepository();
    const orderDetailsRepo = await getOrderDetailsRepository();
    const productsRepo = await getProductsRepository();

    // Create the order
    const newOrder = await ordersRepo.create(orderData as Omit<Order, 'orderId'>);

    // Create order details if items are provided
    if (items && items.length > 0) {
      for (const item of items) {
        if (!item.productId || item.quantity <= 0 || item.unitPrice <= 0) {
          throw new ValidationError(
            'Each item must have valid productId, quantity (>0), and unitPrice (>0)',
          );
        }

        // Verify product exists
        const product = await productsRepo.findById(item.productId);
        if (!product) {
          throw new NotFoundError('Product', item.productId);
        }

        // Create order detail
        await orderDetailsRepo.create({
          orderId: newOrder.orderId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          notes: item.notes || '',
        });
      }
    }

    // Return the created order
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
