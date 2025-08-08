import { useEffect } from "react";
import { AuthRouting } from "@/auth/auth-routing";
import { RequireAuth } from "@/auth/require-auth";
import { ErrorRouting } from "@/errors/error-routing";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";
import Checkout from "../pages/store-client/checkout/Checkout";
import PaymentDeclinedPage from "../auth/pages/PaymentDeclinedPage";
import SuccessInfoPage from "../auth/pages/SuccessInfoPage";

export function AppRoutingSetup() {
  const location = useLocation();
  const navigate = useNavigate();

  const allowPaths = [
    "/auth/reset-password",
    "/auth/forgot-otp",
    "/auth/change-password",
    "/auth/register-otp",
    "/auth/login-otp",
    "/auth/signin",
    "/auth/register",
    "auth/checkout",
    "auth/payment",
  ];

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="auth/*" element={<AuthRouting />} />
      
      {/* Checkout route */}
      {/* <Route path="/checkout" element={<Checkout />} />
      <Route path="/checkout/:id" element={<Checkout />} /> */}
      
      {/* Payment Declined Page */}
      {/* <Route path="/payment-declined" element={<PaymentDeclinedPage />} /> */}
      
      {/* Success Info Page */}
      {/* <Route path="/auth/success-info" element={<SuccessInfoPage />} /> */}
      
      {/* Error routes */}
      <Route path="error/*" element={<ErrorRouting />} />
      
      {/* Default redirect to checkout */}
      {/* <Route path="/" element={<Navigate to="/checkout" replace />} />
      <Route path="*" element={<Navigate to="/checkout" replace />} /> */}
    </Routes>
  );
}
