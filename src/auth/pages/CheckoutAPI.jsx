import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  MapPin,
  Building,
  Globe,
  Tag,
  FileText,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Home,
  Shield,
  CreditCard,
  CheckCircle,
  Star,
  Truck,
  Lock,
  Gift,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import PaymentLoader from "./PaymentLoader";
import LoadingPayment from "./LoadingPayment";
import TapPayment from "./TapPayment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CheckoutAPI() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loading1, setLoading1] = useState(true);
  const [error, setError] = useState(null);
  const [tax, setTax] = useState(0);
  const [gateway, setGateway] = useState(null);
  console.log("asdgasdgads", gateway);
  const [showSellerDetails, setShowSellerDetails] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState(null);
  const iframeRef = useRef(null);

  // Payment status check states
  const [transactionData, setTransactionData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const [checkLoader, setCheckLoader] = useState(false);
  const [loaderStatus, setLoaderStatus] = useState("processing");
  const [modalData, setModalData] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const [isWaitingForToken, setIsWaitingForToken] = useState(false);
  const maxPollingAttempts = 150; // 5 minutes (150 * 2 seconds)
  const intervalRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Address autocomplete states
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1);
  const [addressSelected, setAddressSelected] = useState(false);

  // Country list states
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [countriesError, setCountriesError] = useState(false);

  // Fallback countries in case API fails
  const fallbackCountries = [
    { id: 1, name: "United States" },
    { id: 2, name: "Canada" },
    { id: 3, name: "United Kingdom" },
    { id: 4, name: "Australia" },
    { id: 5, name: "India" },
  ];

  // Use a default product ID if none is provided (for auth page)
  const productId = id || "default";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    postalCode: "",
    city: "",
    country: "",
    couponCode: "",
    agreeToTerms: false,
  });

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState({
    transactionId: "",
    amount: 0,
    orderDetails: null,
  });

  // Log the ID for debugging
  console.log("Product ID from URL:", productId);

  // Fetch countries from API
  const fetchCountries = async () => {
    try {
      setCountriesLoading(true);
      setCountriesError(false);
      const token = sessionStorage.getItem("seller_token");

      const response = await fetch(
        "https://apipayment.sellhub.net/api/checkout/country",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // console.log("Countries API Response:", data);

        if (data.success && data.data) {
          setCountries(data.data);
        } else {
          console.error("Failed to fetch countries:", data);
          setCountriesError(true);
          setCountries(fallbackCountries);
          toast.error("Failed to load countries, using fallback list");
        }
      } else {
        console.error("Failed to fetch countries:", response.status);
        setCountriesError(true);
        setCountries(fallbackCountries);
        toast.error("Failed to load countries, using fallback list");
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      setCountriesError(true);
      setCountries(fallbackCountries);
      toast.error("Failed to load countries, using fallback list");
    } finally {
      setCountriesLoading(false);
    }
  };

  useEffect(() => {
    // Fetch countries on component mount
    fetchCountries();
  }, []);

  useEffect(() => {
    // Fetch product details based on ID
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = sessionStorage.getItem("seller_token");

        const response = await fetch(
          `https://apipayment.sellhub.net/api/checkout/payment-api-info/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("dsfdddddd", response);

        if (response.ok) {
          const data = await response.json();

          console.log("New-checkpout-response", data);

          if (data?.success && data?.payment_data) {
            setProduct(data.payment_data);
            setTax(data.tax || 0);
            setGateway(data.gateway);
          } else {
            setError("Product data not found");
          }
        } else if (response.status === 404) {
          console.log("dsagsdagsafg", response);
          setError("Product out of stock");
        } else if (response.status === 401) {
          setError("Authentication failed. Please login again.");
        } else {
          setError("Failed to fetch product details");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Address autocomplete functionality using Geoapify API
  const fetchAddressSuggestions = async (query) => {
    if (!query || query.length < 2 || addressSelected) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    try {
      setAddressLoading(true);

      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=5&apiKey=428f85843fe443d28b323b064c1ebab0`
      );

      if (response.ok) {
        const data = await response.json();
        // console.log("Geoapify API Response:", data);

        if (data.features && data.features.length > 0) {
          const suggestions = data.features.map((feature) => ({
            display: feature.properties.formatted,
            properties: feature.properties,
            geometry: feature.geometry,
          }));

          setAddressSuggestions(suggestions);
          setShowAddressSuggestions(true);
          setSelectedAddressIndex(-1);
        } else {
          setAddressSuggestions([]);
          setShowAddressSuggestions(false);
        }
      } else {
        console.error("Failed to fetch address suggestions");
        setAddressSuggestions([]);
        setShowAddressSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSubmit = () => {
    console.log("handleSubmit called - this should trigger Tap payment");
    // This function is called when the user clicks the "Continue to Payment" button
    // It should trigger the Tap payment form submission
    if (window.CardSDK?.tokenize) {
      console.log("Calling window.CardSDK.tokenize()");
      setIsWaitingForToken(true);
      window.CardSDK.tokenize();
    } else {
      console.log("CardSDK.tokenize not available");
      alert("Card form not ready yet. Please try again.");
    }
  };

  useEffect(() => {
    if (
      paymentResponse?.id &&
      gateway?.name === "Tap Payment" &&
      isWaitingForToken
    ) {
      console.log(
        "Payment token received, calling API with token:",
        paymentResponse.id
      );
      setIsWaitingForToken(false);
      // Only call the API when we have the payment token
      handleContinueToPayment();
    }
  }, [paymentResponse, gateway?.name, isWaitingForToken]);

  // Debounced address search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.address.length >= 2 && !addressSelected) {
        fetchAddressSuggestions(formData.address);
      } else {
        setAddressSuggestions([]);
        setShowAddressSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData.address, addressSelected]);

  const handleAddressInputChange = (value) => {
    handleInputChange("address", value);

    // If user clears the address field completely, reset the selected state
    if (value.length === 0) {
      setAddressSelected(false);
      setShowAddressSuggestions(false);
    }
    // Only show suggestions if address hasn't been selected yet
    else if (!addressSelected) {
      setShowAddressSuggestions(true);
    } else {
      // If address is already selected, ensure modal stays closed
      setShowAddressSuggestions(false);
    }

    setSelectedAddressIndex(-1);
  };

  const handleAddressSelect = (suggestion) => {
    const properties = suggestion.properties;

    // Extract address components
    const address = properties.formatted || "";
    const city = properties.city || properties.town || properties.village || "";
    const country = properties.country || "";
    const postalCode = properties.postcode || "";

    console.log("Selected address properties:", properties);

    setFormData((prev) => ({
      ...prev,
      address: address,
      city: city,
      country: country,
      postalCode: postalCode,
    }));

    // Close modal and mark as selected
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
    setSelectedAddressIndex(-1);
    setAddressSelected(true);

    // Show success message only if some fields were auto-filled
    const autoFilledFields = [city, country, postalCode].filter(
      (field) => field
    ).length;
    if (autoFilledFields > 0) {
      toast.success(`${autoFilledFields} field(s) auto-filled!`);
    }
  };

  const handleKeyDown = (e) => {
    if (!showAddressSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedAddressIndex((prev) =>
          prev < addressSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedAddressIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (
          selectedAddressIndex >= 0 &&
          addressSuggestions[selectedAddressIndex]
        ) {
          handleAddressSelect(addressSuggestions[selectedAddressIndex]);
        }
        break;
      case "Escape":
        setShowAddressSuggestions(false);
        setSelectedAddressIndex(-1);
        break;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validations with null checks
    if (!formData.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Skip address validation for Tap Payment
    if (gateway?.name !== "Tap Payment") {
      if (!formData.address?.trim()) {
        newErrors.address = "Address is required";
      }

      if (!formData.postalCode?.trim()) {
        newErrors.postalCode = "Postal code is required";
      }

      if (!formData.city?.trim()) {
        newErrors.city = "City is required";
      }

      if (!formData.country) {
        newErrors.country = "Country is required";
      }
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentClick = () => {
    // Always validate form first regardless of gateway type
    setIsSubmitted(true);

    if (!validateForm()) {
      toast.error("Please fix the errors before continuing");
      return;
    }

    // After validation passes, proceed with appropriate payment flow
    if (gateway?.name === "Tap Payment") {
      // For Tap Payment, trigger the SDK tokenization
      handleSubmit();
    } else {
      // For other gateways, directly call the API
      handleContinueToPayment();
    }
  };

  const handleContinueToPayment = async () => {
    console.log("handleContinueToPayment called");

    // For Tap Payment, we need the payment token
    if (gateway?.name === "Tap Payment" && !paymentResponse?.id) {
      console.log("Waiting for payment token...");
      return;
    }

    // For Tap Payment, only proceed if we're not already waiting
    // if (gateway?.name === "Tap Payment" && isWaitingForToken) {
    //   console.log("Still waiting for payment token...");
    //   return;
    // }

    // Check if form data is valid before making API call
    if (
      !formData.firstName?.trim() ||
      !formData.lastName?.trim() ||
      !formData.email?.trim()
    ) {
      console.log("Form data is incomplete, skipping API call");
      console.log("Form data:", formData);
      return;
    }

    setIsSubmitting(true);

    try {
      const token = sessionStorage.getItem("seller_token");
      const orderData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        address: formData.address,
        post_code: formData.postalCode,
        city: formData.city,
        country: formData.country,
        ...(gateway.name === "Tap Payment" && { token: paymentResponse?.id }),


      };

      const response = await fetch(
        `https://apipayment.sellhub.net/api/checkout/payment-api/${productId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data?.success) {
          // Calculate order details
          const productPrice = Number(product?.total_amount) || 0;
          const taxAmount = Number(tax) || 0;
          const totalAmount = productPrice + taxAmount;

          // Set success modal data
          setSuccessModalData({
            transactionId: data.transaction_id,
            amount: totalAmount,
            iframeUrl: data?.url,
            orderDetails: {
              productPrice,
              taxAmount,
              product: product,
              customer: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
              },
            },
          });
          if (gateway?.name === "Tap Payment") {
            setTransactionData({
              transactionId: data.transaction_id,
              discount: appliedCoupon?.discount,
            });
            setLoading1(true); // Reset loading state
            setShowSuccessModal(true);
            console.log("sadgsdgsadgdas", data);
            // checkPaymentStatus(data.transaction_id);
            // startPolling();
            toast.success(
              "Order created successfully! Checking payment status..."
            );
          } else {
            toast.success("Order created successfully!");
            navigate(`/auth/api-payment/${data.transaction_id}`, {
              state: {
                url: data.url,
                Ids: productId,
                discount: appliedCoupon?.discount,
                gateway: "Tap payment",
                email: formData.email,
                website: product?.user?.web_site,
                // gateway:gateway?.name
              },
              replace: true,
            });
          }

          console.log("Order created:", data);
        } else {
          toast.error(data.message || "Failed to create order");
        }
      } else {
        const errorData = await response.json();
        console.log("Payment error:", errorData);
        toast.error(errorData.error || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Payment status check function for Tap Payment
  const checkPaymentStatus = async (id) => {
    // Don't call API if no ID is provided
    const transactionId = id ?? transactionData?.transactionId;
    if (!transactionId) {
      console.log("No transaction ID available, skipping payment status check");
      return;
    }

    // Show loader immediately when API call starts
    setShowLoader(true);
    setLoaderStatus("processing");
    setPaymentMessage("Checking payment status...");

    try {
      // console.log("Checking payment status...");
      const token = sessionStorage.getItem("seller_token");

      const response = await fetch(
        `https://apipayment.sellhub.net/api/checkout/payment-check/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // console.log("Payment status check response:", data);
        if (
          data.status === true &&
          (data.payment_status === "Paid" || data.payment_status === "Approved")
        ) {
          // Navigate directly to success_url
          window.location.href = data.success_url;
        } else if (
          data.status === false &&
          (data.payment_status === "Declined" ||
            data.payment_status === "Failed")
        ) {
          // Navigate directly to back_website
          window.location.href = data.cancel_url;
        } else if (data.status === false && data.payment_status === "Pending") {
          setPaymentMessage("Payment is still being processed...");
          // Continue showing loader and polling
        } else {
          console.log("Unknown payment status:", data);
          setPaymentMessage("Payment is being processed, please wait...");
          // Continue showing loader and polling
        }
      } else {
        console.error("Payment status check failed:", response.status);
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    }
  };

  useEffect(() => {
    // Only start polling if we have a transaction ID
    if (transactionData?.transactionId) {
      intervalRef.current = setInterval(() => {
        setPollingAttempts((prev) => {
          const newAttempts = prev + 1;
          console.log("Polling attempt:", newAttempts);

          if (newAttempts >= maxPollingAttempts) {
            // Stop polling after max attempts
            console.log("Max polling attempts reached, stopping...");
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            setPaymentStatus("failed");
            setPaymentMessage("Payment check timeout. Please contact support.");
            setShowLoader(true);
            setLoaderStatus("processing");

            // Wait 3 seconds then navigate
            setTimeout(() => {
              setShowLoader(false);
              navigate("/auth/payment-declined", {
                state: {
                  orderId: transactionData?.transactionId,
                  email: formData.email,
                  totalAmount: calculateTotal(),
                  orderDate: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                  reason: "Payment check exceeded maximum time limit.",
                  details: null,
                },
                replace: true,
              });
            }, 3000);
            return prev;
          }

          // Call the API check function
          checkPaymentStatus();
          return newAttempts;
        });
      }, 20000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current); // cleanup on unmount
      }
    };
  }, [transactionData?.transactionId]); // Re-run when transactionData changes

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const calculateTotal = () => {
    const subtotal = Number(product?.total_amount || 0);
    const taxAmount = Number(tax || 0);
    return (subtotal + taxAmount).toFixed(2);
  };

  // Enhanced iframe event handling with multiple detection methods
  useEffect(() => {
    if (!showSuccessModal || !successModalData?.iframeUrl) return;

    const iframe = iframeRef.current;
    let urlCheckInterval;

    const handleIframeLoad = () => {
      console.log("Iframe loaded");
      setLoading1(false);
    };

    const handleIframeError = () => {
      console.log("Iframe error");
      setLoading1(false);
      toast.error("Failed to load payment page");
    };

    // Monitor iframe URL changes for success/failure
    const checkIframeUrl = () => {
      if (iframe) {
        try {
          const iframeUrl = iframe.contentWindow.location.href;
          console.log("Iframe URL check:", iframeUrl);

          // Check for success indicators in URL
          if (
            iframeUrl.includes("success") ||
            iframeUrl.includes("approved") ||
            iframeUrl.includes("completed") ||
            iframeUrl.includes("payment_success") ||
            iframeUrl.includes("transaction_success") ||
            iframeUrl.includes("success.html") ||
            iframeUrl.includes("success.php") ||
            iframeUrl.includes("payment_success.html") ||
            iframeUrl.includes("payment_success.php")
          ) {
            console.log("Success detected in iframe URL");
            setShowSuccessModal(false);
            // Call API to check payment status
            if (successModalData?.transactionId) {
              checkPaymentStatus(successModalData.transactionId);
            }
            // Clear interval since success was detected
            if (urlCheckInterval) {
              clearInterval(urlCheckInterval);
            }
          } else if (
            iframeUrl.includes("failed") ||
            iframeUrl.includes("declined") ||
            iframeUrl.includes("error") ||
            iframeUrl.includes("payment_failed") ||
            iframeUrl.includes("transaction_failed") ||
            iframeUrl.includes("cancelled") ||
            iframeUrl.includes("canceled") ||
            iframeUrl.includes("failed.html") ||
            iframeUrl.includes("failed.php") ||
            iframeUrl.includes("payment_failed.html") ||
            iframeUrl.includes("payment_failed.php")
          ) {
            console.log("Failure detected in iframe URL");
            setShowSuccessModal(false);
            toast.error("Payment was not successful");
            // Clear interval since failure was detected
            if (urlCheckInterval) {
              clearInterval(urlCheckInterval);
            }
          }
        } catch (error) {
          // Cross-origin restrictions may prevent access
          console.log("Cannot access iframe URL due to CORS:", error);
        }
      }
    };

    // Listen for postMessage events from iframe
    const handleMessage = (event) => {
      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        console.log("Received message from iframe:", data);

        if (
          data.status === "SUCCESS" ||
          data.payment_status === "SUCCESS" ||
          data.result === "SUCCESS"
        ) {
          console.log("Success message received from iframe");
          setShowSuccessModal(false);
          if (successModalData?.transactionId) {
            checkPaymentStatus(successModalData.transactionId);
          }
        } else if (
          data.status === "failed" ||
          data.payment_status === "failed" ||
          data.result === "failed"
        ) {
          console.log("Failure message received from iframe");
          setShowSuccessModal(false);
          toast.error("Payment was not successful");
        }
      } catch (error) {
        console.error("Error parsing iframe message:", error);
      }
    };

    if (iframe) {
      iframe.addEventListener("load", handleIframeLoad);
      iframe.addEventListener("error", handleIframeError);
    }

    window.addEventListener("message", handleMessage);

    // Check iframe URL periodically (more frequent for better detection)
    urlCheckInterval = setInterval(checkIframeUrl, 1000);

    return () => {
      if (iframe) {
        iframe.removeEventListener("load", handleIframeLoad);
        iframe.removeEventListener("error", handleIframeError);
      }
      window.removeEventListener("message", handleMessage);
      if (urlCheckInterval) {
        clearInterval(urlCheckInterval);
      }
    };
  }, [showSuccessModal, successModalData, checkPaymentStatus]);

  const toggleSellerDetails = () => {
    setShowSellerDetails(!showSellerDetails);
  };

  // Close address suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowAddressSuggestions(false);
      setSelectedAddressIndex(-1);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (loading) {
    return (
      // <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden">
        {/* Background Gradient Layer */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "linear-gradient(to bottom right, black, #0d0c10, black)",
          }}
        ></div>

        {/* Content Centered */}
        <div className="z-10 text-center space-y-6">
          {/* Spinner */}
          <div className="relative mx-auto w-20 h-20">
            <div className="w-full h-full border-4 border-gray-800 border-t-yellow-500 rounded-full animate-spin"></div>
            <div
              className="absolute inset-0 border-4 border-transparent border-t-yellow-400 rounded-full animate-spin"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>

          {/* Loading Text */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-yellow-100">
              Loading your order...
            </h3>
            <p className="text-gray-400">
              Please wait while we fetch your product details
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden">
        {/* Gold mirror shimmer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black-900/10 to-black-600/20 opacity-70 blur-2xl pointer-events-none" />

        {/* Main content */}
        <div className="relative z-10 p-6 w-full max-w-md bg-gradient-to-b from-[#1a1a1a] to-black border border-yellow-900/50 rounded-2xl shadow-[0_0_60px_rgba(255,215,0,0.1)] text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-yellow-900/30 shadow-inner shadow-yellow-800/50">
            <AlertCircle className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_6px_#FFD700]" />
          </div>

          {/* Title */}
          <h2 className="text-yellow-300 text-xl font-bold mb-3 drop-shadow-[0_0_4px_#FACC15]">
            Product Out of Stock
          </h2>

          {/* Subtitle (optional message) */}
          <p className="text-white-400 mb-6 text-sm">
            This product is currently unavailable. Try checking back later.
          </p>

          {/* Button */}
          <button
            onClick={() => (window.location.href = "https://www.youtube.com/")}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 shadow-md hover:shadow-lg transition duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-yellow-900 to-black flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="relative">
            <div className="w-20 h-20 bg-yellow-900/50 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-yellow-100">
              {productId === "default"
                ? "Welcome to Checkout"
                : "Product not found"}
            </h2>
            <p className="text-gray-400">
              {productId === "default"
                ? "Please provide a valid product ID to continue"
                : "The requested product could not be found"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black-900 to-black relative overflow-hidden">
      {/* Animated Background Effects */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-black to-black"
        style={{
          backgroundImage:
            "linear-gradient(to bottom right, black, #0d0c10, black)",
        }}
      >
        {" "}
        {/* Gold gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#121415]/10 via-transparent to-black/5"></div>
        {/* Animated particles effect */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-black-400/30 rounded-full animate-pulse"></div>
          <div
            className="absolute top-1/3 right-1/3 w-1 h-1 bg-black-500/40 rounded-full animate-ping"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-black-300/20 rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 right-1/4 w-1 h-1 bg-black-400/25 rounded-full animate-ping"
            style={{ animationDelay: "3s" }}
          ></div>
        </div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 215, 0, 0.1) 1px, transparent 0)`,
              backgroundSize: "20px 20px",
            }}
          ></div>
        </div>
      </div>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Transparent overlay with blur effect */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

          {/* Loading content */}
          <div className="relative z-10 text-center space-y-6">
            {/* Animated Spinner */}
            <div className="relative mx-auto w-24 h-24">
              {/* Outer ring */}
              <div className="w-full h-full border-4 border-gray-800 border-t-yellow-500 rounded-full animate-spin"></div>
              {/* Inner ring */}
              <div
                className="absolute inset-2 border-4 border-transparent border-t-yellow-400 rounded-full animate-spin"
                style={{ animationDelay: "0.5s" }}
              ></div>
              {/* Center dot */}
              <div className="absolute inset-4 bg-yellow-500 rounded-full animate-pulse"></div>
            </div>

            {/* Loading Text */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-yellow-100 animate-pulse">
                Processing Payment...
              </h3>
              <p className="text-gray-300 text-lg">
                Please wait while we process your order
              </p>
            </div>

            {/* Additional animated elements */}
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Header with progress indicator */}
      <div className="bg-black/90 backdrop-blur-sm sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-around">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 animate-pulse opacity-50"></div>
                  <Shield className="w-5 h-5 text-white relative z-10" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-yellow-100">
                    Secure Checkout
                  </h1>
                  <p className="text-sm text-gray-400">
                    Complete your purchase safely
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-400">
              <CheckCircle className="w-4 h-4 text-yellow-400" />
              <span>SSL Secured</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Main Checkout Form - Takes 1/2 of the space */}
          <div className="xl:col-span-1 space-y-4">
            {/* Customer Information Card */}
            <div className="rounded-xl shadow-lg p-0 relative z-10 w-full">
              <div className="flex items-center space-x-3 mb-3">
                {/* <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 animate-pulse opacity-30"></div>
                  <User className="w-5 h-5 text-white relative z-10" />
                </div> */}
                <div>
                  <h2 className="text-lg font-medium text-white-100">
                    Customer Information
                  </h2>
                  {/* <p className="text-sm text-gray-400">
                    Tell us about yourself
                  </p> */}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <User className="w-4 h-4 text-yellow-500" />
                    </div>
                    <Input
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className={`h-11 pl-10 bg-[rgb(24_24_27)] border border-[rgb(39_39_42)] text-yellow-100 placeholder:text-gray-500 transition-all duration-300 hover:border-yellow-500/50 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 ${
                        isSubmitted && errors.firstName
                          ? "border-red-400 focus:border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  {isSubmitted && errors.firstName && (
                    <div className="flex items-center space-x-1 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.firstName}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <User className="w-4 h-4 text-yellow-500" />
                    </div>
                    <Input
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className={`h-11 pl-10 bg-[rgb(24_24_27)] border border-[rgb(39_39_42)] text-yellow-100 placeholder:text-gray-500 transition-all duration-300 hover:border-yellow-500/50 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 ${
                        isSubmitted && errors.lastName
                          ? "border-red-400 focus:border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  {isSubmitted && errors.lastName && (
                    <div className="flex items-center space-x-1 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.lastName}</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Mail className="w-4 h-4 text-yellow-500" />
                    </div>
                    <Input
                      placeholder="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`h-11 pl-10 bg-[rgb(24_24_27)] border border-[rgb(39_39_42)] text-yellow-100 placeholder:text-gray-500 transition-all duration-300 hover:border-yellow-500/50 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 ${
                        isSubmitted && errors.email
                          ? "border-red-400 focus:border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  {isSubmitted && errors.email && (
                    <div className="flex items-center space-x-1 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Billing Address Card */}
            {gateway?.name !== "Tap Payment" && (
              <div className="bg-[rgb(24_24_27/_0.5)] backdrop-blur-sm rounded-xl shadow-lg p-4 relative z-10 w-full">
                <div className="flex items-center space-x-3 mb-3">
                  {/* <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 animate-pulse opacity-30"></div>
                    <MapPin className="w-5 h-5 text-white relative z-10" />
                  </div> */}
                  <div>
                    <h2 className="text-lg font-medium text-white-100">
                      Billing Address
                    </h2>
                    {/* <p className="text-sm text-gray-400">
                      Where should we send your order?
                    </p> */}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <MapPin className="w-4 h-4 text-yellow-500" />
                      </div>
                      <Input
                        placeholder="Street Address"
                        value={formData.address}
                        onChange={(e) =>
                          handleAddressInputChange(e.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                          // Only show suggestions if address hasn't been selected
                          if (!addressSelected) {
                            setShowAddressSuggestions(true);
                          }
                        }}
                        className={`h-11 pl-10 bg-[rgb(24_24_27)] border border-[rgb(39_39_42)] text-yellow-100 placeholder:text-gray-500 transition-all duration-300 hover:border-yellow-500/50 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 pr-10 ${
                          isSubmitted && errors.address
                            ? "border-red-400 focus:border-red-500"
                            : ""
                        } ${showAddressSuggestions ? "border-yellow-500" : ""}`}
                      />
                      {addressLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Loader2 className="w-5 h-5 animate-spin text-yellow-500" />
                        </div>
                      )}
                    </div>

                    {showAddressSuggestions &&
                      addressSuggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-black/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                          {addressSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className={`px-4 py-3 cursor-pointer hover:bg-gray-900/50 transition-colors ${
                                index === selectedAddressIndex
                                  ? "bg-gray-900/50"
                                  : ""
                              }`}
                              onClick={() => handleAddressSelect(suggestion)}
                            >
                              <div className="flex items-center space-x-3">
                                <MapPin className="w-4 h-4 text-yellow-500" />
                                <span className="text-yellow-200">
                                  {suggestion.display}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    {isSubmitted && errors.address && (
                      <div className="flex items-center space-x-1 text-red-400 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <MapPin className="w-4 h-4 text-yellow-500" />
                        </div>
                        <Input
                          placeholder="Postal Code"
                          value={formData.postalCode}
                          onChange={(e) =>
                            handleInputChange("postalCode", e.target.value)
                          }
                          className={`h-11 pl-10 bg-[rgb(24_24_27)] border border-[rgb(39_39_42)] text-yellow-100 placeholder:text-gray-500 transition-all duration-300 hover:border-yellow-500/50 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 ${
                            isSubmitted && errors.postalCode
                              ? "border-red-400 focus:border-red-500"
                              : ""
                          }`}
                        />
                      </div>
                      {isSubmitted && errors.postalCode && (
                        <div className="flex items-center space-x-1 text-red-400 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.postalCode}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Building className="w-4 h-4 text-yellow-500" />
                        </div>
                        <Input
                          placeholder="City"
                          value={formData.city}
                          onChange={(e) =>
                            handleInputChange("city", e.target.value)
                          }
                          className={`h-11 pl-10 bg-[rgb(24_24_27)] border border-[rgb(39_39_42)] text-yellow-100 placeholder:text-gray-500 transition-all duration-300 hover:border-yellow-500/50 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 ${
                            isSubmitted && errors.city
                              ? "border-red-400 focus:border-red-500"
                              : ""
                          }`}
                        />
                      </div>
                      {isSubmitted && errors.city && (
                        <div className="flex items-center space-x-1 text-red-400 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.city}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                        <Globe className="w-4 h-4 text-yellow-500" />
                      </div>
                      <Select
                        value={formData.country}
                        onValueChange={(value) =>
                          handleInputChange("country", value)
                        }
                        disabled={countriesLoading}
                      >
                        <SelectTrigger
                          className={`h-11 pl-10 bg-[rgb(24_24_27)] border border-[rgb(39_39_42)] text-yellow-100 transition-all duration-300 hover:border-yellow-500/50 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 ${
                            isSubmitted && errors.country
                              ? "border-red-400 focus:border-red-500"
                              : ""
                          } ${countriesLoading ? "opacity-50" : ""}`}
                        >
                          <SelectValue
                            placeholder={
                              countriesLoading
                                ? "Loading countries..."
                                : "Select Country"
                            }
                          />
                        </SelectTrigger>

                        <SelectContent className="bg-black/95 backdrop-blur-sm border border-gray-700">
                          {countriesLoading || countries.length === 0 ? null : (
                            <>
                              {countriesError && (
                                <div className="px-3 py-2 text-yellow-400 text-sm">
                                  Using fallback countries (API unavailable)
                                </div>
                              )}
                              {countries.map((country) => (
                                <SelectItem
                                  key={country.id}
                                  value={country.name}
                                >
                                  {country.name}
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {isSubmitted && errors.country && (
                      <div className="flex items-center space-x-1 text-red-400 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.country}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {(gateway?.name === "Tap Payment" || !gateway?.name) && (
              <div className="bg-[rgb(24_24_27/_0.5)] backdrop-blur-sm rounded-xl shadow-lg p-4 relative z-10 w-full">
                <div className="flex items-center space-x-3 mb-3">
                  <div>
                    <h2 className="text-lg font-medium text-white-100">
                      Payment Details
                    </h2>
                  </div>
                </div>

                {/* Payment Status Indicator for Tap Payment */}
                {gateway?.name === "Tap Payment" && isPolling && (
                  <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                      <span className="text-sm text-yellow-200">
                        Checking payment status... (Attempt{" "}
                        {pollingAttempts + 1}/{maxPollingAttempts})
                      </span>
                    </div>
                    {paymentMessage && (
                      <p className="text-xs text-yellow-300 mt-1">
                        {paymentMessage}
                      </p>
                    )}
                  </div>
                )}

                <TapPayment
                  onSuccessTap={handleSubmit}
                  setPaymentResponse={setPaymentResponse}
                  onPaymentSuccess={handleContinueToPayment}
                  amount={calculateTotal()}
                />
              </div>
            )}

            {/* Terms and Conditions */}
            <div className=" rounded-xl shadow-lg p-4 relative z-10 w-full">
              <div className="flex items-start space-x-4">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) =>
                    handleInputChange("agreeToTerms", checked)
                  }
                  className={`mt-1 border-2 rounded 
${
  isSubmitted && errors.agreeToTerms
    ? "border-red-500"
    : formData.agreeToTerms
      ? "border-yellow-500"
      : "border-gray-600"
}
data-[state=checked]:bg-yellow-500 
data-[state=checked]:text-black
`}
                />
                <div className="flex-1">
                  <label
                    htmlFor="terms"
                    className="text-xs text-yellow-200 leading-relaxed"
                  >
                    I agree to the{" "}
                    <span className="text-yellow-400 cursor-pointer hover:underline font-medium">
                      terms and conditions
                    </span>{" "}
                    and{" "}
                    <span className="text-yellow-400 cursor-pointer hover:underline font-medium">
                      privacy policy
                    </span>
                  </label>
                  {isSubmitted && errors.agreeToTerms && (
                    <div className="flex items-center space-x-1 text-red-400 text-xs mt-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.agreeToTerms}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Continue to Payment Button */}
            <div className="sticky bottom-6 rounded-xl p-2 shadow-2xl mr-5 ">
              <Button
                onClick={handlePaymentClick}
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-[#f4b72d] to-[#f4b72d] hover:from-[#d89c18] hover:to-[#c58910] text-black text-sm font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Processing your order...
                  </>
                ) : (
                  <>
                    <Lock className="w-8 h-8 mr-3" />
                    Continue to Payment
                  </>
                )}
              </Button>

             
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="xl:col-span-1">
            <div className="sticky top-24 space-y-4 w-full">
             

              {/* Order Summary Card */}
              <div className="bg-[rgb(24_24_27/_0.5)] backdrop-blur-sm rounded-xl shadow-lg p-4 relative z-10 w-full">
                <div className="flex items-center space-x-3 mb-4">
                  {/* <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 animate-pulse opacity-30"></div>
                    <FileText className="w-4 h-4 text-white relative z-10" />
                  </div> */}
                  <h3 className="text-lg font-medium text-white-100">
                    Order Summary
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#A1A1AA] font-medium">Product</span>
                    <span className="text-[#A1A1AA] font-medium">
                      {product?.product_title ?? ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#A1A1AA] font-medium">Subtotal</span>
                    <span className="text-[#A1A1AA] font-medium">
                      ${Number(product?.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#A1A1AA] font-medium">Tax</span>
                    <span className="text-[#A1A1AA] font-medium">
                      ${tax?.toFixed(2) || "0.00"}
                    </span>
                  </div>

                  <div className="border-t border-gray-700 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-md font-medium text-white-100">
                        Total
                      </span>
                      <span className="text-md font-bold text-white-100">
                        ${calculateTotal()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seller Information */}
              {product && (
                <div className="bg-[rgb(24_24_27/_0.5)] backdrop-blur-sm rounded-xl shadow-lg p-2 relative z-10 w-full">
                  <div
                    className="flex items-center justify-between cursor-pointer  p-2 rounded-lg transition-all duration-300"
                    onClick={toggleSellerDetails}
                  >
                    <div className="flex items-center space-x-3">
                      {/* <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 animate-pulse opacity-30"></div>
                        <FileText className="w-4 h-4 text-white relative z-10" />
                      </div> */}
                      <span className="font-medium text-white-100">
                        View Seller Details
                      </span>
                    </div>
                    {showSellerDetails ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 transition-transform" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 transition-transform" />
                    )}
                  </div>

                  {showSellerDetails && (
                    <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                      {product?.user?.web_site && (
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-400">
                            Web Site:
                          </span>
                          {/* <a
                            href={`${
                              product.user.web_site.startsWith("http://") ||
                              product.user.web_site.startsWith("https://")
                                ? product.user?.web_site
                                : `https://${product?.user?.web_site}`
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-yellow-400 hover:underline"
                          >
                            {product?.user?.web_site}
                          </a> */}
                          {/* <a
                            href={`${product.user.web_site}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-yellow-400 hover:underline"
                          >
                           {product.user.web_site}
                          </a> */}
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-400">
                          Vendor name:
                        </span>
                        <span className="text-sm text-yellow-200">
                          {product?.first_name} {product?.last_name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-400">Email:</span>
                        <span className="text-sm text-yellow-200">
                          {product?.email}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Iframe Overlay */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          {/* Loading Overlay */}
          {loading1 && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 rounded-[15px]">
              <div className="text-center space-y-4">
                <div className="relative mx-auto w-16 h-16">
                  <div className="w-full h-full border-4 border-gray-800 border-t-yellow-500 rounded-full animate-spin"></div>
                  <div
                    className="absolute inset-2 border-4 border-transparent border-t-yellow-400 rounded-full animate-spin"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                </div>
                <p className="text-yellow-100 text-lg">
                  Loading payment page...
                </p>
              </div>
            </div>
          )}

          {/* Iframe Container */}
          <div className="w-full max-w-4xl h-[60vh] bg-black rounded-[15px] border border-yellow-500/20 shadow-2xl overflow-hidden">
            {successModalData?.iframeUrl && (
              <iframe
                id="paymentIframe"
                ref={iframeRef}
                src={successModalData?.iframeUrl}
                className="w-full h-full border-0 bg-black"
                title="Payment"
                sandbox="allow-forms allow-modals allow-popups-to-escape-sandbox allow-popups allow-scripts allow-top-navigation allow-same-origin"
                onLoad={() => {
                  console.log("Iframe onLoad triggered");
                  setLoading1(false);
                }}
                onError={() => {
                  console.log("Iframe onError triggered");
                  setLoading1(false);
                  toast.error("Failed to load payment page");
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
