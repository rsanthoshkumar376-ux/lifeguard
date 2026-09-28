import React, { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { subscribeToUpdates, triggerAppUpdate, CURRENT_APP_VERSION } from '../../services/updateService';
import { Sparkles, RefreshCw, X, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

export const AppUpdatePrompt: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [versionNumber, setVersionNumber] = useState<string>('1.1.0');
  const [changelog, setChangelog] = useState<string[]>([
    "📷 Mobile Home Screen Camera Mark to open Medical ID in 1 tap",
    "😷 Stranger & Pandemic Safety Notice with 1-tap emergency templates",
    "🔄 In-App Real-time Update Detection & 1-tap refresh",
    "⚡ Resilient offline-first database synchronization"
  ]);
  const [showChangelog, setShowChangelog] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Vite PWA service worker hook
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Check for updates every 30 minutes
        setInterval(() => {
          r.update().catch(() => {});
        }, 30 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.warn('SW registration error:', error);
    }
  });

  useEffect(() => {
    if (needRefresh) {
      setUpdateAvailable(true);
      setDismissed(false);
    }
  }, [needRefresh]);

  // Subscribe to updateService
  useEffect(() => {
    const unsubscribe = subscribeToUpdates((info) => {
      if (info.hasUpdate) {
        setUpdateAvailable(true);
        setDismissed(false);
        if (info.newVersion) setVersionNumber(info.newVersion);
        if (info.changelog && info.changelog.length > 0) setChangelog(info.changelog);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      if (needRefresh) {
        await updateServiceWorker(true);
      }
      await triggerAppUpdate();
    } catch (e) {
      window.location.reload();
    }
  };

  if (!updateAvailable || dismissed) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto animate-in slide-in-from-top-4 duration-300">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl shadow-2xl border-2 border-indigo-500/40 p-4 relative overflow-hidden backdrop-blur-md">
        
        {/* Glowing background accent */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center shrink-0 shadow-md">
              <Sparkles size={20} className="text-white animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-sm text-white tracking-tight">
                  Update Available! (v{versionNumber})
                </h4>
                <span className="bg-emerald-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full">
                  NEW
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                A newer version of LifeGuard is ready with important improvements.
              </p>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors active:scale-95"
            title="Dismiss update banner"
          >
            <X size={18} />
          </button>
        </div>

        {/* Expandable Changelog Preview */}
        {showChangelog && (
          <div className="mt-3 pt-3 border-t border-slate-700/60 text-xs space-y-1.5 animate-in fade-in">
            <p className="font-bold text-indigo-300 text-[11px] uppercase tracking-wider">What's in this update:</p>
            <ul className="space-y-1 text-slate-300 pl-1">
              {changelog.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-3.5 flex items-center justify-between gap-2 pt-1">
          <button
            onClick={() => setShowChangelog(!showChangelog)}
            className="text-[11px] font-bold text-indigo-300 hover:text-indigo-200 flex items-center gap-1 py-1"
          >
            {showChangelog ? (
              <>Hide Details <ChevronUp size={14} /></>
            ) : (
              <>What's New <ChevronDown size={14} /></>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl active:scale-95 transition-all"
            >
              Later
            </button>
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="px-4 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-black shadow-lg shadow-red-900/30 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw size={14} className={isUpdating ? "animate-spin" : ""} />
              {isUpdating ? "Updating..." : "Update Now"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AppUpdatePrompt;
