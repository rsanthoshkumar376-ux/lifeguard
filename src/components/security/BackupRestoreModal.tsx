import React, { useState } from 'react';
import { 
  X, Download, Upload, ShieldCheck, Lock, CheckCircle2, 
  AlertTriangle, RefreshCw, FileText, Check 
} from 'lucide-react';
import { 
  createEncryptedBackup, 
  downloadBackupFile, 
  restoreEncryptedBackup, 
  RestorationReport 
} from '../../services/backupRecoveryService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onRestorationComplete: () => void;
}

export const BackupRestoreModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userId,
  onRestorationComplete
}) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'restore'>('backup');
  
  // Backup state
  const [backupPassphrase, setBackupPassphrase] = useState('');
  const [backupConfirmPass, setBackupConfirmPass] = useState('');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [backupError, setBackupError] = useState('');

  // Restore state
  const [restoreFileContent, setRestoreFileContent] = useState<string | null>(null);
  const [restoreFileName, setRestoreFileName] = useState<string>('');
  const [restorePassphrase, setRestorePassphrase] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreReport, setRestoreReport] = useState<RestorationReport | null>(null);
  const [restoreError, setRestoreError] = useState('');

  if (!isOpen) return null;

  const handleCreateBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackupError('');

    if (backupPassphrase.length < 8) {
      setBackupError('Passphrase must be at least 8 characters long.');
      return;
    }
    if (backupPassphrase !== backupConfirmPass) {
      setBackupError('Passphrases do not match.');
      return;
    }

    setIsBackingUp(true);
    try {
      const backupPackageString = await createEncryptedBackup(userId, backupPassphrase);
      downloadBackupFile(backupPackageString, userId);
      setBackupSuccess(true);
      setBackupPassphrase('');
      setBackupConfirmPass('');
    } catch (err: any) {
      setBackupError(err?.message || 'Failed to generate encrypted backup.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestoreError('');
    setRestoreReport(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setRestoreFileContent(event.target?.result as string);
    };
    reader.onerror = () => {
      setRestoreError('Failed reading selected file.');
    };
    reader.readAsText(file);
  };

  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreFileContent) {
      setRestoreError('Please select a LifeGuard .enc.json backup file.');
      return;
    }
    if (!restorePassphrase) {
      setRestoreError('Please enter the decryption passphrase for this archive.');
      return;
    }

    setIsRestoring(true);
    setRestoreError('');
    try {
      const report = await restoreEncryptedBackup(restoreFileContent, restorePassphrase);
      setRestoreReport(report);
      onRestorationComplete();
    } catch (err: any) {
      setRestoreError(err?.message || 'Restoration failed.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-blue-300">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-base font-black">Encrypted Backup & Restore</h2>
              <p className="text-[11px] text-blue-200">AES-GCM 256-Bit Disaster Recovery</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1.5 bg-gray-100 dark:bg-slate-800 m-4 rounded-2xl">
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'backup'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <Download size={14} /> Create Backup
          </button>
          <button
            onClick={() => setActiveTab('restore')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'restore'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <Upload size={14} /> Restore from File
          </button>
        </div>

        {/* Body */}
        <div className="p-5 pt-0 overflow-y-auto space-y-4 text-sm text-gray-800 dark:text-gray-200">
          
          {activeTab === 'backup' ? (
            <form onSubmit={handleCreateBackup} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
                Exports all your clinical reports, vitals, medications, family circle state, and emergency card data into a portable archive encrypted with your custom passphrase.
              </div>

              {backupSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Encrypted backup downloaded successfully! Keep your passphrase safe.</span>
                </div>
              )}

              {backupError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-600 shrink-0" />
                  <span>{backupError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Encryption Passphrase *
                </label>
                <input
                  type="password"
                  value={backupPassphrase}
                  onChange={(e) => setBackupPassphrase(e.target.value)}
                  placeholder="Min 8 characters (letters, numbers)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Confirm Passphrase *
                </label>
                <input
                  type="password"
                  value={backupConfirmPass}
                  onChange={(e) => setBackupConfirmPass(e.target.value)}
                  placeholder="Re-enter passphrase"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isBackingUp}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                {isBackingUp ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Encrypting & Packaging Archive...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Download Encrypted Archive</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRestore} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                Select an authentic LifeGuard <code>.enc.json</code> archive and provide its passphrase to restore your records.
              </div>

              {restoreError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-600 shrink-0" />
                  <span>{restoreError}</span>
                </div>
              )}

              {restoreReport && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2 text-xs text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-center gap-2 font-black text-sm">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <span>Archive Restored Successfully!</span>
                  </div>
                  <p>Restored <strong>{restoreReport.recordsCount}</strong> records across:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                    {restoreReport.categoriesRestored.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Select Backup File (.enc.json)
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {restoreFileName && (
                  <p className="text-[11px] text-gray-500 mt-1">Loaded: {restoreFileName}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Decryption Passphrase *
                </label>
                <input
                  type="password"
                  value={restorePassphrase}
                  onChange={(e) => setRestorePassphrase(e.target.value)}
                  placeholder="Enter archive passphrase"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isRestoring || !restoreFileContent}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                {isRestoring ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Decrypting & Validating Archive...</span>
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    <span>Restore Clinical Data</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};

export default BackupRestoreModal;
