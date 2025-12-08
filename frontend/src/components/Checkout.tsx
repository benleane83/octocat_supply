import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../api/config';

// Default branch ID for orders (as per requirements, no branch selection UI)
const DEFAULT_BRANCH_ID = 1;

export default function Checkout() {
  const { items, clearCart, getCartTotal } = useCart();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Redirect to cart if empty
  if (items.length === 0 && !success) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Create the order
      const orderData = {
        branchId: DEFAULT_BRANCH_ID,
        orderDate: new Date().toISOString(),
        name: formData.name,
        description: formData.description,
        status: 'pending',
      };

      const orderResponse = await axios.post(`${api.baseURL}${api.endpoints.orders}`, orderData);
      const createdOrder = orderResponse.data;

      // Create order details for each cart item
      const orderDetailPromises = items.map((item) => {
        const finalPrice = item.product.discount
          ? item.product.price * (1 - item.product.discount)
          : item.product.price;

        const orderDetailData = {
          orderId: createdOrder.orderId,
          productId: item.product.productId,
          quantity: item.quantity,
          unitPrice: finalPrice,
          notes: '',
        };

        return axios.post(`${api.baseURL}${api.endpoints.orderDetails}`, orderDetailData);
      });

      await Promise.all(orderDetailPromises);

      // Success!
      setOrderId(createdOrder.orderId);
      setSuccess(true);
      clearCart();
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
      >
        <div className="max-w-2xl mx-auto">
          <div
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 shadow-md text-center transition-colors duration-300`}
          >
            <div className="mb-6">
              <svg
                className="w-20 h-20 mx-auto text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1
              className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-4 transition-colors duration-300`}
            >
              Order Placed Successfully!
            </h1>
            <p
              className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors duration-300`}
            >
              Thank you for your order!
            </p>
            {orderId && (
              <p
                className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6 transition-colors duration-300`}
              >
                Order ID: <span className="font-mono font-semibold">#{orderId}</span>
              </p>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/products')}
                className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => navigate('/')}
                className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-light' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} px-6 py-3 rounded-lg font-medium transition-colors duration-300`}
              >
                Go to Home
              </button>
            </div>
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
            <div
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-md transition-colors duration-300`}
            >
              <h2
                className={`text-xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-4 transition-colors duration-300`}
              >
                Order Information
              </h2>

              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className={`block text-sm font-medium ${darkMode ? 'text-light' : 'text-gray-700'} mb-2 transition-colors duration-300`}
                  >
                    Order Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 ${darkMode ? 'bg-gray-700 text-light border-gray-600' : 'bg-white text-gray-800 border-gray-300'} rounded-lg border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors duration-300`}
                    placeholder="Enter order name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className={`block text-sm font-medium ${darkMode ? 'text-light' : 'text-gray-700'} mb-2 transition-colors duration-300`}
                  >
                    Order Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 ${darkMode ? 'bg-gray-700 text-light border-gray-600' : 'bg-white text-gray-800 border-gray-300'} rounded-lg border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors duration-300`}
                    placeholder="Enter order description (optional)"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary hover:bg-accent text-white'
                    }`}
                  >
                    {isSubmitting ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-md transition-colors duration-300`}
            >
              <h2
                className={`text-xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-4 transition-colors duration-300`}
              >
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                {items.map((item) => {
                  const finalPrice = item.product.discount
                    ? item.product.price * (1 - item.product.discount)
                    : item.product.price;
                  const lineTotal = finalPrice * item.quantity;

                  return (
                    <div
                      key={item.product.productId}
                      className={`flex justify-between text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                          Qty: {item.quantity} × ${finalPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right font-medium">${lineTotal.toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>

              <div
                className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-300'} pt-3 mb-4`}
              />

              <div className="flex justify-between text-xl font-bold mb-6">
                <span className={darkMode ? 'text-light' : 'text-gray-800'}>Total</span>
                <span className="text-primary">${getCartTotal().toFixed(2)}</span>
              </div>

              <button
                onClick={() => navigate('/cart')}
                className={`w-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-light' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} px-6 py-3 rounded-lg font-medium transition-colors duration-300`}
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
