// SoloGuard Theme - Safety Red + Clean Monochrome
export const colors = {
  brand: '#DC2626',        // Bold safety red - urgency, protection
  brandDark: '#B91C1C',    // Darker red for pressed states
  brandLight: '#FEE2E2',   // Light red for backgrounds
  
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  surfaceTertiary: '#F1F5F9',
  
  text: '#0F172A',
  textSecondary: 'rgba(15,23,42,0.6)',
  textTertiary: 'rgba(15,23,42,0.4)',
  
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  
  destructive: '#DC2626',
  destructiveLight: '#FEE2E2',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  
  // Dark mode
  dark: {
    background: '#0A0A0A',
    surface: '#1C1C1E',
    surfaceSecondary: '#2C2C2E',
    surfaceTertiary: '#3C3C3E',
    text: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.6)',
    textTertiary: 'rgba(255,255,255,0.4)',
    border: 'rgba(255,255,255,0.08)',
    borderLight: 'rgba(255,255,255,0.04)',
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fontSize = {
  caption: 13,
  body: 17,
  bodyLarge: 19,
  title3: 20,
  title2: 22,
  largeTitle: 34,
  headline: 28,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Shadow presets
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
};
