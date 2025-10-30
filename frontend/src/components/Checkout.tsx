import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../api/config';

interface Branch {
  branchId: number;
  name: string;
  location: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const { darkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [branchesLoaded, setBranchesLoaded] = useState(false);

  // Load branches on component mount
  if (!branchesLoaded) {
    axios
      .get(`${api.baseURL}${api.endpoints.branches}`)
      .then((response) => {
        setBranches(response.data);
        if (response.data.length > 0) {
          setSelectedBranchId(response.data[0].branchId);
        }
        setBranchesLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to load branches:', err);
        setError('Failed to load branches');
        setBranchesLoaded(true);
      });
  }

  const handleCheckout = async () => {
    if (!selectedBranchId) {
      setError('Please select a branch');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create order with cart items
      const orderPayload = {
        branchId: selectedBranchId,
        orderDetails: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      };

      const response = await axios.post(`${api.baseURL}${api.endpoints.orders}`, orderPayload);

      if (response.status === 201 || response.status === 200) {
        // Clear cart and show success
        clearCart();
        
        // Redirect to success page with order ID
        navigate(`/order-confirmation/${response.data.orderId || response.data.id}`, {
          state: { order: response.data },
        });
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Failed to create order. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
      >
        <div className="max-w-7xl mx-auto">
          <h1 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}>
            Checkout
          </h1>
          <div
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8 text-center transition-colors duration-300`}
          >
            <p className={`text-lg ${darkMode ? 'text-light' : 'text-gray-800'} mb-6 transition-colors duration-300`}>
              Your cart is empty
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Continue Shopping
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
      <div className="max-w-3xl mx-auto">
        <h1 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}>
          Checkout
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-300`}
            >
              <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}>
                Delivery Details
              </h2>

              <div className="space-y-6">
                {/* Branch Selection */}
                <div>
                  <label
                    htmlFor="branch"
                    className={`block text-sm font-medium mb-2 ${darkMode ? 'text-light' : 'text-gray-800'}`}
                  >
                    Select Delivery Branch
                  </label>
                  <select
                    id="branch"
                    value={selectedBranchId || ''}
                    onChange={(e) => setSelectedBranchId(Number(e.target.value))}
                    className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 text-light border-gray-600' : 'bg-white text-gray-800 border-gray-300'} focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors`}
                  >
                    <option value="">Choose a branch</option>
                    {branches.map((branch) => (
                      <option key={branch.branchId} value={branch.branchId}>
                        {branch.name} - {branch.location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Order Summary in Form */}
                <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-6`}>
                  <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-light' : 'text-gray-800'}`}>
                    Order Items
                  </h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.productId}
                        className={`flex justify-between items-center py-2 border-b ${darkMode ? 'border-gray-700 text-light' : 'border-gray-200 text-gray-800'}`}
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-semibold text-primary">
                          ${(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 sticky top-24 transition-colors duration-300`}
            >
              <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}>
                Order Summary
              </h2>

              <div className="space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between items-center pb-4 border-b border-gray-400">
                  <span className={`${darkMode ? 'text-light' : 'text-gray-800'}`}>Subtotal</span>
                  <span className={`font-semibold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between items-center pb-4 border-b border-gray-400">
                  <span className={`${darkMode ? 'text-light' : 'text-gray-800'}`}>
                    Shipping
                    <span className="text-sm text-gray-500 ml-1">
                      {subtotal >= 100 ? '(FREE)' : '($25)'}
                    </span>
                  </span>
                  <span className={`font-semibold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
                    ${shipping.toFixed(2)}
                  </span>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-center pt-2">
                  <span className={`text-lg font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
                    Grand Total
                  </span>
                  <span className="text-lg font-bold text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isLoading || !selectedBranchId}
                className={`w-full mt-8 ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-primary hover:bg-accent'} text-white font-bold py-3 px-6 rounded-lg transition-colors`}
              >
                {isLoading ? 'Processing...' : 'Place Order'}
              </button>

              {/* Back to Cart */}
              <button
                onClick={() => navigate('/cart')}
                className={`w-full mt-3 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-light' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} font-medium py-3 px-6 rounded-lg transition-colors`}
              >
                Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
