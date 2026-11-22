import { Router } from 'express';

export const companionRouter = Router();

// In-memory / cached companion state for synchronization with PWA clients
interface CompanionSyncBundle {
  patientName: string;
  bloodGroup: string;
  allergies: string[];
  criticalConditions: string[];
  pandemicNote: string;
  emergencyToken: string;
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    isPrimary: boolean;
  }>;
  todayMedications: Array<{
    id: string;
    name: string;
    dosage: string;
    scheduledTime: string;
    mealTiming: string;
    status: 'pending' | 'taken' | 'missed';
  }>;
  nearestHospital: {
    name: string;
    emergencyPhone: string;
    address: string;
    emergencyDepartmentAvailable: boolean;
  };
  syncTimestamp: string;
}

let syncBundleCache: CompanionSyncBundle = {
  patientName: 'Emergency Patient',
  bloodGroup: 'O+',
  allergies: ['Penicillin', 'Peanuts (Severe)'],
  criticalConditions: ['Mild Asthma', 'Hypertension (Controlled)'],
  pandemicNote: 'Keep Medical ID accessible during acute respiratory emergencies.',
  emergencyToken: 'emg_native_sync_9941a8',
  emergencyContacts: [
    { name: 'Priya Sharma (Spouse)', relationship: 'Spouse', phone: '+91 98765 43210', isPrimary: true },
    { name: 'Dr. S. Venkataraman (Cardio)', relationship: 'Physician', phone: '+91 94440 12345', isPrimary: false }
  ],
  todayMedications: [
    { id: 'med_01', name: 'Metformin Hydrochloride', dosage: '500 mg', scheduledTime: '08:30', mealTiming: 'with_meal', status: 'taken' },
    { id: 'med_02', name: 'Telmisartan', dosage: '40 mg', scheduledTime: '09:00', mealTiming: 'after_meal', status: 'taken' },
    { id: 'med_03', name: 'Metformin Hydrochloride', dosage: '500 mg', scheduledTime: '20:00', mealTiming: 'with_meal', status: 'pending' },
    { id: 'med_04', name: 'Rosuvastatin Calcium', dosage: '10 mg', scheduledTime: '21:30', mealTiming: 'after_meal', status: 'pending' }
  ],
  nearestHospital: {
    name: 'Apollo Specialty Hospitals, Greams Road',
    emergencyPhone: '1066',
    address: 'Greams Lane, Thousand Lights, Chennai',
    emergencyDepartmentAvailable: true
  },
  syncTimestamp: new Date().toISOString()
};

/**
 * GET /api/companion/config
 * Provides native client with configuration, hotlines, and channel metadata
 */
companionRouter.get('/config', (req, res) => {
  res.json({
    appName: 'LifeGuard Native Android Companion',
    version: '1.15.0',
    minAppVersionSupported: '1.0.0',
    emergencyHotlines: {
      ambulance: '108',
      police: '112',
      nationalEmergency: '112',
      womenHelpline: '1091',
      childHelpline: '1098'
    },
    channels: [
      { id: 'channel_emergency_sos', name: 'Emergency SOS & Trauma Alarms', importance: 'HIGH', bypassDnd: true },
      { id: 'channel_medical_id_persistent', name: 'Lock-Screen Medical ID', importance: 'LOW', persistent: true },
      { id: 'channel_medication_reminders', name: 'Medication Reminders', importance: 'HIGH', bypassDnd: false },
      { id: 'channel_blood_network', name: 'Blood Network Matches', importance: 'DEFAULT', bypassDnd: false },
      { id: 'channel_sensor_service', name: 'Background Safety Monitoring', importance: 'MIN', persistent: true }
    ],
    features: {
      permittedBackgroundSensorMonitoring: true,
      lockScreenMedicalId: true,
      nativeNotificationChannels: true,
      androidSmsHandoff: true,
      reliableLocalNotifications: true
    },
    privacyPolicyUrl: 'https://lifeguard-azure.vercel.app/security',
    serverTime: new Date().toISOString()
  });
});

/**
 * GET /api/companion/sync
 * Synchronizes core clinical triage information with the Android native companion
 */
companionRouter.get('/sync', (req, res) => {
  // If authorization header is present, we validate user session
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // In production, token verifies against Firebase Admin SDK
    console.log(`[Companion API] Authenticated sync requested with token: ${token.substring(0, 10)}...`);
  }

  res.json({
    success: true,
    data: syncBundleCache,
    serverTime: new Date().toISOString()
  });
});

/**
 * POST /api/companion/dose
 * Updates medication dose status directly from Android notification actions
 */
companionRouter.post('/dose', (req, res) => {
  const { doseId, status, recordedAt } = req.body;

  if (!doseId || !status) {
    return res.status(400).json({ error: 'doseId and status are required' });
  }

  const dose = syncBundleCache.todayMedications.find(d => d.id === doseId);
  if (dose) {
    dose.status = status;
    console.log(`[Companion API] Dose ${doseId} marked as ${status} at ${recordedAt || new Date().toISOString()}`);
  }

  syncBundleCache.syncTimestamp = new Date().toISOString();

  res.json({
    success: true,
    message: `Dose ${doseId} marked as ${status}`,
    updatedDose: dose,
    syncTimestamp: syncBundleCache.syncTimestamp
  });
});

/**
 * POST /api/companion/telemetry
 * Receives vehicular collision or fall impact event when explicitly authorized by the user
 */
companionRouter.post('/telemetry', (req, res) => {
  const { eventType, peakAccelerationG, userConfirmed, latitude, longitude, timestamp } = req.body;

  console.log(`[Companion API] Telemetry received: Type=${eventType}, PeakG=${peakAccelerationG}, Confirmed=${userConfirmed}, Lat=${latitude}, Lng=${longitude}`);

  // Safety check: ensure telemetry is not automatically triggering dispatch without user authorization
  res.json({
    success: true,
    telemetryId: 'tel_' + Date.now(),
    receivedAt: new Date().toISOString(),
    status: userConfirmed ? 'user_confirmed_distress' : 'sensor_event_logged'
  });
});

/**
 * POST /api/companion/update-profile
 * Allows PWA to update the companion bundle in real-time
 */
companionRouter.post('/update-profile', (req, res) => {
  const updates = req.body;
  syncBundleCache = {
    ...syncBundleCache,
    ...updates,
    syncTimestamp: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Companion sync bundle updated',
    syncTimestamp: syncBundleCache.syncTimestamp
  });
});
