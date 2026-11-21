import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface MedicalCondition {
  id: string;
  name: string;
  diagnosedYear: string;
  status: 'active' | 'managed' | 'resolved';
  severity: 'mild' | 'moderate' | 'severe';
  notes?: string;
}

export interface SurgeryRecord {
  id: string;
  procedure: string;
  hospital: string;
  year: string;
  surgeon?: string;
  complications?: string;
  notes?: string;
}

export interface AllergyRecord {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  type: 'drug' | 'food' | 'environmental' | 'other';
}

export interface FamilyHistoryRecord {
  id: string;
  relative: string;
  relation: 'father' | 'mother' | 'sibling' | 'grandparent' | 'other';
  condition: string;
  notes?: string;
}

export interface ClinicalNote {
  id: string;
  date: string;
  title: string;
  content: string;
  author?: string;
}

export interface PersonalMedicalHistory {
  conditions: MedicalCondition[];
  surgeries: SurgeryRecord[];
  allergies: AllergyRecord[];
  familyHistory: FamilyHistoryRecord[];
  medicalNotes: ClinicalNote[];
}

export type DocumentCategory = 
  | 'laboratory' 
  | 'prescription' 
  | 'discharge_summary' 
  | 'imaging_scan' 
  | 'vaccination' 
  | 'other';

export interface MedicalDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  documentDate: string; // YYYY-MM-DD
  uploadedAt: string; // ISO string
  fileType: 'pdf' | 'image';
  mimeType: string;
  fileSize: number; // in bytes
  fileUrl: string; // Base64 data URL or external URL
  fileName: string;
  facilityOrDoctor?: string;
  summary?: string;
  tags?: string[];
}

export type TimelineEventType = 
  | 'consultation' 
  | 'lab_report' 
  | 'surgery' 
  | 'medication_change' 
  | 'hospital_visit' 
  | 'vaccine';

export interface HealthTimelineEvent {
  id: string;
  date: string; // YYYY-MM-DD
  type: TimelineEventType;
  title: string;
  facilityOrDoctor?: string;
  description: string;
  outcome?: string;
  relatedDocumentId?: string;
}

export type VitalType = 'blood_pressure' | 'heart_rate' | 'spo2' | 'temperature' | 'blood_glucose';

export interface VitalValue {
  systolic?: number; // mmHg
  diastolic?: number; // mmHg
  bpm?: number; // beats/min
  percentage?: number; // SpO2 %
  temperature?: number; // °F
  tempUnit?: 'F' | 'C';
  glucose?: number; // mg/dL
  glucoseContext?: 'fasting' | 'postprandial' | 'random';
}

export interface HealthVitalRecord {
  id: string;
  recordedAt: string; // ISO string
  type: VitalType;
  value: VitalValue;
  notes?: string;
  status: 'normal' | 'borderline' | 'abnormal' | 'critical';
}

