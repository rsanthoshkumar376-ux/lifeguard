import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, HeartPulse, Droplet, Users, Hospital, Droplets, Activity, Settings, PhoneCall, LogIn, Download, Smartphone, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg overflow-hidden border border-red-200">
             {user?.profilePhotoUrl ? (
               <img src={user.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               <span>{user?.fullName?.charAt(0) || 'L'}</span>
             )}
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Welcome to LifeGuard</p>
            <p className="font-bold text-gray-900 text-sm">{user?.fullName || 'Emergency Guest'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!user ? (
            <Link to="/login" className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center shadow active:scale-95 transition-all">
              <LogIn size={14} className="mr-1" /> Login
            </Link>
          ) : (
            <Link to="/settings" className="p-2 text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200">
               <Bell size={18} />
            </Link>
          )}
        </div>
      </header>

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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Smartphone size={28} />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900">How to Install LifeGuard</h3>
            <div className="text-sm text-gray-600 space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="font-semibold text-gray-800">📱 Android (Chrome):</p>
              <p>Tap the <strong>three dots (⋮)</strong> at the top right of your browser and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
              
              <div className="border-t border-gray-200 pt-2"></div>
              
              <p className="font-semibold text-gray-800">🍎 iPhone / iPad (Safari):</p>
              <p>Tap the <strong>Share button (square with arrow ↑)</strong> at the bottom of Safari, then scroll down and tap <strong>"Add to Home Screen"</strong>.</p>
            </div>
            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Emergency Alert Banner */}
      <div className="bg-red-600 text-white p-3 flex items-center justify-between shadow-sm">
         <div className="flex items-center space-x-2">
           <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
           <span className="font-bold text-xs sm:text-sm">CRITICAL: O+ Blood needed nearby!</span>
         </div>
         <Link to="/blood-requests/1" className="bg-white text-red-600 px-3 py-1 rounded-full text-xs font-bold shadow hover:bg-red-50 active:scale-95 transition-transform">
           View
         </Link>
      </div>

      <div className="p-4 space-y-4">
        {/* Main Action Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/emergency/sos" className="col-span-2 bg-gradient-to-r from-red-600 to-red-700 text-white h-24 rounded-2xl flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform">
             <PhoneCall size={32} className="mb-1 animate-bounce" />
             <span className="font-black text-lg tracking-wide">SOS EMERGENCY</span>
          </Link>
          
          <Link to="/hospital/create-request" className="bg-orange-500 hover:bg-orange-600 text-white h-24 rounded-2xl flex flex-col items-center justify-center shadow active:scale-95 transition-transform">
             <Droplet size={28} className="mb-1" />
             <span className="font-bold text-sm">Need Blood</span>
          </Link>
          
          <Link to="/emergency/id" className="bg-blue-600 hover:bg-blue-700 text-white h-24 rounded-2xl flex flex-col items-center justify-center shadow active:scale-95 transition-transform">
             <HeartPulse size={28} className="mb-1" />
             <span className="font-bold text-sm">Emergency ID</span>
          </Link>
          
          <Link to="/qr" className="bg-purple-600 hover:bg-purple-700 text-white h-24 rounded-2xl flex flex-col items-center justify-center shadow active:scale-95 transition-transform">
             <span className="text-2xl mb-1">📱</span>
             <span className="font-bold text-sm">My QR ID</span>
          </Link>
          
          <Link to="/medical-profile" className="bg-teal-600 hover:bg-teal-700 text-white h-24 rounded-2xl flex flex-col items-center justify-center shadow active:scale-95 transition-transform">
             <Users size={28} className="mb-1" />
             <span className="font-bold text-sm">Medical Profile</span>
          </Link>

          <Link to="/nearby-hospitals" className="bg-emerald-600 hover:bg-emerald-700 text-white h-24 rounded-2xl flex flex-col items-center justify-center shadow active:scale-95 transition-transform">
             <Hospital size={28} className="mb-1" />
             <span className="font-bold text-sm">Nearby Hospitals</span>
          </Link>
          
          <Link to="/blood/donor-profile" className="bg-rose-600 hover:bg-rose-700 text-white h-24 rounded-2xl flex flex-col items-center justify-center shadow active:scale-95 transition-transform">
             <Droplets size={28} className="mb-1" />
             <span className="font-bold text-sm">Blood Donation</span>
          </Link>

          <Link to="/activity" className="bg-slate-700 hover:bg-slate-800 text-white h-24 rounded-2xl flex flex-col items-center justify-center shadow active:scale-95 transition-transform">
             <Activity size={28} className="mb-1" />
             <span className="font-bold text-sm">My Activity</span>
          </Link>
          
          <Link to="/settings" className="bg-slate-800 hover:bg-slate-900 text-white h-24 rounded-2xl flex flex-col items-center justify-center shadow active:scale-95 transition-transform">
             <Settings size={28} className="mb-1" />
             <span className="font-bold text-sm">Settings</span>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-between">
            <div className="text-center w-1/2 border-r border-gray-100">
              <p className="text-2xl font-black text-gray-900">1,204</p>
              <p className="text-xs text-gray-500 font-medium">Donors Registered</p>
            </div>
            <div className="text-center w-1/2">
              <p className="text-2xl font-black text-red-600">89</p>
              <p className="text-xs text-gray-500 font-medium">Lives Saved in 2026</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
