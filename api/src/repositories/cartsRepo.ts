/**
 * Repository for carts data access
 */

import { getDatabase, DatabaseConnection } from '../db/sqlite';
import { Cart } from '../models/cart';
import { CartItem } from '../models/cartItem';
import { handleDatabaseError, NotFoundError } from '../utils/errors';
import {
  buildInsertSQL,
  buildUpdateSQL,
  objectToCamelCase,
  mapDatabaseRows,
  DatabaseRow,
} from '../utils/sql';

export class CartsRepository {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  /**
   * Get or create cart for a session
   */
  async getOrCreateCart(sessionId: string, userId?: number): Promise<Cart> {
    try {
      // Try to find existing cart
      let cart = await this.findBySessionId(sessionId);

      if (!cart) {
        // Create new cart
        const cartData: Omit<Cart, 'cartId'> = {
          sessionId,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const { sql, values } = buildInsertSQL('carts', cartData);
        const result = await this.db.run(sql, values);
        cart = await this.findById(result.lastID || 0);
        if (!cart) {
          throw new Error('Failed to create cart');
        }
      }

      return cart;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Find cart by session ID
   */
  async findBySessionId(sessionId: string): Promise<Cart | null> {
    try {
      const row = await this.db.get<DatabaseRow>('SELECT * FROM carts WHERE session_id = ?', [
        sessionId,
      ]);
      return row ? objectToCamelCase<Cart>(row) : null;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Find cart by ID
   */
  async findById(id: number): Promise<Cart | null> {
    try {
      const row = await this.db.get<DatabaseRow>('SELECT * FROM carts WHERE cart_id = ?', [id]);
      return row ? objectToCamelCase<Cart>(row) : null;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Get all items in a cart
   */
  async getCartItems(cartId: number): Promise<CartItem[]> {
    try {
      const rows = await this.db.all<DatabaseRow>(
        'SELECT * FROM cart_items WHERE cart_id = ? ORDER BY cart_item_id',
        [cartId],
      );
      return mapDatabaseRows<CartItem>(rows);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Add item to cart or update quantity if it already exists
   */
  async addItem(cartId: number, productId: number, quantity: number, unitPrice: number): Promise<CartItem> {
    try {
      // Check if item already exists
      const existingItem = await this.db.get<DatabaseRow>(
        'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
        [cartId, productId],
      );

      if (existingItem) {
        // Update existing item quantity
        const newQuantity = (existingItem.quantity as number) + quantity;
        return await this.updateItemQuantity(existingItem.cart_item_id as number, newQuantity);
      } else {
        // Insert new item
        const cartItem: Omit<CartItem, 'cartItemId'> = {
          cartId,
          productId,
          quantity,
          unitPrice,
        };
        const { sql, values } = buildInsertSQL('cart_items', cartItem);
        const result = await this.db.run(sql, values);

        const createdItem = await this.findCartItemById(result.lastID || 0);
        if (!createdItem) {
          throw new Error('Failed to create cart item');
        }

        // Update cart's updated_at timestamp
        await this.updateCartTimestamp(cartId);

        return createdItem;
      }
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Update cart item quantity
   */
  async updateItemQuantity(cartItemId: number, quantity: number): Promise<CartItem> {
    try {
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }

      const result = await this.db.run(
        'UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?',
        [quantity, cartItemId],
      );

      if (result.changes === 0) {
        throw new NotFoundError('CartItem', cartItemId);
      }

      const updatedItem = await this.findCartItemById(cartItemId);
      if (!updatedItem) {
        throw new Error('Failed to retrieve updated cart item');
      }

      // Update cart's updated_at timestamp
      await this.updateCartTimestamp(updatedItem.cartId);

      return updatedItem;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(cartItemId: number): Promise<void> {
    try {
      // Get cart ID before deleting
      const item = await this.findCartItemById(cartItemId);
      if (!item) {
        throw new NotFoundError('CartItem', cartItemId);
      }

      const result = await this.db.run('DELETE FROM cart_items WHERE cart_item_id = ?', [
        cartItemId,
      ]);

      if (result.changes === 0) {
        throw new NotFoundError('CartItem', cartItemId);
      }

      // Update cart's updated_at timestamp
      await this.updateCartTimestamp(item.cartId);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Clear all items from cart
   */
  async clearCart(cartId: number): Promise<void> {
    try {
      await this.db.run('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
      await this.updateCartTimestamp(cartId);
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Get cart total
   */
  async getCartTotal(cartId: number): Promise<number> {
    try {
      const result = await this.db.get<{ total: number | null }>(
        'SELECT SUM(quantity * unit_price) as total FROM cart_items WHERE cart_id = ?',
        [cartId],
      );
      return result?.total || 0;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Find cart item by ID
   */
  private async findCartItemById(id: number): Promise<CartItem | null> {
    try {
      const row = await this.db.get<DatabaseRow>('SELECT * FROM cart_items WHERE cart_item_id = ?', [
        id,
      ]);
      return row ? objectToCamelCase<CartItem>(row) : null;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Update cart timestamp
   */
  private async updateCartTimestamp(cartId: number): Promise<void> {
    try {
      await this.db.run('UPDATE carts SET updated_at = ? WHERE cart_id = ?', [
        new Date().toISOString(),
        cartId,
      ]);
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

// Factory function to create repository instance
export async function createCartsRepository(isTest: boolean = false): Promise<CartsRepository> {
  const db = await getDatabase(isTest);
  return new CartsRepository(db);
}

// Singleton instance for default usage
let cartsRepo: CartsRepository | null = null;

export async function getCartsRepository(isTest: boolean = false): Promise<CartsRepository> {
  const isTestEnv = isTest || process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
  if (isTestEnv) {
    return createCartsRepository(true);
  }
  if (!cartsRepo) {
    cartsRepo = await createCartsRepository(false);
  }
  return cartsRepo;
}

