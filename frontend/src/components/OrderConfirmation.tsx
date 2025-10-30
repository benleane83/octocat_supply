import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const order = location.state?.order;

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-primary"
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
          </div>
          <h1
            className={`text-3xl font-bold mb-2 ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
          >
            Order Confirmed!
          </h1>
          <p
            className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-lg transition-colors duration-300`}
          >
            Thank you for your purchase
          </p>
        </div>

        <div
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8 mb-6 transition-colors duration-300`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                Order Number
              </p>
              <p
                className={`text-lg font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}
              >
                #{orderId}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                Order Date
              </p>
              <p
                className={`text-lg font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}
              >
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {order && (
            <>
              <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-6`}>
                <h2
                  className={`text-lg font-bold mb-4 ${darkMode ? 'text-light' : 'text-gray-800'}`}
                >
                  Order Details
                </h2>
                <div className="space-y-3">
                  {order.orderDetails?.map((item: any, index: number) => (
                    <div
                      key={index}
                      className={`flex justify-between items-center py-2 border-b ${darkMode ? 'border-gray-700 text-light' : 'border-gray-200 text-gray-800'}`}
                    >
                      <div>
                        <p className="font-medium">Product {item.productId}</p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} × ${item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold text-primary">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} mt-6 pt-6`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`${darkMode ? 'text-light' : 'text-gray-800'}`}>
                    Subtotal
                  </span>
                  <span className={`${darkMode ? 'text-light' : 'text-gray-800'}`}>
                    ${order.subtotal?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className={`${darkMode ? 'text-light' : 'text-gray-800'}`}>
                    Shipping
                  </span>
                  <span className={`${darkMode ? 'text-light' : 'text-gray-800'}`}>
                    ${order.shipping?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-lg font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
                    Total
                  </span>
                  <span className="text-lg font-bold text-primary">
                    ${order.total?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/products')}
            className="flex-1 bg-primary hover:bg-accent text-white font-bold py-3 px-6 rounded-lg transition-colors text-center"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate('/')}
            className={`flex-1 ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-light' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} font-bold py-3 px-6 rounded-lg transition-colors`}
          >
            Back to Home
          </button>
        </div>

        <p
          className={`text-center mt-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}
        >
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
}
