import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  XCircle,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  FileText,
  DollarSign,
  Clock,
  AlertCircle,
  Shield,
  CreditCard,
  Home,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function FailureModal({ 
  isOpen, 
  onClose, 
  modalData, 
  transactionData, 
  onRetry,
  calculateTotal 
}) {
  const navigate = useNavigate();
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

  const handleRetry = () => {
    setIsVisible(false);
    setTimeout(() => {
      onRetry();
    }, 300);
  };

  const handleBackToHome = () => {
    localStorage.removeItem("productData");
    localStorage.removeItem("tax");
    localStorage.removeItem("gateway");
    localStorage.removeItem("discount");
    window.location.href = "https://www.youtube.com/";
  };

  const handleContactSupport = () => {
    // Open email client or contact support
    window.open("mailto:support@example.com?subject=Payment%20Issue", "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
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
          {/* Failure Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                <XCircle className="w-8 h-8 text-white" />
              </div>
              <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full blur-xl opacity-50 animate-ping"></div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              {modalData?.title || "Payment Failed"}
            </h1>
            <p className="text-gray-300 text-sm">
              {modalData?.message || "Your payment was not successful. Please try again or contact support."}
            </p>
          </div>

          {/* Failure Details */}
          <div className="space-y-4 mb-8">
            {/* Transaction ID */}
            <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
              <FileText className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-gray-400 text-xs">Transaction ID</p>
                <p className="text-white text-sm font-medium">
                  {transactionData?.transactionId || "N/A"}
                </p>
              </div>
            </div>

            {/* Amount */}
            <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
              <DollarSign className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-gray-400 text-xs">Amount</p>
                <p className="text-white text-sm font-medium">
                  ${calculateTotal ? calculateTotal() : "0.00"}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center space-x-3 p-3 bg-red-900/20 rounded-lg border border-red-600/30">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-gray-400 text-xs">Status</p>
                <div className="flex items-center space-x-2">
                  <span className="text-red-400 text-sm font-medium">
                    Failed
                  </span>
                  <XCircle className="w-4 h-4 text-red-400" />
                </div>
              </div>
            </div>

            {/* Reason for Failure */}
            {modalData?.reason && (
              <div className="flex items-center space-x-3 p-3 bg-red-900/20 rounded-lg border border-red-600/30">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-400 text-xs">Reason</p>
                  <p className="text-red-300 text-sm font-medium">
                    {modalData.reason}
                  </p>
                </div>
              </div>
            )}

            {/* Error Code */}
            {modalData?.details?.error_code && (
              <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-400 text-xs">Error Code</p>
                  <p className="text-white text-sm font-medium">
                    {modalData.details.error_code}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 mb-6">
            <Button
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button
              onClick={handleContactSupport}
              variant="outline"
              className="w-full bg-gray-700/50 border-gray-600/50 text-white hover:bg-gray-600/50 hover:border-gray-500/50 transition-all duration-300"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
            
            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="w-full bg-gray-700/50 border-gray-600/50 text-white hover:bg-gray-600/50 hover:border-gray-500/50 transition-all duration-300"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-gray-400 text-xs mb-2">
              Need immediate assistance?
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs">
              <div className="flex items-center space-x-1 text-gray-400">
                <Phone className="w-3 h-3" />
                <span>1-800-SUPPORT</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-400">
                <Mail className="w-3 h-3" />
                <span>support@example.com</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 