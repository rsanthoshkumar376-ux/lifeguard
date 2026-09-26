-- LifeGuard Medical Emergency App
-- Supabase PostgreSQL Database Schema

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  full_name TEXT NOT NULL,
  date_of_birth TEXT,
  gender TEXT,
  blood_group TEXT NOT NULL,
  city TEXT,
  profile_photo_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'hospital_staff', 'admin')),
  donation_willingness TEXT DEFAULT 'yes',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Medical Profiles Table (Strict Privacy & Emergency Visibility)
CREATE TABLE IF NOT EXISTS public.medical_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  blood_group TEXT NOT NULL,
  rh_factor TEXT,
  conditions JSONB DEFAULT '{}'::jsonb,
  allergies JSONB DEFAULT '[]'::jsonb,
  emergency_instructions TEXT,
  visibility JSONB DEFAULT '{}'::jsonb,
  organ_donor BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Medications Table
CREATE TABLE IF NOT EXISTS public.medications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  instructions TEXT,
  emergency_note TEXT,
  emergency_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Emergency Contacts Table
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  emergency_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Emergency QR Tokens Table
CREATE TABLE IF NOT EXISTS public.emergency_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- 6. Emergency Access Logs (Audit Trail)
CREATE TABLE IF NOT EXISTS public.emergency_access_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  token_id TEXT,
  accessed_at TIMESTAMPTZ DEFAULT now(),
  access_type TEXT DEFAULT 'qr',
  approximate_location TEXT
);

-- 7. Blood Requests Table
CREATE TABLE IF NOT EXISTS public.blood_requests (
  id TEXT PRIMARY KEY,
  hospital_id TEXT,
  hospital_name TEXT NOT NULL,
  hospital_phone TEXT,
  blood_group TEXT NOT NULL,
  units_required INT NOT NULL DEFAULT 1,
  urgency TEXT DEFAULT 'Normal' CHECK (urgency IN ('Normal', 'Urgent', 'Critical')),
  patient_reference TEXT,
  department TEXT,
  message TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'cancelled', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  required_by TIMESTAMPTZ
);

-- 8. Donors Table
CREATE TABLE IF NOT EXISTS public.donors (
  user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_available BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  notification_radius INT DEFAULT 5,
  last_donation_date TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Donor Responses Table
CREATE TABLE IF NOT EXISTS public.donor_responses (
  id TEXT PRIMARY KEY,
  request_id TEXT REFERENCES public.blood_requests(id) ON DELETE CASCADE,
  donor_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  donor_name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  distance DOUBLE PRECISION,
  status TEXT DEFAULT 'notified' CHECK (status IN ('notified', 'viewed', 'interested', 'contacted', 'confirmed', 'donated', 'cancelled')),
  responded_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Hospitals Table
CREATE TABLE IF NOT EXISTS public.hospitals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  license_number TEXT NOT NULL,
  address TEXT,
  city TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  authorized_staff TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. SOS Alerts Table
CREATE TABLE IF NOT EXISTS public.sos_alerts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  blood_group TEXT,
  location JSONB,
  contacts_notified INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for lightning-fast matching & lookup
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_donors_matching ON public.donors(is_available, blood_group);
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON public.blood_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emergency_tokens_lookup ON public.emergency_tokens(token, is_active);

-- Initial Verified Hospitals Seed Data
INSERT INTO public.hospitals (id, name, license_number, address, city, phone, email, authorized_staff, verification_status, lat, lng)
VALUES 
  ('hosp-1', 'Apollo Emergency Center', 'HOSP-TN-2024-001', 'Greams Road, Thousand Lights', 'Chennai', '+919876543210', 'emergency@apollo.org', 'Dr. Ramesh Kumar', 'verified', 13.0827, 80.2707),
  ('hosp-2', 'City General Hospital', 'HOSP-TN-2024-002', 'Anna Salai', 'Chennai', '+919876543211', 'bloodbank@citygen.org', 'Dr. Priya Sharma', 'verified', 13.0450, 80.2400)
ON CONFLICT (id) DO NOTHING;
