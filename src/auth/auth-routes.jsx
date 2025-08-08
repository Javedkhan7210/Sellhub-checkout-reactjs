import PaymentCardInfo from '../components/ui/payment-card-info';
import { BrandedLayout } from './layouts/branded';
import { ClassicLayout } from './layouts/classic';
import { CallbackPage } from './pages/callback-page';
import { ChangePasswordPage } from './pages/change-password-page';
import CheckoutAPI from './pages/CheckoutAPI';
import CheckoutAPICustomer from './pages/CheckoutAPICustomer';
import { CheckEmail } from './pages/extended/check-email';
import { ForgotVerifyOtp } from './pages/extended/ForgotVerifyOtp';
import { ResetPasswordChanged } from './pages/extended/reset-password-changed';
import { ResetPasswordCheckEmail } from './pages/extended/reset-password-check-email';
import { TwoFactorAuth } from './pages/extended/tfa';
import { VerifyLoginOtp } from './pages/extended/VerifyLoginOtp';
import { VerifyRegisterOtp } from './pages/extended/VerifyRegisterOtp';
import LoadingPayment from './pages/LoadingPayment';
import NewCheckout from './pages/NewCheckout';
import PaymentCustomer from './pages/PaymentCustomer';
import PaymentDeclinedPage from './pages/PaymentDeclinedPage';
import { Register } from './pages/Register';
import { ResetPasswordPage } from './pages/reset-password-page';
import SuccessCustomer from './pages/SuccessCustomer';
import SuccessInfoPage from './pages/SuccessInfoPage';
import TapPayment from './pages/TapPayment';

// Define the auth routes
export const authRoutes = [
  {
    path: '',
    element: <BrandedLayout />,
    children: [
      {
        path: '/checkout/:id',
        element: <NewCheckout />,
      },
      {
        path: '/api-checkout/:id',
        element: <CheckoutAPI />,
      },
      {
        path: '/payment/:id',
        element: <PaymentCustomer />,
      },
      {
        path: '/api-payment/:id',
        element: <CheckoutAPICustomer />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'success-info',
        // element: <SuccessCustomer />,
        element: <SuccessInfoPage />,
      },
      {
        path: 'paymentLoading',
        // element: <SuccessCustomer />,
        element: <LoadingPayment />,
      },
      {
        path: 'tappayment',
        element: <TapPayment />,
      },
      {
        path: 'payment-declined',
        element: <PaymentDeclinedPage />,
      },
      {
        path: 'register-otp',
        element: <VerifyRegisterOtp />,
      },
      {
        path: 'forgot-otp',
        element: <ForgotVerifyOtp />,
      },
      {
        path: 'login-otp',
        element: <VerifyLoginOtp />,
      },
      {
        path: 'change-password',
        element: <ChangePasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
      /* Extended examples */
      {
        path: '2fa',
        element: <TwoFactorAuth />,
      },
      {
        path: 'check-email',
        element: <CheckEmail />,
      },
      {
        path: 'reset-password/check-email',
        element: <ResetPasswordCheckEmail />,
      },
      {
        path: 'reset-password/changed',
        element: <ResetPasswordChanged />,
      },
    ],
  },
  {
    path: '',
    element: <ClassicLayout />,
    children: [
      // {
      //   path: 'classic/signin',
      //   element: <SignInPage />,
      // },
      // {
      //   path: 'classic/signup',
      //   element: <SignUpPage />,
      // },
      {
        path: 'classic/change-password',
        element: <ChangePasswordPage />,
      },
      {
        path: 'classic/reset-password',
        element: <ResetPasswordPage />,
      },
      /* Extended examples */
      {
        path: 'classic/2fa',
        element: <TwoFactorAuth />,
      },
      {
        path: 'classic/check-email',
        element: <CheckEmail />,
      },
      {
        path: 'classic/reset-password/check-email',
        element: <ResetPasswordCheckEmail />,
      },
      {
        path: 'classic/reset-password/changed',
        element: <ResetPasswordChanged />,
      },
    ],
  },
  {
    path: 'callback',
    element: <CallbackPage />,
  },
];
