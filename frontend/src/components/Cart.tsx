import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { items, subtotal, shipping, total, removeFromCart, updateQuantity } = useCart();
  const { darkMode } = useTheme();

  if (items.length === 0) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
      >
        <div className="max-w-7xl mx-auto">
          <h1 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}>
            Shopping Cart
          </h1>
          <div
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8 text-center transition-colors duration-300`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
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
            <p className={`text-lg ${darkMode ? 'text-light' : 'text-gray-800'} mb-6 transition-colors duration-300`}>
              Your cart is empty
            </p>
            <Link
              to="/products"
              className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Continue Shopping
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
      <div className="max-w-7xl mx-auto">
        <h1 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}>
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Table */}
          <div className="lg:col-span-2">
            <div
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden transition-colors duration-300`}
            >
              <div
                className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'} p-4 transition-colors duration-300`}
              >
                <div className="grid grid-cols-12 gap-4 text-sm font-semibold">
                  <div className={`col-span-1 ${darkMode ? 'text-light' : 'text-gray-800'}`}>S. No.</div>
                  <div className={`col-span-2 ${darkMode ? 'text-light' : 'text-gray-800'}`}>Product Image</div>
                  <div className={`col-span-3 ${darkMode ? 'text-light' : 'text-gray-800'}`}>Product Name</div>
                  <div className={`col-span-2 ${darkMode ? 'text-light' : 'text-gray-800'}`}>Unit Price</div>
                  <div className={`col-span-2 ${darkMode ? 'text-light' : 'text-gray-800'}`}>Quantity</div>
                  <div className={`col-span-1 ${darkMode ? 'text-light' : 'text-gray-800'}`}>Total</div>
                  <div className={`col-span-1 ${darkMode ? 'text-light' : 'text-gray-800'}`}>Remove</div>
                </div>
              </div>

              {/* Cart Items */}
              {items.map((item, index) => (
                <div
                  key={item.productId}
                  className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4 transition-colors duration-300 ${index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className={`col-span-1 font-semibold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
                      {index + 1}
                    </div>
                    <div className="col-span-2">
                      <img
                        src={`/${item.imgName}`}
                        alt={item.name}
                        className="h-16 w-16 object-contain rounded"
                      />
                    </div>
                    <div className={`col-span-3 ${darkMode ? 'text-light' : 'text-gray-800'}`}>
                      {item.name}
                    </div>
                    <div className={`col-span-2 font-semibold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
                      ${item.price.toFixed(2)}
                    </div>
                    <div className="col-span-2">
                      <div
                        className={`flex items-center space-x-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-fit transition-colors duration-300`}
                      >
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light hover:text-primary' : 'text-gray-700 hover:text-primary'} transition-colors duration-300`}
                        >
                          -
                        </button>
                        <span className={`min-w-[2rem] text-center ${darkMode ? 'text-light' : 'text-gray-800'}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light hover:text-primary' : 'text-gray-700 hover:text-primary'} transition-colors duration-300`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className={`col-span-1 font-semibold text-primary`}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <div className="col-span-1">
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className={`text-red-500 hover:text-red-700 transition-colors duration-300 text-lg`}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Update Cart Button */}
            <div className="mt-6 flex justify-end">
              <button className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Update Cart
              </button>
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
              <Link
                to="/checkout"
                className="w-full mt-8 bg-primary hover:bg-accent text-white font-bold py-3 px-6 rounded-lg transition-colors text-center block"
              >
                Proceed To Checkout
              </Link>

              {/* Continue Shopping Link */}
              <Link
                to="/products"
                className={`w-full mt-3 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-light' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} font-medium py-3 px-6 rounded-lg transition-colors text-center block`}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
