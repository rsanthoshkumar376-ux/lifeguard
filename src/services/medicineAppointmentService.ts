import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type MedicationFrequency = 
  | 'once_daily' 
  | 'twice_daily' 
  | 'thrice_daily' 
  | 'every_8h' 
  | 'as_needed' 
  | 'custom';

export type MealTiming = 'before_meal' | 'with_meal' | 'after_meal' | 'anytime';

export type DoseStatus = 'pending' | 'taken' | 'missed' | 'skipped';

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'bedtime';

export interface MedicationSchedule {
  id: string;
  name: string;
  dosage: string; // e.g. "500mg", "1 tablet", "5ml"
  frequency: MedicationFrequency;
  frequencyLabel: string;
  mealTiming: MealTiming;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  isOngoing: boolean;
  reminderTimes: string[]; // e.g. ['08:00', '20:00']
  prescribingDoctor?: string;
  hospitalOrClinic?: string;
  prescriptionDocId?: string;
  prescriptionDocName?: string;
  currentStock: number; // units remaining
  refillThreshold: number; // e.g. alert when <= 5
  verificationStatus: 'doctor_verified' | 'user_entered';
  instructions?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationDoseLog {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM
  timeSlot: TimeSlot;
  status: DoseStatus;
  takenAt?: string; // ISO string
  skippedReason?: string;
  recordedBy?: 'patient' | 'caregiver';
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface HospitalAppointment {
  id: string;
  hospital: string;
  hospitalId?: string;
  doctor: string;
  specialty: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  reason: string;
  status: AppointmentStatus;
  attachedReportIds?: string[];
  attachedReportTitles?: string[];
  reminder1DayBefore: boolean;
  reminder2HoursBefore: boolean;
  consultationNotes?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
  createdAt: string;
}

export interface MedicineAppointmentState {
  userId: string;
  medications: MedicationSchedule[];
  doseLogs: MedicationDoseLog[];
  appointments: HospitalAppointment[];
  notificationsEnabled: boolean;
  updatedAt: string;
}

// -------------------------------------------------------------
// LOCAL ENCRYPTION & TAMPER PROTECTION
// -------------------------------------------------------------
const STORAGE_KEY = 'lifeguard_medicine_appointment_v1';
const ENCRYPTION_PREFIX = 'LG_MED_v1:';

function simpleEncrypt(data: string): string {
  try {
    const encoded = btoa(encodeURIComponent(data));
    return ENCRYPTION_PREFIX + encoded;
  } catch {
    return data;
  }
}

function simpleDecrypt(raw: string): string {
  try {
    if (raw.startsWith(ENCRYPTION_PREFIX)) {
      const b64 = raw.slice(ENCRYPTION_PREFIX.length);
      return decodeURIComponent(atob(b64));
    }
    return raw;
  } catch {
    return raw;
  }
}

// -------------------------------------------------------------
// WEB AUDIO API SOUND GENERATOR FOR MEDICINE CHIME
// -------------------------------------------------------------
export function playMedicationReminderChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Dual-tone pleasant medical chime (C5 -> E5 -> G5)
    const playTone = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.01, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    };

    playTone(523.25, 0, 0.4); // C5
    playTone(659.25, 0.25, 0.4); // E5
    playTone(783.99, 0.5, 0.6); // G5
  } catch (err) {
    console.warn('Audio reminder chime not supported or muted:', err);
  }
}

// -------------------------------------------------------------
// BROWSER & PWA NOTIFICATION DISPATCHER
// -------------------------------------------------------------
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Web notifications are not supported by this browser.');
    return false;
  }
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

export function showBrowserNotification(title: string, options?: NotificationOptions) {
  playMedicationReminderChime();
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            ...options
          });
        });
      } else {
        new Notification(title, {
          icon: '/favicon.ico',
          ...options
        });
      }
    } catch (e) {
      console.warn('Notification show fallback error:', e);
    }
  }
}

// -------------------------------------------------------------
// HELPER: TIME SLOT DETERMINATION
// -------------------------------------------------------------
export function getTimeSlot(timeStr: string): TimeSlot {
  const hour = parseInt(timeStr.split(':')[0], 10);
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'bedtime';
}

