import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const { darkMode } = useTheme();

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity >= 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
      >
        <div className="max-w-4xl mx-auto">
          <h1
            className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-8 transition-colors duration-300`}
          >
            Shopping Cart
          </h1>
          <div
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 text-center shadow-md transition-colors duration-300`}
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
            <h2
              className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} mb-2 transition-colors duration-300`}
            >
              Your cart is empty
            </h2>
            <p
              className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6 transition-colors duration-300`}
            >
              Add some products to get started!
            </p>
            <Link
              to="/products"
              className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg inline-block transition-colors"
            >
              Browse Products
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
      <div className="max-w-4xl mx-auto">
        <h1
          className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-8 transition-colors duration-300`}
        >
          Shopping Cart
        </h1>

        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <div
              key={item.productId}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow-md transition-colors duration-300`}
            >
              <div className="flex items-center gap-4">
                <img
                  src={`/${item.product.imgName}`}
                  alt={item.product.name}
                  className={`w-24 h-24 object-contain rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                />

                <div className="flex-grow">
                  <h3
                    className={`text-lg font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
                  >
                    {item.product.name}
                  </h3>
                  <p
                    className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm transition-colors duration-300`}
                  >
                    {item.product.description}
                  </p>
                  <div className="mt-2">
                    {item.product.discount ? (
                      <div>
                        <span className="text-gray-500 line-through text-sm mr-2">
                          ${item.product.price.toFixed(2)}
                        </span>
                        <span className="text-primary text-lg font-bold">
                          ${(item.product.price * (1 - item.product.discount)).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-primary text-lg font-bold">
                        ${item.product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div
                    className={`flex items-center space-x-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg p-1 transition-colors duration-300`}
                  >
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
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
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                      className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors duration-300`}
                      aria-label={`Increase quantity of ${item.product.name}`}
                    >
                      <span aria-hidden="true">+</span>
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'} transition-colors duration-300`}
                    aria-label={`Remove ${item.product.name} from cart`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
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

                <div className="text-right min-w-[100px]">
                  <div
                    className={`text-lg font-bold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
                  >
                    $
                    {(
                      (item.product.discount
                        ? item.product.price * (1 - item.product.discount)
                        : item.product.price) * item.quantity
                    ).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-md transition-colors duration-300`}
        >
          <div className="flex justify-between items-center mb-6">
            <span
              className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
            >
              Total:
            </span>
            <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
          </div>

          <div className="flex gap-4">
            <Link
              to="/products"
              className={`flex-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-light' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} px-6 py-3 rounded-lg text-center font-medium transition-colors duration-300`}
            >
              Continue Shopping
            </Link>
            <Link
              to="/checkout"
              className="flex-1 bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg text-center font-medium transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
