import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, BloodRequestRecord, DonorResponseRecord } from '../db';
import { authenticate } from './auth';

export const bloodRouter = Router();

// Haversine distance formula (in km)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// 1. Get Blood Requests (with distance filtering)
bloodRouter.get('/requests', (req: any, res: Response) => {
  const { lat, lng, radiusKm, bloodGroup } = req.query;
  let requests = db.get('bloodRequests').filter(r => r.status === 'active');

  if (bloodGroup) {
    requests = requests.filter(r => r.bloodGroup === bloodGroup);
  }

  const userLat = lat ? parseFloat(lat as string) : null;
  const userLng = lng ? parseFloat(lng as string) : null;
  const maxRadius = radiusKm ? parseFloat(radiusKm as string) : 50;

  const results = requests.map(r => {
    let distance = null;
    if (userLat && userLng && r.lat && r.lng) {
      distance = calculateDistance(userLat, userLng, r.lat, r.lng);
    }
    return {
      ...r,
      distance: distance !== null ? `${distance} km` : 'Near you',
      distanceKm: distance
    };
  });

  if (userLat && userLng) {
    const filtered = results.filter(r => r.distanceKm === null || r.distanceKm <= maxRadius);
    filtered.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    return res.json({ requests: filtered });
  }

  return res.json({ requests: results });
});

// 2. Get Single Blood Request
bloodRouter.get('/requests/:id', (req: any, res: Response) => {
  const request = db.get('bloodRequests').find(r => r.id === req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  const responses = db.get('donorResponses').filter(d => d.requestId === req.params.id);
  return res.json({ request, responses });
});

// 3. Create Blood Request (Hospital Staff / Admin)
bloodRouter.post('/requests', authenticate, (req: any, res: Response) => {
  const {
    hospitalId,
    hospitalName,
    hospitalPhone,
    bloodGroup,
    unitsRequired,
    urgency,
    patientReference,
    department,
    message,
    lat = 13.0827,
    lng = 80.2707,
    requiredBy
  } = req.body;

  if (!bloodGroup || !unitsRequired) {
    return res.status(400).json({ error: 'Blood Group and Units Required are mandatory.' });
  }

  const newRequest: BloodRequestRecord = {
    id: uuidv4(),
    hospitalId: hospitalId || req.userId,
    hospitalName: hospitalName || 'Emergency Medical Center',
    hospitalPhone: hospitalPhone || '',
    bloodGroup,
    unitsRequired: parseInt(unitsRequired, 10),
    urgency: urgency || 'Normal',
    patientReference: patientReference || 'Confidential',
    department: department || 'General Medicine',
    message: message || '',
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    status: 'active',
    createdAt: new Date().toISOString(),
    requiredBy
  };

  const requests = db.get('bloodRequests');
  requests.unshift(newRequest);
  db.set('bloodRequests', requests);

  // Automatically find eligible registered donors within 5km
  const donors = db.get('donors').filter(d => d.isAvailable && d.bloodGroup === bloodGroup);
  const responses = db.get('donorResponses');

  for (const donor of donors) {
    const dist = donor.lat && donor.lng ? calculateDistance(newRequest.lat, newRequest.lng, donor.lat, donor.lng) : 3.2;
    responses.push({
      id: uuidv4(),
      requestId: newRequest.id,
      donorId: donor.userId,
      donorName: donor.fullName,
      bloodGroup: donor.bloodGroup,
      distance: dist,
      status: 'notified',
      respondedAt: new Date().toISOString()
    });
  }
  db.set('donorResponses', responses);

  return res.status(201).json({
    request: newRequest,
    matchedDonorsCount: donors.length
  });
});

// 4. Donor Responds to Blood Request
bloodRouter.post('/requests/:id/respond', authenticate, (req: any, res: Response) => {
  const { status, notes } = req.body;
  const requestId = req.params.id;
  const user = db.get('users').find(u => u.id === req.userId);

  const responses = db.get('donorResponses');
  let response = responses.find(r => r.requestId === requestId && r.donorId === req.userId);

  if (response) {
    response.status = status || 'interested';
    response.respondedAt = new Date().toISOString();
  } else {
    response = {
      id: uuidv4(),
      requestId,
      donorId: req.userId,
      donorName: user?.fullName || 'Anonymous Donor',
      bloodGroup: user?.bloodGroup || 'O+',
      distance: 2.5,
      status: status || 'interested',
      respondedAt: new Date().toISOString()
    };
    responses.push(response);
  }

  db.set('donorResponses', responses);
  return res.json({ success: true, response });
});

// 5. Donor Profile (Get & Update)
bloodRouter.get('/donor-profile', authenticate, (req: any, res: Response) => {
  const donor = db.get('donors').find(d => d.userId === req.userId);
  return res.json({ donor: donor || null });
});

bloodRouter.post('/donor-profile', authenticate, (req: any, res: Response) => {
  const donors = db.get('donors');
  const index = donors.findIndex(d => d.userId === req.userId);
  const user = db.get('users').find(u => u.id === req.userId);

  const donorData = {
    userId: req.userId,
    fullName: user?.fullName || 'Donor',
    bloodGroup: user?.bloodGroup || 'O+',
    isAvailable: req.body.isAvailable ?? true,
    notificationsEnabled: req.body.notificationsEnabled ?? true,
    notificationRadius: req.body.notificationRadius || 5,
    lastDonationDate: req.body.lastDonationDate || null,
    lat: req.body.lat,
    lng: req.body.lng
  };

  if (index !== -1) {
    donors[index] = { ...donors[index], ...donorData };
  } else {
    donors.push(donorData);
  }

  db.set('donors', donors);
  return res.json({ donor: donorData });
});
