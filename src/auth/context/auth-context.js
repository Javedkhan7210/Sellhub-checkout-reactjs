import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create AuthContext with types
export const AuthContext = createContext({
  loading: false,
  setLoading: () => {},
  saveAuth: () => {},
  setUser: () => {},
  login: async () => {},
  register: async () => {},
  requestPasswordReset: async () => {},
  resetPassword: async () => {},
  resendVerificationEmail: async () => {},
  getUser: async () => null,
  updateProfile: async () => ({}),
  logout: () => {},
  verify: async () => {},
  isAdmin: false,
});

// Hook definition
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Refresh token on mount
  // useEffect(() => {
  //   const refreshToken = async () => {
  //     console.log('Calling refresh API on mount/reload...');
  //     try {
  //       const response = await axios.get('https://paymentapi.sellhub.net/api/super-admin/refresh', {
  //         withCredentials: true, // send cookies
  //       });
  //       // Assume response.data.token is the new access token
  //       if (response.data && response.data.token) {
  //         localStorage.setItem('super_admin_token', response.data.token);
  //       }
  //     } catch (err) {
  //       // Optionally clear token on failure
  //       localStorage.removeItem('super_admin_token');
  //     }
  //   };
  //   refreshToken();
  // }, []);

  // ... rest of AuthProvider ...
}
