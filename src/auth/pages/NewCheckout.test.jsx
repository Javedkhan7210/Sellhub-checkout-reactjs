import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NewCheckout from './NewCheckout';

// Mock the API calls
global.fetch = jest.fn();

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const renderWithRouter = (component, { route = '/checkout/test-id' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('NewCheckout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue('mock-token');
  });

  test('renders checkout form with product ID', async () => {
    // Mock successful API response with new structure
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        product: {
          id: 970,
          uuid: "fbacde6a-6c48-11f0-8159-bc2411a2737e",
          title: "dszydsb re er",
          price: 522,
          product_type: "Serial",
          description: "vb rehjer tg jt f j nnfj fjg gfj f f",
          image: "/uploads/products/images/1753772116.png",
          user_id: 1,
          user: {
            id: 1,
            name: "Raktim TESTING",
            web_site: "wwww.com",
            vendor_name: "sdgsadg",
            contact: "98786454",
            logo: "uploads/vendor/logo/1753683524.png",
            terl_payment_mode: "1"
          }
        },
        tax: 46.98,
        gateway: {
          id: 2,
          name: "Telr Payment",
          status: 0,
          created_at: "2025-04-17T03:55:21.000000Z",
          updated_at: "2025-04-17T03:55:21.000000Z"
        }
      })
    });

    renderWithRouter(<NewCheckout />, { route: '/checkout/fbacde6a-6c48-11f0-8159-bc2411a2737e' });

    // Check if loading state is shown initially
    expect(screen.getByText('Loading product details...')).toBeInTheDocument();

    // Wait for the product to load
    await waitFor(() => {
      expect(screen.getByText('dszydsb re er')).toBeInTheDocument();
    });

    // Check if form fields are rendered
    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search for address...')).toBeInTheDocument();

    // Check if product details are displayed
    expect(screen.getByText('Product Details')).toBeInTheDocument();
    expect(screen.getByText('Serial')).toBeInTheDocument();
    expect(screen.getByText('View Seller Details')).toBeInTheDocument();
    expect(screen.getByText('Payment Method')).toBeInTheDocument();
    expect(screen.getByText('Telr Payment')).toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    // Mock API error
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    renderWithRouter(<NewCheckout />, { route: '/checkout/invalid-id' });

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Product not found')).toBeInTheDocument();
    });
  });

  test('validates form fields', async () => {
    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        product: {
          id: 970,
          uuid: "test-id",
          title: "Test Product",
          price: 522,
          product_type: "Serial",
          description: "Test description",
          user: {
            id: 1,
            name: "Test Seller",
            vendor_name: "Test Vendor",
            contact: "123456789"
          }
        },
        tax: 46.98,
        gateway: {
          id: 2,
          name: "Telr Payment",
          status: 0
        }
      })
    });

    renderWithRouter(<NewCheckout />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Try to submit without filling required fields
    const continueButton = screen.getByText('Continue To Payment');
    fireEvent.click(continueButton);

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  test('handles coupon application', async () => {
    // Mock successful API responses
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          product: {
            id: 970,
            uuid: "test-id",
            title: "Test Product",
            price: 522,
            product_type: "Serial",
            description: "Test description",
            user: {
              id: 1,
              name: "Test Seller",
              vendor_name: "Test Vendor",
              contact: "123456789"
            }
          },
          tax: 46.98,
          gateway: {
            id: 2,
            name: "Telr Payment",
            status: 0
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

    renderWithRouter(<NewCheckout />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Fill coupon code and apply
    const couponInput = screen.getByPlaceholderText('Enter coupon code');
    const applyButton = screen.getByText('Apply');

    fireEvent.change(couponInput, { target: { value: 'TESTCOUPON' } });
    fireEvent.click(applyButton);

    // Verify API call was made with new endpoint
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://apipayment.sellhub.net/api/checkout/validate-coupon',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            couponCode: 'TESTCOUPON',
            productId: 'test-id'
          }),
        })
      );
    });
  });

  test('creates order successfully', async () => {
    // Mock successful API responses
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          product: {
            id: 970,
            uuid: "test-id",
            title: "Test Product",
            price: 522,
            product_type: "Serial",
            description: "Test description",
            user: {
              id: 1,
              name: "Test Seller",
              vendor_name: "Test Vendor",
              contact: "123456789"
            }
          },
          tax: 46.98,
          gateway: {
            id: 2,
            name: "Telr Payment",
            status: 0
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ orderId: 'order-123' })
      });

    renderWithRouter(<NewCheckout />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Fill form data
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Search for address...'), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByPlaceholderText('Postal Code'), { target: { value: '12345' } });
    fireEvent.change(screen.getByPlaceholderText('City'), { target: { value: 'New York' } });
    
    // Select country
    const countrySelect = screen.getByRole('combobox');
    fireEvent.click(countrySelect);
    const usOption = screen.getByText('United States');
    fireEvent.click(usOption);

    // Agree to terms
    const termsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(termsCheckbox);

    // Submit form
    const continueButton = screen.getByText('Continue To Payment');
    fireEvent.click(continueButton);

    // Verify order creation API call with new endpoint
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://apipayment.sellhub.net/api/checkout/create-order',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: 'test-id',
            customerInfo: {
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              address: '123 Main St',
              postalCode: '12345',
              city: 'New York',
              country: 'us',
            },
            couponCode: null,
          }),
        })
      );
    });
  });

  test('displays correct tax calculation', async () => {
    // Mock successful API response with tax
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        product: {
          id: 970,
          uuid: "test-id",
          title: "Test Product",
          price: 522,
          product_type: "Serial",
          description: "Test description",
          user: {
            id: 1,
            name: "Test Seller",
            vendor_name: "Test Vendor",
            contact: "123456789"
          }
        },
        tax: 46.98,
        gateway: {
          id: 2,
          name: "Telr Payment",
          status: 0
        }
      })
    });

    renderWithRouter(<NewCheckout />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Check if tax is displayed correctly
    expect(screen.getByText('$46.98')).toBeInTheDocument();
    
    // Check if total is calculated correctly (522 + 46.98 = 568.98)
    expect(screen.getByText('$568.98')).toBeInTheDocument();
  });

  test('displays seller information correctly', async () => {
    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        product: {
          id: 970,
          uuid: "test-id",
          title: "Test Product",
          price: 522,
          product_type: "Serial",
          description: "Test description",
          user: {
            id: 1,
            name: "Raktim TESTING",
            web_site: "wwww.com",
            vendor_name: "sdgsadg",
            contact: "98786454",
            logo: "uploads/vendor/logo/1753683524.png",
            terl_payment_mode: "1"
          }
        },
        tax: 46.98,
        gateway: {
          id: 2,
          name: "Telr Payment",
          status: 0
        }
      })
    });

    renderWithRouter(<NewCheckout />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Check if seller information is displayed
    expect(screen.getByText('Raktim TESTING')).toBeInTheDocument();
    expect(screen.getByText('sdgsadg')).toBeInTheDocument();
    expect(screen.getByText('98786454')).toBeInTheDocument();
    expect(screen.getByText('wwww.com')).toBeInTheDocument();
  });

  test('toggles seller details when clicked', async () => {
    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        product: {
          id: 970,
          uuid: "test-id",
          title: "Test Product",
          price: 522,
          product_type: "Serial",
          description: "Test description",
          user: {
            id: 1,
            name: "Raktim TESTING",
            web_site: "wwww.com",
            vendor_name: "sdgsadg",
            contact: "98786454",
            logo: "uploads/vendor/logo/1753683524.png",
            terl_payment_mode: "1"
          }
        },
        tax: 46.98,
        gateway: {
          id: 2,
          name: "Telr Payment",
          status: 0
        }
      })
    });

    renderWithRouter(<NewCheckout />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Initially, seller details should not be visible
    expect(screen.queryByText('Seller Name:')).not.toBeInTheDocument();
    expect(screen.queryByText('Vendor Name:')).not.toBeInTheDocument();

    // Click on "View Seller Details"
    const viewSellerDetailsButton = screen.getByText('View Seller Details');
    fireEvent.click(viewSellerDetailsButton);

    // Now seller details should be visible
    await waitFor(() => {
      expect(screen.getByText('Seller Name:')).toBeInTheDocument();
      expect(screen.getByText('Vendor Name:')).toBeInTheDocument();
      expect(screen.getByText('Contact:')).toBeInTheDocument();
      expect(screen.getByText('Website:')).toBeInTheDocument();
      expect(screen.getByText('Raktim TESTING')).toBeInTheDocument();
      expect(screen.getByText('sdgsadg')).toBeInTheDocument();
      expect(screen.getByText('98786454')).toBeInTheDocument();
      expect(screen.getByText('wwww.com')).toBeInTheDocument();
    });

    // Click again to hide seller details
    fireEvent.click(viewSellerDetailsButton);

    // Seller details should be hidden again
    await waitFor(() => {
      expect(screen.queryByText('Seller Name:')).not.toBeInTheDocument();
      expect(screen.queryByText('Vendor Name:')).not.toBeInTheDocument();
    });
  });

  test('handles seller without website and logo', async () => {
    // Mock successful API response without website and logo
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        product: {
          id: 970,
          uuid: "test-id",
          title: "Test Product",
          price: 522,
          product_type: "Serial",
          description: "Test description",
          user: {
            id: 1,
            name: "Test Seller",
            vendor_name: "Test Vendor",
            contact: "123456789"
            // No web_site or logo
          }
        },
        tax: 46.98,
        gateway: {
          id: 2,
          name: "Telr Payment",
          status: 0
        }
      })
    });

    renderWithRouter(<NewCheckout />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Click on "View Seller Details"
    const viewSellerDetailsButton = screen.getByText('View Seller Details');
    fireEvent.click(viewSellerDetailsButton);

    // Check that seller details are displayed but website and logo are not
    await waitFor(() => {
      expect(screen.getByText('Seller Name:')).toBeInTheDocument();
      expect(screen.getByText('Vendor Name:')).toBeInTheDocument();
      expect(screen.getByText('Contact:')).toBeInTheDocument();
      expect(screen.getByText('Test Seller')).toBeInTheDocument();
      expect(screen.getByText('Test Vendor')).toBeInTheDocument();
      expect(screen.getByText('123456789')).toBeInTheDocument();
      
      // Website and logo should not be present
      expect(screen.queryByText('Website:')).not.toBeInTheDocument();
    });
  });

  test('shows address autocomplete when typing using Geoapify API', async () => {
    // Mock successful API responses
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          product: {
            id: 970,
            uuid: "test-id",
            title: "Test Product",
            price: 522,
            product_type: "Serial",
            description: "Test description",
            user: {
              id: 1,
              name: "Test Seller",
              vendor_name: "Test Vendor",
              contact: "123456789"
            }
          },
          tax: 46.98,
          gateway: {
            id: 2,
            name: "Telr Payment",
            status: 0
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              properties: {
                formatted: "Dadri (Noida), UP, India",
                city: "Noida",
                country: "India",
                postcode: "201301"
              },
              geometry: { type: "Point", coordinates: [77.2090, 28.5355] }
            },
            {
              properties: {
                formatted: "Greater Noida, UP, India",
                city: "Greater Noida",
                country: "India",
                postcode: "201310"
              },
              geometry: { type: "Point", coordinates: [77.4975, 28.4744] }
            }
          ]
        })
      });

    renderWithRouter(<NewCheckout />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Type in address field
    const addressInput = screen.getByPlaceholderText('Search for address...');
    fireEvent.change(addressInput, { target: { value: 'noida' } });

    // Wait for address suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('Dadri (Noida), UP, India')).toBeInTheDocument();
      expect(screen.getByText('Greater Noida, UP, India')).toBeInTheDocument();
    });

    // Verify Geoapify API call was made
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.geoapify.com/v1/geocode/autocomplete?text=noida&limit=5&apiKey=428f85843fe443d28b323b064c1ebab0'
    );
  });

  test('auto-fills form fields when address is selected', async () => {
    // Mock successful API responses
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          product: {
            id: 970,
            uuid: "test-id",
            title: "Test Product",
            price: 522,
            product_type: "Serial",
            description: "Test description",
            user: {
              id: 1,
              name: "Test Seller",
              vendor_name: "Test Vendor",
              contact: "123456789"
            }
          },
          tax: 46.98,
          gateway: {
            id: 2,
            name: "Telr Payment",
            status: 0
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              properties: {
                formatted: "123 Main Street, New York, NY, USA",
                city: "New York",
                country: "USA",
                postcode: "10001"
              },
              geometry: { type: "Point", coordinates: [-74.0060, 40.7128] }
            }
          ]
        })
      });

    renderWithRouter(<NewCheckout />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Type in address field
    const addressInput = screen.getByPlaceholderText('Search for address...');
    fireEvent.change(addressInput, { target: { value: 'new york' } });

    // Wait for address suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('123 Main Street, New York, NY, USA')).toBeInTheDocument();
    });

    // Click on a suggestion
    const suggestion = screen.getByText('123 Main Street, New York, NY, USA');
    fireEvent.click(suggestion);

    // Check that all form fields are auto-filled
    await waitFor(() => {
      expect(addressInput.value).toBe('123 Main Street, New York, NY, USA');
      
      const postalCodeInput = screen.getByPlaceholderText('Postal Code');
      const cityInput = screen.getByPlaceholderText('City');
      
      expect(postalCodeInput.value).toBe('10001');
      expect(cityInput.value).toBe('New York');
    });
  });

  test('handles keyboard navigation in address autocomplete', async () => {
    // Mock successful API responses
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          product: {
            id: 970,
            uuid: "test-id",
            title: "Test Product",
            price: 522,
            product_type: "Serial",
            description: "Test description",
            user: {
              id: 1,
              name: "Test Seller",
              vendor_name: "Test Vendor",
              contact: "123456789"
            }
          },
          tax: 46.98,
          gateway: {
            id: 2,
            name: "Telr Payment",
            status: 0
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              properties: {
                formatted: "Dadri (Noida), UP, India",
                city: "Noida",
                country: "India",
                postcode: "201301"
              },
              geometry: { type: "Point", coordinates: [77.2090, 28.5355] }
            }
          ]
        })
      });

    renderWithRouter(<NewCheckout />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Type in address field
    const addressInput = screen.getByPlaceholderText('Search for address...');
    fireEvent.change(addressInput, { target: { value: 'noida' } });

    // Wait for address suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('Dadri (Noida), UP, India')).toBeInTheDocument();
    });

    // Press arrow down to select first suggestion
    fireEvent.keyDown(addressInput, { key: 'ArrowDown' });
    
    // Press Enter to select
    fireEvent.keyDown(addressInput, { key: 'Enter' });

    // Check that the address field is filled and form fields are auto-filled
    await waitFor(() => {
      expect(addressInput.value).toBe('Dadri (Noida), UP, India');
      
      const postalCodeInput = screen.getByPlaceholderText('Postal Code');
      const cityInput = screen.getByPlaceholderText('City');
      
      expect(postalCodeInput.value).toBe('201301');
      expect(cityInput.value).toBe('Noida');
    });
  });

  test('shows success toast when address is selected', async () => {
    // Mock successful API responses
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          product: {
            id: 970,
            uuid: "test-id",
            title: "Test Product",
            price: 522,
            product_type: "Serial",
            description: "Test description",
            user: {
              id: 1,
              name: "Test Seller",
              vendor_name: "Test Vendor",
              contact: "123456789"
            }
          },
          tax: 46.98,
          gateway: {
            id: 2,
            name: "Telr Payment",
            status: 0
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              properties: {
                formatted: "Test Address, Test City, Test Country",
                city: "Test City",
                country: "Test Country",
                postcode: "12345"
              },
              geometry: { type: "Point", coordinates: [0, 0] }
            }
          ]
        })
      });

    renderWithRouter(<NewCheckout />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Type in address field
    const addressInput = screen.getByPlaceholderText('Search for address...');
    fireEvent.change(addressInput, { target: { value: 'test' } });

    // Wait for address suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('Test Address, Test City, Test Country')).toBeInTheDocument();
    });

    // Click on a suggestion
    const suggestion = screen.getByText('Test Address, Test City, Test Country');
    fireEvent.click(suggestion);

    // Check that success toast is shown
    await waitFor(() => {
      const { toast } = require('sonner');
      expect(toast.success).toHaveBeenCalledWith('Address details filled automatically!');
    });
  });
});

export default NewCheckout; 