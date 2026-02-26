import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartContext } from '../../context/CartContext';
import { useCheckout } from '../../api/cartService';
import { useTheme } from '../../context/ThemeContext';
import { useQuery } from 'react-query';
import axios from 'axios';
import { api } from '../../api/config';

interface Branch {
  branchId: number;
  name: string;
  description: string;
}

const fetchBranches = async (): Promise<Branch[]> => {
  const { data } = await axios.get(`${api.baseURL}${api.endpoints.branches}`);
  return data;
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cart } = useCartContext();
  const { darkMode } = useTheme();
  const checkoutMutation = useCheckout();
  const { data: branches, isLoading: branchesLoading } = useQuery('branches', fetchBranches);

  const [selectedBranch, setSelectedBranch] = useState('');
  const [orderName, setOrderName] = useState('');
  const [orderDescription, setOrderDescription] = useState('');

  const items = cart?.items || [];
  const total = cart?.total || 0;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBranch) {
      alert('Please select a branch');
      return;
    }

    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    checkoutMutation.mutate(
      {
        branchId: parseInt(selectedBranch),
        orderName: orderName || 'Order from Cart',
        orderDescription: orderDescription || '',
      },
      {
        onSuccess: (order) => {
          alert(`Order #${order.orderId} placed successfully!`);
          navigate('/products');
        },
        onError: (error) => {
          console.error('Checkout failed:', error);
          alert('Failed to place order. Please try again.');
        },
      },
    );
  };

  if (items.length === 0) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}
      >
        <div className="max-w-7xl mx-auto">
          <div
            className={`flex flex-col items-center justify-center text-center py-20 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <p className={`${darkMode ? 'text-light' : 'text-gray-800'} text-lg font-medium mb-4`}>
              Your cart is empty. Please add items before checking out.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg transition-colors"
            >
              Go to Products
            </button>
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
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleCheckout}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
            >
              <h2
                className={`text-xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-4`}
              >
                Order Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="branch"
                    className={`block mb-2 ${darkMode ? 'text-light' : 'text-gray-700'}`}
                  >
                    Select Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="branch"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 text-light border-gray-600' : 'bg-white text-gray-800 border-gray-300'} focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none`}
                    required
                  >
                    <option value="">Choose a branch...</option>
                    {branchesLoading ? (
                      <option disabled>Loading branches...</option>
                    ) : (
                      branches?.map((branch) => (
                        <option key={branch.branchId} value={branch.branchId}>
                          {branch.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="orderName"
                    className={`block mb-2 ${darkMode ? 'text-light' : 'text-gray-700'}`}
                  >
                    Order Name (optional)
                  </label>
                  <input
                    type="text"
                    id="orderName"
                    value={orderName}
                    onChange={(e) => setOrderName(e.target.value)}
                    placeholder="e.g., Office Supplies Q1"
                    className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 text-light border-gray-600' : 'bg-white text-gray-800 border-gray-300'} focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="orderDescription"
                    className={`block mb-2 ${darkMode ? 'text-light' : 'text-gray-700'}`}
                  >
                    Order Description (optional)
                  </label>
                  <textarea
                    id="orderDescription"
                    value={orderDescription}
                    onChange={(e) => setOrderDescription(e.target.value)}
                    placeholder="Add any notes or special instructions..."
                    rows={4}
                    className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 text-light border-gray-600' : 'bg-white text-gray-800 border-gray-300'} focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={checkoutMutation.isLoading}
                  className="w-full bg-primary hover:bg-accent text-white py-3 rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {checkoutMutation.isLoading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
