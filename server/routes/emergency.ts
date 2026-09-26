import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, EmergencyTokenRecord, EmergencyAccessLogRecord } from '../db';
import { authenticate } from './auth';

export const emergencyRouter = Router();

// 1. Generate Emergency QR Token
emergencyRouter.post('/token', authenticate, (req: any, res: Response) => {
  const tokens = db.get('emergencyTokens');
  const tokenString = uuidv4().replace(/-/g, '').substring(0, 16);

  const newToken: EmergencyTokenRecord = {
    id: uuidv4(),
    userId: req.userId,
    token: tokenString,
    isActive: true,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  };

  tokens.push(newToken);
  db.set('emergencyTokens', tokens);
  return res.json({ token: tokenString, record: newToken });
});

// 2. Get User Active Tokens
emergencyRouter.get('/tokens', authenticate, (req: any, res: Response) => {
  const tokens = db.get('emergencyTokens').filter(t => t.userId === req.userId);
  return res.json({ tokens });
});

// 3. Toggle or Revoke Token
emergencyRouter.post('/tokens/:id/toggle', authenticate, (req: any, res: Response) => {
  const tokens = db.get('emergencyTokens');
  const token = tokens.find(t => t.id === req.params.id && t.userId === req.userId);
  if (!token) {
    return res.status(404).json({ error: 'Token not found.' });
  }

  token.isActive = req.body.active ?? !token.isActive;
  db.set('emergencyTokens', tokens);
  return res.json({ success: true, token });
});

// 4. PUBLIC VIEW ENDPOINT (Scanned via QR Code - No login required!)
emergencyRouter.get('/view/:token', (req: Request, res: Response) => {
  const { token } = req.params;
  const tokens = db.get('emergencyTokens');
  const tokenRecord = tokens.find(t => t.token === token && t.isActive);

  if (!tokenRecord) {
    return res.status(404).json({
      valid: false,
      error: 'This emergency ID link is invalid, expired, or has been revoked.'
    });
  }

  const userId = tokenRecord.userId;
  const users = db.get('users');
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ valid: false, error: 'User profile not found.' });
  }

  const profile = db.get('medicalProfiles').find(p => p.userId === userId);
  const visibility = profile?.visibility || {};

  // Fetch only emergency visible medications
  const medications = db.get('medications')
    .filter(m => m.userId === userId && m.emergencyVisible);

  // Fetch emergency contacts
  const contacts = db.get('emergencyContacts')
    .filter(c => c.userId === userId && c.emergencyVisible);

  // Log this emergency access!
  const logs = db.get('emergencyAccessLogs');
  logs.push({
    id: uuidv4(),
    userId,
    tokenId: tokenRecord.id,
    accessedAt: new Date().toISOString(),
    accessType: 'qr',
    approximateLocation: (req.query.loc as string) || 'Emergency QR Scanner'
  });
  db.set('emergencyAccessLogs', logs);

  // Filter only what user marked visible
  const emergencyData = {
    name: user.fullName,
    photoURL: user.profilePhotoUrl,
    bloodGroup: user.bloodGroup || profile?.bloodGroup || 'Not Specified',
    allergies: visibility.allergies !== false ? profile?.allergies || [] : [],
    conditions: visibility.conditions !== false ? profile?.conditions || {} : {},
    medications: visibility.medications !== false ? medications : [],
    emergencyContacts: contacts,
    emergencyInstructions: visibility.emergencyInstructions !== false ? profile?.emergencyInstructions : '',
    organDonor: visibility.organDonor ? profile?.organDonor : false
  };

  return res.json({
    valid: true,
    data: emergencyData
  });
});

// 5. Access Logs for User
emergencyRouter.get('/logs', authenticate, (req: any, res: Response) => {
  const logs = db.get('emergencyAccessLogs').filter(l => l.userId === req.userId);
  return res.json({ logs });
});

// 6. SOS Dispatch
emergencyRouter.post('/sos', authenticate, (req: any, res: Response) => {
  const { lat, lng } = req.body;
  const user = db.get('users').find(u => u.id === req.userId);
  const contacts = db.get('emergencyContacts').filter(c => c.userId === req.userId);

  const sosAlert = {
    id: uuidv4(),
    userId: req.userId,
    userName: user?.fullName || 'User',
    bloodGroup: user?.bloodGroup || 'Unknown',
    location: lat && lng ? { lat, lng } : null,
    contactsNotified: contacts.length,
    timestamp: new Date().toISOString()
  };

  const alerts = db.get('sosAlerts');
  alerts.push(sosAlert);
  db.set('sosAlerts', alerts);

  return res.json({
    success: true,
    alert: sosAlert,
    message: `Emergency SOS dispatched to ${contacts.length} emergency contacts.`
  });
});
