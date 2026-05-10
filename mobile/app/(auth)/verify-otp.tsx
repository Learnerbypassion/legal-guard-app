import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  headerContainer: {
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 8,
  },
  textInput: {
    width: '100%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#0f172a',
    fontSize: 16,
  },
  submitButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
    backgroundColor: '#2563eb',
  },
  submitButtonDisabled: {
    backgroundColor: '#60a5fa',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#64748b',
    fontSize: 14,
  },
});

export default function VerifyOtpScreen() {
  const { userId, phone } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleVerify = async () => {
    if (!otp || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      
      // Step 1: Verify OTP
      const verifyRes = await api.post('/auth/verify-otp', { 
        userId, 
        phoneOtp: otp 
      });
      
      if (!verifyRes.data.success) {
        throw new Error(verifyRes.data.error || 'Invalid OTP');
      }

      // Step 2: Set Password
      const passRes = await api.post('/auth/set-password', { 
        userId, 
        password 
      });
      
      if (passRes.data.success) {
        const { token, user } = passRes.data.data;
        await login(token, user);
        // Router will redirect to tabs via layout
      }
    } catch (error: any) {
      Alert.alert('Verification Failed', error.response?.data?.error || error.message || 'Invalid OTP');
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
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Verify OTP</Text>
        <Text style={styles.headerSubtitle}>Sent to {phone}</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>6-Digit OTP</Text>
          <TextInput
            style={styles.textInput}
            placeholder="000000"
            placeholderTextColor="#94a3b8"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Create Password</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Min 8 characters"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Repeat password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Verify & Set Password</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back to Signup</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
