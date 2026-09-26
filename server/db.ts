import fs from 'fs';
import path from 'path';

export interface UserRecord {
  id: string;
  phone: string;
  email?: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup: string;
  city?: string;
  profilePhotoUrl?: string;
  role: 'user' | 'hospital_staff' | 'admin';
  donationWillingness?: 'yes' | 'no' | 'temporarily_unavailable';
  createdAt: string;
  updatedAt: string;
}

export interface MedicalProfileRecord {
  userId: string;
  bloodGroup: string;
  rhFactor?: string;
  conditions: Record<string, any>;
  allergies: string[];
  emergencyInstructions?: string;
  visibility: Record<string, boolean>;
  organDonor?: boolean;
}

export interface MedicationRecord {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  emergencyNote: string;
  emergencyVisible: boolean;
}

export interface EmergencyContactRecord {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
  emergencyVisible: boolean;
}

export interface EmergencyTokenRecord {
  id: string;
  userId: string;
  token: string;
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface EmergencyAccessLogRecord {
  id: string;
  userId: string;
  tokenId: string;
  accessedAt: string;
  accessType: 'qr' | 'sos' | 'direct';
  approximateLocation?: string;
}

export interface BloodRequestRecord {
  id: string;
  hospitalId: string;
  hospitalName: string;
  hospitalPhone?: string;
  bloodGroup: string;
  unitsRequired: number;
  urgency: 'Normal' | 'Urgent' | 'Critical';
  patientReference?: string;
  department?: string;
  message?: string;
  lat: number;
  lng: number;
  status: 'active' | 'fulfilled' | 'cancelled' | 'expired';
  createdAt: string;
  requiredBy?: string;
}

export interface DonorRecord {
  userId: string;
  fullName: string;
  bloodGroup: string;
  lat?: number;
  lng?: number;
  isAvailable: boolean;
  notificationsEnabled: boolean;
  lastDonationDate?: string;
  notificationRadius?: number;
}

export interface DonorResponseRecord {
  id: string;
  requestId: string;
  donorId: string;
  donorName: string;
  bloodGroup: string;
  distance: number;
  status: 'notified' | 'viewed' | 'interested' | 'contacted' | 'confirmed' | 'donated' | 'cancelled';
  respondedAt: string;
}

export interface HospitalRecord {
  id: string;
  name: string;
  licenseNumber: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  authorizedStaff: string;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'suspended';
  lat?: number;
  lng?: number;
  createdAt: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  medicalProfiles: MedicalProfileRecord[];
  medications: MedicationRecord[];
  emergencyContacts: EmergencyContactRecord[];
  emergencyTokens: EmergencyTokenRecord[];
  emergencyAccessLogs: EmergencyAccessLogRecord[];
  bloodRequests: BloodRequestRecord[];
  donors: DonorRecord[];
  donorResponses: DonorResponseRecord[];
  hospitals: HospitalRecord[];
  sosAlerts: any[];
}

const DB_FILE = path.join(process.cwd(), 'data', 'database.json');

const initialData: DatabaseSchema = {
  users: [
    {
      id: 'admin-1',
      fullName: 'System Administrator',
      phone: '+919999999999',
      email: 'admin@lifeguard.org',
      bloodGroup: 'O+',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  medicalProfiles: [],
  medications: [],
  emergencyContacts: [],
  emergencyTokens: [],
  emergencyAccessLogs: [],
  bloodRequests: [
    {
      id: 'req-sample-1',
      hospitalId: 'hosp-1',
      hospitalName: 'Apollo Emergency Center',
      hospitalPhone: '+919876543210',
      bloodGroup: 'O+',
      unitsRequired: 2,
      urgency: 'Critical',
      patientReference: 'PAT-4902',
      department: 'Trauma ICU',
      message: 'Urgent surgery required for accident victim.',
      lat: 13.0827,
      lng: 80.2707,
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'req-sample-2',
      hospitalId: 'hosp-2',
      hospitalName: 'City General Hospital',
      hospitalPhone: '+919876543211',
      bloodGroup: 'B+',
      unitsRequired: 1,
      urgency: 'Urgent',
      patientReference: 'PAT-8812',
      department: 'Cardiology',
      message: 'Platelet transfusion scheduled.',
      lat: 13.0450,
      lng: 80.2400,
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ],
  donors: [],
  donorResponses: [],
  hospitals: [
    {
      id: 'hosp-1',
      name: 'Apollo Emergency Center',
      licenseNumber: 'HOSP-TN-2024-001',
      address: 'Greams Road, Thousand Lights',
      city: 'Chennai',
      phone: '+919876543210',
      email: 'emergency@apollo.org',
      authorizedStaff: 'Dr. Ramesh Kumar',
      verificationStatus: 'verified',
      lat: 13.0827,
      lng: 80.2707,
      createdAt: new Date().toISOString()
    },
    {
      id: 'hosp-2',
      name: 'City General Hospital',
      licenseNumber: 'HOSP-TN-2024-002',
      address: 'Anna Salai',
      city: 'Chennai',
      phone: '+919876543211',
      email: 'bloodbank@citygen.org',
      authorizedStaff: 'Dr. Priya Sharma',
      verificationStatus: 'verified',
      lat: 13.0450,
      lng: 80.2400,
      createdAt: new Date().toISOString()
    }
  ],
  sosAlerts: []
};

import { supabase, isSupabaseConfigured } from './supabase';

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.load();
    if (isSupabaseConfigured()) {
      console.log('⚡ Supabase PostgreSQL connection active');
      this.syncFromSupabase();
    }
  }

  private ensureDirectory() {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(content);
      }
    } catch (e) {
      console.error('Error reading database file, resetting to initial data:', e);
    }
    this.save(initialData);
    return initialData;
  }

