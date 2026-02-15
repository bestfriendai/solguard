import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, radius, fontSize, fontWeight, shadows } from '../src/theme';

const { width } = Dimensions.get('window');

// RevenueCat stub - user needs to configure with their API keys
const PRODUCTS = {
  monthly: {
    id: 'solguard_premium_monthly',
    price: '$4.99',
    priceString: '$4.99/month',
  },
  annual: {
    id: 'solguard_premium_annual',
    price: '$29.99',
    priceString: '$29.99/year',
  },
};

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  included: boolean;
}

const PREMIUM_FEATURES: Feature[] = [
  {
    id: '1',
    icon: '📅',
    title: 'Unlimited Schedules',
    description: 'Create as many check-in schedules as you need',
    included: true,
  },
  {
    id: '2',
    icon: '👥',
    title: 'Up to 10 Contacts',
    description: 'Add up to 10 emergency contacts (free: 2)',
    included: true,
  },
  {
    id: '3',
    icon: '📍',
    title: 'Location Sharing',
    description: 'Include your location in emergency alerts',
    included: true,
  },
  {
    id: '4',
    icon: '🔔',
    title: 'Custom Reminders',
    description: 'Set custom reminder intervals (15min to 7 days)',
    included: true,
  },
  {
    id: '5',
    icon: '📊',
    title: 'Check-In History',
    description: 'Unlimited history with export capability',
    included: true,
  },
  {
    id: '6',
    icon: '⏰',
    title: 'Smart Reminders',
    description: 'AI-powered optimal check-in times',
    included: false,
  },
];

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    
    // In production, this would use RevenueCat SDK:
    // await Purchases.purchasePackage(pack)
    
    // For now, simulate purchase
    setTimeout(async () => {
      try {
        await AsyncStorage.setItem('@solguard:premium', 'true');
      } catch (e) {
        console.error('Failed to save premium status:', e);
      }
      router.replace('/(tabs)');
    }, 1000);
  };

  const handleRestore = async () => {
    // In production, this would use RevenueCat SDK:
    // await Purchases.restoreTransactions()
    
    Alert.alert('Restore Purchases', 'In production, this would restore your previous purchases.');
  };

  const handleClose = () => {
    router.back();
  };

  const savings = 100 - Math.round((29.99 / 12 / 4.99) * 100);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🛡️</Text>
          </View>
          
          <Text style={styles.title}>SoloGuard Premium</Text>
          <Text style={styles.subtitle}>
            Unlock all features and stay safer
          </Text>
        </View>

        {/* Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleOption, !isAnnual && styles.toggleOptionActive]}
            onPress={() => setIsAnnual(false)}
          >
            <Text style={[styles.toggleText, !isAnnual && styles.toggleTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleOption, isAnnual && styles.toggleOptionActive]}
            onPress={() => setIsAnnual(true)}
          >
            <Text style={[styles.toggleText, isAnnual && styles.toggleTextActive]}>
              Annual
            </Text>
            {isAnnual && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>Save {savings}%</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Pricing Cards */}
        <View style={styles.pricingRow}>
          {/* Monthly */}
          <TouchableOpacity
            style={[
              styles.pricingCard,
              !isAnnual && styles.pricingCardSelected,
            ]}
            onPress={() => setIsAnnual(false)}
          >
            {!isAnnual && <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>Selected</Text>
            </View>}
            <Text style={styles.pricingPrice}>{PRODUCTS.monthly.price}</Text>
            <Text style={styles.pricingPeriod}>per month</Text>
          </TouchableOpacity>

          {/* Annual */}
          <TouchableOpacity
            style={[
              styles.pricingCard,
              isAnnual && styles.pricingCardSelected,
            ]}
            onPress={() => setIsAnnual(true)}
          >
            {isAnnual && <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>Best Value</Text>
            </View>}
            <Text style={styles.pricingPrice}>{PRODUCTS.annual.price}</Text>
            <Text style={styles.pricingPeriod}>per year</Text>
            <Text style={styles.pricingSavings}>
              ${(29.99 / 12).toFixed(2)}/mo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>What's Included</Text>
          
          {PREMIUM_FEATURES.map((feature) => (
            <View key={feature.id} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Text>{feature.icon}</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
              <View style={[
                styles.featureCheck,
                feature.included ? styles.featureCheckIncluded : styles.featureCheckExcluded
              ]}>
                <Text style={[
                  styles.featureCheckText,
                  feature.included ? styles.featureCheckTextIncluded : styles.featureCheckTextExcluded
                ]}>
                  {feature.included ? '✓' : '—'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={handleSubscribe}
          disabled={isLoading}
        >
          <LinearGradient
            colors={[colors.brand, colors.brandDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.subscribeGradient}
          >
            <Text style={styles.subscribeButtonText}>
              {isLoading ? 'Processing...' : `Subscribe for ${isAnnual ? PRODUCTS.annual.priceString : PRODUCTS.monthly.priceString}`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Restore */}
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <TouchableOpacity onPress={() => Linking.openURL('https://example.com/terms')}>
            <Text style={styles.termsText}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.termsSeparator}>•</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://example.com/privacy')}>
            <Text style={styles.termsText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

import { Alert } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.brandLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: fontSize.title2,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  toggleOptionActive: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  toggleText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.text,
  },
  savingsBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginTop: 4,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: '#FFFFFF',
  },
  pricingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  pricingCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  pricingCardSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brandLight,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: '#FFFFFF',
  },
  pricingPrice: {
    fontSize: fontSize.headline,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: 2,
  },
  pricingPeriod: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
  },
  pricingSavings: {
    fontSize: fontSize.caption,
    color: colors.success,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
  },
  featuresSection: {
    marginBottom: spacing.lg,
  },
  featuresTitle: {
    fontSize: fontSize.title3,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
  },
  featureCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  featureCheckIncluded: {
    backgroundColor: colors.success,
  },
  featureCheckExcluded: {
    backgroundColor: colors.surfaceSecondary,
  },
  featureCheckText: {
    fontSize: 12,
    fontWeight: fontWeight.bold,
  },
  featureCheckTextIncluded: {
    color: '#FFFFFF',
  },
  featureCheckTextExcluded: {
    color: colors.textTertiary,
  },
  subscribeButton: {
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  subscribeGradient: {
    padding: spacing.md,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    color: '#FFFFFF',
  },
  restoreButton: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  restoreText: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
  termsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsText: {
    fontSize: fontSize.caption,
    color: colors.textTertiary,
  },
  termsSeparator: {
    fontSize: fontSize.caption,
    color: colors.textTertiary,
    marginHorizontal: spacing.sm,
  },
});
