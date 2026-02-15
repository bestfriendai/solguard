import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
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

const DEFAULT_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Emergency Contact',
    phone: '',
    email: '',
    relationship: 'Family',
    isPrimary: true,
    createdAt: new Date().toISOString(),
  },
];

export default function ContactsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: 'Family',
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setContacts(JSON.parse(stored));
      } else {
        setContacts(DEFAULT_CONTACTS);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONTACTS));
      }
    } catch (e) {
      console.error('Failed to load contacts:', e);
      setContacts(DEFAULT_CONTACTS);
    } finally {
      setIsLoading(false);
    }
  };

  const saveContacts = async (newContacts: Contact[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newContacts));
    } catch (e) {
      console.error('Failed to save contacts:', e);
    }
  };

  const handleAddContact = () => {
    if (!newContact.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const contact: Contact = {
      id: Date.now().toString(),
      name: newContact.name.trim(),
      phone: newContact.phone.trim(),
      email: newContact.email.trim(),
      relationship: newContact.relationship,
      isPrimary: contacts.length === 0,
      createdAt: new Date().toISOString(),
    };

    const updated = [...contacts, contact];
    setContacts(updated);
    saveContacts(updated);
    setShowAddModal(false);
    setNewContact({ name: '', phone: '', email: '', relationship: 'Family' });
  };

  const deleteContact = (id: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to remove this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            const updated = contacts.filter(c => c.id !== id);
            setContacts(updated);
            saveContacts(updated);
          }
        },
      ]
    );
  };

  const setPrimaryContact = (id: string) => {
    Haptics.selectionAsync();
    const updated = contacts.map(c => ({
      ...c,
      isPrimary: c.id === id,
    }));
    setContacts(updated);
    saveContacts(updated);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
          <Text style={styles.headerTitle}>Emergency Contacts</Text>
          <Text style={styles.headerSubtitle}>
            Who gets notified if you miss a check-in
          </Text>
        </View>

        {/* Contact List */}
        <View style={styles.section}>
          {contacts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>No Contacts Yet</Text>
              <Text style={styles.emptySubtitle}>
                Add emergency contacts who will be notified if you miss a check-in
              </Text>
            </View>
          ) : (
            contacts.map((contact) => (
              <TouchableOpacity 
                key={contact.id} 
                style={styles.contactCard}
                onPress={() => router.push(`/contact/${contact.id}`)}
              >
                <View style={styles.contactLeft}>
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
                  <View style={styles.contactInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      {contact.isPrimary && (
                        <View style={styles.primaryBadge}>
                          <Text style={styles.primaryBadgeText}>Primary</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.contactRelationship}>
                      {contact.relationship}
                    </Text>
                    {contact.phone ? (
                      <Text style={styles.contactPhone}>{contact.phone}</Text>
                    ) : null}
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Add Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Add Emergency Contact</Text>
        </TouchableOpacity>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Important</Text>
          <Text style={styles.infoText}>
            Your emergency contacts will receive an SMS alert if you don't check in within your designated time window. Make sure to add people you trust.
          </Text>
        </View>
      </ScrollView>

      {/* Add Contact Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top + spacing.md }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Contact</Text>
            <TouchableOpacity onPress={handleAddContact}>
              <Text style={styles.modalDone}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                value={newContact.name}
                onChangeText={(text) => setNewContact({ ...newContact, name: text })}
                placeholder="Enter name"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={newContact.phone}
                onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor={colors.textTertiary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
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

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Relationship</Text>
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
          </ScrollView>
        </View>
      </Modal>
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
    gap: spacing.sm,
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
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarPrimary: {
    backgroundColor: colors.brand,
  },
  avatarText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  avatarTextPrimary: {
    color: '#FFFFFF',
  },
  contactInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  contactName: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  primaryBadge: {
    backgroundColor: colors.brandLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  primaryBadgeText: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    color: colors.brand,
  },
  contactRelationship: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: fontSize.caption,
    color: colors.textTertiary,
  },
  chevron: {
    fontSize: 24,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
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
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCancel: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  modalTitle: {
    fontSize: fontSize.title3,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  modalDone: {
    fontSize: fontSize.body,
    color: colors.brand,
    fontWeight: fontWeight.semibold,
  },
  modalContent: {
    flex: 1,
    padding: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.body,
    color: colors.text,
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
});