  private async syncFromSupabase() {
    if (!supabase) return;
    try {
      const { data: users } = await supabase.from('users').select('*');
      if (users && users.length > 0) {
        this.data.users = users.map(u => ({
          id: u.id,
          phone: u.phone,
          email: u.email,
          fullName: u.full_name,
          dateOfBirth: u.date_of_birth,
          gender: u.gender,
          bloodGroup: u.blood_group,
          city: u.city,
          profilePhotoUrl: u.profile_photo_url,
          role: u.role,
          donationWillingness: u.donation_willingness,
          createdAt: u.created_at,
          updatedAt: u.updated_at
        }));
      }

      const { data: requests } = await supabase.from('blood_requests').select('*');
      if (requests && requests.length > 0) {
        this.data.bloodRequests = requests.map(r => ({
          id: r.id,
          hospitalId: r.hospital_id,
          hospitalName: r.hospital_name,
          hospitalPhone: r.hospital_phone,
          bloodGroup: r.blood_group,
          unitsRequired: r.units_required,
          urgency: r.urgency,
          patientReference: r.patient_reference,
          department: r.department,
          message: r.message,
          lat: r.lat,
          lng: r.lng,
          status: r.status,
          createdAt: r.created_at,
          requiredBy: r.required_by
        }));
      }

      const { data: hospitals } = await supabase.from('hospitals').select('*');
      if (hospitals && hospitals.length > 0) {
        this.data.hospitals = hospitals.map(h => ({
          id: h.id,
          name: h.name,
          licenseNumber: h.license_number,
          address: h.address,
          city: h.city,
          phone: h.phone,
          email: h.email,
          authorizedStaff: h.authorized_staff,
          verificationStatus: h.verification_status,
          lat: h.lat,
          lng: h.lng,
          createdAt: h.created_at
        }));
      }
      this.save();
      console.log('✓ Synced latest records from Supabase PostgreSQL');
    } catch (e) {
      console.warn('Supabase sync skipped (tables might be initializing):', e);
    }
  }

  public save(newData?: DatabaseSchema) {
    if (newData) {
      this.data = newData;
    }
    try {
      this.ensureDirectory();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database:', e);
    }
  }

  public get<K extends keyof DatabaseSchema>(table: K): DatabaseSchema[K] {
    return this.data[table];
  }

  public set<K extends keyof DatabaseSchema>(table: K, records: DatabaseSchema[K]) {
    this.data[table] = records;
    this.save();
  }
}

export const db = new Database();
