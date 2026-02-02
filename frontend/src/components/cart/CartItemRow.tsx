import { useCart, CartItem } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

interface CartItemRowProps {
  item: CartItem;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem, getSubtotal } = useCart();
  const { darkMode } = useTheme();

  const hasDiscount = item.discount != null && item.discount > 0;
  const subtotal = getSubtotal(item);

  return (
    <div
      className={`flex flex-col md:flex-row items-start md:items-center gap-4 p-4 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      } rounded-lg shadow-md transition-colors duration-300`}
    >
      {/* Product Image */}
      <div className="flex-shrink-0">
        <img
          src={`/${item.imgName}`}
          alt={item.name}
          className="w-20 h-20 object-contain rounded"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3
          className={`text-lg font-semibold ${
            darkMode ? 'text-light' : 'text-gray-800'
          } truncate transition-colors duration-300`}
        >
          {item.name}
        </h3>
        <p
          className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          } transition-colors duration-300`}
        >
          {item.description}
        </p>
        {hasDiscount && (
          <span className="inline-block mt-1 bg-primary text-white text-xs px-2 py-1 rounded">
            {Math.round(item.discount! * 100)}% OFF
          </span>
        )}
      </div>

      {/* Price */}
      <div className="flex flex-col items-start md:items-end">
        {hasDiscount ? (
          <>
            <span className="text-gray-500 line-through text-sm">
              ${item.price.toFixed(2)}
            </span>
            <span className="text-primary text-lg font-bold">
              ${(item.price * (1 - item.discount!)).toFixed(2)}
            </span>
          </>
        ) : (
          <span className="text-primary text-lg font-bold">${item.price.toFixed(2)}</span>
        )}
        <span
          className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}
        >
          per {item.unit}
        </span>
      </div>

      {/* Quantity Controls */}
      <div
        className={`flex items-center space-x-3 ${
          darkMode ? 'bg-gray-700' : 'bg-gray-200'
        } rounded-lg p-2 transition-colors duration-300`}
      >
        <button
          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
          className={`w-8 h-8 flex items-center justify-center ${
            darkMode ? 'text-light' : 'text-gray-700'
          } hover:text-primary transition-colors duration-300`}
          aria-label={`Decrease quantity of ${item.name}`}
        >
          <span aria-hidden="true">-</span>
        </button>
        <span
          className={`${
            darkMode ? 'text-light' : 'text-gray-800'
          } min-w-[2rem] text-center transition-colors duration-300`}
        >
          {item.quantity}
        </span>
        <button
          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
          className={`w-8 h-8 flex items-center justify-center ${
            darkMode ? 'text-light' : 'text-gray-700'
          } hover:text-primary transition-colors duration-300`}
          aria-label={`Increase quantity of ${item.name}`}
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>

      {/* Subtotal */}
      <div className="flex flex-col items-start md:items-end min-w-[100px]">
        <span
          className={`text-lg font-bold ${
            darkMode ? 'text-light' : 'text-gray-800'
          } transition-colors duration-300`}
        >
          ${subtotal.toFixed(2)}
        </span>
        <span
          className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}
        >
          subtotal
        </span>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeItem(item.productId)}
        className={`${
          darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'
        } transition-colors duration-300`}
        aria-label={`Remove ${item.name} from cart`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
}