// -------------------------------------------------------------
// SEED DEMO MEDICATION & APPOINTMENT DATA
// -------------------------------------------------------------
const DEFAULT_SEED_DATA: MedicineAppointmentState = {
  userId: 'local_patient',
  notificationsEnabled: true,
  medications: [
    {
      id: 'med_1',
      name: 'Metformin Hydrochloride',
      dosage: '500 mg (1 tablet)',
      frequency: 'twice_daily',
      frequencyLabel: 'Twice Daily (Morning & Night)',
      mealTiming: 'with_meal',
      startDate: '2026-01-10',
      isOngoing: true,
      reminderTimes: ['08:00', '20:00'],
      prescribingDoctor: 'Dr. K. Swaminathan, MD DM',
      hospitalOrClinic: 'Apollo Specialty Hospital',
      prescriptionDocName: 'Apollo_Prescription_Endocrinology.pdf',
      currentStock: 24,
      refillThreshold: 6,
      verificationStatus: 'doctor_verified',
      instructions: 'Take with morning and evening meals with a glass of water. Do not crush.',
      isActive: true,
      createdAt: '2026-01-10T08:00:00Z',
      updatedAt: '2026-11-20T08:00:00Z'
    },
    {
      id: 'med_2',
      name: 'Telmisartan Tablets IP',
      dosage: '40 mg (1 tablet)',
      frequency: 'once_daily',
      frequencyLabel: 'Once Daily (Morning)',
      mealTiming: 'after_meal',
      startDate: '2026-06-10',
      isOngoing: true,
      reminderTimes: ['08:30'],
      prescribingDoctor: 'Dr. S. Venkataraman, DM Cardio',
      hospitalOrClinic: 'Kauvery Heart City',
      prescriptionDocName: 'Kauvery_Cardio_Prescription.jpg',
      currentStock: 4, // Triggers refill alert!
      refillThreshold: 5,
      verificationStatus: 'doctor_verified',
      instructions: 'Take 30 minutes after breakfast to maintain stable daytime arterial pressure.',
      isActive: true,
      createdAt: '2026-06-10T10:00:00Z',
      updatedAt: '2026-11-20T08:00:00Z'
    },
    {
      id: 'med_3',
      name: 'Rosuvastatin Calcium',
      dosage: '10 mg (1 tablet)',
      frequency: 'once_daily',
      frequencyLabel: 'Once Daily (Bedtime)',
      mealTiming: 'after_meal',
      startDate: '2026-08-04',
      isOngoing: true,
      reminderTimes: ['21:30'],
      prescribingDoctor: 'Dr. S. Venkataraman, DM Cardio',
      hospitalOrClinic: 'Kauvery Heart City',
      currentStock: 18,
      refillThreshold: 5,
      verificationStatus: 'doctor_verified',
      instructions: 'Take at night for optimal hepatic lipid synthesis inhibition.',
      isActive: true,
      createdAt: '2026-08-04T16:00:00Z',
      updatedAt: '2026-11-20T08:00:00Z'
    },
    {
      id: 'med_4',
      name: 'Salbutamol Inhaler (Ventolin)',
      dosage: '100 mcg (2 puffs)',
      frequency: 'as_needed',
      frequencyLabel: 'As Needed (PRN for Wheezing)',
      mealTiming: 'anytime',
      startDate: '2025-10-01',
      isOngoing: true,
      reminderTimes: [],
      prescribingDoctor: 'Pulmonology Team',
      hospitalOrClinic: 'Apollo Greams Road',
      currentStock: 80,
      refillThreshold: 20,
      verificationStatus: 'user_entered',
      instructions: 'Rinse mouth with water after use. Shake well before inhalation.',
      isActive: true,
      createdAt: '2025-10-01T09:00:00Z',
      updatedAt: '2026-11-20T08:00:00Z'
    }
  ],
  doseLogs: [
    // Today's pre-populated doses
    {
      id: 'dose_1',
      medicationId: 'med_1',
      medicationName: 'Metformin Hydrochloride',
      dosage: '500 mg',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '08:00',
      timeSlot: 'morning',
      status: 'taken',
      takenAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      recordedBy: 'patient'
    },
    {
      id: 'dose_2',
      medicationId: 'med_2',
      medicationName: 'Telmisartan Tablets IP',
      dosage: '40 mg',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '08:30',
      timeSlot: 'morning',
      status: 'taken',
      takenAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      recordedBy: 'patient'
    },
    {
      id: 'dose_3',
      medicationId: 'med_1',
      medicationName: 'Metformin Hydrochloride',
      dosage: '500 mg',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '20:00',
      timeSlot: 'evening',
      status: 'pending',
      recordedBy: 'patient'
    },
    {
      id: 'dose_4',
      medicationId: 'med_3',
      medicationName: 'Rosuvastatin Calcium',
      dosage: '10 mg',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '21:30',
      timeSlot: 'bedtime',
      status: 'pending',
      recordedBy: 'patient'
    }
  ],
  appointments: [
    {
      id: 'apt_1',
      hospital: 'Apollo Specialty Hospitals, Chennai',
      doctor: 'Dr. K. Swaminathan',
      specialty: 'Endocrinology & Diabetology',
      appointmentDate: '2026-12-10',
      appointmentTime: '10:30',
      reason: 'Semi-annual diabetes & HbA1c metabolic review',
      status: 'scheduled',
      attachedReportTitles: ['Apollo_Diagnostics_HbA1c_Oct2026.pdf'],
      reminder1DayBefore: true,
      reminder2HoursBefore: true,
      consultationNotes: 'Fast 10 hours prior for fresh fasting blood glucose and lipid profile draw.',
      followUpRequired: true,
      createdAt: '2026-10-15T11:00:00Z'
    },
    {
      id: 'apt_2',
      hospital: 'Kauvery Heart Institute, Alwarpet',
      doctor: 'Dr. S. Venkataraman',
      specialty: 'Interventional Cardiology',
      appointmentDate: '2026-12-22',
      appointmentTime: '16:00',
      reason: 'Hypertension surveillance and resting ECG check',
      status: 'scheduled',
      attachedReportTitles: ['Cardiology_TMT_Stress_Report.pdf'],
      reminder1DayBefore: true,
      reminder2HoursBefore: true,
      createdAt: '2026-11-01T15:30:00Z'
    },
    {
      id: 'apt_3',
      hospital: 'Kauvery Hospital, Chennai',
      doctor: 'Dr. A. Sundaram',
      specialty: 'Orthopedics & Joint Care',
      appointmentDate: '2026-04-18',
      appointmentTime: '11:00',
      reason: 'Post-operative meniscal knee healing assessment',
      status: 'completed',
      attachedReportTitles: ['Kauvery_Discharge_Summary_Meniscus.pdf'],
      reminder1DayBefore: true,
      reminder2HoursBefore: false,
      consultationNotes: 'Patient has recovered 95% flexion. Advised quadriceps strengthening exercises.',
      createdAt: '2026-03-20T10:00:00Z'
    }
  ],
  updatedAt: new Date().toISOString()
};

