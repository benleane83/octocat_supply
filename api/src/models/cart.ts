/**
 * @swagger
 * components:
 *   schemas:
 *     Cart:
 *       type: object
 *       required:
 *         - cartId
 *         - sessionId
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         cartId:
 *           type: integer
 *           description: The unique identifier for the cart
 *         sessionId:
 *           type: string
 *           description: The session ID associated with the cart
 *         userId:
 *           type: integer
 *           description: The user ID (optional, for authenticated users)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the cart was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the cart was last updated
 */
export interface Cart {
  cartId: number;
  sessionId: string;
  userId?: number;
  createdAt: string;
  updatedAt: string;
}
