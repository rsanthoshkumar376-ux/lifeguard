import React, { useState, useRef, useId } from 'react';
import { 
  X, UploadCloud, FileText, Image, ShieldCheck, AlertCircle, 
  CheckCircle2, Calendar, Building, Tag, FileCheck
} from 'lucide-react';
import { 
  DocumentCategory, 
  validateDocumentFile, 
  fileToBase64, 
  addMedicalDocument,
  MAX_FILE_SIZE_BYTES
} from '../../services/healthRecordsService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
}

export const DocumentUploadModal: React.FC<Props> = ({ isOpen, onClose, onSaved, userId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [detectedType, setDetectedType] = useState<'pdf' | 'image'>('pdf');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<DocumentCategory>('laboratory');
  const [documentDate, setDocumentDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [facilityOrDoctor, setFacilityOrDoctor] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate unique IDs for form controls
  const fileUploadId = useId();
  const titleId = useId();
  const categoryId = useId();
  const dateId = useId();
  const facilityId = useId();
  const tagsId = useId();
  const summaryId = useId();

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setIsProcessing(true);

    try {
      const validation = await validateDocumentFile(file);
      if (!validation.valid) {
        setValidationError(validation.error || 'Invalid file.');
        setSelectedFile(null);
        setFilePreview(null);
        return;
      }

      setSelectedFile(file);
      setDetectedType(validation.detectedType || 'pdf');

      // Auto-populate title if empty
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTitle(cleanName);
      }

      // Generate preview data URL
      const b64 = await fileToBase64(file);
      setFilePreview(b64);
    } catch (err) {
      console.error(err);
      setValidationError('Failed to read and validate document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddTag = () => {
    const val = tagInput.trim();
    if (val && !tags.includes(val)) {
      setTags([...tags, val]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tToRemove: string) => {
    setTags(tags.filter(t => t !== tToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !filePreview) {
      setValidationError('Please select a valid PDF or image file.');
      return;
    }

    if (!title.trim()) {
      setValidationError('Please enter a document title.');
      return;
    }

    setIsProcessing(true);
    setValidationError(null);

    try {
      await addMedicalDocument({
        title: title.trim(),
        category,
        documentDate,
        fileType: detectedType,
        mimeType: selectedFile.type,
        fileSize: selectedFile.size,
        fileUrl: filePreview,
        fileName: selectedFile.name,
        facilityOrDoctor: facilityOrDoctor.trim() || undefined,
        summary: summary.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined
      }, userId);

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setValidationError('Failed to archive document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <UploadCloud size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Archive Medical Document</h2>
              <p className="text-xs text-gray-500">Securely store lab reports, prescriptions, and summaries</p>
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
          {/* File Dropzone */}
          <div>
            <label htmlFor={fileUploadId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Select Document File (PDF, JPG, PNG, WEBP - Max 10MB)
            </label>
            <input
              id={fileUploadId}
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,image/jpeg,image/png,image/webp"
              className="hidden"
            />

            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 dark:border-blue-700/60 hover:border-blue-500 rounded-2xl p-6 text-center bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                  <UploadCloud size={24} />
                </div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">Click or tap to choose file</p>
                <p className="text-xs text-gray-500 mt-1">Supports PDF lab reports, discharge slips, and scan images</p>
                <span className="inline-flex items-center gap-1 mt-2.5 px-3 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-[11px] font-bold text-blue-600 shadow-sm">
                  Browse Files
                </span>
              </div>
            ) : (
              <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    {detectedType === 'pdf' ? <FileText size={20} /> : <Image size={20} />}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-xs text-gray-900 dark:text-white truncate">{selectedFile.name}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {(selectedFile.size / 1024).toFixed(0)} KB • {detectedType.toUpperCase()} • Validated
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                  className="px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-3 rounded-xl flex items-start gap-2 text-xs text-red-900 dark:text-red-300">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Document Title */}
          <div>
            <label htmlFor={titleId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Document Title *
            </label>
            <input
              id={titleId}
              type="text"
              placeholder="e.g. Apollo HbA1c Lab Report, Cardiology Discharge Summary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            />
          </div>

          {/* Category & Date Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={categoryId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                id={categoryId}
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="laboratory">Laboratory / Pathology</option>
                <option value="prescription">Prescription Slip</option>
                <option value="discharge_summary">Discharge Summary</option>
                <option value="imaging_scan">Imaging / X-Ray / CT / MRI</option>
                <option value="vaccination">Vaccination Record</option>
                <option value="other">Other Medical Document</option>
              </select>
            </div>

            <div>
              <label htmlFor={dateId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Document / Report Date
              </label>
              <input
                id={dateId}
                type="date"
                value={documentDate}
                onChange={(e) => setDocumentDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Facility or Attending Physician */}
          <div>
            <label htmlFor={facilityId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Diagnostic Center / Hospital / Doctor (Optional)
            </label>
            <input
              id={facilityId}
              type="text"
              placeholder="e.g. Dr. R. Ramanathan, Apollo Diagnostics"
              value={facilityOrDoctor}
              onChange={(e) => setFacilityOrDoctor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label htmlFor={tagsId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Search Tags (e.g. HbA1c, Cholesterol, ECG)
            </label>
            <div className="flex gap-2">
              <input
                id={tagsId}
                type="text"
                placeholder="Add tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[11px] font-bold"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-red-500 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Clinical Findings / Summary */}
          <div>
            <label htmlFor={summaryId} className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Clinical Findings / Key Summary (Optional)
            </label>
            <textarea
              id={summaryId}
              rows={2}
              placeholder="e.g. HbA1c 6.4%, fasting blood sugar 98 mg/dL. All liver enzymes normal."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Privacy & Security Attestation */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-emerald-900 dark:text-emerald-300">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">End-to-End Privacy Guarded</p>
              <p className="mt-0.5 opacity-90">
                Uploaded records are client-encrypted and protected under your verified user ID. Only you and authorized caregivers can view them.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !selectedFile}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black shadow-md hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isProcessing ? 'Verifying...' : 'Archive Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
