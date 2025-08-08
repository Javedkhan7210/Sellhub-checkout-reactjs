import React from "react";

const LoadingPayment = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-800 border-t-yellow-500 rounded-full animate-spin mx-auto"></div>
          <div
            className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-yellow-400 rounded-full animate-spin mx-auto"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-yellow-100">
            Payment processing...
          </h3>
          <p className="text-gray-400">
            Please wait while we process your payment...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingPayment;
