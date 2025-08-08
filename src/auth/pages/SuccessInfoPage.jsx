import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  FileText,
  Mail,
  Package,
  DollarSign,
  ArrowLeft,
  Sparkles,
  Home,
  Download,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SuccessInfoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  

  
  const navigationData = location.state;
  const productData = JSON.parse(localStorage.getItem("productData"));
  const tax = JSON.parse(localStorage.getItem("tax"));
  const gateway = JSON.parse(localStorage.getItem("gateway"));
  const discount2 = JSON.parse(localStorage.getItem("discount"));
console.log("adgasdgasdg",navigationData);
console.log("productDataproductDataproductData",productData);

  const calculateTotal = () => {
    const subtotal = productData?.price || 0;
    const taxAmount = tax || 0;
    const discount = discount2 || 0;
    return (subtotal + taxAmount - discount).toFixed(2);
  };

  const [orderData] = useState({
    orderId: navigationData?.orderId || "order_6889c49b8a511",
    email: navigationData?.email,
    totalAmount: navigationData?.amount || "0.00",
    discount: Number(navigationData?.discount) ?? 0,
    orderDate: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  });

  console.log("orderDataorderDataorderData",orderData);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleBackToHome = () => {
    localStorage.removeItem("tax");
    localStorage.removeItem("gateway");
    localStorage.removeItem("discount");
  
    const rawUrl = productData?.user?.web_site?.trim();
  
    if (rawUrl) {
      let url = rawUrl;
  
      // Normalize URL to always use https://
      if (url.startsWith("http://")) {
        url = url.replace("http://", "https://");
      } else if (!url.startsWith("https://")) {
        url = `https://${url}`;
      }
  
      window.location.href = url;
  
      // Clear product data after redirect trigger
      localStorage.removeItem("productData");
    } else {
      console.warn("Website URL is not defined");
    }
  };

  const handleDownloadReceipt = () => {
    // Implement receipt download functionality
    console.log("Downloading receipt...");
  };

  const handleShareOrder = () => {
    // Implement share functionality
    console.log("Sharing order...");
  };

  return (
    <div  style={{
      backgroundImage:
        "linear-gradient(to bottom right, black, #0d0c10, black)",
    }} className="min-h-screen bg-black flex items-center bg-gradient-to-br from-black via-black-900 to-black justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      {/* <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
      </div> */}

      {/* Main Card */}
      <Card
     className={`
      relative z-10 w-full max-w-md bg-[#100f14]/95 backdrop-blur-sm border-gray-700/50 
      shadow-2xl transition-all duration-700 ease-out rounded-xl
      ${isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"}
    `}
      >
        <CardContent className="p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              {/* <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-full blur-xl opacity-50 animate-ping"></div> */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-300 text-sm">
              Thank you for your purchase. Your order has been confirmed.
            </p>
          </div>

          {/* Order Details */}
          <div className="space-y-4 mb-8">
            {/* Order ID */}
            <div className="flex items-center justify-between p-3 border-b border-gray-700/30">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="text-white text-sm">Order ID</span>
              </div>
              <span className="text-white text-sm font-medium">
                {orderData.orderId}
              </span>
            </div>

            {/* Email Address */}
            <div className="flex items-center justify-between p-3 border-b border-gray-700/30">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="text-white text-sm">Email Address</span>
              </div>
              <span className="text-white text-sm font-medium">
                {orderData?.email}
              </span>
            </div>

            {/* Payment Status */}
       

            {/* Total Amount */}
            <div className="flex items-center justify-between p-3 border-b border-gray-700/30">
              <div className="flex items-center space-x-3">
              <Package className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="text-white text-sm">Payment Status</span>
              </div>
              <div className="flex items-center space-x-2">
                  <span className="text-green-400 text-sm font-medium">
                    Success
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
            </div>
            <div className="flex items-center justify-between p-3 border-b border-gray-700/30">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="text-white text-sm"> Total Amount</span>
              </div>
              <span className="text-white text-lg font-bold">
                ${calculateTotal()}
                {/* ${navigationData.totalAmount ?? navigationData?.amount} */}
              </span>
            </div>
          </div>

       
          {/* Action Buttons */}
          <div className="flex space-x-3 mb-6">
            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="flex-1 bg-gray-700/50 border-gray-600/50 text-white hover:bg-gray-600/50 hover:border-gray-500/50 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            {/* <Button
              onClick={handleDownloadReceipt}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-yellow-500/25"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button> */}
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-gray-400 text-xs">
              Order placed on {orderData.orderDate}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 