import { db } from '../config/firebase';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { BloodGroup, BloodComponent } from './bloodCompatibilityService';

export interface VerificationDocument {
  id: string;
  title: string;
  fileUrl: string;
  documentType: 'clinical_license' | 'blood_bank_license' | 'superintendent_id' | 'other';
  uploadedAt: string;
}

export interface HospitalRecord {
  id: string;
  name: string;
  hospitalType: 'Trauma & Multi-Speciality' | 'General Hospital' | 'Government Medical College' | 'Super Speciality' | 'Emergency Clinic';
  licenseNumber: string;
  address: string;
  city: string;
  pinCode: string;
  lat: number;
  lng: number;
  emergencyPhone: string;
  landlinePhone?: string;
  emergencyDepartmentAvailable: boolean; // 24/7 Emergency / Trauma
  totalBeds: number;
  icuBedsAvailable: number;
  verificationStatus: 'verified' | 'pending' | 'rejected' | 'suspended';
  verifiedAt?: string;
  periodicVerificationExpiresAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  adminStaffId: string;
  adminStaffName: string;
  adminStaffEmail: string;
  adminStaffDesignation: string;
  hasBloodBank: boolean;
  bloodBankId?: string;
  verificationDocuments: VerificationDocument[];
  createdAt: string;
  updatedAt: string;
}

export type StockFreshness = 'fresh' | 'moderate' | 'stale';

export interface BloodBankRecord {
  id: string;
  hospitalId?: string;
  hospitalName?: string;
  name: string;
  licenseNumber: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  contactPhone: string;
  email: string;
  operatingHours: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  lastStockUpdate: string;
  availableComponents: BloodComponent[];
  freshness: StockFreshness;
  createdAt: string;
  updatedAt: string;
}

export interface BloodInventoryItem {
  id: string;
  bloodBankId: string;
  bloodBankName: string;
  bloodGroup: BloodGroup;
  bloodComponent: BloodComponent;
  availableUnits: number;
  reservedUnits: number;
  expiryDate: string; // ISO Date string
  batchNumber: string;
  status: 'available' | 'low_stock' | 'critical' | 'expired';
  lastUpdated: string;
  verifiedByStaff: string;
}

export interface PatientHandoverRecord {
  id: string;
  handoverCode: string; // e.g. "HO-84192"
  patientName: string;
  patientAge?: number | string;
  patientGender?: string;
  bloodGroup: string;
  allergies: string[];
  criticalConditions: string[];
  currentMedications: string[];
  emergencyNotes: string;
  sosTimestamp: string;
  incidentLocation?: {
    lat?: number;
    lng?: number;
    address: string;
  };
  vitalSigns: {
    pulseBpm?: number;
    bloodPressure?: string;
    spO2Percent?: number;
    respRate?: number;
    gcsScore?: number; // Glasgow Coma Scale (3-15)
  };
  transportingAmbulance?: string;
  paramedicNotes?: string;
  receivingHospitalId: string;
  receivingHospitalName: string;
  status: 'dispatched' | 'en_route' | 'received' | 'admitted';
  generatedAt: string;
  receivedAt?: string;
}

const LOCAL_HOSPITALS_KEY = 'lifeguard_hospitals_data';
const LOCAL_BLOOD_BANKS_KEY = 'lifeguard_blood_banks_data';
const LOCAL_INVENTORY_KEY = 'lifeguard_blood_inventory_data';
const LOCAL_HANDOVERS_KEY = 'lifeguard_patient_handovers_data';

/**
 * Evaluates the freshness of inventory or stock reporting
 */
export const evaluateStockFreshness = (lastStockUpdateIso: string): StockFreshness => {
  try {
    const updateTime = new Date(lastStockUpdateIso).getTime();
    const diffHours = (Date.now() - updateTime) / (1000 * 60 * 60);

    if (diffHours <= 24) return 'fresh';
    if (diffHours <= 72) return 'moderate';
    return 'stale';
  } catch {
    return 'stale';
  }
};

/**
 * 1. HOSPITAL DIRECTORY METHODS
 */
