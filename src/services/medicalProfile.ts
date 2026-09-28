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
  pandemicNote?: string; // Critical note to strangers & pandemic precautions
  visibility?: Record<string, boolean>;
  organDonor?: boolean;
}

const PROFILE_KEY = 'lifeguard_medical_profile';
const MEDS_KEY = 'lifeguard_medications';
const CONTACTS_KEY = 'lifeguard_emergency_contacts';

export const getMedicalProfile = async (userId?: string): Promise<MedicalProfile | null> => {
  try {
    const res = await apiRequest<{ profile: MedicalProfile | null }>('/medical/profile');
    if (res?.profile) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(res.profile));
      return res.profile;
    }
  } catch (e) {
    console.warn('API /medical/profile unavailable, loading from local cache:', e);
  }

  try {
    const cached = localStorage.getItem(PROFILE_KEY) || localStorage.getItem('guest_medical_profile');
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

export const saveMedicalProfile = async (userId: string, profile: Partial<MedicalProfile>) => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem('guest_medical_profile', JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save to local cache:', e);
  }

  try {
    return await apiRequest('/medical/profile', {
      method: 'POST',
      body: JSON.stringify(profile)
    });
  } catch (err) {
    console.warn('API /medical/profile sync skipped (saved locally):', err);
    return { success: true, localOnly: true, profile };
  }
};

export const getMedications = async (userId?: string): Promise<Medication[]> => {
  try {
    const res = await apiRequest<{ medications: Medication[] }>('/medical/medications');
    if (res?.medications) {
      localStorage.setItem(MEDS_KEY, JSON.stringify(res.medications));
      return res.medications;
    }
  } catch (e) {
    // fallback
  }
  try {
    const cached = localStorage.getItem(MEDS_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
};

export const addMedication = async (userId: string, med: Omit<Medication, 'id'>) => {
  const newMed: Medication = { ...med, id: 'med_' + Date.now() };
  try {
    const current = await getMedications(userId);
    localStorage.setItem(MEDS_KEY, JSON.stringify([...current, newMed]));
  } catch {}

  try {
    return await apiRequest('/medical/medications', {
      method: 'POST',
      body: JSON.stringify(med)
    });
  } catch (err) {
    return { success: true, medication: newMed };
  }
};

export const deleteMedication = async (userId: string, medId: string) => {
  try {
    const current = await getMedications(userId);
    localStorage.setItem(MEDS_KEY, JSON.stringify(current.filter(m => m.id !== medId)));
  } catch {}

  try {
    return await apiRequest(`/medical/medications/${medId}`, {
      method: 'DELETE'
    });
  } catch (err) {
    return { success: true };
  }
};

export const getEmergencyContacts = async (userId?: string): Promise<EmergencyContact[]> => {
  try {
    const res = await apiRequest<{ contacts: EmergencyContact[] }>('/medical/contacts');
    if (res?.contacts) {
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(res.contacts));
      return res.contacts;
    }
  } catch (e) {
    // fallback
  }
  try {
    const cached = localStorage.getItem(CONTACTS_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
};

export const addEmergencyContact = async (userId: string, contact: Omit<EmergencyContact, 'id'>) => {
  const newContact: EmergencyContact = { ...contact, id: 'cnt_' + Date.now() };
  try {
    const current = await getEmergencyContacts(userId);
    localStorage.setItem(CONTACTS_KEY, JSON.stringify([...current, newContact]));
  } catch {}

  try {
    return await apiRequest('/medical/contacts', {
      method: 'POST',
      body: JSON.stringify(contact)
    });
  } catch (err) {
    return { success: true, contact: newContact };
  }
};

export const deleteEmergencyContact = async (userId: string, contactId: string) => {
  try {
    const current = await getEmergencyContacts(userId);
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(current.filter(c => c.id !== contactId)));
  } catch {}

  try {
    return await apiRequest(`/medical/contacts/${contactId}`, {
      method: 'DELETE'
    });
  } catch (err) {
    return { success: true };
  }
};

export const updateEmergencyVisibility = async (userId: string, visibility: Record<string, boolean>) => {
  try {
    const current = await getMedicalProfile(userId);
    if (current) {
      current.visibility = visibility;
      localStorage.setItem(PROFILE_KEY, JSON.stringify(current));
    }
  } catch {}

  try {
    return await apiRequest('/medical/profile', {
      method: 'POST',
      body: JSON.stringify({ visibility })
    });
  } catch (err) {
    return { success: true };
  }
};
