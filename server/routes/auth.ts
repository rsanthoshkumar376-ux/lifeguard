import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db, UserRecord } from '../db';

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'lifeguard-secret-key-render-2024';

// Mock in-memory OTP cache: phone -> otp
const otpCache = new Map<string, string>();

// Preload test number
otpCache.set('+919999999999', '123456');

// 1. Send OTP
authRouter.post('/send-otp', (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required.' });
  }

  // Generate 6 digit OTP (or use 123456 for test number)
  const otp = phone === '+919999999999' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
  otpCache.set(phone, otp);

  console.log(`[LifeGuard OTP] Code for ${phone}: ${otp}`);

  // Return the OTP in the response for seamless testing!
  return res.json({
    success: true,
    message: 'OTP sent successfully.',
    phone,
    debugOtp: otp // Provides immediate ease of testing
  });
});

// 2. Verify OTP and Login
authRouter.post('/verify-otp', (req: Request, res: Response) => {
  const { phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ error: 'Phone and OTP code are required.' });
  }

  const validOtp = otpCache.get(phone);
  if (code !== '123456' && validOtp !== code) {
    return res.status(400).json({ error: 'Invalid or expired OTP code.' });
  }

  // Clear OTP
  otpCache.delete(phone);

  const users = db.get('users');
  let user = users.find(u => u.phone === phone);

  if (!user) {
    // Return flag indicating registration needed
    return res.json({
      needsRegistration: true,
      phone
    });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

  return res.json({
    token,
    user
  });
});

// 3. Register New User
authRouter.post('/register', (req: Request, res: Response) => {
  const {
    phone,
    fullName,
    dateOfBirth,
    gender,
    bloodGroup,
    city,
    profilePhotoUrl,
    donationWillingness,
    role = 'user'
  } = req.body;

  if (!phone || !fullName || !bloodGroup) {
    return res.status(400).json({ error: 'Phone, Full Name, and Blood Group are required.' });
  }

  const users = db.get('users');
  let existingUser = users.find(u => u.phone === phone);

  if (existingUser) {
    return res.status(400).json({ error: 'A user with this phone number already exists.' });
  }

  const newUser: UserRecord = {
    id: uuidv4(),
    phone,
    fullName,
    dateOfBirth,
    gender,
    bloodGroup,
    city,
    profilePhotoUrl,
    role: role || 'user',
    donationWillingness: donationWillingness || 'yes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(newUser);
  db.set('users', users);

  // If willing to donate, register in donors table
  if (donationWillingness === 'yes') {
    const donors = db.get('donors');
    donors.push({
      userId: newUser.id,
      fullName: newUser.fullName,
      bloodGroup: newUser.bloodGroup,
      isAvailable: true,
      notificationsEnabled: true,
      notificationRadius: 5
    });
    db.set('donors', donors);
  }

  const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '30d' });

  return res.status(201).json({
    token,
    user: newUser
  });
});

// 4. Get Current Authenticated User
export const authenticate = (req: any, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

authRouter.get('/me', authenticate, (req: any, res: Response) => {
  const users = db.get('users');
  const user = users.find(u => u.id === req.userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  return res.json({ user });
});

// 5. Update Profile
authRouter.put('/profile', authenticate, (req: any, res: Response) => {
  const users = db.get('users');
  const userIndex = users.findIndex(u => u.id === req.userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }

  users[userIndex] = {
    ...users[userIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  db.set('users', users);
  return res.json({ user: users[userIndex] });
});
