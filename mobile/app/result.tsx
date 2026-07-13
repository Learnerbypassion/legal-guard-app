import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getRecommendedProfessionals, contactProfessional } from '../src/services/professional.service';
import { useAuth } from '../src/context/AuthContext';
import { GlobalDataStore } from '../src/services/dataStore';
import { useAnalysisSpeech } from '../src/hooks/useAnalysisSpeech';

type Tab = 'summary' | 'advantages' | 'concerns' | 'clauses' | 'professionals';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  headerBackText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerNewText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '500',
  },
  fileNameContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  fileName: {
    color: '#64748b',
    fontSize: 13,
  },
  riskCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  riskCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskScore: {
    fontSize: 20,
    fontWeight: '900',
  },
  riskSubScore: {
    fontSize: 9,
    fontWeight: '600',
  },
  riskInfo: {
    flex: 1,
  },
  riskBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 12,
  },
  riskBadgeText: {
    fontWeight: '700',
    fontSize: 13,
  },
  riskStatsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  riskStat: {
    justifyContent: 'center',
  },
  riskStatLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  riskStatValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  keyInfoSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  keyInfoText: {
    color: '#475569',
    fontSize: 13,
    marginBottom: 4,
  },
  tabBar: {
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
  },
  tabButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  tabButtonInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  tabIcon: {
    marginRight: 4,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#ffffff',
  },
  tabLabelInactive: {
    color: '#475569',
  },
  contentBox: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  contentSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  contentText: {
    color: '#475569',
    lineHeight: 24,
    marginBottom: 8,
  },
  adviceSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  itemCard: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 8,
  },
  proCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  conCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  clauseCard: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemIcon: {
    fontWeight: '700',
    marginTop: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemClause: {
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  itemType: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  itemText: {
    color: '#475569',
    fontSize: 13,
    marginBottom: 4,
  },
  itemAdvice: {
    color: '#64748b',
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyState: {
    color: '#cbd5e1',
    textAlign: 'center',
    paddingVertical: 24,
  },
  profCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  profName: {
    fontWeight: '700',
    color: '#0f172a',
    fontSize: 16,
  },
  profProfession: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  profInfo: {
    color: '#64748b',
    fontSize: 11,
    marginBottom: 4,
  },
  profContactButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  profContactButtonActive: {
    backgroundColor: '#2563eb',
  },
  profContactButtonSuccess: {
    backgroundColor: '#dcfce7',
  },
  profContactButtonLoading: {
    backgroundColor: '#f1f5f9',
  },
  profContactText: {
    fontWeight: '600',
  },
  profContactTextActive: {
    color: '#ffffff',
  },
  profContactTextSuccess: {
    color: '#16a34a',
  },
  profContactTextLoading: {
    color: '#94a3b8',
  },
  chatButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chatButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  chatButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
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
  emptyResultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 24,
  },
  emptyResultIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyResultText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyResultButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2563eb',
    borderRadius: 12,
  },
  emptyResultButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  speakCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  speakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  speakTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  playingBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  playingBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#2563eb',
  },
  speakingText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 10,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  speakControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  speakButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    borderRadius: 8,
  },
  stopButton: {
    backgroundColor: '#dc2626',
  },
  speakButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  speedSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speedLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  speedButtons: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 2,
  },
  speedBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  speedBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  speedBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
  speedBtnTextActive: {
    color: '#0f172a',
  },
});

