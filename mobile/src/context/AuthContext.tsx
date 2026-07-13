import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  api,
  loginUser,
  registerUser,
  verifyOTPApi,
  setPasswordApi,
  resendOTPApi,
  sendEmailVerificationApi,
  verifyEmailApi,
  registerEmailApi,
  verifyEmailSignupApi,
  googleLoginApi,
  linkGoogleApi,
} from '../services/api';

type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  userType?: string;
  isEmailVerified: boolean;
  isPhoneVerified?: boolean;
  preferredLanguage?: string;
  createdAt?: string;
  professionalDetails?: {
    profession?: string;
    education?: string;
    experience?: string;
    credentials?: string;
  };
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, phone: string, name: string, role: string) => Promise<{ userId: string }>;
  registerEmail: (email: string, password: string, name: string, role: string) => Promise<{ userId: string }>;
  verifyEmailSignup: (userId: string, otp: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  linkGoogle: (userId: string, password: string, idToken: string) => Promise<void>;
  verifyOTP: (userId: string, phoneOtp: string, emailOtp: string | null) => Promise<void>;
  setPassword: (userId: string, password: string) => Promise<void>;
  resendOTP: (userId: string) => Promise<void>;
  sendEmailOTP: () => Promise<void>;
  verifyEmailOTP: (otp: string) => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    try {
      const storedToken = await SecureStore.getItemAsync('token');
      const storedUser = await SecureStore.getItemAsync('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        // Auto connect socket
        const { socketService } = require('../services/socket.service');
        socketService.connect().catch((err: any) => console.log('Socket auto-connect failed:', err.message));

        // Fetch latest user data in background
        api.get('/auth/me').then(({ data }) => {
          const userData = data.data || data.user;
          if (data.success && userData) {
            setUser(userData);
            SecureStore.setItemAsync('user', JSON.stringify(userData));
          }
        }).catch(err => {
          console.log('Failed to auto-refresh user:', err.message);
          if (err.response?.status === 401) {
            setToken(null);
            setUser(null);
            delete api.defaults.headers.common['Authorization'];
            const { socketService: socket } = require('../services/socket.service');
            socket.disconnect();
          }
        });
      }
    } catch (e) {
      console.error('Failed to load auth data', e);
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
    }
  };

  const saveAuth = async (newToken: string, newUser: User) => {
    const tokenStr = typeof newToken === 'string' ? newToken : String(newToken ?? '');
    const userStr = JSON.stringify(newUser);

    if (!tokenStr) throw new Error('No token received from server');

    await SecureStore.setItemAsync('token', tokenStr);
    await SecureStore.setItemAsync('user', userStr);
    setToken(newToken);
    setUser(newUser);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

    // Connect socket on successful authentication
    const { socketService } = require('../services/socket.service');
    socketService.connect().catch((err: any) => console.log('Socket connect failed:', err.message));
  };

  const login = async (identifier: string, password: string) => {
    try {
      setError(null);
      const data = await loginUser(identifier, password);
      if (data.success) {
        const token = data.data?.token ?? data.token;
        const user = data.data?.user ?? data.user;
        await saveAuth(token, user);
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Login failed';
      setError(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      const { socketService } = require('../services/socket.service');
      socketService.disconnect();

      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
      setToken(null);
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
    } catch (e) {
      console.error('Failed to clear auth data', e);
    }
  };

  const register = async (email: string, phone: string, name: string, role: string) => {
    try {
      setError(null);
      const data = await registerUser(email, phone, name, role);
      if (data.success) {
        const userId = data.data?.userId ?? data.userId;
        return { userId };
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Registration failed';
      setError(msg);
      throw err;
    }
  };

  const registerEmail = async (email: string, password: string, name: string, role: string) => {
    try {
      setError(null);
      const data = await registerEmailApi(email, password, name, role);
      if (data.success) {
        return { userId: data.data?.userId ?? data.userId };
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Registration failed';
      setError(msg);
      throw err;
    }
  };

  const verifyEmailSignup = async (userId: string, otp: string) => {
    try {
      setError(null);
      const data = await verifyEmailSignupApi(userId, otp);
      if (data.success) {
        const token = data.data?.token ?? data.token;
        const user = data.data?.user ?? data.user;
        await saveAuth(token, user);
      } else {
        throw new Error(data.message || 'Verification failed');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Verification failed';
      setError(msg);
      throw err;
    }
  };

  const googleLogin = async (idToken: string) => {
    try {
      setError(null);
      const data = await googleLoginApi(idToken);
      if (data.success) {
        const token = data.data?.token ?? data.token;
        const user = data.data?.user ?? data.user;
        await saveAuth(token, user);
      } else {
        throw new Error(data.message || 'Google login failed');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Google login failed';
      setError(msg);
      throw err;
    }
  };

  const linkGoogle = async (userId: string, password: string, idToken: string) => {
    try {
      setError(null);
      const data = await linkGoogleApi(userId, password, idToken);
      if (data.success) {
        const token = data.data?.token ?? data.token;
        const user = data.data?.user ?? data.user;
        await saveAuth(token, user);
      } else {
        throw new Error(data.message || 'Failed to link Google account');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to link Google account';
      setError(msg);
      throw err;
    }
  };

  const verifyOTP = async (userId: string, phoneOtp: string, emailOtp: string | null) => {
    try {
      setError(null);
      const data = await verifyOTPApi(userId, phoneOtp, emailOtp);
      if (!data.success) {
        throw new Error(data.message || 'OTP verification failed');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'OTP verification failed';
      setError(msg);
      throw err;
    }
  };

  const setPassword = async (userId: string, password: string) => {
    try {
      setError(null);
      const data = await setPasswordApi(userId, password);
      // Backend response shape: { success, data: { token, user }, message }
      if (data.success) {
        const token = data.data?.token ?? data.token;
        const user = data.data?.user ?? data.user;
        await saveAuth(token, user);
      } else {
        throw new Error(data.message || 'Failed to set password');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to set password';
      setError(msg);
      throw err;
    }
  };

  const resendOTP = async (userId: string) => {
    try {
      setError(null);
      await resendOTPApi(userId);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to resend OTP';
      setError(msg);
      throw err;
    }
  };

  const sendEmailOTP = async () => {
    try {
      setError(null);
      await sendEmailVerificationApi();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to send email OTP';
      setError(msg);
      throw err;
    }
  };

  const verifyEmailOTP = async (otp: string) => {
    try {
      setError(null);
      const data = await verifyEmailApi(otp);
      if (data.success && user) {
        const updatedUser = { ...user, isEmailVerified: true };
        setUser(updatedUser);
        await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Email verification failed';
      setError(msg);
      throw err;
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      const userData = data.data || data.user;
      if (data.success && userData) {
        setUser(userData);
        await SecureStore.setItemAsync('user', JSON.stringify(userData));
      }
    } catch (e: any) {
      console.log('Failed to refresh user:', e.message);
      if (e.response?.status === 401) {
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user, token, isLoading, error, setError,
      login, logout, register, registerEmail, verifyEmailSignup,
      googleLogin, linkGoogle, verifyOTP, setPassword,
      resendOTP, sendEmailOTP, verifyEmailOTP, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
