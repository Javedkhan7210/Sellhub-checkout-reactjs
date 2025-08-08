const url = 'https://apipayment.sellhub.net/'; //  main
// const url = 'https://paymentapi.sellhub.net/'; //  
 export const ApiConfig = {
  forgotpassword: `${url}api/seller/forgot-password`,
  signUp:`${url}api/seller/register`,
  registerOTP:`${url}api/seller/register-otp-submit`,
  loginOTP:`${url}api/seller/login-otp-submit`,
  login:`${url}api/seller/login`,
  changePassword: `${url}api/seller/reset-password/`, // append user id or token
  checkOTP: `${url}api/seller/check-otp`, // append user id or token
  getProfile: `${url}api/seller/me`, // append user id or token
  logout: `${url}api/seller/logout`, // append user id or token
  updateProfile: `${url}api/seller/update-profile`, // append user id or token
  sendOTPProfile: `${url}api/seller/send-otp-pass`, // append user id or token
  dashboard: `${url}api/seller/dashboard`, // append user id or token
};
