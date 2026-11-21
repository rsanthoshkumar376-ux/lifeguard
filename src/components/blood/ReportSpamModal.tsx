import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { reportSpamOrFraud, blockUserOrDonor } from '../../services/donorDiscoveryService';

interface ReportSpamModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetName: string;
  targetType: 'donor' | 'request' | 'hospital';
  onBlocked?: () => void;
}

export const ReportSpamModal: React.FC<ReportSpamModalProps> = ({
  isOpen,
  onClose,
  targetId,
  targetName,
  targetType,
  onBlocked
}) => {
  const [reason, setReason] = useState('Commercial Blood Selling');
  const [details, setDetails] = useState('');
  const [blockUser, setBlockUser] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    reportSpamOrFraud({
      targetId,
      targetType,
      reason,
      details
    });

    if (blockUser) {
      blockUserOrDonor(targetId, reason);
      if (onBlocked) onBlocked();
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-red-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert size={22} className="text-white" />
            <h3 className="font-black text-base">Report & Safeguard</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="font-black text-gray-900 text-base">Report Submitted</h4>
            <p className="text-xs text-gray-600">
              Thank you for keeping LifeGuard safe. {blockUser ? `${targetName} has been blocked from your view.` : 'Our moderation team will review this report.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-gray-900">
            <div className="bg-red-50 p-3 rounded-2xl border border-red-100 text-xs text-red-900">
              <p>
                Commercial blood selling or solicitation of money for blood donations is strictly prohibited by law (National Blood Policy & Transfusion Act).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Target Entity</label>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs font-bold text-gray-800">
                {targetName} ({targetType.toUpperCase()})
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Reason for Report *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-gray-900 focus:bg-white"
              >
                <option value="Commercial Blood Selling">Demand for Money / Commercial Selling</option>
                <option value="Fake or Fraudulent Requirement">Fake Requisition / Fraudulent Case</option>
                <option value="Harassment or Abuse">Abusive Behavior or Harassment</option>
                <option value="Unreachable or False Number">Invalid Contact / Disconnected Phone</option>
                <option value="Other">Other Policy Violation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Additional Details (Optional)</label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what occurred..."
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:bg-white"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={blockUser}
                onChange={(e) => setBlockUser(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
              <span className="text-xs font-bold text-gray-700">Block this {targetType} from contacting me or showing on map</span>
            </label>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
