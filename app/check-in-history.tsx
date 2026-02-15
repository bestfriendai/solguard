import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, radius, fontSize, fontWeight } from '../src/theme';

interface CheckIn {
  id: string;
  timestamp: string;
  status: 'checked_in' | 'missed' | 'alert_sent';
}

const STORAGE_KEY = '@solguard:checkin_history';

export default function CheckInHistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [history, setHistory] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' }) + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const getStatusColor = (status: CheckIn['status']) => {
    switch (status) {
      case 'checked_in':
        return colors.success;
      case 'missed':
        return colors.warning;
      case 'alert_sent':
        return colors.destructive;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: CheckIn['status']) => {
    switch (status) {
      case 'checked_in':
        return 'Checked In';
      case 'missed':
        return 'Missed';
      case 'alert_sent':
        return 'Alert Sent';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (status: CheckIn['status']) => {
    switch (status) {
      case 'checked_in':
        return '✓';
      case 'missed':
        return '⏰';
      case 'alert_sent':
        return '🚨';
      default:
        return '?';
    }
  };

  const renderItem = ({ item }: { item: CheckIn }) => (
    <View style={styles.historyItem}>
      <View style={[
        styles.statusIcon,
        { backgroundColor: getStatusColor(item.status) + '20' }
      ]}>
        <Text style={[styles.statusIconText, { color: getStatusColor(item.status) }]}>
          {getStatusIcon(item.status)}
        </Text>
      </View>
      <View style={styles.historyContent}>
        <Text style={styles.historyDate}>{formatDate(item.timestamp)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{history.filter(h => h.status === 'checked_in').length}</Text>
            <Text style={styles.statLabel}>Check-Ins</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{history.filter(h => h.status === 'missed').length}</Text>
            <Text style={styles.statLabel}>Missed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{history.filter(h => h.status === 'alert_sent').length}</Text>
            <Text style={styles.statLabel}>Alerts</Text>
          </View>
        </View>

        {/* History List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>History</Text>
          
          {history.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No History Yet</Text>
              <Text style={styles.emptySubtitle}>
                Your check-in history will appear here
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {history.map((item) => (
                <View key={item.id}>
                  {renderItem({ item })}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.headline,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.title3,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.title3,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  historyList: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statusIconText: {
    fontSize: 16,
    fontWeight: fontWeight.bold,
  },
  historyContent: {
    flex: 1,
  },
  historyDate: {
    fontSize: fontSize.body,
    color: colors.text,
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
  },
});