export const getAllHospitals = async (): Promise<HospitalRecord[]> => {
  let list: HospitalRecord[] = [];

  try {
    const raw = localStorage.getItem(LOCAL_HOSPITALS_KEY);
    if (raw) list = JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading local hospitals:', e);
  }

  if (list.length === 0) {
    list = generateSeedHospitals();
    try {
      localStorage.setItem(LOCAL_HOSPITALS_KEY, JSON.stringify(list));
    } catch {}
  }

  // Sync with Firestore if available
  if (db) {
    try {
      const snaps = await getDocs(collection(db, 'hospitals'));
      if (!snaps.empty) {
        const cloudHospitals: HospitalRecord[] = snaps.docs.map(d => ({
          id: d.id,
          ...d.data()
        } as HospitalRecord));
        const cloudIds = new Set(cloudHospitals.map(h => h.id));
        list = [...cloudHospitals, ...list.filter(h => !cloudIds.has(h.id))];
      }
    } catch (e) {
      console.warn('Firestore hospitals query fallback:', e);
    }
  }

  return list;
};

export const getHospitalById = async (id: string): Promise<HospitalRecord | null> => {
  const all = await getAllHospitals();
  return all.find(h => h.id === id) || null;
};

/**
 * 2. BLOOD BANK DIRECTORY METHODS
 */
export const getAllBloodBanks = async (): Promise<BloodBankRecord[]> => {
  let list: BloodBankRecord[] = [];

  try {
    const raw = localStorage.getItem(LOCAL_BLOOD_BANKS_KEY);
    if (raw) list = JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading local blood banks:', e);
  }

  if (list.length === 0) {
    list = generateSeedBloodBanks();
    try {
      localStorage.setItem(LOCAL_BLOOD_BANKS_KEY, JSON.stringify(list));
    } catch {}
  }

  // Update freshness status on the fly
  return list.map(bb => ({
    ...bb,
    freshness: evaluateStockFreshness(bb.lastStockUpdate)
  }));
};

/**
 * 3. BLOOD BANK INVENTORY METHODS
 */
export const getInventoryByBloodBank = async (bloodBankId: string): Promise<BloodInventoryItem[]> => {
  let list: BloodInventoryItem[] = [];

  try {
    const raw = localStorage.getItem(LOCAL_INVENTORY_KEY);
    if (raw) list = JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading local inventory:', e);
  }

  if (list.length === 0) {
    list = generateSeedInventory();
    try {
      localStorage.setItem(LOCAL_INVENTORY_KEY, JSON.stringify(list));
    } catch {}
  }

  return list.filter(item => item.bloodBankId === bloodBankId);
};

export const getAllInventoryItems = async (): Promise<BloodInventoryItem[]> => {
  let list: BloodInventoryItem[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_INVENTORY_KEY);
    if (raw) list = JSON.parse(raw);
  } catch {}
  if (list.length === 0) {
    list = generateSeedInventory();
    try {
      localStorage.setItem(LOCAL_INVENTORY_KEY, JSON.stringify(list));
    } catch {}
  }
  return list;
};

export const updateInventoryItemUnits = async (
  itemId: string,
  newUnits: number,
  staffName: string = 'Duty Transfusion Officer'
): Promise<BloodInventoryItem | null> => {
  const all = await getAllInventoryItems();
  const target = all.find(i => i.id === itemId);
  if (!target) return null;

  target.availableUnits = Math.max(0, newUnits);
  target.lastUpdated = new Date().toISOString();
  target.verifiedByStaff = staffName;

  if (target.availableUnits === 0) {
    target.status = 'critical';
  } else if (target.availableUnits <= 2) {
    target.status = 'low_stock';
  } else {
    target.status = 'available';
  }

  try {
    localStorage.setItem(LOCAL_INVENTORY_KEY, JSON.stringify(all));
  } catch {}

  // Update blood bank last stock update timestamp
  await attestBloodBankStock(target.bloodBankId);

  return target;
};

export const attestBloodBankStock = async (bloodBankId: string): Promise<void> => {
  const allBanks = await getAllBloodBanks();
  const target = allBanks.find(b => b.id === bloodBankId);
  if (target) {
    target.lastStockUpdate = new Date().toISOString();
    target.freshness = 'fresh';
    target.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(LOCAL_BLOOD_BANKS_KEY, JSON.stringify(allBanks));
    } catch {}
  }
};

/**
 * 4. HOSPITAL REGISTRATION WORKFLOW
 */
