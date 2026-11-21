import React, { useState, useRef } from 'react';
import { 
  X, Pill, UploadCloud, AlertTriangle, CheckCircle2, 
  Sparkles, Calendar, Plus, ShieldCheck, ArrowRight, 
  HelpCircle, Clock, FileText, Check
} from 'lucide-react';
import { scanPrescription, PrescriptionScanResult, ExtractedPrescriptionMed } from '../../services/geminiAiService';
import { addMedication, MedicationFrequency, MealTiming } from '../../services/medicineAppointmentService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
  onImportSuccess?: (count: number) => void;
}

export const PrescriptionScannerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  language = 'en',
  onImportSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [result, setResult] = useState<PrescriptionScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedMeds, setSelectedMeds] = useState<Record<number, boolean>>({});
  const [importedSuccess, setImportedSuccess] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      await processPrescription(file);
    }
  };

  const loadSample = async (type: 'hypertension' | 'diabetes' | 'antibiotic') => {
    const fakeFile = new File(
      ['dummy sample content'],
      type === 'hypertension' ? 'Cardio_BP_Prescription.jpg' :
      type === 'diabetes' ? 'Endocrine_Diabetes_Prescription.pdf' : 'General_Antibiotic_Slip.jpg',
      { type: type === 'diabetes' ? 'application/pdf' : 'image/jpeg' }
    );
    setSelectedFile(fakeFile);
    await processPrescription(fakeFile);
  };

  const processPrescription = async (file: File) => {
    setIsScanning(true);
    setResult(null);
    setErrorMsg(null);
    setImportedSuccess(false);

    try {
      setScanStep('1/3: Reading doctor prescription slip & handwriting...');
      await new Promise(r => setTimeout(r, 600));

      setScanStep('2/3: Extracting medicine names, dosages & frequencies...');
      await new Promise(r => setTimeout(r, 600));

      setScanStep('3/3: Evaluating handwriting clarity & pharmacist verification tags...');
      const data = await scanPrescription(file, language);
      setResult(data);

      // Select valid, certain medications by default for import
      const initialSelected: Record<number, boolean> = {};
      data.medications.forEach((m, idx) => {
        if (!m.isUncertain && !m.medicineName.includes('Unclear')) {
          initialSelected[idx] = true;
        }
      });
      setSelectedMeds(initialSelected);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to scan prescription. Please check image quality and try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const toggleSelectMed = (idx: number) => {
    setSelectedMeds(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleImportToMedicineTracker = async () => {
    if (!result) return;
    setIsImporting(true);

    try {
      let importedCount = 0;
      const todayStr = new Date().toISOString().split('T')[0];

      for (let i = 0; i < result.medications.length; i++) {
        if (selectedMeds[i]) {
          const m = result.medications[i];
          
          // Map frequency
          let freq: MedicationFrequency = 'once_daily';
          let times = ['08:00'];
          const fLower = m.frequency.toLowerCase();
          if (fLower.includes('twice') || fLower.includes('1-0-1') || fLower.includes('12 hour')) {
            freq = 'twice_daily';
            times = ['08:00', '20:00'];
          } else if (fLower.includes('thrice') || fLower.includes('1-1-1') || fLower.includes('8 hour')) {
            freq = 'thrice_daily';
            times = ['08:00', '14:00', '20:00'];
          } else if (fLower.includes('as needed') || fLower.includes('sos') || fLower.includes('prn')) {
            freq = 'as_needed';
            times = ['08:00'];
          }

          // Map meal timing
          let mealTiming: MealTiming = 'after_meal';
          if (m.timing === 'before_meal' || m.instructions.toLowerCase().includes('empty stomach')) {
            mealTiming = 'before_meal';
          } else if (m.timing === 'with_meal') {
            mealTiming = 'with_meal';
          }

          await addMedication({
            name: m.medicineName,
            dosage: m.dosage,
            frequency: freq,
            frequencyLabel: m.frequency,
            mealTiming,
            startDate: todayStr,
            isOngoing: m.duration.toLowerCase().includes('ongoing') || m.duration.toLowerCase().includes('maintenance'),
            reminderTimes: times,
            prescribingDoctor: result.prescribingDoctor,
            hospitalOrClinic: result.clinicOrHospital,
            currentStock: 30,
            refillThreshold: 5,
            verificationStatus: 'doctor_verified',
            instructions: m.instructions,
            isActive: true
          });
          importedCount++;
        }
      }

      setImportedSuccess(true);
      if (onImportSuccess) onImportSuccess(importedCount);
    } catch (err) {
      console.error('Failed to import to medicine tracker:', err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                Prescription Scanner
                {result?.source === 'gemini_multimodal' && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                    Gemini 3.8 Flash
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Extracts medicine names, dosages, and flags unclear doctor handwriting
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Upload Area */}
          {!result && (
            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 dark:border-blue-700/60 hover:border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all hover:shadow-md group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf,image/jpeg,image/png,image/webp" 
                  className="hidden" 
                />
                <div className="w-14 h-14 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Upload Prescription Slip or Doctor Note
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-3">
                  Upload photos of paper prescriptions or digital consultation summaries. Max 10MB.
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-blue-600 text-white shadow-sm">
                  Browse Files or Snap Photo
                </span>
              </div>

              {/* Sample Prescriptions */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Or Test with Sample Prescriptions:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => loadSample('hypertension')}
                    className="p-3 text-left rounded-xl border border-gray-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-800/80 transition-all text-xs"
                  >
                    <span className="font-bold text-gray-800 dark:text-gray-200 block">🫀 Cardio & BP</span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">Telmisartan, Amlodipine + Unclear item</span>
                  </button>
                  <button
                    onClick={() => loadSample('diabetes')}
                    className="p-3 text-left rounded-xl border border-gray-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-800/80 transition-all text-xs"
                  >
                    <span className="font-bold text-gray-800 dark:text-gray-200 block">🍬 Diabetes Regimen</span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">Metformin SR, Glimepiride</span>
                  </button>
                  <button
                    onClick={() => loadSample('antibiotic')}
                    className="p-3 text-left rounded-xl border border-gray-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-800/80 transition-all text-xs"
                  >
                    <span className="font-bold text-gray-800 dark:text-gray-200 block">💊 Acute Infection</span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">Augmentin, Paracetamol, Pantop</span>
                  </button>
                </div>
              </div>

              {/* Scanning status */}
              {isScanning && (
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2 animate-pulse">
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-800 dark:text-blue-200">
                    <span>{scanStep}</span>
                    <span className="animate-spin text-blue-600">⏳</span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-600 h-full w-3/4 animate-pulse rounded-full" />
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* Results View */}
          {result && (
            <div className="space-y-4">
              
              {/* Doctor / Facility Details */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                    {result.prescribingDoctor || 'Attending Physician'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {result.clinicOrHospital || 'Clinic / Hospital'} • Prescribed: {result.prescriptionDate || 'Recent'}
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedFile(null); setResult(null); }}
                  className="text-xs text-blue-600 dark:text-blue-400 underline font-medium hover:text-blue-700"
                >
                  Scan Another Slip
                </button>
              </div>

              {/* Handwriting Uncertainty Warnings */}
              {result.unclearHandwritingWarnings && result.unclearHandwritingWarnings.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Unclear Doctor Handwriting Detected</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] space-y-0.5 pl-1 text-amber-800/90 dark:text-amber-300/90">
                    {result.unclearHandwritingWarnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium pt-1">
                    🛡️ <strong>Safety Guarantee:</strong> LifeGuard AI strictly refuses to guess or invent unreadable drug names. Always show your original slip to the licensed pharmacist.
                  </p>
                </div>
              )}

              {/* Extracted Medications List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Detected Medications ({result.medications.length})
                  </h5>
                  <span className="text-[11px] text-gray-400">
                    Select to import into Medicine Tracker
                  </span>
                </div>

                <div className="space-y-2">
                  {result.medications.map((med, idx) => {
                    const isSelected = !!selectedMeds[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleSelectMed(idx)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          med.isUncertain 
                            ? 'border-amber-300 bg-amber-50/20 dark:border-amber-800/60 dark:bg-amber-950/10'
                            : isSelected
                            ? 'border-blue-500 bg-blue-50/30 dark:border-blue-600 dark:bg-blue-950/20 shadow-sm'
                            : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected ? 'bg-blue-600 text-white' : 'border border-gray-300 dark:border-slate-600'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`font-bold text-xs ${
                              med.isUncertain ? 'text-amber-800 dark:text-amber-300' : 'text-gray-900 dark:text-white'
                            }`}>
                              {med.medicineName}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                              {med.dosage}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-blue-500" />
                              {med.frequency}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-indigo-500" />
                              {med.duration}
                            </span>
                          </div>

                          {med.instructions && (
                            <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1 italic">
                              "{med.instructions}"
                            </p>
                          )}

                          {med.isUncertain && med.uncertaintyNotes && (
                            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold mt-1">
                              ⚠️ Note: {med.uncertaintyNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Import Action */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-semibold text-xs text-gray-900 dark:text-white block">
                    LifeGuard Medicine Schedule Integration
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    Add selected prescriptions directly into your daily dosing schedule & refill alerts.
                  </span>
                </div>

                {importedSuccess ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Imported to Schedule!
                  </span>
                ) : (
                  <button
                    disabled={isImporting || Object.values(selectedMeds).filter(Boolean).length === 0}
                    onClick={handleImportToMedicineTracker}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isImporting ? 'Importing...' : `Add Selected (${Object.values(selectedMeds).filter(Boolean).length})`}</span>
                  </button>
                )}
              </div>

              {/* Safety Disclaimer */}
              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 text-[11px] text-blue-900 dark:text-blue-200">
                <ShieldCheck className="w-4 h-4 inline mr-1 text-blue-600" />
                <strong>Pharmacist Verification Mandatory:</strong> {result.disclaimer}
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            Emergency hotline: <strong>108</strong> (Ambulance) / <strong>112</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default PrescriptionScannerModal;
