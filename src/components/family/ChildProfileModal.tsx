import React, { useState } from 'react';
import { 
  X, Baby, ShieldAlert, Heart, Phone, School, 
  Stethoscope, AlertCircle, Check, Trash2 
} from 'lucide-react';
import { 
  ChildEmergencyProfile, 
  saveChildEmergencyProfile, 
  deleteChildProfile 
} from '../../services/familyCircleService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  guardianUserId: string;
  guardianName: string;
  initialProfile?: ChildEmergencyProfile | null;
  onProfileSaved: (profile: ChildEmergencyProfile) => void;
  onProfileDeleted?: (childId: string) => void;
}

export const ChildProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  guardianUserId,
  guardianName,
  initialProfile,
  onProfileSaved,
  onProfileDeleted
}) => {
  const [childName, setChildName] = useState(initialProfile?.childName || '');
  const [dob, setDob] = useState(initialProfile?.dob || '2018-05-14');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(initialProfile?.gender || 'Male');
  const [bloodGroup, setBloodGroup] = useState(initialProfile?.bloodGroup || 'B+');
  const [guardianRelation, setGuardianRelation] = useState<'Mother' | 'Father' | 'Legal Guardian'>(
    initialProfile?.guardianRelation || 'Father'
  );
  const [allergiesText, setAllergiesText] = useState(initialProfile?.allergies.join(', ') || '');
  const [conditionsText, setConditionsText] = useState(initialProfile?.criticalConditions.join(', ') || '');
  const [medicationsText, setMedicationsText] = useState(initialProfile?.currentMedications.join(', ') || '');
  const [schoolName, setSchoolName] = useState(initialProfile?.schoolOrDaycareName || '');
  const [schoolContact, setSchoolContact] = useState(initialProfile?.schoolContactNumber || '');
  const [pediatricianName, setPediatricianName] = useState(initialProfile?.pediatricianName || '');
  const [pediatricianPhone, setPediatricianPhone] = useState(initialProfile?.pediatricianPhone || '');
  const [emergencyInstructions, setEmergencyInstructions] = useState(initialProfile?.emergencyInstructions || '');
  const [consentConfirmed, setConsentConfirmed] = useState(initialProfile?.guardianConsentConfirmed ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim()) return;
    if (!consentConfirmed) {
      alert('Guardian consent declaration is required to manage a minor child profile.');
      return;
    }

    setIsSubmitting(true);
    try {
      const profile = await saveChildEmergencyProfile(
        {
          guardianUserId,
          guardianName,
          guardianRelation,
          guardianConsentConfirmed: true,
          childName: childName.trim(),
          dob,
          gender,
          bloodGroup,
          allergies: allergiesText.split(',').map(s => s.trim()).filter(Boolean),
          criticalConditions: conditionsText.split(',').map(s => s.trim()).filter(Boolean),
          currentMedications: medicationsText.split(',').map(s => s.trim()).filter(Boolean),
          schoolOrDaycareName: schoolName.trim() || undefined,
          schoolContactNumber: schoolContact.trim() || undefined,
          pediatricianName: pediatricianName.trim() || undefined,
          pediatricianPhone: pediatricianPhone.trim() || undefined,
          emergencyInstructions: emergencyInstructions.trim() || undefined
        },
        initialProfile?.childId,
        guardianUserId
      );

      onProfileSaved(profile);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save child emergency profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialProfile?.childId) return;
    if (window.confirm(`Delete emergency profile for ${initialProfile.childName}? This cannot be undone.`)) {
      setIsSubmitting(true);
      try {
        await deleteChildProfile(initialProfile.childId, guardianUserId);
        if (onProfileDeleted) onProfileDeleted(initialProfile.childId);
        onClose();
      } catch (err) {
        console.error(err);
        alert('Failed to delete profile.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Baby size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                {initialProfile ? 'Edit Child Emergency Profile' : 'Child & Pediatric Safety Profile'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Guardian authorized pediatric emergency ID</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Child Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Kumar"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Blood Group *
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Your Relation *
              </label>
              <select
                value={guardianRelation}
                onChange={(e) => setGuardianRelation(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Legal Guardian">Legal Guardian</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Pediatric Allergies (Comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Peanuts, Penicillin, Dust mites"
              value={allergiesText}
              onChange={(e) => setAllergiesText(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Critical Medical Conditions
            </label>
            <input
              type="text"
              placeholder="e.g. Mild Pediatric Asthma, Epilepsy, Febrile Seizures"
              value={conditionsText}
              onChange={(e) => setConditionsText(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Regular Medications
            </label>
            <input
              type="text"
              placeholder="e.g. Salbutamol Inhaler (100mcg as needed)"
              value={medicationsText}
              onChange={(e) => setMedicationsText(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* School & Pediatrician */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <School size={12} className="text-blue-500" />
                <span>School / Daycare Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Oakridge Primary"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Phone size={12} className="text-blue-500" />
                <span>School Contact Phone</span>
              </label>
              <input
                type="tel"
                placeholder="+91 44 2828 0000"
                value={schoolContact}
                onChange={(e) => setSchoolContact(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Stethoscope size={12} className="text-cyan-500" />
                <span>Pediatrician Name</span>
              </label>
              <input
                type="text"
                placeholder="Dr. Radhika Menon"
                value={pediatricianName}
                onChange={(e) => setPediatricianName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Phone size={12} className="text-cyan-500" />
                <span>Doctor Direct Phone</span>
              </label>
              <input
                type="tel"
                placeholder="+91 94444 11223"
                value={pediatricianPhone}
                onChange={(e) => setPediatricianPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Emergency Action Instructions (for Teachers / Paramedics)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. EpiPen kept in side pocket of backpack. If wheezing begins, administer 2 puffs immediately."
              value={emergencyInstructions}
              onChange={(e) => setEmergencyInstructions(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Legal Guardian Consent Attestation */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consentConfirmed}
                onChange={(e) => setConsentConfirmed(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5 shrink-0"
              />
              <span className="text-[11px] text-blue-900 dark:text-blue-200 font-semibold leading-relaxed">
                <strong>Parental / Guardian Consent:</strong> As legal parent or guardian ({guardianRelation}), I give explicit consent to store and manage this emergency pediatric profile under LifeGuard. This data is exclusively accessible by me and designated family circle emergency responders.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            {initialProfile?.childId ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Delete</span>
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
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>{isSubmitting ? 'Saving...' : 'Save Child Profile'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ChildProfileModal;
