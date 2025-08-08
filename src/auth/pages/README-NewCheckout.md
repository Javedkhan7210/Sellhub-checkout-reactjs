# NewCheckout Component

The `NewCheckout.jsx` component is a comprehensive checkout form that handles product ID extraction from URL parameters and makes API calls to fetch product details and create orders.

## Features

- **ID Extraction**: Automatically extracts product ID from URL parameters (`/checkout/:id`)
- **API Integration**: Fetches product details from the SellHub API
- **Form Validation**: Comprehensive form validation with error handling
- **Coupon Support**: Apply and validate coupon codes
- **Order Creation**: Creates orders with customer information
- **Error Handling**: Graceful error handling for API failures
- **Loading States**: Proper loading indicators during API calls
- **Responsive Design**: Mobile-friendly responsive layout
- **Seller Information**: Displays seller details and payment gateway information
- **Tax Calculation**: Handles tax calculation from API response

## Usage

### Basic Usage

```jsx
import NewCheckout from './auth/pages/NewCheckout';

// Navigate to checkout with product ID
// URL: /checkout/fbacde6a-6c48-11f0-8159-bc2411a2737e
<NewCheckout />
```

### URL Structure

The component expects the following URL structure:
- `/checkout/:id` - Where `:id` is the product UUID
- `/checkout/default` - For demo/testing purposes

### API Endpoints

The component makes calls to the following API endpoints:

1. **Fetch Product Details**
   ```
   GET https://apipayment.sellhub.net/api/checkout/product/{productId}
   Headers: Authorization: Bearer {token}
   ```

2. **Validate Coupon**
   ```
   POST https://apipayment.sellhub.net/api/checkout/validate-coupon
   Headers: Authorization: Bearer {token}
   Body: { couponCode: string, productId: string }
   ```

3. **Create Order**
   ```
   POST https://apipayment.sellhub.net/api/checkout/create-order
   Headers: Authorization: Bearer {token}
   Body: {
     productId: string,
     customerInfo: {
       firstName: string,
       lastName: string,
       email: string,
       address: string,
       postalCode: string,
       city: string,
       country: string
     },
     couponCode: string | null
   }
   ```

## API Response Structure

### Product Details Response
```json
{
  "success": true,
  "product": {
    "id": 970,
    "uuid": "fbacde6a-6c48-11f0-8159-bc2411a2737e",
    "title": "dszydsb re er",
    "price": 522,
    "product_type": "Serial",
    "description": "vb rehjer tg jt f j nnfj fjg gfj f f",
    "image": "/uploads/products/images/1753772116.png",
    "user_id": 1,
    "user": {
      "id": 1,
      "name": "Raktim TESTING",
      "web_site": "wwww.com",
      "vendor_name": "sdgsadg",
      "contact": "98786454",
      "logo": "uploads/vendor/logo/1753683524.png",
      "terl_payment_mode": "1"
    }
  },
  "tax": 46.98,
  "gateway": {
    "id": 2,
    "name": "Telr Payment",
    "status": 0,
    "created_at": "2025-04-17T03:55:21.000000Z",
    "updated_at": "2025-04-17T03:55:21.000000Z"
  }
}
```

## State Management

### Product State
- `product`: Product details fetched from API
- `loading`: Loading state during API calls
- `error`: Error state for failed API calls
- `tax`: Tax amount from API response
- `gateway`: Payment gateway information

### Form State
- `formData`: Customer information form data
- `errors`: Form validation errors
- `isSubmitted`: Form submission state
- `isSubmitting`: Order creation loading state

## Form Fields

### Customer Information
- First Name (required)
- Last Name (required)
- Email Address (required, validated)

### Billing Details
- Address (required)
- Postal Code (required)
- City (required)
- Country (required, dropdown)
- Terms and Conditions (required checkbox)

### Optional Features
- Coupon Code (optional)

## Displayed Information

### Product Details
- Product title and description
- Product type
- Product image (if available)
- Price and tax calculation

### Seller Information
- Seller name and vendor name
- Contact information
- Website (if available)
- Seller logo (if available)

### Payment Gateway
- Gateway name
- Gateway status (Active/Inactive)

## Error Handling

The component handles various error scenarios:

1. **Authentication Errors**: Missing or invalid token
2. **Product Not Found**: 404 errors when product doesn't exist
3. **Network Errors**: Connection issues
4. **Form Validation Errors**: Missing required fields
5. **API Errors**: Server-side errors during order creation

## Loading States

- **Initial Load**: Shows "Loading product details..." with spinner
- **Form Submission**: Shows "Processing..." with spinner on button
- **Coupon Application**: Handles coupon validation loading

## Styling

The component uses:
- Tailwind CSS for styling
- Lucide React icons
- Sonner for toast notifications
- Responsive design with mobile-first approach

## Testing

Run the test suite to verify functionality:

```bash
npm test src/auth/pages/NewCheckout.test.jsx
```

## Dependencies

- `react-router-dom`: For URL parameter extraction
- `lucide-react`: For icons
- `sonner`: For toast notifications
- `@/components/ui/*`: UI components

## Example Usage

### With Product UUID
```
/checkout/fbacde6a-6c48-11f0-8159-bc2411a2737e
```

### API Call Example
```javascript
// The component will automatically call:
fetch('https://apipayment.sellhub.net/api/checkout/product/fbacde6a-6c48-11f0-8159-bc2411a2737e', {
  headers: {
    'Authorization': 'Bearer your-token-here',
    'Content-Type': 'application/json',
  },
})
```

## Security

- Requires authentication token in sessionStorage
- Validates all form inputs
- Sanitizes data before sending to API
- Handles sensitive information securely

## Browser Support

- Modern browsers with ES6+ support
- Responsive design for mobile devices
- Progressive enhancement for older browsers

## Key Features

1. **Real-time Product Loading**: Fetches product details based on UUID
2. **Dynamic Tax Calculation**: Uses tax amount from API response
3. **Seller Information Display**: Shows complete seller details
4. **Payment Gateway Integration**: Displays payment method information
5. **Image Handling**: Displays product and seller images
6. **Comprehensive Error Handling**: Handles all API error scenarios 