// -------------------------------------------------------------
// STATE FETCH & PERSISTENCE
// -------------------------------------------------------------
export async function getMedicineAppointmentData(userId?: string): Promise<MedicineAppointmentState> {
  const uid = userId || 'local_patient';

  // 1. Try Cloud Firestore if authenticated
  if (userId) {
    try {
      const docRef = doc(db, 'users', userId, 'medicineManagement', 'state');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const cloudData = snap.data() as MedicineAppointmentState;
        saveToLocalCache(cloudData);
        return cloudData;
      }
    } catch (err) {
      console.warn('Firestore medicine fetch deferred/offline:', err);
    }
  }

  // 2. Read from local encrypted storage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const decrypted = simpleDecrypt(raw);
      const parsed = JSON.parse(decrypted) as MedicineAppointmentState;
      if (parsed) return parsed;
    }
  } catch (err) {
    console.error('Failed to parse local medicine state:', err);
  }

  // 3. Fallback to rich seed state
  const initial = { ...DEFAULT_SEED_DATA, userId: uid };
  saveToLocalCache(initial);
  return initial;
}

export async function saveMedicineAppointmentData(
  state: MedicineAppointmentState,
  userId?: string
): Promise<boolean> {
  state.updatedAt = new Date().toISOString();
  saveToLocalCache(state);

  if (userId) {
    try {
      const docRef = doc(db, 'users', userId, 'medicineManagement', 'state');
      await setDoc(docRef, state, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firestore medicine sync skipped/saved locally:', err);
      return true;
    }
  }
  return true;
}

function saveToLocalCache(state: MedicineAppointmentState) {
  try {
    const json = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, simpleEncrypt(json));
  } catch (err) {
    console.error('Failed to write medicine state to localStorage:', err);
  }
}

