import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, fontSize, fontWeight } from '../../src/theme';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  isPrimary: boolean;
  createdAt: string;
}

const STORAGE_KEY = '@solguard:contacts';

export default function AddContactScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: 'Family',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!newContact.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    setIsLoading(true);
    
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      let contacts: Contact[] = stored ? JSON.parse(stored) : [];
      
      const contact: Contact = {
        id: Date.now().toString(),
        name: newContact.name.trim(),
        phone: newContact.phone.trim(),
        email: newContact.email.trim(),
        relationship: newContact.relationship,
        isPrimary: contacts.length === 0,
        createdAt: new Date().toISOString(),
      };

      contacts.push(contact);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e) {
      console.error('Failed to save contact:', e);
      Alert.alert('Error', 'Failed to save contact');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Form */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>CONTACT INFORMATION</Text>
          <View style={styles.sectionContent}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                value={newContact.name}
                onChangeText={(text) => setNewContact({ ...newContact, name: text })}
                placeholder="Enter name"
                placeholderTextColor={colors.textTertiary}
                autoFocus
              />
            </View>
            <View style={styles.separator} />
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={newContact.phone}
                onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor={colors.textTertiary}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.separator} />
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={newContact.email}
                onChangeText={(text) => setNewContact({ ...newContact, email: text })}
                placeholder="email@example.com"
                placeholderTextColor={colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.separator} />
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Relationship</Text>
              <View style={styles.relationshipOptions}>
                {['Family', 'Friend', 'Partner', 'Colleague'].map((rel) => (
                  <TouchableOpacity
                    key={rel}
                    style={[
                      styles.relationshipChip,
                      newContact.relationship === rel && styles.relationshipChipActive,
                    ]}
                    onPress={() => setNewContact({ ...newContact, relationship: rel })}
                  >
                    <Text style={[
                      styles.relationshipChipText,
                      newContact.relationship === rel && styles.relationshipChipTextActive,
                    ]}>
                      {rel}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Important</Text>
          <Text style={styles.infoText}>
            This contact will receive an alert if you don't check in within your designated time window. Make sure to add people you trust.
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Add Contact'}
          </Text>
        </TouchableOpacity>
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  field: {
    padding: spacing.md,
  },
  fieldLabel: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    fontSize: fontSize.body,
    color: colors.text,
    padding: 0,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md,
  },
  relationshipOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  relationshipChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  relationshipChipActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  relationshipChipText: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  relationshipChipTextActive: {
    color: '#FFFFFF',
  },
  infoSection: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoTitle: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    color: '#FFFFFF',
  },
});
