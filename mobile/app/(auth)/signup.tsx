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
  const [step, setStep] = useState(1); // 1: Register, 2: OTP, 3: Set Password
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'user' | 'professional'>('user');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const { register, verifyOTP, setPassword: setPass, resendOTP, error, setError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((p) => p - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

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

  const handleRegister = async () => {
    if (!name) { setError('Name is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email'); return; }
    if (!/^(\+\d{1,3})?[\d\s\-()]{9,}$/.test(phone)) { setError('Please enter a valid phone number'); return; }

    setLoading(true);
    try {
      const data = await register(email, normalizePhone(phone), name, role);
      setUserId(data.userId);
      setTimer(60);
      setStep(2);
    } catch {
      // handled by context
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (skipEmail = false) => {
    if (!phoneOtp) { setError('Phone OTP is required'); return; }
    setLoading(true);
    try {
      await verifyOTP(userId, phoneOtp, skipEmail ? null : (emailOtp || null));
      setStep(3);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async () => {
    if (!password) { setError('Please set a password'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await setPass(userId, password);
      router.replace('/(tabs)');
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await resendOTP(userId);
      setTimer(60);
      setPhoneOtp('');
      setEmailOtp('');
    } catch {
      // handled
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

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[
              styles.stepDot,
              s === step ? styles.stepDotActive : s < step ? styles.stepDotCompleted : styles.stepDotInactive,
            ]}
          />
        ))}
      </View>

      {/* Card */}
      <View style={styles.card}>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── Step 1: Register ── */}
        {step === 1 && (
          <>
            <Text style={styles.cardTitle}>Create Account</Text>
            <Text style={styles.cardSubtitle}>Sign up to get started with document analysis</Text>

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

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="+91 98765 43210"
                placeholderTextColor="#94a3b8"
                value={phone}
                onChangeText={(t) => { setPhone(t); if (error) setError(null); }}
                keyboardType="phone-pad"
                editable={!loading}
              />
              <Text style={styles.helperText}>We'll send you an OTP via SMS</Text>
            </View>

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

            <TouchableOpacity
              style={[styles.submitButton, loading ? styles.submitButtonLoading : styles.submitButtonEnabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Continue</Text>}
            </TouchableOpacity>
          </>
        )}

        {/* ── Step 2: OTP ── */}
        {step === 2 && (
          <>
            <Text style={styles.cardTitle}>Verify Your Identity</Text>
            <Text style={styles.cardSubtitle}>Enter the 6-digit codes sent to your phone and email.</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone OTP ({phone})</Text>
              <TextInput
                style={styles.otpInput}
                placeholder="000000"
                placeholderTextColor="#94a3b8"
                value={phoneOtp}
                onChangeText={setPhoneOtp}
                maxLength={6}
                keyboardType="number-pad"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Email OTP ({email}) <Text style={{ color: '#94a3b8', fontWeight: 'normal' }}>(Optional)</Text>
              </Text>
              <TextInput
                style={styles.otpInput}
                placeholder="000000"
                placeholderTextColor="#94a3b8"
                value={emailOtp}
                onChangeText={setEmailOtp}
                maxLength={6}
                keyboardType="number-pad"
                editable={!loading}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.submitButton, loading ? styles.submitButtonLoading : styles.submitButtonEnabled]}
                onPress={() => handleVerifyOTP(false)}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Verify Codes</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => handleVerifyOTP(true)}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>Verify Phone & Skip Email for Now</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timerContainer}>
              {timer > 0 ? (
                <Text style={styles.timerText}>
                  Resend code in <Text style={styles.timerHighlight}>{timer}s</Text>
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
                  <Text style={styles.resendLink}>Didn't receive the codes? Resend</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => { setStep(1); setError(null); setPhoneOtp(''); setEmailOtp(''); }}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ── Step 3: Set Password ── */}
        {step === 3 && (
          <>
            <Text style={styles.cardTitle}>Secure Your Account</Text>
            <Text style={styles.cardSubtitle}>Create a strong password for your account</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.textInput, { paddingRight: 48 }]}
                  placeholder="Min 8 characters"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={(t) => { setPassword(t); if (error) setError(null); }}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                 <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowPassword(!showPassword)}>
                   <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#64748b" />
                 </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Confirm password"
                placeholderTextColor="#94a3b8"
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); if (error) setError(null); }}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading ? styles.submitButtonLoading : styles.submitButtonEnabled]}
              onPress={handleSetPassword}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Complete Setup</Text>}
            </TouchableOpacity>
          </>
        )}

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
