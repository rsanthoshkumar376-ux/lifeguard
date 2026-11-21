import React, { useState } from 'react';
import { X, RefreshCw, AlertTriangle, CheckCircle2, Pill, Plus } from 'lucide-react';
import { MedicationSchedule, refillMedicationStock } from '../../services/medicineAppointmentService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  medications: MedicationSchedule[];
  onRefilled: () => void;
  userId?: string;
}

export const RefillManageModal: React.FC<Props> = ({
  isOpen,
  onClose,
  medications,
  onRefilled,
  userId
}) => {
  const [selectedMedId, setSelectedMedId] = useState(medications[0]?.id || '');
  const [refillCount, setRefillCount] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRefill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedId || refillCount <= 0) return;

    setIsSubmitting(true);
    try {
      await refillMedicationStock(selectedMedId, refillCount, userId);
      onRefilled();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to update refill stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow">
              <RefreshCw size={18} />
            </div>
            <div>
              <h3 className="font-black text-sm text-gray-900 dark:text-white">Pharmacy Refill Manager</h3>
              <p className="text-[11px] text-gray-500">Log prescription refill & adjust pill stock</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-gray-900 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleRefill} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Select Medication
            </label>
            <select
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold outline-none text-gray-900 dark:text-white"
            >
              {medications.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.currentStock} remaining)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Refill Quantity (Pills / Doses Received)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="500"
                value={refillCount}
                onChange={(e) => setRefillCount(Number(e.target.value))}
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-black text-lg text-center"
              />
              <div className="flex gap-1">
                {[15, 30, 60, 90].map(cnt => (
                  <button
                    type="button"
                    key={cnt}
                    onClick={() => setRefillCount(cnt)}
                    className="px-2.5 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-xs font-bold hover:bg-gray-200"
                  >
                    +{cnt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Current Inventory Summary */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-1.5 text-xs">
            <p className="font-bold text-gray-800 dark:text-gray-200 text-[11px] uppercase tracking-wider">
              Current Inventory Status
            </p>
            {medications.map(m => {
              const isLow = m.currentStock <= m.refillThreshold;
              return (
                <div key={m.id} className="flex items-center justify-between py-1">
                  <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[200px]">
                    {m.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`font-black ${isLow ? 'text-amber-600' : 'text-gray-900 dark:text-white'}`}>
                      {m.currentStock} left
                    </span>
                    {isLow && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[9px] font-black uppercase">
                        Refill Needed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus size={14} /> Add to Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