export const registerHospitalFacility = async (params: {
  name: string;
  hospitalType: HospitalRecord['hospitalType'];
  licenseNumber: string;
  address: string;
  city: string;
  pinCode: string;
  lat?: number;
  lng?: number;
  emergencyPhone: string;
  landlinePhone?: string;
  emergencyDepartmentAvailable: boolean;
  totalBeds: number;
  icuBedsAvailable: number;
  adminStaffName: string;
  adminStaffEmail: string;
  adminStaffDesignation: string;
  hasBloodBank: boolean;
  documents: Array<{ title: string; fileUrl: string; documentType: VerificationDocument['documentType'] }>;
}): Promise<HospitalRecord> => {
  const now = new Date().toISOString();
  const hospId = 'hosp_' + Date.now();
  const bloodBankId = params.hasBloodBank ? 'bb_' + hospId : undefined;

  const newHospital: HospitalRecord = {
    id: hospId,
    name: params.name,
    hospitalType: params.hospitalType,
    licenseNumber: params.licenseNumber,
    address: params.address,
    city: params.city,
    pinCode: params.pinCode,
    lat: params.lat || 13.0827,
    lng: params.lng || 80.2707,
    emergencyPhone: params.emergencyPhone,
    landlinePhone: params.landlinePhone,
    emergencyDepartmentAvailable: params.emergencyDepartmentAvailable,
    totalBeds: Number(params.totalBeds) || 50,
    icuBedsAvailable: Number(params.icuBedsAvailable) || 5,
    verificationStatus: 'pending', // Starts in pending review
    adminStaffId: 'staff_' + Date.now(),
    adminStaffName: params.adminStaffName,
    adminStaffEmail: params.adminStaffEmail,
    adminStaffDesignation: params.adminStaffDesignation,
    hasBloodBank: params.hasBloodBank,
    bloodBankId,
    verificationDocuments: params.documents.map((d, index) => ({
      id: 'doc_' + index + '_' + Date.now(),
      title: d.title,
      fileUrl: d.fileUrl,
      documentType: d.documentType,
      uploadedAt: now
    })),
    createdAt: now,
    updatedAt: now
  };

  // Save Hospital
  try {
    const raw = localStorage.getItem(LOCAL_HOSPITALS_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    localStorage.setItem(LOCAL_HOSPITALS_KEY, JSON.stringify([newHospital, ...existing]));
  } catch (e) {
    console.error('Failed to save hospital locally:', e);
  }

  // If on-site blood bank, initialize blood bank record as well
  if (params.hasBloodBank && bloodBankId) {
    const newBloodBank: BloodBankRecord = {
      id: bloodBankId,
      hospitalId: hospId,
      hospitalName: params.name,
      name: `${params.name} Blood Bank Center`,
      licenseNumber: `BB-${params.licenseNumber}`,
      address: params.address,
      city: params.city,
      lat: newHospital.lat,
      lng: newHospital.lng,
      contactPhone: params.emergencyPhone,
      email: params.adminStaffEmail,
      operatingHours: params.emergencyDepartmentAvailable ? '24/7 Round-the-Clock' : '8:00 AM - 8:00 PM',
      verificationStatus: 'pending',
      lastStockUpdate: now,
      availableComponents: ['Packed Red Blood Cells (PRBC)', 'Fresh Frozen Plasma (FFP)', 'Whole Blood', 'Platelet Concentrate (RDP)'],
      freshness: 'fresh',
      createdAt: now,
      updatedAt: now
    };

    try {
      const rawBB = localStorage.getItem(LOCAL_BLOOD_BANKS_KEY);
      const existingBB = rawBB ? JSON.parse(rawBB) : [];
      localStorage.setItem(LOCAL_BLOOD_BANKS_KEY, JSON.stringify([newBloodBank, ...existingBB]));
    } catch {}
  }

  if (db) {
    try {
      await setDoc(doc(db, 'hospitals', hospId), newHospital);
    } catch (e) {
      console.warn('Firestore setDoc hospital fallback:', e);
    }
  }

  return newHospital;
};

/**
 * 5. ADMIN VERIFICATION & GOVERNANCE
 */
export const updateHospitalVerificationStatus = async (
  hospitalId: string,
  status: 'verified' | 'rejected' | 'suspended' | 'pending',
  verifiedBy: string = 'Chief Medical Auditor',
  rejectionReason?: string
): Promise<HospitalRecord | null> => {
  const allHospitals = await getAllHospitals();
  const target = allHospitals.find(h => h.id === hospitalId);
  if (!target) return null;

  const now = new Date().toISOString();
  target.verificationStatus = status;
  target.updatedAt = now;

  if (status === 'verified') {
    target.verifiedAt = now;
    target.verifiedBy = verifiedBy;
    // Periodic verification expires in 90 days
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 90);
    target.periodicVerificationExpiresAt = expiry.toISOString();
    target.rejectionReason = undefined;

    // Also verify attached blood bank
    if (target.bloodBankId) {
      const allBB = await getAllBloodBanks();
      const bb = allBB.find(b => b.id === target.bloodBankId);
      if (bb) {
        bb.verificationStatus = 'verified';
        bb.updatedAt = now;
        localStorage.setItem(LOCAL_BLOOD_BANKS_KEY, JSON.stringify(allBB));
      }
    }
  } else if (status === 'rejected') {
    target.rejectionReason = rejectionReason || 'Documentation non-compliant with Clinical Establishment Act requirements.';
  }

  try {
    localStorage.setItem(LOCAL_HOSPITALS_KEY, JSON.stringify(allHospitals));
  } catch {}

  if (db) {
    try {
      await updateDoc(doc(db, 'hospitals', hospitalId), {
        verificationStatus: target.verificationStatus,
        verifiedAt: target.verifiedAt,
        periodicVerificationExpiresAt: target.periodicVerificationExpiresAt,
        verifiedBy: target.verifiedBy,
        rejectionReason: target.rejectionReason,
        updatedAt: target.updatedAt
      });
    } catch {}
  }

  return target;
};

