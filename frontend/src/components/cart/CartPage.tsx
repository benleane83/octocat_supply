import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import CartSummary from './CartSummary';
import CheckoutForm from './CheckoutForm';

export default function CartPage() {
  const { darkMode } = useTheme();
  const { items } = useCart();

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

        {items.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center text-center py-20 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            role="status"
            aria-live="polite"
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
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className={`${darkMode ? 'text-light' : 'text-gray-800'} text-xl font-medium mb-2`}>
              Your cart is empty
            </p>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Add some products to get started!
            </p>
            <a
              href="/products"
              className="mt-6 px-6 py-3 bg-primary hover:bg-accent text-white rounded-lg font-semibold transition-colors"
            >
              Browse Products
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CartSummary />
            </div>
            <div className="lg:col-span-1">
              <CheckoutForm />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
