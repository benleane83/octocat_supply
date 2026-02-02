import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/config';
import CartItemRow from './CartItemRow';

export default function CartPage() {
  const { items, itemCount, clearCart, getTotal } = useCart();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [branchId, setBranchId] = useState<number>(1); // Default branch ID
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const total = getTotal();

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      // First validate the cart
      const validationResponse = await axios.post(`${api.baseURL}/api/cart/validate`, {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      // Then create order from cart
      const orderResponse = await axios.post(`${api.baseURL}/api/orders/from-cart`, {
        branchId: branchId,
        items: validationResponse.data.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });

      console.log('Order created:', orderResponse.data);
      setCheckoutSuccess(true);
      clearCart();

      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      console.error('Checkout error:', error);
      setCheckoutError(
        error.response?.data?.error || 'Failed to complete checkout. Please try again.'
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (checkoutSuccess) {
    return (
      <div
        className={`min-h-screen ${
          darkMode ? 'bg-dark' : 'bg-gray-100'
        } pt-20 pb-16 px-4 transition-colors duration-300`}
      >
        <div className="max-w-4xl mx-auto">
          <div
            className={`${
              darkMode ? 'bg-gray-800' : 'bg-white'
            } rounded-lg shadow-md p-8 text-center transition-colors duration-300`}
          >
            <svg
              className="w-16 h-16 text-green-500 mx-auto mb-4"
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
            <h2
              className={`text-2xl font-bold ${
                darkMode ? 'text-light' : 'text-gray-800'
              } mb-2 transition-colors duration-300`}
            >
              Order Placed Successfully!
            </h2>
            <p
              className={`${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              } transition-colors duration-300`}
            >
              Redirecting to home page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        darkMode ? 'bg-dark' : 'bg-gray-100'
      } pt-20 pb-16 px-4 transition-colors duration-300`}
    >
      <div className="max-w-6xl mx-auto">
        <h1
          className={`text-3xl font-bold ${
            darkMode ? 'text-light' : 'text-gray-800'
          } mb-6 transition-colors duration-300`}
        >
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div
            className={`${
              darkMode ? 'bg-gray-800' : 'bg-white'
            } rounded-lg shadow-md p-12 text-center transition-colors duration-300`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-16 w-16 mx-auto mb-4 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
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
            <h2
              className={`text-xl font-semibold ${
                darkMode ? 'text-light' : 'text-gray-800'
              } mb-2 transition-colors duration-300`}
            >
              Your cart is empty
            </h2>
            <p
              className={`${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              } mb-6 transition-colors duration-300`}
            >
              Add some products to get started!
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <CartItemRow key={item.productId} item={item} />
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div
                className={`${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                } rounded-lg shadow-md p-6 sticky top-24 transition-colors duration-300`}
              >
                <h2
                  className={`text-xl font-bold ${
                    darkMode ? 'text-light' : 'text-gray-800'
                  } mb-4 transition-colors duration-300`}
                >
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span
                      className={`${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      } transition-colors duration-300`}
                    >
                      Items ({itemCount})
                    </span>
                    <span
                      className={`${
                        darkMode ? 'text-light' : 'text-gray-800'
                      } font-medium transition-colors duration-300`}
                    >
                      ${total.toFixed(2)}
                    </span>
                  </div>

                  <div
                    className={`border-t ${
                      darkMode ? 'border-gray-700' : 'border-gray-200'
                    } pt-3`}
                  >
                    <div className="flex justify-between mb-4">
                      <span
                        className={`text-lg font-bold ${
                          darkMode ? 'text-light' : 'text-gray-800'
                        } transition-colors duration-300`}
                      >
                        Total
                      </span>
                      <span className="text-lg font-bold text-primary">${total.toFixed(2)}</span>
                    </div>

                    {/* Branch Selection */}
                    <div className="mb-4">
                      <label
                        htmlFor="branchId"
                        className={`block text-sm font-medium mb-2 ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        } transition-colors duration-300`}
                      >
                        Branch ID
                      </label>
                      <input
                        type="number"
                        id="branchId"
                        value={branchId}
                        onChange={(e) => setBranchId(parseInt(e.target.value))}
                        className={`w-full px-3 py-2 ${
                          darkMode
                            ? 'bg-gray-700 text-light border-gray-600'
                            : 'bg-white text-gray-800 border-gray-300'
                        } rounded-lg border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors duration-300`}
                        min="1"
                      />
                    </div>

                    {checkoutError && (
                      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {checkoutError}
                      </div>
                    )}

                    <button
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                      className={`w-full py-3 rounded-lg font-medium transition-colors ${
                        isCheckingOut
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-primary hover:bg-accent text-white'
                      }`}
                    >
                      {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
