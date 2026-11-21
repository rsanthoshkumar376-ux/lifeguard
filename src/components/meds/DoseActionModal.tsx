import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Clock, RotateCcw } from 'lucide-react';
import { MedicationDoseLog, DoseStatus, updateDoseStatus } from '../../services/medicineAppointmentService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dose: MedicationDoseLog | null;
  onUpdated: () => void;
  userId?: string;
}

const COMMON_SKIP_REASONS = [
  'Doctor instructed to pause today',
  'Required fasting for blood laboratory test',
  'Experienced mild stomach upset or nausea',
  'Forgot to carry dose while traveling',
  'Medication stock finished / awaiting refill',
  'Felt blood pressure / glucose was already very low'
];

export const DoseActionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  dose,
  onUpdated,
  userId
}) => {
  const [selectedAction, setSelectedAction] = useState<'take' | 'skip' | 'undo'>('take');
  const [skipReason, setSkipReason] = useState(COMMON_SKIP_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [customTime, setCustomTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !dose) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedAction === 'take') {
        const takenDate = new Date();
        const [h, m] = customTime.split(':').map(Number);
        takenDate.setHours(h, m, 0, 0);
        await updateDoseStatus(dose.id, 'taken', { takenAt: takenDate.toISOString() }, userId);
      } else if (selectedAction === 'skip') {
        const reason = skipReason === 'Other' ? customReason.trim() : skipReason;
        await updateDoseStatus(dose.id, 'skipped', { skippedReason: reason }, userId);
      } else if (selectedAction === 'undo') {
        await updateDoseStatus(dose.id, 'pending', {}, userId);
      }

      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to update dose status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-500/10 to-blue-500/10">
          <div>
            <h3 className="font-black text-sm text-gray-900 dark:text-white">Record Dose Action</h3>
            <p className="text-[11px] text-gray-500">{dose.medicationName} • {dose.dosage}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-gray-900 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Action Choice Pills */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedAction('take')}
              className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                selectedAction === 'take'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                  : 'bg-white dark:bg-slate-800 border-gray-200 text-gray-700 dark:text-gray-300'
              }`}
            >
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span>Mark Taken</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedAction('skip')}
              className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                selectedAction === 'skip'
                  ? 'bg-amber-50 border-amber-500 text-amber-800 dark:bg-amber-950 dark:text-amber-300 ring-2 ring-amber-500/20'
                  : 'bg-white dark:bg-slate-800 border-gray-200 text-gray-700 dark:text-gray-300'
              }`}
            >
              <AlertTriangle size={18} className="text-amber-600" />
              <span>Skip Dose</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedAction('undo')}
              className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                selectedAction === 'undo'
                  ? 'bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-950 dark:text-blue-300 ring-2 ring-blue-500/20'
                  : 'bg-white dark:bg-slate-800 border-gray-200 text-gray-700 dark:text-gray-300'
              }`}
            >
              <RotateCcw size={18} className="text-blue-600" />
              <span>Reset Pending</span>
            </button>
          </div>

          {/* TAKEN OPTION: Confirm Time */}
          {selectedAction === 'take' && (
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-3.5 rounded-2xl">
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1">
                Confirmed Taken Time
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-800 text-xs font-black outline-none"
                />
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  (Automatically decrements pill inventory by 1)
                </span>
              </div>
            </div>
          )}

          {/* SKIP OPTION: Reason Selection */}
          {selectedAction === 'skip' && (
            <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-3.5 rounded-2xl space-y-2">
              <label className="block text-xs font-bold text-amber-900 dark:text-amber-300">
                Reason for Skipping Dose
              </label>
              <select
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-800 text-xs font-semibold outline-none text-gray-900 dark:text-white"
              >
                {COMMON_SKIP_REASONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
                <option value="Other">Other Reason...</option>
              </select>

              {skipReason === 'Other' && (
                <input
                  type="text"
                  placeholder="Specify clinical reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white dark:bg-slate-800 text-xs outline-none"
                />
              )}
            </div>
          )}

          {/* UNDO OPTION */}
          {selectedAction === 'undo' && (
            <p className="text-xs text-gray-500 bg-gray-50 dark:bg-slate-800 p-3 rounded-xl">
              This will return this dose to <strong>Pending</strong> status in your daily schedule.
            </p>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-black shadow hover:opacity-90 active:scale-95 transition-all"
            >
              {isSubmitting ? 'Saving...' : 'Confirm Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
