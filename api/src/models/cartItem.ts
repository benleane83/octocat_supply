/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       required:
 *         - cartItemId
 *         - cartId
 *         - productId
 *         - quantity
 *         - unitPrice
 *       properties:
 *         cartItemId:
 *           type: integer
 *           description: The unique identifier for the cart item
 *         cartId:
 *           type: integer
 *           description: The ID of the parent cart
 *         productId:
 *           type: integer
 *           description: The ID of the product in the cart
 *         quantity:
 *           type: integer
 *           description: The quantity of products in the cart
 *         unitPrice:
 *           type: number
 *           format: float
 *           description: The price per unit at time of adding to cart
 */
export interface CartItem {
  cartItemId: number;
  cartId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
}
