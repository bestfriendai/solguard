import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, fontSize, fontWeight } from '../../src/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [location, setLocation] = useState(false);

  const toggleNotifications = () => {
    Haptics.selectionAsync();
    setNotifications(!notifications);
  };

  const toggleSound = () => {
    Haptics.selectionAsync();
    setSound(!sound);
  };

  const toggleVibration = () => {
    Haptics.selectionAsync();
    setVibration(!vibration);
  };

  const toggleLocation = () => {
    Haptics.selectionAsync();
    setLocation(!location);
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all your check-ins, contacts, and schedules. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            try {
              await AsyncStorage.clear();
              Alert.alert('Data Reset', 'All data has been cleared. Please restart the app.');
            } catch (e) {
              Alert.alert('Error', 'Failed to reset data.');
            }
          }
        },
      ]
    );
  };

  const handleViewPrivacyPolicy = () => {
    Linking.openURL('https://example.com/privacy');
  };

  const handleViewTerms = () => {
    Linking.openURL('https://example.com/terms');
  };

  const handleRateApp = () => {
    // Would open App Store
    Alert.alert('Rate App', 'Thank you for your support!');
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@solguard.app');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.row} onPress={toggleNotifications}>
              <Text style={styles.rowTitle}>Push Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={toggleNotifications}
                trackColor={{ false: colors.border, true: colors.brand + '40' }}
                thumbColor={notifications ? colors.brand : '#f4f3f4'}
              />
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.row} onPress={toggleSound}>
              <Text style={styles.rowTitle}>Sound</Text>
              <Switch
                value={sound}
                onValueChange={toggleSound}
                trackColor={{ false: colors.border, true: colors.brand + '40' }}
                thumbColor={sound ? colors.brand : '#f4f3f4'}
              />
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.row} onPress={toggleVibration}>
              <Text style={styles.rowTitle}>Vibration</Text>
              <Switch
                value={vibration}
                onValueChange={toggleVibration}
                trackColor={{ false: colors.border, true: colors.brand + '40' }}
                thumbColor={vibration ? colors.brand : '#f4f3f4'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>PRIVACY</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.row} onPress={toggleLocation}>
              <Text style={styles.rowTitle}>Share Location in Alerts</Text>
              <Switch
                value={location}
                onValueChange={toggleLocation}
                trackColor={{ false: colors.border, true: colors.brand + '40' }}
                thumbColor={location ? colors.brand : '#f4f3f4'}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionFooter}>
            When enabled, your current location will be included in emergency alerts sent to your contacts.
          </Text>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ABOUT</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.row} onPress={handleRateApp}>
              <Text style={styles.rowTitle}>Rate SoloGuard</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.row} onPress={handleContactSupport}>
              <Text style={styles.rowTitle}>Contact Support</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.row} onPress={handleViewPrivacyPolicy}>
              <Text style={styles.rowTitle}>Privacy Policy</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.row} onPress={handleViewTerms}>
              <Text style={styles.rowTitle}>Terms of Service</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>SoloGuard v1.0.0</Text>
          <Text style={styles.buildText}>Build 1</Text>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>DANGER ZONE</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.row} onPress={handleResetData}>
              <Text style={[styles.rowTitle, styles.destructiveText]}>Reset All Data</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginLeft: spacing.md,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: colors.background,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  sectionFooter: {
    fontSize: fontSize.caption,
    color: colors.textTertiary,
    marginLeft: spacing.md,
    marginTop: spacing.sm,
    marginRight: spacing.md,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  rowTitle: {
    fontSize: fontSize.body,
    color: colors.text,
  },
  chevron: {
    fontSize: 20,
    color: colors.textTertiary,
  },
  destructiveText: {
    color: colors.destructive,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  versionText: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
  },
  buildText: {
    fontSize: fontSize.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
});
