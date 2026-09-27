import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, ArrowLeft, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { performFullAppReset } from '../utils/resetApp';

const ResetAppPage: React.FC = () => {
  const navigate = useNavigate();
  const [resetting, setResetting] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    await new Promise((r) => setTimeout(r, 600));
    await performFullAppReset();
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col text-gray-900 dark:text-gray-100 transition-colors p-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 shadow-sm p-4 rounded-2xl flex items-center border border-gray-100 dark:border-slate-800 mb-6 max-w-md mx-auto w-full">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reset Application</h1>
      </div>

      <div className="max-w-md mx-auto w-full bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 text-red-600 rounded-3xl flex items-center justify-center mx-auto border border-red-200 dark:border-red-900/50 shadow-sm">
            <RotateCcw size={32} className={resetting ? 'animate-spin' : ''} />
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Reset LifeGuard to Factory State</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            This will completely erase all local data from this device and return the app to its fresh, default state.
          </p>
        </div>

        {/* What gets cleared */}
        <div className="bg-gray-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-gray-200/70 dark:border-slate-700/60 space-y-2.5 text-xs">
          <span className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide block mb-1">
            Data That Will Be Cleared:
          </span>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Trash2 size={14} className="text-red-500 shrink-0" />
            <span>Active user session & registration profile</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Trash2 size={14} className="text-red-500 shrink-0" />
            <span>All local emergency blood requests</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Trash2 size={14} className="text-red-500 shrink-0" />
            <span>Donation pledges and activity history</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Trash2 size={14} className="text-red-500 shrink-0" />
            <span>AI medical chatbot conversation history</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Trash2 size={14} className="text-red-500 shrink-0" />
            <span>Offline caches and service worker data</span>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <span>This action cannot be undone. You will be redirected to the clean welcome screen.</span>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={handleReset}
            disabled={resetting}
            className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-2xl font-black text-sm shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            {resetting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Resetting Entire App...</span>
              </>
            ) : (
              <>
                <RotateCcw size={18} />
                <span>CONFIRM & RESET APP NOW</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            disabled={resetting}
            className="w-full py-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs transition-all"
          >
            Cancel & Keep Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetAppPage;
