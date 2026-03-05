import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import CartItem from './CartItem';

export default function CartSummary() {
  const { darkMode } = useTheme();
  const { items, updateQuantity, removeItem, getTotalPrice } = useCart();

  if (items.length === 0) {
    return null;
  }

  const totalPrice = getTotalPrice();

  return (
    <div
      className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg transition-colors duration-300`}
    >
      <h2
        className={`text-2xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-4 transition-colors duration-300`}
      >
        Cart Items
      </h2>

      <div className="space-y-2">
        {items.map((item) => (
          <CartItem
            key={item.productId}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </div>

      <div
        className={`mt-6 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-300`}
      >
        <div className="flex justify-between items-center">
          <span
            className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
          >
            Total
          </span>
          <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
