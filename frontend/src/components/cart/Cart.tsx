import { Link } from 'react-router-dom';
import { useCartContext } from '../../context/CartContext';
import { useRemoveCartItem, useUpdateCartItem } from '../../api/cartService';
import { useTheme } from '../../context/ThemeContext';
import { useQuery } from 'react-query';
import axios from 'axios';
import { api } from '../../api/config';

interface Product {
  productId: number;
  name: string;
  description: string;
  imgName: string;
}

const fetchProduct = async (id: number): Promise<Product> => {
  const { data } = await axios.get(`${api.baseURL}${api.endpoints.products}/${id}`);
  return data;
};

export default function Cart() {
  const { cart, isLoading } = useCartContext();
  const { darkMode } = useTheme();
  const removeItemMutation = useRemoveCartItem();
  const updateItemMutation = useUpdateCartItem();

  const handleUpdateQuantity = (cartItemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId);
    } else {
      updateItemMutation.mutate({ cartItemId, quantity: newQuantity });
    }
  };

  const handleRemoveItem = (cartItemId: number) => {
    if (confirm('Are you sure you want to remove this item?')) {
      removeItemMutation.mutate(cartItemId);
    }
  };

  if (isLoading) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const total = cart?.total || 0;

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto">
        <h1
          className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-6 transition-colors duration-300`}
        >
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center text-center py-20 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-24 w-24 mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className={`${darkMode ? 'text-light' : 'text-gray-800'} text-lg font-medium mb-4`}>
              Your cart is empty
            </p>
            <Link
              to="/products"
              className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <CartItemRow
                  key={item.cartItemId}
                  item={item}
                  darkMode={darkMode}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>

            {/* Cart Summary */}
            <div
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg h-fit sticky top-24`}
            >
              <h2
                className={`text-xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-4`}
              >
                Order Summary
              </h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Items ({items.reduce((sum, item) => sum + item.quantity, 0)})
                  </span>
                  <span className={`${darkMode ? 'text-light' : 'text-gray-800'}`}>
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
              <div
                className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-4 mb-6`}
              >
                <div className="flex justify-between text-lg font-bold">
                  <span className={`${darkMode ? 'text-light' : 'text-gray-800'}`}>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
              <Link
                to="/checkout"
                className="block w-full bg-primary hover:bg-accent text-white text-center py-3 rounded-lg font-medium transition-colors"
              >
                Proceed to Checkout
              </Link>
              <Link
                to="/products"
                className={`block w-full text-center mt-4 ${darkMode ? 'text-gray-300 hover:text-light' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface CartItemRowProps {
  item: {
    cartItemId: number;
    productId: number;
    quantity: number;
    unitPrice: number;
  };
  darkMode: boolean;
  onUpdateQuantity: (cartItemId: number, quantity: number) => void;
  onRemove: (cartItemId: number) => void;
}

function CartItemRow({ item, darkMode, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const { data: product, isLoading } = useQuery(['product', item.productId], () =>
    fetchProduct(item.productId),
  );

  if (isLoading || !product) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow-md`}>
        <div className="animate-pulse flex space-x-4">
          <div className="rounded bg-gray-300 h-24 w-24"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow-md`}>
      <div className="flex items-center space-x-4">
        <img
          src={`/${product.imgName}`}
          alt={product.name}
          className="w-24 h-24 object-contain rounded"
        />
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
            {product.name}
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            ${item.unitPrice.toFixed(2)} each
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div
            className={`flex items-center space-x-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg p-1`}
          >
            <button
              onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
              className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors`}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className={`${darkMode ? 'text-light' : 'text-gray-800'} min-w-[2rem] text-center`}>
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
              className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors`}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <div className="text-right">
            <p className={`text-lg font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
              ${(item.unitPrice * item.quantity).toFixed(2)}
            </p>
          </div>
          <button
            onClick={() => onRemove(item.cartItemId)}
            className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'} transition-colors`}
            aria-label="Remove item"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
