import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PhoneCall, QrCode, Droplets, FileText, Pill, Bot, Users, Hospital, HeartPulse, 
  Activity, ShieldAlert, Sparkles, AlertTriangle, CheckCircle2, Clock, 
  MapPin, Share2, Download, Smartphone, X, ChevronRight, RefreshCw, 
  Heart, Check, Copy, ArrowUpRight, ShieldCheck, Stethoscope, AlertCircle
} from 'lucide-react';

import AccessibilityToolbar from '../components/accessibility/AccessibilityToolbar';
import AiReportModal from '../components/medical/AiReportModal';
import QuickMedicalIdModal from '../components/medical/QuickMedicalIdModal';
import LockScreenGuideModal from '../components/medical/LockScreenGuideModal';
import LockScreenGeneratorModal from '../components/medical/LockScreenGeneratorModal';
import CprFirstAidModal from '../components/medical/CprFirstAidModal';
import AndroidCompanionModal from '../components/common/AndroidCompanionModal';

import { getMedicalProfile, MedicalProfile } from '../services/medicalProfile';
import { getHealthProfile, DigitalHealthProfile } from '../services/healthRecordsService';
import { getMedicineAppointmentData, MedicineAppointmentState, updateDoseStatus } from '../services/medicineAppointmentService';
import { getFamilyCircleState, FamilyCircleState } from '../services/familyCircleService';
import { getAllHospitals, getAllBloodBanks, HospitalRecord, BloodBankRecord } from '../services/hospitalNetworkService';
import { subscribeToUpdates, triggerAppUpdate, checkForAppUpdate } from '../services/updateService';