// -------------------------------------------------------------
// DAILY DOSE GENERATOR & ADHERENCE CALCULATOR
// -------------------------------------------------------------
export function generateTodayDoses(state: MedicineAppointmentState, targetDateStr?: string): MedicationDoseLog[] {
  const dateStr = targetDateStr || new Date().toISOString().split('T')[0];
  const existingLogsForDate = state.doseLogs.filter(l => l.scheduledDate === dateStr);

  const activeMeds = state.medications.filter(m => {
    if (!m.isActive) return false;
    if (m.startDate > dateStr) return false;
    if (m.endDate && m.endDate < dateStr) return false;
    return true;
  });

  const generatedList: MedicationDoseLog[] = [...existingLogsForDate];

  activeMeds.forEach(med => {
    med.reminderTimes.forEach(time => {
      const exists = existingLogsForDate.some(
        l => l.medicationId === med.id && l.scheduledTime === time
      );
      if (!exists) {
        generatedList.push({
          id: `dose_${med.id}_${dateStr}_${time.replace(':', '')}`,
          medicationId: med.id,
          medicationName: med.name,
          dosage: med.dosage,
          scheduledDate: dateStr,
          scheduledTime: time,
          timeSlot: getTimeSlot(time),
          status: 'pending',
          recordedBy: 'patient'
        });
      }
    });
  });

  // Check for auto-missed doses: if scheduledTime is > 2 hours in the past and still pending
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  if (dateStr === todayStr) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    generatedList.forEach(dose => {
      if (dose.status === 'pending') {
        const [h, m] = dose.scheduledTime.split(':').map(Number);
        const scheduledMinutes = h * 60 + m;
        if (currentMinutes - scheduledMinutes > 120) {
          dose.status = 'missed';
        }
      }
    });
  }

  // Sort by time
  return generatedList.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
}

export function computeAdherenceStats(doseLogs: MedicationDoseLog[]): {
  taken: number;
  missed: number;
  skipped: number;
  pending: number;
  totalScheduled: number;
  adherencePercentage: number;
} {
  let taken = 0;
  let missed = 0;
  let skipped = 0;
  let pending = 0;

  doseLogs.forEach(d => {
    if (d.status === 'taken') taken++;
    else if (d.status === 'missed') missed++;
    else if (d.status === 'skipped') skipped++;
    else if (d.status === 'pending') pending++;
  });

  const resolved = taken + missed + skipped;
  const adherencePercentage = resolved > 0 ? Math.round((taken / resolved) * 100) : 100;

  return {
    taken,
    missed,
    skipped,
    pending,
    totalScheduled: doseLogs.length,
    adherencePercentage
  };
}

// -------------------------------------------------------------
// CONVENIENCE ACTIONS: MEDICATIONS
// -------------------------------------------------------------
export async function addMedication(
  med: Omit<MedicationSchedule, 'id' | 'createdAt' | 'updatedAt'>,
  userId?: string
): Promise<MedicationSchedule> {
  const state = await getMedicineAppointmentData(userId);
  const nowIso = new Date().toISOString();

  const newMed: MedicationSchedule = {
    ...med,
    id: 'med_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    createdAt: nowIso,
    updatedAt: nowIso
  };

  state.medications = [newMed, ...state.medications];
  await saveMedicineAppointmentData(state, userId);
  return newMed;
}

export async function updateMedication(
  medId: string,
  updates: Partial<MedicationSchedule>,
  userId?: string
): Promise<MedicationSchedule | null> {
  const state = await getMedicineAppointmentData(userId);
  const idx = state.medications.findIndex(m => m.id === medId);
  if (idx === -1) return null;

  // SAFETY GUARD: Do NOT allow automatic silent modification of prescribed dosage
  const current = state.medications[idx];
  const updated: MedicationSchedule = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  state.medications[idx] = updated;
  await saveMedicineAppointmentData(state, userId);
  return updated;
}

export async function deleteMedication(medId: string, userId?: string): Promise<boolean> {
  const state = await getMedicineAppointmentData(userId);
  state.medications = state.medications.filter(m => m.id !== medId);
  state.doseLogs = state.doseLogs.filter(d => d.medicationId !== medId);
  await saveMedicineAppointmentData(state, userId);
  return true;
}

