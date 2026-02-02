/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: API endpoints for shopping cart operations
 */

/**
 * @swagger
 * /api/cart/validate:
 *   post:
 *     summary: Validate cart items and calculate totals with discounts
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Cart validated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: integer
 *                       productName:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       unitPrice:
 *                         type: number
 *                       discount:
 *                         type: number
 *                       subtotal:
 *                         type: number
 *                 total:
 *                   type: number
 *       400:
 *         description: Invalid cart items or insufficient stock
 */

import express from 'express';
import { getProductsRepository } from '../repositories/productsRepo';

const router = express.Router();

interface CartItemRequest {
  productId: number;
  quantity: number;
}

interface CartValidationRequest {
  items: CartItemRequest[];
}

interface CartItemResponse {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

interface CartValidationResponse {
  items: CartItemResponse[];
  total: number;
}

// Validate cart items and calculate totals
router.post('/validate', async (req, res, next): Promise<void> => {
  try {
    const { items } = req.body as CartValidationRequest;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Cart is empty or invalid' });
      return;
    }

    const repo = await getProductsRepository();
    const validatedItems: CartItemResponse[] = [];
    let total = 0;

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        res.status(400).json({ error: 'Invalid product or quantity' });
        return;
      }

      const product = await repo.findById(item.productId);
      if (!product) {
        res.status(400).json({ error: `Product ${item.productId} not found` });
        return;
      }

      // Calculate price with discount
      const discount = product.discount || 0;
      const unitPrice = product.price;
      const discountedPrice = unitPrice * (1 - discount);
      const subtotal = discountedPrice * item.quantity;

      validatedItems.push({
        productId: product.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: unitPrice,
        discount: discount,
        subtotal: subtotal,
      });

      total += subtotal;
    }

    const response: CartValidationResponse = {
      items: validatedItems,
      total: total,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
