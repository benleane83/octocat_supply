/**
 * @swagger
 * tags:
 *   name: Carts
 *   description: API endpoints for managing shopping carts
 */

/**
 * @swagger
 * /api/carts:
 *   get:
 *     summary: Get current cart with items
 *     tags: [Carts]
 *     responses:
 *       200:
 *         description: Cart with items and total
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart:
 *                   $ref: '#/components/schemas/Cart'
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CartItem'
 *                 total:
 *                   type: number
 *
 * /api/carts/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Carts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *               - unitPrice
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               unitPrice:
 *                 type: number
 *     responses:
 *       201:
 *         description: Item added to cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItem'
 *
 * /api/carts/items/{id}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cart item updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItem'
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Carts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart item ID
 *     responses:
 *       204:
 *         description: Item removed from cart
 *
 * /api/carts/checkout:
 *   post:
 *     summary: Convert cart to order
 *     tags: [Carts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - branchId
 *             properties:
 *               branchId:
 *                 type: integer
 *               orderName:
 *                 type: string
 *               orderDescription:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created from cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */

import express, { RequestHandler } from 'express';
import { getCartsRepository } from '../repositories/cartsRepo';
import { getOrdersRepository } from '../repositories/ordersRepo';
import { getOrderDetailsRepository } from '../repositories/orderDetailsRepo';
import { getProductsRepository } from '../repositories/productsRepo';
import { NotFoundError } from '../utils/errors';

const router = express.Router();

// Helper to get or create session ID
function getSessionId(req: express.Request): string {
  if (!req.session.cartSessionId) {
    req.session.cartSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
  return req.session.cartSessionId;
}

// Get current cart with items
router.get('/', async (req, res, next) => {
  try {
    const sessionId = getSessionId(req);
    const repo = await getCartsRepository();
    const cart = await repo.getOrCreateCart(sessionId);
    const items = await repo.getCartItems(cart.cartId);
    const total = await repo.getCartTotal(cart.cartId);

    res.json({ cart, items, total });
  } catch (error) {
    next(error);
  }
});

// Add item to cart
const addItemHandler: RequestHandler = async (req, res, next) => {
  try {
    const sessionId = getSessionId(req);
    const { productId, quantity, unitPrice } = req.body;

    if (!productId || !quantity || quantity <= 0 || !unitPrice) {
      res.status(400).json({ error: 'Invalid product, quantity, or price' });
      return;
    }

    // Verify product exists
    const productsRepo = await getProductsRepository();
    const product = await productsRepo.findById(productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const repo = await getCartsRepository();
    const cart = await repo.getOrCreateCart(sessionId);
    const cartItem = await repo.addItem(cart.cartId, productId, quantity, unitPrice);

    res.status(201).json(cartItem);
  } catch (error) {
    next(error);
  }
};

router.post('/items', addItemHandler);

// Update cart item quantity
const updateItemHandler: RequestHandler = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      res.status(400).json({ error: 'Invalid quantity' });
      return;
    }

    const repo = await getCartsRepository();
    const updatedItem = await repo.updateItemQuantity(parseInt(req.params.id), quantity);

    res.json(updatedItem);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: 'Cart item not found' });
    } else {
      next(error);
    }
  }
};

router.put('/items/:id', updateItemHandler);

// Remove item from cart
router.delete('/items/:id', async (req, res, next) => {
  try {
    const repo = await getCartsRepository();
    await repo.removeItem(parseInt(req.params.id));

    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: 'Cart item not found' });
    } else {
      next(error);
    }
  }
});

// Checkout - convert cart to order
const checkoutHandler: RequestHandler = async (req, res, next) => {
  try {
    const sessionId = getSessionId(req);
    const { branchId, orderName, orderDescription } = req.body;

    if (!branchId) {
      res.status(400).json({ error: 'Branch ID is required' });
      return;
    }

    const cartsRepo = await getCartsRepository();
    const cart = await cartsRepo.getOrCreateCart(sessionId);
    const cartItems = await cartsRepo.getCartItems(cart.cartId);

    if (cartItems.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    // Create order
    const ordersRepo = await getOrdersRepository();
    const order = await ordersRepo.create({
      branchId,
      orderDate: new Date().toISOString(),
      name: orderName || 'Order from Cart',
      description: orderDescription || '',
      status: 'pending',
    });

    // Create order details from cart items
    const orderDetailsRepo = await getOrderDetailsRepository();
    for (const item of cartItems) {
      await orderDetailsRepo.create({
        orderId: order.orderId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        notes: '',
      });
    }

    // Clear the cart
    await cartsRepo.clearCart(cart.cartId);

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

router.post('/checkout', checkoutHandler);

export default router;
