import React, { useState } from 'react';
import { Smartphone, Radio, CheckCircle2, AlertTriangle, QrCode, Copy, Check, Shield } from 'lucide-react';
import { writeEmergencyNfcTag } from '../../services/emergencyToken';

interface NfcWriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicEmergencyUrl: string;
}

export const NfcWriterModal: React.FC<NfcWriterModalProps> = ({
  isOpen,
  onClose,
  publicEmergencyUrl
}) => {
  const [isWriting, setIsWriting] = useState(false);
  const [writeStatus, setWriteStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const isWebNfcSupported = typeof window !== 'undefined' && 'NDEFReader' in window;

  const handleWriteNfc = async () => {
    setIsWriting(true);
    setWriteStatus('idle');
    setStatusMessage('Hold your NFC tag or wristband firmly against the back of your phone...');

    const result = await writeEmergencyNfcTag(publicEmergencyUrl);
    setIsWriting(false);
    if (result.success) {
      setWriteStatus('success');
      setStatusMessage(result.message);
    } else {
      setWriteStatus('error');
      setStatusMessage(result.message);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicEmergencyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer"
          >
            ✕
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📶</span>
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-200">
              TAP-TO-SCAN HARDWARE
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Radio size={24} className="animate-pulse" />
            NFC Medical Tag Writer
          </h2>
          <p className="text-xs text-purple-100 mt-0.5">
            Link an NFC keychain, sticker, or smart wristband to your emergency medical profile
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-gray-800 dark:text-gray-200">
          
          {/* Hardware & Browser Support Check */}
          {isWebNfcSupported ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs text-emerald-900 dark:text-emerald-200">
                <span className="font-bold block">Web NFC Supported on This Device</span>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Your device and browser can write your public emergency URL directly onto any standard NTAG213/215/216 NFC tag.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs text-amber-900 dark:text-amber-200">
                <span className="font-bold block">Web NFC Limited on This Browser</span>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  Direct in-browser NFC writing is only supported on Android using Chrome 89+. iOS Safari and desktop browsers do not allow Web NFC writes. You can copy your emergency URL below and write it via third-party NFC tools (like NFC Tools app) or use your high-contrast QR code.
                </p>
              </div>
            </div>
          )}

          {/* Target Emergency URL Card */}
          <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Public Emergency URL to be Written:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicEmergencyUrl}
                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-gray-700 dark:text-gray-300 select-all"
              />
              <button
                onClick={handleCopyUrl}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* NFC Writer Action Trigger */}
          {isWebNfcSupported && (
            <div className="space-y-3">
              <button
                onClick={handleWriteNfc}
                disabled={isWriting}
                className={`w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  isWriting
                    ? 'bg-purple-400 text-white cursor-wait animate-pulse'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/30 active:scale-95'
                }`}
              >
                <Radio size={20} className={isWriting ? 'animate-spin' : ''} />
                {isWriting ? 'Ready to Tap NFC Tag...' : 'WRITE TO NFC TAG NOW'}
              </button>

              {statusMessage && (
                <div className={`p-3.5 rounded-2xl text-xs font-bold text-center border ${
                  writeStatus === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200'
                    : writeStatus === 'error'
                    ? 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200'
                }`}>
                  {statusMessage}
                </div>
              )}
            </div>
          )}

          {/* Third-Party & Fallback Instructions */}
          <div className="bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-gray-200 dark:border-slate-700/60 text-xs text-gray-600 dark:text-gray-300 space-y-2">
            <span className="font-bold text-gray-900 dark:text-white block flex items-center gap-1.5">
              <Smartphone size={15} /> How to program with any phone or NFC Tag:
            </span>
            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
              <li>Copy your emergency URL using the copy button above.</li>
              <li>Install a free NFC writer app (such as <em>NFC Tools</em> on Google Play or iOS App Store).</li>
              <li>Select <strong>Write $\rightarrow$ Add a record $\rightarrow$ URL</strong>, paste your LifeGuard emergency link, and tap your tag.</li>
              <li>Anyone who taps their phone against your tag will instantly view your emergency medical ID without downloading any app.</li>
            </ol>
          </div>

          {/* Honest Technical Limitation Disclaimer */}
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] text-gray-500 dark:text-gray-400 space-y-1">
            <span className="font-bold block uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Hardware Compatibility Disclaimer:
            </span>
            <p>
              Not all smartphones have NFC enabled by default. iPhones (XR and newer) and modern Android phones scan NFC passively from the background, while older models require manual NFC enabling in settings. Your printable QR code serves as an instant zero-dependency fallback for any camera.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
