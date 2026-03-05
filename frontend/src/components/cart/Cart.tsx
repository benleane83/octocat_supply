import { useState } from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/config';

interface Branch {
  branchId: number;
  name: string;
  description: string;
  address: string;
}

const fetchBranches = async (): Promise<Branch[]> => {
  const { data } = await axios.get(`${api.baseURL}${api.endpoints.branches}`);
  return data;
};

export default function Cart() {
  const { items, cartCount, updateQuantity, removeItem, clearCart } = useCart();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { data: branches, isLoading: branchesLoading } = useQuery('branches', fetchBranches);

  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [orderName, setOrderName] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return `Order - ${today}`;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const handleQuantityChange = (productId: number, delta: number) => {
    const item = items.find((i) => i.productId === productId);
    if (item) {
      updateQuantity(productId, item.quantity + delta);
    }
  };

  const handlePlaceOrder = async () => {
    setError(null);

    // Validate
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (!selectedBranchId) {
      setError('Please select a branch');
      return;
    }

    if (!orderName.trim()) {
      setError('Please enter an order name');
      return;
    }

    setIsSubmitting(true);

    try {
      const checkoutData = {
        branchId: selectedBranchId,
        name: orderName.trim(),
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      await axios.post(`${api.baseURL}${api.endpoints.checkout}`, checkoutData);
      setSuccess(true);
      clearCart();
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
      >
        <div className="max-w-4xl mx-auto">
          <div
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8 text-center`}
          >
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-4`}>
              Order Placed Successfully!
            </h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              Your order has been submitted and is being processed.
            </p>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Redirecting to home...
            </p>
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
        <div className="max-w-4xl mx-auto">
          <div
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8 text-center`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-24 w-24 mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-4`}>
              Your cart is empty
            </h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              Add some products to get started!
            </p>
            <Link
              to="/products"
              className="inline-block bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
    >
      <div className="max-w-4xl mx-auto">
        <h1
          className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-6 transition-colors duration-300`}
        >
          Shopping Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Cart Items */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2
              className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} mb-4`}
            >
              Items
            </h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className={`flex items-center justify-between py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} last:border-b-0`}
                >
                  <div className="flex-grow">
                    <h3 className={`font-semibold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
                      {item.name}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      ${item.unitPrice.toFixed(2)} each
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div
                      className={`flex items-center space-x-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg p-1`}
                    >
                      <button
                        onClick={() => handleQuantityChange(item.productId, -1)}
                        className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors`}
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        -
                      </button>
                      <span
                        className={`${darkMode ? 'text-light' : 'text-gray-800'} min-w-[2rem] text-center`}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, 1)}
                        className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors`}
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </button>
                    </div>

                    <div className="w-24 text-right">
                      <span className={`font-semibold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <span className={`text-xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
                  Total:
                </span>
                <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2
              className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} mb-4`}
            >
              Checkout
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="orderName"
                  className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}
                >
                  Order Name
                </label>
                <input
                  id="orderName"
                  type="text"
                  value={orderName}
                  onChange={(e) => setOrderName(e.target.value)}
                  className={`w-full px-4 py-2 ${darkMode ? 'bg-gray-700 text-light border-gray-600' : 'bg-white text-gray-800 border-gray-300'} rounded-lg border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors`}
                  placeholder="Order - 2026-02-19"
                />
              </div>

              <div>
                <label
                  htmlFor="branch"
                  className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}
                >
                  Select Branch
                </label>
                {branchesLoading ? (
                  <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Loading branches...
                  </div>
                ) : (
                  <select
                    id="branch"
                    value={selectedBranchId || ''}
                    onChange={(e) => setSelectedBranchId(Number(e.target.value))}
                    className={`w-full px-4 py-2 ${darkMode ? 'bg-gray-700 text-light border-gray-600' : 'bg-white text-gray-800 border-gray-300'} rounded-lg border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors`}
                  >
                    <option value="">Choose a branch...</option>
                    {branches?.map((branch) => (
                      <option key={branch.branchId} value={branch.branchId}>
                        {branch.name} - {branch.address}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || !selectedBranchId || !orderName.trim()}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  isSubmitting || !selectedBranchId || !orderName.trim()
                    ? `${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-500'} cursor-not-allowed`
                    : 'bg-primary hover:bg-accent text-white'
                }`}
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
