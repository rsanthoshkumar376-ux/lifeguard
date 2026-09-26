import { Router, Response } from 'express';
import { db } from '../db';
import { authenticate } from './auth';

export const adminRouter = Router();

// Middleware ensuring user has admin role
const requireAdmin = (req: any, res: Response, next: any) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Administrative privileges required.' });
  }
  next();
};

// 1. Dashboard Metrics
adminRouter.get('/stats', authenticate, requireAdmin, (req: any, res: Response) => {
  const users = db.get('users');
  const donors = db.get('donors');
  const hospitals = db.get('hospitals');
  const requests = db.get('bloodRequests');
  const responses = db.get('donorResponses');

  return res.json({
    totalUsers: users.length,
    activeDonors: donors.filter(d => d.isAvailable).length,
    verifiedHospitals: hospitals.filter(h => h.verificationStatus === 'verified').length,
    pendingHospitals: hospitals.filter(h => h.verificationStatus === 'pending').length,
    activeRequests: requests.filter(r => r.status === 'active').length,
    totalResponses: responses.length,
    completedDonations: responses.filter(r => r.status === 'donated').length
  });
});

// 2. Hospital Verification
adminRouter.get('/hospitals', authenticate, requireAdmin, (req: any, res: Response) => {
  const hospitals = db.get('hospitals');
  return res.json({ hospitals });
});

adminRouter.post('/hospitals/:id/verify', authenticate, requireAdmin, (req: any, res: Response) => {
  const { status } = req.body;
  const hospitals = db.get('hospitals');
  const hospital = hospitals.find(h => h.id === req.params.id);

  if (!hospital) {
    return res.status(404).json({ error: 'Hospital not found.' });
  }

  hospital.verificationStatus = status || 'verified';
  db.set('hospitals', hospitals);
  return res.json({ success: true, hospital });
});

// 3. User Management
adminRouter.get('/users', authenticate, requireAdmin, (req: any, res: Response) => {
  const users = db.get('users').map(u => ({
    id: u.id,
    fullName: u.fullName,
    phone: u.phone,
    email: u.email,
    bloodGroup: u.bloodGroup,
    role: u.role,
    createdAt: u.createdAt
  }));
  return res.json({ users });
});

// 4. Request Monitoring
adminRouter.get('/requests', authenticate, requireAdmin, (req: any, res: Response) => {
  const requests = db.get('bloodRequests');
  return res.json({ requests });
});

adminRouter.post('/requests/:id/cancel', authenticate, requireAdmin, (req: any, res: Response) => {
  const requests = db.get('bloodRequests');
  const request = requests.find(r => r.id === req.params.id);

  if (!request) {
    return res.status(404).json({ error: 'Request not found.' });
  }

  request.status = 'cancelled';
  db.set('bloodRequests', requests);
  return res.json({ success: true, request });
});
