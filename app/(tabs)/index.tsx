import { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Vibration,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, fontSize, fontWeight, shadows } from '../../src/theme';

interface CheckInState {
  isCheckedIn: boolean;
  lastCheckIn: string | null;
  nextCheckInDue: string | null;
}

const STORAGE_KEY = '@solguard:checkin_state';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [state, setState] = useState<CheckInState>({
    isCheckedIn: false,
    lastCheckIn: null,
    nextCheckInDue: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadState();
    startPulseAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setState(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load state:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveState = async (newState: CheckInState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  };

  const handleCheckIn = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const now = new Date();
    const nextDue = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    const newState: CheckInState = {
      isCheckedIn: true,
      lastCheckIn: now.toISOString(),
      nextCheckInDue: nextDue.toISOString(),
    };
    
    setState(newState);
    saveState(newState);
    
    Alert.alert(
      '✓ Check-In Complete',
      `You're safe! Next check-in due: ${nextDue.toLocaleDateString()} at ${nextDue.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      [{ text: 'Got it' }]
    );
  };

  const handleCheckInPress = () => {
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
    
    handleCheckIn();
  };

  const formatLastCheckIn = () => {
    if (!state.lastCheckIn) return 'Never';
    const date = new Date(state.lastCheckIn);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = () => {
    if (!state.isCheckedIn) return colors.destructive;
    return colors.success;
  };

  const getStatusText = () => {
    if (!state.isCheckedIn) return 'Not Checked In';
    return 'Checked In';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Header */}
        <View style={styles.statusSection}>
          <Animated.View 
            style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor() + '15' }
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </Animated.View>
          
          {state.lastCheckIn && (
            <Text style={styles.lastCheckInText}>
              Last check-in: {formatLastCheckIn()}
            </Text>
          )}
        </View>

        {/* Main Check-In Button */}
        <View style={styles.buttonSection}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              onPress={handleCheckInPress}
              activeOpacity={0.9}
            >
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <LinearGradient
                  colors={state.isCheckedIn 
                    ? [colors.success, '#15803D'] 
                    : [colors.brand, colors.brandDark]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.checkInButton}
                >
                  <Text style={styles.checkInButtonIcon}>
                    {state.isCheckedIn ? '✓' : '🛡️'}
                  </Text>
                  <Text style={styles.checkInButtonText}>
                    {state.isCheckedIn ? 'Check In Again' : "I'm Safe"}
                  </Text>
                  <Text style={styles.checkInButtonSubtext}>
                    Tap to confirm you're okay
                  </Text>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
          
          <Text style={styles.buttonHint}>
            {state.isCheckedIn 
              ? "You're protected for the next 24 hours"
              : 'Check in now to stay protected'
            }
          </Text>
        </View>

        {/* Info Cards */}
        <View style={styles.infoCards}>
          <TouchableOpacity 
            style={styles.infoCard}
            onPress={() => router.push('/check-in-history')}
          >
            <View style={styles.infoCardLeft}>
              <Text style={styles.infoCardIcon}>📋</Text>
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardTitle}>Check-In History</Text>
                <Text style={styles.infoCardSubtitle}>View past check-ins</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.infoCard}
            onPress={() => router.push('/contacts')}
          >
            <View style={styles.infoCardLeft}>
              <Text style={styles.infoCardIcon}>👥</Text>
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardTitle}>Emergency Contacts</Text>
                <Text style={styles.infoCardSubtitle}>Manage who gets alerted</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.infoCard}
            onPress={() => router.push('/schedule')}
          >
            <View style={styles.infoCardLeft}>
              <Text style={styles.infoCardIcon}>⏰</Text>
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardTitle}>Scheduled Check-Ins</Text>
                <Text style={styles.infoCardSubtitle}>Set automatic reminders</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Protection Status */}
        <View style={styles.protectionSection}>
          <Text style={styles.sectionTitle}>Protection Status</Text>
          <View style={styles.protectionCard}>
            <View style={styles.protectionRow}>
              <View style={[styles.protectionDot, { backgroundColor: state.isCheckedIn ? colors.success : colors.destructive }]} />
              <Text style={styles.protectionLabel}>
                {state.isCheckedIn ? 'Protection Active' : 'Protection Paused'}
              </Text>
            </View>
            <Text style={styles.protectionDesc}>
              {state.isCheckedIn 
                ? 'Your contacts will be notified if you miss your next check-in.'
                : 'Check in to activate protection and keep your contacts informed.'
              }
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
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  statusText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
  },
  lastCheckInText: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
  },
  buttonSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  checkInButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  checkInButtonIcon: {
    fontSize: 48,
    marginBottom: spacing.xs,
  },
  checkInButtonText: {
    fontSize: fontSize.title2,
    fontWeight: fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  checkInButtonSubtext: {
    fontSize: fontSize.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  buttonHint: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  infoCards: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  infoCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoCardIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: 2,
  },
  infoCardSubtitle: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: 24,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  protectionSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.title3,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  protectionCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  protectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  protectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  protectionLabel: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  protectionDesc: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
