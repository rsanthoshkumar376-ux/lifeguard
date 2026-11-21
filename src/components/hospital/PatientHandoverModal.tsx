import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  CheckCircle2, 
  AlertTriangle, 
  Heart, 
  Activity, 
  MapPin, 
  Clock, 
  User, 
  Phone,
  Ambulance,
  Building2,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { PatientHandoverRecord, updateHandoverStatus } from '../../services/hospitalNetworkService';

interface PatientHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  handover: PatientHandoverRecord | null;
  onStatusUpdated?: (updated: PatientHandoverRecord) => void;
  isHospitalStaff?: boolean;
}

export const PatientHandoverModal: React.FC<PatientHandoverModalProps> = ({
  isOpen,
  onClose,
  handover,
  onStatusUpdated,
  isHospitalStaff = true
}) => {
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !handover) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `🚨 Emergency Patient Handover #${handover.handoverCode}\nPatient: ${handover.patientName} (${handover.bloodGroup})\nReceiving Hospital: ${handover.receivingHospitalName}\nStatus: ${handover.status.toUpperCase()}\nAllergies: ${handover.allergies.join(', ') || 'None reported'}\nConditions: ${handover.criticalConditions.join(', ') || 'None reported'}`;
    if (navigator.share) {
      navigator.share({
        title: `Emergency Handover ${handover.handoverCode}`,
        text,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpdateStatus = async (newStatus: PatientHandoverRecord['status']) => {
    setUpdating(true);
    try {
      const updated = await updateHandoverStatus(handover.id, newStatus);
      if (updated && onStatusUpdated) {
        onStatusUpdated(updated);
      }
    } finally {
      setUpdating(false);
    }
  };

  const statusColor = 
    handover.status === 'admitted' ? 'bg-emerald-100 text-emerald-800' :
    handover.status === 'received' ? 'bg-blue-100 text-blue-800' :
    handover.status === 'en_route' ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-gray-100 text-gray-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-xl">
              🚑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight leading-tight">Emergency Patient Handover</h3>
                <span className="bg-white/20 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  {handover.handoverCode}
                </span>
              </div>
              <p className="text-xs text-red-100 font-medium">SBAR Clinical Handover Protocol • Pre-Hospital to Emergency Triage</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              title="Share Handover Summary"
            >
              <Share2 size={17} />
            </button>
            <button
              onClick={handlePrint}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              title="Print Clinical Handover Slip"
            >
              <Printer size={17} />
            </button>
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 space-y-4 text-gray-900">
          {copied && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Handover summary copied to clipboard!</span>
            </div>
          )}

          {/* Handover Status & Receiving Hospital */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Receiving Emergency Facility</span>
              <div className="flex items-center gap-1.5 text-gray-900 font-black text-sm mt-0.5">
                <Building2 size={16} className="text-red-600" />
                <span>{handover.receivingHospitalName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${statusColor}`}>
                {handover.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* SBAR Section 1: Situation & Incident Details */}
          <div className="bg-red-50/70 border border-red-200 rounded-2xl p-4 space-y-2">
            <span className="text-[11px] font-black text-red-900 uppercase tracking-wider block">
              1. Situation & Incident Dispatch
            </span>
            <p className="text-xs text-red-950 font-medium leading-relaxed">
              {handover.emergencyNotes}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-red-800 font-medium">
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-red-600" />
                <span>SOS Alert: {new Date(handover.sosTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Ambulance size={13} className="text-red-600" />
                <span>Transport: {handover.transportingAmbulance || 'Ambulance 108'}</span>
              </div>
              {handover.incidentLocation?.address && (
                <div className="flex items-center gap-1.5 col-span-2">
                  <MapPin size={13} className="text-red-600 shrink-0" />
                  <span className="truncate">Scene: {handover.incidentLocation.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* SBAR Section 2: Patient Background (Approved Medical ID) */}
          <div className="border border-gray-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider">
                2. Patient Medical Background (Approved Medical ID)
              </span>
              <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                <ShieldCheck size={13} /> Patient Consented
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-400 font-bold block">Patient Name</span>
                <span className="font-black text-xs text-gray-900 block truncate">{handover.patientName}</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-400 font-bold block">Age / Gender</span>
                <span className="font-black text-xs text-gray-900 block">{handover.patientAge} / {handover.patientGender}</span>
              </div>
              <div className="bg-red-50 p-2.5 rounded-xl border border-red-100 col-span-2 sm:col-span-2">
                <span className="text-[10px] text-red-600 font-bold block">Blood Group</span>
                <span className="font-black text-lg text-red-700 leading-none">{handover.bloodGroup}</span>
              </div>
            </div>

            {/* Critical Allergies */}
            <div className="space-y-1">
              <span className="text-[11px] font-black text-red-600 uppercase tracking-wide block">Known Critical Allergies</span>
              <div className="flex flex-wrap gap-1.5">
                {handover.allergies.length > 0 ? (
                  handover.allergies.map(alg => (
                    <span key={alg} className="px-2.5 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-bold border border-red-200">
                      ⚠️ {alg}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500 font-medium italic">No known drug allergies reported.</span>
                )}
              </div>
            </div>

            {/* Chronic Conditions */}
            <div className="space-y-1">
              <span className="text-[11px] font-black text-gray-700 uppercase tracking-wide block">Chronic Medical Conditions</span>
              <div className="flex flex-wrap gap-1.5">
                {handover.criticalConditions.length > 0 ? (
                  handover.criticalConditions.map(c => (
                    <span key={c} className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded-lg text-xs font-bold border border-gray-200">
                      • {c}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500 font-medium italic">None reported in Medical ID.</span>
                )}
              </div>
            </div>

            {/* Current Medications */}
            {handover.currentMedications.length > 0 && (
              <div className="space-y-1">
                <span className="text-[11px] font-black text-gray-700 uppercase tracking-wide block">Current Medications</span>
                <p className="text-xs text-gray-600 font-medium">
                  {handover.currentMedications.join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* SBAR Section 3: Assessment & Vitals */}
          <div className="border border-gray-200 rounded-2xl p-4 space-y-3">
            <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider block">
              3. Pre-Hospital Assessment & Vital Signs
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                <span className="text-[10px] text-blue-600 font-bold block uppercase">Pulse Rate</span>
                <span className="font-black text-lg text-blue-900">{handover.vitalSigns.pulseBpm || '--'} <span className="text-xs font-normal">BPM</span></span>
              </div>
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                <span className="text-[10px] text-purple-600 font-bold block uppercase">Blood Pressure</span>
                <span className="font-black text-lg text-purple-900">{handover.vitalSigns.bloodPressure || '--'}</span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-emerald-600 font-bold block uppercase">SpO2 Oxygen</span>
                <span className="font-black text-lg text-emerald-900">{handover.vitalSigns.spO2Percent || '--'}%</span>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                <span className="text-[10px] text-amber-600 font-bold block uppercase">GCS Score</span>
                <span className="font-black text-lg text-amber-900">{handover.vitalSigns.gcsScore || 15} <span className="text-xs font-normal">/ 15</span></span>
              </div>
            </div>

            {handover.paramedicNotes && (
              <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-700 border border-gray-200">
                <span className="font-bold text-gray-900 block mb-0.5">Paramedic / Attendant Assessment:</span>
                {handover.paramedicNotes}
              </div>
            )}
          </div>

          {/* SBAR Section 4: Hospital Action & Status Transition */}
          {isHospitalStaff && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
              <span className="text-[11px] font-black text-gray-700 uppercase tracking-wider block">
                4. Hospital Emergency Triage Action
              </span>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('en_route')}
                  disabled={updating}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    handover.status === 'en_route'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  🚑 En Route
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus('received')}
                  disabled={updating}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    handover.status === 'received'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  📥 Patient Received
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus('admitted')}
                  disabled={updating}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    handover.status === 'admitted'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  🏥 Admitted to Ward
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition-all"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Printer size={15} />
            <span>Print SBAR Slip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