export default function ResultScreen() {
  const { fileName } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [contactedIds, setContactedIds] = useState<Record<string, string>>({});
  const [loadingProfs, setLoadingProfs] = useState(false);

  const [analysis, setAnalysis] = useState<any>(null);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const speechLang = (analysis?.language === 'Hindi' || analysis?.language === 'Bengali') ? analysis.language : 'English';
  const { speakingState, currentSection, speak, stop, speed, setSpeed } = useAnalysisSpeech(speechLang);

  useEffect(() => {
    loadData();
  }, []);

  const handleChatNow = (prof: any) => {
    if (!user) {
      Alert.alert(
        'Authentication Required',
        'Please sign in to chat with a professional.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In',
            onPress: () => {
              router.push({
                pathname: '/(auth)/login',
                params: {
                  redirectTo: `/professional-chat/${prof._id}`,
                },
              });
            },
          },
        ]
      );
      return;
    }
    
    router.push({
      pathname: `/professional-chat/${prof._id}` as any,
    });
  };

  const loadData = async () => {
    try {
      const storedAnalysis = GlobalDataStore.currentAnalysis;
      const storedText = GlobalDataStore.currentContractText;
      if (storedAnalysis) {
        setAnalysis(storedAnalysis);
        setText(storedText || '');

        const textType = (storedAnalysis.contractType || '').toLowerCase();
        let profession = 'Lawyer';
        if (textType.includes('financial') || textType.includes('loan') || textType.includes('tax') || textType.includes('investment')) {
          profession = 'CA';
        }
        fetchProfessionals(profession);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessionals = async (type: string) => {
    try {
      setLoadingProfs(true);
      const data = await getRecommendedProfessionals(type);
      if (data.success) setProfessionals(data.data || []);
    } catch {}
    finally { setLoadingProfs(false); }
  };

  const handleContact = async (profId: string) => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to contact professionals.');
      return;
    }
    try {
      setContactedIds((prev) => ({ ...prev, [profId]: 'Sending...' }));
      await contactProfessional(profId);
      setContactedIds((prev) => ({ ...prev, [profId]: 'Sent ✓' }));
    } catch {
      setContactedIds((prev) => ({ ...prev, [profId]: 'Failed' }));
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading analysis...</Text>
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={styles.emptyResultContainer}>
        <Ionicons name="mail-open-outline" size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
        <Text style={styles.emptyResultText}>No analysis results found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.emptyResultButton}>
          <Text style={styles.emptyResultButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const riskScore = analysis.riskScore?.score ?? (typeof analysis.riskScore === 'number' ? analysis.riskScore : 0);
  const riskLabel = analysis.riskScore?.label || '';
  const riskColor = ({ Critical: '#dc2626', High: '#ea580c', Medium: '#ca8a04', Low: '#16a34a' } as Record<string, string>)[riskLabel] || '#64748b';

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'summary', label: 'Summary', icon: 'list-outline' },
    { id: 'advantages', label: 'Pros', icon: 'checkmark-circle-outline' },
    { id: 'concerns', label: 'Cons', icon: 'alert-circle-outline' },
    { id: 'clauses', label: 'Clauses', icon: 'document-text-outline' },
    { id: 'professionals', label: 'Experts', icon: 'people-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Text style={styles.headerBackText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis Result</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/upload')} style={styles.headerButton}>
          <Text style={styles.headerNewText}>New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* File name */}
        {fileName ? (
          <View style={styles.fileNameContainer}>
            <Text style={styles.fileName} numberOfLines={1}>
              <Ionicons name="document-outline" size={14} color="#64748b" /> {fileName}
            </Text>
          </View>
        ) : null}

        {/* Risk Score Card */}
        <View style={styles.riskCard}>
          <View style={styles.riskHeader}>
            {/* Score Circle */}
            <View style={[styles.riskCircle, { borderColor: riskColor, backgroundColor: riskColor + '10' }]}>
              <Text style={[styles.riskScore, { color: riskColor }]}>{riskScore}</Text>
              <Text style={[styles.riskSubScore, { color: riskColor }]}>/ 10</Text>
            </View>

            <View style={styles.riskInfo}>
              {riskLabel ? (
                <View style={[styles.riskBadge, { backgroundColor: riskColor + '20' }]}>
                  <Text style={[styles.riskBadgeText, { color: riskColor }]}>{riskLabel} Risk</Text>
                </View>
              ) : null}
              <View style={styles.riskStatsRow}>
                <View style={styles.riskStat}>
                  <Text style={styles.riskStatLabel}>Advantages</Text>
                  <Text style={[styles.riskStatValue, { color: '#16a34a' }]}>{analysis.pros?.length || 0}</Text>
                </View>
                <View style={styles.riskStat}>
                  <Text style={styles.riskStatLabel}>Concerns</Text>
                  <Text style={[styles.riskStatValue, { color: '#dc2626' }]}>{analysis.cons?.length || 0}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Key Info */}
          {(analysis.parties?.length || analysis.contractType || analysis.keyDates?.length) ? (
            <View style={styles.keyInfoSection}>
              {analysis.contractType && (
                <Text style={styles.keyInfoText}>
                  <Text style={{ fontWeight: '600' }}>Type: </Text>{analysis.contractType}
                </Text>
              )}
              {analysis.parties?.length > 0 && (
                <Text style={styles.keyInfoText}>
                  <Text style={{ fontWeight: '600' }}>Parties: </Text>{analysis.parties.join(', ')}
                </Text>
              )}
              {analysis.keyDates?.length > 0 && (
                <Text style={styles.keyInfoText}>
                  <Text style={{ fontWeight: '600' }}>Key Dates: </Text>{analysis.keyDates.length} found
                </Text>
              )}
            </View>
          ) : null}
        </View>

        {/* Speak Out Loud Section */}
        {analysis ? (
          <View style={styles.speakCard}>
            <View style={styles.speakHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons 
                  name={speakingState === 'playing' ? 'volume-high' : 'volume-mute-outline'} 
                  size={20} 
                  color="#2563eb" 
                />
                <Text style={styles.speakTitle}>Listen to Analysis</Text>
              </View>
              {speakingState === 'playing' && (
                <View style={styles.playingBadge}>
                  <Text style={styles.playingBadgeText}>Reading...</Text>
                </View>
              )}
            </View>

            {speakingState === 'playing' && currentSection ? (
              <Text style={styles.speakingText} numberOfLines={1}>
                Reading: <Text style={{ fontWeight: '700', color: '#1e293b' }}>{currentSection}</Text>
              </Text>
            ) : null}

            <View style={styles.speakControls}>
              {speakingState === 'playing' ? (
                <TouchableOpacity style={[styles.speakButton, styles.stopButton]} onPress={stop}>
                  <Ionicons name="square" size={14} color="#ffffff" />
                  <Text style={styles.speakButtonText}>Stop</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.speakButton} onPress={() => speak(analysis)}>
                  <Ionicons name="play" size={14} color="#ffffff" />
                  <Text style={styles.speakButtonText}>Listen</Text>
                </TouchableOpacity>
              )}

              <View style={styles.speedSelector}>
                <Text style={styles.speedLabel}>Speed:</Text>
                <View style={styles.speedButtons}>
                  {[0.75, 1.0, 1.25, 1.5].map((val) => (
                    <TouchableOpacity
                      key={val}
                      style={[styles.speedBtn, speed === val && styles.speedBtnActive]}
                      onPress={() => setSpeed(val)}
                    >
                      <Text style={[styles.speedBtnText, speed === val && styles.speedBtnTextActive]}>
                        {val}x
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        ) : null}

        {/* Tab Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tabButton, activeTab === tab.id ? styles.tabButtonActive : styles.tabButtonInactive]}
            >
              <Ionicons 
                name={tab.icon} 
                size={16} 
                color={activeTab === tab.id ? '#ffffff' : '#475569'} 
                style={styles.tabIcon} 
              />
              <Text style={[styles.tabLabel, activeTab === tab.id ? styles.tabLabelActive : styles.tabLabelInactive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tab Content */}
        <View style={styles.contentBox}>
          {/* Summary */}
          {activeTab === 'summary' && (
            <View>
              <Text style={styles.contentTitle}>Executive Summary</Text>
              {Array.isArray(analysis.summary) ? (
                analysis.summary.map((point: string, i: number) => (
                  <Text key={i} style={styles.contentText}>{point}</Text>
                ))
              ) : (
                <Text style={styles.contentText}>{analysis.summary || 'No summary available.'}</Text>
              )}
              {analysis.overallAdvice ? (
                <View style={styles.adviceSection}>
                  <Text style={styles.contentTitle}>Overall Advice</Text>
                  <Text style={styles.contentText}>{analysis.overallAdvice}</Text>
                </View>
              ) : null}
            </View>
          )}

          {/* Advantages */}
          {activeTab === 'advantages' && (
            <View>
              <Text style={styles.contentTitle}>Advantages</Text>
              {analysis.pros?.length > 0 ? analysis.pros.map((pro: any, i: number) => (
                <View key={i} style={[styles.itemCard, styles.proCard]}>
                  <Ionicons name="checkmark-circle" size={18} color="#16a34a" style={{ marginTop: 2 }} />
                  <View style={styles.itemContent}>
                    {typeof pro === 'string' ? (
                      <Text style={styles.itemText}>{pro}</Text>
                    ) : (
                      <>
                        {pro.clause && <Text style={styles.itemClause}>{pro.clause}</Text>}
                        {pro.explanation && <Text style={styles.itemText}>{pro.explanation}</Text>}
                        {pro.advice && <Text style={styles.itemAdvice}>{pro.advice}</Text>}
                      </>
                    )}
                  </View>
                </View>
              )) : <Text style={styles.emptyState}>No advantages identified.</Text>}
            </View>
          )}

          {/* Concerns */}
          {activeTab === 'concerns' && (
            <View>
              <Text style={styles.contentTitle}>Concerns</Text>
              {analysis.cons?.length > 0 ? analysis.cons.map((con: any, i: number) => (
                <View key={i} style={[styles.itemCard, styles.conCard]}>
                  <Ionicons name="alert-circle" size={18} color="#dc2626" style={{ marginTop: 2 }} />
                  <View style={styles.itemContent}>
                    {typeof con === 'string' ? (
                      <Text style={styles.itemText}>{con}</Text>
                    ) : (
                      <>
                        {con.clause && <Text style={styles.itemClause}>{con.clause}</Text>}
                        {con.explanation && <Text style={styles.itemText}>{con.explanation}</Text>}
                        {con.advice && <Text style={styles.itemAdvice}>{con.advice}</Text>}
                      </>
                    )}
                  </View>
                </View>
              )) : <Text style={styles.emptyState}>No concerns identified.</Text>}
            </View>
          )}

          {/* Clauses */}
          {activeTab === 'clauses' && (
            <View>
              <Text style={styles.contentTitle}>Highlighted Clauses</Text>
              {analysis.highlightedClauses?.length > 0 ? analysis.highlightedClauses.map((clause: any, i: number) => (
                <View key={i} style={[styles.itemCard, styles.clauseCard]}>
                  <View style={{ flex: 1 }}>
                    {typeof clause === 'string' ? (
                      <>
                        <Text style={styles.itemClause}>Clause {i + 1}</Text>
                        <Text style={[styles.itemText, { fontSize: 12 }]}>{clause}</Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.itemClause}>{clause.title || `Clause ${i + 1}`}</Text>
                        {clause.type && <Text style={styles.itemType}>{clause.type}</Text>}
                        {clause.text && <Text style={[styles.itemText, { marginBottom: 4 }]}>{clause.text}</Text>}
                        {clause.explanation && <Text style={styles.itemAdvice}>{clause.explanation}</Text>}
                      </>
                    )}
                  </View>
                </View>
              )) : <Text style={styles.emptyState}>No highlighted clauses.</Text>}
            </View>
          )}

          {/* Professionals */}
          {activeTab === 'professionals' && (
            <View>
              <Text style={styles.contentTitle}>Recommended Experts</Text>
              <Text style={styles.contentSubtitle}>Based on anomalies detected in this document.</Text>
              {loadingProfs ? (
                <ActivityIndicator color="#2563eb" />
              ) : professionals.length > 0 ? (
                professionals.map((prof: any) => (
                  <View key={prof._id} style={styles.profCard}>
                    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                      <View style={{ position: 'relative' }}>
                        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#1b2f4e', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 16 }}>
                            {prof.name?.charAt(0)?.toUpperCase()}
                          </Text>
                        </View>
                        <View style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          borderWidth: 2,
                          borderColor: '#ffffff',
                          backgroundColor: prof.isOnline ? '#22c55e' : '#94a3b8'
                        }} />
                      </View>
                      
                      <View style={{ flex: 1 }}>
                        <Text style={styles.profName}>{prof.name}</Text>
                        <Text style={styles.profProfession}>
                          {prof.professionalDetails?.profession} • {prof.isOnline ? 'Online' : 'Offline'}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef08a', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                        <Ionicons name="star" size={12} color="#ca8a04" />
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#854d0e' }}>
                          {prof.professionalDetails?.rating || '5.0'}
                        </Text>
                      </View>
                    </View>

                    {prof.professionalDetails?.specialization && (
                      <Text style={styles.profInfo}>
                        <Text style={{ fontWeight: '600' }}>Specialization:</Text> {prof.professionalDetails.specialization}
                      </Text>
                    )}
                    {prof.professionalDetails?.education && (
                      <Text style={styles.profInfo}>
                        <Text style={{ fontWeight: '600' }}>Education:</Text> {prof.professionalDetails.education}
                      </Text>
                    )}
                    {prof.professionalDetails?.experience && (
                      <Text style={styles.profInfo}>
                        <Text style={{ fontWeight: '600' }}>Experience:</Text> {prof.professionalDetails.experience}
                      </Text>
                    )}
                    {prof.professionalDetails?.languages && prof.professionalDetails.languages.length > 0 && (
                      <Text style={styles.profInfo}>
                        <Text style={{ fontWeight: '600' }}>Languages:</Text> {prof.professionalDetails.languages.join(', ')}
                      </Text>
                    )}

                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                      <TouchableOpacity
                        onPress={() => handleContact(prof._id)}
                        disabled={contactedIds[prof._id] === 'Sent ✓' || contactedIds[prof._id] === 'Sending...'}
                        style={[
                          styles.profContactButton,
                          { flex: 1, marginTop: 0 },
                          contactedIds[prof._id] === 'Sent ✓' ? styles.profContactButtonSuccess :
                          contactedIds[prof._id] === 'Sending...' ? styles.profContactButtonLoading :
                          styles.profContactButtonActive,
                        ]}
                      >
                        <Text style={[
                          styles.profContactText,
                          contactedIds[prof._id] === 'Sent ✓' ? styles.profContactTextSuccess :
                          contactedIds[prof._id] === 'Sending...' ? styles.profContactTextLoading :
                          styles.profContactTextActive,
                        ]}>
                          {contactedIds[prof._id] || 'Send Email'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleChatNow(prof)}
                        style={[styles.profContactButton, styles.profContactButtonActive, { flex: 1, marginTop: 0, backgroundColor: '#1b2f4e', flexDirection: 'row', gap: 4, justifyContent: 'center' }]}
                      >
                        <Ionicons name="chatbubble-ellipses-outline" size={14} color="#ffffff" />
                        <Text style={[styles.profContactText, styles.profContactTextActive]}>
                          Chat Now
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyState}>No professionals available right now.</Text>
              )}
            </View>
          )}
        </View>

        {/* Chat Button */}
        <View>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => router.push({ pathname: '/chat', params: { language: 'English' } })}
          >
            <Ionicons name="chatbubbles-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.chatButtonText}>Chat with AI about this Document</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
