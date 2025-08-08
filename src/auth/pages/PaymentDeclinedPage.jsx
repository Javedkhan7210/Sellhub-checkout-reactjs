import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  XCircle,
  FileText,
  Mail,
  Package,
  DollarSign,
  ArrowLeft,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PaymentDeclinedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  // Get data from navigation state or localStorage
  const navigationData = location.state;
  const productData = JSON.parse(localStorage.getItem("productData"));
  const tax = JSON.parse(localStorage.getItem("tax"));
  const discount2 = JSON.parse(localStorage.getItem("discount"));
  console.log("SDagsadgsadg", navigationData);
  console.log("adgsadgsda", productData);
  const calculateTotal = () => {
    const subtotal = productData?.price || 0;
    const taxAmount = tax || 0;
    const discount = discount2 || 0;
    return (subtotal + taxAmount - discount).toFixed(2);
  };

  console.log("54545645656", calculateTotal());


  const [orderData] = useState({
    orderId: navigationData?.orderId || "",
    email: navigationData?.email || "",
    totalAmount: navigationData?.totalAmount || calculateTotal() || "0.00",
    discount: Number(navigationData?.discount) ?? 0,
    orderDate:
      navigationData?.orderDate ||
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
  });

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

  const handleRetryPayment = () => {
    // Navigate back to payment page or retry
    navigate(-1); // Go back to previous page
  };

  return (
    <div
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, black, #0d0c10, black)",
      }}
      className="min-h-screen bg-black flex items-center bg-gradient-to-br from-black via-black-900 to-black justify-center p-4 relative overflow-hidden"
    >
      {" "}
      {/* Background Effects - Purple and Orange glows */}
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
          {/* Warning Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-400">
                <TriangleAlert className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              Payment Declined
            </h1>
            <p className="text-gray-300 text-sm">
              Sorry, your payment was declined. Please try again.
            </p>
          </div>

          {/* Information Section */}
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
                {orderData.email}
              </span>
            </div>

            {/* Payment Status */}
            <div className="flex items-center justify-between p-3 border-b border-gray-700/30">
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="text-white text-sm">Payment Status</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-red-400 text-sm font-medium">Failed</span>
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <XCircle className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            {/* Total Amount */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="text-white text-sm">Total Amount</span>
              </div>
              <span className="text-white text-lg font-bold">
                ${navigationData?.totalAmount === 0 ? calculateTotal() :navigationData?.totalAmount }
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 mb-6">
            {/* <Button
              onClick={handleRetryPayment}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
            >
              Try Again
            </Button> */}
            <div className="text-center">
              <span className="text-red-400 text-xs font-bold">
                {navigationData?.reason}
              </span>
            </div>
            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="w-full bg-gray-700/50 border-gray-600/50 text-white hover:bg-gray-600/50 hover:border-gray-500/50 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-gray-400 text-xs">
              Transaction attempted on {orderData.orderDate}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
