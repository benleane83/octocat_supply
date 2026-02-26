import React, { createContext, useContext, ReactNode } from 'react';
import { useCart, CartResponse } from '../api/cartService';

interface CartContextType {
  cart: CartResponse | undefined;
  isLoading: boolean;
  error: unknown;
  cartItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: cart, isLoading, error } = useCart();

  const cartItemCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, isLoading, error, cartItemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};
