import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing } from '../../src/theme';

// Simple icon components (SF Symbol style)
function ShieldIcon({ focused }: { focused: boolean }) {
  return (
    <View style={styles.iconContainer}>
      <View style={[styles.shield, focused && styles.iconFocused]}>
        <Text style={[styles.shieldIcon, focused && styles.iconTextFocused]}>🛡</Text>
      </View>
    </View>
  );
}

function ClockIcon({ focused }: { focused: boolean }) {
  return (
    <View style={styles.iconContainer}>
      <View style={[styles.circle, focused && styles.iconFocused]}>
        <Text style={[styles.clockIcon, focused && styles.iconTextFocused]}>⏱</Text>
      </View>
    </View>
  );
}

function UserIcon({ focused }: { focused: boolean }) {
  return (
    <View style={styles.iconContainer}>
      <View style={[styles.circle, focused && styles.iconFocused]}>
        <Text style={[styles.userIcon, focused && styles.iconTextFocused]}>👤</Text>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: styles.tabBarLabel,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontWeight: '600', fontSize: 17 },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Check-In',
          headerTitle: 'SoloGuard',
          tabBarIcon: ({ focused }) => <ShieldIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          headerTitle: 'My Schedule',
          tabBarIcon: ({ focused }) => <ClockIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          headerTitle: 'Emergency Contacts',
          tabBarIcon: ({ focused }) => <UserIcon focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: 0.5,
    height: 85,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  iconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shield: {
    width: 26,
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconFocused: {
    backgroundColor: colors.brandLight,
  },
  shieldIcon: {
    fontSize: 18,
  },
  clockIcon: {
    fontSize: 16,
  },
  userIcon: {
    fontSize: 16,
  },
  iconTextFocused: {
    // Emoji colors stay the same
  },
});
