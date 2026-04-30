/**
 * @swagger
 * components:
 *   schemas:
 *     CheckoutItem:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         productId:
 *           type: integer
 *           description: The ID of the product to order
 *         quantity:
 *           type: integer
 *           description: The quantity of the product to order (must be >= 1)
 *
 *     CheckoutRequest:
 *       type: object
 *       required:
 *         - branchId
 *         - items
 *       properties:
 *         branchId:
 *           type: integer
 *           description: The ID of the branch placing the order
 *         items:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/CheckoutItem'
 *
 *     CheckoutResponseItem:
 *       type: object
 *       required:
 *         - orderDetailId
 *         - productId
 *         - quantity
 *         - unitPrice
 *       properties:
 *         orderDetailId:
 *           type: integer
 *           description: The unique identifier for the order detail
 *         productId:
 *           type: integer
 *           description: The ID of the product
 *         quantity:
 *           type: integer
 *           description: The quantity ordered
 *         unitPrice:
 *           type: number
 *           format: float
 *           description: The server-resolved unit price after any discount
 *
 *     CheckoutResponse:
 *       type: object
 *       required:
 *         - orderId
 *         - status
 *         - orderDate
 *         - items
 *         - total
 *       properties:
 *         orderId:
 *           type: integer
 *           description: The unique identifier for the created order
 *         status:
 *           type: string
 *           description: The status of the order
 *         orderDate:
 *           type: string
 *           format: date-time
 *           description: ISO date-time when the order was created
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CheckoutResponseItem'
 *         total:
 *           type: number
 *           format: float
 *           description: Total order value (sum of unitPrice * quantity for all items)
 */

export interface CheckoutItem {
  productId: number;
  quantity: number;
}

export interface CheckoutRequest {
  branchId: number;
  items: CheckoutItem[];
}

export interface CheckoutResponseItem {
  orderDetailId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface CheckoutResponse {
  orderId: number;
  status: string;
  orderDate: string;
  items: CheckoutResponseItem[];
  total: number;
}
