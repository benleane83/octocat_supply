import { createContext, useContext, useState, ReactNode } from 'react';

// Product interface matching API response
interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  imgName: string;
  sku: string;
  unit: string;
  supplierId: number;
  discount?: number;
}

// Cart item interface extending product with quantity
export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: (item: CartItem) => number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, quantity: number) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product.productId);
      
      if (existingItem) {
        // Update quantity of existing item
        return prevItems.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item to cart
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const removeItem = (productId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const getSubtotal = (item: CartItem): number => {
    const discount = item.discount || 0;
    const discountedPrice = item.price * (1 - discount);
    return discountedPrice * item.quantity;
  };

  const getTotal = (): number => {
    return items.reduce((total, item) => total + getSubtotal(item), 0);
  };

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