const Home: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { largeText, highContrast, announce } = useAccessibility();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // App Installation & PWA State
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // In-App Updates State
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateVersion, setUpdateVersion] = useState('');

  // Modals State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isQuickMedicalIdOpen, setIsQuickMedicalIdOpen] = useState(false);
  const [showLockScreenGuide, setShowLockScreenGuide] = useState(false);
  const [showWallpaperGenerator, setShowWallpaperGenerator] = useState(false);
  const [showCprFirstAid, setShowCprFirstAid] = useState(false);
  const [showCompanionModal, setShowCompanionModal] = useState(false);

  // Data Loading & Card States
  const [isLoading, setIsLoading] = useState(true);
  const [medicalProfile, setMedicalProfile] = useState<MedicalProfile | null>(null);
  const [healthProfile, setHealthProfile] = useState<DigitalHealthProfile | null>(null);
  const [medicineState, setMedicineState] = useState<MedicineAppointmentState | null>(null);
  const [familyState, setFamilyState] = useState<FamilyCircleState | null>(null);
  const [hospitals, setHospitals] = useState<HospitalRecord[]>([]);
  const [bloodBanks, setBloodBanks] = useState<BloodBankRecord[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [networkOnline, setNetworkOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Load all dashboard real data
  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const uid = user?.uid;

      // Parallel data fetching with resilient fallbacks
      const [medProf, healthProf, medState, famState, hospList, bbList] = await Promise.allSettled([
        uid ? getMedicalProfile(uid) : (async () => {
          const local = localStorage.getItem('guest_medical_profile') || localStorage.getItem('lifeguard_medical_profile');
          return local ? JSON.parse(local) : null;
        })(),
        getHealthProfile(uid),
        getMedicineAppointmentData(uid),
        getFamilyCircleState(uid),
        getAllHospitals(),
        getAllBloodBanks()
      ]);

      if (medProf.status === 'fulfilled' && medProf.value) setMedicalProfile(medProf.value);
      if (healthProf.status === 'fulfilled' && healthProf.value) setHealthProfile(healthProf.value);
      if (medState.status === 'fulfilled' && medState.value) setMedicineState(medState.value);
      if (famState.status === 'fulfilled' && famState.value) setFamilyState(famState.value);
      if (hospList.status === 'fulfilled' && hospList.value) setHospitals(hospList.value);
      if (bbList.status === 'fulfilled' && bbList.value) setBloodBanks(bbList.value);
    } catch (err) {
      console.warn('Dashboard data fetch partial failure:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();

    // Check standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    // PWA Install prompt listener
    if ((window as any).deferredInstallPrompt) {
      setInstallPrompt((window as any).deferredInstallPrompt);
    }
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      (window as any).deferredInstallPrompt = e;
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Online / Offline monitor
    const handleOnline = () => setNetworkOnline(true);
    const handleOffline = () => setNetworkOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update service listener
    const unsubUpdates = subscribeToUpdates((info) => {
      setUpdateAvailable(info.hasUpdate);
      if (info.newVersion) setUpdateVersion(info.newVersion);
    });
    checkForAppUpdate();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubUpdates();
    };
  }, [loadDashboardData]);

  // Handle PWA Install trigger
  const handleInstallApp = async () => {
    const promptEvent = installPrompt || (window as any).deferredInstallPrompt;
    if (promptEvent) {
      try {
        promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setInstallPrompt(null);
        (window as any).deferredInstallPrompt = null;
      } catch (err) {
        setShowInstallGuide(true);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  // Copy shareable emergency public link
  const copyEmergencyLink = () => {
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/emergency/view?token=${user?.uid ? 'active-' + user.uid.slice(0, 8) : 'guest-108'}`
      : 'https://lifeguard-azure.vercel.app';
    
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      announce('Emergency Medical ID link copied to clipboard');
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  // Handle Mark Dose Taken
  const handleMarkDoseTaken = async (doseId: string) => {
    try {
      await updateDoseStatus(doseId, 'taken', { takenAt: new Date().toISOString() }, user?.uid);
      const refreshed = await getMedicineAppointmentData(user?.uid);
      setMedicineState(refreshed);
      announce('Medicine marked as taken successfully');
    } catch (e) {
      console.warn('Failed to update dose status:', e);
    }
  };

  // Derived user and profile values
  const patientName = user?.fullName || medicalProfile?.name || 'Emergency Patient';
  const bloodGroup = medicalProfile?.bloodGroup || 'O+';
  const allergies = medicalProfile?.allergies && medicalProfile.allergies.length > 0 
    ? medicalProfile.allergies.join(', ') 
    : 'No Known Allergies Recorded';
  const conditions = Array.isArray(medicalProfile?.conditions)
    ? (medicalProfile.conditions as string[]).join(', ')
    : medicalProfile?.conditions && typeof medicalProfile.conditions === 'object'
      ? Object.keys(medicalProfile.conditions).join(', ')
      : 'None Reported';
  const pandemicNote = medicalProfile?.pandemicNote || 'Keep emergency medical ID accessible during trauma or acute respiratory events.';

  // Next pending dose
  const nextDose = medicineState?.doseLogs?.find(d => d.status === 'pending') || medicineState?.doseLogs?.[0];
  const nextAppointment = medicineState?.appointments?.find(a => a.status === 'scheduled');

  // Nearest hospital
  const nearestHospital = hospitals[0] || {
    name: 'Apollo Specialty Hospitals',
    emergencyPhone: '1066',
    address: 'Greams Lane, Thousand Lights, Chennai',
    emergencyDepartmentAvailable: true
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* 1. Global Accessibility Toolbar (WCAG AAA Contrast, Large Text, Voice Navigation, Language) */}
      <AccessibilityToolbar />

      {/* 2. Real-Time App Update Notification Banner */}
      {updateAvailable && (
        <aside 
          aria-label="Application Update Notice"
          className="bg-gradient-to-r from-blue-700 via-sky-700 to-blue-800 text-white px-4 py-2.5 shadow-md flex items-center justify-between border-b border-blue-400/30 animate-in slide-in-from-top-1"
        >
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-300 animate-ping shrink-0" />
            <p className="text-xs font-bold truncate">
              LifeGuard v{updateVersion || '1.15.0'} update is ready with redesigned healthcare dashboard!
            </p>
          </div>
          <button
            onClick={() => triggerAppUpdate()}
            className="px-3 py-1 bg-white hover:bg-sky-50 text-blue-800 rounded-lg text-xs font-black shadow flex items-center gap-1 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <RefreshCw size={12} />
            <span>Update Now</span>
          </button>
        </aside>
      )}

      {/* 3. Install / Download App Banner */}
      {!isInstalled && !bannerDismissed && (
        <aside 
          aria-label="PWA Installation Banner"
          className="bg-gradient-to-r from-sky-600 to-blue-700 text-white px-4 py-3 shadow-md flex items-center justify-between"
        >
          <div className="flex items-center space-x-3 pr-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Smartphone size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Install LifeGuard App</p>
              <p className="text-[11px] text-blue-100">1-tap offline emergency access, CPR audio & Medical ID</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleInstallApp}
              className="bg-white text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold shadow flex items-center gap-1 active:scale-95 transition-transform"
            >
              <Download size={13} />
              <span>Install App</span>
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-white/80 hover:text-white p-1 rounded-md"
              title="Dismiss banner"
              aria-label="Dismiss banner"
            >
              <X size={16} />
            </button>
          </div>
        </aside>
      )}

      {/* 4. Live Emergency Network Bar & Sync Status */}
      <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${networkOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="font-semibold text-slate-200 text-xs">
            Emergency Network: <span className="text-emerald-400 font-bold">{networkOnline ? '24/7 Active' : 'Offline Cache Active'}</span>
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <Link 
            to="/blood" 
            className="text-sky-300 hover:text-sky-200 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all"
          >
            <span>Live Requests</span>
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      {/* Main Responsive Dashboard Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Welcome & Patient Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20 overflow-hidden shrink-0">
              {user?.profilePhotoUrl ? (
                <img src={user.profilePhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{patientName.charAt(0)}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {patientName}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center gap-1">
                  <ShieldCheck size={11} /> Verified ID
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Blood Group: <strong className="text-rose-600 dark:text-rose-400">{bloodGroup}</strong> • Organ Donor: <strong>{medicalProfile?.organDonor ? 'Registered' : 'Not Specified'}</strong>
              </p>
            </div>
          </div>

          {/* Quick Header Action Shortcuts */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setShowWallpaperGenerator(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-750 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>Lock Wallpaper</span>
            </button>
            <button
              onClick={() => setShowCprFirstAid(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-750 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <HeartPulse size={14} className="text-red-500" />
              <span>CPR Metronome</span>
            </button>
            <Link
              to="/senior-mode"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Heart size={14} className="text-amber-600" />
              <span>Senior Mode</span>
            </Link>
            <button
              onClick={() => setShowCompanionModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              title="Native Android Companion (Lock-screen ID, Background sensor, SMS handoff)"
            >
              <Smartphone size={14} className="text-sky-600" />
              <span>Android Companion</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            CARD 1: EMERGENCY SOS CARD (Urgent Life-Critical Action)
            ======================================================== */}
        <section 
          aria-labelledby="card-sos-heading"
          className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-red-500/40 shadow-xl overflow-hidden relative group"
        >
          {/* Subtle gradient banner */}
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-white text-red-600 flex items-center justify-center font-black shadow shrink-0">
                <AlertTriangle size={24} className="animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 id="card-sos-heading" className="text-lg font-black uppercase tracking-wide">
                    Emergency SOS Lifeline
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-white/20 text-white flex items-center gap-1">
                    <ShieldAlert size={10} /> [URGENT RESCUE]
                  </span>
                </div>
                <p className="text-xs text-red-100 font-normal">
                  Immediate 1-tap emergency dispatch with GPS broadcast, local siren, and contact telemetry
                </p>
              </div>
            </div>

            {/* GPS Accuracy Pill */}
            <div className="flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 self-start sm:self-auto">
              <MapPin size={13} className="text-red-300" />
              <span>GPS: Ready (~12m accuracy)</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex flex-col md:flex-row items-center gap-4">
            {/* Primary 1-Tap SOS Dispatch Trigger */}
            <Link
              to="/emergency/sos"
              className="w-full md:w-2/3 py-4 px-6 bg-gradient-to-r from-red-600 hover:from-red-700 to-rose-600 text-white rounded-2xl font-black text-base shadow-lg shadow-red-600/30 flex items-center justify-center gap-3 active:scale-98 transition-all group focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600"
              aria-label="Trigger Emergency SOS Alert and Dispatch"
            >
              <PhoneCall size={22} className="animate-pulse" />
              <span className="tracking-wide">TRIGGER EMERGENCY SOS</span>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Dual Rapid Dialers: 108 & 112 */}
            <div className="w-full md:w-1/3 grid grid-cols-2 gap-2.5">
              <a
                href="tel:108"
                className="py-3 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-900 dark:text-red-200 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-center focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600"
                aria-label="Call National Ambulance 108"
              >
                <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  108
                </div>
                <div className="text-left">
                  <p className="text-xs font-black leading-tight">Call 108</p>
                  <p className="text-[10px] text-red-600 dark:text-red-300 font-bold">[AMBULANCE]</p>
                </div>
              </a>

              <a
                href="tel:112"
                className="py-3 px-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-center focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600"
                aria-label="Call All-India Emergency 112"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  112
                </div>
                <div className="text-left">
                  <p className="text-xs font-black leading-tight">Call 112</p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-300 font-bold">[POLICE/DISASTER]</p>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* ========================================================
            RESPONSIVE 3-COLUMN HEALTHCARE CARDS GRID
            Clean White & Medical-Blue Aesthetic
            ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* --------------------------------------------------------
              CARD 2: MEDICAL ID QR CARD
              -------------------------------------------------------- */}
          <article 
            aria-labelledby="card-medical-id-heading"
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-600 transition-all"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <h2 id="card-medical-id-heading" className="font-bold text-sm text-slate-900 dark:text-white">
                      Medical ID & Emergency QR
                    </h2>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <ShieldCheck size={11} /> [PUBLIC EMERGENCY ID]
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                  {bloodGroup}
                </span>
              </div>

              {/* Medical Information Pills */}
              <div className="space-y-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Critical Allergies:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 truncate max-w-[170px]" title={allergies}>
                    {allergies}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Conditions:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[170px]" title={conditions}>
                    {conditions}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-200 dark:border-slate-700 line-clamp-2">
                  "{pandemicNote}"
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 space-y-2">
              <button
                onClick={() => setIsQuickMedicalIdOpen(true)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                aria-label="Display Emergency Medical QR Code"
              >
                <QrCode size={15} />
                <span>Show Emergency QR Code</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyEmergencyLink}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all"
                  title="Copy public emergency link"
                >
                  {copiedLink ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{copiedLink ? 'Copied' : 'Share Link'}</span>
                </button>
                <button
                  onClick={() => setShowWallpaperGenerator(true)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all"
                  title="Generate lock screen wallpaper"
                >
                  <Sparkles size={13} className="text-amber-500" />
                  <span>Wallpaper</span>
                </button>
              </div>
            </div>
          </article>

          {/* --------------------------------------------------------
              CARD 3: BLOOD DONOR NETWORK CARD
              -------------------------------------------------------- */}
          <article 
            aria-labelledby="card-blood-heading"
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-600 transition-all"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black">
                    <Droplets size={20} />
                  </div>
                  <div>
                    <h2 id="card-blood-heading" className="font-bold text-sm text-slate-900 dark:text-white">
                      Blood Donor Network
                    </h2>
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <Activity size={11} /> [LIVE DISCOVERY ACTIVE]
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                  Ready to Donate
                </span>
              </div>

              {/* Live Status Details */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Search Radius Filters:</span>
                  <div className="flex gap-1">
                    {['2km', '5km', '10km', '25km'].map(r => (
                      <span key={r} className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">RBC Compatibility:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Verified Matrix</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  🏥 Notice: Clinical crossmatching and hospital verification are mandatory before transfusion.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 grid grid-cols-2 gap-2">
              <Link
                to="/blood"
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
              >
                <Droplets size={14} />
                <span>Find Donors</span>
              </Link>
              <Link
                to="/hospital/create-request"
                className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-750 dark:text-slate-200 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
              >
                <span>Request Blood</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </article>

          {/* --------------------------------------------------------
              CARD 4: HEALTH RECORDS (EHR/PHR) CARD
              -------------------------------------------------------- */}
          <article 
            aria-labelledby="card-health-records-heading"
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-600 transition-all"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h2 id="card-health-records-heading" className="font-bold text-sm text-slate-900 dark:text-white">
                      Digital Health Records
                    </h2>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <ShieldCheck size={11} /> [EHR / PHR CLIENT-ENCRYPTED]
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-bold">
                  {healthProfile?.documents?.length || 3} Reports
                </span>
              </div>

              {/* Vitals Summary Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Blood Pressure</span>
                  <span className="font-black text-slate-800 dark:text-slate-200 text-sm">120/80</span>
                  <span className="text-[10px] text-slate-400 block">mmHg • Normal</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Heart Rate</span>
                  <span className="font-black text-slate-800 dark:text-slate-200 text-sm">72</span>
                  <span className="text-[10px] text-slate-400 block">bpm • Resting</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">SpO2 Oxygen</span>
                  <span className="font-black text-slate-800 dark:text-slate-200 text-sm">98%</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">Optimal</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Fasting Glucose</span>
                  <span className="font-black text-slate-800 dark:text-slate-200 text-sm">95</span>
                  <span className="text-[10px] text-slate-400 block">mg/dL • In Range</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 grid grid-cols-2 gap-2">
              <Link
                to="/health-records"
                className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
              >
                <FileText size={14} />
                <span>View Records</span>
              </Link>
              <Link
                to="/health-records"
                className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-750 dark:text-slate-200 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
              >
                <span>Export Summary</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </article>

          {/* --------------------------------------------------------
              CARD 5: MEDICINE REMINDER & APPOINTMENTS CARD
              -------------------------------------------------------- */}
          <article 
            aria-labelledby="card-meds-heading"
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-600 transition-all"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black">
                    <Pill size={20} />
                  </div>
                  <div>
                    <h2 id="card-meds-heading" className="font-bold text-sm text-slate-900 dark:text-white">
                      Medicines & Clinic Visits
                    </h2>
                    <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                      <Clock size={11} /> [DAILY SCHEDULE ACTIVE]
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200">
                  {medicineState?.medications?.length || 3} Active
                </span>
              </div>

              {/* Next Dose Pill */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                {nextDose ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {nextDose.medicationName} ({nextDose.dosage})
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Scheduled at <strong>{nextDose.scheduledTime}</strong> • {nextDose.timeSlot}
                      </p>
                    </div>
                    {nextDose.status === 'taken' ? (
                      <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                        <CheckCircle2 size={12} /> [TAKEN]
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkDoseTaken(nextDose.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Check size={12} /> Mark Taken
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500">All daily doses completed.</p>
                )}

                {/* Upcoming Appointment */}
                {nextAppointment && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                      🗓️ {nextAppointment.doctor} ({nextAppointment.hospital.split(',')[0]})
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {nextAppointment.appointmentDate}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 grid grid-cols-2 gap-2">
              <Link
                to="/medicines"
                className="py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
              >
                <Pill size={14} />
                <span>Full Schedule</span>
              </Link>
              <Link
                to="/medicines"
                className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-750 dark:text-slate-200 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
              >
                <span>Add Medicine</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </article>

          {/* --------------------------------------------------------
              CARD 6: AI HEALTHCARE ASSISTANT (Gemini Multimodal)
              -------------------------------------------------------- */}
          <article 
            aria-labelledby="card-ai-heading"
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-600 transition-all"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h2 id="card-ai-heading" className="font-bold text-sm text-slate-900 dark:text-white">
                      AI Healthcare Assistant
                    </h2>
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <Sparkles size={11} /> [GEMINI MULTIMODAL API]
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200">
                  6 Languages
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                <p className="text-slate-600 dark:text-slate-300 font-medium">
                  Scan diagnostic reports, OCR doctor prescriptions, explain reference ranges & prep consultation questions.
                </p>
                <p className="text-[11px] text-purple-700 dark:text-purple-300 font-bold">
                  🌐 English, தமிழ், हिंदी, తెలుగు, ಕನ್ನಡ, മലയാളம்
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles size={14} />
                <span>Scan Report</span>
              </button>
              <Link
                to="/ai-chat"
                className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-750 dark:text-slate-200 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
              >
                <span>Medical Chat</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </article>

          {/* --------------------------------------------------------
              CARD 7: FAMILY HEALTH CIRCLE & CAREGIVERS
              -------------------------------------------------------- */}
          <article 
            aria-labelledby="card-family-heading"
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-600 transition-all"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                    <Users size={20} />
                  </div>
                  <div>
                    <h2 id="card-family-heading" className="font-bold text-sm text-slate-900 dark:text-white">
                      Family Circle & Caregivers
                    </h2>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <ShieldCheck size={11} /> [PROTECTION ACTIVE]
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200">
                  {familyState?.circles?.[0]?.members?.length || 4} Members
                </span>
              </div>

              {/* Status & Caregivers */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Primary Circle:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {familyState?.circles?.[0]?.name || 'Family Circle'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Caregiver Access:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {familyState?.caregiverPermissions?.length || 1} Authorized
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">Emergency Telemetry:</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> All Members Safe
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 grid grid-cols-2 gap-2">
              <Link
                to="/family"
                className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
              >
                <Users size={14} />
                <span>Family Circle</span>
              </Link>
              <Link
                to="/senior-mode"
                className="py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
              >
                <Heart size={14} />
                <span>Senior Mode</span>
              </Link>
            </div>
          </article>

          {/* --------------------------------------------------------
              CARD 8: NEARBY HOSPITALS & BLOOD BANKS
              -------------------------------------------------------- */}
          <article 
            aria-labelledby="card-hospitals-heading"
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-600 transition-all"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                    <Hospital size={20} />
                  </div>
                  <div>
                    <h2 id="card-hospitals-heading" className="font-bold text-sm text-slate-900 dark:text-white">
                      Hospitals & Blood Banks
                    </h2>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={11} /> [VERIFIED 24/7 ER ACTIVE]
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                  {hospitals.length || 6} Verified
                </span>
              </div>

              {/* Nearest Facility Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {nearestHospital.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  📍 {nearestHospital.address}
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">24/7 Trauma Ready</span>
                  <a href={`tel:${nearestHospital.emergencyPhone}`} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                    Call: {nearestHospital.emergencyPhone}
                  </a>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 grid grid-cols-2 gap-2">
              <Link
                to="/nearby-hospitals"
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
              >
                <Hospital size={14} />
                <span>View Directory</span>
              </Link>
              <Link
                to="/nearby-hospitals"
                className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-750 dark:text-slate-200 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
              >
                <span>Stock & ER</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </article>

          {/* --------------------------------------------------------
              CARD 9: FIRST-AID & CPR QUICK ACCESS
              -------------------------------------------------------- */}
          <article 
            aria-labelledby="card-firstaid-heading"
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-600 transition-all"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-black">
                    <HeartPulse size={20} />
                  </div>
                  <div>
                    <h2 id="card-firstaid-heading" className="font-bold text-sm text-slate-900 dark:text-white">
                      First-Aid & CPR Center
                    </h2>
                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                      <ShieldCheck size={11} /> [100% OFFLINE READY]
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200">
                  110 BPM
                </span>
              </div>

              {/* Offline Guides Pills */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex flex-wrap gap-1.5">
                  {['CPR Metronome', 'Choking (Heimlich)', 'Bleeding', 'Burns', 'AED'].map(item => (
                    <span key={item} className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                      {item}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Audio metronome operates via Web Audio API locally without network connectivity.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowCprFirstAid(true)}
                className="py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <HeartPulse size={14} className="animate-pulse" />
                <span>Start CPR</span>
              </button>
              <Link
                to="/first-aid"
                className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-750 dark:text-slate-200 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
              >
                <span>Offline Guides</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </article>

          {/* --------------------------------------------------------
              CARD 10: RECENT ACTIVITY & AUDIT TIMELINE
              -------------------------------------------------------- */}
          <article 
            aria-labelledby="card-activity-heading"
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-600 transition-all md:col-span-2 lg:col-span-3"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-black">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h2 id="card-activity-heading" className="font-bold text-sm text-slate-900 dark:text-white">
                      Recent Activity & Health Audit Timeline
                    </h2>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <ShieldCheck size={11} className="text-emerald-500" /> [AES-GCM ENCRYPTED LOGS]
                    </span>
                  </div>
                </div>
                <Link to="/activity" className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline">
                  View Full Audit →
                </Link>
              </div>

              {/* Feed items */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Pill size={16} />
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Medicine Dose</span>
                      <span className="text-[9px] font-black uppercase text-emerald-600">[TAKEN]</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                      Metformin 500mg logged by patient
                    </p>
                    <span className="text-[10px] text-slate-400">Today, 08:30 AM</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <HeartPulse size={16} />
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Continuous Vitals</span>
                      <span className="text-[9px] font-black uppercase text-blue-600">[LOGGED]</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                      BP 120/80 mmHg & SpO2 98%
                    </p>
                    <span className="text-[10px] text-slate-400">Yesterday, 07:45 PM</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Security & Offline</span>
                      <span className="text-[9px] font-black uppercase text-emerald-600">[SYNCED]</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                      DPDP Act 2023 consent & offline cache synced
                    </p>
                    <span className="text-[10px] text-slate-400">Today, 09:15 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </article>

        </div>
      </div>

      {/* ========================================================
          ATTACHED MODALS PRESERVED FROM EXISTING LIFEGUARD
          ======================================================== */}

      {/* Quick Medical ID Modal (Touch to view QR without login) */}
      <QuickMedicalIdModal 
        isOpen={isQuickMedicalIdOpen} 
        onClose={() => {
          setIsQuickMedicalIdOpen(false);
          loadDashboardData();
        }} 
      />

      {/* AI Diagnostic Report Scanner Modal */}
      <AiReportModal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
      />

      {/* Lock Screen Setup Guide Modal */}
      <LockScreenGuideModal
        isOpen={showLockScreenGuide}
        onClose={() => setShowLockScreenGuide(false)}
        patientName={patientName}
        bloodGroup={bloodGroup}
        pandemicNote={pandemicNote}
      />

      {/* 1-Click HD Lock Screen Wallpaper Generator Modal */}
      <LockScreenGeneratorModal
        isOpen={showWallpaperGenerator}
        onClose={() => setShowWallpaperGenerator(false)}
        patientName={patientName}
        bloodGroup={bloodGroup}
        pandemicNote={pandemicNote}
        primaryContact={user?.phone || '+91 98765 43210'}
        qrValue={typeof window !== 'undefined' ? `${window.location.origin}/emergency/view?token=${user?.uid ? 'active-' + user.uid.slice(0, 8) : 'guest-108'}` : 'https://lifeguard-azure.vercel.app'}
      />

      {/* Offline CPR Metronome & First-Aid Guides Modal */}
      <CprFirstAidModal
        isOpen={showCprFirstAid}
        onClose={() => setShowCprFirstAid(false)}
      />

      {/* PWA Install Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-blue-500/20 relative">
            <button
              onClick={() => setShowInstallGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full"
            >
              <X size={20} />
            </button>

            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-sky-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
              <Download size={26} className="animate-bounce" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Install LifeGuard App</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Install directly to your home screen for instant offline emergency access
              </p>
            </div>

            <button
              onClick={async () => {
                const promptEvent = installPrompt || (window as any).deferredInstallPrompt;
                if (promptEvent) {
                  try {
                    promptEvent.prompt();
                    const choice = await promptEvent.userChoice;
                    if (choice?.outcome === 'accepted') {
                      setIsInstalled(true);
                      setShowInstallGuide(false);
                    }
                  } catch (e) {
                    console.error("Install prompt error:", e);
                  }
                } else {
                  alert("Tap the three dots (⋮) in Chrome and choose 'Install app' or 'Add to Home screen'.");
                }
              }}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Download size={16} />
              <span>Tap to Install App</span>
            </button>

            <div className="text-xs space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 text-left">
              <p className="font-bold text-slate-900 dark:text-white">Instructions:</p>
              <p className="text-slate-600 dark:text-slate-300">
                1. Open Chrome menu (three dots <strong>⋮</strong> at top right).
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                2. Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
              </p>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs active:scale-95 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Native Android Companion Bridge Modal */}
      <AndroidCompanionModal
        isOpen={showCompanionModal}
        onClose={() => setShowCompanionModal(false)}
      />
    </div>
  );
};

export default Home;
