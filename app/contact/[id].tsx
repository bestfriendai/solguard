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
import { useRouter, useLocalSearchParams } from 'expo-router';
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

export default function ContactDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [contact, setContact] = useState<Contact | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContact();
  }, [id]);

  const loadContact = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const contacts: Contact[] = JSON.parse(stored);
        const found = contacts.find(c => c.id === id);
        if (found) {
          setContact(found);
          setEditedContact(found);
        }
      }
    } catch (e) {
      console.error('Failed to load contact:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveContact = async (updated: Contact) => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const contacts: Contact[] = JSON.parse(stored);
        const index = contacts.findIndex(c => c.id === id);
        if (index !== -1) {
          contacts[index] = updated;
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
        }
      }
    } catch (e) {
      console.error('Failed to save contact:', e);
    }
  };

  const handleSave = () => {
    if (!editedContact?.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setContact(editedContact);
    saveContact(editedContact);
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to remove this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            try {
              const stored = await AsyncStorage.getItem(STORAGE_KEY);
              if (stored) {
                const contacts: Contact[] = JSON.parse(stored);
                const filtered = contacts.filter(c => c.id !== id);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
              }
              router.back();
            } catch (e) {
              console.error('Failed to delete contact:', e);
            }
          }
        },
      ]
    );
  };

  const handleSetPrimary = () => {
    Haptics.selectionAsync();
    if (contact && editedContact) {
      const updated = { ...editedContact, isPrimary: true };
      setEditedContact(updated);
      saveContact(updated);
      setContact(updated);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading || !contact) {
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
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={[
            styles.avatar,
            contact.isPrimary && styles.avatarPrimary
          ]}>
            <Text style={[
              styles.avatarText,
              contact.isPrimary && styles.avatarTextPrimary
            ]}>
              {getInitials(contact.name)}
            </Text>
          </View>
          {contact.isPrimary && (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryBadgeText}>Primary Contact</Text>
            </View>
          )}
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>CONTACT INFORMATION</Text>
          <View style={styles.sectionContent}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedContact?.name || ''}
                  onChangeText={(text) => setEditedContact(prev => prev ? { ...prev, name: text } : null)}
                  placeholder="Enter name"
                  placeholderTextColor={colors.textTertiary}
                />
              ) : (
                <Text style={styles.fieldValue}>{contact.name}</Text>
              )}
            </View>
            <View style={styles.separator} />
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Phone</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedContact?.phone || ''}
                  onChangeText={(text) => setEditedContact(prev => prev ? { ...prev, phone: text } : null)}
                  placeholder="Enter phone number"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.fieldValue}>{contact.phone || 'Not set'}</Text>
              )}
            </View>
            <View style={styles.separator} />
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedContact?.email || ''}
                  onChangeText={(text) => setEditedContact(prev => prev ? { ...prev, email: text } : null)}
                  placeholder="Enter email"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <Text style={styles.fieldValue}>{contact.email || 'Not set'}</Text>
              )}
            </View>
            <View style={styles.separator} />
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Relationship</Text>
              {isEditing ? (
                <View style={styles.relationshipOptions}>
                  {['Family', 'Friend', 'Partner', 'Colleague'].map((rel) => (
                    <TouchableOpacity
                      key={rel}
                      style={[
                        styles.relationshipChip,
                        editedContact?.relationship === rel && styles.relationshipChipActive,
                      ]}
                      onPress={() => setEditedContact(prev => prev ? { ...prev, relationship: rel } : null)}
                    >
                      <Text style={[
                        styles.relationshipChipText,
                        editedContact?.relationship === rel && styles.relationshipChipTextActive,
                      ]}>
                        {rel}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.fieldValue}>{contact.relationship}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          {isEditing ? (
            <>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {!contact.isPrimary && (
                <TouchableOpacity style={styles.primaryButton} onPress={handleSetPrimary}>
                  <Text style={styles.primaryButtonText}>Set as Primary Contact</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                <Text style={styles.editButtonText}>Edit Contact</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.deleteButtonText}>Delete Contact</Text>
              </TouchableOpacity>
            </>
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarPrimary: {
    backgroundColor: colors.brand,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  avatarTextPrimary: {
    color: '#FFFFFF',
  },
  primaryBadge: {
    backgroundColor: colors.brandLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  primaryBadgeText: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    color: colors.brand,
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
    marginBottom: spacing.xs,
  },
  fieldValue: {
    fontSize: fontSize.body,
    color: colors.text,
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
  actionsSection: {
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    color: '#FFFFFF',
  },
  editButton: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  deleteButton: {
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: colors.destructive,
  },
  saveButton: {
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    color: '#FFFFFF',
  },
  cancelButton: {
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
});
