# SoloGuard — Setup Guide

A "dead man's switch" for solo travelers and the elderly that alerts contacts if check-in is missed.

## Prerequisites

1. **Node.js** (v18+) — https://nodejs.org
2. **Expo CLI** — `npm install -g expo`
3. **EAS CLI** — `npm install -g eas-cli`
4. **Apple Developer Account** — For iOS builds
5. **Google Play Console** — For Android builds

## Quick Start

```bash
# Navigate to app directory
cd builds/solguard

# Install dependencies
npm install

# Start Expo dev server
npx expo start
```

## Running on Devices

### iOS (with Expo Go)
```bash
npx expo start --ios
```

### Android (with Expo Go)
```bash
npx expo start --android
```

### QR Code
Run `npx expo start` and scan the QR code with your phone's camera.

## RevenueCat Setup (Required for Monetization)

### 1. Create RevenueCat Account
- Go to https://revenuecat.com
- Create account and sign in

### 2. Create App
- Click "Create App"
- Select iOS and/or Android
- Name: "SoloGuard"

### 3. Get API Key
- Go to Project Settings → API Keys
- Copy your "Public" API key
- Add to `.env`:
  ```
  REVENUECAT_PUBLIC_KEY=your_public_key_here
  ```

### 4. Create Products
In RevenueCat dashboard:

| Product | Product ID | Price |
|---------|------------|-------|
| Monthly | solguard_premium_monthly | $4.99/mo |
| Annual | solguard_premium_annual | $29.99/yr |

### 5. Configure Entitlements

**iOS (App Store Connect):**
1. Go to your app → Features
2. Enable "In-App Purchase"
3. Create subscriptions matching product IDs above

**Android (Google Play):**
1. Create subscriptions in Google Play Console
2. Link to RevenueCat

### 6. Update Code
In `src/services/purchases.ts`, replace the stub with actual RevenueCat SDK:

```typescript
import Purchases from 'react-native-purchases';

const API_KEY = 'your_revenuecat_public_key';

export async function initPurchases() {
  await Purchases.configure({ apiKey: API_KEY });
}

// Then use Purchases.purchasePackage(), Purchases.restoreTransactions(), etc.
```

## App Store Connect Setup

### 1. Create Bundle ID
- Go to https://developer.apple.com
- Certificates, Identifiers & Profiles → Identifiers
- Create new App ID: `com.solguard.app`

### 2. Create App Record
- Go to App Store Connect
- New App
- Name: SoloGuard
- Bundle ID: com.solguard.app

### 3. Screenshots Required
- iPhone: 6.9" and 6.5" display sizes
- Required: App preview, check-in screen, contacts screen

### 4. Submit for Review
- Fill in App Information
- Upload screenshots
- Submit for review

## EAS Build Commands

### Development Build (for testing)
```bash
eas build --profile development --platform ios
```

### Production Build (for App Store)
```bash
eas build --profile production --platform ios
```

### Android APK
```bash
eas build --profile production --platform android
```

## Submission Checklist

- [ ] RevenueCat products created and configured
- [ ] Bundle ID registered in Apple Developer Portal
- [ ] App record created in App Store Connect
- [ ] App icon (1024x1024) created
- [ ] Screenshots captured (6-10 images)
- [ ] Privacy Policy URL ready
- [ ] Test on physical device
- [ ] Build passes App Store review

## Project Structure

```
solguard/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout
│   ├── (tabs)/           # Tab navigation
│   │   ├── index.tsx    # Check-In screen
│   │   ├── schedule.tsx # Schedule screen
│   │   └── contacts.tsx # Contacts screen
│   ├── onboarding.tsx    # Onboarding flow
│   ├── paywall.tsx      # RevenueCat paywall
│   ├── settings/        # Settings screen
│   └── contact/[id].tsx # Contact detail
├── src/
│   ├── theme.ts         # Design tokens
│   └── services/
│       └── purchases.ts  # RevenueCat stub
├── assets/              # Icons, images
├── app.json            # Expo config
├── package.json        # Dependencies
└── SETUP.md           # This file
```

## Troubleshooting

### "npm install" fails
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall

### Build errors
- Ensure Node.js version is 18+
- Run `npx expo install --fix` to fix dependencies

### RevenueCat not working
- Check API key is correct
- Ensure products are "Active" in RevenueCat dashboard
- Test in sandbox mode first

---

Built with ❤️ by App Factory
