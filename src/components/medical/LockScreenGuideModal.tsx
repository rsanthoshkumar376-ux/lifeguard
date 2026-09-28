import React, { useState } from 'react';
import { X, Bell, Pin, Smartphone, ShieldAlert, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import { pinEmergencyToLockScreen } from '../../services/lockScreenNotification';

interface LockScreenGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  bloodGroup?: string;
  pandemicNote?: string;
}

export const LockScreenGuideModal: React.FC<LockScreenGuideModalProps> = ({
  isOpen,
  onClose,
  patientName = 'Patient',
  bloodGroup = 'O+',
  pandemicNote = ''
}) => {
  const [pinStatus, setPinStatus] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const handlePinNow = async () => {
    setPinStatus('Pinning to your lock screen...');
    const res = await pinEmergencyToLockScreen({
      name: patientName,
      bloodGroup: bloodGroup,
      pandemicNote: pandemicNote
    });
    setPinSuccess(res.success);
    setPinStatus(res.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center active:scale-95 transition-all"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <Smartphone size={20} className="text-amber-300" />
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-200">
              LOCK SCREEN SETUP
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight">
            Emergency Access on Your Lock Screen
          </h2>
          <p className="text-xs text-red-100 mt-1">
            Allow strangers or paramedics to view your QR & notes without unlocking your phone.
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 text-gray-800 dark:text-gray-200">
          
          {/* METHOD 1: 1-Tap Persistent Notification (Recommended) */}
          <div className="bg-red-50/80 dark:bg-red-950/40 border-2 border-red-500/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <Pin size={16} /> METHOD 1: Pin Card to Lock Screen (1-Tap)
              </span>
              <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">
                Instant
              </span>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300">
              Pins a permanent emergency card alongside your other lock screen notifications (like Windows / WhatsApp). Anyone touching it sees your Medical QR Code immediately.
            </p>

            {/* Lock Screen Notification Preview */}
            <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-700 space-y-1 text-left shadow-inner">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-bold text-red-400">
                  <span>🚨</span> LifeGuard Emergency
                </span>
                <span>Ongoing</span>
              </div>
              <p className="font-bold text-xs text-white">
                EMERGENCY MEDICAL ID: {bloodGroup} - {patientName}
              </p>
              <p className="text-[11px] text-slate-300">
                Tap to view Medical QR Code, Allergies & Emergency Contacts (No Password Needed)
              </p>
            </div>

            <button
              onClick={handlePinNow}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Pin size={15} />
              <span>Pin Emergency Card to Lock Screen Now</span>
            </button>

            {pinStatus && (
              <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                pinSuccess 
                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border border-emerald-300' 
                  : 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300'
              }`}>
                {pinSuccess ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertTriangle size={16} className="text-amber-600" />}
                <span>{pinStatus}</span>
              </div>
            )}
          </div>

          {/* METHOD 2: Replace Snapchat Icon on Lock Screen Bottom-Left */}
          <div className="bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                <Smartphone size={16} className="text-blue-500" /> METHOD 2: Change Lock Screen Shortcut Icon
              </span>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              In your phone screenshot, the bottom-left corner shows the Snapchat ghost icon. You can change that icon to an Emergency / LifeGuard shortcut:
            </p>

            <ol className="text-xs space-y-2 text-gray-700 dark:text-gray-300 list-decimal list-inside bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-100 dark:border-slate-800 font-medium">
              <li>Open your phone's <strong>Settings</strong> app.</li>
              <li>Tap <strong>Home screen & Lock screen</strong>.</li>
              <li>Scroll down and tap <strong>Lock screen shortcuts</strong>.</li>
              <li>Select <strong>Left shortcut</strong> (currently Snapchat).</li>
              <li>Change it to <strong>Emergency Information</strong>, <strong>LifeGuard</strong>, or <strong>Chrome</strong>.</li>
            </ol>
          </div>

          {/* METHOD 3: Android Built-in Emergency Medical Info */}
          <div className="bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                <ShieldAlert size={16} className="text-emerald-500" /> METHOD 3: Android System Emergency Screen
              </span>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Every Android phone has a built-in "EMERGENCY" button on the PIN/Password lock screen:
            </p>

            <ol className="text-xs space-y-2 text-gray-700 dark:text-gray-300 list-decimal list-inside bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-100 dark:border-slate-800 font-medium">
              <li>Open phone <strong>Settings</strong> &gt; <strong>Safety & Emergency</strong>.</li>
              <li>Tap <strong>Medical Info</strong> &amp; <strong>Emergency Contacts</strong>.</li>
              <li>Enter your Blood Group and primary phone numbers.</li>
              <li>Turn ON <strong>"Show on lock screen"</strong>.</li>
            </ol>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-xs active:scale-95 transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

export default LockScreenGuideModal;
