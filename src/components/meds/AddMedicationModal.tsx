import React, { useState, useId } from 'react';
import { 
  X, Pill, Clock, Calendar, ShieldCheck, Stethoscope, Building, 
  AlertCircle, Plus, Trash2, CheckCircle2, Bell, FileText
} from 'lucide-react';
import { 
  MedicationSchedule, 
  MedicationFrequency, 
  MealTiming, 
  addMedication, 
  updateMedication 
} from '../../services/medicineAppointmentService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  medicationToEdit?: MedicationSchedule | null;
  userId?: string;
}

export const AddMedicationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaved,
  medicationToEdit,
  userId
}) => {
  const isEditing = !!medicationToEdit;

  const [name, setName] = useState(medicationToEdit?.name || '');
  const [dosage, setDosage] = useState(medicationToEdit?.dosage || '1 tablet (500 mg)');
  const [frequency, setFrequency] = useState<MedicationFrequency>(medicationToEdit?.frequency || 'twice_daily');
  const [mealTiming, setMealTiming] = useState<MealTiming>(medicationToEdit?.mealTiming || 'after_meal');
  const [startDate, setStartDate] = useState(medicationToEdit?.startDate || new Date().toISOString().split('T')[0]);
  const [isOngoing, setIsOngoing] = useState(medicationToEdit?.isOngoing ?? true);
  const [endDate, setEndDate] = useState(medicationToEdit?.endDate || '');
  const [reminderTimes, setReminderTimes] = useState<string[]>(
    medicationToEdit?.reminderTimes || ['08:00', '20:00']
  );
  const [timeInput, setTimeInput] = useState('12:00');
  const [prescribingDoctor, setPrescribingDoctor] = useState(medicationToEdit?.prescribingDoctor || '');
  const [hospitalOrClinic, setHospitalOrClinic] = useState(medicationToEdit?.hospitalOrClinic || '');
  const [prescriptionDocName, setPrescriptionDocName] = useState(medicationToEdit?.prescriptionDocName || '');
  const [currentStock, setCurrentStock] = useState<number>(medicationToEdit?.currentStock ?? 30);
  const [refillThreshold, setRefillThreshold] = useState<number>(medicationToEdit?.refillThreshold ?? 5);
  const [verificationStatus, setVerificationStatus] = useState<'doctor_verified' | 'user_entered'>(
    medicationToEdit?.verificationStatus || 'doctor_verified'
  );
  const [instructions, setInstructions] = useState(medicationToEdit?.instructions || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate unique form IDs
  const nameId = useId();
  const dosageId = useId();
  const freqId = useId();
  const mealId = useId();
  const startId = useId();
  const endId = useId();
  const doctorId = useId();
  const hospitalId = useId();
  const rxDocId = useId();
  const stockId = useId();
  const refillId = useId();
  const statusId = useId();
  const notesId = useId();

  if (!isOpen) return null;

  const handleFrequencyChange = (newFreq: MedicationFrequency) => {
    setFrequency(newFreq);
    if (newFreq === 'once_daily') {
      setReminderTimes(['08:00']);
    } else if (newFreq === 'twice_daily') {
      setReminderTimes(['08:00', '20:00']);
    } else if (newFreq === 'thrice_daily') {
      setReminderTimes(['08:00', '14:00', '20:00']);
    } else if (newFreq === 'every_8h') {
      setReminderTimes(['06:00', '14:00', '22:00']);
    } else if (newFreq === 'as_needed') {
      setReminderTimes([]);
    }
  };

  const handleAddTime = () => {
    if (timeInput && !reminderTimes.includes(timeInput)) {
      setReminderTimes([...reminderTimes, timeInput].sort());
    }
  };

  const handleRemoveTime = (tToRemove: string) => {
    setReminderTimes(reminderTimes.filter(t => t !== tToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) return;

    setIsSubmitting(true);
    try {
      const frequencyLabels: Record<MedicationFrequency, string> = {
        once_daily: 'Once Daily',
        twice_daily: 'Twice Daily (BID)',
        thrice_daily: 'Thrice Daily (TID)',
        every_8h: 'Every 8 Hours',
        as_needed: 'As Needed (PRN)',
        custom: 'Custom Schedule'
      };

      if (isEditing && medicationToEdit) {
        await updateMedication(medicationToEdit.id, {
          name: name.trim(),
          dosage: dosage.trim(),
          frequency,
          frequencyLabel: frequencyLabels[frequency],
          mealTiming,
          startDate,
          endDate: isOngoing ? undefined : endDate,
          isOngoing,
          reminderTimes,
          prescribingDoctor: prescribingDoctor.trim() || undefined,
          hospitalOrClinic: hospitalOrClinic.trim() || undefined,
          prescriptionDocName: prescriptionDocName.trim() || undefined,
          currentStock,
          refillThreshold,
          verificationStatus,
          instructions: instructions.trim() || undefined
        }, userId);
      } else {
        await addMedication({
          name: name.trim(),
          dosage: dosage.trim(),
          frequency,
          frequencyLabel: frequencyLabels[frequency],
          mealTiming,
          startDate,
          endDate: isOngoing ? undefined : endDate,
          isOngoing,
          reminderTimes,
          prescribingDoctor: prescribingDoctor.trim() || undefined,
          hospitalOrClinic: hospitalOrClinic.trim() || undefined,
          prescriptionDocName: prescriptionDocName.trim() || undefined,
          currentStock,
          refillThreshold,
          verificationStatus,
          instructions: instructions.trim() || undefined,
          isActive: true
        }, userId);
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save medication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-500/10 to-blue-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
              <Pill size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">
                {isEditing ? 'Edit Medication' : 'Add Prescribed Medication'}
              </h2>
              <p className="text-xs text-gray-500">Dosage, frequency, reminder intervals & refill stock</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Clinical Verification Trust Badge Selector */}
          <div className="p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-slate-800/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={20} className="text-blue-600 shrink-0" />
              <div>
                <label htmlFor={statusId} className="text-xs font-bold text-blue-900 dark:text-blue-200 block">
                  Prescription Verification Origin
                </label>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Differentiates certified doctor orders from personal user entries
                </p>
              </div>
            </div>
            <select
              id={statusId}
              value={verificationStatus}
              onChange={(e) => setVerificationStatus(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-gray-900 dark:text-white outline-none"
            >
              <option value="doctor_verified">Doctor-Verified Prescription</option>
              <option value="user_entered">User-Entered Schedule</option>
            </select>
          </div>

          {/* Medicine Name & Strength */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor={nameId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Medicine Name *
              </label>
              <input
                id={nameId}
                type="text"
                placeholder="e.g. Metformin, Telmisartan, Amoxicillin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label htmlFor={dosageId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Prescribed Dosage & Unit *
              </label>
              <input
                id={dosageId}
                type="text"
                placeholder="e.g. 500 mg (1 tablet), 5 ml, 2 puffs"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Frequency & Meal Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor={freqId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Frequency
              </label>
              <select
                id={freqId}
                value={frequency}
                onChange={(e) => handleFrequencyChange(e.target.value as MedicationFrequency)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="once_daily">Once Daily (1x/day)</option>
                <option value="twice_daily">Twice Daily (Morning & Night)</option>
                <option value="thrice_daily">Thrice Daily (TID)</option>
                <option value="every_8h">Every 8 Hours</option>
                <option value="as_needed">As Needed (PRN)</option>
                <option value="custom">Custom Reminder Times</option>
              </select>
            </div>

            <div>
              <label htmlFor={mealId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Meal Relationship
              </label>
              <select
                id={mealId}
                value={mealTiming}
                onChange={(e) => setMealTiming(e.target.value as MealTiming)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="after_meal">After Meal (30 min)</option>
                <option value="with_meal">With Meal / Food</option>
                <option value="before_meal">Before Meal (Empty Stomach)</option>
                <option value="anytime">Anytime / Independent</option>
              </select>
            </div>
          </div>

          {/* Reminder Times Configurator */}
          {frequency !== 'as_needed' && (
            <div className="bg-gray-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-gray-200 dark:border-slate-800">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Bell size={14} className="text-teal-600" /> Daily Dose Reminder Times
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {reminderTimes.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-800 rounded-xl text-xs font-black text-teal-700 dark:text-teal-300 shadow-xs"
                  >
                    <Clock size={12} /> {t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTime(t)}
                      className="hover:text-red-500 text-gray-400 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="time"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTime}
                  className="px-3 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 flex items-center gap-1"
                >
                  <Plus size={13} /> Add Time
                </button>
              </div>
            </div>
          )}

          {/* Schedule Duration (Start & End Dates) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor={startId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Start Date
              </label>
              <input
                id={startId}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor={endId} className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  End Date
                </label>
                <label className="text-[11px] font-bold text-teal-600 flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOngoing}
                    onChange={(e) => setIsOngoing(e.target.checked)}
                    className="rounded text-teal-600"
                  />
                  Ongoing / Chronic
                </label>
              </div>
              <input
                id={endId}
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isOngoing}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none disabled:opacity-40"
              />
            </div>
          </div>

          {/* Prescribing Doctor & Hospital */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor={doctorId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Prescribing Doctor (Optional)
              </label>
              <input
                id={doctorId}
                type="text"
                placeholder="e.g. Dr. K. Swaminathan, MD DM"
                value={prescribingDoctor}
                onChange={(e) => setPrescribingDoctor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none"
              />
            </div>

            <div>
              <label htmlFor={hospitalId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Hospital / Clinic (Optional)
              </label>
              <input
                id={hospitalId}
                type="text"
                placeholder="e.g. Apollo Specialty Hospitals"
                value={hospitalOrClinic}
                onChange={(e) => setHospitalOrClinic(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none"
              />
            </div>
          </div>

          {/* Attached Digital Prescription Name */}
          <div>
            <label htmlFor={rxDocId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Prescription Document Reference (Optional)
            </label>
            <input
              id={rxDocId}
              type="text"
              placeholder="e.g. Apollo_Prescription_Oct2026.pdf (from Health Records)"
              value={prescriptionDocName}
              onChange={(e) => setPrescriptionDocName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none"
            />
          </div>

          {/* Stock Tracking & Refill Alert */}
          <div className="grid grid-cols-2 gap-3 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900/40">
            <div>
              <label htmlFor={stockId} className="block text-xs font-bold text-amber-900 dark:text-amber-300 mb-1">
                Current Stock (Doses / Pills)
              </label>
              <input
                id={stockId}
                type="number"
                min="0"
                max="500"
                value={currentStock}
                onChange={(e) => setCurrentStock(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-800 font-black text-sm text-center"
              />
            </div>
            <div>
              <label htmlFor={refillId} className="block text-xs font-bold text-amber-900 dark:text-amber-300 mb-1">
                Refill Alert When At
              </label>
              <input
                id={refillId}
                type="number"
                min="1"
                max="50"
                value={refillThreshold}
                onChange={(e) => setRefillThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-800 font-black text-sm text-center"
              />
              <span className="text-[10px] text-amber-800 block text-center mt-1">Triggers refill alert</span>
            </div>
          </div>

          {/* Clinical Instructions / Notes */}
          <div>
            <label htmlFor={notesId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Instructions & Precautions (Optional)
            </label>
            <textarea
              id={notesId}
              rows={2}
              placeholder="e.g. Swallow whole with water. Avoid grapefruit juice. Store below 25°C."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none"
            />
          </div>

          {/* Mandatory Safety Notice */}
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 p-3 rounded-xl flex items-start gap-2.5 text-[11px] text-red-900 dark:text-red-300">
            <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Medical Safety Protocol:</span> LifeGuard strictly preserves exact prescribed dosages and will never automatically adjust medication quantities. Always verify changes with your physician.
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-black shadow-md hover:from-teal-700 hover:to-emerald-700 active:scale-95 transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Medication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