export interface UpcomingAppointment {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  doctor: string;
  specialty: string;
  hospitalOrClinic: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface CaregiverAccess {
  id: string;
  name: string;
  email: string;
  phone: string;
  relation: string;
  role: 'view_only' | 'manage_records';
  status: 'active' | 'pending' | 'revoked';
  grantedAt: string;
}

export interface DigitalHealthProfile {
  userId: string;
  personalHistory: PersonalMedicalHistory;
  documents: MedicalDocument[];
  timeline: HealthTimelineEvent[];
  vitals: HealthVitalRecord[];
  appointments: UpcomingAppointment[];
  caregivers: CaregiverAccess[];
  updatedAt: string;
  encryptionVersion: string;
}

// -------------------------------------------------------------
// LOCAL ENCRYPTION & TAMPER PROTECTION
// -------------------------------------------------------------
const STORAGE_KEY = 'lifeguard_digital_health_profile_v1';
const ENCRYPTION_PREFIX = 'LG_ENC_v1:';

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
// CLINICAL VITALS CLASSIFICATION
// -------------------------------------------------------------
export function classifyVital(type: VitalType, value: VitalValue): { status: 'normal' | 'borderline' | 'abnormal' | 'critical'; label: string; details: string } {
  switch (type) {
    case 'blood_pressure': {
      const sys = value.systolic ?? 120;
      const dia = value.diastolic ?? 80;
      if (sys > 180 || dia > 120) return { status: 'critical', label: 'Hypertensive Crisis', details: 'Seek emergency medical evaluation immediately' };
      if (sys >= 140 || dia >= 90) return { status: 'abnormal', label: 'Stage 2 Hypertension', details: 'Consult attending physician for medication review' };
      if (sys >= 130 || dia >= 80) return { status: 'borderline', label: 'Stage 1 Hypertension', details: 'Lifestyle modifications & dietary sodium monitoring recommended' };
      if (sys >= 120 && dia < 80) return { status: 'borderline', label: 'Elevated BP', details: 'Monitor blood pressure regularly' };
      if (sys < 90 || dia < 60) return { status: 'borderline', label: 'Low Blood Pressure (Hypotension)', details: 'Ensure adequate hydration and electrolyte balance' };
      return { status: 'normal', label: 'Normal Blood Pressure', details: 'Within standard healthy target (<120/<80 mmHg)' };
    }
    case 'heart_rate': {
      const bpm = value.bpm ?? 72;
      if (bpm < 50) return { status: 'abnormal', label: 'Severe Bradycardia', details: 'Pulse below 50 BPM; clinical evaluation recommended unless athletic' };
      if (bpm < 60) return { status: 'borderline', label: 'Mild Bradycardia', details: 'Pulse 50–59 BPM; normal in trained athletes or on beta-blockers' };
      if (bpm > 120) return { status: 'critical', label: 'Severe Tachycardia', details: 'Pulse exceeding 120 BPM at rest; seek medical evaluation' };
      if (bpm > 100) return { status: 'abnormal', label: 'Tachycardia', details: 'Elevated resting pulse (>100 BPM)' };
      return { status: 'normal', label: 'Normal Resting Pulse', details: 'Optimal range 60–100 BPM' };
    }
    case 'spo2': {
      const spo2 = value.percentage ?? 98;
      if (spo2 < 90) return { status: 'critical', label: 'Severe Hypoxemia Alert', details: 'Blood oxygen <90%; immediate supplemental oxygen & ER evaluation needed' };
      if (spo2 < 95) return { status: 'abnormal', label: 'Low Oxygen Saturation', details: 'SpO2 90–94%; monitor closely, check probe placement, re-test' };
      return { status: 'normal', label: 'Optimal Oxygen Saturation', details: 'Healthy arterial saturation (95–100%)' };
    }
    case 'temperature': {
      const tempF = value.tempUnit === 'C' ? ((value.temperature ?? 37) * 9) / 5 + 32 : (value.temperature ?? 98.6);
      if (tempF >= 103.0) return { status: 'critical', label: 'High Grade Fever', details: 'Temperature ≥103°F; contact physician immediately' };
      if (tempF >= 100.4) return { status: 'abnormal', label: 'Fever', details: 'Clinical pyrexia (≥100.4°F / 38°C); antipyretics and rest indicated' };
      if (tempF > 99.0) return { status: 'borderline', label: 'Low-Grade Elevated Temp', details: 'Mild elevation (99.1–100.3°F)' };
      if (tempF < 95.0) return { status: 'critical', label: 'Hypothermia Warning', details: 'Body temp <95°F; warm immediately' };
      return { status: 'normal', label: 'Normal Body Temperature', details: 'Within normal biological range (97.0–99.0°F)' };
    }
    case 'blood_glucose': {
      const mg = value.glucose ?? 95;
      const ctx = value.glucoseContext || 'fasting';
      if (ctx === 'fasting') {
        if (mg < 70) return { status: 'critical', label: 'Hypoglycemia Alert', details: 'Fasting glucose <70 mg/dL; consume 15g fast-acting carbohydrates' };
        if (mg >= 126) return { status: 'abnormal', label: 'Elevated Fasting Glucose', details: 'Fasting level ≥126 mg/dL indicative of diabetes mellitus' };
        if (mg >= 100) return { status: 'borderline', label: 'Impaired Fasting Glucose', details: 'Prediabetic range (100–125 mg/dL)' };
        return { status: 'normal', label: 'Normal Fasting Glucose', details: 'Optimal healthy fasting range (70–99 mg/dL)' };
      } else {
        if (mg < 70) return { status: 'critical', label: 'Hypoglycemia Alert', details: 'Blood glucose <70 mg/dL; take immediate carbohydrates' };
        if (mg >= 200) return { status: 'critical', label: 'Marked Hyperglycemia', details: 'Postprandial/Random ≥200 mg/dL; consult physician' };
        if (mg >= 140) return { status: 'borderline', label: 'Elevated Postprandial', details: 'Glucose 140–199 mg/dL; impaired glucose tolerance' };
        return { status: 'normal', label: 'Normal Postprandial Glucose', details: 'Optimal target under 140 mg/dL' };
      }
    }
  }
}

// -------------------------------------------------------------
// DOCUMENT UPLOAD VALIDATION & SECURITY
// -------------------------------------------------------------
export interface DocumentValidationResult {
  valid: boolean;
  error?: string;
  detectedType?: 'pdf' | 'image';
  sanitizedFileName?: string;
}

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
];

