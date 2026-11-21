import React, { useState, useId } from 'react';
import { 
  X, Calendar, Clock, Hospital, Stethoscope, FileText, Bell, 
  CheckCircle2, AlertCircle, Building, Plus
} from 'lucide-react';
import { 
  HospitalAppointment, 
  addHospitalAppointment 
} from '../../services/medicineAppointmentService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
}

const COMMON_SPECIALTIES = [
  'General Medicine',
  'Cardiology',
  'Endocrinology & Diabetology',
  'Pulmonology & Respiratory Care',
  'Orthopedics & Joint Replacement',
  'Gastroenterology',
  'Neurology',
  'Nephrology',
  'Dermatology',
  'Ophthalmology',
  'ENT (Otolaryngology)',
  'Pediatrics',
  'Oncology'
];

const SUGGESTED_HOSPITALS = [
  'Apollo Specialty Hospitals, Chennai',
  'Kauvery Hospital, Alwarpet',
  'Government General Hospital (RGGGH)',
  'Fortis Malar Hospital, Adyar',
  'Gleneagles Global Health City',
  'MIOT International, Manapakkam',
  'SIMS Hospital, Vadapalani'
];

export const AddAppointmentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaved,
  userId
}) => {
  const [hospital, setHospital] = useState(SUGGESTED_HOSPITALS[0]);
  const [customHospital, setCustomHospital] = useState('');
  const [doctor, setDoctor] = useState('');
  const [specialty, setSpecialty] = useState(COMMON_SPECIALTIES[0]);
  const [appointmentDate, setAppointmentDate] = useState(
    new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [appointmentTime, setAppointmentTime] = useState('10:30');
  const [reason, setReason] = useState('');
  const [reportInput, setReportInput] = useState('');
  const [attachedReports, setAttachedReports] = useState<string[]>([
    'Apollo_Diagnostics_HbA1c_Oct2026.pdf'
  ]);
  const [reminder1DayBefore, setReminder1DayBefore] = useState(true);
  const [reminder2HoursBefore, setReminder2HoursBefore] = useState(true);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate unique IDs
  const hospSelectId = useId();
  const hospCustomId = useId();
  const docId = useId();
  const specId = useId();
  const dateId = useId();
  const timeId = useId();
  const reasonId = useId();
  const reportId = useId();
  const notesId = useId();

  if (!isOpen) return null;

  const handleAddReport = () => {
    if (reportInput.trim() && !attachedReports.includes(reportInput.trim())) {
      setAttachedReports([...attachedReports, reportInput.trim()]);
      setReportInput('');
    }
  };

  const handleRemoveReport = (nameToRemove: string) => {
    setAttachedReports(attachedReports.filter(r => r !== nameToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalHospital = hospital === 'Other' ? customHospital.trim() : hospital;
    if (!finalHospital || !doctor.trim() || !reason.trim()) {
      alert('Please fill in the hospital, doctor, and visit reason.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addHospitalAppointment({
        hospital: finalHospital,
        doctor: doctor.trim(),
        specialty,
        appointmentDate,
        appointmentTime,
        reason: reason.trim(),
        status: 'scheduled',
        attachedReportTitles: attachedReports.length > 0 ? attachedReports : undefined,
        reminder1DayBefore,
        reminder2HoursBefore,
        consultationNotes: consultationNotes.trim() || undefined
      }, userId);

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to schedule appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Calendar size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Schedule Doctor Appointment</h2>
              <p className="text-xs text-gray-500">Hospital visit booking, report linking & follow-up reminders</p>
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
          {/* Hospital Selection */}
          <div>
            <label htmlFor={hospSelectId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Hospital size={14} className="text-blue-600" /> Hospital / Healthcare Facility *
            </label>
            <select
              id={hospSelectId}
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SUGGESTED_HOSPITALS.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
              <option value="Other">Other / Custom Clinic</option>
            </select>
          </div>

          {hospital === 'Other' && (
            <div>
              <label htmlFor={hospCustomId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Enter Hospital or Clinic Name *
              </label>
              <input
                id={hospCustomId}
                type="text"
                placeholder="e.g. City Health Clinic, Greams Road"
                value={customHospital}
                onChange={(e) => setCustomHospital(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Doctor Name & Specialty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor={docId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Stethoscope size={14} className="text-teal-600" /> Attending Doctor *
              </label>
              <input
                id={docId}
                type="text"
                placeholder="e.g. Dr. K. Swaminathan, MD DM"
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor={specId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Medical Specialty *
              </label>
              <select
                id={specId}
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
              >
                {COMMON_SPECIALTIES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={dateId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Appointment Date *
              </label>
              <input
                id={dateId}
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-bold outline-none"
              />
            </div>

            <div>
              <label htmlFor={timeId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Time Slot *
              </label>
              <input
                id={timeId}
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-bold outline-none"
              />
            </div>
          </div>

          {/* Reason for Visit */}
          <div>
            <label htmlFor={reasonId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Reason for Visit / Clinical Symptoms *
            </label>
            <input
              id={reasonId}
              type="text"
              placeholder="e.g. Quarterly diabetes follow-up & HbA1c review; BP medication titration"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Attach Previous Reports */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-gray-200 dark:border-slate-800">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText size={14} className="text-indigo-600" /> Attached Diagnostic Reports & Previous Records
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {attachedReports.map(rep => (
                <span
                  key={rep}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl text-[11px] font-bold text-indigo-700 dark:text-indigo-300"
                >
                  📄 {rep}
                  <button
                    type="button"
                    onClick={() => handleRemoveReport(rep)}
                    className="hover:text-red-500 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                id={reportId}
                type="text"
                placeholder="Attach report file title (e.g. CBC_Test_Nov2026.pdf)"
                value={reportInput}
                onChange={(e) => setReportInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddReport();
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none"
              />
              <button
                type="button"
                onClick={handleAddReport}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
              >
                Attach
              </button>
            </div>
          </div>

          {/* Follow-up Reminders */}
          <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-2xl space-y-2">
            <label className="block text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
              <Bell size={14} className="text-blue-600" /> Automatic Follow-Up Reminders
            </label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminder1DayBefore}
                  onChange={(e) => setReminder1DayBefore(e.target.checked)}
                  className="rounded text-blue-600"
                />
                Remind 1 day before (at 09:00 AM)
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminder2HoursBefore}
                  onChange={(e) => setReminder2HoursBefore(e.target.checked)}
                  className="rounded text-blue-600"
                />
                Remind 2 hours before scheduled slot
              </label>
            </div>
          </div>

          {/* Consultation Notes / Instructions */}
          <div>
            <label htmlFor={notesId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Preparatory Instructions / Fasting Notes (Optional)
            </label>
            <textarea
              id={notesId}
              rows={2}
              placeholder="e.g. Fast 10 hours prior for fasting blood sugar test; bring recent ECG graph"
              value={consultationNotes}
              onChange={(e) => setConsultationNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none"
            />
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black shadow-md hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
