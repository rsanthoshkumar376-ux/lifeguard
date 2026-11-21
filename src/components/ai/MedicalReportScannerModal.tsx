import React, { useState, useRef } from 'react';
import { 
  X, UploadCloud, FileText, CheckCircle2, AlertTriangle, 
  HelpCircle, Sparkles, Copy, Printer, ArrowRight, ShieldAlert, 
  Info, ExternalLink, ChevronRight, Stethoscope
} from 'lucide-react';
import { 
  scanMedicalReport, 
  generateDoctorSummary, 
  MedicalReportAnalysisResult, 
  ExtractedLabTest 
} from '../../services/geminiAiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
  onSendToChat?: (summaryText: string) => void;
}

export const MedicalReportScannerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  language = 'en',
  onSendToChat
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [result, setResult] = useState<MedicalReportAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'tests' | 'explanation' | 'questions' | 'summary'>('tests');
  const [doctorSummaryText, setDoctorSummaryText] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [copiedQuestionIdx, setCopiedQuestionIdx] = useState<number | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      await processReport(file);
    }
  };

  const loadSample = async (type: 'cbc' | 'diabetes' | 'lipid') => {
    const fakeFile = new File(
      ['dummy sample content'],
      type === 'cbc' ? 'CBC_Blood_Test_Report.pdf' :
      type === 'diabetes' ? 'Fasting_Blood_Glucose_HbA1c.jpg' : 'Lipid_Panel_Liver_Function.pdf',
      { type: type === 'diabetes' ? 'image/jpeg' : 'application/pdf' }
    );
    setSelectedFile(fakeFile);
    await processReport(fakeFile);
  };

  const processReport = async (file: File) => {
    setIsScanning(true);
    setResult(null);
    setErrorMsg(null);
    setDoctorSummaryText('');

    try {
      setScanStep('1/3: Reading report text & multimodal visual data...');
      await new Promise(r => setTimeout(r, 600));

      setScanStep('2/3: Identifying test names, values, units & reference ranges...');
      await new Promise(r => setTimeout(r, 600));

      setScanStep('3/3: Comparing values against reference ranges & evaluating uncertainty...');
      const data = await scanMedicalReport(file, language);
      setResult(data);
      setActiveTab('tests');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to analyze medical report. Please check file format and try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!result) return;
    setIsGeneratingSummary(true);
    try {
      const abnormalTests = result.tests.filter(t => t.status !== 'NORMAL');
      const textToSummarize = `Report: ${result.reportTitle}\nVerdict: ${result.summaryVerdict}\n` +
        `Abnormal Markers:\n` +
        abnormalTests.map(t => `- ${t.testName}: ${t.measuredValue} ${t.unit} (Ref: ${t.referenceRange}) [${t.status}]`).join('\n') +
        `\nNormal Markers Count: ${result.tests.length - abnormalTests.length}`;

      const summary = await generateDoctorSummary(textToSummarize, language);
      setDoctorSummaryText(summary.summaryMarkdown);
      setActiveTab('summary');
    } catch (err) {
      console.error('Failed to generate summary:', err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const copyToClipboard = (text: string, idx?: number) => {
    navigator.clipboard.writeText(text);
    if (idx !== undefined) {
      setCopiedQuestionIdx(idx);
      setTimeout(() => setCopiedQuestionIdx(null), 2000);
    } else {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  const handleSendSummaryToChat = () => {
    if (!result) return;
    const text = doctorSummaryText || `📄 **Report Analysis Summary for ${result.reportTitle}**\n\n` +
      `**Verdict:** ${result.summaryVerdict}\n\n` +
      `**Key Abnormal Tests:**\n` +
      result.tests.filter(t => t.status !== 'NORMAL')
        .map(t => `• **${t.testName}:** ${t.measuredValue} ${t.unit} (Ref: ${t.referenceRange}) - *${t.status}*`)
        .join('\n') +
      `\n\n*What questions should I ask my doctor about these readings?*`;

    if (onSendToChat) {
      onSendToChat(text);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                AI Medical Report Scanner
                {result?.source === 'gemini_multimodal' && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    Gemini 3.8 Flash
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Multimodal OCR extraction, reference range analysis & plain-language explanation
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
                className="border-2 border-dashed border-teal-300 dark:border-teal-700/60 hover:border-teal-500 bg-teal-50/40 dark:bg-teal-950/20 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all hover:shadow-md group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf,image/jpeg,image/png,image/webp" 
                  className="hidden" 
                />
                <div className="w-14 h-14 mx-auto rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Upload Diagnostic Report (PDF or Image)
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-3">
                  Upload laboratory tests (CBC, Blood Sugar, Lipid, Renal, Liver, Thyroid). Max file size 10MB.
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-teal-600 text-white shadow-sm">
                  Browse Files or Take Photo
                </span>
              </div>

              {/* Sample Reports for Quick Testing */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Or Test with Sample Diagnostic Reports:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => loadSample('cbc')}
                    className="p-3 text-left rounded-xl border border-gray-200 dark:border-slate-800 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-slate-800/80 transition-all text-xs"
                  >
                    <span className="font-bold text-gray-800 dark:text-gray-200 block">🩸 CBC Blood Count</span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">Hemoglobin, Platelets, RBC</span>
                  </button>
                  <button
                    onClick={() => loadSample('diabetes')}
                    className="p-3 text-left rounded-xl border border-gray-200 dark:border-slate-800 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-slate-800/80 transition-all text-xs"
                  >
                    <span className="font-bold text-gray-800 dark:text-gray-200 block">🍬 Diabetes & Renal</span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">Fasting Glucose, HbA1c, Creatinine</span>
                  </button>
                  <button
                    onClick={() => loadSample('lipid')}
                    className="p-3 text-left rounded-xl border border-gray-200 dark:border-slate-800 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-slate-800/80 transition-all text-xs"
                  >
                    <span className="font-bold text-gray-800 dark:text-gray-200 block">🫀 Lipid & Liver Panel</span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">Cholesterol, Triglycerides, SGPT</span>
                  </button>
                </div>
              </div>

              {/* Progress Indicator */}
              {isScanning && (
                <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-2 animate-pulse">
                  <div className="flex items-center justify-between text-xs font-semibold text-teal-800 dark:text-teal-200">
                    <span>{scanStep}</span>
                    <span className="animate-spin text-teal-600">⏳</span>
                  </div>
                  <div className="w-full bg-teal-200 dark:bg-teal-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-teal-600 h-full w-3/4 animate-pulse rounded-full" />
                  </div>
                </div>
              )}

              {/* Error Message */}
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
              
              {/* Report Header Banner */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      {result.reportTitle}
                    </span>
                    {result.detectedBloodGroup && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        🩸 {result.detectedBloodGroup}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Date: {result.reportDate || 'Recent'} • Patient: {result.patientName || 'Patient'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    result.overallRiskLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300' :
                    result.overallRiskLevel === 'MODERATE' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300' :
                    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                  }`}>
                    {result.overallRiskLevel === 'CRITICAL' ? '🚨 Critical Review Advised' :
                     result.overallRiskLevel === 'MODERATE' ? '⚠️ Moderate Clinical Attention' : '✅ Optimal Diagnostic Bounds'}
                  </span>
                  <button
                    onClick={() => { setSelectedFile(null); setResult(null); }}
                    className="text-xs text-teal-600 dark:text-teal-400 underline font-medium hover:text-teal-700"
                  >
                    Scan Another
                  </button>
                </div>
              </div>

              {/* Verdict Highlight */}
              <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60">
                <p className="text-xs font-semibold text-teal-900 dark:text-teal-200">
                  {result.summaryVerdict}
                </p>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-gray-200 dark:border-slate-800 text-xs font-medium">
                <button
                  onClick={() => setActiveTab('tests')}
                  className={`px-4 py-2.5 border-b-2 font-semibold transition-colors ${
                    activeTab === 'tests' 
                      ? 'border-teal-600 text-teal-600 dark:text-teal-400' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Lab Test Table ({result.tests.length})
                </button>
                <button
                  onClick={() => setActiveTab('explanation')}
                  className={`px-4 py-2.5 border-b-2 font-semibold transition-colors ${
                    activeTab === 'explanation' 
                      ? 'border-teal-600 text-teal-600 dark:text-teal-400' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Plain-Language Explanations
                </button>
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`px-4 py-2.5 border-b-2 font-semibold transition-colors ${
                    activeTab === 'questions' 
                      ? 'border-teal-600 text-teal-600 dark:text-teal-400' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Questions for Doctor ({result.questionsForDoctor.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('summary');
                    if (!doctorSummaryText) handleGenerateSummary();
                  }}
                  className={`px-4 py-2.5 border-b-2 font-semibold transition-colors ${
                    activeTab === 'summary' 
                      ? 'border-teal-600 text-teal-600 dark:text-teal-400' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Doctor Summary
                </button>
              </div>

              {/* Tab 1: Extracted Lab Tests Table */}
              {activeTab === 'tests' && (
                <div className="space-y-3">
                  <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-100 dark:bg-slate-800/80 text-gray-600 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-slate-700">
                        <tr>
                          <th className="p-3">Test Name</th>
                          <th className="p-3">Measured Value</th>
                          <th className="p-3">Reference Range</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Confidence / Uncertainty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-gray-300">
                        {result.tests.map((test, idx) => {
                          const isHigh = test.status === 'HIGH' || test.status === 'CRITICAL';
                          const isLow = test.status === 'LOW';
                          const isNormal = test.status === 'NORMAL';
                          const isUncertain = test.confidence === 'UNCERTAIN';

                          return (
                            <tr key={idx} className={!isNormal ? 'bg-amber-50/40 dark:bg-amber-950/10' : ''}>
                              <td className="p-3">
                                <span className="font-bold text-gray-900 dark:text-white block">{test.testName}</span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">{test.whatItMeasures}</span>
                              </td>
                              <td className="p-3 font-semibold text-gray-900 dark:text-white">
                                {test.measuredValue} <span className="text-gray-500 font-normal text-[11px]">{test.unit}</span>
                              </td>
                              <td className="p-3 text-gray-500 dark:text-gray-400 font-mono text-[11px]">
                                {test.referenceRange || 'Not Printed'}
                              </td>
                              <td className="p-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  test.status === 'CRITICAL' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                                  test.status === 'HIGH' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                                  test.status === 'LOW' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                                  'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                }`}>
                                  {test.status === 'CRITICAL' && '🚨 Critical'}
                                  {test.status === 'HIGH' && '▲ High'}
                                  {test.status === 'LOW' && '▼ Low'}
                                  {test.status === 'NORMAL' && '✓ Normal'}
                                </span>
                              </td>
                              <td className="p-3">
                                {isUncertain ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold" title={test.uncertaintyReason || 'Unclear print/handwriting'}>
                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                    <span>Uncertain Scan</span>
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> High Confidence
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-gray-400 italic">
                    💡 Highlighted rows indicate values outside standard printed reference intervals. Consult your physician for clinical correlation.
                  </p>
                </div>
              )}

              {/* Tab 2: Plain-Language Explanations */}
              {activeTab === 'explanation' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 space-y-2">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" /> Understanding Your Results in Simple Words
                    </h5>
                    <div className="text-xs text-gray-700 dark:text-gray-300 space-y-2 whitespace-pre-line leading-relaxed">
                      {result.simpleLanguageExplanation}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-semibold text-xs text-gray-700 dark:text-gray-300">
                      Why Did Some Markers Deviate From Normal?
                    </h5>
                    {result.tests.filter(t => t.status !== 'NORMAL').map((t, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10 text-xs">
                        <span className="font-bold text-amber-900 dark:text-amber-200 block mb-0.5">
                          {t.testName} ({t.measuredValue} {t.unit})
                        </span>
                        <p className="text-gray-600 dark:text-gray-300 text-[11px]">
                          {t.clinicalDifferenceExplanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Questions for Doctor */}
              {activeTab === 'questions' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Take these tailored questions to your physician consultation to better understand your lab report:
                  </p>
                  <div className="space-y-2">
                    {result.questionsForDoctor.map((q, idx) => (
                      <div 
                        key={idx} 
                        className="p-3 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-teal-500 bg-white dark:bg-slate-800/50 flex items-start justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-xs text-gray-800 dark:text-gray-200 font-medium">
                            {q}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(q, idx)}
                          className="p-1.5 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg shrink-0 transition-colors"
                          title="Copy question"
                        >
                          {copiedQuestionIdx === idx ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Doctor Consultation Summary */}
              {activeTab === 'summary' && (
                <div className="space-y-3">
                  {isGeneratingSummary ? (
                    <div className="p-8 text-center space-y-2">
                      <div className="w-8 h-8 mx-auto border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-gray-500">Generating executive doctor consultation summary...</p>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 text-xs font-mono whitespace-pre-wrap text-gray-800 dark:text-gray-200 max-h-72 overflow-y-auto">
                        {doctorSummaryText || 'Generating summary...'}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          onClick={() => copyToClipboard(doctorSummaryText)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          {copiedSummary ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          {copiedSummary ? 'Copied!' : 'Copy Summary'}
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                          Print for Doctor
                        </button>
                        {onSendToChat && (
                          <button
                            onClick={handleSendSummaryToChat}
                            className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm ml-auto transition-colors"
                          >
                            <span>Discuss in AI Health Chat</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Safety Banner */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <p>
                  <strong>Clinical Safety Notice:</strong> {result.disclaimer}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            Emergency? Call <strong>108</strong> (Ambulance) or <strong>112</strong> immediately.
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

export default MedicalReportScannerModal;