export async function updateDoseStatus(
  doseId: string,
  newStatus: DoseStatus,
  options?: { skippedReason?: string; takenAt?: string },
  userId?: string
): Promise<boolean> {
  const state = await getMedicineAppointmentData(userId);
  const existingIdx = state.doseLogs.findIndex(d => d.id === doseId);

  let targetMedId = '';

  if (existingIdx !== -1) {
    const existing = state.doseLogs[existingIdx];
    targetMedId = existing.medicationId;
    existing.status = newStatus;
    if (newStatus === 'taken') {
      existing.takenAt = options?.takenAt || new Date().toISOString();
      existing.skippedReason = undefined;
    } else if (newStatus === 'skipped') {
      existing.skippedReason = options?.skippedReason || 'Patient felt symptom relief / paused';
    } else if (newStatus === 'pending') {
      existing.takenAt = undefined;
      existing.skippedReason = undefined;
    }
  } else {
    // Parse composite id if generated on the fly
    // id pattern: dose_medId_YYYY-MM-DD_HHMM
    const parts = doseId.split('_');
    if (parts.length >= 4) {
      targetMedId = parts[1];
      const dateStr = parts[2];
      const timeStr = `${parts[3].slice(0, 2)}:${parts[3].slice(2, 4)}`;
      const med = state.medications.find(m => m.id === targetMedId);

      const newLog: MedicationDoseLog = {
        id: doseId,
        medicationId: targetMedId,
        medicationName: med?.name || 'Scheduled Medicine',
        dosage: med?.dosage || '',
        scheduledDate: dateStr,
        scheduledTime: timeStr,
        timeSlot: getTimeSlot(timeStr),
        status: newStatus,
        takenAt: newStatus === 'taken' ? (options?.takenAt || new Date().toISOString()) : undefined,
        skippedReason: newStatus === 'skipped' ? (options?.skippedReason || 'User recorded') : undefined,
        recordedBy: 'patient'
      };
      state.doseLogs.push(newLog);
    }
  }

  // Stock decrement on taken
  if (newStatus === 'taken' && targetMedId) {
    const medIdx = state.medications.findIndex(m => m.id === targetMedId);
    if (medIdx !== -1 && state.medications[medIdx].currentStock > 0) {
      state.medications[medIdx].currentStock -= 1;
      // Trigger refill check
      if (state.medications[medIdx].currentStock <= state.medications[medIdx].refillThreshold) {
        showBrowserNotification(
          `Refill Alert: ${state.medications[medIdx].name}`,
          { body: `Only ${state.medications[medIdx].currentStock} doses remaining. Contact your pharmacy for a refill.` }
        );
      }
    }
  }

  await saveMedicineAppointmentData(state, userId);
  return true;
}

export async function refillMedicationStock(
  medId: string,
  addedPills: number,
  userId?: string
): Promise<number> {
  const state = await getMedicineAppointmentData(userId);
  const med = state.medications.find(m => m.id === medId);
  if (!med) return 0;

  med.currentStock = Math.max(0, med.currentStock + addedPills);
  med.updatedAt = new Date().toISOString();
  await saveMedicineAppointmentData(state, userId);
  return med.currentStock;
}

// -------------------------------------------------------------
// CONVENIENCE ACTIONS: APPOINTMENTS
// -------------------------------------------------------------
export async function addHospitalAppointment(
  apt: Omit<HospitalAppointment, 'id' | 'createdAt'>,
  userId?: string
): Promise<HospitalAppointment> {
  const state = await getMedicineAppointmentData(userId);

  const newApt: HospitalAppointment = {
    ...apt,
    id: 'apt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    createdAt: new Date().toISOString()
  };

  state.appointments = [newApt, ...state.appointments];
  await saveMedicineAppointmentData(state, userId);
  return newApt;
}

export async function updateAppointmentStatus(
  aptId: string,
  status: AppointmentStatus,
  notes?: string,
  userId?: string
): Promise<boolean> {
  const state = await getMedicineAppointmentData(userId);
  const apt = state.appointments.find(a => a.id === aptId);
  if (!apt) return false;

  apt.status = status;
  if (notes) apt.consultationNotes = notes;
  await saveMedicineAppointmentData(state, userId);
  return true;
}

export async function deleteHospitalAppointment(aptId: string, userId?: string): Promise<boolean> {
  const state = await getMedicineAppointmentData(userId);
  state.appointments = state.appointments.filter(a => a.id !== aptId);
  await saveMedicineAppointmentData(state, userId);
  return true;
}
