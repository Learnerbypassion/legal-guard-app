import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { getUserDocuments } from '../../src/services/api';
import { GlobalDataStore } from '../../src/services/dataStore';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  featureCardsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureCardTitle: {
    fontWeight: '600',
    color: '#1e293b',
    fontSize: 13,
    textAlign: 'center',
  },
  featureCardSubtitle: {
    color: '#64748b',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonIcon: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  buttonSubtext: {
    color: '#bfdbfe',
    marginTop: 4,
    fontSize: 13,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  secondaryButtonSubtext: {
    color: '#64748b',
    marginTop: 4,
    fontSize: 13,
  },
  buttonArrow: {
    color: '#ffffff',
    fontSize: 20,
  },
  secondaryButtonArrow: {
    color: '#94a3b8',
    fontSize: 20,
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 24,
  },
  infoParagraph: {
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  infoStep: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  infoStepNumber: {
    fontWeight: '700',
    color: '#2563eb',
  },
  infoStepText: {
    color: '#334155',
    flex: 1,
  },
  recentDocumentsSection: {
    marginBottom: 24,
  },
  docItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  docTitle: {
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  docDate: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
  },
  blueIcon: {
    backgroundColor: '#dbeafe',
  },
  indigoIcon: {
    backgroundColor: '#e0e7ff',
  },
  purpleIcon: {
    backgroundColor: '#f3e8ff',
  },
});

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  useEffect(() => {
    if (user) fetchRecentDocs();
  }, [user]);

  const fetchRecentDocs = async () => {
    try {
      setLoadingDocs(true);
      const data = await getUserDocuments();
      if (data.success) {
        setRecentDocs((data.data || []).slice(0, 3));
      }
    } catch (e) {
      // ignore — user may not have any docs yet
    } finally {
      setLoadingDocs(false);
    }
  };

  const getRiskColor = (label: string) => {
    switch ((label || '').toLowerCase()) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#16a34a';
      default: return '#64748b';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Welcome */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>
          Hello, {user?.name?.split(' ')[0] || 'User'}! <Ionicons name="hand-left-outline" size={24} color="#0f172a" />
        </Text>
        <Text style={styles.welcomeSubtitle}>Ready to analyze your legal documents?</Text>
      </View>

      {/* Feature Cards */}
      <View style={styles.featureCardsContainer}>
        <View style={styles.featureCard}>
          <View style={[styles.featureIconContainer, styles.blueIcon]}>
            <Ionicons name="document-text-outline" size={20} color="#2563eb" />
          </View>
          <Text style={styles.featureCardTitle}>Upload Documents</Text>
          <Text style={styles.featureCardSubtitle}>PDF, TXT, Word</Text>
        </View>
        <View style={styles.featureCard}>
          <View style={[styles.featureIconContainer, styles.indigoIcon]}>
            <Ionicons name="flash-outline" size={20} color="#4f46e5" />
          </View>
          <Text style={styles.featureCardTitle}>AI Analysis</Text>
          <Text style={styles.featureCardSubtitle}>Instant insights</Text>
        </View>
        <View style={styles.featureCard}>
          <View style={[styles.featureIconContainer, styles.purpleIcon]}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#9333ea" />
          </View>
          <Text style={styles.featureCardTitle}>Results</Text>
          <Text style={styles.featureCardSubtitle}>Risk reports</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(tabs)/upload')}
        >
          <View style={styles.buttonIcon}>
            <Ionicons name="document-text-outline" size={24} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.buttonText}>New Analysis</Text>
            <Text style={styles.buttonSubtext}>Upload a contract or legal document</Text>
          </View>
          <Text style={styles.buttonArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/(tabs)/history')}
        >
          <View style={styles.buttonIcon}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="time-outline" size={24} color="#475569" />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.secondaryButtonText}>View History</Text>
            <Text style={styles.secondaryButtonSubtext}>See all past analyses</Text>
          </View>
          <Text style={styles.secondaryButtonArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* How It Works */}
      <View style={styles.infoBox}>
        <Text style={styles.infoParagraph}>How It Works</Text>
        {[
          'Upload your document (PDF, TXT, or Word)',
          'Our AI analyzes the content',
          'Get insights, summary, and risk assessment',
          'Chat with AI to ask follow-up questions',
        ].map((step, i) => (
          <View key={i} style={styles.infoStep}>
            <Text style={styles.infoStepNumber}>{i + 1}.</Text>
            <Text style={styles.infoStepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Recent Documents */}
      {user && (
        <View style={styles.recentDocumentsSection}>
          <Text style={styles.sectionTitle}>Recent Documents</Text>
          {loadingDocs ? (
            <ActivityIndicator color="#2563eb" />
          ) : recentDocs.length > 0 ? (
            recentDocs.map((doc: any) => (
              <TouchableOpacity 
                key={doc._id} 
                style={styles.docItem}
                onPress={() => {
                  if (doc) {
                    GlobalDataStore.currentAnalysis = doc;
                    GlobalDataStore.currentContractText = doc.contractText || '';
                    router.push({
                      pathname: '/result',
                      params: {
                        fileName: doc.filename || 'Document',
                      },
                    });
                  }
                }}
              >
                <View style={styles.docIcon}>
                  <Ionicons name="document-outline" size={20} color="#64748b" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docTitle} numberOfLines={1}>
                    {doc.filename || 'Document'}
                  </Text>
                  <Text style={styles.docDate}>
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                {doc.riskScore?.label && (
                  <View style={{ backgroundColor: getRiskColor(doc.riskScore.label) + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
                    <Text style={{ color: getRiskColor(doc.riskScore.label), fontSize: 12, fontWeight: '600' }}>
                      {doc.riskScore.label}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="mail-open-outline" size={32} color="#cbd5e1" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyText}>No documents yet. Upload your first document to get started!</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
