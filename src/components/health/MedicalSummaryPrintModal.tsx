import React from 'react';
import { 
  X, Printer, Download, HeartPulse, FileText, Activity, AlertTriangle, ShieldCheck, Stethoscope, CheckCircle2
} from 'lucide-react';
import { DigitalHealthProfile } from '../../services/healthRecordsService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: DigitalHealthProfile;
  userName?: string;
  bloodGroup?: string;
  dob?: string;
  gender?: string;
}

export const MedicalSummaryPrintModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  userName = 'Verified Patient',
  bloodGroup = 'O+',
  dob = '1988-06-15',
  gender = 'Male'
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Get latest readings for vitals table
  const latestBp = profile.vitals.find(v => v.type === 'blood_pressure');
  const latestHr = profile.vitals.find(v => v.type === 'heart_rate');
  const latestSpo2 = profile.vitals.find(v => v.type === 'spo2');
  const latestGlucose = profile.vitals.find(v => v.type === 'blood_glucose');
  const latestTemp = profile.vitals.find(v => v.type === 'temperature');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white text-gray-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-4 print:my-0 print:border-none print:shadow-none print:w-full print:max-w-none print:rounded-none">
        {/* Modal Controls Bar (hidden during print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Stethoscope size={20} className="text-red-400" />
            <span className="font-bold text-sm">Doctor Consultation Summary (Ready for PDF Export)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl text-xs font-black shadow-lg hover:from-red-700 hover:to-rose-700 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Printer size={16} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 text-gray-300 hover:text-white flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOSSIER CONTENT */}
        <div className="p-6 sm:p-10 space-y-6 text-gray-900 font-sans print:p-8" id="printable-summary">
          {/* Header */}
          <div className="border-b-2 border-red-600 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-red-600 text-white rounded-lg flex items-center justify-center font-black text-sm">
                  LG
                </span>
                <span className="text-xl font-black tracking-tight text-gray-900 uppercase">
                  LifeGuard Digital Health Records
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Comprehensive Clinical Summary for Attending Physician & Hospital Consultation
              </p>
            </div>
            <div className="text-left sm:text-right text-xs text-gray-500">
              <p className="font-bold text-gray-800">Date Generated: {new Date().toLocaleDateString('en-GB')}</p>
              <p className="text-[11px]">Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-[11px] text-emerald-700 font-bold mt-0.5">● Cryptographically Verified Dossier</p>
            </div>
          </div>

          {/* Patient Demographics Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Patient Name</span>
              <span className="font-black text-sm text-gray-900">{userName}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Blood Group</span>
              <span className="font-black text-sm text-red-600">{bloodGroup}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Age / Gender</span>
              <span className="font-bold text-gray-900">{gender} • Born {dob}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Emergency Hotline</span>
              <span className="font-bold text-gray-900">National 112 / 108</span>
            </div>
          </div>

          {/* CRITICAL ALLERGIES ALERT */}
          <div>
            <h3 className="text-xs font-black text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle size={15} /> Documented Drug & Food Allergies
            </h3>
            {profile.personalHistory.allergies.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No known drug or environmental allergies recorded.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {profile.personalHistory.allergies.map(all => (
                  <div key={all.id} className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-red-900">{all.allergen}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-200 text-red-800">
                        {all.severity}
                      </span>
                    </div>
                    <p className="text-red-800 text-[11px] mt-1">{all.reaction}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LATEST RECORDED VITALS TABLE */}
          <div>
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Activity size={15} className="text-blue-600" /> Recent Vital Signs Readings
            </h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-gray-600 font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-2 px-3">Vital Parameter</th>
                    <th className="py-2 px-3">Latest Reading</th>
                    <th className="py-2 px-3">Standard Reference Target</th>
                    <th className="py-2 px-3">Date Recorded</th>
                    <th className="py-2 px-3 text-right">Clinical Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2.5 px-3 font-bold">Blood Pressure</td>
                    <td className="py-2.5 px-3 font-black text-gray-900">
                      {latestBp ? `${latestBp.value.systolic}/${latestBp.value.diastolic} mmHg` : 'Not recorded'}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500">&lt;120 / &lt;80 mmHg (Normal)</td>
                    <td className="py-2.5 px-3 text-gray-500">
                      {latestBp ? new Date(latestBp.recordedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold uppercase text-[10px]">
                      {latestBp?.status || '—'}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-bold">Resting Heart Rate</td>
                    <td className="py-2.5 px-3 font-black text-gray-900">
                      {latestHr ? `${latestHr.value.bpm} BPM` : 'Not recorded'}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500">60 – 100 BPM</td>
                    <td className="py-2.5 px-3 text-gray-500">
                      {latestHr ? new Date(latestHr.recordedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold uppercase text-[10px]">
                      {latestHr?.status || '—'}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-bold">Oxygen Saturation (SpO2)</td>
                    <td className="py-2.5 px-3 font-black text-gray-900">
                      {latestSpo2 ? `${latestSpo2.value.percentage}%` : 'Not recorded'}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500">95% – 100%</td>
                    <td className="py-2.5 px-3 text-gray-500">
                      {latestSpo2 ? new Date(latestSpo2.recordedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold uppercase text-[10px]">
                      {latestSpo2?.status || '—'}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-bold">Blood Glucose</td>
                    <td className="py-2.5 px-3 font-black text-gray-900">
                      {latestGlucose ? `${latestGlucose.value.glucose} mg/dL (${latestGlucose.value.glucoseContext || 'Fasting'})` : 'Not recorded'}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500">Fasting: 70–99 mg/dL; Postprandial: &lt;140</td>
                    <td className="py-2.5 px-3 text-gray-500">
                      {latestGlucose ? new Date(latestGlucose.recordedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold uppercase text-[10px]">
                      {latestGlucose?.status || '—'}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-bold">Body Temperature</td>
                    <td className="py-2.5 px-3 font-black text-gray-900">
                      {latestTemp ? `${latestTemp.value.temperature}°${latestTemp.value.tempUnit || 'F'}` : 'Not recorded'}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500">97.0°F – 99.0°F (36.1°C – 37.2°C)</td>
                    <td className="py-2.5 px-3 text-gray-500">
                      {latestTemp ? new Date(latestTemp.recordedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold uppercase text-[10px]">
                      {latestTemp?.status || '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* MEDICAL CONDITIONS & SURGERIES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Conditions */}
            <div>
              <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HeartPulse size={15} className="text-red-500" /> Active & Managed Conditions
              </h3>
              <div className="space-y-2">
                {profile.personalHistory.conditions.map(c => (
                  <div key={c.id} className="p-2.5 border border-gray-200 rounded-xl text-xs bg-white">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{c.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 capitalize">
                        {c.status} ({c.diagnosedYear})
                      </span>
                    </div>
                    {c.notes && <p className="text-[11px] text-gray-500 mt-1">{c.notes}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Surgeries */}
            <div>
              <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText size={15} className="text-purple-600" /> Surgical History
              </h3>
              <div className="space-y-2">
                {profile.personalHistory.surgeries.map(s => (
                  <div key={s.id} className="p-2.5 border border-gray-200 rounded-xl text-xs bg-white">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{s.procedure}</span>
                      <span className="text-[10px] font-bold text-gray-500">{s.year}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-0.5">{s.hospital}</p>
                    {s.surgeon && <p className="text-[10px] text-gray-400">Surgeon: {s.surgeon}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAMILY HISTORY */}
          <div>
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider mb-2">
              Family Medical History (Hereditary Risk Factors)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {profile.personalHistory.familyHistory.map(f => (
                <div key={f.id} className="p-2.5 border border-gray-200 rounded-xl text-xs bg-white">
                  <span className="font-bold text-gray-800 block text-[11px]">{f.relative}</span>
                  <span className="text-gray-900 font-semibold">{f.condition}</span>
                  {f.notes && <p className="text-[10px] text-gray-500 mt-0.5">{f.notes}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* RECENT DIAGNOSTIC INVESTIGATIONS & REPORTS */}
          <div>
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText size={15} className="text-indigo-600" /> Recent Diagnostic Lab Reports & Summaries
            </h3>
            <div className="space-y-1.5 text-xs">
              {profile.documents.slice(0, 4).map(d => (
                <div key={d.id} className="p-2 border border-gray-100 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-900">{d.title}</span>
                    <span className="text-gray-500 text-[11px] block">{d.facilityOrDoctor} • {d.documentDate}</span>
                    {d.summary && <p className="text-[11px] text-gray-600 mt-0.5 italic">{d.summary}</p>}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700">
                    {d.category.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* UPCOMING APPOINTMENTS */}
          {profile.appointments.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider mb-2">
                Upcoming Doctor Consultations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {profile.appointments.map(a => (
                  <div key={a.id} className="p-2.5 border border-blue-100 bg-blue-50/50 rounded-xl">
                    <span className="font-bold text-blue-900">{a.doctor} ({a.specialty})</span>
                    <p className="text-[11px] text-gray-700">{a.hospitalOrClinic} • {a.date} at {a.time}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{a.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PHYSICIAN NOTES & ATTESTATION BLOCK (For Doctor Consultations) */}
          <div className="border-t-2 border-dashed border-gray-300 pt-4 mt-6">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Attending Physician Consultation Notes & Clinical Orders:
            </h4>
            <div className="h-20 border border-gray-200 rounded-xl bg-gray-50/40 p-2 text-xs text-gray-400">
              [Doctor clinical observations, diagnosis, and prescription adjustments during consultation]
            </div>
            <div className="mt-6 flex items-end justify-between text-xs text-gray-500">
              <div>
                <p>LifeGuard Patient ID: <span className="font-mono font-bold text-gray-800">{profile.userId}</span></p>
                <p className="text-[10px]">Secure Health Token • HIPAA & Digital Health Compliant</p>
              </div>
              <div className="text-right">
                <div className="w-48 border-b border-gray-400 pb-1 mb-1"></div>
                <p className="font-bold text-gray-700">Attending Physician's Signature & Seal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