/**
 * 6. EMERGENCY PATIENT HANDOVER
 */
export const createPatientHandover = async (params: {
  patientName: string;
  patientAge?: number | string;
  patientGender?: string;
  bloodGroup: string;
  allergies?: string[];
  criticalConditions?: string[];
  currentMedications?: string[];
  emergencyNotes?: string;
  sosTimestamp?: string;
  incidentLocation?: { lat?: number; lng?: number; address: string };
  vitalSigns?: PatientHandoverRecord['vitalSigns'];
  transportingAmbulance?: string;
  paramedicNotes?: string;
  receivingHospitalId: string;
  receivingHospitalName: string;
}): Promise<PatientHandoverRecord> => {
  const now = new Date().toISOString();
  const randNum = Math.floor(10000 + Math.random() * 90000);
  const handoverCode = `HO-${randNum}`;
  const handoverId = `handover_${Date.now()}`;

  const handover: PatientHandoverRecord = {
    id: handoverId,
    handoverCode,
    patientName: params.patientName,
    patientAge: params.patientAge || 'Unknown',
    patientGender: params.patientGender || 'Unspecified',
    bloodGroup: params.bloodGroup || 'Unknown',
    allergies: params.allergies || [],
    criticalConditions: params.criticalConditions || [],
    currentMedications: params.currentMedications || [],
    emergencyNotes: params.emergencyNotes || 'Emergency patient transported via ambulance triage.',
    sosTimestamp: params.sosTimestamp || now,
    incidentLocation: params.incidentLocation,
    vitalSigns: params.vitalSigns || { pulseBpm: 88, bloodPressure: '120/80', spO2Percent: 98, gcsScore: 15 },
    transportingAmbulance: params.transportingAmbulance || 'Ambulance Unit 108-A',
    paramedicNotes: params.paramedicNotes || 'Patient stable during transit with continuous vitals monitoring.',
    receivingHospitalId: params.receivingHospitalId,
    receivingHospitalName: params.receivingHospitalName,
    status: 'en_route',
    generatedAt: now
  };

  try {
    const raw = localStorage.getItem(LOCAL_HANDOVERS_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    localStorage.setItem(LOCAL_HANDOVERS_KEY, JSON.stringify([handover, ...existing]));
  } catch (e) {
    console.error('Failed saving handover locally:', e);
  }

  if (db) {
    try {
      await setDoc(doc(db, 'patient_handovers', handoverId), handover);
    } catch {}
  }

  return handover;
};

export const getHandoversForHospital = async (hospitalId: string): Promise<PatientHandoverRecord[]> => {
  let list: PatientHandoverRecord[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_HANDOVERS_KEY);
    if (raw) list = JSON.parse(raw);
  } catch {}

  if (list.length === 0) {
    list = generateSeedHandovers();
    try {
      localStorage.setItem(LOCAL_HANDOVERS_KEY, JSON.stringify(list));
    } catch {}
  }

  return list.filter(h => h.receivingHospitalId === hospitalId || hospitalId === 'all');
};

