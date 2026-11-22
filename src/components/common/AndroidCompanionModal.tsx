import React from 'react';
import { X, Smartphone, Shield, Bell, Activity, Send, Clock, CheckCircle2, Download, ExternalLink } from 'lucide-react';

interface AndroidCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidCompanionModal: React.FC<AndroidCompanionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleLaunchNativeApp = () => {
    // Attempt deep link to Android companion
    window.location.href = 'lifeguard://companion';
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-blue-500/20 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
              <Smartphone size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                Native Android Companion
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kotlin &amp; Jetpack Compose OS Bridge
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center active:scale-95 transition-all"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Feature Overview */}
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-start gap-3">
            <Shield size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Native Lock-Screen Medical ID</p>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                Displays a persistent, public triage notification on the lock screen with 1-tap QR display, 108 Ambulance dialer, and primary contact links without requiring device unlocking.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-3">
            <Activity size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Background Sensor Monitoring</p>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                Compliant Android Foreground Service monitoring accelerometer data at 20 Hz (&lt;0.8% battery/day). Detects vehicular collisions and hard falls with a 30s user confirmation countdown.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-start gap-3">
            <Clock size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Reliable Doze-Proof Alarms</p>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                Uses Android AlarmManager.setExactAndAllowWhileIdle() to deliver punctual medication reminders even in deep Doze mode, featuring 1-tap "Mark Taken" notification actions.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-3">
            <Send size={18} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Android SMS Handoff &amp; Dialer</p>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                Pre-populates distress coordinates, GPS maps link, and Medical ID into the native SMS app for explicit human review. Never silently sends messages.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <button
            onClick={handleLaunchNativeApp}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white rounded-2xl font-black text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <ExternalLink size={15} />
            <span>Launch LifeGuard Companion App</span>
          </button>

          <p className="text-[10px] text-slate-400 text-center">
            PWA remains fully supported as a standalone client. Android Companion source is located in <code>android/</code>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AndroidCompanionModal;
