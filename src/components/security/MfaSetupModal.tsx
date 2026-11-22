import React, { useState } from 'react';
import { 
  X, ShieldCheck, Key, Copy, Check, AlertTriangle, 
  Smartphone, QrCode, Lock, RefreshCw, Download 
} from 'lucide-react';
import { 
  getSecuritySettings, 
  saveSecuritySettings, 
  createEmergencyRecoveryKey, 
  SecuritySettingsState 
} from '../../services/securityMonitoringService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSettingsChanged: () => void;
}

export const MfaSetupModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userId,
  onSettingsChanged
}) => {
  const [settings, setSettings] = useState<SecuritySettingsState>(getSecuritySettings());
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  if (!isOpen) return null;

  const handleToggleMfa = () => {
    const updated: SecuritySettingsState = {
      ...settings,
      mfaEnabled: !settings.mfaEnabled
    };
    setSettings(updated);
    saveSecuritySettings(updated);
    onSettingsChanged();
  };

  const handleToggleStepUp = () => {
    const updated: SecuritySettingsState = {
      ...settings,
      stepUpAuthRequiredForRecords: !settings.stepUpAuthRequiredForRecords
    };
    setSettings(updated);
    saveSecuritySettings(updated);
    onSettingsChanged();
  };

  const handleGenerateRecoveryKey = async () => {
    setIsGeneratingKey(true);
    try {
      const key = await createEmergencyRecoveryKey(userId);
      setRecoveryKey(key);
      setSettings(getSecuritySettings());
      onSettingsChanged();
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleCopyKey = () => {
    if (!recoveryKey) return;
    navigator.clipboard.writeText(recoveryKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-blue-300">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-base font-black">Multi-Factor Auth & Recovery</h2>
              <p className="text-[11px] text-blue-200">Account hardening and disaster keys</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-gray-800 dark:text-gray-200">
          
          {/* MFA Toggle Card */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Smartphone size={16} className="text-blue-500" />
                  Two-Factor Authentication (2FA)
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Require 6-digit SMS OTP verification during every new device sign-in.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                <input 
                  type="checkbox" 
                  checked={settings.mfaEnabled} 
                  onChange={handleToggleMfa}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.mfaEnabled && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Check size={16} className="shrink-0 text-emerald-600" />
                <span>2FA is active. SMS OTP will be required on all unrecognized devices.</span>
              </div>
            )}
          </div>

          {/* Step-Up Auth Toggle */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Lock size={16} className="text-amber-500" />
                Step-Up Auth for Records
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Prompt for re-authentication before deleting records or revoking access.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
              <input 
                type="checkbox" 
                checked={settings.stepUpAuthRequiredForRecords} 
                onChange={handleToggleStepUp}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {/* Emergency Recovery Key Card */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-3">
            <div className="flex items-start gap-2.5">
              <Key size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950 dark:text-amber-200 text-xs uppercase tracking-wider">
                  Emergency Recovery Code
                </p>
                <p className="text-xs text-amber-900/80 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                  A 16-character alphanumeric key used to regain access if you lose your phone or SIM card.
                </p>
              </div>
            </div>

            {recoveryKey ? (
              <div className="space-y-2">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-300 dark:border-amber-700 text-center font-mono font-bold text-base text-gray-900 dark:text-white tracking-widest selection:bg-amber-200">
                  {recoveryKey}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyKey}
                    className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow"
                  >
                    {copiedKey ? <Check size={14} /> : <Copy size={14} />}
                    {copiedKey ? 'Copied to Clipboard!' : 'Copy Recovery Key'}
                  </button>
                </div>
                <p className="text-[11px] text-red-600 dark:text-red-400 font-bold text-center">
                  ⚠️ Save this key securely now. It will not be shown again in plaintext!
                </p>
              </div>
            ) : (
              <div>
                {settings.recoveryKeyHash ? (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check size={14} /> Recovery Key Active
                    </span>
                    <button
                      onClick={handleGenerateRecoveryKey}
                      disabled={isGeneratingKey}
                      className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 active:scale-95 transition-all"
                    >
                      {isGeneratingKey ? 'Regenerating...' : 'Regenerate Key'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateRecoveryKey}
                    disabled={isGeneratingKey}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow"
                  >
                    <Key size={14} />
                    {isGeneratingKey ? 'Generating...' : 'Generate 16-Digit Recovery Key'}
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800/80 border-t border-gray-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-900 dark:bg-slate-700 hover:bg-black text-white font-bold text-xs rounded-xl active:scale-95 transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

export default MfaSetupModal;
