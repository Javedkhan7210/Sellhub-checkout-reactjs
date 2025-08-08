import React, { useState, useEffect } from "react";
import {
  XCircle,
  AlertTriangle,
  FileText,
  Mail,
  Package,
  DollarSign,
  ArrowLeft,
  ExclamationTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PaymentDeclinedModal({ 
  isOpen, 
  onClose, 
  orderData = {} 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleBackToHome = () => {
    localStorage.removeItem("productData");
    localStorage.removeItem("tax");
    localStorage.removeItem("gateway");
    localStorage.removeItem("discount");
    window.location.href = "https://www.youtube.com/";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      {/* Background Effects - Purple and Orange glows */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main Modal Card */}
      <Card
        className={`
        relative z-10 w-full max-w-md bg-gray-900/95 backdrop-blur-sm border-gray-700/50 
        shadow-2xl transition-all duration-700 ease-out rounded-xl
        ${isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"}
      `}
      >
        <CardContent className="p-8">
          {/* Warning Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-400">
                <ExclamationTriangle className="w-8 h-8 text-white" />
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
                {orderData.orderId || "order_6889f87b65555"}
              </span>
            </div>

            {/* Email Address */}
            <div className="flex items-center justify-between p-3 border-b border-gray-700/30">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="text-white text-sm">Email Address</span>
              </div>
              <span className="text-white text-sm font-medium">
                {orderData.email || "suraj@mailinator.com"}
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
                <span className="text-white text-sm">$ Total Amount</span>
              </div>
              <span className="text-white text-lg font-bold">
                ${orderData.totalAmount || "1,090.00"}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center mb-6">
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
              Transaction attempted on {orderData.orderDate || "July 30, 2025"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 