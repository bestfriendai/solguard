import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, fontSize, fontWeight } from '../../src/theme';

interface Schedule {
  id: string;
  enabled: boolean;
  time: string; // "HH:MM"
  repeatDays: number[]; // 0=Sun, 1=Mon, etc.
  label: string;
}

const STORAGE_KEY = '@solguard:schedules';

const DEFAULT_SCHEDULES: Schedule[] = [
  {
    id: '1',
    enabled: true,
    time: '08:00',
    repeatDays: [1, 2, 3, 4, 5],
    label: 'Morning Check-In',
  },
  {
    id: '2',
    enabled: true,
    time: '21:00',
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    label: 'Evening Check-In',
  },
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSchedules(JSON.parse(stored));
      } else {
        setSchedules(DEFAULT_SCHEDULES);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SCHEDULES));
      }
    } catch (e) {
      console.error('Failed to load schedules:', e);
      setSchedules(DEFAULT_SCHEDULES);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSchedules = async (newSchedules: Schedule[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSchedules));
    } catch (e) {
      console.error('Failed to save schedules:', e);
    }
  };

  const toggleSchedule = async (id: string) => {
    Haptics.selectionAsync();
    
    const updated = schedules.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    setSchedules(updated);
    saveSchedules(updated);
  };

  const deleteSchedule = (id: string) => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this scheduled check-in?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            const updated = schedules.filter(s => s.id !== id);
            setSchedules(updated);
            saveSchedules(updated);
          }
        },
      ]
    );
  };

  const formatTime = (time: string) => {
    const [hours, mins] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${mins} ${ampm}`;
  };

  const formatRepeatDays = (days: number[]) => {
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Weekdays';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
    return days.map(d => DAY_NAMES[d]).join(', ');
  };

  const getNextOccurrence = (schedule: Schedule) => {
    const now = new Date();
    const [hours, mins] = schedule.time.split(':');
    let next = new Date(now);
    next.setHours(parseInt(hours, 10), parseInt(mins, 10), 0, 0);
    
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    
    // Find next day that matches
    for (let i = 0; i < 7; i++) {
      const dayOfWeek = next.getDay();
      if (schedule.repeatDays.includes(dayOfWeek)) {
        return next;
      }
      next.setDate(next.getDate() + 1);
    }
    
    return next;
  };

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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scheduled Check-Ins</Text>
          <Text style={styles.headerSubtitle}>
            Set up automatic check-in reminders
          </Text>
        </View>

        {/* Schedule List */}
        <View style={styles.section}>
          {schedules.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>⏰</Text>
              <Text style={styles.emptyTitle}>No Schedules Yet</Text>
              <Text style={styles.emptySubtitle}>
                Add a scheduled check-in to get automatic reminders
              </Text>
            </View>
          ) : (
            schedules.map((schedule) => (
              <View key={schedule.id} style={styles.scheduleCard}>
                <View style={styles.scheduleHeader}>
                  <View style={styles.scheduleTimeRow}>
                    <Text style={styles.scheduleTime}>
                      {formatTime(schedule.time)}
                    </Text>
                    <Switch
                      value={schedule.enabled}
                      onValueChange={() => toggleSchedule(schedule.id)}
                      trackColor={{ 
                        false: colors.border, 
                        true: colors.brand + '40' 
                      }}
                      thumbColor={schedule.enabled ? colors.brand : '#f4f3f4'}
                    />
                  </View>
                  <Text style={styles.scheduleLabel}>{schedule.label}</Text>
                  <Text style={styles.scheduleDays}>
                    {formatRepeatDays(schedule.repeatDays)}
                  </Text>
                </View>
                
                <View style={styles.scheduleFooter}>
                  <Text style={styles.nextOccurrence}>
                    Next: {getNextOccurrence(schedule).toLocaleDateString([], { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => deleteSchedule(schedule.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Add Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => Alert.alert(
            'Add Schedule',
            'Schedule creation coming soon! For now, use the default schedules.',
            [{ text: 'OK' }]
          )}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Add Schedule</Text>
        </TouchableOpacity>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How It Works</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoNumber}>1</Text>
            <Text style={styles.infoText}>
              Set a time and days for your check-in reminders
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoNumber}>2</Text>
            <Text style={styles.infoText}>
              You'll receive a notification at each scheduled time
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoNumber}>3</Text>
            <Text style={styles.infoText}>
              If you don't check in, your contacts will be alerted
            </Text>
          </View>
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
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize.largeTitle,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  section: {
    gap: spacing.md,
    marginBottom: spacing.lg,
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
  scheduleCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  scheduleHeader: {
    marginBottom: spacing.md,
  },
  scheduleTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  scheduleTime: {
    fontSize: fontSize.headline,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  scheduleLabel: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  scheduleDays: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
  },
  scheduleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextOccurrence: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
  },
  deleteText: {
    fontSize: fontSize.caption,
    color: colors.destructive,
    fontWeight: fontWeight.medium,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  addButtonIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    marginRight: spacing.sm,
    fontWeight: fontWeight.bold,
  },
  addButtonText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    color: '#FFFFFF',
  },
  infoSection: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  infoTitle: {
    fontSize: fontSize.title3,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  infoNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brand,
    color: '#FFFFFF',
    fontSize: fontSize.caption,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
