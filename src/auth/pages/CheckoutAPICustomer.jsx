import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreditCard,
  Shield,
  Apple,
  ChevronDown,
  FileText,
  User,
  ChevronUp,
  Building,
  ExternalLink,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Zap,
  Globe,
  Phone,
  Mail,
  MapPin,
  Star,
  Truck,
  Gift,
  XCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { RiGoogleFill } from "@remixicon/react";
import { toast } from "sonner";
import FailureModal from "./FailureModal";
import PaymentLoader from "./PaymentLoader";
import { GoSell } from "@tap-payments/gosell";
import TapPayment from "./TapPayment";

export default function CheckoutAPICustomer() {
  // Get ID from URL parameters
  const { id } = useParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const intervalRef = useRef(null); // to store interval ID

  // Get navigation state data
  const location = useLocation();
  const navigationData = location.state;
  const [product, setProduct] = useState(null);
  console.log("SDgasdgsadgsad", product);
  const [tax, setTax] = useState(0);
  const [gateway, setGateway] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkLoading, setCheckLoader] = useState(false);
  const cardRef = useRef(null);

  // Payment status states
  const [paymentStatus, setPaymentStatus] = useState("processing"); // processing, success, failed
  const [paymentMessage, setPaymentMessage] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const [maxPollingAttempts] = useState(150); // 5 minutes (150 * 2 seconds)

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Loader states
  const [showLoader, setShowLoader] = useState(false);
  const [loaderStatus, setLoaderStatus] = useState("processing");

  // State for transaction data
  const [transactionData, setTransactionData] = useState({
    transactionId: id,
    url: navigationData?.url || null,
    Ids: navigationData?.Ids || null,
    discount: navigationData?.discount || null,
    gateway: navigationData?.gateway || null,
    email: navigationData?.email || null,
    website: navigationData?.website || null,
    // Add other transaction data as needed
  });

  console.log("SDahasdfhga", transactionData);

  // State for iframe blocking detection
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    if (navigationData) {
      setTransactionData((prevData) => ({
        ...prevData,
        url: navigationData.url || null,
        Ids: navigationData.Ids || null,
        discount: navigationData.discount || null,
        gateway: navigationData.gateway || null,
        website: navigationData.website || null,
        email:navigationData?.email
      }));
    }
  }, [navigationData]);

  // Function to get proxy URL for iframe
  const getProxyUrl = (originalUrl) => {
    if (!originalUrl) return null;

    try {
      const url = new URL(originalUrl);

      // Handle Telr payment gateway specifically
      if (
        url.hostname.includes("telr.com") ||
        url.hostname.includes("secure.telr.com")
      ) {
        return `/telr-proxy${url.pathname}${url.search}`;
      }

      // If it's from the payment API, use our proxy
      if (
        url.hostname.includes("sellhub.net") ||
        url.hostname.includes("payment")
      ) {
        return `/payment-gateway${url.pathname}${url.search}`;
      }

      // For any other payment gateway, use the generic proxy
      if (url.protocol === "https:") {
        return `/gateway-proxy${url.pathname}${url.search}`;
      }

      return originalUrl;
    } catch (error) {
      console.error("Error parsing URL:", error);
      return originalUrl;
    }
  };

  // Function to try different URL strategies
  const tryDifferentUrlStrategies = () => {
    if (!transactionData?.url) return;

    const iframe = document.getElementById("paymentFrame");
    if (!iframe) return;

    const strategies = [
      transactionData.url, // Original URL
      getProxyUrl(transactionData.url), // Proxy URL
      transactionData.url.replace("https://", "/gateway-proxy/"), // Generic proxy
    ].filter(Boolean);

    let currentStrategyIndex = 0;

    const tryNextStrategy = () => {
      if (currentStrategyIndex < strategies.length) {
        console.log(
          `Trying strategy ${currentStrategyIndex + 1}:`,
          strategies[currentStrategyIndex]
        );
        iframe.src = strategies[currentStrategyIndex];
        currentStrategyIndex++;

        // Try next strategy after 3 seconds if current one fails
        setTimeout(() => {
          if (iframeBlocked || iframeError) {
            tryNextStrategy();
          }
        }, 3000);
      } else {
        console.log("All strategies exhausted");
        setIframeBlocked(true);
        setIframeLoading(false);
      }
    };

    tryNextStrategy();
  };

  // Function to handle iframe loading with multiple strategies
  const handleIframeLoad = () => {
    console.log("Iframe loaded successfully");
    setIframeLoading(false);
    setIframeError(false);
    setIframeBlocked(false);
  };

  // Function to handle iframe errors
  const handleIframeError = () => {
    console.error("Iframe failed to load");
    setIframeLoading(false);
    setIframeError(true);
    setIframeBlocked(true);
  };

  // Initialize iframe with strategy system
  useEffect(() => {
    if (transactionData?.url) {
      setIframeLoading(true);
      setIframeError(false);
      setIframeBlocked(false);

      // Start with the strategy system
      setTimeout(() => {
        tryDifferentUrlStrategies();
      }, 1000); // Small delay to ensure DOM is ready
    }
  }, [transactionData?.url]);

  // Function to open payment gateway in new tab
  const openInNewTab = () => {
    if (transactionData?.url) {
      window.open(transactionData.url, "_blank", "noopener,noreferrer");
    }
  };

  // console.log("sdgsadgasdg", transactionData);

  // State for card form
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    saveCard: false,
  });

  const [showSellerDetails, setShowSellerDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Log the received data for debugging
  useEffect(() => {
    console.log("Transaction ID from URL:", id);
    console.log("Navigation state data:", navigationData);
    console.log("Transaction data:", transactionData);
  }, [id, navigationData, transactionData]);

  useEffect(() => {
    // Fetch product details based on ID
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = sessionStorage.getItem("seller_token");

        const response = await fetch(
          `https://apipayment.sellhub.net/api/checkout/payment-api-info/${transactionData?.Ids}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // console.log("API Response:", data);

          if (data?.success && data?.payment_data) {
            setProduct(data?.payment_data);

            setTax(data.tax || 0);
            setGateway(data.gateway);
            localStorage.setItem("productData", JSON.stringify(data.payment_data));
            localStorage.setItem("tax", JSON.stringify(data.tax || 0));
            localStorage.setItem("gateway", JSON.stringify(data.gateway));
            localStorage.setItem(
              "discount",
              JSON.stringify(transactionData?.discount)
            );
          } else {
            setError("Product data not found");
          }
        } else if (response.status === 404) {
          setError("Product not found");
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

    if (transactionData?.Ids) {
      fetchProduct();
    }
  }, [transactionData?.Ids]);



  const calculateTotal = () => {
    const subtotal = Number(product?.total_amount || 0);
    const taxAmount = Number(tax || 0);
    return (subtotal + taxAmount).toFixed(2);
  };



  // Handle iframe messages
  useEffect(() => {
    const handleIframeMessage = async (event) => {
      console.log("Received iframe message:", event.data);

      // Check if the message is from the payment gateway
      if (event.origin !== window.location.origin) {
        console.log("Message from external origin:", event.origin);
      }

      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        // Handle different payment statuses
        if (data.status === "success" || data.result === "success") {
          setPaymentStatus("success");
          setPaymentMessage("Payment completed successfully!");
          toast.success("Payment completed successfully!");

          // Call success API
          // await handlePaymentSuccess(data);
        } else if (
          data.status === "failed" ||
          data.result === "failed" ||
          data.error
        ) {
          setPaymentStatus("failed");
          setPaymentMessage(
            data.message || "Payment failed. Please try again."
          );
          toast.error(data.message || "Payment failed. Please try again.");
        } else if (data.status === "cancelled" || data.result === "cancelled") {
          setPaymentStatus("failed");
          setPaymentMessage("Payment was cancelled.");
          toast.error("Payment was cancelled.");
        } else if (data.status === "pending" || data.result === "pending") {
          setPaymentStatus("processing");
          setPaymentMessage("Payment is being processed...");
        } else if (
          data.status === "submitted" ||
          data.result === "submitted" ||
          data.type === "payment_submitted"
        ) {
          // Show loader and start polling when payment is submitted
          setShowLoader(true);
          setLoaderStatus("processing");
          setPaymentStatus("processing");
          setPaymentMessage("Payment submitted. Checking status...");
          startPolling();
        } else if (
          data.status === "processing" ||
          data.result === "processing" ||
          data.type === "payment_processing"
        ) {
          // Show loader when payment is being processed
          setShowLoader(true);
          setLoaderStatus("processing");
          setPaymentStatus("processing");
          setPaymentMessage("Payment is being processed...");
        } else if (
          data.status === "verifying" ||
          data.result === "verifying" ||
          data.type === "payment_verifying"
        ) {
          // Update loader status when verifying
          setLoaderStatus("verifying");
          setPaymentStatus("processing");
          setPaymentMessage("Verifying payment with bank...");
        } else {
          console.log("Unknown payment status:", data);
        }
      } catch (error) {
        console.error("Error parsing iframe message:", error);
      }
    };

    // Add event listener for iframe messages
    window.addEventListener("message", handleIframeMessage);

    // Cleanup
    return () => {
      window.removeEventListener("message", handleIframeMessage);
    };
  }, []);

  // Polling function to check payment status
  const checkPaymentStatus = async () => {
    try {
      // console.log("Checking payment status...");
      const token = sessionStorage.getItem("seller_token");

      const response = await fetch(
        `https://apipayment.sellhub.net/api/checkout/payment-check/${transactionData?.transactionId}`,
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
        console.log("asdgasdgasdg",data);
        if (
          data.status === true &&
          (data.payment_status === "Paid" || data.payment_status === "Approved")
        ) {
          // Navigate directly to success_url
          window.location.href = data.success_url;
        } 
        else if (
          data.status === false &&
          (data.payment_status === "Declined" || data.payment_status === "Failed")
        ) {
          // Navigate directly to back_website
          window.location.href = data?.cancel_url;
        } else if (data.status === false && data.payment_status === "Pending") {
          setPaymentMessage("Payment is still being processed...");
        } else {
          console.log("Unknown payment status:", data);
        }
      } else {
        console.error("Payment status check failed:", response.status);
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    }
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      checkPaymentStatus();
    }, 2000);

    return () => clearInterval(intervalRef.current); // cleanup on unmount
  }, []);
  // Start polling
  const startPolling = () => {
    console.log("Starting payment status polling...");
    setIsPolling(true);
    setPollingAttempts(0);

    // Initial check
    checkPaymentStatus();

    // Set up interval
    pollingIntervalRef.current = setInterval(() => {
      setPollingAttempts((prev) => {
        const newAttempts = prev + 1;
        console.log("Polling attempt:", newAttempts);

        if (newAttempts >= maxPollingAttempts) {
          // Stop polling after max attempts
          console.log("Max polling attempts reached, stopping...");
          stopPolling();
          setPaymentStatus("failed");
          setPaymentMessage("Payment check timeout. Please contact support.");

          // Show loader in iframe area for 3 seconds
          setShowLoader(true);
          setLoaderStatus("processing");

          // Wait 3 seconds then navigate
          setTimeout(() => {
            setShowLoader(false);
            navigate("/payment-declined", {
              state: {
                orderId: transactionData?.transactionId,
                email: "suraj@mailinator.com",
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
    }, 2000); // Check every 2 seconds
  };

  // Stop polling
  const stopPolling = () => {
    console.log("Stopping payment status polling...");
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  // Auto open Tap LightBox when gateway is Tap payment
  useEffect(() => {
    if (transactionData?.gateway === "Tap payment") {
      // Small delay to ensure GoSell is loaded
      const timer = setTimeout(() => {
        try {
          GoSell.openLightBox();
          // Enable scrolling on body when LightBox opens
          document.body.style.overflow = "auto";
          document.body.style.position = "static";
        } catch (error) {
          console.log("GoSell not ready yet, retrying...");
          // Retry after a longer delay
          setTimeout(() => {
            try {
              GoSell.openLightBox();
              // Enable scrolling on body when LightBox opens
              document.body.style.overflow = "auto";
              document.body.style.position = "static";
            } catch (error) {
              console.error("Failed to open Tap LightBox:", error);
            }
          }, 1000);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [transactionData?.gateway]);

  // Handle scroll restoration when component unmounts or gateway changes
  useEffect(() => {
    return () => {
      // Restore normal scrolling when component unmounts
      document.body.style.overflow = "auto";
      document.body.style.position = "static";
    };
  }, [transactionData?.gateway]);

  // Handle Tap LightBox scroll issues
  useEffect(() => {
    if (transactionData?.gateway === "Tap payment") {
      // Function to handle scroll when Tap LightBox is open
      const handleTapScroll = () => {
        // Check if Tap LightBox overlay exists
        const tapOverlay =
          document.querySelector(".gosell-overlay") ||
          document.querySelector('[class*="gosell"]') ||
          document.querySelector('[class*="lightbox"]');

        if (tapOverlay) {
          // Enable scrolling on the main page
          document.body.style.overflow = "auto";
          document.body.style.position = "static";

          // Remove any fixed positioning that might block scrolling
          const mainContainer = document.querySelector(".min-h-screen");
          if (mainContainer) {
            mainContainer.style.position = "relative";
            mainContainer.style.overflow = "auto";
          }
        }
      };

      // Set up interval to check for Tap overlay
      const interval = setInterval(handleTapScroll, 1000);

      // Also handle on window scroll
      window.addEventListener("scroll", handleTapScroll);

      return () => {
        clearInterval(interval);
        window.removeEventListener("scroll", handleTapScroll);
        // Restore normal scrolling
        document.body.style.overflow = "auto";
        document.body.style.position = "static";
      };
    }
  }, [transactionData?.gateway]);

  // Handle payment success API call

  const handleInputChange = (field, value) => {
    setCardData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const months = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];

  const years = Array.from({ length: 10 }, (_, i) =>
    (new Date().getFullYear() + i).toString()
  );

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (value) => {
    const formatted = formatCardNumber(value);
    handleInputChange("cardNumber", formatted);
  };

  const handlePaymentProcessing = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
    }, 3000);
  };



  // Get payment status icon and color
  const getPaymentStatusInfo = () => {
    switch (paymentStatus) {
      case "success":
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-green-400" />,
          color: "text-green-400",
          bgColor: "bg-green-900/50",
          borderColor: "border-green-600",
        };
      case "failed":
        return {
          icon: <XCircle className="w-4 h-4 text-red-400" />,
          color: "text-red-400",
          bgColor: "bg-red-900/50",
          borderColor: "border-red-600",
        };
      default:
        return {
          icon: <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />,
          color: "text-blue-400",
          bgColor: "bg-blue-900/50",
          borderColor: "border-blue-600",
        };
    }
  };

  const statusInfo = getPaymentStatusInfo();



  useEffect(() => {
    const handleMessage = (event) => {
      // You can add event.origin check here for security
      const { data } = event;

      console.log("adgdasgsdagsda", data);

      if (data === "payment_success") {
        console.log("suuuuuuuces");
        // setPaymentSuccess(true);
        // setPaymentStatus("success");
        // setPaymentMessage("Payment successful!");
      } else if (data === "payment_failed") {
        console.log("faaaaaailed");
        // setPaymentSuccess(false);
        // setPaymentStatus("failed");
        // setPaymentMessage("Payment failed.");
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-black via-black-900 to-black relative overflow-y-auto"
      style={{
        position: "relative",
        overflow: "auto",
        zIndex: 1,
      }}
    >
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
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/10 via-transparent to-yellow-600/5"></div>
        {/* Animated particles effect */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400/30 rounded-full animate-pulse"></div>
          <div
            className="absolute top-1/3 right-1/3 w-1 h-1 bg-yellow-500/40 rounded-full animate-ping"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-yellow-300/20 rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 right-1/4 w-1 h-1 bg-yellow-400/25 rounded-full animate-ping"
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

      {/* Header with progress indicator */}
      <div className="bg-black/90 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-around">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 animate-pulse opacity-50"></div>
                  <CreditCard className="w-5 h-5 text-white relative z-10" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-yellow-100">
                    Secure Payment
                  </h1>
                  <p className="text-sm text-gray-400">
                    Complete your transaction safely
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-400">
              <Shield className="w-4 h-4 text-yellow-400" />
              <span>SSL Secured</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Main Payment Form - Takes 2/3 of the space */}
          <div className="xl:col-span-1 space-y-5">
            {/* Transaction Status Card */}
            <div className="bg-[rgb(24,24,27,0.5)] rounded-[10px] backdrop-blur-sm shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              <div className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 animate-pulse opacity-30"></div>
                      <Zap className="w-4 h-4 text-white relative z-10" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white-100">
                        Payment Processing
                      </h2>
                      <p className="text-sm text-gray-400">
                        Transaction ID:{" "}
                        {transactionData?.transactionId || "N/A"}
                      </p>
                      {paymentMessage && (
                        <p className={`text-sm mt-1 ${statusInfo.color}`}>
                          {paymentMessage}
                        </p>
                      )}
                      {isPolling && (
                        <p className="text-sm mt-1 text-yellow-400">
                          Checking status... (Attempt {pollingAttempts}/
                          {maxPollingAttempts})
                        </p>
                      )}
                    </div>
                  </div>
                  {/* <Badge
                    variant="outline"
                    className={`text-xs ${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.borderColor}`}
                  >
                    {statusInfo.icon}
                    <span className="ml-1">
                      {paymentStatus === "success"
                        ? "Success"
                        : paymentStatus === "failed"
                          ? "Failed"
                          : "Processing"}
                    </span>
                  </Badge> */}
                </div>
              </div>
            </div>

            {/* Express Checkout Buttons */}
            {/* <div className="bg-[rgb(24,24,27,0.5)] backdrop-blur-sm rounded-[10px] shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              <div className="p-6 relative z-10">
              

                <div className="space-y-4">
                  <Button
                    className="w-full bg-black text-white hover:bg-gray-800 h-14 text-base font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    onClick={handlePaymentProcessing}
                    disabled={isProcessing || paymentStatus === "success"}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Apple className="w-5 h-5 mr-3" />
                        Buy with Apple Pay
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-white text-black hover:bg-gray-50 h-14 text-base font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2"
                    onClick={() => navigate("/auth/tappayment")}
                    disabled={isProcessing || paymentStatus === "success"}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <RiGoogleFill className="w-5 h-5 mr-3" />
                        Buy with Google Pay
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div> */}

            {/* Payment Gateway Section */}
            <div className="bg-[rgb(24,24,27,0.5)] backdrop-blur-sm shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300 relative overflow-hidden rounded-[10px]">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              <div className="p-2 relative z-10">
                <div className="flex items-center space-x-3 mb-0">
                  {/* <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 animate-pulse opacity-30"></div>
                    <Globe className="w-4 h-4 text-white relative z-10" />
                  </div> */}
                  {/* <div>
                    <h2 className="text-lg font-bold text-white-100">
                      {transactionData?.gateway === "Tap payment"
                        ? "Tap Payment Gateway"
                        : "Payment Gateway"}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {transactionData?.gateway === "Tap payment"
                        ? "Secure Tap payment processing"
                        : "Secure external payment processing"}
                    </p>
                  </div> */}
                </div>

                {/* Conditional Rendering based on Gateway */}

                {transactionData?.url ? (
                  <div className=" rounded-xl overflow-hidden shadow-lg relative">
                    <iframe
                      ref={iframeRef}
                      id="paymentFrame"
                      src={transactionData?.url}
                      title="Payment Gateway"
                      className="w-full h-[400px] border-0 bg-white"
                      sandbox="allow-forms allow-modals allow-scripts allow-same-origin allow-top-navigation allow-popups allow-popups-to-escape-sandbox allow-presentation"
                      allow="payment; payment-telr*; camera; microphone; geolocation; encrypted-media"
                      onLoad={handleIframeLoad}
                      onError={handleIframeError}
                    />
                  </div>
                ) : (
                  <div className="w-full h-[500px] border-2 border-dashed border-gray-700 rounded-xl flex items-center justify-center bg-black/50">
                    <div className="text-center space-y-4">
                      <ExternalLink className="w-16 h-16 text-gray-400 mx-auto" />
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium text-yellow-200">
                          No Payment Gateway URL
                        </h3>
                        <p className="text-sm text-gray-400">
                          Payment gateway URL will appear here when provided
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* WE ACCEPT Section */}
            <div className="bg-[rgb(24,24,27,0.5)]  rounded-lg p-6">
              <h3 className="text-white font-semibold text-center mb-6">
                WE ACCEPT
              </h3>
              <div className="flex justify-between items-center">
                {[
                  { src: "/media/brand-logos/visa.png", alt: "VISA" },
                  {
                    src: "/media/brand-logos/master-card.png",
                    alt: "Mastercard",
                  },
                  { src: "/media/brand-logos/AMERICAN.png", alt: "AMEX" },
                  { src: "/media/brand-logos/DISCOVER.png", alt: "Discover" },
                  { src: "/media/brand-logos/UnionPay.png", alt: "UnionPay" },
                  { src: "/media/brand-logos/jcb.png", alt: "JCB" },
                  {
                    src: "/media/brand-logos/diners-club.png",
                    alt: "Diners Club",
                  },
                ].map((logo, i) => (
                  <div key={i} className="flex items-center justify-center">
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      className="h-8 w-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

                     {/* Order Summary Sidebar */}
           <div className="xl:col-span-1">
             <div className="sticky top-24 space-y-4 w-full">
               <div className="bg-[rgb(24_24_27/_0.5)] backdrop-blur-sm rounded-xl shadow-lg p-6 relative z-10 w-full">
                 <h3 className="text-white font-bold text-lg mb-6">Order Summary</h3>
                 <div className="space-y-4">
                 <div className="flex justify-between items-center">
                     <span className="text-white">Product</span>
                     <span className="text-white">{product?.product_title ?? ""}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-white">Sub total</span>
                     <span className="text-white"> ${Number(product?.total_amount || 0).toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-white">Tax</span>
                     <span className="text-white">${tax?.toFixed(2) || "0.09"}</span>
                   </div>
                   <div className="border-t border-gray-700 pt-4">
                     <div className="flex justify-between items-center">
                       <span className="text-white font-bold text-lg">Total</span>
                       <span className="text-white font-bold text-lg">${calculateTotal() || "1.09"}</span>
                     </div>
                   </div>
                 </div>
               </div>
               {/* Seller Information */}
               {product?.user && (
                 <div className="bg-[rgb(24_24_27/_0.5)] backdrop-blur-sm rounded-xl shadow-lg p-2 relative z-10 w-full">
                   <div
                     className="flex items-center justify-between cursor-pointer p-3 rounded-lg transition-all duration-300"
                     onClick={() => setShowSellerDetails(!showSellerDetails)}
                   >
                     <div className="flex items-center space-x-3">
                       <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center">
                         <Building className="w-4 h-4 text-black" />
                       </div>
                       <span className="text-white font-medium">View Seller Details</span>
                     </div>
                     {showSellerDetails ? (
                       <ChevronUp className="w-5 h-5 text-gray-400 transition-transform" />
                     ) : (
                       <ChevronDown className="w-5 h-5 text-gray-400 transition-transform" />
                     )}
                   </div>

                   {showSellerDetails && (
                     <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                       {product.user.web_site && (
                         <div className="flex items-center space-x-2">
                           <Globe className="w-4 h-4 text-yellow-500" />
                           <span className="text-sm text-gray-400">
                             Web Site:
                           </span>
                           <a
                            href={`${
                              product.user.web_site.startsWith("http://") ||
                              product.user.web_site.startsWith("https://")
                                ? product.user.web_site
                                : `https://${product.user.web_site}`
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-yellow-400 hover:underline"
                          >
                            {product.user.web_site}
                          </a>
                           {/* <a
                             href={`https://${product.user.web_site}`}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="text-sm text-yellow-400 hover:underline"
                           >
                             https://{product.user.web_site}
                           </a> */}
                         </div>
                       )}
                       <div className="flex items-center space-x-2">
                         <Building className="w-4 h-4 text-yellow-500" />
                         <span className="text-sm text-gray-400">
                           Vendor name:
                         </span>
                         <span className="text-sm text-yellow-200">
                           {product.user.vendor_name}
                         </span>
                       </div>
                       <div className="flex items-center space-x-2">
                         <User className="w-4 h-4 text-yellow-500" />
                         <span className="text-sm text-gray-400">Contact:</span>
                         <span className="text-sm text-yellow-200">
                           {product.user.contact}
                         </span>
                       </div>
                     </div>
                   )}
                 </div>
               )}
              {/* {product?.user && (
                <Card className="bg-black/40 backdrop-blur-sm border border-gray-800 shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-2 relative z-10">
                    <div
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-900/30 p-2 rounded-lg transition-all duration-300"
                      onClick={() => setShowSellerDetails(!showSellerDetails)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 animate-pulse opacity-30"></div>
                          <User className="w-4 h-4 text-white relative z-10" />
                        </div>
                        <span className="font-semibold text-yellow-100">
                          Seller Information
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          showSellerDetails ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {showSellerDetails && (
                      <div className="mt-4 pt-4 border-t border-gray-700 space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Seller Name</p>
                            <p className="text-sm font-medium text-yellow-200">
                              {product?.user?.name ?? ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                            <Building className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Vendor Name</p>
                            <p className="text-sm font-medium text-yellow-200">
                              {product.user.vendor_name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                            <Mail className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Website</p>
                            <p className="text-sm font-medium text-yellow-200">
                              {product?.user?.web_site}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                            <Phone className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Phone</p>
                            <p className="text-sm font-medium text-yellow-200">
                              {product?.user?.contact}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )} */}

              {/* Payment Status */}
              {/* <Card className="bg-black/40 backdrop-blur-sm border border-gray-800 shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 animate-pulse opacity-30"></div>
                      <CheckCircle className="w-4 h-4 text-white relative z-10" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-yellow-100">
                        Payment Status
                      </h3>
                      <p className="text-sm text-gray-400">
                        Transaction progress
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-300">
                        Order Created
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          paymentStatus === "processing"
                            ? "bg-yellow-500"
                            : paymentStatus === "success"
                              ? "bg-green-500"
                              : "bg-gray-600"
                        }`}
                      >
                        {paymentStatus === "processing" ? (
                          <Loader2 className="w-3 h-3 text-white animate-spin" />
                        ) : paymentStatus === "success" ? (
                          <CheckCircle className="w-3 h-3 text-white" />
                        ) : (
                          <XCircle className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                      <span
                        className={`text-sm ${
                          paymentStatus === "success"
                            ? "text-gray-300"
                            : paymentStatus === "failed"
                              ? "text-gray-500"
                              : "text-gray-300"
                        }`}
                      >
                        Payment Processing
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          paymentStatus === "success"
                            ? "bg-green-500"
                            : "bg-gray-600"
                        }`}
                      >
                        {paymentStatus === "success" ? (
                          <CheckCircle className="w-3 h-3 text-white" />
                        ) : (
                          <CheckCircle className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                      <span
                        className={`text-sm ${
                          paymentStatus === "success"
                            ? "text-gray-300"
                            : "text-gray-500"
                        }`}
                      >
                        Payment Confirmed
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
