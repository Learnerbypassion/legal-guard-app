import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// For physical device testing on Wi-Fi, use your local machine's IP
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://legal-guard-app.onrender.com/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'Bypass-Tunnel-Reminder': 'true'
  },
});

// Request interceptor: attach token from SecureStore on every request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const registerUser = async (
  email: string,
  phone: string,
  name: string,
  role: string
) => {
  const { data } = await api.post('/auth/register', { email, phone, name, role });
  return data;
};

export const verifyOTPApi = async (
  userId: string,
  phoneOtp: string,
  emailOtp: string | null
) => {
  const { data } = await api.post('/auth/verify-otp', { userId, phoneOtp, emailOtp });
  return data;
};

export const setPasswordApi = async (userId: string, password: string) => {
  const { data } = await api.post('/auth/set-password', { userId, password });
  return data;
};

export const resendOTPApi = async (userId: string) => {
  const { data } = await api.post('/auth/resend-otp', { userId });
  return data;
};

export const loginUser = async (identifier: string, password: string) => {
  const { data } = await api.post('/auth/login', { identifier, password });
  return data;
};

export const forgotPasswordApi = async (phone: string) => {
  const { data } = await api.post('/auth/forgot-password', { phone });
  return data;
};

export const verifyResetOTPApi = async (userId: string, otp: string) => {
  const { data } = await api.post('/auth/verify-reset-otp', { userId, otp });
  return data;
};

export const resetPasswordApi = async (userId: string, password: string) => {
  const { data } = await api.post('/auth/reset-password', { userId, password });
  return data;
};

export const sendEmailVerificationApi = async () => {
  const { data } = await api.post('/auth/send-email-verification');
  return data;
};

export const verifyEmailApi = async (otp: string) => {
  const { data } = await api.post('/auth/verify-email', { otp });
  return data;
};

export const registerEmailApi = async (email: string, password: string, name: string, role: string) => {
  const { data } = await api.post('/auth/register-email', { email, password, name, role });
  return data;
};

export const verifyEmailSignupApi = async (userId: string, otp: string) => {
  const { data } = await api.post('/auth/verify-email-signup', { userId, otp });
  return data;
};

export const googleLoginApi = async (idToken: string) => {
  const { data } = await api.post('/auth/google-login', { idToken });
  return data;
};

export const linkGoogleApi = async (userId: string, password: string, idToken: string) => {
  const { data } = await api.post('/auth/link-google', { userId, password, idToken });
  return data;
};

export const updateProfileApi = async (payload: {
  education?: string;
  experience?: string;
  credentials?: string;
  profession?: string;
}) => {
  const { data } = await api.put('/auth/profile', payload);
  return data;
};

// ─── Documents ────────────────────────────────────────────────────────────────

export const uploadPDF = async (
  file: { uri: string; name: string; mimeType?: string },
  options: { userType?: string; language?: string } = {}
) => {
  const formData = new FormData();
  formData.append('contract', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || 'application/pdf',
  } as any);
  formData.append('userType', options.userType || 'general');
  formData.append('language', options.language || 'English');

  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const analyzeContract = async (payload: {
  contractText: string;
  filename: string;
  userType?: string;
  language?: string;
  charCount?: number;
}) => {
  const { data } = await api.post('/ai/analyze', payload);
  return data;
};

export const askQuestion = async (payload: {
  contractText: string;
  question: string;
  history: { role: string; text: string }[];
  language?: string;
}) => {
  const { data } = await api.post('/chat', payload);
  return data;
};

export const getUserDocuments = async () => {
  const { data } = await api.get('/upload/documents');
  return data;
};

// ─── Professionals ────────────────────────────────────────────────────────────

export const getRecommendedProfessionals = async (type: string) => {
  const { data } = await api.get(`/professionals/recommend?type=${type}`);
  return data;
};

export const contactProfessional = async (professionalId: string) => {
  const { data } = await api.post('/professionals/contact', { professionalId });
  return data;
};

export const getConversationsApi = async () => {
  const { data } = await api.get('/livechat/conversations');
  return data;
};
