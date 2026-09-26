import React, { useState } from 'react';
import { UploadCloud, FileText, Trash2, Shield } from 'lucide-react';

const MedicalRecordsPage = () => {
  const [files, setFiles] = useState<{id: string, name: string, type: string, date: string, size: string}[]>([
    { id: '1', name: 'Blood_Test_Report.pdf', type: 'Lab Reports', date: '2023-10-15', size: '2.4 MB' },
    { id: '2', name: 'Prescription_Dr_Smith.jpg', type: 'Prescriptions', date: '2023-11-02', size: '1.1 MB' }
  ]);

  const handleDelete = (id: string) => {
    if(window.confirm('Delete this record?')) {
      setFiles(files.filter(f => f.id !== id));
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24">
      <h1 className="text-2xl font-bold mb-2 text-slate-800">Medical Records</h1>
      
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Shield className="text-blue-500 shrink-0 mt-1" size={20} />
        <p className="text-sm text-blue-800 font-medium">
          These records are private and will NOT appear on your Emergency ID unless you explicitly enable it.
        </p>
      </div>

      <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer mb-8">
        <UploadCloud className="mx-auto text-slate-400 mb-3" size={40} />
        <p className="font-bold text-slate-700">Tap to Upload File</p>
        <p className="text-sm text-slate-500 mt-1">Supported: PDF, JPEG, PNG (max 20MB)</p>
      </div>

      <h2 className="text-lg font-bold text-slate-800 mb-4">Your Files</h2>
      
      <div className="space-y-3">
        {files.map(file => (
          <div key={file.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-slate-100 p-3 rounded-lg text-slate-500">
              <FileText size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-800 truncate">{file.name}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span className="bg-slate-100 px-2 py-1 rounded">{file.type}</span>
                <span>{file.date}</span>
                <span>{file.size}</span>
              </div>
            </div>
            <button onClick={() => handleDelete(file.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalRecordsPage;
