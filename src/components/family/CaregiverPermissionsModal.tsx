import React, { useState } from 'react';
import { 
  X, ShieldCheck, Check, AlertTriangle, Lock, 
  FileText, Pill, Calendar, ShieldAlert, HeartPulse, Trash2
} from 'lucide-react';
import { 
  CaregiverPermissions, 
  grantOrUpdateCaregiverPermissions, 
  revokeCaregiverPermissions, 
  FamilyRelation 
} from '../../services/familyCircleService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ownerUserId: string;
  ownerName: string;
  initialPermission?: CaregiverPermissions | null;
  availableCaregivers: Array<{ userId: string; name: string; phone: string; email?: string; relation: FamilyRelation }>;
  onPermissionSaved: (perm: CaregiverPermissions) => void;
  onPermissionRevoked?: (permId: string) => void;
}

export const CaregiverPermissionsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  ownerUserId,
  ownerName,
  initialPermission,
  availableCaregivers,
  onPermissionSaved,
  onPermissionRevoked
}) => {
  const [selectedCaregiverId, setSelectedCaregiverId] = useState(
    initialPermission?.caregiverUserId || (availableCaregivers[0]?.userId || '')
  );
  const [canViewMedicalId, setCanViewMedicalId] = useState(initialPermission?.canViewMedicalId ?? true);
  const [canViewMedicineSchedule, setCanViewMedicineSchedule] = useState(initialPermission?.canViewMedicineSchedule ?? true);
  const [canViewHealthRecords, setCanViewHealthRecords] = useState(initialPermission?.canViewHealthRecords ?? false);
  const [canViewAppointments, setCanViewAppointments] = useState(initialPermission?.canViewAppointments ?? true);
  const [canReceiveSosAlerts, setCanReceiveSosAlerts] = useState(initialPermission?.canReceiveSosAlerts ?? true);
  const [canManageMedications, setCanManageMedications] = useState(initialPermission?.canManageMedications ?? false);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [notes, setNotes] = useState(initialPermission?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const activeCaregiver = availableCaregivers.find(c => c.userId === selectedCaregiverId) || {
    userId: initialPermission?.caregiverUserId || 'unknown',
    name: initialPermission?.caregiverName || 'Caregiver',
    phone: initialPermission?.caregiverPhone || '',
    email: initialPermission?.caregiverEmail,
    relation: initialPermission?.relation || 'Caregiver'
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentConfirmed) {
      alert('You must check the explicit consent checkbox to authorize caregiver access.');
      return;
    }

    setIsSubmitting(true);
    try {
      const saved = await grantOrUpdateCaregiverPermissions(
        {
          ownerUserId,
          ownerName,
          caregiverUserId: activeCaregiver.userId,
          caregiverName: activeCaregiver.name,
          caregiverPhone: activeCaregiver.phone,
          caregiverEmail: activeCaregiver.email,
          relation: activeCaregiver.relation,
          canViewMedicalId,
          canViewMedicineSchedule,
          canViewHealthRecords,
          canViewAppointments,
          canReceiveSosAlerts,
          canManageMedications,
          notes: notes.trim() || undefined
        },
        ownerUserId
      );
      onPermissionSaved(saved);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save caregiver permissions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async () => {
    if (!initialPermission?.id) return;
    if (window.confirm(`Revoke all caregiver permissions for ${initialPermission.caregiverName}? They will immediately lose access to your records.`)) {
      setIsSubmitting(true);
      try {
        await revokeCaregiverPermissions(initialPermission.id, ownerUserId);
        if (onPermissionRevoked) onPermissionRevoked(initialPermission.id);
        onClose();
      } catch (err) {
        console.error(err);
        alert('Failed to revoke permissions.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Caregiver Permission Controls</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Explicit granular health authorization for {ownerName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          
          {/* Caregiver Selection */}
          {!initialPermission && availableCaregivers.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Select Family Caregiver *
              </label>
              <select
                value={selectedCaregiverId}
                onChange={(e) => setSelectedCaregiverId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {availableCaregivers.map(cg => (
                  <option key={cg.userId} value={cg.userId}>
                    {cg.name} ({cg.relation}) • {cg.phone}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Granular Permission Checklist */}
          <div>
            <span className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Authorize Selected Information Categories:
            </span>
            <div className="space-y-2">
              
              {/* Emergency Medical ID */}
              <label className="flex items-start gap-3 p-3 rounded-2xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={canViewMedicalId}
                  onChange={(e) => setCanViewMedicalId(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <HeartPulse size={14} className="text-red-500" />
                    <span className="text-xs font-bold text-gray-900 dark:text-white">Emergency Medical ID</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Blood group, critical allergies, chronic conditions, and emergency physician orders.
                  </p>
                </div>
              </label>

              {/* Medicine Schedule */}
              <label className="flex items-start gap-3 p-3 rounded-2xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={canViewMedicineSchedule}
                  onChange={(e) => setCanViewMedicineSchedule(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <Pill size={14} className="text-blue-500" />
                    <span className="text-xs font-bold text-gray-900 dark:text-white">Medicine Schedule & Dosing</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Daily prescribed medicines, meal timings, dose logs (taken/missed/pending), and refill alerts.
                  </p>
                </div>
              </label>

              {/* Medication Management Authority */}
              <label className="flex items-start gap-3 p-3 rounded-2xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors bg-blue-50/20 dark:bg-blue-950/10">
                <input
                  type="checkbox"
                  checked={canManageMedications}
                  onChange={(e) => setCanManageMedications(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-indigo-500" />
                    <span className="text-xs font-bold text-gray-900 dark:text-white">Medication Administration Authority</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Allows caregiver to log doses as "Taken" or "Skipped" on behalf of senior citizen or child.
                  </p>
                </div>
              </label>

              {/* Health Records */}
              <label className="flex items-start gap-3 p-3 rounded-2xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={canViewHealthRecords}
                  onChange={(e) => setCanViewHealthRecords(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <FileText size={14} className="text-teal-500" />
                    <span className="text-xs font-bold text-gray-900 dark:text-white">Digital Health Records & Lab Reports</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Diagnostic PDFs, blood lab tests, discharge summaries, and historical health timeline.
                  </p>
                </div>
              </label>

              {/* Appointment Details */}
              <label className="flex items-start gap-3 p-3 rounded-2xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={canViewAppointments}
                  onChange={(e) => setCanViewAppointments(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-purple-500" />
                    <span className="text-xs font-bold text-gray-900 dark:text-white">Hospital Appointments</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Scheduled clinic visits, consulting physician credentials, reason for visit, and reminders.
                  </p>
                </div>
              </label>

              {/* SOS Notifications */}
              <label className="flex items-start gap-3 p-3 rounded-2xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={canReceiveSosAlerts}
                  onChange={(e) => setCanReceiveSosAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-rose-500" />
                    <span className="text-xs font-bold text-gray-900 dark:text-white">Emergency SOS & Live GPS</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Real-time accident/fall triggers, temporary live location tracking, and emergency timeline updates.
                  </p>
                </div>
              </label>

            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Caregiving Scope Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Authorized to oversee mother's cardiology prescriptions and ER dispatch."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Explicit Consent Declaration */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consentConfirmed}
                onChange={(e) => setConsentConfirmed(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 mt-0.5 shrink-0"
              />
              <span className="text-[11px] text-amber-900 dark:text-amber-200 font-semibold leading-relaxed">
                <strong>Explicit Patient Consent:</strong> I confirm that I am explicitly authorizing <strong>{activeCaregiver.name}</strong> to access ONLY the checked categories above. I understand that I can revoke this access at any time, and an immutable access audit log will be recorded.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            {initialPermission?.status === 'active' ? (
              <button
                type="button"
                onClick={handleRevoke}
                disabled={isSubmitting}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Revoke Access</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !consentConfirmed}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <ShieldCheck size={14} />
                <span>{isSubmitting ? 'Saving...' : 'Authorize Caregiver'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

export default CaregiverPermissionsModal;
