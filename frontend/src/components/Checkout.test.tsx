import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Checkout from './Checkout';
import { CartProvider } from '../context/CartContext';
import { ThemeProvider } from '../context/ThemeContext';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockProduct = {
  productId: 1,
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  imgName: 'test.jpg',
  sku: 'TEST-001',
  unit: 'pcs',
  supplierId: 1,
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ThemeProvider>
      <CartProvider>{children}</CartProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe('Checkout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should redirect to cart if cart is empty', () => {
    render(
      <TestWrapper>
        <Checkout />
      </TestWrapper>,
    );

    expect(mockNavigate).toHaveBeenCalledWith('/cart');
  });

  it('should display order form with cart items', () => {
    // Pre-populate cart
    const cartData = [
      {
        product: mockProduct,
        quantity: 2,
      },
    ];
    localStorage.setItem('octocat_supply_cart', JSON.stringify(cartData));

    render(
      <TestWrapper>
        <Checkout />
      </TestWrapper>,
    );

    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByLabelText(/Order Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Order Description/i)).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('should display correct order summary', () => {
    // Pre-populate cart
    const cartData = [
      {
        product: mockProduct,
        quantity: 2,
      },
    ];
    localStorage.setItem('octocat_supply_cart', JSON.stringify(cartData));

    render(
      <TestWrapper>
        <Checkout />
      </TestWrapper>,
    );

    // Check for order total (2 * $100 = $200)
    const totalElements = screen.getAllByText('$200.00');
    expect(totalElements.length).toBeGreaterThan(0);
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();

    // Pre-populate cart
    const cartData = [
      {
        product: mockProduct,
        quantity: 2,
      },
    ];
    localStorage.setItem('octocat_supply_cart', JSON.stringify(cartData));

    render(
      <TestWrapper>
        <Checkout />
      </TestWrapper>,
    );

    const submitButton = screen.getByText('Place Order');
    await user.click(submitButton);

    // Browser validation should prevent submission
    const nameInput = screen.getByLabelText(/Order Name/i) as HTMLInputElement;
    expect(nameInput.validity.valid).toBe(false);
  });

  it('should successfully place an order', async () => {
    const user = userEvent.setup();

    // Pre-populate cart
    const cartData = [
      {
        product: mockProduct,
        quantity: 2,
      },
    ];
    localStorage.setItem('octocat_supply_cart', JSON.stringify(cartData));

    // Mock successful API responses
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        orderId: 123,
        branchId: 1,
        orderDate: new Date().toISOString(),
        name: 'Test Order',
        description: 'Test Description',
        status: 'pending',
      },
    });

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        orderDetailId: 1,
        orderId: 123,
        productId: 1,
        quantity: 2,
        unitPrice: 100,
        notes: '',
      },
    });

    render(
      <TestWrapper>
        <Checkout />
      </TestWrapper>,
    );

    // Fill in the form
    const nameInput = screen.getByLabelText(/Order Name/i);
    const descriptionInput = screen.getByLabelText(/Order Description/i);

    await user.type(nameInput, 'Test Order');
    await user.type(descriptionInput, 'Test Description');

    // Submit the form
    const submitButton = screen.getByText('Place Order');
    await user.click(submitButton);

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Order Placed Successfully!')).toBeInTheDocument();
    });

    // Verify order ID is displayed
    expect(screen.getByText(/#123/)).toBeInTheDocument();

    // Verify cart was cleared
    const savedCart = localStorage.getItem('octocat_supply_cart');
    expect(JSON.parse(savedCart!)).toHaveLength(0);

    // Verify API calls were made correctly
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);

    // Check order creation call
    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('/api/orders'),
      expect.objectContaining({
        branchId: 1,
        name: 'Test Order',
        description: 'Test Description',
        status: 'pending',
      }),
    );

    // Check order detail creation call
    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/api/order-details'),
      expect.objectContaining({
        orderId: 123,
        productId: 1,
        quantity: 2,
        unitPrice: 100,
        notes: '',
      }),
    );
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();

    // Pre-populate cart
    const cartData = [
      {
        product: mockProduct,
        quantity: 2,
      },
    ];
    localStorage.setItem('octocat_supply_cart', JSON.stringify(cartData));

    // Mock API error
    mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

    render(
      <TestWrapper>
        <Checkout />
      </TestWrapper>,
    );

    // Fill in the form
    const nameInput = screen.getByLabelText(/Order Name/i);
    await user.type(nameInput, 'Test Order');

    // Submit the form
    const submitButton = screen.getByText('Place Order');
    await user.click(submitButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to place order/i)).toBeInTheDocument();
    });

    // Verify cart was NOT cleared
    const savedCart = localStorage.getItem('octocat_supply_cart');
    expect(JSON.parse(savedCart!)).toHaveLength(1);
  });

  it('should apply discounts correctly when creating order', async () => {
    const user = userEvent.setup();

    const productWithDiscount = {
      ...mockProduct,
      discount: 0.2, // 20% off
    };

    // Pre-populate cart with discounted product
    const cartData = [
      {
        product: productWithDiscount,
        quantity: 2,
      },
    ];
    localStorage.setItem('octocat_supply_cart', JSON.stringify(cartData));

    // Mock successful API responses
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        orderId: 123,
        branchId: 1,
        orderDate: new Date().toISOString(),
        name: 'Test Order',
        description: 'Test Description',
        status: 'pending',
      },
    });

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        orderDetailId: 1,
        orderId: 123,
        productId: 1,
        quantity: 2,
        unitPrice: 80, // 100 * 0.8
        notes: '',
      },
    });

    render(
      <TestWrapper>
        <Checkout />
      </TestWrapper>,
    );

    // Fill in the form
    const nameInput = screen.getByLabelText(/Order Name/i);
    await user.type(nameInput, 'Test Order');

    // Submit the form
    const submitButton = screen.getByText('Place Order');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Order Placed Successfully!')).toBeInTheDocument();
    });

    // Verify order detail was created with discounted price
    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/api/order-details'),
      expect.objectContaining({
        unitPrice: 80, // 100 * (1 - 0.2)
      }),
    );
  });
});