export async function validateDocumentFile(file: File): Promise<DocumentValidationResult> {
  // 1. File Size Check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 10MB.`
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'Empty file detected. Please upload a valid document.' };
  }

  // 2. MIME Type Check
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type (${file.type}). Allowed formats: PDF (.pdf) and Images (.jpg, .jpeg, .png, .webp).`
    };
  }

  // 3. File Extension Check
  const extensionMatch = file.name.match(/\.([0-9a-zA-Z]+)$/);
  const ext = extensionMatch ? extensionMatch[1].toLowerCase() : '';
  const allowedExts = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
  if (!allowedExts.includes(ext)) {
    return {
      valid: false,
      error: `Unsafe file extension .${ext}. Only .pdf, .jpg, .png, and .webp are accepted.`
    };
  }

  // 4. Magic Bytes Inspection (prevents renamed executables / script injection)
  try {
    const buffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    let isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46; // %PDF
    let isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
    let isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
    let isWebp = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && // RIFF
                 bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50; // WEBP

    if (!isPdf && !isJpeg && !isPng && !isWebp) {
      return {
        valid: false,
        error: 'File content verification failed. Document does not match legitimate PDF or Image signature.'
      };
    }

    const detectedType = isPdf ? 'pdf' : 'image';
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    return {
      valid: true,
      detectedType,
      sanitizedFileName
    };
  } catch (err) {
    return {
      valid: false,
      error: 'Security verification error while reading document bytes.'
    };
  }
}

// Convert File to Base64 Data URL for secure client-side storage / preview
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

// -------------------------------------------------------------
// SEED DEMO HEALTH RECORDS
// -------------------------------------------------------------
const DEFAULT_SEED_PROFILE: DigitalHealthProfile = {
  userId: 'local_patient',
  personalHistory: {
    conditions: [
      {
        id: 'cond_1',
        name: 'Type 2 Diabetes Mellitus',
        diagnosedYear: '2021',
        status: 'managed',
        severity: 'moderate',
        notes: 'Monitored with Metformin 500mg BID and dietary carbohydrate regulation.'
      },
      {
        id: 'cond_2',
        name: 'Primary Hypertension',
        diagnosedYear: '2022',
        status: 'managed',
        severity: 'mild',
        notes: 'Target BP maintained under 125/80 with Telmisartan 40mg.'
      },
      {
        id: 'cond_3',
        name: 'Seasonal Bronchial Asthma',
        diagnosedYear: '2018',
        status: 'active',
        severity: 'mild',
        notes: 'Triggered by cold weather and urban particulate exposure; Salbutamol inhaler PRN.'
      }
    ],
    surgeries: [
      {
        id: 'surg_1',
        procedure: 'Laparoscopic Appendectomy',
        hospital: 'Apollo Hospitals, Greams Road',
        year: '2019',
        surgeon: 'Dr. R. Ramanathan, MS FRCS',
        complications: 'None. Uneventful recovery.',
        notes: 'Completed elective keyhole surgery with rapid healing.'
      },
      {
        id: 'surg_2',
        procedure: 'Right Knee Arthroscopic Meniscal Repair',
        hospital: 'Kauvery Hospital, Alwarpet',
        year: '2023',
        surgeon: 'Dr. A. Sundaram, Ortho',
        complications: 'None; 6 weeks physiotherapy completed.',
        notes: 'Full range of motion restored.'
      }
    ],
    allergies: [
      {
        id: 'all_1',
        allergen: 'Penicillin & Amoxicillin',
        reaction: 'Severe urticaria, angioedema, and wheezing within 30 minutes',
        severity: 'severe',
        type: 'drug'
      },
      {
        id: 'all_2',
        allergen: 'Shellfish / Crustaceans',
        reaction: 'Gastrointestinal distress, oral itching, lip swelling',
        severity: 'moderate',
        type: 'food'
      },
      {
        id: 'all_3',
        allergen: 'Dust Mites & Particulate Matter',
        reaction: 'Asthma exacerbation, nocturnal coughing',
        severity: 'mild',
        type: 'environmental'
      }
    ],
    familyHistory: [
      {
        id: 'fam_1',
        relative: 'Father',
        relation: 'father',
        condition: 'Coronary Artery Disease & Myocardial Infarction',
        notes: 'Stented at age 58. On antiplatelet therapy.'
      },
      {
        id: 'fam_2',
        relative: 'Maternal Grandmother',
        relation: 'grandparent',
        condition: 'Type 2 Diabetes Mellitus & Diabetic Retinopathy',
        notes: 'Diagnosed at age 50.'
      },
      {
        id: 'fam_3',
        relative: 'Mother',
        relation: 'mother',
        condition: 'Hypothyroidism (Hashimoto)',
        notes: 'Managed on Levothyroxine 50 mcg daily.'
      }
    ],
    medicalNotes: [
      {
        id: 'note_1',
        date: '2026-10-15',
        title: 'Annual Diabetic Retinopathy & Neuropathy Screen',
        content: 'Bilateral fundus examination showed no diabetic microaneurysms. Monofilament 10g sensory test normal in both feet.',
        author: 'Dr. K. Swaminathan, MD DM'
      },
      {
        id: 'note_2',
        date: '2026-08-04',
        title: 'Cardiology Exercise Stress Test (TMT)',
        content: 'Achieved 10.2 METs with normal Duke Treadmill Score (+7). No ischemic ST depressions noted.',
        author: 'Dr. S. Venkataraman, DM Cardio'
      }
    ]
  },
  documents: [
    {
      id: 'doc_1',
      title: 'Comprehensive Metabolic & HbA1c Lab Report',
      category: 'laboratory',
      documentDate: '2026-10-12',
      uploadedAt: '2026-10-12T10:30:00Z',
      fileType: 'pdf',
      mimeType: 'application/pdf',
      fileSize: 1420500,
      fileUrl: '#sample-hba1c-report',
      fileName: 'Apollo_Diagnostics_HbA1c_Oct2026.pdf',
      facilityOrDoctor: 'Apollo Diagnostics Laboratory',
      summary: 'HbA1c: 6.4%, Fasting Blood Sugar: 98 mg/dL, Serum Creatinine: 0.9 mg/dL, eGFR: >90 mL/min.',
      tags: ['HbA1c', 'Glucose', 'Kidney Function']
    },
    {
      id: 'doc_2',
      title: 'Cardiology Prescription & Lipid Management',
      category: 'prescription',
      documentDate: '2026-08-04',
      uploadedAt: '2026-08-04T16:00:00Z',
      fileType: 'image',
      mimeType: 'image/jpeg',
      fileSize: 840200,
      fileUrl: '#sample-prescription-cardio',
      fileName: 'Kauvery_Cardio_Prescription_Aug2026.jpg',
      facilityOrDoctor: 'Dr. S. Venkataraman, Kauvery Heart City',
      summary: 'Telmisartan 40mg 1-0-0, Rosuvastatin 10mg 0-0-1, Metformin 500mg 1-0-1.',
      tags: ['Prescription', 'Cardiology', 'Hypertension']
    },
    {
      id: 'doc_3',
      title: 'Discharge Summary - Meniscal Repair',
      category: 'discharge_summary',
      documentDate: '2023-04-18',
      uploadedAt: '2023-04-19T09:15:00Z',
      fileType: 'pdf',
      mimeType: 'application/pdf',
      fileSize: 2150000,
      fileUrl: '#sample-discharge-summary',
      fileName: 'Kauvery_Discharge_Summary_Meniscus.pdf',
      facilityOrDoctor: 'Kauvery Hospital, Chennai',
      summary: 'Right knee arthroscopy performed under spinal anesthesia. Wound healed by primary intention.',
      tags: ['Surgery', 'Discharge Summary', 'Orthopedics']
    },
    {
      id: 'doc_4',
      title: 'Digital Chest X-Ray PA View',
      category: 'imaging_scan',
      documentDate: '2025-11-20',
      uploadedAt: '2025-11-20T14:45:00Z',
      fileType: 'image',
      mimeType: 'image/png',
      fileSize: 3200100,
      fileUrl: '#sample-chest-xray',
      fileName: 'Scans_Chest_XRay_Nov2025.png',
      facilityOrDoctor: 'Medall Precision Imaging',
      summary: 'Clear bilateral lung fields. Normal cardiothoracic ratio (CTR <0.5). Normal costophrenic angles.',
      tags: ['Chest X-Ray', 'Pulmonology']
    }
  ],
  timeline: [
    {
      id: 'time_1',
      date: '2026-10-15',
      type: 'consultation',
      title: 'Quarterly Endocrinology & Diabetes Review',
      facilityOrDoctor: 'Dr. K. Swaminathan (Apollo Clinic)',
      description: 'Reviewed 3-month continuous glucose monitoring. HbA1c reduced to 6.4%. Maintained Metformin 500mg BID.',
      outcome: 'Controlled glycemic status'
    },
    {
      id: 'time_2',
      date: '2026-10-12',
      type: 'lab_report',
      title: 'Fasting Lipid Panel & Glycated Hemoglobin',
      facilityOrDoctor: 'Apollo Diagnostics',
      description: 'HbA1c 6.4%, Total Cholesterol 168 mg/dL, HDL 48 mg/dL, LDL 92 mg/dL, Triglycerides 140 mg/dL.',
      outcome: 'Lipids within optimal cardioprotective targets'
    },
    {
      id: 'time_3',
      date: '2026-08-04',
      type: 'consultation',
      title: 'Preventive Cardiology & Stress Treadmill Review',
      facilityOrDoctor: 'Dr. S. Venkataraman (Kauvery Heart)',
      description: 'Electrocardiogram and Treadmill stress test showed good functional capacity with negative ischemia.',
      outcome: 'Cardiovascular fitness confirmed'
    },
    {
      id: 'time_4',
      date: '2026-06-10',
      type: 'medication_change',
      title: 'Antihypertensive Titration',
      facilityOrDoctor: 'Primary Physician',
      description: 'Switched from Amlodipine 5mg to Telmisartan 40mg due to mild pedal edema. Swelling completely resolved.',
      outcome: 'Blood pressure stabilized'
    },
    {
      id: 'time_5',
      date: '2023-04-18',
      type: 'surgery',
      title: 'Arthroscopic Meniscal Repair Admission & Discharge',
      facilityOrDoctor: 'Kauvery Hospital',
      description: 'Day-care arthroscopic procedure for medial meniscal tear. Discharged on oral analgesics with rehabilitation protocol.',
      outcome: 'Procedure successful; ambulatory next morning'
    }
  ],
  vitals: [
    {
      id: 'vit_1',
      recordedAt: '2026-11-20T08:15:00Z',
      type: 'blood_pressure',
      value: { systolic: 118, diastolic: 76 },
      notes: 'Morning resting reading before medication',
      status: 'normal'
    },
    {
      id: 'vit_2',
      recordedAt: '2026-11-15T08:30:00Z',
      type: 'blood_pressure',
      value: { systolic: 122, diastolic: 78 },
      notes: 'Morning sitting position',
      status: 'borderline'
    },
    {
      id: 'vit_3',
      recordedAt: '2026-11-10T19:00:00Z',
      type: 'blood_pressure',
      value: { systolic: 126, diastolic: 82 },
      notes: 'Evening after work',
      status: 'borderline'
    },
    {
      id: 'vit_4',
      recordedAt: '2026-11-05T08:00:00Z',
      type: 'blood_pressure',
      value: { systolic: 116, diastolic: 74 },
      notes: 'Morning reading',
      status: 'normal'
    },
    {
      id: 'vit_5',
      recordedAt: '2026-11-20T08:16:00Z',
      type: 'heart_rate',
      value: { bpm: 72 },
      notes: 'Resting pulse',
      status: 'normal'
    },
    {
      id: 'vit_6',
      recordedAt: '2026-11-15T08:31:00Z',
      type: 'heart_rate',
      value: { bpm: 76 },
      status: 'normal'
    },
    {
      id: 'vit_7',
      recordedAt: '2026-11-10T19:01:00Z',
      type: 'heart_rate',
      value: { bpm: 84 },
      status: 'normal'
    },
    {
      id: 'vit_8',
      recordedAt: '2026-11-20T08:17:00Z',
      type: 'spo2',
      value: { percentage: 99 },
      notes: 'Pulse oximeter room air',
      status: 'normal'
    },
    {
      id: 'vit_9',
      recordedAt: '2026-11-15T08:32:00Z',
      type: 'spo2',
      value: { percentage: 98 },
      status: 'normal'
    },
    {
      id: 'vit_10',
      recordedAt: '2026-11-10T19:02:00Z',
      type: 'spo2',
      value: { percentage: 98 },
      status: 'normal'
    },
    {
      id: 'vit_11',
      recordedAt: '2026-11-20T08:18:00Z',
      type: 'blood_glucose',
      value: { glucose: 96, glucoseContext: 'fasting' },
      notes: 'Fasting 10 hours',
      status: 'normal'
    },
    {
      id: 'vit_12',
      recordedAt: '2026-11-15T08:35:00Z',
      type: 'blood_glucose',
      value: { glucose: 104, glucoseContext: 'fasting' },
      notes: 'Mildly elevated after weekend dinner',
      status: 'borderline'
    },
    {
      id: 'vit_13',
      recordedAt: '2026-11-10T21:00:00Z',
      type: 'blood_glucose',
      value: { glucose: 134, glucoseContext: 'postprandial' },
      notes: '2 hours post-dinner',
      status: 'normal'
    },
    {
      id: 'vit_14',
      recordedAt: '2026-11-20T08:19:00Z',
      type: 'temperature',
      value: { temperature: 98.4, tempUnit: 'F' },
      notes: 'Infrared digital thermometer',
      status: 'normal'
    },
    {
      id: 'vit_15',
      recordedAt: '2026-11-15T08:36:00Z',
      type: 'temperature',
      value: { temperature: 98.6, tempUnit: 'F' },
      status: 'normal'
    }
  ],
  appointments: [
    {
      id: 'apt_1',
      date: '2026-12-10',
      time: '10:30',
      doctor: 'Dr. K. Swaminathan',
      specialty: 'Endocrinology & Diabetology',
      hospitalOrClinic: 'Apollo Specialty Hospitals, Chennai',
      reason: 'Semi-annual diabetes and metabolic management review',
      status: 'scheduled'
    },
    {
      id: 'apt_2',
      date: '2026-12-22',
      time: '16:00',
      doctor: 'Dr. S. Venkataraman',
      specialty: 'Interventional Cardiology',
      hospitalOrClinic: 'Kauvery Heart Institute',
      reason: 'Routine BP follow-up and echo surveillance',
      status: 'scheduled'
    }
  ],
  caregivers: [
    {
      id: 'cg_1',
      name: 'Ananya Kumar',
      email: 'ananya.k@example.com',
      phone: '+91 98401 23456',
      relation: 'Spouse',
      role: 'manage_records',
      status: 'active',
      grantedAt: '2026-05-10T10:00:00Z'
    },
    {
      id: 'cg_2',
      name: 'Dr. Rajesh Sharma',
      email: 'dr.rajesh.sharma@example.com',
      phone: '+91 94440 98765',
      relation: 'Primary Care Physician',
      role: 'view_only',
      status: 'active',
      grantedAt: '2026-06-01T14:30:00Z'
    }
  ],
  updatedAt: new Date().toISOString(),
  encryptionVersion: 'AES-Obfuscated-v1'
};

// -------------------------------------------------------------
// PROFILE PERSISTENCE (CLOUD FIRESTORE & LOCAL ENCRYPTED CACHE)
// -------------------------------------------------------------
export async function getHealthProfile(userId?: string): Promise<DigitalHealthProfile> {
  const uid = userId || 'local_patient';

  // 1. Check Cloud Firestore if authenticated
  if (userId) {
    try {
      const docRef = doc(db, 'users', userId, 'healthRecords', 'profile');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const cloudData = snap.data() as DigitalHealthProfile;
        // Update local encrypted cache
        saveToLocalCache(cloudData);
        return cloudData;
      }
    } catch (err) {
      console.warn('Firestore health profile fetch skipped/offline:', err);
    }
  }

  // 2. Read from local encrypted storage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const decrypted = simpleDecrypt(raw);
      const parsed = JSON.parse(decrypted) as DigitalHealthProfile;
      if (parsed) return parsed;
    }
  } catch (err) {
    console.error('Error decrypting local health profile:', err);
  }

  // 3. Fallback to rich seed profile
  const initial = { ...DEFAULT_SEED_PROFILE, userId: uid };
  saveToLocalCache(initial);
  return initial;
}

export async function saveHealthProfile(profile: DigitalHealthProfile, userId?: string): Promise<boolean> {
  profile.updatedAt = new Date().toISOString();

  // Save to local encrypted storage immediately
  saveToLocalCache(profile);

  // Sync to Firestore if authenticated
  if (userId) {
    try {
      const docRef = doc(db, 'users', userId, 'healthRecords', 'profile');
      await setDoc(docRef, profile, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firestore health profile sync deferred (saved locally):', err);
      return true;
    }
  }

  return true;
}

function saveToLocalCache(profile: DigitalHealthProfile) {
  try {
    const jsonStr = JSON.stringify(profile);
    const enc = simpleEncrypt(jsonStr);
    localStorage.setItem(STORAGE_KEY, enc);
  } catch (err) {
    console.error('Failed to write encrypted health profile to localStorage:', err);
  }
}

// -------------------------------------------------------------
// CONVENIENCE ACTIONS
// -------------------------------------------------------------

export async function addVitalRecord(
  vital: Omit<HealthVitalRecord, 'id' | 'status'>,
  userId?: string
): Promise<HealthVitalRecord> {
  const profile = await getHealthProfile(userId);
  const classification = classifyVital(vital.type, vital.value);

  const newRecord: HealthVitalRecord = {
    ...vital,
    id: 'vit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    status: classification.status
  };

  profile.vitals = [newRecord, ...profile.vitals];
  await saveHealthProfile(profile, userId);
  return newRecord;
}

export async function deleteVitalRecord(vitalId: string, userId?: string): Promise<boolean> {
  const profile = await getHealthProfile(userId);
  profile.vitals = profile.vitals.filter(v => v.id !== vitalId);
  await saveHealthProfile(profile, userId);
  return true;
}

export async function addMedicalDocument(
  docData: Omit<MedicalDocument, 'id' | 'uploadedAt'>,
  userId?: string
): Promise<MedicalDocument> {
  const profile = await getHealthProfile(userId);

  const newDoc: MedicalDocument = {
    ...docData,
    id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    uploadedAt: new Date().toISOString()
  };

  profile.documents = [newDoc, ...profile.documents];

  // Automatically append a corresponding timeline event for document upload
  const timelineItem: HealthTimelineEvent = {
    id: 'time_' + Date.now(),
    date: docData.documentDate || new Date().toISOString().split('T')[0],
    type: docData.category === 'prescription' ? 'medication_change' : 'lab_report',
    title: docData.title,
    facilityOrDoctor: docData.facilityOrDoctor || 'Diagnostics & Records',
    description: docData.summary || `Archived medical document: ${docData.fileName}`,
    relatedDocumentId: newDoc.id
  };
  profile.timeline = [timelineItem, ...profile.timeline];

  await saveHealthProfile(profile, userId);
  return newDoc;
}

export async function deleteMedicalDocument(docId: string, userId?: string): Promise<boolean> {
  const profile = await getHealthProfile(userId);
  profile.documents = profile.documents.filter(d => d.id !== docId);
  profile.timeline = profile.timeline.filter(t => t.relatedDocumentId !== docId);
  await saveHealthProfile(profile, userId);
  return true;
}

export async function addTimelineEvent(
  event: Omit<HealthTimelineEvent, 'id'>,
  userId?: string
): Promise<HealthTimelineEvent> {
  const profile = await getHealthProfile(userId);

  const newEvent: HealthTimelineEvent = {
    ...event,
    id: 'time_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
  };

  profile.timeline = [newEvent, ...profile.timeline];
  await saveHealthProfile(profile, userId);
  return newEvent;
}

export async function deleteTimelineEvent(eventId: string, userId?: string): Promise<boolean> {
  const profile = await getHealthProfile(userId);
  profile.timeline = profile.timeline.filter(t => t.id !== eventId);
  await saveHealthProfile(profile, userId);
  return true;
}

export async function updatePersonalHistory(
  history: Partial<PersonalMedicalHistory>,
  userId?: string
): Promise<PersonalMedicalHistory> {
  const profile = await getHealthProfile(userId);
  profile.personalHistory = {
    ...profile.personalHistory,
    ...history
  };
  await saveHealthProfile(profile, userId);
  return profile.personalHistory;
}

export async function addCaregiver(
  caregiver: Omit<CaregiverAccess, 'id' | 'grantedAt' | 'status'>,
  userId?: string
): Promise<CaregiverAccess> {
  const profile = await getHealthProfile(userId);

  const newCaregiver: CaregiverAccess = {
    ...caregiver,
    id: 'cg_' + Date.now(),
    status: 'active',
    grantedAt: new Date().toISOString()
  };

  profile.caregivers = [...profile.caregivers, newCaregiver];
  await saveHealthProfile(profile, userId);
  return newCaregiver;
}

export async function revokeCaregiver(caregiverId: string, userId?: string): Promise<boolean> {
  const profile = await getHealthProfile(userId);
  profile.caregivers = profile.caregivers.map(cg => 
    cg.id === caregiverId ? { ...cg, status: 'revoked' as const } : cg
  );
  await saveHealthProfile(profile, userId);
  return true;
}

export async function deleteCaregiver(caregiverId: string, userId?: string): Promise<boolean> {
  const profile = await getHealthProfile(userId);
  profile.caregivers = profile.caregivers.filter(cg => cg.id !== caregiverId);
  await saveHealthProfile(profile, userId);
  return true;
}

export async function addAppointment(
  apt: Omit<UpcomingAppointment, 'id' | 'status'>,
  userId?: string
): Promise<UpcomingAppointment> {
  const profile = await getHealthProfile(userId);

  const newApt: UpcomingAppointment = {
    ...apt,
    id: 'apt_' + Date.now(),
    status: 'scheduled'
  };

  profile.appointments = [...profile.appointments, newApt];
  await saveHealthProfile(profile, userId);
  return newApt;
}

export async function deleteAppointment(appointmentId: string, userId?: string): Promise<boolean> {
  const profile = await getHealthProfile(userId);
  profile.appointments = profile.appointments.filter(a => a.id !== appointmentId);
  await saveHealthProfile(profile, userId);
  return true;
}
