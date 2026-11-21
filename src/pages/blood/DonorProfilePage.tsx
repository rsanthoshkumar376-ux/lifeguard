import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  Bell, 
  MapPin, 
  Calendar, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  Compass,
  ArrowLeft,
  Heart,
  Droplet
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BloodGroup, ALL_BLOOD_GROUPS } from '../../services/bloodCompatibilityService';
import { updateDonorAvailabilitySettings } from '../../services/donorDiscoveryService';

const DonorProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const [isDonorActive, setIsDonorActive] = useState<boolean>(true);
  const [allowLocationDiscovery, setAllowLocationDiscovery] = useState<boolean>(true);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [lastDonationDate, setLastDonationDate] = useState<string>('2023-10-12');
  const [notificationRadius, setNotificationRadius] = useState<string>('10 km');
  const [totalDonations, setTotalDonations] = useState<number>(3);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // User location coordinates (default: 13.0827, 80.2707)
  const [userLat, setUserLat] = useState<number>(13.0827);
  const [userLng, setUserLng] = useState<number>(80.2707);
  const [areaName, setAreaName] = useState<string>('Chennai Central District');

  useEffect(() => {
    // Load local settings if previously saved
    try {
      const raw = localStorage.getItem('lifeguard_donor_profile_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.isDonorActive !== undefined) setIsDonorActive(parsed.isDonorActive);
        if (parsed.allowLocationDiscovery !== undefined) setAllowLocationDiscovery(parsed.allowLocationDiscovery);
        if (parsed.bloodGroup) setBloodGroup(parsed.bloodGroup);
        if (parsed.lastDonationDate) setLastDonationDate(parsed.lastDonationDate);
        if (parsed.notificationRadius) setNotificationRadius(parsed.notificationRadius);
        if (parsed.totalDonations !== undefined) setTotalDonations(parsed.totalDonations);
        if (parsed.lat) setUserLat(parsed.lat);
        if (parsed.lng) setUserLng(parsed.lng);
        if (parsed.areaName) setAreaName(parsed.areaName);
      }
    } catch {}

    // Optionally get current GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
        },
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const profileData = {
        isDonorActive,
        allowLocationDiscovery,
        bloodGroup,
        lastDonationDate,
        notificationRadius,
        totalDonations,
        lat: userLat,
        lng: userLng,
        areaName
      };

      localStorage.setItem('lifeguard_donor_profile_settings', JSON.stringify(profileData));

      // Update in discovery service
      await updateDonorAvailabilitySettings({
        userId: 'user_donor_self',
        isAvailable: isDonorActive,
        bloodGroup,
        lat: userLat,
        lng: userLng,
        allowLocationDiscovery
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error('Failed to update donor profile:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 text-gray-600 hover:text-gray-900">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">Donor Profile & Consent</h1>
            <p className="text-xs text-gray-500 font-medium">Manage discovery permissions & emergency availability</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-xl mx-auto">
        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Donor settings and location discovery consent successfully updated!</span>
          </div>
        )}

        {/* Status Card */}
        <div className="bg-white rounded-3xl shadow-sm p-5 border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-gray-900 text-base">Active Donor Status</h2>
              <p className="text-xs text-gray-500 font-medium">Toggle availability for emergency blood requests</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isDonorActive} 
                onChange={() => setIsDonorActive(!isDonorActive)} 
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
            <div>
              <h3 className="font-black text-gray-900 text-sm">Allow Live Map Discovery</h3>
              <p className="text-xs text-gray-500 font-medium">Show approximate coarsened location on emergency map</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={allowLocationDiscovery} 
                onChange={() => setAllowLocationDiscovery(!allowLocationDiscovery)} 
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Profile Info & Blood Group */}
        <div className="bg-white rounded-3xl shadow-sm p-5 border border-gray-100 space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-2">
              Blood Group *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ALL_BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setBloodGroup(bg)}
                  className={`py-3 rounded-2xl font-black text-base border-2 transition-all ${
                    bloodGroup === bg 
                      ? 'border-red-600 bg-red-50 text-red-600 shadow-sm scale-102' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-3">
            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1">
                Last Blood Donation Date
              </label>
              <input 
                type="date"
                value={lastDonationDate}
                onChange={(e) => setLastDonationDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-bold text-gray-800 focus:bg-white"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                A minimum 90-day interval for males and 120-day interval for females is medically required.
              </p>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1">
                Total Lifetime Donations
              </label>
              <div className="flex items-center space-x-3 bg-gray-50 p-2 border border-gray-200 rounded-xl w-40 justify-between">
                <button 
                  type="button"
                  onClick={() => setTotalDonations(Math.max(0, totalDonations - 1))}
                  className="w-8 h-8 rounded-lg bg-white shadow-sm font-bold text-gray-700"
                >
                  -
                </button>
                <span className="font-black text-base text-gray-900">{totalDonations}</span>
                <button 
                  type="button"
                  onClick={() => setTotalDonations(totalDonations + 1)}
                  className="w-8 h-8 rounded-lg bg-white shadow-sm font-bold text-gray-700"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-3xl shadow-sm p-5 border border-gray-100 space-y-4">
          <h3 className="font-black text-gray-900 text-sm uppercase tracking-wide">Emergency Discovery Preferences</h3>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 text-gray-700">
              <Bell size={18} className="text-gray-400"/>
              <div>
                <span className="font-bold text-xs text-gray-900 block">Notification Radius</span>
                <span className="text-[11px] text-gray-500">Only receive alerts within this distance</span>
              </div>
            </div>
            <select 
              value={notificationRadius}
              onChange={(e) => setNotificationRadius(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-bold rounded-xl p-2.5 focus:bg-white"
            >
              <option value="2 km">2 km</option>
              <option value="5 km">5 km</option>
              <option value="10 km">10 km</option>
              <option value="25 km">25 km</option>
            </select>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-3 text-gray-700">
              <Activity size={18} className="text-gray-400"/>
              <div>
                <span className="font-bold text-xs text-gray-900 block">My Pledged Donations History</span>
                <span className="text-[11px] text-gray-500">View cases you have contributed to</span>
              </div>
            </div>
            <Link to="/activity" className="text-xs text-blue-600 font-bold hover:underline">
              View Activity
            </Link>
          </div>
        </div>

        {/* Privacy Assurance Banner */}
        <div className="flex items-start bg-blue-50/90 border border-blue-200 p-4 rounded-3xl text-xs text-blue-900 space-y-1">
          <Shield size={20} className="mr-3 mt-0.5 shrink-0 text-blue-600" />
          <div>
            <span className="font-black text-blue-950 block">Your Privacy Is Strictly Protected</span>
            <p className="leading-relaxed">
              Your exact home GPS coordinates are <strong>never</strong> transmitted or shown on the live map. Coordinates are coarsened by approximately ±650 meters to protect your residential privacy while still allowing nearby hospitals to verify your proximity.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm shadow-xl active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Heart size={18} className="fill-white" />
            <span>{saving ? 'SAVING PREFERENCES...' : 'SAVE DONOR SETTINGS'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonorProfilePage;
