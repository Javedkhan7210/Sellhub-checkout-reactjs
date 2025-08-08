import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  MapPin, 
  Building, 
  Globe, 
  Tag, 
  FileText, 
  ChevronDown,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';

export default function SignInPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Use a default product ID if none is provided (for auth page)
  const productId = id || 'default';
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    postalCode: '',
    city: '',
    country: '',
    couponCode: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Fetch product details based on ID
    const fetchProduct = async () => {
      try {
        // If it's the default product (for auth page), use mock data
        if (productId === 'default') {
          setProduct({
            id: 'default',
            title: 'Sample Product',
            price: 99.99,
            description: 'This is a sample product for demonstration purposes.'
          });
          setLoading(false);
          return;
        }

        const token = sessionStorage.getItem('seller_token');
        const response = await fetch(`https://apipayment.sellhub.net/api/seller/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setProduct(data.data);
        } else {
          console.error('Failed to fetch product');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleApplyCoupon = () => {
    // Handle coupon application logic
    console.log('Applying coupon:', formData.couponCode);
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validations
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPayment = () => {
    setIsSubmitted(true);
    
    if (validateForm()) {
      // Handle payment continuation logic
      console.log('Continuing to payment with data:', formData);
    }
  };

  const calculateTax = (price) => {
    return (price * 0.09).toFixed(2); // 9% tax
  };

  const calculateTotal = () => {
    const subtotal = product?.price || 0;
    const tax = parseFloat(calculateTax(subtotal));
    const discount = 0; // No discount applied
    return (subtotal + tax - discount).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">
          {productId === 'default' ? 'Welcome to Checkout' : 'Product not found'}
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10">
      <Card className="w-full max-w-4xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="border-b border-border mb-8 pb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-foreground font-medium">TESTER ACCOUNT</span>
              </div>
            </div>
          </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Forms */}
            <div className="space-y-8">
                         {/* Customer Information */}
             <div className="bg-card border border-border rounded-lg p-6">
               <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
                 Customer Information
               </h2>
               <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                 <div className="relative">
               
                   <Input
                     placeholder="First Name"
                     value={formData.firstName}
                     onChange={(e) => handleInputChange('firstName', e.target.value)}
                     className={`pl-4 bg-card border-border text-foreground placeholder:text-muted-foreground ${
                       isSubmitted && errors.firstName ? 'border-red-500' : ''
                     }`}
                   />
                   {isSubmitted && errors.firstName && (
                     <div className="flex items-center gap-1 mt-1 text-red-500 text-sm pl-0">
                       <AlertCircle className="w-3 h-3" />
                       {errors.firstName}
                     </div>
                   )}
                 </div>
                 <div className="relative">
                 
                   <Input
                     placeholder="Last Name"
                     value={formData.lastName}
                     onChange={(e) => handleInputChange('lastName', e.target.value)}
                     className={`pl-4 bg-card border-border text-foreground placeholder:text-muted-foreground ${
                       isSubmitted && errors.lastName ? 'border-red-500' : ''
                     }`}
                   />
                   {isSubmitted && errors.lastName && (
                     <div className="flex items-center gap-1 mt-1 text-red-500 text-sm pl-0">
                       <AlertCircle className="w-3 h-3" />
                       {errors.lastName}
                     </div>
                   )}
                 </div>
                 <div className="relative md:col-span-2">
                  
                   <Input
                     placeholder="Email Address"
                     type="email"
                     value={formData.email}
                     onChange={(e) => handleInputChange('email', e.target.value)}
                     className={`pl-4 bg-card border-border text-foreground placeholder:text-muted-foreground ${
                       isSubmitted && errors.email ? 'border-red-500' : ''
                     }`}
                   />
                   {isSubmitted && errors.email && (
                     <div className="flex items-center gap-1 mt-1 text-red-500 text-sm pl-0">
                       <AlertCircle className="w-3 h-3" />
                       {errors.email}
                     </div>
                   )}
                 </div>
               </div>
             </div>

                         {/* Billing Details */}
             <div className="bg-card border border-border rounded-lg p-6">
               <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
                 Billing Details
               </h2>
               <div className="space-y-4 max-w-md mx-auto">
                 <div className="relative">
                   
                   <Input
                     placeholder="Address"
                     value={formData.address}
                     onChange={(e) => handleInputChange('address', e.target.value)}
                     className={`pl-4 bg-card border-border text-foreground placeholder:text-muted-foreground ${
                       isSubmitted && errors.address ? 'border-red-500' : ''
                     }`}
                   />
                   {isSubmitted && errors.address && (
                     <div className="flex items-center gap-1 mt-1 text-red-500 text-sm pl-0">
                       <AlertCircle className="w-3 h-3" />
                       {errors.address}
                     </div>
                   )}
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="relative">
                    
                     <Input
                       placeholder="Postal Code"
                       value={formData.postalCode}
                       onChange={(e) => handleInputChange('postalCode', e.target.value)}
                       className={`pl-4 bg-card border-border text-foreground placeholder:text-muted-foreground ${
                         isSubmitted && errors.postalCode ? 'border-red-500' : ''
                       }`}
                     />
                     {isSubmitted && errors.postalCode && (
                       <div className="flex items-center gap-1 mt-1 text-red-500 text-sm pl-0">
                         <AlertCircle className="w-3 h-3" />
                         {errors.postalCode}
                       </div>
                     )}
                   </div>
                   <div className="relative">
                    
                     <Input
                       placeholder="City"
                       value={formData.city}
                       onChange={(e) => handleInputChange('city', e.target.value)}
                       className={`pl-4 bg-card border-border text-foreground placeholder:text-muted-foreground ${
                         isSubmitted && errors.city ? 'border-red-500' : ''
                       }`}
                     />
                     {isSubmitted && errors.city && (
                       <div className="flex items-center gap-1 mt-1 text-red-500 text-sm pl-0">
                       <AlertCircle className="w-3 h-3" />
                       {errors.city}
                     </div>
                   )}
                 </div>
                 </div>
                 <div className="relative">
                  
                   <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                     <SelectTrigger className={`pl-4 bg-card border-border text-foreground ${
                       isSubmitted && errors.country ? 'border-red-500' : ''
                     }`}>
                       <SelectValue placeholder="Select Country" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="us">United States</SelectItem>
                       <SelectItem value="ca">Canada</SelectItem>
                       <SelectItem value="uk">United Kingdom</SelectItem>
                       <SelectItem value="au">Australia</SelectItem>
                     </SelectContent>
                   </Select>
                   {isSubmitted && errors.country && (
                     <div className="flex items-center gap-1 mt-1 text-red-500 text-sm pl-0">
                       <AlertCircle className="w-3 h-3" />
                       {errors.country}
                     </div>
                   )}
                 </div>
                 <div className="flex items-center space-x-2">
                   <Checkbox
                     id="terms"
                     checked={formData.agreeToTerms}
                     onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
                     className={`border-border ${
                       isSubmitted && errors.agreeToTerms ? 'border-red-500' : ''
                     }`}
                   />
                   <label htmlFor="terms" className="text-sm text-foreground">
                     I agree to the{' '}
                     <span className="text-yellow-500 cursor-pointer hover:underline">
                       terms and conditions
                     </span>
                   </label>
                   {isSubmitted && errors.agreeToTerms && (
                     <div className="flex items-center gap-1 mt-1 text-red-500 text-sm ml-0">
                       <AlertCircle className="w-3 h-3" />
                       {errors.agreeToTerms}
                     </div>
                   )}
                 </div>
               </div>
             </div>

            {/* Coupon Code */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
                Coupon Code
              </h2>
              <div className="flex gap-4 max-w-md mx-auto">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Tag className="w-4 h-4 text-yellow-500" />
                  </div>
                  <Input
                    placeholder="Enter coupon code"
                    value={formData.couponCode}
                    onChange={(e) => handleInputChange('couponCode', e.target.value)}
                    className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <Button
                  onClick={handleApplyCoupon}
                  className=" text-white hover: px-6"
                >
                  Apply
                </Button>
              </div>
            </div>

            {/* Continue to Payment Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleContinueToPayment}
                className="w-full max-w-md text-white hover: py-3 text-lg font-semibold"
                
              >
                Continue To Payment
              </Button>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Order Summary
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-foreground">{product?.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Subtotal</span>
                  <span className="text-foreground">${product?.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Tax</span>
                  <span className="text-foreground">${calculateTax(product?.price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Discount</span>
                  <span className="text-foreground">$0.00</span>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground font-semibold">Total</span>
                    <span className="text-foreground font-semibold">${calculateTotal()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* View Seller Details */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-yellow-500" />
                  <span className="text-foreground">View Seller Details</span>
                </div>
                <ChevronDown className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  );
} 