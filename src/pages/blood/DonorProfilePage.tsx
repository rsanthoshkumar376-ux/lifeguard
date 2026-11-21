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
  Droplet,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BloodGroup, ALL_BLOOD_GROUPS } from '../../services/bloodCompatibilityService';
import { updateDonorAvailabilitySettings } from '../../services/donorDiscoveryService';
import { 
  calculateDonationEligibility, 
  DonationType, 
  EligibilityResult,
  getRareBloodInfo,
  isRareBloodGroup,
  getDonationPolicies 
} from '../../services/donorEligibilityService';

const DonorProfilePage: React.FC = () => {
  const navigate = useNavigate();

  // Core Donor Profile Attributes
  const [isDonorActive, setIsDonorActive] = useState<boolean>(true);
  const [allowLocationDiscovery, setAllowLocationDiscovery] = useState<boolean>(true);
  const [willingForEmergency, setWillingForEmergency] = useState<boolean>(true);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [age, setAge] = useState<number>(28);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [lastDonationDate, setLastDonationDate] = useState<string>('2023-10-12');
  const [donationTypeForTracker, setDonationTypeForTracker] = useState<DonationType>('Whole Blood');
  const [notificationRadius, setNotificationRadius] = useState<string>('10 km');
  const [optIntoRareNetwork, setOptIntoRareNetwork] = useState<boolean>(true);

  // Notification Preferences
  const [notifEligibilityReminder, setNotifEligibilityReminder] = useState<boolean>(true);
  const [notifCampAnnouncements, setNotifCampAnnouncements] = useState<boolean>(true);
  const [notifEmergencyRequests, setNotifEmergencyRequests] = useState<boolean>(true);
  const [notifAppointmentReminders, setNotifAppointmentReminders] = useState<boolean>(true);

  // Status & Location
  const [userLat, setUserLat] = useState<number>(13.0827);
  const [userLng, setUserLng] = useState<number>(80.2707);
  const [areaName, setAreaName] = useState<string>('Chennai Central District');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Eligibility Calculation
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);

  useEffect(() => {
    // Load local settings
    try {
      const raw = localStorage.getItem('lifeguard_donor_profile_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.isDonorActive !== undefined) setIsDonorActive(parsed.isDonorActive);
        if (parsed.allowLocationDiscovery !== undefined) setAllowLocationDiscovery(parsed.allowLocationDiscovery);
        if (parsed.willingForEmergency !== undefined) setWillingForEmergency(parsed.willingForEmergency);
        if (parsed.bloodGroup) setBloodGroup(parsed.bloodGroup);
        if (parsed.age) setAge(parsed.age);
        if (parsed.gender) setGender(parsed.gender);
        if (parsed.lastDonationDate) setLastDonationDate(parsed.lastDonationDate);
        if (parsed.notificationRadius) setNotificationRadius(parsed.notificationRadius);
        if (parsed.optIntoRareNetwork !== undefined) setOptIntoRareNetwork(parsed.optIntoRareNetwork);
        if (parsed.notifEligibilityReminder !== undefined) setNotifEligibilityReminder(parsed.notifEligibilityReminder);
        if (parsed.notifCampAnnouncements !== undefined) setNotifCampAnnouncements(parsed.notifCampAnnouncements);
        if (parsed.notifEmergencyRequests !== undefined) setNotifEmergencyRequests(parsed.notifEmergencyRequests);
        if (parsed.notifAppointmentReminders !== undefined) setNotifAppointmentReminders(parsed.notifAppointmentReminders);
      }
    } catch {}

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

  // Re-calculate eligibility on changes
  useEffect(() => {
    const res = calculateDonationEligibility({
      lastDonationDateIso: lastDonationDate,
      donationType: donationTypeForTracker,
      gender
    });
    setEligibility(res);
  }, [lastDonationDate, donationTypeForTracker, gender]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const profileData = {
        isDonorActive,
        allowLocationDiscovery,
        willingForEmergency,
        bloodGroup,
        age,
        gender,
        lastDonationDate,
        notificationRadius,
        optIntoRareNetwork,
        notifEligibilityReminder,
        notifCampAnnouncements,
        notifEmergencyRequests,
        notifAppointmentReminders,
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

  const rareInfo = getRareBloodInfo(bloodGroup);

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 text-gray-600 hover:text-gray-900">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">Donor Profile & Eligibility</h1>
            <p className="text-xs text-gray-500 font-medium">Smart recovery tracking, clinical eligibility & rare group network</p>
          </div>
        </div>

        <Link
          to="/blood/impact"
          className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 border border-red-200"
        >
          <Award size={15} />
          <span>My Badges</span>
        </Link>
      </div>

      <div className="p-4 space-y-4 max-w-xl mx-auto">
        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Donor profile & smart eligibility preferences updated!</span>
          </div>
        )}

        {/* Quick Link to Achievements */}
        <Link
          to="/blood/impact"
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-3xl p-4 shadow-sm flex items-center justify-between transition-transform active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl">
              🎖️
            </div>
            <div>
              <span className="font-black text-sm block">Donor Impact & Milestone Badges</span>
              <span className="text-[11px] text-amber-100 block">View verified donation history and certificates</span>
            </div>
          </div>
          <ChevronRight size={18} />
        </Link>

        {/* 1. Availability & Willingness Status */}
        <div className="bg-white rounded-3xl shadow-sm p-5 border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-gray-900 text-base">Active Donor Status</h2>
              <p className="text-xs text-gray-500 font-medium">Available for emergency blood requests</p>
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
              <h3 className="font-black text-gray-900 text-sm">Emergency Willingness</h3>
              <p className="text-xs text-gray-500 font-medium">Willing to be alerted for urgent life-critical trauma</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={willingForEmergency} 
                onChange={() => setWillingForEmergency(!willingForEmergency)} 
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
            <div>
              <h3 className="font-black text-gray-900 text-sm">Live Discovery Map Consent</h3>
              <p className="text-xs text-gray-500 font-medium">Show approximate coarsened location (±650m) on map</p>
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

        {/* 2. Blood Group, Age & Gender Profile */}
        <div className="bg-white rounded-3xl shadow-sm p-5 border border-gray-100 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wide">
                Blood Group *
              </label>
              {rareInfo.isRare && (
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black">
                  ⭐ {rareInfo.rarityLevel} Group
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {ALL_BLOOD_GROUPS.map((bg) => {
                const isSelected = bloodGroup === bg;
                const isRare = isRareBloodGroup(bg);

                return (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setBloodGroup(bg)}
                    className={`py-3 rounded-2xl font-black text-base border-2 transition-all relative flex flex-col items-center justify-center ${
                      isSelected 
                        ? 'border-red-600 bg-red-50 text-red-600 shadow-sm scale-102' 
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{bg}</span>
                    {isRare && (
                      <span className={`text-[8px] font-bold uppercase mt-0.5 px-1 rounded ${
                        isSelected ? 'bg-red-800 text-white' : 'bg-purple-100 text-purple-800'
                      }`}>
                        Rare
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1">
                Age (18–65 Yrs) *
              </label>
              <input 
                type="number"
                min={18}
                max={65}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-gray-800 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1">
                Gender *
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    gender === 'male' 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                      : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  Male (90d)
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    gender === 'female' 
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs' 
                      : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  Female (120d)
                </button>
              </div>
            </div>
          </div>

          {/* Preferred Radius */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-xs text-gray-900 block">Preferred Notification Perimeter</span>
                <span className="text-[11px] text-gray-500">Only receive emergency alerts within this distance</span>
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
                <option value="50 km">50 km</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Smart Eligibility Tracker Widget */}
        {eligibility && (
          <div className="bg-white rounded-3xl shadow-sm p-5 border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-red-600" />
                <h3 className="font-black text-gray-900 text-xs uppercase tracking-wide">
                  Smart Eligibility Tracker
                </h3>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                eligibility.isEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {eligibility.isEligible ? 'Eligible to Donate' : `${eligibility.daysRemaining}d to recovery`}
              </span>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1">
                Last Blood Donation Date *
              </label>
              <input 
                type="date"
                value={lastDonationDate}
                onChange={(e) => setLastDonationDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-gray-800 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1">
                Track Interval for Component Type:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Whole Blood', 'Plateletpheresis (SDP)', 'Plasmapheresis', 'Double Red Blood Cells (2RBC)'] as DonationType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDonationTypeForTracker(t)}
                    className={`p-2.5 rounded-xl text-xs font-bold text-left border transition-all ${
                      donationTypeForTracker === t 
                        ? 'border-red-600 bg-red-50 text-red-700 font-black' 
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recovery Meter */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-600">Recovery Interval ({eligibility.requiredIntervalDays} Days required):</span>
                <span className={eligibility.isEligible ? 'text-emerald-700' : 'text-amber-700'}>
                  {eligibility.daysElapsed} Days Elapsed
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    eligibility.isEligible ? 'bg-emerald-600' : 'bg-amber-500'
                  }`}
                  style={{ width: `${eligibility.progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>{eligibility.daysRemaining === 0 ? 'Ready for screening' : `${eligibility.daysRemaining} days remaining`}</span>
                <span className="font-bold text-gray-800">Est. Date: {new Date(eligibility.nextEligibleDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Mandatory Medical Screening Alert */}
            <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-black text-amber-900 block text-[11px]">
                  Eligibility Requires Medical Screening
                </span>
                <p className="text-[11px] leading-relaxed">
                  Date calculations provide physiological rest estimates. On-site hemoglobin screening (≥12.5 g/dL), blood pressure check, and blood bank doctor examination remain mandatory before collection.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. Rare Blood Group Network Opt-In */}
        {rareInfo.isRare && (
          <div className="bg-purple-50/80 border border-purple-200 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-purple-600" />
                <h3 className="font-black text-purple-950 text-sm">Rare Blood Standby Network</h3>
              </div>
              <input 
                type="checkbox"
                checked={optIntoRareNetwork}
                onChange={(e) => setOptIntoRareNetwork(e.target.checked)}
                className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500"
              />
            </div>
            <p className="text-xs text-purple-900 leading-relaxed font-medium">
              Because <strong>{bloodGroup}</strong> is rare ({rareInfo.frequencyDescription}), emergency hospital trauma teams depend on verified standby donors for immediate crossmatching. Enabling this alerts you to critical rare blood requisitions.
            </p>
          </div>
        )}

        {/* 5. Notification Preferences */}
        <div className="bg-white rounded-3xl shadow-sm p-5 border border-gray-100 space-y-3">
          <div className="flex items-center gap-2 border-b pb-2">
            <Bell size={17} className="text-gray-500" />
            <h3 className="font-black text-gray-900 text-xs uppercase tracking-wide">
              Smart Notification Preferences
            </h3>
          </div>

          <label className="flex items-center justify-between cursor-pointer py-1">
            <div>
              <span className="text-xs font-bold text-gray-900 block">Eligibility Recovery Reminders</span>
              <span className="text-[11px] text-gray-500">Alert me when physiological rest interval completes</span>
            </div>
            <input 
              type="checkbox"
              checked={notifEligibilityReminder}
              onChange={(e) => setNotifEligibilityReminder(e.target.checked)}
              className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer border-t border-gray-100 pt-2.5 py-1">
            <div>
              <span className="text-xs font-bold text-gray-900 block">Voluntary Blood Donation Camps</span>
              <span className="text-[11px] text-gray-500">Announcements for community blood drives in my city</span>
            </div>
            <input 
              type="checkbox"
              checked={notifCampAnnouncements}
              onChange={(e) => setNotifCampAnnouncements(e.target.checked)}
              className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer border-t border-gray-100 pt-2.5 py-1">
            <div>
              <span className="text-xs font-bold text-gray-900 block">Urgent Emergency Blood Requisitions</span>
              <span className="text-[11px] text-gray-500">High-priority alerts for critical cases within my radius</span>
            </div>
            <input 
              type="checkbox"
              checked={notifEmergencyRequests}
              onChange={(e) => setNotifEmergencyRequests(e.target.checked)}
              className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer border-t border-gray-100 pt-2.5 py-1">
            <div>
              <span className="text-xs font-bold text-gray-900 block">Donation Appointment Reminders</span>
              <span className="text-[11px] text-gray-500">Reminders for scheduled hospital blood bank appointments</span>
            </div>
            <input 
              type="checkbox"
              checked={notifAppointmentReminders}
              onChange={(e) => setNotifAppointmentReminders(e.target.checked)}
              className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
            />
          </label>
        </div>

        {/* Save Preferences Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm shadow-xl active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Heart size={18} className="fill-white" />
            <span>{saving ? 'SAVING PREFERENCES...' : 'SAVE DONOR PREFERENCES'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonorProfilePage;
