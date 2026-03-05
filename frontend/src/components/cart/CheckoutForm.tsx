import { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import axios from 'axios';
import { api } from '../../api/config';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

interface Branch {
  branchId: number;
  name: string;
}

export default function CheckoutForm() {
  const { darkMode } = useTheme();
  const { items, clearCart } = useCart();
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Fetch branches
  const { data: branches, isLoading: loadingBranches } = useQuery<Branch[]>('branches', async () => {
    const { data } = await axios.get(`${api.baseURL}${api.endpoints.branches}`);
    return data;
  });

  // Checkout mutation
  const checkoutMutation = useMutation(
    async () => {
      if (!selectedBranch) {
        throw new Error('Please select a branch');
      }

      const checkoutData = {
        branchId: selectedBranch,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const { data } = await axios.post(`${api.baseURL}/api/orders/checkout`, checkoutData);
      return data;
    },
    {
      onSuccess: () => {
        setCheckoutSuccess(true);
        clearCart();
        setTimeout(() => {
          setCheckoutSuccess(false);
          setSelectedBranch(null);
        }, 3000);
      },
    },
  );

  const handleCheckout = async () => {
    checkoutMutation.mutate();
  };

  if (items.length === 0) {
    return null;
  }

  if (checkoutSuccess) {
    return (
      <div
        className={`${darkMode ? 'bg-green-800' : 'bg-green-100'} rounded-lg p-6 shadow-lg transition-colors duration-300`}
      >
        <div className="flex items-center gap-3">
          <svg
            className={`h-8 w-8 ${darkMode ? 'text-green-200' : 'text-green-600'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3
              className={`text-xl font-bold ${darkMode ? 'text-green-200' : 'text-green-800'} transition-colors duration-300`}
            >
              Order Placed Successfully!
            </h3>
            <p
              className={`${darkMode ? 'text-green-300' : 'text-green-700'} transition-colors duration-300`}
            >
              Your order has been created and is being processed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg transition-colors duration-300`}
    >
      <h2
        className={`text-2xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-4 transition-colors duration-300`}
      >
        Checkout
      </h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="branch-select"
            className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors duration-300`}
          >
            Select Branch
          </label>
          {loadingBranches ? (
            <div
              className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}
            >
              Loading branches...
            </div>
          ) : (
            <select
              id="branch-select"
              value={selectedBranch || ''}
              onChange={(e) => setSelectedBranch(Number(e.target.value))}
              className={`w-full px-4 py-2 ${darkMode ? 'bg-gray-700 text-light border-gray-600' : 'bg-white text-gray-800 border-gray-300'} rounded-lg border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors duration-300`}
            >
              <option value="">Choose a branch...</option>
              {branches?.map((branch) => (
                <option key={branch.branchId} value={branch.branchId}>
                  {branch.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={handleCheckout}
          disabled={!selectedBranch || checkoutMutation.isLoading}
          className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
            !selectedBranch || checkoutMutation.isLoading
              ? `${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-500'} cursor-not-allowed`
              : 'bg-primary hover:bg-accent text-white'
          }`}
        >
          {checkoutMutation.isLoading ? 'Processing...' : 'Place Order'}
        </button>

        {checkoutMutation.isError && (
          <div
            className={`${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'} rounded-lg p-3 transition-colors duration-300`}
          >
            <p className="text-sm">
              {(checkoutMutation.error as Error).message || 'An error occurred during checkout'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
