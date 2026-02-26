import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { api } from './config';

export interface CartItem {
  cartItemId: number;
  cartId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface Cart {
  cartId: number;
  sessionId: string;
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartResponse {
  cart: Cart;
  items: CartItem[];
  total: number;
}

// Axios configuration to include credentials for session
const axiosConfig = {
  withCredentials: true,
};

// Fetch cart
const fetchCart = async (): Promise<CartResponse> => {
  const { data } = await axios.get(`${api.baseURL}${api.endpoints.carts}`, axiosConfig);
  return data;
};

// Add item to cart
const addItemToCart = async (item: {
  productId: number;
  quantity: number;
  unitPrice: number;
}): Promise<CartItem> => {
  const { data } = await axios.post(
    `${api.baseURL}${api.endpoints.carts}/items`,
    item,
    axiosConfig,
  );
  return data;
};

// Update cart item quantity
const updateCartItemQuantity = async ({
  cartItemId,
  quantity,
}: {
  cartItemId: number;
  quantity: number;
}): Promise<CartItem> => {
  const { data } = await axios.put(
    `${api.baseURL}${api.endpoints.carts}/items/${cartItemId}`,
    { quantity },
    axiosConfig,
  );
  return data;
};

// Remove item from cart
const removeCartItem = async (cartItemId: number): Promise<void> => {
  await axios.delete(`${api.baseURL}${api.endpoints.carts}/items/${cartItemId}`, axiosConfig);
};

// Checkout
const checkout = async (checkoutData: {
  branchId: number;
  orderName?: string;
  orderDescription?: string;
}): Promise<any> => {
  const { data } = await axios.post(
    `${api.baseURL}${api.endpoints.carts}/checkout`,
    checkoutData,
    axiosConfig,
  );
  return data;
};

// React Query hooks
export const useCart = () => {
  return useQuery<CartResponse>('cart', fetchCart, {
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation(addItemToCart, {
    onSuccess: () => {
      queryClient.invalidateQueries('cart');
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation(updateCartItemQuantity, {
    onSuccess: () => {
      queryClient.invalidateQueries('cart');
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation(removeCartItem, {
    onSuccess: () => {
      queryClient.invalidateQueries('cart');
    },
  });
};

export const useCheckout = () => {
  const queryClient = useQueryClient();
  return useMutation(checkout, {
    onSuccess: () => {
      queryClient.invalidateQueries('cart');
    },
  });
};
