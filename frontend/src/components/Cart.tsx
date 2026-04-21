import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from 'react-query';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../api/config';

interface Branch {
  branchId: number;
  name: string;
}

interface CheckoutSuccess {
  orderId: number;
  branchId: number;
  orderDate: string;
  status: string;
  details: { productId: number; quantity: number; unitPrice: number }[];
}

const fetchBranches = async (): Promise<Branch[]> => {
  const { data } = await axios.get(`${api.baseURL}${api.endpoints.branches}`);
  return data;
};

export default function Cart() {
  const { items, removeItem, setQuantity, clearCart } = useCart();
  const { darkMode } = useTheme();
  const [selectedBranchId, setSelectedBranchId] = useState<number | ''>('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState<CheckoutSuccess | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: branches } = useQuery('branches', fetchBranches);

  const effectivePrice = (price: number, discount?: number) =>
    price * (1 - (discount ?? 0));

  const subtotal = items.reduce(
    (sum, item) => sum + effectivePrice(item.price, item.discount) * item.quantity,
    0,
  );

  const handleCheckout = async () => {
    if (!selectedBranchId) {
      setCheckoutError('Please select a branch before checking out.');
      return;
    }
    if (items.length === 0) {
      setCheckoutError('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);
    setCheckoutError(null);

    try {
      const payload = {
        branchId: selectedBranchId,
        lineItems: items.map(({ productId, quantity }) => ({ productId, quantity })),
      };
      const { data } = await axios.post<CheckoutSuccess>(
        `${api.baseURL}${api.endpoints.checkout}`,
        payload,
      );
      setCheckoutSuccess(data);
      clearCart();
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error?.message
          ? err.response.data.error.message
          : 'Checkout failed. Please try again.';
      setCheckoutError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textClass = darkMode ? 'text-light' : 'text-gray-800';
  const mutedClass = darkMode ? 'text-gray-400' : 'text-gray-600';

  // ── Success state ──────────────────────────────────────────────────────────
  if (checkoutSuccess) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
      >
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className={`text-3xl font-bold ${textClass} mb-4`}>Order Placed!</h1>
          <p className={`${mutedClass} mb-2`}>
            Order <strong className="text-primary">#{checkoutSuccess.orderId}</strong> has been
            created successfully.
          </p>
          <p className={`${mutedClass} mb-8`}>
            Status: <span className="capitalize">{checkoutSuccess.status}</span>
          </p>
          <Link
            to="/products"
            className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
      >
        <div className="max-w-2xl mx-auto text-center py-16">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-24 w-24 mx-auto mb-6 ${mutedClass}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h1 className={`text-3xl font-bold ${textClass} mb-4`}>Your cart is empty</h1>
          <p className={`${mutedClass} mb-8`}>
            Browse our products and add items to get started.
          </p>
          <Link
            to="/products"
            className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // ── Active cart ────────────────────────────────────────────────────────────
  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
    >
      <div className="max-w-5xl mx-auto">
        <h1 className={`text-3xl font-bold ${textClass} mb-6`}>Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Line items ── */}
          <div className="flex-grow space-y-4">
            {items.map((item) => {
              const discounted = effectivePrice(item.price, item.discount);
              const hasDiscount = (item.discount ?? 0) > 0;
              return (
                <div
                  key={item.productId}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${cardClass} shadow-sm`}
                >
                  <img
                    src={`/${item.imgName}`}
                    alt={item.name}
                    className="w-20 h-20 object-contain flex-shrink-0"
                  />
                  <div className="flex-grow min-w-0">
                    <h3 className={`font-semibold ${textClass} truncate`}>{item.name}</h3>
                    <p className={`text-sm ${mutedClass}`}>{item.unit}</p>
                    <div className="mt-1">
                      {hasDiscount ? (
                        <span className="text-sm">
                          <span className="line-through text-gray-400 mr-1">
                            ${item.price.toFixed(2)}
                          </span>
                          <span className="text-primary font-semibold">
                            ${discounted.toFixed(2)}
                          </span>
                        </span>
                      ) : (
                        <span className={`text-sm font-semibold ${textClass}`}>
                          ${item.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div
                    className={`flex items-center space-x-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-1`}
                  >
                    <button
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors`}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <span aria-hidden="true">-</span>
                    </button>
                    <span
                      className={`${textClass} min-w-[2rem] text-center`}
                      aria-label={`Quantity: ${item.quantity}`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      className={`w-8 h-8 flex items-center justify-center ${darkMode ? 'text-light' : 'text-gray-700'} hover:text-primary transition-colors`}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <span aria-hidden="true">+</span>
                    </button>
                  </div>

                  {/* Line subtotal */}
                  <span className={`w-20 text-right font-semibold ${textClass} flex-shrink-0`}>
                    ${(discounted * item.quantity).toFixed(2)}
                  </span>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.productId)}
                    className={`flex-shrink-0 ${mutedClass} hover:text-red-500 transition-colors`}
                    aria-label={`Remove ${item.name} from cart`}
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
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}

            <button
              onClick={clearCart}
              className={`text-sm ${mutedClass} hover:text-red-500 transition-colors`}
            >
              Clear cart
            </button>
          </div>

          {/* ── Order summary ── */}
          <div className={`lg:w-80 flex-shrink-0 rounded-lg border ${cardClass} shadow-sm p-6 self-start`}>
            <h2 className={`text-xl font-semibold ${textClass} mb-4`}>Order Summary</h2>

            <div className={`flex justify-between mb-2 ${mutedClass} text-sm`}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className={`flex justify-between font-bold text-lg ${textClass} border-t pt-3 mt-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <span>Total</span>
              <span className="text-primary">${subtotal.toFixed(2)}</span>
            </div>

            {/* Branch selector */}
            <div className="mt-6">
              <label
                htmlFor="branch-select"
                className={`block text-sm font-medium ${textClass} mb-1`}
              >
                Deliver to branch
              </label>
              <select
                id="branch-select"
                value={selectedBranchId}
                onChange={(e) =>
                  setSelectedBranchId(e.target.value ? Number(e.target.value) : '')
                }
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-light'
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              >
                <option value="">Select a branch…</option>
                {branches?.map((b) => (
                  <option key={b.branchId} value={b.branchId}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {checkoutError && (
              <p className="mt-3 text-sm text-red-500" role="alert">
                {checkoutError}
              </p>
            )}

            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="mt-4 w-full bg-primary hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? 'Placing order…' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
