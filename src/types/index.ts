export type UserRole = 'user' | 'hospital_staff' | 'admin';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type RequestStatus = 'open' | 'in_progress' | 'fulfilled' | 'cancelled';

export type DonorResponseStatus = 'notified' | 'viewed' | 'interested' | 'contacted' | 'confirmed' | 'donated' | 'cancelled';

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface MedicalDocument {
  id: string;
  title: string;
  fileUrl: string;
  uploadDate: Date;
  documentType: string;
}

export interface MedicalProfile {
  bloodGroup: BloodGroup;
  diabetes: boolean;
  bloodPressure: boolean;
  asthma: boolean;
  heartCondition: boolean;
  epilepsy: boolean;
  kidney: boolean;
  other: string;
  allergies: string[];
  medications: Medication[];
  emergencyInstructions?: string;
  pandemicNote?: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface DonorProfile {
  isDonor: boolean;
  bloodGroup: BloodGroup;
  lastDonationDate: Date | null;
  location: GeoPoint | null;
  geohash: string;
  notificationRadius: number;
  availability: boolean;
  healthConditionsOk: boolean;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;
  };
  maxNotificationsPerWeek: number;
  preferredRadiusKm: number;
}

export interface EmergencyVisibility {
  medicalConditions: boolean;
  medications: boolean;
  allergies: boolean;
  bloodGroup: boolean;
  emergencyContacts: boolean;
  [key: string]: boolean;
}

export interface PrivacySettings {
  emergencyVisibility: EmergencyVisibility;
  showProfileToHospitals: boolean;
  showProfileToDonors: boolean;
}

export interface User {
  uid: string;
  email: string;
  phone: string;
  displayName: string;
  fullName?: string;
  photoURL: string | null;
  profilePhotoUrl?: string;
  role: UserRole;
  medicalProfile: MedicalProfile;
  donorProfile: DonorProfile;
  emergencyContacts: EmergencyContact[];
  medicalDocuments: MedicalDocument[];
  notificationPreferences: NotificationPreferences;
  privacySettings: PrivacySettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  location: GeoPoint;
  geohash: string;
  contactPhone: string;
  contactEmail: string;
  verificationStatus: VerificationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  hospitalId: string;
  hospitalName: string;
  location: GeoPoint;
  geohash: string;
  urgency: UrgencyLevel;
  status: RequestStatus;
  requestedBy: string; // User UID
  createdAt: Date;
  requiredBy: Date;
  notes: string;
}

export interface DonorResponse {
  id: string;
  requestId: string;
  donorId: string;
  status: DonorResponseStatus;
  respondedAt: Date;
  notes: string;
}

export interface EmergencyToken {
  token: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface EmergencyAccessLog {
  id: string;
  userId: string;
  accessedBy: string; // Name or ID of whoever accessed
  location: GeoPoint | null;
  timestamp: Date;
  ipAddress: string | null;
}
