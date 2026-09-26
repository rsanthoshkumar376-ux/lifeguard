import { apiRequest } from '../config/api';

export interface Medication {
  id?: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  emergencyNote: string;
  emergencyVisible: boolean;
}

export interface EmergencyContact {
  id?: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
  emergencyVisible: boolean;
}

export interface MedicalProfile {
  name?: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  rhFactor?: string;
  conditions?: Record<string, any>;
  allergies?: string[];
  emergencyInstructions?: string;
  visibility?: Record<string, boolean>;
  organDonor?: boolean;
}

export const getMedicalProfile = async (userId?: string): Promise<MedicalProfile | null> => {
  try {
    const res = await apiRequest<{ profile: MedicalProfile | null }>('/medical/profile');
    return res.profile;
  } catch (e) {
    console.error('Failed to get medical profile', e);
    return null;
  }
};

export const saveMedicalProfile = async (userId: string, profile: Partial<MedicalProfile>) => {
  return await apiRequest('/medical/profile', {
    method: 'POST',
    body: JSON.stringify(profile)
  });
};

export const getMedications = async (userId?: string): Promise<Medication[]> => {
  try {
    const res = await apiRequest<{ medications: Medication[] }>('/medical/medications');
    return res.medications;
  } catch (e) {
    return [];
  }
};

export const addMedication = async (userId: string, med: Omit<Medication, 'id'>) => {
  return await apiRequest('/medical/medications', {
    method: 'POST',
    body: JSON.stringify(med)
  });
};

export const deleteMedication = async (userId: string, medId: string) => {
  return await apiRequest(`/medical/medications/${medId}`, {
    method: 'DELETE'
  });
};

export const getEmergencyContacts = async (userId?: string): Promise<EmergencyContact[]> => {
  try {
    const res = await apiRequest<{ contacts: EmergencyContact[] }>('/medical/contacts');
    return res.contacts;
  } catch (e) {
    return [];
  }
};

export const addEmergencyContact = async (userId: string, contact: Omit<EmergencyContact, 'id'>) => {
  return await apiRequest('/medical/contacts', {
    method: 'POST',
    body: JSON.stringify(contact)
  });
};

export const deleteEmergencyContact = async (userId: string, contactId: string) => {
  return await apiRequest(`/medical/contacts/${contactId}`, {
    method: 'DELETE'
  });
};

export const updateEmergencyVisibility = async (userId: string, visibility: Record<string, boolean>) => {
  return await apiRequest('/medical/profile', {
    method: 'POST',
    body: JSON.stringify({ visibility })
  });
};
