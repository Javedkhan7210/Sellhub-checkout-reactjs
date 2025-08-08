import React from "react";
import { Loader2, CreditCard, Shield, CheckCircle } from "lucide-react";

export default function PaymentLoader({ status = "processing" }) {
  const getStatusInfo = () => {
    switch (status) {
      case "processing":
        return {
          icon: <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />,
          title: "Processing Payment",
          message: "Please wait while we process your payment securely...",
          color: "text-yellow-400",
        };
      case "verifying":
        return {
          icon: <Shield className="w-8 h-8 text-blue-400" />,
          title: "Verifying Payment",
          message: "Verifying your payment with the bank...",
          color: "text-blue-400",
        };
      case "success":
        return {
          icon: <CheckCircle className="w-8 h-8 text-green-400" />,
          title: "Payment Successful",
          message: "Your payment has been processed successfully!",
          color: "text-green-400",
        };
      default:
        return {
          icon: <CreditCard className="w-8 h-8 text-yellow-400" />,
          title: "Processing Payment",
          message: "Please wait while we process your payment...",
          color: "text-yellow-400",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900/95 border border-gray-700/50 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center border border-gray-700/50">
              {statusInfo.icon}
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className={`text-xl font-bold ${statusInfo.color} mb-2`}>
              {statusInfo.title}
            </h2>
            <p className="text-gray-300 text-sm">
              {statusInfo.message}
            </p>
          </div>

          {/* Progress Bar */}
          {status === "processing" && (
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full animate-pulse"></div>
            </div>
          )}

          {/* Security Info */}
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
            <Shield className="w-3 h-3" />
            <span>SSL Secured • 256-bit Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
} 