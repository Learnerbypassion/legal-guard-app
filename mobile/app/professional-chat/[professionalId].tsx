import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { socketService } from '../../src/services/socket.service';
import { getLiveChatHistory } from '../../src/services/livechat.service';
import { GlobalDataStore } from '../../src/services/dataStore';
import { api } from '../../src/services/api';

export default function ProfessionalChatScreen() {
  const { professionalId } = useLocalSearchParams<{ professionalId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const headerHeight = useHeaderHeight();
  
  const [professional, setProfessional] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get active analysis context from the data store if available
  const activeAnalysis = GlobalDataStore.currentAnalysis;

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }
    
    fetchProfessionalDetails();
    setupSocketConnection();
    fetchChatHistory(1);

    return () => {
      // Clean up socket listeners and leave room
      if (socketService.isConnected) {
        socketService.emit('leave-room', { recipientId: professionalId });
      }
      socketService.off('receive-message', handleReceiveMessage);
      socketService.off('user-typing', handleUserTyping);
      socketService.off('user-stop-typing', handleUserStopTyping);
      socketService.off('message-error', handleMessageError);
    };
  }, [professionalId]);

  const fetchProfessionalDetails = async () => {
    try {
      const { data } = await api.get(`/professionals/${professionalId}`);
      if (data.success) {
        setProfessional(data.data);
      }
    } catch (err: any) {
      console.error('Error fetching professional:', err.message);
      // Fallback details
      setProfessional({
        _id: professionalId,
        name: 'Professional Advisor',
        professionalDetails: { profession: 'Advisor', specialization: 'Contract Expert' }
      });
    }
  };

  const setupSocketConnection = async () => {
    try {
      const socket = await socketService.connect();
      socketService.emit('join-room', { recipientId: professionalId });

      // Mark messages from this professional as read
      socketService.emit('mark-read', { senderId: professionalId });

      socketService.on('receive-message', handleReceiveMessage);
      socketService.on('user-typing', handleUserTyping);
      socketService.on('user-stop-typing', handleUserStopTyping);
      socketService.on('message-error', handleMessageError);
    } catch (err: any) {
      console.error('Socket connection failed in chat screen:', err.message);
    }
  };

  const fetchChatHistory = async (pageNum: number) => {
    if (pageNum > 1) setLoadingMore(true);
    else setLoading(true);

    try {
      const response = await getLiveChatHistory(professionalId, pageNum, 30);
      if (response.success) {
        const fetchedMessages = response.data || [];
        if (fetchedMessages.length < 30) {
          setHasMore(false);
        }
        const reversed = [...fetchedMessages].reverse();
        if (pageNum === 1) {
          setMessages(reversed);
        } else {
          setMessages((prev) => [...prev, ...reversed]);
        }
        setPage(pageNum);
      }
    } catch (err: any) {
      console.error('Failed to fetch chat history:', err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleReceiveMessage = (msg: any) => {
    // Check if the message is from or to the current conversation
    if (
      (msg.senderId === professionalId && msg.recipientId === user?._id) ||
      (msg.senderId === user?._id && msg.recipientId === professionalId)
    ) {
      setMessages((prev) => {
        // If we sent the message, check if there is an optimistic temp message to replace
        if (msg.senderId === user?._id) {
          const tempIdx = prev.findIndex(
            (m) => m._id.startsWith('temp-') && m.message === msg.message
          );
          if (tempIdx !== -1) {
            const copy = [...prev];
            copy[tempIdx] = msg;
            return copy;
          }
        }
        // If we received a message from the professional while in the room, mark it as read immediately
        if (msg.senderId === professionalId) {
          socketService.emit('mark-read', { senderId: professionalId });
        }

        // Ensure no duplicates
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [msg, ...prev];
      });
    }
  };

  const handleUserTyping = ({ userId }: { userId: string }) => {
    if (userId === professionalId) {
      setIsRecipientTyping(true);
    }
  };

  const handleUserStopTyping = ({ userId }: { userId: string }) => {
    if (userId === professionalId) {
      setIsRecipientTyping(false);
    }
  };

  const handleMessageError = ({ error }: { error: string }) => {
    Alert.alert('Message Error', error);
  };

  const handleSend = () => {
    if (!inputMessage.trim()) return;

    const messageText = inputMessage.trim();
    setInputMessage('');

    // Emit socket event
    socketService.emit('send-message', {
      recipientId: professionalId,
      message: messageText,
      messageType: 'text',
    });

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const newMsgObj = {
      _id: tempId,
      senderId: user?._id,
      recipientId: professionalId,
      message: messageText,
      messageType: 'text',
      read: false,
      createdAt: new Date().toISOString(),
    };
    
    setMessages((prev) => [newMsgObj, ...prev]);
    
    // Stop typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      socketService.emit('stop-typing', { recipientId: professionalId });
    }
  };

  const handleTyping = (text: string) => {
    setInputMessage(text);

    // Typing socket event
    socketService.emit('typing', { recipientId: professionalId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketService.emit('stop-typing', { recipientId: professionalId });
    }, 2000) as any;
  };

  const handleShareAnalysis = () => {
    if (!activeAnalysis) {
      Alert.alert('No Document Analysis', 'Perform a document analysis first to share it.');
      return;
    }

    Alert.alert(
      'Share Analysis Context',
      `Do you want to share the analysis of "${activeAnalysis.fileName || 'document.pdf'}" with this professional?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Share',
          onPress: () => {
            const docId = activeAnalysis._id || activeAnalysis.id;
            
            // Format context schema
            const contextData = {
              fileName: activeAnalysis.fileName || 'Contract.pdf',
              documentType: activeAnalysis.contractType || 'Unknown',
              riskLevel: activeAnalysis.riskScore?.label || 'Unknown',
              summary: Array.isArray(activeAnalysis.summary) ? activeAnalysis.summary.slice(0, 3) : [activeAnalysis.summary],
              flaggedClauses: (activeAnalysis.cons || []).slice(0, 5).map((con: any) => ({
                title: typeof con === 'string' ? 'Concern' : con.clause || 'Concern',
                text: typeof con === 'string' ? con : con.explanation || '',
                severity: typeof con === 'string' ? 'Medium' : con.severity || 'Medium',
              })),
              language: activeAnalysis.language || 'English',
            };

            socketService.emit('send-message', {
              recipientId: professionalId,
              messageType: 'analysis_context',
              documentId: docId,
              analysisContext: contextData,
            });

            // Optimistic update
            const tempId = `temp-context-${Date.now()}`;
            const newMsgObj = {
              _id: tempId,
              senderId: user?._id,
              recipientId: professionalId,
              message: 'Shared an analysis context card',
              messageType: 'analysis_context',
              documentId: docId,
              analysisContext: contextData,
              read: false,
              createdAt: new Date().toISOString(),
            };

            setMessages((prev) => [newMsgObj, ...prev]);
          },
        },
      ]
    );
  };

  const loadMoreMessages = () => {
    if (loadingMore || !hasMore) return;
    fetchChatHistory(page + 1);
  };

  const getRiskColor = (label: string) => {
    const cleanLabel = label?.toLowerCase() || '';
    if (cleanLabel.includes('high') || cleanLabel.includes('critical')) return '#ef4444';
    if (cleanLabel.includes('medium') || cleanLabel.includes('modest')) return '#f59e0b';
    return '#10b981';
  };

  const renderMessageItem = ({ item, index }: { item: any; index: number }) => {
    const isMe = item.senderId === user?._id;
    const isContext = item.messageType === 'analysis_context';

    // Grouping: Check if previous message (which is at index + 1 in a reversed list) is on a different day
    const currentMsgDate = new Date(item.createdAt);
    let showDateSeparator = false;

    if (index === messages.length - 1) {
      showDateSeparator = true;
    } else {
      const nextMsg = messages[index + 1];
      const nextMsgDate = new Date(nextMsg.createdAt);
      if (currentMsgDate.toDateString() !== nextMsgDate.toDateString()) {
        showDateSeparator = true;
      }
    }

    const formatSeparatorDate = (date: Date) => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) return 'Today';
      if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
      
      return date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    };

    const formatMsgTime = (timeStr: string) => {
      const d = new Date(timeStr);
      return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    return (
      <View>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <View style={styles.dateLine} />
            <Text style={styles.dateText}>{formatSeparatorDate(currentMsgDate)}</Text>
            <View style={styles.dateLine} />
          </View>
        )}

        <View style={[styles.messageRow, isMe ? styles.messageRowRight : styles.messageRowLeft]}>
          {!isMe && (
            <View style={styles.avatarMini}>
              <Text style={styles.avatarMiniText}>
                {professional?.name?.charAt(0)?.toUpperCase() || 'P'}
              </Text>
            </View>
          )}

          <View style={{ maxWidth: '80%' }}>
            {isContext ? (
              // Context Card Rendering
              <View style={[styles.contextCard, isMe ? styles.contextCardRight : styles.contextCardLeft]}>
                <View style={styles.contextHeader}>
                  <Ionicons name="document-text" size={20} color="#2563eb" />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.contextDocName} numberOfLines={1}>
                      {item.analysisContext?.fileName}
                    </Text>
                    <Text style={styles.contextDocType}>
                      {item.analysisContext?.documentType || 'Contract'}
                    </Text>
                  </View>
                  <View style={[styles.contextBadge, { backgroundColor: getRiskColor(item.analysisContext?.riskLevel) }]}>
                    <Text style={styles.contextBadgeText}>
                      {item.analysisContext?.riskLevel || 'Normal'}
                    </Text>
                  </View>
                </View>

                {item.analysisContext?.summary && item.analysisContext.summary.length > 0 && (
                  <View style={styles.contextBody}>
                    <Text style={styles.contextSecTitle}>Key Insights:</Text>
                    {item.analysisContext.summary.map((sumItem: string, idx: number) => (
                      <Text key={idx} style={styles.contextBullet}>
                        • {sumItem}
                      </Text>
                    ))}
                  </View>
                )}

                <TouchableOpacity 
                  style={styles.contextAction}
                  onPress={() => {
                    if (item.documentId) {
                      router.push({
                        pathname: '/result',
                        params: { fileName: item.analysisContext?.fileName },
                      });
                    } else {
                      Alert.alert('Analysis Unavailable', 'Document analysis source is missing.');
                    }
                  }}
                >
                  <Text style={styles.contextActionText}>View Full Analysis</Text>
                  <Ionicons name="chevron-forward" size={14} color="#2563eb" />
                </TouchableOpacity>
              </View>
            ) : (
              // Text Message Bubble
              <View style={[styles.bubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
                <Text style={[styles.messageText, isMe ? styles.messageTextRight : styles.messageTextLeft]}>
                  {item.message}
                </Text>
              </View>
            )}

            <Text style={[styles.messageTime, isMe ? styles.messageTimeRight : styles.messageTimeLeft]}>
              {formatMsgTime(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <Stack.Screen
        options={{
          headerTitle: professional ? `${professional.name} (${professional.professionalDetails?.profession || 'Advisor'})` : 'Professional Chat',
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={[styles.statusDot, { backgroundColor: professional?.isOnline ? '#22c55e' : '#94a3b8' }]} />
              <Text style={styles.statusText}>{professional?.isOnline ? 'Online' : 'Offline'}</Text>
            </View>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={headerHeight}
      >
        <View style={styles.container}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessageItem}
              keyExtractor={(item) => item._id}
              inverted
              onEndReached={loadMoreMessages}
              onEndReachedThreshold={0.2}
              ListFooterComponent={
                loadingMore ? <ActivityIndicator size="small" color="#2563eb" style={{ marginVertical: 12 }} /> : null
              }
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
            />
          )}

          {isRecipientTyping && (
            <View style={styles.typingIndicatorRow}>
              <View style={styles.avatarMini}>
                <Text style={styles.avatarMiniText}>P</Text>
              </View>
              <View style={styles.typingIndicatorBubble}>
                <Text style={styles.typingTextMini}>Typing...</Text>
              </View>
            </View>
          )}

          <View style={styles.inputArea}>
            {activeAnalysis && (
              <TouchableOpacity style={styles.attachBtn} onPress={handleShareAnalysis}>
                <Ionicons name="document-attach-outline" size={24} color="#475569" />
              </TouchableOpacity>
            )}
            
            <TextInput
              style={styles.textInput}
              value={inputMessage}
              onChangeText={handleTyping}
              placeholder="Type your message here..."
              placeholderTextColor="#94a3b8"
              multiline
              maxLength={5000}
            />

            <TouchableOpacity 
              style={[styles.sendBtn, !inputMessage.trim() && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!inputMessage.trim()}
            >
              <Ionicons name="send" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'flex-end',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1b2f4e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarMiniText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleLeft: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bubbleRight: {
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextLeft: {
    color: '#1e293b',
  },
  messageTextRight: {
    color: '#ffffff',
  },
  messageTime: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
  },
  messageTimeLeft: {
    alignSelf: 'flex-start',
  },
  messageTimeRight: {
    alignSelf: 'flex-end',
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dateText: {
    fontSize: 11,
    color: '#94a3b8',
    marginHorizontal: 12,
    fontWeight: '600',
  },
  typingIndicatorRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  typingIndicatorBubble: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typingTextMini: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  inputArea: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'center',
  },
  attachBtn: {
    padding: 8,
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0f172a',
    marginRight: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  // Context Card Styles
  contextCard: {
    width: 280,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
    overflow: 'hidden',
  },
  contextCardLeft: {
    borderBottomLeftRadius: 4,
  },
  contextCardRight: {
    borderBottomRightRadius: 4,
    borderColor: '#bfdbfe',
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dbeafe',
  },
  contextDocName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  contextDocType: {
    fontSize: 11,
    color: '#64748b',
  },
  contextBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  contextBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  contextBody: {
    padding: 12,
  },
  contextSecTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 6,
  },
  contextBullet: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 4,
  },
  contextAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
  },
  contextActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
    marginRight: 4,
  },
});
