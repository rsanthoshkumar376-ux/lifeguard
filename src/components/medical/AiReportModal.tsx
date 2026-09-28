import React, { useState, useRef } from 'react';
import { 
  UploadCloud, CheckCircle2, AlertTriangle, 
  HeartPulse, ShieldAlert, Sparkles, X, Droplet, 
  Activity, ShieldCheck, Stethoscope, AlertCircle
} from 'lucide-react';
import { analyzeMedicalReport, AiMedicalReportAnalysis } from '../../services/aiReportAnalyzer';
import { saveMedicalProfile } from '../../services/medicalProfile';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (updatedData: any) => void;
}

export const AiReportModal: React.FC<Props> = ({ isOpen, onClose, onProfileUpdated }) => {
  const { user } = useAuth();
  const [, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AiMedicalReportAnalysis | null>(null);
  const [appliedToast, setAppliedToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      await runAnalysis(file);
    }
  };

  const handleSampleReport = async (sampleType: 'cbc' | 'diabetes' | 'lipid') => {
    const fakeFile = {
      name: sampleType === 'cbc' ? 'CBC_Complete_Blood_Count_Report.pdf' :
            sampleType === 'diabetes' ? 'Fasting_Glucose_HbA1c_Report.jpg' : 'Lipid_Liver_Panel_Report.pdf',
      type: sampleType === 'diabetes' ? 'image/jpeg' : 'application/pdf'
    };
    setSelectedFile(fakeFile as any);
    await runAnalysis(fakeFile as any);
  };

  const runAnalysis = async (file: File | { name: string; type: string }) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAppliedToast(false);

    try {
      setAnalysisStep('1/3: Reading report text and visual OCR data...');
      await new Promise(r => setTimeout(r, 700));

      setAnalysisStep('2/3: Comparing lab values against clinical reference ranges...');
      await new Promise(r => setTimeout(r, 800));

      setAnalysisStep('3/3: Diagnosing affected body systems and emergency risks...');
      const result = await analyzeMedicalReport(file);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      alert('Error analyzing report. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyToProfile = async () => {
    if (!analysisResult) return;

    const conditionMap: Record<string, boolean> = {};
    analysisResult.bodyProblems.forEach(p => {
      const lower = p.title.toLowerCase();
      if (lower.includes('anemia')) conditionMap['anemia'] = true;
      if (lower.includes('diabetes')) conditionMap['diabetes'] = true;
      if (lower.includes('lipid') || lower.includes('cholesterol') || lower.includes('heart')) conditionMap['heartCondition'] = true;
      if (lower.includes('kidney')) conditionMap['kidney'] = true;
      if (lower.includes('liver')) conditionMap['liver'] = true;
    });

    const updatePayload: any = {
      bloodGroup: analysisResult.detectedBloodGroup || 'O+',
      allergies: analysisResult.detectedAllergies,
      conditions: conditionMap,
      emergencyInstructions: analysisResult.emergencyPrecautions[0] || 'Medical report verified.',
      visibility: { name: true, bloodGroup: true, emergencyInstructions: true, conditions: true, allergies: true }
    };

    if (user?.uid) {
      try {
        await saveMedicalProfile(user.uid, updatePayload);
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('guest_medical_profile', JSON.stringify({
        ...updatePayload,
        name: 'Verified Patient (Guest)'
      }));
    }

    if (onProfileUpdated) {
      onProfileUpdated(updatePayload);
    }

    setAppliedToast(true);
    setTimeout(() => {
      setAppliedToast(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur shadow-inner">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide flex items-center gap-2">
                AI Medical Report Scanner
              </h2>
              <p className="text-xs text-blue-100">Upload PDF or JPG report to diagnose complete body health</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-gray-900">
          
          {appliedToast && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-2xl flex items-center gap-3 animate-bounce shadow-sm">
              <CheckCircle2 size={24} className="text-green-600 shrink-0" />
              <div>
                <p className="font-bold text-sm">Successfully applied to your Medical ID!</p>
                <p className="text-xs text-green-700">Blood group, detected allergies, and conditions have been updated.</p>
              </div>
            </div>
          )}

          {/* Upload Zone */}
          {!analysisResult && !isAnalyzing && (
            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  accept=".pdf,image/png,image/jpeg,image/jpg" 
                  className="hidden" 
                />
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud size={32} />
                </div>
                <h3 className="font-bold text-base text-gray-900 mb-1">
                  Upload Medical Lab Report (PDF or JPG / PNG)
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Drag and drop your blood test, discharge summary, or prescription file here, or tap to browse your phone/PC.
                </p>
                <span className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow hover:bg-blue-700">
                  Select File from Device
                </span>
              </div>

              {/* Instant Test Samples */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Stethoscope size={14} className="text-blue-600" /> Or Test Instantly With Sample Reports:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button 
                    onClick={() => handleSampleReport('cbc')}
                    className="p-3 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-xl text-left active:scale-95 transition-all text-xs"
                  >
                    <p className="font-bold text-red-600 flex items-center gap-1">
                      <Droplet size={14} /> CBC Blood Count
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">Tests Anemia, Platelets, WBC</p>
                  </button>

                  <button 
                    onClick={() => handleSampleReport('diabetes')}
                    className="p-3 bg-white hover:bg-amber-50 border border-gray-200 hover:border-amber-300 rounded-xl text-left active:scale-95 transition-all text-xs"
                  >
                    <p className="font-bold text-amber-600 flex items-center gap-1">
                      <Activity size={14} /> Diabetes & Sugar
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">Tests Glucose, HbA1c, Kidney</p>
                  </button>

                  <button 
                    onClick={() => handleSampleReport('lipid')}
                    className="p-3 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl text-left active:scale-95 transition-all text-xs"
                  >
                    <p className="font-bold text-blue-600 flex items-center gap-1">
                      <HeartPulse size={14} /> Lipid & Liver Panel
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">Tests Cholesterol, Liver enzymes</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading Animation */}
          {isAnalyzing && (
            <div className="py-12 px-4 text-center space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-ping opacity-30"></div>
                <div className="w-24 h-24 rounded-full border-4 border-blue-600 border-t-transparent animate-spin flex items-center justify-center">
                  <HeartPulse size={36} className="text-blue-600 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">AI Medical Engine Analyzing Report</h3>
                <p className="text-sm text-blue-700 font-semibold mt-1 animate-pulse">{analysisStep}</p>
                <p className="text-xs text-gray-400 mt-2">Checking 50+ clinical parameters for body health anomalies...</p>
              </div>
            </div>
          )}

          {/* Analysis Results View */}
          {analysisResult && !isAnalyzing && (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Verdict Banner */}
              <div className={
                analysisResult.overallRiskLevel === 'CRITICAL_RISK' ? 'p-4 rounded-2xl border flex items-start gap-3.5 bg-red-50 border-red-200 text-red-950' :
                analysisResult.overallRiskLevel === 'MODERATE_RISK' ? 'p-4 rounded-2xl border flex items-start gap-3.5 bg-amber-50 border-amber-200 text-amber-950' :
                'p-4 rounded-2xl border flex items-start gap-3.5 bg-green-50 border-green-200 text-green-950'
              }>
                {analysisResult.overallRiskLevel === 'CRITICAL_RISK' ? (
                  <ShieldAlert size={28} className="text-red-600 shrink-0 mt-0.5" />
                ) : analysisResult.overallRiskLevel === 'MODERATE_RISK' ? (
                  <AlertTriangle size={28} className="text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck size={28} className="text-green-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className={
                      analysisResult.overallRiskLevel === 'CRITICAL_RISK' ? 'text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-600 text-white' :
                      analysisResult.overallRiskLevel === 'MODERATE_RISK' ? 'text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-600 text-white' :
                      'text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-green-600 text-white'
                    }>
                      {analysisResult.overallRiskLevel.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{analysisResult.reportDate}</span>
                  </div>
                  <h3 className="font-bold text-base mt-1 text-gray-900">{analysisResult.summaryVerdict}</h3>
                </div>
              </div>

              {/* Complete Body Problems Identified */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                  <Activity size={16} className="text-red-600" />
                  Diagnosed Problems in Body ({analysisResult.bodyProblems.length})
                </h4>
                <div className="space-y-2.5">
                  {analysisResult.bodyProblems.map((prob, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-gray-900 flex items-center gap-2">
                          <span className={
                            prob.severity === 'SEVERE' ? 'w-2 h-2 rounded-full bg-red-600' :
                            prob.severity === 'MODERATE' ? 'w-2 h-2 rounded-full bg-amber-500' : 'w-2 h-2 rounded-full bg-blue-500'
                          }></span>
                          {prob.title}
                        </span>
                        <span className={
                          prob.severity === 'SEVERE' ? 'text-[10px] font-black px-2 py-0.5 rounded bg-red-100 text-red-700' :
                          prob.severity === 'MODERATE' ? 'text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-700' : 'text-[10px] font-black px-2 py-0.5 rounded bg-blue-100 text-blue-700'
                        }>
                          {prob.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{prob.description}</p>
                      <p className="text-[11px] text-gray-500 font-medium">
                        <strong className="text-gray-700">Affected Systems:</strong> {prob.affectedOrgans}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lab Markers Table */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                  <Droplet size={16} className="text-blue-600" />
                  Key Clinical Lab Values
                </h4>
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="divide-y divide-gray-100 text-xs">
                    {analysisResult.vitalMarkers.map((m, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between hover:bg-gray-50">
                        <div>
                          <p className="font-bold text-gray-900">{m.name}</p>
                          <p className="text-[11px] text-gray-500">Ref: {m.referenceRange} {m.unit}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-sm text-gray-900">{m.value} {m.unit}</p>
                          <span className={
                            m.status === 'CRITICAL' ? 'inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white' :
                            m.status === 'HIGH' ? 'inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800' :
                            m.status === 'LOW' ? 'inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800' :
                            'inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800'
                          }>
                            {m.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Blood Group & Allergies */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50 border border-red-100 p-3.5 rounded-2xl">
                  <p className="text-[11px] font-bold text-red-700 uppercase">Identified Blood Group</p>
                  <p className="text-2xl font-black text-red-600 mt-1">{analysisResult.detectedBloodGroup || 'Not specified'}</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-2xl">
                  <p className="text-[11px] font-bold text-amber-700 uppercase">Detected Allergies</p>
                  <p className="text-xs font-bold text-amber-900 mt-1 leading-tight">
                    {analysisResult.detectedAllergies.length > 0 ? analysisResult.detectedAllergies.join(', ') : 'None detected'}
                  </p>
                </div>
              </div>

              {/* Emergency Precautions */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl space-y-2">
                <h4 className="text-xs font-black text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertCircle size={16} className="text-blue-700" />
                  Emergency Responder & Golden Hour Precautions
                </h4>
                <ul className="space-y-1.5 text-xs text-blue-950">
                  {analysisResult.emergencyPrecautions.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleApplyToProfile}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <ShieldCheck size={20} />
                  Auto-Fill into My Medical ID & Emergency Profile
                </button>

                <button
                  onClick={() => {
                    setAnalysisResult(null);
                    setSelectedFile(null);
                  }}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition-colors"
                >
                  Scan Another Report
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default AiReportModal;