export const updateHandoverStatus = async (
  handoverId: string,
  newStatus: PatientHandoverRecord['status']
): Promise<PatientHandoverRecord | null> => {
  let list: PatientHandoverRecord[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_HANDOVERS_KEY);
    if (raw) list = JSON.parse(raw);
  } catch {}

  const target = list.find(h => h.id === handoverId || h.handoverCode === handoverId);
  if (!target) return null;

  target.status = newStatus;
  if (newStatus === 'received' || newStatus === 'admitted') {
    target.receivedAt = new Date().toISOString();
  }

  try {
    localStorage.setItem(LOCAL_HANDOVERS_KEY, JSON.stringify(list));
  } catch {}

  return target;
};

/**
 * SEED DATA GENERATORS
 */
function generateSeedHospitals(): HospitalRecord[] {
  return [
    {
      id: 'hosp_apollo_01',
      name: 'Apollo Speciality Hospital',
      hospitalType: 'Trauma & Multi-Speciality',
      licenseNumber: 'TN-MED-CHE-2018-0914',
      address: 'No. 21, Greams Lane, Thousand Lights',
      city: 'Chennai',
      pinCode: '600006',
      lat: 13.0569,
      lng: 80.2514,
      emergencyPhone: '+91 44 2829 0200',
      landlinePhone: '+91 44 2829 3333',
      emergencyDepartmentAvailable: true,
      totalBeds: 450,
      icuBedsAvailable: 18,
      verificationStatus: 'verified',
      verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
      periodicVerificationExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 75).toISOString(),
      verifiedBy: 'State Health Accreditation Board',
      adminStaffId: 'staff_ap_01',
      adminStaffName: 'Dr. S. Sundaram, MD',
      adminStaffEmail: 'emergency@apollohospitals.example',
      adminStaffDesignation: 'Head of Trauma & Emergency Medicine',
      hasBloodBank: true,
      bloodBankId: 'bb_apollo_01',
      verificationDocuments: [
        {
          id: 'doc_ap_1',
          title: 'Clinical Establishment Act License 2024-2029',
          fileUrl: '/docs/clinical_license_apollo.pdf',
          documentType: 'clinical_license',
          uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString()
    },
    {
      id: 'hosp_mims_02',
      name: 'Government General Hospital (RGGGH)',
      hospitalType: 'Government Medical College',
      licenseNumber: 'TN-GOV-CHE-1994-0001',
      address: 'EVR Periyar Salai, Park Town',
      city: 'Chennai',
      pinCode: '600003',
      lat: 13.0827,
      lng: 80.2707,
      emergencyPhone: '+91 44 2530 5000',
      landlinePhone: '+91 44 2530 5112',
      emergencyDepartmentAvailable: true,
      totalBeds: 1200,
      icuBedsAvailable: 42,
      verificationStatus: 'verified',
      verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      periodicVerificationExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 80).toISOString(),
      verifiedBy: 'Directorate of Medical Services',
      adminStaffId: 'staff_rgggh_02',
      adminStaffName: 'Dr. V. Priya, MS',
      adminStaffEmail: 'rgggh.trauma@tn.gov.example',
      adminStaffDesignation: 'Medical Superintendent',
      hasBloodBank: true,
      bloodBankId: 'bb_rgggh_02',
      verificationDocuments: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
    },
    {
      id: 'hosp_kauvery_03',
      name: 'Kauvery Hospital',
      hospitalType: 'Super Speciality',
      licenseNumber: 'TN-MED-CHE-2020-1120',
      address: 'No. 81, TTK Road, Alwarpet',
      city: 'Chennai',
      pinCode: '600018',
      lat: 13.0334,
      lng: 80.2528,
      emergencyPhone: '+91 44 4000 6000',
      emergencyDepartmentAvailable: true,
      totalBeds: 280,
      icuBedsAvailable: 12,
      verificationStatus: 'verified',
      verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
      periodicVerificationExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 70).toISOString(),
      verifiedBy: 'NABH Accreditation Board',
      adminStaffId: 'staff_kh_03',
      adminStaffName: 'Dr. Anand M.',
      adminStaffEmail: 'er@kauveryhospital.example',
      adminStaffDesignation: 'Clinical Operations Director',
      hasBloodBank: true,
      bloodBankId: 'bb_kauvery_03',
      verificationDocuments: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 50).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString()
    },
    {
      id: 'hosp_metro_04',
      name: 'Metro City Trauma Care Center',
      hospitalType: 'Trauma & Multi-Speciality',
      licenseNumber: 'TN-MED-REG-2026-PENDING',
      address: 'No. 14, Outer Ring Road, Ambattur',
      city: 'Chennai',
      pinCode: '600053',
      lat: 13.1143,
      lng: 80.1548,
      emergencyPhone: '+91 44 6789 0123',
      emergencyDepartmentAvailable: false,
      totalBeds: 80,
      icuBedsAvailable: 3,
      verificationStatus: 'pending', // Pending verification
      adminStaffId: 'staff_metro_04',
      adminStaffName: 'Dr. Rajiv Menon',
      adminStaffEmail: 'admin@metrotrauma.example',
      adminStaffDesignation: 'Chief Administrator',
      hasBloodBank: false,
      verificationDocuments: [
        {
          id: 'doc_m4_1',
          title: 'Submitted Building Plan & Fire Safety Approval',
          fileUrl: '/docs/fire_safety_metro.pdf',
          documentType: 'other',
          uploadedAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

function generateSeedBloodBanks(): BloodBankRecord[] {
  const now = Date.now();
  return [
    {
      id: 'bb_apollo_01',
      hospitalId: 'hosp_apollo_01',
      hospitalName: 'Apollo Speciality Hospital',
      name: 'Apollo Central Blood Bank & Component Separation Unit',
      licenseNumber: 'CDSCO-LIC-BB-TN-0482',
      address: 'No. 21, Greams Lane, Thousand Lights',
      city: 'Chennai',
      lat: 13.0569,
      lng: 80.2514,
      contactPhone: '+91 44 2829 0200',
      email: 'bloodbank@apollohospitals.example',
      operatingHours: '24/7 Round-the-Clock Emergency Blood Bank',
      verificationStatus: 'verified',
      lastStockUpdate: new Date(now - 1000 * 60 * 90).toISOString(), // 1.5h ago = FRESH
      availableComponents: ['Packed Red Blood Cells (PRBC)', 'Platelet Concentrate (RDP)', 'Single Donor Platelets (SDP)', 'Fresh Frozen Plasma (FFP)', 'Cryoprecipitate', 'Whole Blood'],
      freshness: 'fresh',
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 30).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 90).toISOString()
    },
    {
      id: 'bb_rgggh_02',
      hospitalId: 'hosp_mims_02',
      hospitalName: 'Government General Hospital (RGGGH)',
      name: 'RGGGH Model Blood Bank & Transfusion Medicine Dept',
      licenseNumber: 'CDSCO-LIC-BB-TN-0012',
      address: 'EVR Periyar Salai, Park Town',
      city: 'Chennai',
      lat: 13.0827,
      lng: 80.2707,
      contactPhone: '+91 44 2530 5000',
      email: 'bloodbank.rgggh@tn.gov.example',
      operatingHours: '24/7 Government Regional Blood Bank',
      verificationStatus: 'verified',
      lastStockUpdate: new Date(now - 1000 * 60 * 60 * 6).toISOString(), // 6h ago = FRESH
      availableComponents: ['Packed Red Blood Cells (PRBC)', 'Platelet Concentrate (RDP)', 'Fresh Frozen Plasma (FFP)', 'Whole Blood'],
      freshness: 'fresh',
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 40).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 6).toISOString()
    },
    {
      id: 'bb_kauvery_03',
      hospitalId: 'hosp_kauvery_03',
      hospitalName: 'Kauvery Hospital',
      name: 'Kauvery Hospital Licensed Blood Bank',
      licenseNumber: 'CDSCO-LIC-BB-TN-0891',
      address: 'No. 81, TTK Road, Alwarpet',
      city: 'Chennai',
      lat: 13.0334,
      lng: 80.2528,
      contactPhone: '+91 44 4000 6000',
      email: 'bloodservice@kauveryhospital.example',
      operatingHours: '24/7 Emergency Blood Bank',
      verificationStatus: 'verified',
      lastStockUpdate: new Date(now - 1000 * 60 * 60 * 48).toISOString(), // 48h ago = MODERATE
      availableComponents: ['Packed Red Blood Cells (PRBC)', 'Single Donor Platelets (SDP)', 'Fresh Frozen Plasma (FFP)'],
      freshness: 'moderate',
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 50).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 48).toISOString()
    },
    {
      id: 'bb_redcross_04',
      name: 'Indian Red Cross Society District Blood Center',
      licenseNumber: 'CDSCO-LIC-BB-TN-0005',
      address: 'No. 50, Montieth Road, Egmore',
      city: 'Chennai',
      lat: 13.0647,
      lng: 80.2588,
      contactPhone: '+91 44 2855 4548',
      email: 'redcross.chennai@example.org',
      operatingHours: '24/7 Voluntary Blood Center',
      verificationStatus: 'verified',
      lastStockUpdate: new Date(now - 1000 * 60 * 60 * 96).toISOString(), // 96h ago = STALE (>3 days)
      availableComponents: ['Packed Red Blood Cells (PRBC)', 'Whole Blood', 'Platelet Concentrate (RDP)'],
      freshness: 'stale',
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 60).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 96).toISOString()
    }
  ];
}

