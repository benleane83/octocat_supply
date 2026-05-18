import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from 'react-query';
import { api } from '../api/config';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

interface Branch {
  branchId: number;
  name: string;
}

interface CheckoutResponse {
  orderId: number;
  status: string;
  orderDate: string;
  total: number;
}

const fetchBranches = async (): Promise<Branch[]> => {
  const { data } = await axios.get(`${api.baseURL}${api.endpoints.branches}`);
  return data;
};

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCart();
  const { darkMode } = useTheme();
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [orderConfirmation, setOrderConfirmation] = useState<CheckoutResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: branches, isLoading: branchesLoading } = useQuery('branches', fetchBranches);

  const handleCheckout = async () => {
    if (!selectedBranchId) {
      setCheckoutError('Please select a branch before checking out.');
      return;
    }
    if (items.length === 0) {
      setCheckoutError('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);
    setCheckoutError(null);

    try {
      const { data } = await axios.post<CheckoutResponse>(
        `${api.baseURL}${api.endpoints.checkout}`,
        {
          branchId: parseInt(selectedBranchId, 10),
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      );
      clearCart();
      setOrderConfirmation(data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error?.message) {
        setCheckoutError(err.response.data.error.message);
      } else {
        setCheckoutError('Checkout failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderConfirmation) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
      >
        <div className="max-w-2xl mx-auto">
          <div
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 shadow-lg text-center`}
          >
            <svg
              className="mx-auto h-16 w-16 text-green-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2
              className={`text-2xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-2`}
            >
              Order Placed!
            </h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
              Your order has been successfully placed.
            </p>
            <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} font-semibold mb-1`}>
              Order ID: <span className="text-primary">#{orderConfirmation.orderId}</span>
            </p>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
              Status: {orderConfirmation.status}
            </p>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              Total: <span className="font-bold text-primary">${orderConfirmation.total.toFixed(2)}</span>
            </p>
            <Link
              to="/products"
              className="bg-primary hover:bg-accent text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
      >
        <div className="max-w-2xl mx-auto text-center py-20">
          <svg
            className={`mx-auto h-16 w-16 mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
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
          <h2
            className={`text-2xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-4`}
          >
            Your cart is empty
          </h2>
          <Link
            to="/products"
            className="bg-primary hover:bg-accent text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1
            className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}
          >
            Your Cart
          </h1>
          <button
            onClick={clearCart}
            className={`text-sm ${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'} transition-colors`}
          >
            Clear cart
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {items.map((item) => {
            const unitPrice = item.discount ? item.price * (1 - item.discount) : item.price;
            const lineTotal = unitPrice * item.quantity;
            return (
              <div
                key={item.productId}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow flex items-center gap-4`}
              >
                {item.imgName && (
                  <img
                    src={`/${item.imgName}`}
                    alt={item.name}
                    className="w-16 h-16 object-contain rounded flex-shrink-0"
                  />
                )}
                <div className="flex-grow min-w-0">
                  <h3
                    className={`font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} truncate`}
                  >
                    {item.name}
                  </h3>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    SKU: {item.sku} · {item.unit}
                  </p>
                  <p className="text-primary text-sm font-medium">${unitPrice.toFixed(2)} each</p>
                </div>
                <div
                  className={`flex items-center space-x-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-1`}
                >
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className={`w-7 h-7 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors`}
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    <span aria-hidden="true">-</span>
                  </button>
                  <span
                    className={`${darkMode ? 'text-light' : 'text-gray-800'} min-w-[2rem] text-center text-sm`}
                  >
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className={`w-7 h-7 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors`}
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    <span aria-hidden="true">+</span>
                  </button>
                </div>
                <p
                  className={`font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} w-20 text-right`}
                >
                  ${lineTotal.toFixed(2)}
                </p>
                <button
                  onClick={() => removeItem(item.productId)}
                  className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500'} transition-colors flex-shrink-0`}
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        <div
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow space-y-4`}
        >
          <div className="flex justify-between items-center">
            <span className={`text-lg font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
              Subtotal
            </span>
            <span className="text-xl font-bold text-primary">${subtotal.toFixed(2)}</span>
          </div>

          <div>
            <label
              htmlFor="branch-select"
              className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}
            >
              Select Branch <span className="text-red-500">*</span>
            </label>
            <select
              id="branch-select"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 text-light border-gray-600' : 'bg-white text-gray-800 border-gray-300'} focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none`}
              disabled={branchesLoading}
            >
              <option value="">-- Select a branch --</option>
              {branches?.map((branch) => (
                <option key={branch.branchId} value={branch.branchId}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          {checkoutError && (
            <p className="text-red-500 text-sm" role="alert">
              {checkoutError}
            </p>
          )}

          <button
            onClick={handleCheckout}
            disabled={isSubmitting || !selectedBranchId}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              isSubmitting || !selectedBranchId
                ? `${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
                : 'bg-primary hover:bg-accent text-white'
            }`}
          >
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
