import React, { useState, useId } from 'react';
import { X, Activity, Heart, Droplet, Thermometer, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { VitalType, VitalValue, classifyVital, addVitalRecord } from '../../services/healthRecordsService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
}

export const VitalEntryModal: React.FC<Props> = ({ isOpen, onClose, onSaved, userId }) => {
  const [vitalType, setVitalType] = useState<VitalType>('blood_pressure');
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [bpm, setBpm] = useState<number>(72);
  const [spo2, setSpo2] = useState<number>(98);
  const [temperature, setTemperature] = useState<number>(98.6);
  const [tempUnit, setTempUnit] = useState<'F' | 'C'>('F');
  const [glucose, setGlucose] = useState<number>(95);
  const [glucoseContext, setGlucoseContext] = useState<'fasting' | 'postprandial' | 'random'>('fasting');
  const [recordedAt, setRecordedAt] = useState<string>(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Generate unique IDs for form controls
  const typeId = useId();
  const systolicId = useId();
  const diastolicId = useId();
  const bpmId = useId();
  const spo2Id = useId();
  const tempId = useId();
  const glucoseId = useId();
  const contextId = useId();
  const timeId = useId();
  const notesId = useId();

  if (!isOpen) return null;

  // Build current value object for live classification preview
  const currentValue: VitalValue = {
    systolic: vitalType === 'blood_pressure' ? systolic : undefined,
    diastolic: vitalType === 'blood_pressure' ? diastolic : undefined,
    bpm: vitalType === 'heart_rate' ? bpm : undefined,
    percentage: vitalType === 'spo2' ? spo2 : undefined,
    temperature: vitalType === 'temperature' ? temperature : undefined,
    tempUnit: vitalType === 'temperature' ? tempUnit : undefined,
    glucose: vitalType === 'blood_glucose' ? glucose : undefined,
    glucoseContext: vitalType === 'blood_glucose' ? glucoseContext : undefined,
  };

  const preview = classifyVital(vitalType, currentValue);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await addVitalRecord({
        recordedAt: new Date(recordedAt).toISOString(),
        type: vitalType,
        value: currentValue,
        notes: notes.trim() || undefined
      }, userId);

      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save vital record:', err);
      alert('Could not save vital record. Please check values and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-500/10 to-blue-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md">
              <Activity size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Record Health Vital</h2>
              <p className="text-xs text-gray-500">Log clinical reading for tracking & doctor review</p>
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
          {/* Vital Type Selector */}
          <div>
            <label htmlFor={typeId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Select Measurement Type
            </label>
            <select
              id={typeId}
              value={vitalType}
              onChange={(e) => setVitalType(e.target.value as VitalType)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="blood_pressure">Blood Pressure (Systolic / Diastolic mmHg)</option>
              <option value="heart_rate">Heart Rate / Pulse (BPM)</option>
              <option value="spo2">Oxygen Saturation (SpO2 %)</option>
              <option value="blood_glucose">Blood Glucose (mg/dL)</option>
              <option value="temperature">Body Temperature (°F / °C)</option>
            </select>
          </div>

          {/* Dynamic Input based on Vital Type */}
          {vitalType === 'blood_pressure' && (
            <div className="grid grid-cols-2 gap-3 bg-red-50/60 dark:bg-red-950/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/30">
              <div>
                <label htmlFor={systolicId} className="block text-xs font-bold text-red-900 dark:text-red-300 mb-1">
                  Systolic (Upper) mmHg
                </label>
                <input
                  id={systolicId}
                  type="number"
                  min="60"
                  max="260"
                  value={systolic}
                  onChange={(e) => setSystolic(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-black text-xl text-center outline-none focus:ring-2 focus:ring-red-500"
                />
                <span className="text-[10px] text-gray-500 block text-center mt-1">Target: &lt;120</span>
              </div>
              <div>
                <label htmlFor={diastolicId} className="block text-xs font-bold text-red-900 dark:text-red-300 mb-1">
                  Diastolic (Lower) mmHg
                </label>
                <input
                  id={diastolicId}
                  type="number"
                  min="40"
                  max="160"
                  value={diastolic}
                  onChange={(e) => setDiastolic(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-black text-xl text-center outline-none focus:ring-2 focus:ring-red-500"
                />
                <span className="text-[10px] text-gray-500 block text-center mt-1">Target: &lt;80</span>
              </div>
            </div>
          )}

          {vitalType === 'heart_rate' && (
            <div className="bg-pink-50/60 dark:bg-pink-950/20 p-4 rounded-2xl border border-pink-100 dark:border-pink-900/30">
              <label htmlFor={bpmId} className="block text-xs font-bold text-pink-900 dark:text-pink-300 mb-1">
                Resting Pulse (BPM)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id={bpmId}
                  type="number"
                  min="30"
                  max="220"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  required
                  className="flex-1 px-3 py-2 rounded-xl border border-pink-200 dark:border-pink-800 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-black text-2xl text-center outline-none focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-sm font-bold text-pink-700 dark:text-pink-300">Beats / Min</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Standard normal resting range: 60 – 100 BPM.</p>
            </div>
          )}

          {vitalType === 'spo2' && (
            <div className="bg-cyan-50/60 dark:bg-cyan-950/20 p-4 rounded-2xl border border-cyan-100 dark:border-cyan-900/30">
              <label htmlFor={spo2Id} className="block text-xs font-bold text-cyan-900 dark:text-cyan-300 mb-1">
                Oxygen Saturation (SpO2 %)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id={spo2Id}
                  type="number"
                  min="50"
                  max="100"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                  required
                  className="flex-1 px-3 py-2 rounded-xl border border-cyan-200 dark:border-cyan-800 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-black text-2xl text-center outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <span className="text-sm font-bold text-cyan-700 dark:text-cyan-300">% (Room Air)</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Normal is 95% – 100%. Levels &lt;95% require monitoring.</p>
            </div>
          )}

          {vitalType === 'blood_glucose' && (
            <div className="bg-amber-50/60 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 space-y-3">
              <div>
                <label htmlFor={glucoseId} className="block text-xs font-bold text-amber-900 dark:text-amber-300 mb-1">
                  Blood Glucose (mg/dL)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id={glucoseId}
                    type="number"
                    min="30"
                    max="600"
                    value={glucose}
                    onChange={(e) => setGlucose(Number(e.target.value))}
                    required
                    className="flex-1 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-black text-2xl text-center outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-300">mg / dL</span>
                </div>
              </div>

              <div>
                <label htmlFor={contextId} className="block text-xs font-bold text-amber-900 dark:text-amber-300 mb-1">
                  Measurement Timing Context
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['fasting', 'postprandial', 'random'] as const).map((ctx) => (
                    <button
                      type="button"
                      key={ctx}
                      onClick={() => setGlucoseContext(ctx)}
                      className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                        glucoseContext === ctx
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-amber-200'
                      }`}
                    >
                      {ctx === 'postprandial' ? 'Post-Meal' : ctx}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  {glucoseContext === 'fasting' ? 'Fasting: 8–10 hours without calorie intake.' : 'Postprandial: 2 hours after meal start.'}
                </p>
              </div>
            </div>
          )}

          {vitalType === 'temperature' && (
            <div className="bg-purple-50/60 dark:bg-purple-950/20 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/30 space-y-3">
              <label htmlFor={tempId} className="block text-xs font-bold text-purple-900 dark:text-purple-300 mb-1">
                Body Temperature
              </label>
              <div className="flex items-center gap-3">
                <input
                  id={tempId}
                  type="number"
                  step="0.1"
                  min={tempUnit === 'F' ? "90" : "32"}
                  max={tempUnit === 'F' ? "108" : "42"}
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  required
                  className="flex-1 px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-black text-2xl text-center outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex bg-white dark:bg-slate-800 border border-purple-200 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (tempUnit === 'C') {
                        setTemperature(Number(((temperature * 9) / 5 + 32).toFixed(1)));
                        setTempUnit('F');
                      }
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      tempUnit === 'F' ? 'bg-purple-600 text-white' : 'text-gray-600'
                    }`}
                  >
                    °F
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (tempUnit === 'F') {
                        setTemperature(Number((((temperature - 32) * 5) / 9).toFixed(1)));
                        setTempUnit('C');
                      }
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      tempUnit === 'C' ? 'bg-purple-600 text-white' : 'text-gray-600'
                    }`}
                  >
                    °C
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Live Clinical Feedback Banner */}
          <div className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
            preview.status === 'normal' ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300' :
            preview.status === 'borderline' ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300' :
            'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300'
          }`}>
            {preview.status === 'normal' ? (
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : preview.status === 'borderline' ? (
              <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert size={20} className="text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-xs uppercase tracking-wider">{preview.label}</p>
              <p className="text-[11px] mt-0.5 opacity-90">{preview.details}</p>
            </div>
          </div>

          {/* Date & Time Input */}
          <div>
            <label htmlFor={timeId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Measurement Date & Time
            </label>
            <input
              id={timeId}
              type="datetime-local"
              value={recordedAt}
              onChange={(e) => setRecordedAt(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Notes Input */}
          <div>
            <label htmlFor={notesId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Physiological Context / Notes (Optional)
            </label>
            <input
              id={notesId}
              type="text"
              placeholder="e.g. Taken after 10 min rest; morning fasting before breakfast"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black shadow-md hover:from-red-700 hover:to-rose-700 active:scale-95 transition-all flex items-center gap-1.5"
            >
              {isSaving ? 'Saving...' : 'Save Reading'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
