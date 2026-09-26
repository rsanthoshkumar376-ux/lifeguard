# LifeGuard — Emergency Medical & Blood Donor App

A Progressive Web App (PWA) for emergency blood donation networking, emergency medical identification, and helping strangers provide immediate assistance during medical emergencies. Built for India.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- A [Firebase project](https://console.firebase.google.com)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template and fill in your Firebase config
cp .env.example .env

# 3. Start development server
npm run dev

# 4. Open in browser
# http://localhost:5173
```

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Enable these services:
   - **Authentication** → Phone provider
   - **Cloud Firestore** → Start in test mode
   - **Storage** → Start in test mode
   - **Hosting** → Set up
4. Add a **Web App** and copy the config to `.env`
5. For Cloud Functions, upgrade to **Blaze plan** (pay-as-you-go)

### Deploy

```bash
# Build the PWA
npm run build

# Deploy everything (hosting + functions + rules)
firebase deploy
```

### Install on Mobile

1. Open your deployed URL in Chrome on Android
2. Tap the "Add to Home Screen" prompt
3. The app installs with its own icon and splash screen
4. Opens in standalone mode — looks and works like a native app!

## 🏗 Architecture

```
Frontend:  React 18 + TypeScript + Vite + Tailwind CSS
PWA:       Vite PWA Plugin + Workbox (offline support)
Backend:   Firebase Cloud Functions (Node.js 20)
Database:  Cloud Firestore (with geohash queries)
Auth:      Firebase Auth (Phone OTP + Email)
Storage:   Firebase Storage (medical docs, photos)
Push:      Firebase Cloud Messaging (FCM)
Hosting:   Firebase Hosting (global CDN)
i18n:      react-i18next (English, Tamil, Hindi)
```

## 📱 Features

- **🆘 SOS Emergency** — One-tap emergency alert with location sharing
- **🩸 Blood Donation Network** — Geolocation-based donor matching with push notifications
- **❤️ Emergency Medical ID** — Customizable emergency info visible to first responders
- **📱 QR Medical ID** — Scannable QR code for emergency access (secure token-based)
- **🏥 Hospital Dashboard** — Verified hospitals can create blood requests
- **🔒 Privacy Controls** — User controls exactly what info is visible in emergencies
- **🌐 Multilingual** — English, Tamil (தமிழ்), Hindi (हिंदी)
- **📴 Offline Support** — Emergency info accessible without internet
- **🌙 Dark Mode** — Full dark mode support
- **♿ Accessible** — Large touch targets, screen reader support, high contrast

## 🔒 Security

- Medical data encrypted in transit and at rest
- Row-level security via Firestore rules
- QR codes contain secure tokens, NOT medical data
- Role-based access (user, hospital_staff, admin)
- Emergency visibility controlled by user
- Admin cannot access medical records
- Account deletion with full data cleanup

## ⚠️ Disclaimer

This application is an emergency assistance and information-sharing platform. It does not replace doctors, hospitals, blood banks, emergency services, medical diagnosis, or professional medical advice.
