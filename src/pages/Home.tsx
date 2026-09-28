import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, HeartPulse, Droplet, Users, Hospital, Droplets, Activity, Settings, PhoneCall, LogIn, Download, Smartphone, X, Globe, Sparkles, Moon, Sun, Bot, Camera, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import AiReportModal from '../components/medical/AiReportModal';
import LanguageModal from '../components/common/LanguageModal';
import QuickMedicalIdModal from '../components/medical/QuickMedicalIdModal';
import LockScreenEmergencyModal from '../components/medical/LockScreenEmergencyModal';
import { getMedicalProfile } from '../services/medicalProfile';
import { subscribeToUpdates, triggerAppUpdate, checkForAppUpdate } from '../services/updateService';

const Home: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isQuickMedicalIdOpen, setIsQuickMedicalIdOpen] = useState(false);
  const [isLockScreenModalOpen, setIsLockScreenModalOpen] = useState(false);
  const [userNotePreview, setUserNotePreview] = useState<string>('');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateVersion, setUpdateVersion] = useState('');

  const loadNote = async () => {
    try {
      if (user) {
        const p = await getMedicalProfile(user.uid);
        if (p?.pandemicNote) setUserNotePreview(p.pandemicNote);
      } else {
        const local = localStorage.getItem('guest_medical_profile') || localStorage.getItem('lifeguard_medical_profile');
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed.pandemicNote) setUserNotePreview(parsed.pandemicNote);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadNote();
    // Check if running in standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    // Check if prompt was globally captured in index.html
    if ((window as any).deferredInstallPrompt) {
      setInstallPrompt((window as any).deferredInstallPrompt);
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      (window as any).deferredInstallPrompt = e;
      setInstallPrompt(e);
      console.log('✅ LifeGuard install prompt captured in Home component');
    };

    const handleInstallable = () => {
      if ((window as any).deferredInstallPrompt) {
        setInstallPrompt((window as any).deferredInstallPrompt);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('lifeguard:installable', handleInstallable);

    // Subscribe to in-app update events
    const unsubUpdates = subscribeToUpdates((info) => {
      setUpdateAvailable(info.hasUpdate);
      if (info.newVersion) setUpdateVersion(info.newVersion);
    });
    checkForAppUpdate();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('lifeguard:installable', handleInstallable);
      unsubUpdates();
    };
  }, [user]);

  const handleInstallApp = async () => {
    const promptEvent = installPrompt || (window as any).deferredInstallPrompt;
    if (promptEvent) {
      try {
        promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setInstallPrompt(null);
        (window as any).deferredInstallPrompt = null;
      } catch (err) {
        console.warn("Direct install prompt trigger:", err);
        setShowInstallGuide(true);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-40 text-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 shadow-sm px-3.5 py-3 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
          <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 flex items-center justify-center font-bold text-base overflow-hidden border border-red-200 dark:border-red-900 shrink-0">
             {user?.profilePhotoUrl ? (
               <img src={user.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               <span>{user?.fullName?.charAt(0) || 'L'}</span>
             )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate leading-tight">
              {t('home.welcome', 'Welcome back')}
            </p>
            <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm truncate leading-tight max-w-[130px] sm:max-w-[180px]">
              {user?.fullName || 'Emergency Guest'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          {/* Dark / Light Mode Quick Toggle */}
          <button 
            onClick={toggleTheme}
            className="w-8 h-8 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Dark Mode"
          >
            {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
          </button>

          {/* Language Selector Button */}
          <button 
            onClick={() => setIsLanguageModalOpen(true)}
            className="w-8 h-8 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center"
            title="Language / மொழி / भाषा"
            aria-label="Select Language"
          >
            <Globe size={16} />
          </button>

          {/* Notifications Bell */}
          <Link 
            to="/notifications" 
            className="w-8 h-8 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 relative transition-all active:scale-95 flex items-center justify-center"
            title="Notifications & Alerts"
            aria-label="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
          </Link>

          {/* If user logged in: show Settings; if guest: show Login button */}
          {user ? (
            <Link 
              to="/settings" 
              className="w-8 h-8 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center"
              title="Settings"
              aria-label="Settings"
            >
              <Settings size={16} />
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow active:scale-95 transition-all"
            >
              <LogIn size={13} />
              <span>{t('auth.login', 'Login')}</span>
            </Link>
          )}
        </div>
      </header>

      {/* Real-time App Update Notification Banner */}
      {updateAvailable && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white px-3.5 py-2.5 shadow-lg flex items-center justify-between animate-in slide-in-from-top-2 border-b border-white/20">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping shrink-0"></span>
            <p className="text-xs font-bold truncate">
              Update Available (v{updateVersion || '1.2.0'}) with new design fixes!
            </p>
          </div>
          <button
            onClick={() => triggerAppUpdate()}
            className="px-3 py-1 bg-white hover:bg-amber-50 text-red-600 rounded-lg text-xs font-black shadow flex items-center gap-1 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <RefreshCw size={12} />
            Update Now
          </button>
        </div>
      )}

      {/* Install / Download App Banner */}
      {!isInstalled && !bannerDismissed && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-3.5 shadow-md flex items-center justify-between">
          <div className="flex items-center space-x-3 pr-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Smartphone size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Install LifeGuard App</p>
              <p className="text-[11px] text-blue-100">Get 1-tap offline emergency access on your phone</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleInstallApp}
              className="bg-white text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold shadow flex items-center gap-1 active:scale-95 transition-transform"
            >
              <Download size={14} /> Download App
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-white/70 hover:text-white p-1 rounded"
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Install Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-blue-500/20 relative">
            <button
              onClick={() => setShowInstallGuide(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-full"
            >
              <X size={20} />
            </button>

            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
              <Download size={28} className="animate-bounce" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Install LifeGuard Directly</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Add to your phone for instant 1-tap offline emergency access
              </p>
            </div>

            {/* Direct 1-Tap Native Install Button */}
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
                  alert("Please tap the three dots (⋮) at top right of Chrome and select 'Install app'.");
                }
              }}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Download size={18} /> Tap Here to Install Directly
            </button>

            {/* Visual Instructions */}
            <div className="text-xs space-y-3 bg-gray-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 text-left">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">In Chrome (Android):</p>
                  <p className="text-gray-600 dark:text-gray-300 mt-0.5">
                    Look at the <strong>top right</strong> corner and tap the <strong>three dots (⋮)</strong> menu.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">Select "Install app":</p>
                  <p className="text-gray-600 dark:text-gray-300 mt-0.5">
                    Tap <strong>"Install app"</strong> (or <strong>"Add to Home screen"</strong>).
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  ✨ The LifeGuard icon will download and appear directly on your phone's home screen like any native app.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs active:scale-95 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Emergency Network Status Banner */}
      <div className="bg-slate-900 dark:bg-black text-white px-3.5 py-2 flex items-center justify-between shadow-sm text-xs">
        <div className="flex items-center space-x-2 overflow-hidden pr-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span className="font-semibold text-slate-200 truncate text-[11px] sm:text-xs">
            Emergency Network: <span className="text-emerald-400 font-bold">24/7 Active</span>
          </span>
        </div>
        <Link 
          to="/blood/requests" 
          className="text-red-400 hover:text-red-300 font-bold text-[11px] sm:text-xs shrink-0 flex items-center gap-1 bg-red-950/60 hover:bg-red-900/60 px-2.5 py-1 rounded-full border border-red-800/60 active:scale-95 transition-all"
        >
          <span>Live Requests</span>
          <span className="text-[10px]">→</span>
        </Link>
      </div>

      <div className="p-4 space-y-4">
        {/* 📷 CAMERA MARK: Quick Medical ID & Pandemic Note for Strangers */}
        <div 
          onClick={() => setIsQuickMedicalIdOpen(true)}
          className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-3.5 rounded-2xl shadow-lg flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform border border-red-300/40 relative overflow-hidden group"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform pointer-events-none"></div>

          <div className="flex items-center space-x-3 overflow-hidden pr-2">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
              <Camera size={22} className="text-white animate-pulse" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="bg-amber-400 text-amber-950 font-black text-[9px] uppercase px-1.5 py-0.5 rounded tracking-wider shadow-sm flex items-center gap-1">
                  <span>📷</span> CAMERA MARK
                </span>
                <p className="text-xs font-black tracking-tight text-white">Medical ID & Pandemic Note</p>
              </div>
              <p className="text-[11px] text-amber-100 font-medium truncate mt-0.5">
                {userNotePreview || "1-Tap view for strangers • Pandemic instructions & 108 calling"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 bg-white text-red-600 px-3 py-2 rounded-xl text-xs font-black shadow-md hover:bg-amber-50 active:scale-95 transition-all">
            <span>Open</span>
            <span className="text-[10px]">▶</span>
          </div>
        </div>

        {/* 🔒 Lock Screen Emergency Card Quick Setup */}
        <div 
          onClick={() => setIsLockScreenModalOpen(true)}
          className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3.5 rounded-2xl shadow-md border border-indigo-500/40 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all hover:border-indigo-400 group"
        >
          <div className="flex items-center space-x-3 overflow-hidden pr-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 group-hover:bg-indigo-500 flex items-center justify-center shrink-0 text-white shadow-md">
              <Smartphone size={20} />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="bg-indigo-500 text-white font-black text-[9px] uppercase px-1.5 py-0.5 rounded tracking-wider shadow-sm">
                  🔒 LOCK SCREEN
                </span>
                <p className="text-xs font-black text-white">View Without Password</p>
              </div>
              <p className="text-[11px] text-indigo-200 font-medium truncate mt-0.5">
                Download HD Lock Screen Card with QR Code & Emergency Notes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0 bg-white text-indigo-950 px-3 py-1.5 rounded-xl text-xs font-black shadow-md hover:bg-indigo-50 active:scale-95 transition-all">
            <span>Setup</span>
            <span className="text-[10px]">➔</span>
          </div>
        </div>

        {/* Main Action Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/emergency/sos" className="col-span-2 bg-gradient-to-r from-red-600 to-red-700 text-white h-24 rounded-2xl flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform">
             <PhoneCall size={32} className="mb-1 animate-bounce" />
             <span className="font-black text-lg tracking-wide">{t('emergency.sos', 'SOS EMERGENCY')}</span>
          </Link>
          
          <Link to="/hospital/create-request" className="bg-orange-500 hover:bg-orange-600 text-white h-24 rounded-2xl flex flex-col items-center justify-center p-2 shadow active:scale-95 transition-transform text-center">
             <Droplet size={28} className="mb-1 shrink-0" />
             <span className="font-bold text-xs sm:text-sm leading-tight px-1">{t('blood.request', 'Need Blood')}</span>
          </Link>
          
          <Link to="/emergency/id" className="bg-blue-600 hover:bg-blue-700 text-white h-24 rounded-2xl flex flex-col items-center justify-center p-2 shadow active:scale-95 transition-transform text-center">
             <HeartPulse size={28} className="mb-1 shrink-0" />
             <span className="font-bold text-xs sm:text-sm leading-tight px-1">{t('emergency.medicalId', 'Emergency ID')}</span>
          </Link>
          
          <Link to="/qr" className="bg-purple-600 hover:bg-purple-700 text-white h-24 rounded-2xl flex flex-col items-center justify-center p-2 shadow active:scale-95 transition-transform text-center">
             <span className="text-2xl mb-1 shrink-0">📱</span>
             <span className="font-bold text-xs sm:text-sm leading-tight px-1">{t('qr.title', 'My QR ID')}</span>
          </Link>
          
          <Link to="/medical-profile" className="bg-teal-600 hover:bg-teal-700 text-white h-24 rounded-2xl flex flex-col items-center justify-center p-2 shadow active:scale-95 transition-transform text-center">
             <Users size={28} className="mb-1 shrink-0" />
             <span className="font-bold text-xs sm:text-sm leading-tight px-1">{t('profile.medical', 'Medical Profile')}</span>
          </Link>

          <Link to="/nearby-hospitals" className="bg-emerald-600 hover:bg-emerald-700 text-white h-24 rounded-2xl flex flex-col items-center justify-center p-2 shadow active:scale-95 transition-transform text-center">
             <Hospital size={28} className="mb-1 shrink-0" />
             <span className="font-bold text-xs sm:text-sm leading-tight px-1">{t('home.nearbyHospitals', 'Nearby Hospitals')}</span>
          </Link>
          
          <Link to="/blood/donor-profile" className="bg-rose-600 hover:bg-rose-700 text-white h-24 rounded-2xl flex flex-col items-center justify-center p-2 shadow active:scale-95 transition-transform text-center">
             <Droplets size={28} className="mb-1 shrink-0" />
             <span className="font-bold text-xs sm:text-sm leading-tight px-1">{t('blood.donate', 'Blood Donation')}</span>
          </Link>

          <Link to="/activity" className="bg-slate-700 hover:bg-slate-800 text-white h-24 rounded-2xl flex flex-col items-center justify-center p-2 shadow active:scale-95 transition-transform text-center">
             <Activity size={28} className="mb-1 shrink-0" />
             <span className="font-bold text-xs sm:text-sm leading-tight px-1">{t('home.recentActivity', 'My Activity')}</span>
          </Link>
          
          <Link to="/settings" className="bg-slate-800 hover:bg-slate-900 text-white h-24 rounded-2xl flex flex-col items-center justify-center p-2 shadow active:scale-95 transition-transform text-center">
             <Settings size={28} className="mb-1 shrink-0" />
             <span className="font-bold text-xs sm:text-sm leading-tight px-1">{t('profile.settings', 'Settings')}</span>
          </Link>
        </div>

        {/* Optional Secondary AI Tools Row (cleanly positioned below all primary buttons) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Link
            to="/ai-chat"
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-3.5 rounded-2xl flex items-center space-x-3 shadow-sm hover:border-red-300 active:scale-95 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center shrink-0">
              <Bot size={22} />
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">AI Assistant</p>
              <p className="text-[10px] text-gray-500 truncate">Ask medical & CPR</p>
            </div>
          </Link>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-3.5 rounded-2xl flex items-center space-x-3 shadow-sm hover:border-blue-300 active:scale-95 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0">
              <Sparkles size={22} />
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">Scan Report</p>
              <p className="text-[10px] text-gray-500 truncate">AI lab analysis</p>
            </div>
          </button>
        </div>

        {/* Quick Help & Hotline Banner */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                108
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">National Emergency Services</p>
                <p className="text-[11px] text-gray-500">Ambulance & Disaster Support</p>
              </div>
            </div>
            <a 
              href="tel:108"
              className="px-3.5 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold shadow hover:bg-red-700 active:scale-95 transition-all"
            >
              Call 108
            </a>
        </div>
      </div>

      {/* 📷 Lockscreen Camera Mark / Emergency Period Shortcut */}
      <aside aria-label="Emergency Period Quick Access" className="fixed bottom-20 right-3.5 z-40 flex flex-col items-end pointer-events-none">
        <button
          onClick={() => setIsQuickMedicalIdOpen(true)}
          className="pointer-events-auto group relative bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 text-white w-14 h-14 rounded-full shadow-2xl border-2 border-white ring-4 ring-red-500/25 active:scale-90 hover:scale-105 transition-all flex items-center justify-center cursor-pointer"
          title="Emergency Period: 1-Tap Medical ID & Stranger Note"
          aria-label="Open Medical ID and Pandemic Safety Note"
        >
          <div className="relative flex items-center justify-center">
            <Camera size={26} className="text-white drop-shadow" />
            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 text-[8px] font-black items-center justify-center text-amber-950">!</span>
            </span>
          </div>

          {/* Quick Indicator Badge on hover/initial display */}
          <span className="absolute right-16 bg-slate-900/90 text-white text-[11px] font-black px-2.5 py-1 rounded-full whitespace-nowrap shadow-xl border border-slate-700 pointer-events-none opacity-90 group-hover:opacity-100 flex items-center gap-1.5 backdrop-blur-sm transition-opacity">
            <span className="text-amber-400">🚨</span> Emergency ID
          </span>
        </button>
      </aside>

      {/* 🪪 Quick Medical ID & Pandemic Notice Modal */}
      <QuickMedicalIdModal 
        isOpen={isQuickMedicalIdOpen} 
        onClose={() => { 
          setIsQuickMedicalIdOpen(false); 
          loadNote(); 
        }} 
      />

      {/* AI Report Scanner Modal */}
      <AiReportModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />

      {/* Language Selection Modal */}
      <LanguageModal isOpen={isLanguageModalOpen} onClose={() => setIsLanguageModalOpen(false)} />

      {/* 🔒 Phone Lock Screen Emergency Card Modal */}
      <LockScreenEmergencyModal
        isOpen={isLockScreenModalOpen}
        onClose={() => setIsLockScreenModalOpen(false)}
      />
    </div>
  );
};

export default Home;