function generateSeedInventory(): BloodInventoryItem[] {
  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;

  return [
    // Apollo Hospital Blood Bank Stock
    {
      id: 'inv_ap_01',
      bloodBankId: 'bb_apollo_01',
      bloodBankName: 'Apollo Central Blood Bank',
      bloodGroup: 'O+',
      bloodComponent: 'Packed Red Blood Cells (PRBC)',
      availableUnits: 14,
      reservedUnits: 2,
      expiryDate: new Date(now + day * 28).toISOString(),
      batchNumber: 'PRBC-2026-0941',
      status: 'available',
      lastUpdated: new Date(now - 1000 * 60 * 90).toISOString(),
      verifiedByStaff: 'Dr. Ramesh K. (Duty Transfusionist)'
    },
    {
      id: 'inv_ap_02',
      bloodBankId: 'bb_apollo_01',
      bloodBankName: 'Apollo Central Blood Bank',
      bloodGroup: 'O-',
      bloodComponent: 'Packed Red Blood Cells (PRBC)', // Rare Universal Donor!
      availableUnits: 2,
      reservedUnits: 1,
      expiryDate: new Date(now + day * 19).toISOString(),
      batchNumber: 'PRBC-2026-0922',
      status: 'critical', // Critical stock
      lastUpdated: new Date(now - 1000 * 60 * 90).toISOString(),
      verifiedByStaff: 'Dr. Ramesh K. (Duty Transfusionist)'
    },
    {
      id: 'inv_ap_03',
      bloodBankId: 'bb_apollo_01',
      bloodBankName: 'Apollo Central Blood Bank',
      bloodGroup: 'A+',
      bloodComponent: 'Packed Red Blood Cells (PRBC)',
      availableUnits: 9,
      reservedUnits: 0,
      expiryDate: new Date(now + day * 22).toISOString(),
      batchNumber: 'PRBC-2026-0955',
      status: 'available',
      lastUpdated: new Date(now - 1000 * 60 * 90).toISOString(),
      verifiedByStaff: 'Dr. Ramesh K. (Duty Transfusionist)'
    },
    {
      id: 'inv_ap_04',
      bloodBankId: 'bb_apollo_01',
      bloodBankName: 'Apollo Central Blood Bank',
      bloodGroup: 'B+',
      bloodComponent: 'Platelet Concentrate (RDP)',
      availableUnits: 5,
      reservedUnits: 1,
      expiryDate: new Date(now + day * 4).toISOString(), // Platelets expire in 5 days!
      batchNumber: 'RDP-2026-1102',
      status: 'available',
      lastUpdated: new Date(now - 1000 * 60 * 90).toISOString(),
      verifiedByStaff: 'Dr. Ramesh K. (Duty Transfusionist)'
    },
    {
      id: 'inv_ap_05',
      bloodBankId: 'bb_apollo_01',
      bloodBankName: 'Apollo Central Blood Bank',
      bloodGroup: 'AB+',
      bloodComponent: 'Fresh Frozen Plasma (FFP)',
      availableUnits: 18,
      reservedUnits: 0,
      expiryDate: new Date(now + day * 180).toISOString(), // FFP lasts 1 year
      batchNumber: 'FFP-2026-0418',
      status: 'available',
      lastUpdated: new Date(now - 1000 * 60 * 90).toISOString(),
      verifiedByStaff: 'Dr. Ramesh K. (Duty Transfusionist)'
    },
    {
      id: 'inv_ap_06',
      bloodBankId: 'bb_apollo_01',
      bloodBankName: 'Apollo Central Blood Bank',
      bloodGroup: 'B-',
      bloodComponent: 'Packed Red Blood Cells (PRBC)',
      availableUnits: 1,
      reservedUnits: 0,
      expiryDate: new Date(now + day * 12).toISOString(),
      batchNumber: 'PRBC-2026-0811',
      status: 'critical',
      lastUpdated: new Date(now - 1000 * 60 * 90).toISOString(),
      verifiedByStaff: 'Dr. Ramesh K. (Duty Transfusionist)'
    },

    // RGGGH Blood Bank Stock
    {
      id: 'inv_rg_01',
      bloodBankId: 'bb_rgggh_02',
      bloodBankName: 'RGGGH Model Blood Bank',
      bloodGroup: 'O+',
      bloodComponent: 'Whole Blood',
      availableUnits: 25,
      reservedUnits: 4,
      expiryDate: new Date(now + day * 25).toISOString(),
      batchNumber: 'WB-2026-5511',
      status: 'available',
      lastUpdated: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
      verifiedByStaff: 'Staff Nurse Lakshmi'
    },
    {
      id: 'inv_rg_02',
      bloodBankId: 'bb_rgggh_02',
      bloodBankName: 'RGGGH Model Blood Bank',
      bloodGroup: 'A+',
      bloodComponent: 'Packed Red Blood Cells (PRBC)',
      availableUnits: 16,
      reservedUnits: 3,
      expiryDate: new Date(now + day * 30).toISOString(),
      batchNumber: 'PRBC-2026-5582',
      status: 'available',
      lastUpdated: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
      verifiedByStaff: 'Staff Nurse Lakshmi'
    }
  ];
}

