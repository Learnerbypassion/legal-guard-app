import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { getConversationsApi } from '../../src/services/api';
import { socketService } from '../../src/services/socket.service';

interface Partner {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'professional';
  professionalDetails?: {
    profession?: string;
  };
}

interface Conversation {
  _id: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  partner: Partner;
}

export default function ChatListScreen() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Load conversations when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadConversations(true);
      }
    }, [user])
  );

  // Listen for real-time socket events to update the list automatically
  useEffect(() => {
    if (!user) return;

    const handleRealtimeUpdate = () => {
      loadConversations(true);
    };

    const setupSocket = async () => {
      try {
        await socketService.connect();
        socketService.on('receive-message', handleRealtimeUpdate);
        socketService.on('messages-read', handleRealtimeUpdate);
      } catch (err) {
        console.error('Socket connection failed in chat list:', err);
      }
    };

    setupSocket();

    return () => {
      socketService.off('receive-message', handleRealtimeUpdate);
      socketService.off('messages-read', handleRealtimeUpdate);
    };
  }, [user]);

  const loadConversations = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getConversationsApi();
      if (res.success) {
        setConversations(res.data);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadConversations(true);
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.guestCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color="#2563eb" />
          </View>
          <Text style={styles.guestTitle}>Direct Expert Messaging</Text>
          <Text style={styles.guestSubtitle}>
            Log in to chat directly with verified legal professionals and track all your active consult rooms.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonText}>Sign In / Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const isProfessional = item.partner.role === 'professional';
    const roleTag = isProfessional
      ? item.partner.professionalDetails?.profession || 'Professional'
      : 'Client';

    return (
      <TouchableOpacity
        style={styles.chatCard}
        onPress={() =>
          router.push({
            pathname: `/professional-chat/${item.partner._id}` as any,
          })
        }
      >
        {/* Avatar */}
        <View style={[styles.avatar, isProfessional ? styles.avatarProfessional : styles.avatarUser]}>
          <Text style={styles.avatarText}>{getInitials(item.partner.name)}</Text>
        </View>

        {/* Content */}
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.partnerName} numberOfLines={1}>
              {item.partner.name}
            </Text>
            <Text style={styles.timeText}>{formatTime(item.lastMessageAt)}</Text>
          </View>

          <View style={styles.roleRow}>
            <Text style={[styles.roleBadge, isProfessional ? styles.roleBadgeProfessional : styles.roleBadgeUser]}>
              {roleTag}
            </Text>
          </View>

          <View style={styles.messageRow}>
            <Text style={styles.lastMessageText} numberOfLines={1}>
              {item.lastMessage}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          renderItem={renderConversationItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#2563eb']} />
          }
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="chatbubble-ellipses-outline" size={48} color="#94a3b8" />
              </View>
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptySubtitle}>
                {user.role === 'professional'
                  ? 'Your active client chat rooms will show up here when they contact you.'
                  : 'Start a consultation with recommended legal professionals after analyzing documents.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  guestCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  chatCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarProfessional: {
    backgroundColor: '#eff6ff',
  },
  avatarUser: {
    backgroundColor: '#f0fdf4',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  roleRow: {
    marginBottom: 6,
  },
  roleBadge: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
  },
  roleBadgeProfessional: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
  },
  roleBadgeUser: {
    backgroundColor: '#f0fdf4',
    color: '#15803d',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessageText: {
    fontSize: 13,
    color: '#64748b',
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 48,
  },
  emptyIconBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});
