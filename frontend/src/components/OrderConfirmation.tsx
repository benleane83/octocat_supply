import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { api } from '../api/config';

interface OrderDetail {
  orderDetailId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

interface Order {
  orderId: number;
  branchId: number;
  orderDate: string;
  name: string;
  description?: string;
  status: string;
}

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const { darkMode } = useTheme();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        setIsLoading(true);
        const response = await axios.get(`${api.baseURL}${api.endpoints.orders}/${orderId}`);
        setOrder(response.data);

        // Fetch order details
        const detailsResponse = await axios.get(
          `${api.baseURL}${api.endpoints.orderDetails}?orderId=${orderId}`,
        );
        setOrderDetails(detailsResponse.data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}
      >
        <div className="max-w-4xl mx-auto">
          <div
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 text-center shadow-md transition-colors duration-300`}
          >
            <div className="text-red-500 text-xl mb-4">
              {error || 'Order not found'}
            </div>
            <Link
              to="/products"
              className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg inline-block transition-colors"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = orderDetails.reduce(
    (sum, detail) => sum + detail.quantity * detail.unitPrice,
    0,
  );

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 shadow-md mb-6 text-center transition-colors duration-300`}
        >
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h1
            className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-2 transition-colors duration-300`}
          >
            Order Confirmed!
          </h1>
          <p
            className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}
          >
            Thank you for your order. Your order has been successfully placed.
          </p>
        </div>

        {/* Order Details */}
        <div
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-md mb-6 transition-colors duration-300`}
        >
          <h2
            className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} mb-4 transition-colors duration-300`}
          >
            Order Details
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span
                className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}
              >
                Order ID:
              </span>
              <div
                className={`text-lg font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
              >
                #{order.orderId}
              </div>
            </div>

            <div>
              <span
                className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}
              >
                Order Date:
              </span>
              <div
                className={`text-lg font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
              >
                {new Date(order.orderDate).toLocaleDateString()}
              </div>
            </div>

            <div>
              <span
                className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}
              >
                Order Name:
              </span>
              <div
                className={`text-lg font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
              >
                {order.name}
              </div>
            </div>

            <div>
              <span
                className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}
              >
                Status:
              </span>
              <div className="text-lg">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {order.description && (
            <div className="mt-4">
              <span
                className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}
              >
                Description:
              </span>
              <div
                className={`text-base ${darkMode ? 'text-light' : 'text-gray-800'} mt-1 transition-colors duration-300`}
              >
                {order.description}
              </div>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-md mb-6 transition-colors duration-300`}
        >
          <h2
            className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} mb-4 transition-colors duration-300`}
          >
            Order Items
          </h2>

          <div className="space-y-3">
            {orderDetails.map((detail) => (
              <div
                key={detail.orderDetailId}
                className={`flex justify-between items-center pb-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-300`}
              >
                <div>
                  <div
                    className={`font-medium ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
                  >
                    Product ID: {detail.productId}
                  </div>
                  <div
                    className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}
                  >
                    Quantity: {detail.quantity} × ${detail.unitPrice.toFixed(2)}
                  </div>
                </div>
                <div
                  className={`font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
                >
                  ${(detail.quantity * detail.unitPrice).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 mt-4 border-t-2 border-primary">
            <span
              className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
            >
              Total:
            </span>
            <span className="text-2xl font-bold text-primary">${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            to="/products"
            className={`flex-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-light' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} px-6 py-3 rounded-lg text-center font-medium transition-colors duration-300`}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
