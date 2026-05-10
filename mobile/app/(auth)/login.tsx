import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
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
});

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, error, setError } = useAuth();
  const router = useRouter();

  const normalizePhone = (raw: string) => {
    let cleaned = raw.replace(/[\s\-()]/g, '');
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
    if (!phone || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(normalizePhone(phone), password);
      router.replace('/(tabs)');
    } catch {
      // error handled by context
    } finally {
      setLoading(false);
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
          <Text style={styles.logoText}>LG</Text>
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

        {/* Phone */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.textInput}
            placeholder="+91 98765 43210"
            placeholderTextColor="#94a3b8"
            value={phone}
            onChangeText={(t) => { setPhone(t); if (error) setError(null); }}
            keyboardType="phone-pad"
            autoComplete="tel"
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
    </ScrollView>
  );
}
