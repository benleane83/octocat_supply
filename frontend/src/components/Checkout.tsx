import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../api/config';

export default function Checkout() {
  const { items, clearCart, total } = useCart();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [orderName, setOrderName] = useState('');
  const [orderDescription, setOrderDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  // Redirect if cart is empty (but not if order was just placed)
  if (items.length === 0 && !isOrderPlaced) {
    navigate('/products');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderData = {
        branchId: 1, // Hardcoded default branch ID as per requirements
        name: orderName,
        description: orderDescription || undefined,
        orderDate: new Date().toISOString(),
        status: 'pending',
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.product.discount
            ? item.product.price * (1 - item.product.discount)
            : item.product.price,
        })),
      };

      // Submit order to API
      const response = await axios.post(`${api.baseURL}${api.endpoints.orders}`, orderData);

      // Mark order as placed to prevent redirect
      setIsOrderPlaced(true);

      // Clear cart on success
      clearCart();

      // Navigate to order confirmation
      navigate(`/order/${response.data.orderId}`);
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
    >
      <div className="max-w-4xl mx-auto">
        <h1
          className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-8 transition-colors duration-300`}
        >
          Checkout
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Form */}
          <div
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-md h-fit transition-colors duration-300`}
          >
            <h2
              className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} mb-4 transition-colors duration-300`}
            >
              Order Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="orderName"
                  className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors duration-300`}
                >
                  Order Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="orderName"
                  value={orderName}
                  onChange={(e) => setOrderName(e.target.value)}
                  required
                  className={`w-full px-4 py-2 ${darkMode ? 'bg-gray-700 text-light border-gray-600' : 'bg-white text-gray-800 border-gray-300'} rounded-lg border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors duration-300`}
                  placeholder="e.g., Monthly Office Supplies"
                />
              </div>

              <div>
                <label
                  htmlFor="orderDescription"
                  className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors duration-300`}
                >
                  Order Description (optional)
                </label>
                <textarea
                  id="orderDescription"
                  value={orderDescription}
                  onChange={(e) => setOrderDescription(e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-2 ${darkMode ? 'bg-gray-700 text-light border-gray-600' : 'bg-white text-gray-800 border-gray-300'} rounded-lg border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors duration-300`}
                  placeholder="Add any additional notes about this order..."
                />
              </div>

              <div
                className={`p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg transition-colors duration-300`}
              >
                <div className="text-sm">
                  <span
                    className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}
                  >
                    Branch:
                  </span>
                  <span
                    className={`ml-2 ${darkMode ? 'text-light' : 'text-gray-800'} font-medium transition-colors duration-300`}
                  >
                    Default Branch (ID: 1)
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                    : 'bg-primary hover:bg-accent text-white'
                }`}
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-md h-fit transition-colors duration-300`}
          >
            <h2
              className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} mb-4 transition-colors duration-300`}
            >
              Order Summary
            </h2>

            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className={`flex justify-between items-center pb-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-300`}
                >
                  <div className="flex-grow">
                    <div
                      className={`font-medium ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
                    >
                      {item.product.name}
                    </div>
                    <div
                      className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}
                    >
                      Quantity: {item.quantity} × $
                      {(item.product.discount
                        ? item.product.price * (1 - item.product.discount)
                        : item.product.price
                      ).toFixed(2)}
                    </div>
                  </div>
                  <div
                    className={`font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
                  >
                    $
                    {(
                      (item.product.discount
                        ? item.product.price * (1 - item.product.discount)
                        : item.product.price) * item.quantity
                    ).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t-2 border-primary">
              <span
                className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
              >
                Total:
              </span>
              <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
            </div>

            <div
              className={`mt-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}
            >
              <p>• No taxes or discounts applied</p>
              <p>• Final amount to be paid: ${total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
