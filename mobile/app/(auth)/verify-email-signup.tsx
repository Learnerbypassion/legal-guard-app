import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { resendOTPApi } from '../../src/services/api';

export default function VerifyEmailSignupScreen() {
  const { userId, email } = useLocalSearchParams<{ userId: string; email: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const { verifyEmailSignup, error, setError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((p) => p - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await verifyEmailSignup(userId, otp);
      router.replace('/(tabs)');
    } catch (err: any) {
      // Handled by context, but we can log it here
      console.log('Verification screen error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      await resendOTPApi(userId);
      setTimer(60);
      setOtp('');
      Alert.alert('Success', 'Verification OTP resent to your email.');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || err.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
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
        <Text style={styles.cardTitle}>Verify Email</Text>
        <Text style={styles.cardSubtitle}>
          Enter the 6-digit verification code sent to <Text style={{ fontWeight: 'bold', color: '#1e293b' }}>{email}</Text>
        </Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* OTP Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Verification Code</Text>
          <TextInput
            style={styles.otpInput}
            placeholder="000000"
            placeholderTextColor="#94a3b8"
            value={otp}
            onChangeText={(t) => { setOtp(t); if (error) setError(null); }}
            maxLength={6}
            keyboardType="number-pad"
            editable={!loading}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, loading ? styles.submitButtonLoading : styles.submitButtonEnabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Verify Email</Text>
          )}
        </TouchableOpacity>

        {/* Timer & Resend */}
        <View style={styles.timerContainer}>
          {timer > 0 ? (
            <Text style={styles.timerText}>
              Resend code in <Text style={styles.timerHighlight}>{timer}s</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={resending}>
              {resending ? (
                <ActivityIndicator color="#2563eb" size="small" />
              ) : (
                <Text style={styles.resendLink}>Didn't receive the code? Resend OTP</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => { router.replace('/(auth)/login'); }}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
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
    lineHeight: 20,
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
    marginBottom: 24,
  },
  otpInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    color: '#0f172a',
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: 'bold',
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
  timerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  timerText: {
    color: '#64748b',
    fontSize: 14,
  },
  timerHighlight: {
    fontWeight: '600',
    color: '#2563eb',
  },
  resendLink: {
    fontWeight: '600',
    color: '#2563eb',
    fontSize: 14,
  },
  backButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginTop: 12,
  },
  backButtonText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
});
