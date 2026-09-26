import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, MedicalProfileRecord, MedicationRecord, EmergencyContactRecord } from '../db';
import { authenticate } from './auth';

export const medicalRouter = Router();

// GET Medical Profile
medicalRouter.get('/profile', authenticate, (req: any, res: Response) => {
  const profiles = db.get('medicalProfiles');
  const profile = profiles.find(p => p.userId === req.userId);
  return res.json({ profile: profile || null });
});

// SAVE/UPDATE Medical Profile
medicalRouter.post('/profile', authenticate, (req: any, res: Response) => {
  const profiles = db.get('medicalProfiles');
  const index = profiles.findIndex(p => p.userId === req.userId);

  const updatedProfile: MedicalProfileRecord = {
    userId: req.userId,
    bloodGroup: req.body.bloodGroup || 'O+',
    rhFactor: req.body.rhFactor,
    conditions: req.body.conditions || {},
    allergies: req.body.allergies || [],
    emergencyInstructions: req.body.emergencyInstructions || '',
    visibility: req.body.visibility || {},
    organDonor: req.body.organDonor || false
  };

  if (index !== -1) {
    profiles[index] = { ...profiles[index], ...updatedProfile };
  } else {
    profiles.push(updatedProfile);
  }

  db.set('medicalProfiles', profiles);
  return res.json({ profile: updatedProfile });
});

// GET Medications
medicalRouter.get('/medications', authenticate, (req: any, res: Response) => {
  const meds = db.get('medications').filter(m => m.userId === req.userId);
  return res.json({ medications: meds });
});

// ADD Medication
medicalRouter.post('/medications', authenticate, (req: any, res: Response) => {
  const meds = db.get('medications');
  const newMed: MedicationRecord = {
    id: uuidv4(),
    userId: req.userId,
    name: req.body.name,
    dosage: req.body.dosage || '',
    frequency: req.body.frequency || '',
    instructions: req.body.instructions || '',
    emergencyNote: req.body.emergencyNote || '',
    emergencyVisible: req.body.emergencyVisible ?? true
  };

  meds.push(newMed);
  db.set('medications', meds);
  return res.status(201).json({ medication: newMed });
});

// DELETE Medication
medicalRouter.delete('/medications/:id', authenticate, (req: any, res: Response) => {
  let meds = db.get('medications');
  meds = meds.filter(m => m.id !== req.params.id || m.userId !== req.userId);
  db.set('medications', meds);
  return res.json({ success: true });
});

// GET Emergency Contacts
medicalRouter.get('/contacts', authenticate, (req: any, res: Response) => {
  const contacts = db.get('emergencyContacts').filter(c => c.userId === req.userId);
  return res.json({ contacts });
});

// ADD Emergency Contact
medicalRouter.post('/contacts', authenticate, (req: any, res: Response) => {
  const contacts = db.get('emergencyContacts');
  const newContact: EmergencyContactRecord = {
    id: uuidv4(),
    userId: req.userId,
    name: req.body.name,
    relationship: req.body.relationship || '',
    phone: req.body.phone,
    isPrimary: req.body.isPrimary || false,
    emergencyVisible: req.body.emergencyVisible ?? true
  };

  contacts.push(newContact);
  db.set('emergencyContacts', contacts);
  return res.status(201).json({ contact: newContact });
});

// DELETE Emergency Contact
medicalRouter.delete('/contacts/:id', authenticate, (req: any, res: Response) => {
  let contacts = db.get('emergencyContacts');
  contacts = contacts.filter(c => c.id !== req.params.id || c.userId !== req.userId);
  db.set('emergencyContacts', contacts);
  return res.json({ success: true });
});
