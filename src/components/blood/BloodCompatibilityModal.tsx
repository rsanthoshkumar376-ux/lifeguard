import React, { useState } from 'react';
import { X, Check, AlertTriangle, ShieldCheck, Heart, Info, ArrowRight, Droplet } from 'lucide-react';
import { 
  BloodGroup, 
  ALL_BLOOD_GROUPS, 
  RBC_RECIPIENT_COMPATIBILITY, 
  RBC_DONOR_COMPATIBILITY, 
  canDonateRbcTo,
  STANDARD_ELIGIBILITY,
  CLINICAL_TRANSFUSION_DISCLAIMER 
} from '../../services/bloodCompatibilityService';

interface BloodCompatibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGroup?: BloodGroup;
}

export const BloodCompatibilityModal: React.FC<BloodCompatibilityModalProps> = ({
  isOpen,
  onClose,
  defaultGroup = 'O+'
}) => {
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>(defaultGroup);
  const [activeTab, setActiveTab] = useState<'calculator' | 'matrix' | 'eligibility'>('calculator');

  if (!isOpen) return null;

  const canReceiveFrom = RBC_RECIPIENT_COMPATIBILITY[selectedGroup] || [];
  const canDonateTo = RBC_DONOR_COMPATIBILITY[selectedGroup] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-xl">
              🩸
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight leading-tight">Blood Compatibility Guide</h2>
              <p className="text-xs text-red-100 font-medium">Red Blood Cell (RBC) Matching & Clinical Safeguards</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50/80 px-4 pt-2 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            🎯 Interactive Matcher
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            📊 8×8 Compatibility Matrix
          </button>
          <button
            onClick={() => setActiveTab('eligibility')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'eligibility'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            📋 Donor Eligibility Criteria
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-5 space-y-5 text-gray-900">
          
          {/* Clinical Disclaimer Banner */}
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs text-amber-950 flex items-start gap-3 shadow-sm">
            <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-black text-amber-900 uppercase tracking-wide block text-[11px]">
                Mandatory Clinical Warning
              </span>
              <p className="leading-relaxed">
                {CLINICAL_TRANSFUSION_DISCLAIMER}
              </p>
            </div>
          </div>

          {activeTab === 'calculator' && (
            <div className="space-y-5">
              {/* Blood Group Selector */}
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                  Select Blood Group to Check:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {ALL_BLOOD_GROUPS.map((bg) => {
                    const isSelected = selectedGroup === bg;
                    const isUniversalDonor = bg === 'O-';
                    const isUniversalRecipient = bg === 'AB+';
                    return (
                      <button
                        key={bg}
                        onClick={() => setSelectedGroup(bg)}
                        className={`py-3 rounded-2xl font-black text-base transition-all relative flex flex-col items-center justify-center border-2 ${
                          isSelected
                            ? 'bg-red-600 text-white border-red-600 shadow-md scale-105'
                            : 'bg-white text-gray-800 border-gray-200 hover:border-red-300'
                        }`}
                      >
                        <span>{bg}</span>
                        {isUniversalDonor && (
                          <span className={`text-[8px] font-bold mt-0.5 px-1 rounded uppercase ${
                            isSelected ? 'bg-red-800 text-white' : 'bg-red-100 text-red-700'
                          }`}>Univ. Donor</span>
                        )}
                        {isUniversalRecipient && (
                          <span className={`text-[8px] font-bold mt-0.5 px-1 rounded uppercase ${
                            isSelected ? 'bg-red-800 text-white' : 'bg-blue-100 text-blue-700'
                          }`}>Univ. Recip.</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Matcher Results Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* As Recipient */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                      📥
                    </div>
                    <div>
                      <h4 className="font-black text-emerald-950 text-sm">As a Recipient ({selectedGroup})</h4>
                      <p className="text-[11px] text-emerald-700 font-medium">Can safely receive RBCs from:</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {ALL_BLOOD_GROUPS.map(bg => {
                      const isCompatible = canReceiveFrom.includes(bg);
                      return (
                        <div 
                          key={'rec_' + bg} 
                          className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 ${
                            isCompatible 
                              ? 'bg-emerald-600 text-white shadow-sm' 
                              : 'bg-gray-100 text-gray-400 line-through opacity-60'
                          }`}
                        >
                          {isCompatible && <Check size={12} strokeWidth={3} />}
                          <span>{bg}</span>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-emerald-800 pt-1 font-medium">
                    {selectedGroup === 'AB+' 
                      ? '⭐ Universal Recipient: Can receive red blood cells from any blood group.' 
                      : `${canReceiveFrom.length} compatible donor group(s) available.`}
                  </p>
                </div>

                {/* As Donor */}
                <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-sm">
                      🎁
                    </div>
                    <div>
                      <h4 className="font-black text-rose-950 text-sm">As a Donor ({selectedGroup})</h4>
                      <p className="text-[11px] text-rose-700 font-medium">Can give RBCs to recipients with:</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {ALL_BLOOD_GROUPS.map(bg => {
                      const isCompatible = canDonateTo.includes(bg);
                      return (
                        <div 
                          key={'don_' + bg} 
                          className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 ${
                            isCompatible 
                              ? 'bg-rose-600 text-white shadow-sm' 
                              : 'bg-gray-100 text-gray-400 line-through opacity-60'
                          }`}
                        >
                          {isCompatible && <Check size={12} strokeWidth={3} />}
                          <span>{bg}</span>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-rose-800 pt-1 font-medium">
                    {selectedGroup === 'O-' 
                      ? '⭐ Universal Donor: Your O- red blood cells can be used in emergency trauma for any patient.' 
                      : `Can donate to ${canDonateTo.length} recipient group(s).`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'matrix' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-600">
                The authoritative red blood cell compatibility matrix. Rows represent the <strong>Patient (Recipient)</strong> and columns represent the <strong>Donor</strong>:
              </p>

              <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
                <table className="w-full text-center text-xs">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th className="p-2.5 font-bold text-left text-gray-600">Patient ↓ \ Donor →</th>
                      {ALL_BLOOD_GROUPS.map(d => (
                        <th key={'th_' + d} className="p-2 font-black text-gray-800">
                          {d}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_BLOOD_GROUPS.map((recipient, rIdx) => (
                      <tr 
                        key={'tr_' + recipient} 
                        className={`border-b border-gray-100 hover:bg-red-50/30 transition-colors ${
                          recipient === selectedGroup ? 'bg-red-50/60 font-bold' : rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        <td className="p-2.5 font-black text-left text-red-600 flex items-center gap-1.5">
                          <span>{recipient}</span>
                          {recipient === 'AB+' && <span className="text-[9px] bg-blue-100 text-blue-800 px-1 rounded">Univ</span>}
                        </td>
                        {ALL_BLOOD_GROUPS.map(donor => {
                          const compatible = canDonateRbcTo(donor, recipient);
                          return (
                            <td key={`cell_${recipient}_${donor}`} className="p-2">
                              {compatible ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-bold">
                                  ✓
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-gray-100 text-gray-300">
                                  -
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-gray-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span>Compatible RBC Transfusion</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-gray-100 text-gray-400 flex items-center justify-center text-[10px] font-bold">-</span>
                  <span>Incompatible</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'eligibility' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
                <h4 className="font-black text-blue-900 text-sm flex items-center gap-2">
                  <ShieldCheck size={18} className="text-blue-600" />
                  <span>Standard Physiological Donor Eligibility</span>
                </h4>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Every donor must satisfy standard physiological criteria before donation to ensure donor safety and recipient blood quality.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                  <span className="font-bold text-gray-900 block text-sm mb-1">🎂 Age</span>
                  <p className="text-gray-600">Between <strong>{STANDARD_ELIGIBILITY.minAgeYears} and {STANDARD_ELIGIBILITY.maxAgeYears} years</strong> of age.</p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                  <span className="font-bold text-gray-900 block text-sm mb-1">⚖️ Body Weight</span>
                  <p className="text-gray-600">Minimum <strong>{STANDARD_ELIGIBILITY.minWeightKg} kg</strong> (45 kg for females, 50 kg for double red cell/male donation).</p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                  <span className="font-bold text-gray-900 block text-sm mb-1">🩸 Hemoglobin Level</span>
                  <p className="text-gray-600">Minimum <strong>{STANDARD_ELIGIBILITY.minHemoglobinGdl} g/dL</strong> verified via on-site copper sulfate or hemoglobinometer test.</p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                  <span className="font-bold text-gray-900 block text-sm mb-1">⏱️ Donation Interval</span>
                  <p className="text-gray-600">At least <strong>{STANDARD_ELIGIBILITY.minDonationIntervalDays} days (3 months)</strong> between whole blood donations for males, and 120 days for females.</p>
                </div>
              </div>

              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-xs text-rose-900 space-y-2">
                <span className="font-black block uppercase tracking-wide text-rose-800">
                  Temporary Deferral Conditions:
                </span>
                <ul className="list-disc list-inside space-y-1 text-rose-800">
                  <li>Active fever, flu, or infection within past 7-14 days.</li>
                  <li>Antibiotic consumption within 48 hours.</li>
                  <li>Recent tattoo or ear piercing within the last 6 months.</li>
                  <li>Major surgical procedure within the last 6 months.</li>
                  <li>Pregnancy or breastfeeding within past 12 months.</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-black rounded-xl shadow-sm transition-all active:scale-95"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
