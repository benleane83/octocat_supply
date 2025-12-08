import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

const mockProduct = {
  productId: 1,
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  imgName: 'test.jpg',
  sku: 'TEST-001',
  unit: 'pcs',
  supplierId: 1,
};

const mockProductWithDiscount = {
  ...mockProduct,
  productId: 2,
  discount: 0.2, // 20% off
};

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should start with an empty cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.getItemCount()).toBe(0);
    expect(result.current.getCartTotal()).toBe(0);
  });

  it('should add items to cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockProduct, 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product).toEqual(mockProduct);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.getItemCount()).toBe(2);
  });

  it('should update quantity when adding the same product', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockProduct, 2);
      result.current.addToCart(mockProduct, 3);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.getItemCount()).toBe(5);
  });

  it('should remove items from cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockProduct, 2);
      result.current.removeFromCart(mockProduct.productId);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.getItemCount()).toBe(0);
  });

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockProduct, 2);
      result.current.updateQuantity(mockProduct.productId, 5);
    });

    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.getItemCount()).toBe(5);
  });

  it('should remove item when updating quantity to 0 or less', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockProduct, 2);
      result.current.updateQuantity(mockProduct.productId, 0);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('should clear cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockProduct, 2);
      result.current.addToCart(mockProductWithDiscount, 3);
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.getItemCount()).toBe(0);
    expect(result.current.getCartTotal()).toBe(0);
  });

  it('should calculate cart total correctly', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockProduct, 2); // 2 * 100 = 200
    });

    expect(result.current.getCartTotal()).toBe(200);
  });

  it('should calculate cart total with discounts correctly', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockProductWithDiscount, 2); // 2 * (100 * 0.8) = 160
    });

    expect(result.current.getCartTotal()).toBe(160);
  });

  it('should persist cart to localStorage', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockProduct, 2);
    });

    const savedCart = localStorage.getItem('octocat_supply_cart');
    expect(savedCart).toBeTruthy();

    const parsedCart = JSON.parse(savedCart!);
    expect(parsedCart).toHaveLength(1);
    expect(parsedCart[0].product.productId).toBe(mockProduct.productId);
    expect(parsedCart[0].quantity).toBe(2);
  });

  it('should load cart from localStorage on initialization', () => {
    const cartData = [
      {
        product: mockProduct,
        quantity: 3,
      },
    ];

    localStorage.setItem('octocat_supply_cart', JSON.stringify(cartData));

    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.productId).toBe(mockProduct.productId);
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.getItemCount()).toBe(3);
  });

  it('should not add items with zero or negative quantity', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockProduct, 0);
      result.current.addToCart(mockProduct, -1);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('should calculate total item count correctly with multiple products', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockProduct, 2);
      result.current.addToCart(mockProductWithDiscount, 3);
    });

    expect(result.current.getItemCount()).toBe(5);
  });
});
