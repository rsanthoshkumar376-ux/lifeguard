import React, { useState } from 'react';
import { UploadCloud, FileText, Trash2, Shield, Sparkles, Activity, CheckCircle2 } from 'lucide-react';
import AiReportModal from '../../components/medical/AiReportModal';

interface RecordItem {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  aiDiagnosis?: string;
  status?: 'CRITICAL' | 'MODERATE' | 'NORMAL';
}

const MedicalRecordsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [files, setFiles] = useState<RecordItem[]>([
    { 
      id: '1', 
      name: 'Blood_Test_CBC_Report.pdf', 
      type: 'Lab Reports', 
      date: 'Today', 
      size: '1.8 MB',
      aiDiagnosis: 'Severe Anemia (Hb 7.8) & Low Platelets',
      status: 'CRITICAL'
    },
    { 
      id: '2', 
      name: 'Prescription_Glucose_HbA1c.jpg', 
      type: 'Prescriptions', 
      date: '2 days ago', 
      size: '2.1 MB',
      aiDiagnosis: 'Type 2 Diabetes (FBS 188) & Renal Monitor',
      status: 'MODERATE'
    }
  ]);

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this record?')) {
      setFiles(files.filter(f => f.id !== id));
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pb-28 text-gray-900">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-xs text-gray-500">AI-verified prescriptions and lab reports</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <Sparkles size={16} /> Scan with AI
        </button>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-5 flex items-start gap-3 shadow-sm">
        <Shield className="text-blue-600 shrink-0 mt-0.5" size={20} />
        <div>
          <p className="text-xs text-blue-900 font-bold">End-to-End Private & Encrypted</p>
          <p className="text-[11px] text-blue-800 mt-0.5">
            Your uploaded PDF and JPG medical records are analyzed for health hazards and will only be shared with emergency first-responders if you authorize it.
          </p>
        </div>
      </div>

      {/* AI Upload Trigger Card */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className="border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-3xl p-6 text-center bg-gradient-to-b from-blue-50/40 to-white hover:bg-blue-50 transition-all cursor-pointer mb-6 shadow-sm group"
      >
        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform shadow-inner">
          <UploadCloud size={28} />
        </div>
        <p className="font-black text-gray-900 text-sm">Upload New Medical Report (PDF / JPG)</p>
        <p className="text-xs text-gray-500 mt-1">
          Our AI reads the report, finds all health problems, and auto-fills your Medical ID
        </p>
        <span className="inline-flex items-center gap-1 mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow">
          <Sparkles size={14} /> Open AI Scanner
        </span>
      </div>

      <h2 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-3 px-1">
        Your Analyzed Records ({files.length})
      </h2>
      
      <div className="space-y-3">
        {files.map(file => (
          <div key={file.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-xl shrink-0 mt-0.5 border border-blue-100">
                <FileText size={22} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">{file.name}</h3>
                <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                  <span className="bg-gray-100 px-2 py-0.5 rounded font-medium">{file.type}</span>
                  <span>•</span>
                  <span>{file.date}</span>
                  <span>•</span>
                  <span>{file.size}</span>
                </div>
                {file.aiDiagnosis && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <Activity size={12} className="text-red-600 shrink-0" />
                    <span className="text-[11px] font-bold text-gray-800">AI Diagnosis:</span>
                    <span className="text-[11px] text-red-600 font-semibold">{file.aiDiagnosis}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-200"
              >
                View Analysis
              </button>
              <button 
                onClick={() => handleDelete(file.id)} 
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Report Scanner Modal */}
      <AiReportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default MedicalRecordsPage;
