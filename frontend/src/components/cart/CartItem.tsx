import { useTheme } from '../../context/ThemeContext';
import { CartItem as CartItemType } from '../../context/CartContext';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { darkMode } = useTheme();

  const handleQuantityChange = (change: number) => {
    const newQuantity = item.quantity + change;
    if (newQuantity > 0) {
      onUpdateQuantity(item.productId, newQuantity);
    }
  };

  const lineTotal = item.price * item.quantity;

  return (
    <div
      className={`flex items-center justify-between p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg mb-3 transition-colors duration-300`}
    >
      <div className="flex-1">
        <h3
          className={`font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
        >
          {item.productName}
        </h3>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>
          ${item.price.toFixed(2)} each
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div
          className={`flex items-center space-x-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg p-1 transition-colors duration-300`}
        >
          <button
            onClick={() => handleQuantityChange(-1)}
            className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors duration-300`}
            aria-label={`Decrease quantity of ${item.productName}`}
          >
            <span aria-hidden="true">-</span>
          </button>
          <span
            className={`${darkMode ? 'text-light' : 'text-gray-800'} min-w-[2rem] text-center transition-colors duration-300`}
          >
            {item.quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(1)}
            className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors duration-300`}
            aria-label={`Increase quantity of ${item.productName}`}
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>

        <div
          className={`font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} min-w-[5rem] text-right transition-colors duration-300`}
        >
          ${lineTotal.toFixed(2)}
        </div>

        <button
          onClick={() => onRemove(item.productId)}
          className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'} transition-colors duration-300 p-2`}
          aria-label={`Remove ${item.productName} from cart`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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
    </div>
  );
}
