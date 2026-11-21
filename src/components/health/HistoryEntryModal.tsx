import React, { useState, useId } from 'react';
import { 
  X, Plus, FileText, AlertTriangle, ShieldCheck, HeartPulse, Scissors, Stethoscope, Users
} from 'lucide-react';
import { 
  PersonalMedicalHistory, 
  MedicalCondition, 
  SurgeryRecord, 
  AllergyRecord, 
  FamilyHistoryRecord, 
  ClinicalNote,
  updatePersonalHistory
} from '../../services/healthRecordsService';

type HistorySection = 'condition' | 'surgery' | 'allergy' | 'family' | 'note';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialSection?: HistorySection;
  currentHistory: PersonalMedicalHistory;
  userId?: string;
}

export const HistoryEntryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaved,
  initialSection = 'condition',
  currentHistory,
  userId
}) => {
  const [section, setSection] = useState<HistorySection>(initialSection);

  // Condition State
  const [conditionName, setConditionName] = useState('');
  const [conditionYear, setConditionYear] = useState(new Date().getFullYear().toString());
  const [conditionStatus, setConditionStatus] = useState<'active' | 'managed' | 'resolved'>('active');
  const [conditionSeverity, setConditionSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [conditionNotes, setConditionNotes] = useState('');

  // Surgery State
  const [surgeryProcedure, setSurgeryProcedure] = useState('');
  const [surgeryHospital, setSurgeryHospital] = useState('');
  const [surgeryYear, setSurgeryYear] = useState(new Date().getFullYear().toString());
  const [surgerySurgeon, setSurgerySurgeon] = useState('');
  const [surgeryComplications, setSurgeryComplications] = useState('');
  const [surgeryNotes, setSurgeryNotes] = useState('');

  // Allergy State
  const [allergen, setAllergen] = useState('');
  const [allergyReaction, setAllergyReaction] = useState('');
  const [allergySeverity, setAllergySeverity] = useState<'mild' | 'moderate' | 'severe' | 'life_threatening'>('moderate');
  const [allergyType, setAllergyType] = useState<'drug' | 'food' | 'environmental' | 'other'>('drug');

  // Family History State
  const [familyRelative, setFamilyRelative] = useState('');
  const [familyRelation, setFamilyRelation] = useState<'father' | 'mother' | 'sibling' | 'grandparent' | 'other'>('father');
  const [familyCondition, setFamilyCondition] = useState('');
  const [familyNotes, setFamilyNotes] = useState('');

  // Note State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('');
  const [noteDate, setNoteDate] = useState(new Date().toISOString().slice(0, 10));

  const [isSaving, setIsSaving] = useState(false);

  // Generate unique IDs for form controls
  const condNameId = useId();
  const condYearId = useId();
  const condStatusId = useId();
  const condSevId = useId();
  const condNotesId = useId();
  const surgProcId = useId();
  const surgHospId = useId();
  const surgYearId = useId();
  const surgSurgeonId = useId();
  const surgNotesId = useId();
  const allergenId = useId();
  const allTypeId = useId();
  const allSevId = useId();
  const allReactId = useId();
  const famRelId = useId();
  const famTypeId = useId();
  const famCondId = useId();
  const famNotesId = useId();
  const noteTitleId = useId();
  const noteDateId = useId();
  const noteAuthorId = useId();
  const noteContentId = useId();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (section === 'condition') {
        const newCond: MedicalCondition = {
          id: 'cond_' + Date.now(),
          name: conditionName.trim(),
          diagnosedYear: conditionYear,
          status: conditionStatus,
          severity: conditionSeverity,
          notes: conditionNotes.trim() || undefined
        };
        await updatePersonalHistory({
          conditions: [newCond, ...currentHistory.conditions]
        }, userId);
      } else if (section === 'surgery') {
        const newSurg: SurgeryRecord = {
          id: 'surg_' + Date.now(),
          procedure: surgeryProcedure.trim(),
          hospital: surgeryHospital.trim(),
          year: surgeryYear,
          surgeon: surgerySurgeon.trim() || undefined,
          complications: surgeryComplications.trim() || undefined,
          notes: surgeryNotes.trim() || undefined
        };
        await updatePersonalHistory({
          surgeries: [newSurg, ...currentHistory.surgeries]
        }, userId);
      } else if (section === 'allergy') {
        const newAllergy: AllergyRecord = {
          id: 'all_' + Date.now(),
          allergen: allergen.trim(),
          reaction: allergyReaction.trim(),
          severity: allergySeverity,
          type: allergyType
        };
        await updatePersonalHistory({
          allergies: [newAllergy, ...currentHistory.allergies]
        }, userId);
      } else if (section === 'family') {
        const newFam: FamilyHistoryRecord = {
          id: 'fam_' + Date.now(),
          relative: familyRelative.trim() || familyRelation.toUpperCase(),
          relation: familyRelation,
          condition: familyCondition.trim(),
          notes: familyNotes.trim() || undefined
        };
        await updatePersonalHistory({
          familyHistory: [newFam, ...currentHistory.familyHistory]
        }, userId);
      } else if (section === 'note') {
        const newNote: ClinicalNote = {
          id: 'note_' + Date.now(),
          title: noteTitle.trim(),
          date: noteDate,
          content: noteContent.trim(),
          author: noteAuthor.trim() || undefined
        };
        await updatePersonalHistory({
          medicalNotes: [newNote, ...currentHistory.medicalNotes]
        }, userId);
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to update medical history. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-500/10 to-blue-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
              <Stethoscope size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Add Medical History</h2>
              <p className="text-xs text-gray-500">Document conditions, surgeries, allergies & family history</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 px-3 pt-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setSection('condition')}
            className={`px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
              section === 'condition'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <HeartPulse size={14} /> Condition
          </button>

          <button
            type="button"
            onClick={() => setSection('surgery')}
            className={`px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
              section === 'surgery'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Scissors size={14} /> Surgery
          </button>

          <button
            type="button"
            onClick={() => setSection('allergy')}
            className={`px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
              section === 'allergy'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <AlertTriangle size={14} /> Allergy
          </button>

          <button
            type="button"
            onClick={() => setSection('family')}
            className={`px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
              section === 'family'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Users size={14} /> Family
          </button>

          <button
            type="button"
            onClick={() => setSection('note')}
            className={`px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
              section === 'note'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <FileText size={14} /> Clinical Note
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* CONDITION SECTION */}
          {section === 'condition' && (
            <>
              <div>
                <label htmlFor={condNameId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Medical Condition Name *
                </label>
                <input
                  id={condNameId}
                  type="text"
                  placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
                  value={conditionName}
                  onChange={(e) => setConditionName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor={condYearId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Diagnosed Year
                  </label>
                  <input
                    id={condYearId}
                    type="number"
                    min="1950"
                    max="2030"
                    value={conditionYear}
                    onChange={(e) => setConditionYear(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label htmlFor={condStatusId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    id={condStatusId}
                    value={conditionStatus}
                    onChange={(e) => setConditionStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="active">Active</option>
                    <option value="managed">Managed</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label htmlFor={condSevId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Severity
                  </label>
                  <select
                    id={condSevId}
                    value={conditionSeverity}
                    onChange={(e) => setConditionSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor={condNotesId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Management Notes / Medications
                </label>
                <textarea
                  id={condNotesId}
                  rows={2}
                  placeholder="e.g. Managed with Metformin 500mg BID and daily walking"
                  value={conditionNotes}
                  onChange={(e) => setConditionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </>
          )}

          {/* SURGERY SECTION */}
          {section === 'surgery' && (
            <>
              <div>
                <label htmlFor={surgProcId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Surgical Procedure Name *
                </label>
                <input
                  id={surgProcId}
                  type="text"
                  placeholder="e.g. Laparoscopic Cholecystectomy, Knee Arthroscopy"
                  value={surgeryProcedure}
                  onChange={(e) => setSurgeryProcedure(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={surgHospId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Hospital / Institution *
                  </label>
                  <input
                    id={surgHospId}
                    type="text"
                    placeholder="e.g. Apollo Hospital"
                    value={surgeryHospital}
                    onChange={(e) => setSurgeryHospital(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label htmlFor={surgYearId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Year of Procedure
                  </label>
                  <input
                    id={surgYearId}
                    type="number"
                    min="1950"
                    max="2030"
                    value={surgeryYear}
                    onChange={(e) => setSurgeryYear(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={surgSurgeonId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Surgeon / Clinical Team (Optional)
                </label>
                <input
                  id={surgSurgeonId}
                  type="text"
                  placeholder="e.g. Dr. R. Ramanathan, MS FRCS"
                  value={surgerySurgeon}
                  onChange={(e) => setSurgerySurgeon(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label htmlFor={surgNotesId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Recovery Notes & Complications (if any)
                </label>
                <textarea
                  id={surgNotesId}
                  rows={2}
                  placeholder="e.g. Uneventful recovery. Full rehabilitation completed in 6 weeks."
                  value={surgeryNotes}
                  onChange={(e) => setSurgeryNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </>
          )}

          {/* ALLERGY SECTION */}
          {section === 'allergy' && (
            <>
              <div>
                <label htmlFor={allergenId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Allergen Substance *
                </label>
                <input
                  id={allergenId}
                  type="text"
                  placeholder="e.g. Penicillin, Shellfish, Peanuts, Sulfa Drugs"
                  value={allergen}
                  onChange={(e) => setAllergen(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={allTypeId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Allergy Type
                  </label>
                  <select
                    id={allTypeId}
                    value={allergyType}
                    onChange={(e) => setAllergyType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="drug">Medication / Drug</option>
                    <option value="food">Food</option>
                    <option value="environmental">Environmental</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor={allSevId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Severity Level
                  </label>
                  <select
                    id={allSevId}
                    value={allergySeverity}
                    onChange={(e) => setAllergySeverity(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="mild">Mild (Rash/Itch)</option>
                    <option value="moderate">Moderate (Hives/Swelling)</option>
                    <option value="severe">Severe (Wheezing)</option>
                    <option value="life_threatening">Life-Threatening (Anaphylaxis)</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor={allReactId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Specific Clinical Reaction *
                </label>
                <input
                  id={allReactId}
                  type="text"
                  placeholder="e.g. Immediate urticaria, facial angioedema, drop in blood pressure"
                  value={allergyReaction}
                  onChange={(e) => setAllergyReaction(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </>
          )}

          {/* FAMILY HISTORY SECTION */}
          {section === 'family' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={famRelId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Family Member Name / Label
                  </label>
                  <input
                    id={famRelId}
                    type="text"
                    placeholder="e.g. Father, Maternal Uncle"
                    value={familyRelative}
                    onChange={(e) => setFamilyRelative(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label htmlFor={famTypeId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Kinship Relation
                  </label>
                  <select
                    id={famTypeId}
                    value={familyRelation}
                    onChange={(e) => setFamilyRelation(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="sibling">Sibling (Brother/Sister)</option>
                    <option value="grandparent">Grandparent</option>
                    <option value="other">Other Relative</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor={famCondId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Hereditary / Medical Condition *
                </label>
                <input
                  id={famCondId}
                  type="text"
                  placeholder="e.g. Coronary Artery Disease, Type 2 Diabetes, Breast Cancer"
                  value={familyCondition}
                  onChange={(e) => setFamilyCondition(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label htmlFor={famNotesId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Onset Age & Clinical Notes (Optional)
                </label>
                <input
                  id={famNotesId}
                  type="text"
                  placeholder="e.g. Diagnosed at age 52; had bypass surgery"
                  value={familyNotes}
                  onChange={(e) => setFamilyNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </>
          )}

          {/* CLINICAL NOTE SECTION */}
          {section === 'note' && (
            <>
              <div>
                <label htmlFor={noteTitleId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Note Title *
                </label>
                <input
                  id={noteTitleId}
                  type="text"
                  placeholder="e.g. Annual Ophthalmological Retina Exam, Cardiology Stress Test"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={noteDateId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Date
                  </label>
                  <input
                    id={noteDateId}
                    type="date"
                    value={noteDate}
                    onChange={(e) => setNoteDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label htmlFor={noteAuthorId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Doctor / Specialist (Optional)
                  </label>
                  <input
                    id={noteAuthorId}
                    type="text"
                    placeholder="e.g. Dr. K. Swaminathan"
                    value={noteAuthor}
                    onChange={(e) => setNoteAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={noteContentId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Clinical Summary & Instructions *
                </label>
                <textarea
                  id={noteContentId}
                  rows={3}
                  placeholder="Enter medical observations, test interpretations, or doctor instructions"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-black shadow-md hover:from-teal-700 hover:to-emerald-700 active:scale-95 transition-all flex items-center gap-1.5"
            >
              {isSaving ? 'Saving...' : 'Add to Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
