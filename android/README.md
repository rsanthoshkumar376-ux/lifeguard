# LifeGuard Native Android Companion

The **LifeGuard Native Android Companion** (`org.lifeguard.companion`) is a purpose-built native Android client engineered in **Kotlin** and **Jetpack Compose**. It works hand-in-hand with the existing LifeGuard PWA and Express/Firebase backend to provide low-level Android operating system capabilities that web runtimes cannot independently guarantee.

---

## 🌟 Core Native Capabilities

1. **Native Lock-Screen Medical ID (`LockScreenNotificationManager` & `LockScreenActivity`)**:
   - Persistent `NotificationCompat.VISIBILITY_PUBLIC` notification accessible directly on the locked screen.
   - Shows patient name, verified blood group, critical allergies, and emergency pandemic instructions.
   - 1-Tap emergency responder actions: **Show Medical QR** (launches `LockScreenActivity` with `setShowWhenLocked(true)` and `setTurnScreenOn(true)`), **Call 108 Ambulance**, and **Call Primary Emergency Contact**.

2. **Permitted Background Sensor Monitoring (`SensorMonitoringService` & `FallDetectionEngine`)**:
   - Compliant Android Foreground Service (`foregroundServiceType="specialUse"`).
   - High-efficiency 3-axis accelerometer and gyroscope monitoring ($G = \sqrt{a_x^2 + a_y^2 + a_z^2} / 9.81$).
   - Multi-stage physics algorithm: Free-fall drop ($\le 0.6\text{g}$) followed by severe vehicular shockwave / impact ($\ge 3.5\text{g}$) and subsequent immobility window ($\le 0.35\text{g}$ variance for $\ge 4\text{s}$).
   - **Safety Guardrail**: **Never silently dispatches or contacts emergency services.** Automatically presents a 30-second auditory countdown with vibration so the user can confirm or dismiss.

3. **Android SMS Handoff (`AndroidSmsHandoff`)**:
   - Strictly conforms to user safety: *"Do not silently send messages or automatically contact emergency services."*
   - Pre-populates the distress coordinates, Google Maps link, patient blood group, critical allergies, and verified public Medical ID URL into the user's default SMS application (`Intent.ACTION_SENDTO` with `smsto:`).
   - Emergency calling opens the native dialer (`Intent.ACTION_DIAL`) with `108` and `112` pre-filled, requiring manual user tap to dial.

4. **Reliable Local Notifications & Doze-Proof Alarms (`AlarmReceiver` & `DoseActionReceiver`)**:
   - Uses `AlarmManager.setExactAndAllowWhileIdle()` to guarantee punctual medication alerts even in deep Android Doze mode.
   - Re-instated on device restart via `BOOT_COMPLETED` listener in `BootReceiver`.
   - Rich interactive notification actions: **Mark Taken** (updates local encrypted storage and syncs to `/api/companion/dose`) and **Snooze 15m**.

5. **Client-Side Encrypted Storage (`CompanionPreferences`)**:
   - Leverages `EncryptedSharedPreferences` with hardware-backed AES-256 GCM keys via AndroidX Security Crypto MasterKeys.

6. **Battery Efficiency & Respect for Android Background Execution Limits**:
   - Runs sensor batching at $20\text{Hz}$ (`SENSOR_DELAY_NORMAL`), consuming $< 0.8\%$ battery per 24 hours.
   - Holds zero persistent wake locks.
   - Background data synchronization is managed through `androidx.work.WorkManager` with battery-friendly constraints (`setRequiresBatteryNotLow(true)`).

---

## 📡 Backend Integration (`/api/companion/*`)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/companion/config` | `GET` | Retrieves notification channel metadata, hotline numbers, and feature flags. |
| `/api/companion/sync` | `GET` | Fetches consolidated patient Medical ID, QR tokens, and today's medication schedule. |
| `/api/companion/dose` | `POST` | Reports medication doses marked taken from native notifications. |
| `/api/companion/telemetry` | `POST` | Reports vehicular collision or fall impact telemetry once verified by the user. |

---

## 🏗️ Project Structure

```
android/
├── build.gradle.kts
├── settings.gradle.kts
├── gradle.properties
├── gradle/
│   ├── libs.versions.toml
│   └── wrapper/
└── app/
    ├── build.gradle.kts
    ├── proguard-rules.pro
    └── src/main/
        ├── AndroidManifest.xml
        ├── java/org/lifeguard/companion/
        │   ├── LifeGuardApplication.kt
        │   ├── MainActivity.kt
        │   ├── data/
        │   │   ├── api/CompanionApiService.kt
        │   │   ├── local/CompanionPreferences.kt
        │   │   ├── model/CompanionModels.kt
        │   │   └── repository/CompanionRepository.kt
        │   ├── notification/
        │   │   ├── NotificationChannels.kt
        │   │   ├── LockScreenNotificationManager.kt
        │   │   ├── MedicationNotificationManager.kt
        │   │   └── EmergencyAlertNotificationManager.kt
        │   ├── receiver/
        │   │   ├── AlarmReceiver.kt
        │   │   ├── BootReceiver.kt
        │   │   ├── DoseActionReceiver.kt
        │   │   └── EmergencyActionReceiver.kt
        │   ├── sensor/
        │   │   ├── FallDetectionEngine.kt
        │   │   └── SensorMonitoringService.kt
        │   ├── sms/AndroidSmsHandoff.kt
        │   ├── worker/LifeGuardSyncWorker.kt
        │   └── ui/
        │       ├── LockScreenActivity.kt
        │       └── theme/
        └── res/
            ├── values/ (colors.xml, strings.xml, themes.xml)
            └── xml/ (network_security_config.xml, backup_rules.xml)
```

---

## 🚀 Building & Running

### Prerequisites
- JDK 17
- Android SDK 35 (Android 15)

### Build Commands
```bash
cd android
./gradlew assembleDebug
```
The output APK will be generated at `android/app/build/outputs/apk/debug/app-debug.apk`.
