import React, { useState } from 'react';
import { 
  X, Shield, Check, AlertTriangle, FileText, Globe, 
  Trash2, Download, Building, Mail, Phone, ExternalLink 
} from 'lucide-react';
import { 
  DPDP_CONSENT_PURPOSES, 
  getUserConsents, 
  updateConsent, 
  getConsentAuditHistory, 
  executeCompleteDataErasure, 
  STATUTORY_DPO, 
  ConsentPurposeId 
} from '../../services/complianceService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const ConsentManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userId
}) => {
  const [activeTab, setActiveTab] = useState<'consents' | 'history' | 'dpo' | 'erasure'>('consents');
  const [consents, setConsents] = useState(getUserConsents());
  const [history, setHistory] = useState(getConsentAuditHistory());
  const [noticeLanguage, setNoticeLanguage] = useState<'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml'>('en');
  const [erasureConfirmed, setErasureConfirmed] = useState(false);
  const [erasureSuccess, setErasureSuccess] = useState(false);

  if (!isOpen) return null;

  const handleToggleConsent = (purposeId: ConsentPurposeId) => {
    const currentVal = consents[purposeId]?.granted || false;
    const updated = updateConsent(purposeId, !currentVal, noticeLanguage);
    setConsents(getUserConsents());
    setHistory(getConsentAuditHistory());
  };

  const handleExecuteErasure = () => {
    if (!erasureConfirmed) return;
    executeCompleteDataErasure(userId);
    setErasureSuccess(true);
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400">
              <Shield size={22} />
            </div>
            <div>
              <h2 className="text-base font-black">DPDP Privacy & Consent Manager</h2>
              <p className="text-[11px] text-emerald-300">Digital Personal Data Protection Act, 2023</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-4 p-1 bg-gray-100 dark:bg-slate-800 m-4 mb-2 rounded-2xl text-[11px] font-bold">
          <button
            onClick={() => setActiveTab('consents')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'consents' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-gray-500'
            }`}
          >
            Consents
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'history' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-gray-500'
            }`}
          >
            Audit Trail
          </button>
          <button
            onClick={() => setActiveTab('dpo')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'dpo' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-gray-500'
            }`}
          >
            Grievance / DPO
          </button>
          <button
            onClick={() => setActiveTab('erasure')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'erasure' ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs' : 'text-gray-500'
            }`}
          >
            Erase Data
          </button>
        </div>

        {/* Content */}
        <div className="p-5 pt-2 overflow-y-auto space-y-4 text-xs text-gray-800 dark:text-gray-200">

          {activeTab === 'consents' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-slate-800">
                <span className="font-bold text-gray-500 text-[11px] uppercase tracking-wider">
                  Notice Language:
                </span>
                <select
                  value={noticeLanguage}
                  onChange={(e) => setNoticeLanguage(e.target.value as any)}
                  className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                >
                  <option value="en">English (English)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="kn">Kannada (ಕನ್ನಡ)</option>
                  <option value="ml">Malayalam (മലയാളം)</option>
                </select>
              </div>

              {DPDP_CONSENT_PURPOSES.map(p => {
                const isGranted = consents[p.id]?.granted || false;
                return (
                  <div 
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            p.category === 'Critical Emergency' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {p.category}
                          </span>
                          <p className="font-bold text-gray-900 dark:text-white text-xs">{p.title}</p>
                        </div>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                          {p.purposeDescription}
                        </p>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                        <input 
                          type="checkbox" 
                          checked={isGranted} 
                          onChange={() => handleToggleConsent(p.id)}
                          className="sr-only peer" 
                        />
                        <div className="w-10 h-5 bg-gray-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="pt-1.5 border-t border-gray-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-gray-500">
                      <span>Data: {p.dataItemsCollected.join(', ')}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {isGranted ? '✓ Consented' : 'Withdrawn'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-2">
              <p className="text-[11px] text-gray-500 mb-2">
                Immutable chronological log of all affirmative consent grants and revocations:
              </p>
              {history.map(item => (
                <div 
                  key={item.id}
                  className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-xs">
                      {item.purposeId.replace(/_/g, ' ').toUpperCase()}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Version: {item.noticeVersion} • {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    item.action === 'granted' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {item.action}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'dpo' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center gap-2 font-black text-emerald-900 dark:text-emerald-200 text-sm">
                  <Building size={18} />
                  <span>Statutory Grievance Redressal</span>
                </div>
                <p className="text-xs text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
                  Under Section 13 of the Digital Personal Data Protection Act, 2023, data principals have the right to register complaints regarding data processing.
                </p>

                <div className="space-y-2 pt-2 border-t border-emerald-200 dark:border-emerald-800 text-xs text-gray-800 dark:text-gray-200">
                  <p><strong>Grievance Officer:</strong> {STATUTORY_DPO.name}</p>
                  <p><strong>Designation:</strong> {STATUTORY_DPO.designation}</p>
                  <p className="flex items-center gap-1.5">
                    <Mail size={14} className="text-emerald-600" />
                    <a href={`mailto:${STATUTORY_DPO.email}`} className="text-blue-600 underline">
                      {STATUTORY_DPO.email}
                    </a>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone size={14} className="text-emerald-600" />
                    <span>{STATUTORY_DPO.phone}</span>
                  </p>
                  <p><strong>Address:</strong> {STATUTORY_DPO.address}</p>
                  <p className="text-[11px] text-gray-500 pt-1">
                    Statutory Grievance Resolution SLA: Maximum <strong>{STATUTORY_DPO.resolutionTimelineDays} calendar days</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'erasure' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-900 space-y-3">
                <div className="flex items-center gap-2 font-black text-red-700 dark:text-red-300 text-sm">
                  <Trash2 size={18} />
                  <span>Right to Erasure (DPDP Act Sec 12)</span>
                </div>
                <p className="text-xs text-red-900/80 dark:text-red-300/80 leading-relaxed">
                  Executing complete erasure will permanently and irreversibly purge all your clinical records, lab documents, vital history, prescriptions, family circle records, and emergency QR tokens from this device and cloud repositories.
                </p>

                {erasureSuccess ? (
                  <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl font-bold text-center">
                    ✓ All personal health data has been permanently erased. Redirecting...
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={erasureConfirmed}
                        onChange={(e) => setErasureConfirmed(e.target.checked)}
                        className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                      />
                      <span className="text-[11px] text-red-950 dark:text-red-200 font-bold">
                        I solemnly attest that I wish to permanently delete all my medical and personal data under the DPDP Act Right to Erasure.
                      </span>
                    </label>

                    <button
                      onClick={handleExecuteErasure}
                      disabled={!erasureConfirmed}
                      className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40"
                    >
                      <Trash2 size={16} /> Permanently Erase All Data Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ConsentManagerModal;
