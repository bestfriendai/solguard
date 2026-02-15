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

## API Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Solar/Energy API (optional - for energy monitoring)
SOLAR_API_KEY=your_solar_api_key
SOLAR_API_URL=https://api.solguard.com/v1

# Energy Provider API
ENERGY_API_KEY=your_energy_api_key
```

### RevenueCat Configuration

1. Create an account at [RevenueCat.com](https://revenuecat.com)
2. Create products in App Store Connect / Google Play Console:
   - Monthly: $3.99/month - `solguard_monthly`
   - Annual: $24.99/year - `solguard_annual`
3. Configure products in RevenueCat dashboard
4. Add your API key to `src/services/purchases.ts`
