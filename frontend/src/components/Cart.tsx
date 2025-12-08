import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const handleQuantityChange = (productId: number, change: number) => {
    const item = items.find((i) => i.product.productId === productId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity > 0) {
        updateQuantity(productId, newQuantity);
      }
    }
  };

  const getLineTotal = (price: number, discount: number | undefined, quantity: number) => {
    const finalPrice = discount ? price * (1 - discount) : price;
    return finalPrice * quantity;
  };

  if (items.length === 0) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
      >
        <div className="max-w-7xl mx-auto">
          <h1
            className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-6 transition-colors duration-300`}
          >
            Shopping Cart
          </h1>
          <div
            className={`flex flex-col items-center justify-center text-center py-20 rounded-lg ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-16 w-16 mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
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
            <p className={`${darkMode ? 'text-light' : 'text-gray-800'} text-xl font-medium mb-4`}>
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
      <div className="max-w-7xl mx-auto">
        <h1
          className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-6 transition-colors duration-300`}
        >
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const finalPrice = item.product.discount
                ? item.product.price * (1 - item.product.discount)
                : item.product.price;
              const lineTotal = getLineTotal(
                item.product.price,
                item.product.discount,
                item.quantity,
              );

              return (
                <div
                  key={item.product.productId}
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow-md transition-colors duration-300`}
                >
                  <div className="flex gap-4">
                    <img
                      src={`/${item.product.imgName}`}
                      alt={item.product.name}
                      className={`w-24 h-24 object-contain rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                    />

                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3
                            className={`text-lg font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
                          >
                            {item.product.name}
                          </h3>
                          <p
                            className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}
                          >
                            {item.product.description}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.productId)}
                          className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'} transition-colors duration-300`}
                          aria-label={`Remove ${item.product.name} from cart`}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
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

                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex items-center space-x-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg p-1 transition-colors duration-300`}
                          >
                            <button
                              onClick={() => handleQuantityChange(item.product.productId, -1)}
                              className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors duration-300`}
                              aria-label={`Decrease quantity of ${item.product.name}`}
                            >
                              <span aria-hidden="true">-</span>
                            </button>
                            <span
                              className={`${darkMode ? 'text-light' : 'text-gray-800'} min-w-[2rem] text-center transition-colors duration-300`}
                            >
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.product.productId, 1)}
                              className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors duration-300`}
                              aria-label={`Increase quantity of ${item.product.name}`}
                            >
                              <span aria-hidden="true">+</span>
                            </button>
                          </div>

                          <div className="text-sm">
                            {item.product.discount ? (
                              <div>
                                <span className="text-gray-500 line-through mr-2">
                                  ${item.product.price.toFixed(2)}
                                </span>
                                <span className="text-primary font-semibold">
                                  ${finalPrice.toFixed(2)}
                                </span>
                                <span
                                  className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                                >
                                  ({Math.round(item.product.discount * 100)}% off)
                                </span>
                              </div>
                            ) : (
                              <span className="text-primary font-semibold">
                                ${finalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p
                            className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}
                          >
                            Line Total
                          </p>
                          <p className="text-xl font-bold text-primary">${lineTotal.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-md sticky top-24 transition-colors duration-300`}
            >
              <h2
                className={`text-xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-4 transition-colors duration-300`}
              >
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div
                  className={`flex justify-between ${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}
                >
                  <span>Items ({items.reduce((sum, item) => sum + item.quantity, 0)})</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div
                  className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-300'} pt-3`}
                />
                <div className="flex justify-between text-xl font-bold">
                  <span className={darkMode ? 'text-light' : 'text-gray-800'}>Total</span>
                  <span className="text-primary">${getCartTotal().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate('/products')}
                className={`w-full mt-3 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-light' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} px-6 py-3 rounded-lg font-medium transition-colors duration-300`}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