function generateSeedHandovers(): PatientHandoverRecord[] {
  return [
    {
      id: 'handover_demo_01',
      handoverCode: 'HO-98214',
      patientName: 'Ravi Chandran',
      patientAge: 38,
      patientGender: 'Male',
      bloodGroup: 'O+',
      allergies: ['Penicillin', 'Sulfa Drugs'],
      criticalConditions: ['Type-2 Diabetes', 'Hypertension'],
      currentMedications: ['Metformin 500mg', 'Amlodipine 5mg'],
      emergencyNotes: 'High-velocity road traffic incident at Anna Salai junction. Patient sustained blunt chest trauma and suspected right femur fracture.',
      sosTimestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      incidentLocation: {
        lat: 13.0601,
        lng: 80.2520,
        address: 'Anna Salai Near Thousand Lights Signal'
      },
      vitalSigns: {
        pulseBpm: 104,
        bloodPressure: '100/68',
        spO2Percent: 95,
        respRate: 22,
        gcsScore: 14 // Eyes: 4, Verbal: 4, Motor: 6
      },
      transportingAmbulance: 'Ambulance 108-Zone-4',
      paramedicNotes: 'IV access established with 18G cannula. 500ml Normal Saline infusing. Cervical collar applied.',
      receivingHospitalId: 'hosp_apollo_01',
      receivingHospitalName: 'Apollo Speciality Hospital',
      status: 'en_route',
      generatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString()
    },
    {
      id: 'handover_demo_02',
      handoverCode: 'HO-41092',
      patientName: 'Meenakshi Sundaram',
      patientAge: 62,
      patientGender: 'Female',
      bloodGroup: 'B+',
      allergies: ['Aspirin', 'Iodine Contrast'],
      criticalConditions: ['Coronary Artery Disease', 'Asthma'],
      currentMedications: ['Clopidogrel 75mg', 'Salbutamol Inhaler'],
      emergencyNotes: 'Sudden onset retrosternal chest pain radiating to left jaw accompanied by diaphoresis and shortness of breath.',
      sosTimestamp: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
      vitalSigns: {
        pulseBpm: 92,
        bloodPressure: '145/95',
        spO2Percent: 93,
        respRate: 24,
        gcsScore: 15
      },
      transportingAmbulance: 'Ambulance 108-Heart-Care',
      paramedicNotes: 'Oxygen administered via nasal cannula at 4 L/min. Sublingual sorbitrate given at 19:15.',
      receivingHospitalId: 'hosp_apollo_01',
      receivingHospitalName: 'Apollo Speciality Hospital',
      status: 'received',
      generatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      receivedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    }
  ];
}
