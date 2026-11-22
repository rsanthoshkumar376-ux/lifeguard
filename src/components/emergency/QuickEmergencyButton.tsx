import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PhoneCall, AlertTriangle, QrCode, HeartPulse, X, Hospital, ShieldAlert, ChevronRight } from 'lucide-react';
import QuickMedicalIdModal from '../medical/QuickMedicalIdModal';
import CprFirstAidModal from '../medical/CprFirstAidModal';

export const QuickEmergencyButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isCprModalOpen, setIsCprModalOpen] = useState(false);

  // If already on the SOS page, don't show the duplicate floating button
  if (location.pathname === '/emergency/sos' || location.pathname === '/sos') {
    return null;
  }

  return (
    <>
      {/* Floating Quick Emergency Trigger Button */}
      <aside 
        aria-label="Universal Emergency SOS Quick Action"
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 flex flex-col items-end pointer-events-none"
      >
        <button
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto group relative bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-700 text-white w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl border-2 border-white ring-4 ring-red-500/30 active:scale-95 hover:scale-105 transition-all flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500"
          aria-label="Open Universal Emergency Speed Dial and Quick SOS"
          title="Emergency Help: 1-Tap SOS, 108, 112, Medical QR"
        >
          {/* Animated Attention Ping */}
          <span className="absolute -inset-1 rounded-full bg-red-500 opacity-40 group-hover:opacity-75 animate-ping pointer-events-none"></span>

          <div className="relative flex flex-col items-center justify-center text-white">
            <AlertTriangle size={24} className="animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-tighter">SOS</span>
          </div>

          {/* Quick Tooltip pill on hover */}
          <span className="absolute right-16 bg-slate-950 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-2xl border border-slate-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>Emergency Lifeline</span>
          </span>
        </button>
      </aside>

      {/* Emergency Quick Action Sheet / Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-sheet-title"
        >
          <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border-t sm:border border-red-500/30 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center font-black">
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <h2 id="emergency-sheet-title" className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                    Emergency Lifeline
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Immediate assistance and 1-tap dispatch
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center active:scale-95 transition-all"
                aria-label="Close Emergency Lifeline"
              >
                <X size={18} />
              </button>
            </div>

            {/* Primary Action: 1-Tap SOS Dispatch */}
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/emergency/sos');
              }}
              className="w-full py-4 px-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white rounded-2xl font-black text-base shadow-xl flex items-center justify-between active:scale-98 transition-all group"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-white text-red-600 flex items-center justify-center shrink-0 shadow">
                  <PhoneCall size={20} className="animate-bounce" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-wide">TRIGGER SOS DISPATCH</p>
                  <p className="text-xs text-red-100 font-normal">GPS coordinates, siren & contact alerts</p>
                </div>
              </div>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Dual Fast Dials: 108 Ambulance & 112 Police/Disaster */}
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href="tel:108"
                className="p-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/70 border border-red-200 dark:border-red-900 text-red-900 dark:text-red-200 rounded-xl flex items-center gap-2.5 active:scale-95 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-red-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                  108
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-xs font-black">Call Ambulance</p>
                  <p className="text-[10px] text-red-700 dark:text-red-300">National 24/7</p>
                </div>
              </a>

              <a
                href="tel:112"
                className="p-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950/70 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 rounded-xl flex items-center gap-2.5 active:scale-95 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                  112
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-xs font-black">Call Police / 112</p>
                  <p className="text-[10px] text-blue-700 dark:text-blue-300">All Emergency</p>
                </div>
              </a>
            </div>

            {/* Secondary Quick Utilities */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsQrModalOpen(true);
                }}
                className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center sm:flex-col sm:text-center gap-2 active:scale-95 transition-all"
              >
                <QrCode size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-xs font-bold">Medical ID QR</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsCprModalOpen(true);
                }}
                className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center sm:flex-col sm:text-center gap-2 active:scale-95 transition-all"
              >
                <HeartPulse size={18} className="text-red-600 dark:text-red-400 shrink-0" />
                <span className="text-xs font-bold">CPR Metronome</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/nearby-hospitals');
                }}
                className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center sm:flex-col sm:text-center gap-2 active:scale-95 transition-all"
              >
                <Hospital size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-bold">Nearby ER</span>
              </button>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 active:scale-95 transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Modals triggered from quick emergency button */}
      <QuickMedicalIdModal 
        isOpen={isQrModalOpen} 
        onClose={() => setIsQrModalOpen(false)} 
      />

      <CprFirstAidModal
        isOpen={isCprModalOpen}
        onClose={() => setIsCprModalOpen(false)}
      />
    </>
  );
};

export default QuickEmergencyButton;
