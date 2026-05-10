import React, { useState, useEffect } from 'react';
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  refreshButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  refreshButtonText: {
    color: '#475569',
    fontSize: 13,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 14,
  },
  emptyButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  documentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardFileDetails: {
    flex: 1,
  },
  cardFileName: {
    fontWeight: '600',
    color: '#0f172a',
    fontSize: 15,
  },
  cardFileDate: {
    color: '#cbd5e1',
    fontSize: 11,
    marginTop: 4,
  },
  cardRiskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  cardRiskBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardMetrics: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#f1f5f9',
    borderBottomColor: '#f1f5f9',
  },
  cardMetricItem: {
    alignItems: 'center',
  },
  cardMetricLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
  },
  cardMetricValue: {
    fontWeight: '700',
    color: '#0f172a',
    fontSize: 14,
  },
  cardMetricContractType: {
    flex: 1,
  },
  cardMetricContractTypeLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
  },
  cardMetricContractTypeValue: {
    fontWeight: '500',
    color: '#475569',
    fontSize: 12,
  },
  cardFooter: {
    alignItems: 'flex-end',
    marginTop: 12,
  },
  cardFooterText: {
    color: '#2563eb',
    fontSize: 11,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    color: '#64748b',
    marginTop: 12,
  },
});

export default function HistoryScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserDocuments();
      if (data.success) {
        setDocuments(data.data || []);
      } else {
        setError(data.message || 'Failed to load history.');
      }
    } catch (e: any) {
      const msg = e.response?.data?.error || e.message || 'Network error';
      setError(`Failed to load history: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (label: string) => {
    switch ((label || '').toLowerCase()) {
      case 'critical': return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
      case 'high': return { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' };
      case 'medium': return { bg: '#fefce8', text: '#ca8a04', border: '#fde68a' };
      case 'low': return { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' };
      default: return { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading your history...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Document History</Text>
         <TouchableOpacity
           onPress={fetchDocuments}
           style={[styles.refreshButton, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}
         >
           <Ionicons name="refresh-outline" size={14} color="#475569" />
           <Text style={styles.refreshButtonText}>Refresh</Text>
         </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {documents.length === 0 ? (
         <View style={styles.emptyContainer}>
           <Ionicons name="mail-open-outline" size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
           <Text style={styles.emptyTitle}>No Documents Yet</Text>
          <Text style={styles.emptySubtitle}>Upload your first document to see your analysis history here.</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/(tabs)/upload')}
          >
            <Text style={styles.emptyButtonText}>Upload Document</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {documents.map((doc: any) => {
            const riskLabel = doc.riskScore?.label || '';
            const riskScore = doc.riskScore?.score;
            const colors = getRiskColor(riskLabel);

            return (
              <TouchableOpacity
                key={doc._id}
                style={styles.documentCard}
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
                <View style={styles.cardHeader}>
                  <View style={styles.cardFileInfo}>
                     <View style={styles.cardIcon}>
                       <Ionicons name="document-text-outline" size={20} color="#64748b" />
                     </View>
                    <View style={styles.cardFileDetails}>
                      <Text style={styles.cardFileName} numberOfLines={1}>
                        {doc.filename || 'Document'}
                      </Text>
                      <Text style={styles.cardFileDate}>
                        {new Date(doc.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>
                  {riskLabel ? (
                    <View style={[styles.cardRiskBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                      <Text style={[styles.cardRiskBadgeText, { color: colors.text }]}>{riskLabel}</Text>
                    </View>
                  ) : null}
                </View>

                {doc && (
                  <View style={styles.cardMetrics}>
                    {typeof riskScore === 'number' && (
                      <View style={styles.cardMetricItem}>
                        <Text style={styles.cardMetricLabel}>Risk</Text>
                        <Text style={styles.cardMetricValue}>{riskScore}/10</Text>
                      </View>
                    )}
                    {doc.pros?.length > 0 && (
                      <View style={styles.cardMetricItem}>
                        <Text style={styles.cardMetricLabel}>Pros</Text>
                        <Text style={[styles.cardMetricValue, { color: '#16a34a' }]}>{doc.pros.length}</Text>
                      </View>
                    )}
                    {doc.cons?.length > 0 && (
                      <View style={styles.cardMetricItem}>
                        <Text style={styles.cardMetricLabel}>Cons</Text>
                        <Text style={[styles.cardMetricValue, { color: '#dc2626' }]}>{doc.cons.length}</Text>
                      </View>
                    )}
                    {doc.contractType && (
                      <View style={styles.cardMetricContractType}>
                        <Text style={styles.cardMetricContractTypeLabel}>Type</Text>
                        <Text style={styles.cardMetricContractTypeValue} numberOfLines={1}>{doc.contractType}</Text>
                      </View>
                    )}
                  </View>
                )}

                 <View style={styles.cardFooter}>
                   <Text style={styles.cardFooterText}>View Full Analysis <Ionicons name="arrow-forward" size={12} color="#2563eb" /></Text>
                 </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
