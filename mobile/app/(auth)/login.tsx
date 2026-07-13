import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
  Modal,
  NativeModules,
  TurboModuleRegistry,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Link, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { Platform } from 'react-native';

let GoogleSignin: any = {
  configure: () => {},
  hasPlayServices: async () => false,
  signIn: async () => {
    throw new Error('Google Sign-In is not supported in Expo Go. Please use a development build (npx expo run:android).');
  },
};

const hasGoogleSignin = Platform.OS !== 'web' && (
  !!TurboModuleRegistry.get('RNGoogleSignin') || 
  !!NativeModules.RNGoogleSignin
);

if (hasGoogleSignin) {
  try {
    GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
  } catch (e) {
    console.warn('Failed to load @react-native-google-signin/google-signin:', e);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
  },
  appTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4F6BFF',
  },
  appSubtitle: {
    color: '#64748b',
    marginTop: 4,
    fontSize: 14,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 24,
  },
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    color: '#0f172a',
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  passwordToggleText: {
    color: '#64748b',
    fontSize: 18,
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
  },
  submitButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonLoading: {
    backgroundColor: '#60a5fa',
  },
  submitButtonEnabled: {
    backgroundColor: '#2563eb',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#94a3b8',
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: '#475569',
    fontSize: 14,
  },
  signupLink: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
  },
  termsText: {
    textAlign: 'center',
    color: '#a0aec0',
    fontSize: 12,
    marginTop: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  googleButtonText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
});

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, googleLogin, linkGoogle, error, setError } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Linking State
  const [linkingInfo, setLinkingInfo] = useState<{ userId: string; email: string; idToken: string } | null>(null);
  const [linkPassword, setLinkPassword] = useState('');
  const [linkingLoading, setLinkingLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '710925414754-5sdov85elu40d1fe41cuv500ddgibe9u.apps.googleusercontent.com',
    });
  }, []);

  const normalizePhone = (raw: string) => {
    let cleaned = raw.replace(/[\s\-()]/g, '');
    if (/^\d{10}$/.test(cleaned)) {
      return `+91${cleaned}`;
    }
    let countryCode = '';
    let numberPart = '';

    if (cleaned.startsWith('+')) {
      const m = cleaned.match(/^\+(\d{1,3})(.+)/);
      if (m) { countryCode = m[1]; numberPart = m[2]; }
    } else {
      const m = cleaned.match(/^(\d{1,3})(.+)/);
      if (m && m[1].length <= 3 && m[2].length >= 7) {
        countryCode = m[1]; numberPart = m[2];
      } else {
        numberPart = cleaned;
      }
    }
    if (!countryCode) countryCode = '91';
    return `+${countryCode}${numberPart}`;
  };

  const handleSubmit = async () => {
    if (!identifier || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);

    let normalizedId = identifier.trim();
    if (!normalizedId.includes('@')) {
      normalizedId = normalizePhone(normalizedId);
    }

    try {
      await login(normalizedId, password);
      
      const redirectTo = params.redirectTo as string;
      if (redirectTo) {
        router.replace(redirectTo as any);
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      console.log('Login error in screen:', err.response?.data?.error || err.message);
      if (err.response?.data?.error === 'Email not verified' || err.response?.status === 403) {
        const userId = err.response.data.userId;
        router.push({
          pathname: '/verify-email-signup',
          params: { userId, email: normalizedId },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;
      
      if (!idToken) {
        throw new Error('Google ID Token was not returned');
      }

      try {
        await googleLogin(idToken);
        const redirectTo = params.redirectTo as string;
        if (redirectTo) {
          router.replace(redirectTo as any);
        } else {
          router.replace('/(tabs)');
        }
      } catch (err: any) {
        if (err.response?.data?.code === 'ACCOUNT_LINKING_REQUIRED') {
          setLinkingInfo({
            userId: err.response.data.userId,
            email: err.response.data.email,
            idToken,
          });
        } else {
          setError(err.response?.data?.error || err.message || 'Google authentication failed');
        }
      }
    } catch (err: any) {
      console.log('Google Sign-In cancel/error:', err);
      if (err.code !== 'SIGN_IN_CANCELLED') {
        setError(err.message || 'Google Sign-in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLinkAccount = async () => {
    if (!linkPassword) {
      Alert.alert('Required', 'Please enter your password to link your Google account.');
      return;
    }
    setLinkingLoading(true);
    try {
      await linkGoogle(linkingInfo!.userId, linkPassword, linkingInfo!.idToken);
      setLinkingInfo(null);
      setLinkPassword('');
      const redirectTo = params.redirectTo as string;
      if (redirectTo) {
        router.replace(redirectTo as any);
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      Alert.alert('Linking Failed', err.response?.data?.error || err.message);
    } finally {
      setLinkingLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.logoBox}>
          <Image source={require('../../assets/images/custom-logo.jpg')} style={{ width: 64, height: 64, borderRadius: 16 }} resizeMode="cover" />
        </View>
        <Text style={styles.appTitle}>Legal-Guardian</Text>
        <Text style={styles.appSubtitle}>AI-Powered Document Analysis</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Welcome Back</Text>
        <Text style={styles.cardSubtitle}>Sign in to your account to continue</Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Identifier */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email or Phone Number</Text>
          <TextInput
            style={styles.textInput}
            placeholder="example@email.com or +91 98765 43210"
            placeholderTextColor="#94a3b8"
            value={identifier}
            onChangeText={(t) => { setIdentifier(t); if (error) setError(null); }}
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        {/* Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.textInput, { paddingRight: 48 }]}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={(t) => { setPassword(t); if (error) setError(null); }}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot password */}
        <View style={styles.forgotContainer}>
          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, loading ? styles.submitButtonLoading : styles.submitButtonEnabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Google Authentication Button */}
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Ionicons name="logo-google" size={18} color="#475569" />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <Text style={styles.termsText}>
        By signing in, you agree to our Terms of Service and Privacy Policy
      </Text>

      {/* Account Linking Modal */}
      <Modal
        visible={linkingInfo !== null}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Link Google Account</Text>
            <Text style={styles.modalDesc}>
              An account with the email <Text style={{ fontWeight: 'bold' }}>{linkingInfo?.email}</Text> already exists. Enter your password to securely link this Google account.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Enter Password</Text>
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                value={linkPassword}
                onChangeText={setLinkPassword}
                secureTextEntry={true}
                editable={!linkingLoading}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.submitButton, { flex: 1, backgroundColor: '#64748b' }]}
                onPress={() => { setLinkingInfo(null); setLinkPassword(''); }}
                disabled={linkingLoading}
              >
                <Text style={styles.submitButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, { flex: 1, backgroundColor: '#2563eb' }]}
                onPress={handleLinkAccount}
                disabled={linkingLoading}
              >
                {linkingLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Link</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
