import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, HospitalRecord } from '../db';
import { authenticate } from './auth';

export const hospitalsRouter = Router();

// List verified hospitals
hospitalsRouter.get('/', (req: Request, res: Response) => {
  const hospitals = db.get('hospitals').filter(h => h.verificationStatus === 'verified');
  return res.json({ hospitals });
});

// Register hospital
hospitalsRouter.post('/register', (req: Request, res: Response) => {
  const {
    name,
    licenseNumber,
    address,
    city,
    phone,
    email,
    authorizedStaff,
    lat,
    lng
  } = req.body;

  if (!name || !licenseNumber || !phone || !email) {
    return res.status(400).json({ error: 'Hospital name, license, phone and email are required.' });
  }

  const newHospital: HospitalRecord = {
    id: uuidv4(),
    name,
    licenseNumber,
    address: address || '',
    city: city || '',
    phone,
    email,
    authorizedStaff: authorizedStaff || 'Administrator',
    verificationStatus: 'pending',
    lat: lat ? parseFloat(lat) : 13.0827,
    lng: lng ? parseFloat(lng) : 80.2707,
    createdAt: new Date().toISOString()
  };

  const hospitals = db.get('hospitals');
  hospitals.push(newHospital);
  db.set('hospitals', hospitals);

  return res.status(201).json({
    hospital: newHospital,
    message: 'Hospital registered successfully. Awaiting administrator verification.'
  });
});
