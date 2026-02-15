# SoloGuard

A "dead man's switch" mobile app for solo travelers and elderly that automatically alerts emergency contacts if a scheduled check-in is missed.

## Features

- 📅 **Scheduled Check-Ins** — Set up automatic reminder times
- 👥 **Emergency Contacts** — Add trusted contacts who get notified
- 🔔 **Smart Notifications** — Reminders push to your phone
- 📱 **iOS & Android** — Built with Expo for cross-platform support

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npx expo start
```

## Project Structure

```
solguard/
├── app/                    # Expo Router screens
│   ├── (tabs)/           # Tab navigation
│   │   ├── index.tsx    # Check-In screen
│   │   ├── schedule.tsx # Schedule screen
│   │   └── contacts.tsx # Contacts screen
│   ├── onboarding.tsx    # Onboarding flow
│   ├── paywall.tsx      # Premium paywall
│   └── contact/[id].tsx # Contact detail
├── src/
│   ├── theme.ts         # Design tokens
│   └── services/
│       └── purchases.ts  # Purchases service
├── assets/              # Icons, images
└── app.json            # Expo config
```

## Tech Stack

- **Framework:** Expo SDK 52 / React Native
- **Navigation:** Expo Router
- **Storage:** AsyncStorage
- **Payments:** RevenueCat (stubbed for development)

## License

MIT
