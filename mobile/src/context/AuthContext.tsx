import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, loginUser, registerUser, verifyOTPApi, setPasswordApi, resendOTPApi, sendEmailVerificationApi, verifyEmailApi } from '../services/api';

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
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, phone: string, name: string, role: string) => Promise<{ userId: string }>;
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
      }
    } catch (e) {
      console.error('Failed to load auth data', e);
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
    }
  };

  const saveAuth = async (newToken: string, newUser: User) => {
    // SecureStore only accepts strings — guard against undefined/object tokens
    const tokenStr = typeof newToken === 'string' ? newToken : String(newToken ?? '');
    const userStr = JSON.stringify(newUser);

    if (!tokenStr) throw new Error('No token received from server');

    await SecureStore.setItemAsync('token', tokenStr);
    await SecureStore.setItemAsync('user', userStr);
    setToken(newToken);
    setUser(newUser);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const login = async (phone: string, password: string) => {
    try {
      setError(null);
      const data = await loginUser(phone, password);
      // Backend response shape: { success, data: { token, user }, message }
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
      // Backend response shape: { success, data: { userId }, message }
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
      if (data.success && data.user) {
        setUser(data.user);
        await SecureStore.setItemAsync('user', JSON.stringify(data.user));
      }
    } catch (e) {
      console.error('Failed to refresh user', e);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, token, isLoading, error, setError,
      login, logout, register, verifyOTP, setPassword,
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
