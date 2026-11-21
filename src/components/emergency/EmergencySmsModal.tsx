import React, { useState } from 'react';
import { MessageSquare, Copy, Check, ExternalLink, X, AlertTriangle, Phone, Send } from 'lucide-react';
import { EmergencyCase, generateEmergencySmsText, getSmsIntentUri } from '../../services/emergencyResponseService';
import { EmergencyContact } from '../../services/medicalProfile';

interface EmergencySmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  emergencyCase: EmergencyCase;
  contacts: EmergencyContact[];
}

export const EmergencySmsModal: React.FC<EmergencySmsModalProps> = ({
  isOpen,
  onClose,
  emergencyCase,
  contacts
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const smsText = generateEmergencySmsText(emergencyCase);
  const primaryPhones = contacts.map(c => c.phone).filter(Boolean);
  const allSmsUri = getSmsIntentUri(primaryPhones, smsText);

  const handleCopy = () => {
    navigator.clipboard.writeText(smsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 text-gray-900 dark:text-white shadow-2xl relative overflow-hidden space-y-5 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 flex items-center justify-center">
              <MessageSquare size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Offline Emergency SMS</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Zero-data fallback for low-signal areas</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center active:scale-95 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="overflow-y-auto space-y-4 flex-1 pr-1">
          
          {/* Mandatory Transparency Disclosure Alert */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle size={18} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Browser Security Note:</span> Standard web browsers cannot automatically transmit SMS in the background without user confirmation. Tapping the button below opens your phone's native Messages app with the GPS coordinates and message pre-filled.
            </div>
          </div>

          {/* Pre-filled Message Display */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Pre-Filled Emergency Text:
              </label>
              <button
                onClick={handleCopy}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 active:scale-95"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-gray-200 dark:border-slate-700 font-mono text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed shadow-inner">
              {smsText}
            </div>
          </div>

          {/* Quick Send to All Primary Contacts */}
          <a
            href={allSmsUri}
            className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Send size={18} />
            <span>Open Messages App (Send to All Contacts)</span>
          </a>

          {/* Individual Contacts list */}
          {contacts.length > 0 && (
            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Or Send to Specific Contact:
              </h4>

              <div className="space-y-1.5">
                {contacts.map((contact, i) => {
                  const singleSmsUri = getSmsIntentUri([contact.phone], smsText);
                  return (
                    <div
                      key={contact.id || i}
                      className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs">{contact.name} ({contact.relationship})</div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">{contact.phone}</div>
                      </div>

                      <a
                        href={singleSmsUri}
                        className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <MessageSquare size={13} /> SMS
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs active:scale-95 transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default EmergencySmsModal;
