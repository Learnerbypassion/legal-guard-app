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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
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
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  stepDot: {
    height: 8,
    borderRadius: 4,
  },
  stepDotActive: {
    width: 32,
    backgroundColor: '#2563eb',
  },
  stepDotInactive: {
    width: 16,
    backgroundColor: '#e2e8f0',
  },
  stepDotCompleted: {
    width: 16,
    backgroundColor: '#93c5fd',
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    color: '#0f172a',
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  roleButtonInactive: {
    backgroundColor: 'white',
    borderColor: '#cbd5e1',
  },
  roleButtonText: {
    fontWeight: '500',
    textTransform: 'capitalize',
    fontSize: 14,
  },
  roleButtonTextActive: {
    color: 'white',
  },
  roleButtonTextInactive: {
    color: '#334155',
  },
  passwordContainer: {
    position: 'relative',
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
    fontFamily: 'monospace',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 16,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonEnabled: {
    backgroundColor: '#2563eb',
  },
  submitButtonLoading: {
    backgroundColor: '#60a5fa',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  secondaryButtonText: {
    color: '#1e40af',
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  backButtonText: {
    color: '#334155',
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 16,
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

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'professional'>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { registerEmail, error, setError } = useAuth();
  const router = useRouter();

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const data = await registerEmail(email.toLowerCase().trim(), password, name, role);
      router.push({
        pathname: '/verify-email-signup',
        params: { userId: data.userId, email: email.toLowerCase().trim() },
      });
    } catch (err: any) {
      // Handled by context
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
          <Image source={require('../../assets/images/custom-logo.jpg')} style={{ width: 64, height: 64, borderRadius: 16 }} resizeMode="cover" />
        </View>
        <Text style={styles.appTitle}>Legal-Guardian</Text>
        <Text style={styles.appSubtitle}>AI-Powered Document Analysis</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create Account</Text>
        <Text style={styles.cardSubtitle}>Sign up to get started with document analysis</Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Full Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="John Doe"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={(t) => { setName(t); if (error) setError(null); }}
            editable={!loading}
          />
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.textInput}
            placeholder="you@example.com"
            placeholderTextColor="#94a3b8"
            value={email}
            onChangeText={(t) => { setEmail(t); if (error) setError(null); }}
            keyboardType="email-address"
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

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <TextInput
            style={styles.textInput}
            placeholder="••••••••"
            placeholderTextColor="#94a3b8"
            value={confirmPassword}
            onChangeText={(t) => { setConfirmPassword(t); if (error) setError(null); }}
            secureTextEntry={!showPassword}
            editable={!loading}
          />
        </View>

        {/* Role Selector */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>I am a</Text>
          <View style={styles.roleContainer}>
            {(['user', 'professional'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRole(r)}
                style={[
                  styles.roleButton,
                  role === r ? styles.roleButtonActive : styles.roleButtonInactive,
                ]}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === r ? styles.roleButtonTextActive : styles.roleButtonTextInactive,
                  ]}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, loading ? styles.submitButtonLoading : styles.submitButtonEnabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.signupLink}>Sign in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <Text style={styles.termsText}>
        By signing up, you agree to our Terms of Service and Privacy Policy
      </Text>
    </ScrollView>
  );
}
