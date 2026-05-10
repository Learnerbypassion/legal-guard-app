import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, StyleSheet, Linking, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { api, updateProfileApi } from '../../src/services/api';
import { EXTERNAL_LINKS } from '../../src/constants/links';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 32,
    alignItems: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerSubtitle: {
    color: '#64748b',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  headerDate: {
    color: '#cbd5e1',
    fontSize: 13,
    marginTop: 4,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  messageBanner: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  messageBannerSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  messageBannerError: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  messageText: {
    fontSize: 13,
  },
  messageTextSuccess: {
    color: '#16a34a',
  },
  messageTextError: {
    color: '#dc2626',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoRowLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    color: '#0f172a',
    fontWeight: '500',
    fontSize: 14,
  },
  infoValueMono: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  verificationRow: {
    marginBottom: 16,
  },
  verificationLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 8,
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  verificationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  verificationDotVerified: {
    backgroundColor: '#16a34a',
  },
  verificationDotPending: {
    backgroundColor: '#eab308',
  },
  verificationText: {
    fontWeight: '500',
  },
  verificationTextVerified: {
    color: '#16a34a',
  },
  verificationTextPending: {
    color: '#ca8a04',
  },
  verifyButton: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  verifyButtonText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '600',
  },
  otpInputRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  otpInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#0f172a',
    fontSize: 14,
  },
  otpSubmitButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  otpSubmitButtonActive: {
    backgroundColor: '#2563eb',
  },
  otpSubmitButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  otpSubmitButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  otpCancelButton: {
    paddingHorizontal: 8,
  },
  otpCancelButtonText: {
    color: '#64748b',
    fontSize: 11,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#2563eb',
    fontWeight: '500',
    fontSize: 13,
  },
  professionSelectRow: {
    marginBottom: 12,
  },
  professionSelectLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 8,
  },
  professionSelectButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  professionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  professionButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  professionButtonInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
  },
  professionButtonText: {
    fontWeight: '500',
    fontSize: 13,
  },
  professionButtonTextActive: {
    color: '#ffffff',
  },
  professionButtonTextInactive: {
    color: '#475569',
  },
  textInputField: {
    marginBottom: 12,
  },
  textInputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#0f172a',
    fontSize: 14,
  },
  saveButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonLoading: {
    backgroundColor: '#93c5fd',
  },
  saveButtonActive: {
    backgroundColor: '#2563eb',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  securityCard: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
  },
  securityTitle: {
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 8,
  },
  securityItem: {
    color: '#0c4a6e',
    fontSize: 13,
    marginBottom: 4,
  },
  linksContainer: {
    marginBottom: 16,
  },
  linksTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  linkButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  linkButtonIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#2563eb',
  },
  linkButtonText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
  linkButtonArrow: {
    fontSize: 16,
    color: '#2563eb',
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  logoutText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default function ProfileScreen() {
  const { user, logout, sendEmailOTP, verifyEmailOTP, refreshUser } = useAuth();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  }, [refreshUser]);

  // Email OTP
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Professional details
  const [profDetails, setProfDetails] = useState({
    profession: user?.professionalDetails?.profession || 'Lawyer',
    education: user?.professionalDetails?.education || '',
    experience: user?.professionalDetails?.experience || '',
    credentials: user?.professionalDetails?.credentials || '',
  });

  // Clear message after 3 seconds
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Update profDetails when user changes
  React.useEffect(() => {
    if (user) {
      setProfDetails({
        profession: user.professionalDetails?.profession || 'Lawyer',
        education: user.professionalDetails?.education || '',
        experience: user.professionalDetails?.experience || '',
        credentials: user.professionalDetails?.credentials || '',
      });
    }
  }, [user, refreshTrigger]);

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setMessageType(type);
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            // Fire-and-forget: don't block logout on backend call
            api.post('/auth/logout').catch(() => {});
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleSendEmailOtp = async () => {
    try {
      setLoading(true);
      await sendEmailOTP();
      setOtpSent(true);
      setEmailVerifying(true);
      showMessage('OTP sent to your email.');
    } catch (err: any) {
      showMessage(err.message || 'Failed to send OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      setLoading(true);
      await verifyEmailOTP(emailOtp);
      setEmailVerifying(false);
      setOtpSent(false);
      setEmailOtp('');
      showMessage('Email verified successfully!');
      await refreshUser();
      setRefreshTrigger(prev => prev + 1); // Force component re-render
    } catch (err: any) {
      showMessage(err.message || 'Verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await updateProfileApi(profDetails);
      showMessage('Profile updated successfully!');
      setEditing(false);
      await refreshUser();
      setRefreshTrigger(prev => prev + 1); // Force component re-render
    } catch (err: any) {
      showMessage(err.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.headerTitle}>{user.name}</Text>
        <Text style={styles.headerSubtitle}>{user.role || 'User'}</Text>
        {user.createdAt && (
          <Text style={styles.headerDate}>
            Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </Text>
        )}
      </View>

      <View style={styles.contentContainer}>
        {/* Message Banner */}
        {message ? (
          <View style={[styles.messageBanner, messageType === 'success' ? styles.messageBannerSuccess : styles.messageBannerError]}>
            <Text style={[styles.messageText, messageType === 'success' ? styles.messageTextSuccess : styles.messageTextError]}>
              {message}
            </Text>
          </View>
        ) : null}

        {/* Account Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Information</Text>

          <InfoRow label="Email" value={user.email} />

          {/* Email Verification */}
          <View style={styles.verificationRow}>
            <Text style={styles.verificationLabel}>Email Verification</Text>
            <View style={styles.verificationStatus}>
              <View style={[styles.verificationDot, user.isEmailVerified ? styles.verificationDotVerified : styles.verificationDotPending]} />
              <Text style={[styles.verificationText, user.isEmailVerified ? styles.verificationTextVerified : styles.verificationTextPending]}>
                {user.isEmailVerified ? 'Verified' : 'Pending'}
              </Text>
              {!user.isEmailVerified && !emailVerifying && (
                <TouchableOpacity
                  onPress={handleSendEmailOtp}
                  disabled={loading}
                  style={styles.verifyButton}
                >
                  <Text style={styles.verifyButtonText}>Verify Now</Text>
                </TouchableOpacity>
              )}
            </View>
            {emailVerifying && !user.isEmailVerified && (
              <View style={styles.otpInputRow}>
                <TextInput
                  style={styles.otpInput}
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor="#94a3b8"
                  value={emailOtp}
                  onChangeText={setEmailOtp}
                  maxLength={6}
                  keyboardType="number-pad"
                />
                <TouchableOpacity
                  onPress={handleVerifyEmail}
                  disabled={loading || emailOtp.length !== 6}
                  style={[styles.otpSubmitButton, emailOtp.length === 6 ? styles.otpSubmitButtonActive : styles.otpSubmitButtonDisabled]}
                >
                  <Text style={styles.otpSubmitButtonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setEmailVerifying(false); setOtpSent(false); setMessage(''); }} style={styles.otpCancelButton}>
                  <Text style={styles.otpCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {user.phone && <InfoRow label="Phone" value={user.phone} />}

          {/* Phone Verification */}
          <View style={styles.verificationRow}>
            <Text style={styles.verificationLabel}>Phone Verification</Text>
            <View style={styles.verificationStatus}>
              <View style={[styles.verificationDot, user.isPhoneVerified ? styles.verificationDotVerified : styles.verificationDotPending]} />
              <Text style={[styles.verificationText, user.isPhoneVerified ? styles.verificationTextVerified : styles.verificationTextPending]}>
                {user.isPhoneVerified ? 'Verified' : 'Pending'}
              </Text>
            </View>
          </View>

          <InfoRow label="User Type" value={user.userType || 'General'} capitalize />
          <InfoRow label="Preferred Language" value={user.preferredLanguage || 'English'} />
          <InfoRow label="Role" value={user.role || 'User'} capitalize />
          <InfoRow label="Member ID" value={user._id} mono last />
        </View>

        {/* Professional Details (if role === professional) */}
        {user.role === 'professional' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Professional Details</Text>
              <TouchableOpacity
                onPress={() => { setEditing(!editing); setMessage(''); }}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>{editing ? 'Cancel' : 'Edit Details'}</Text>
              </TouchableOpacity>
            </View>

            {editing ? (
              <View>
                <View style={styles.professionSelectRow}>
                  <Text style={styles.professionSelectLabel}>Profession Type</Text>
                  <View style={styles.professionSelectButtons}>
                    {['Lawyer', 'CA'].map((p) => (
                      <TouchableOpacity
                        key={p}
                        onPress={() => setProfDetails({ ...profDetails, profession: p })}
                        style={[
                          styles.professionButton,
                          profDetails.profession === p ? styles.professionButtonActive : styles.professionButtonInactive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.professionButtonText,
                            profDetails.profession === p ? styles.professionButtonTextActive : styles.professionButtonTextInactive,
                          ]}
                        >
                          {p === 'CA' ? 'Chartered Accountant (CA)' : p}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {[
                  { key: 'education', label: 'Education', placeholder: 'e.g. LLB, LLM, CA' },
                  { key: 'experience', label: 'Experience', placeholder: 'e.g. 5 years in Corporate Law' },
                  { key: 'credentials', label: 'Credentials/License', placeholder: 'e.g. Bar Council Number' },
                ].map(({ key, label, placeholder }) => (
                  <View key={key} style={styles.textInputField}>
                    <Text style={styles.textInputLabel}>{label}</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder={placeholder}
                      placeholderTextColor="#94a3b8"
                      value={(profDetails as any)[key]}
                      onChangeText={(t) => setProfDetails({ ...profDetails, [key]: t })}
                    />
                  </View>
                ))}

                <TouchableOpacity
                  onPress={handleSaveProfile}
                  disabled={loading}
                  style={[styles.saveButton, loading ? styles.saveButtonLoading : styles.saveButtonActive]}
                >
                  {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Save Details</Text>}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <InfoRow label="Profession" value={user.professionalDetails?.profession || 'Not set'} />
                <InfoRow label="Education" value={user.professionalDetails?.education || 'Not set'} />
                <InfoRow label="Experience" value={user.professionalDetails?.experience || 'Not set'} />
                <InfoRow label="Credentials" value={user.professionalDetails?.credentials || 'Not set'} last />
              </View>
            )}
          </View>
        )}

        {/* Security Info */}
        <View style={styles.securityCard}>
          <Text style={styles.securityTitle}>Security Information</Text>
          {[
            'Your password is securely hashed',
            'Your phone number is verified via SMS',
            'All data is encrypted in transit',
            'Your account is protected by JWT authentication',
          ].map((item, i) => (
            <Text key={i} style={styles.securityItem}><Ionicons name="checkmark-circle-outline" size={14} color="#0c4a6e" /> {item}</Text>
          ))}
        </View>

        {/* External Links */}
        <View style={styles.linksContainer}>
          <Text style={styles.linksTitle}>Quick Links</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL(EXTERNAL_LINKS.WEBSITE)}
            style={styles.linkButton}
          >
            <Ionicons name="globe-outline" style={styles.linkButtonIcon} />
            <Text style={styles.linkButtonText}>Visit Website</Text>
            <Ionicons name="chevron-forward" style={styles.linkButtonArrow} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Linking.openURL(EXTERNAL_LINKS.APP_REPO)}
            style={styles.linkButton}
          >
            <Ionicons name="logo-github" style={styles.linkButtonIcon} />
            <Text style={styles.linkButtonText}>App Repository</Text>
            <Ionicons name="chevron-forward" style={styles.linkButtonArrow} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Linking.openURL(EXTERNAL_LINKS.EXTENSION_REPO)}
            style={styles.linkButton}
          >
            <Ionicons name="extension-puzzle-outline" style={styles.linkButtonIcon} />
            <Text style={styles.linkButtonText}>Extension Repository</Text>
            <Ionicons name="chevron-forward" style={styles.linkButtonArrow} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <Ionicons name="log-out-outline" size={24} color="#dc2626" style={{ marginRight: 12 }} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value, capitalize, mono, last }: {
  label: string;
  value: string;
  capitalize?: boolean;
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, last ? styles.infoRowLast : {}]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, capitalize ? { textTransform: 'capitalize' } : {}, mono ? styles.infoValueMono : {}]}>
        {value}
      </Text>
    </View>
  );
}
