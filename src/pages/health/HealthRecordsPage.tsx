import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, Activity, Heart, HeartPulse, Droplet, Thermometer, Plus, UploadCloud, 
  Calendar, Clock, Shield, Lock, AlertTriangle, Stethoscope, Search, 
  Filter, Trash2, ExternalLink, Printer, CheckCircle2, ChevronRight,
  Sparkles, Scissors, Users, AlertCircle, Eye, Download, Info
} from 'lucide-react';
import { 
  DigitalHealthProfile, 
  getHealthProfile, 
  deleteMedicalDocument,
  deleteVitalRecord,
  deleteTimelineEvent,
  MedicalDocument,
  DocumentCategory,
  TimelineEventType
} from '../../services/healthRecordsService';
import { VitalsChart } from '../../components/health/VitalsChart';
import { VitalEntryModal } from '../../components/health/VitalEntryModal';
import { DocumentUploadModal } from '../../components/health/DocumentUploadModal';
import { HistoryEntryModal } from '../../components/health/HistoryEntryModal';
import { CaregiverManageModal } from '../../components/health/CaregiverManageModal';
import { MedicalSummaryPrintModal } from '../../components/health/MedicalSummaryPrintModal';
import { Link } from 'react-router-dom';

type TabType = 'dashboard' | 'vitals' | 'documents' | 'timeline' | 'history' | 'caregivers';

const HealthRecordsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<DigitalHealthProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isVitalModalOpen, setIsVitalModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historySection, setHistorySection] = useState<'condition' | 'surgery' | 'allergy' | 'family' | 'note'>('condition');
  const [isCaregiverModalOpen, setIsCaregiverModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // Filter state for Documents tab
  const [docCategoryFilter, setDocCategoryFilter] = useState<DocumentCategory | 'all'>('all');
  const [docSearchQuery, setDocSearchQuery] = useState('');

  // Filter state for Timeline tab
  const [timelineTypeFilter, setTimelineTypeFilter] = useState<TimelineEventType | 'all'>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getHealthProfile(user?.uid);
      setProfile(data);
    } catch (err) {
      console.error('Failed to load health profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (loading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Loading Secure Digital Health Records...</p>
        <p className="text-xs text-gray-400 mt-1">Decrypting medical history, documents & vital logs</p>
      </div>
    );
  }

  // Latest vitals computation
  const latestBp = profile.vitals.find(v => v.type === 'blood_pressure');
  const latestHr = profile.vitals.find(v => v.type === 'heart_rate');
  const latestSpo2 = profile.vitals.find(v => v.type === 'spo2');
  const latestGlucose = profile.vitals.find(v => v.type === 'blood_glucose');
  const latestTemp = profile.vitals.find(v => v.type === 'temperature');

  // Filtered documents
  const filteredDocuments = profile.documents.filter(doc => {
    const matchCategory = docCategoryFilter === 'all' || doc.category === docCategoryFilter;
    const matchSearch = docSearchQuery === '' || 
      doc.title.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
      (doc.facilityOrDoctor && doc.facilityOrDoctor.toLowerCase().includes(docSearchQuery.toLowerCase())) ||
      (doc.tags && doc.tags.some(t => t.toLowerCase().includes(docSearchQuery.toLowerCase())));
    return matchCategory && matchSearch;
  });

  // Filtered timeline events
  const filteredTimeline = profile.timeline
    .filter(ev => timelineTypeFilter === 'all' || ev.type === timelineTypeFilter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDeleteDoc = async (id: string) => {
    if (window.confirm('Delete this medical document from your permanent record?')) {
      await deleteMedicalDocument(id, user?.uid);
      loadData();
    }
  };

  const handleDeleteVital = async (id: string) => {
    if (window.confirm('Delete this vital measurement reading?')) {
      await deleteVitalRecord(id, user?.uid);
      loadData();
    }
  };

  const handleDeleteTimeline = async (id: string) => {
    if (window.confirm('Remove this event from your health timeline?')) {
      await deleteTimelineEvent(id, user?.uid);
      loadData();
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto pb-28 text-gray-900 dark:text-gray-100">
      {/* Top Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              EHR / PHR Module
            </span>
            <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
              <Lock size={12} className="text-emerald-500" /> Client-Encrypted
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            Digital Health Records
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Personal medical history, diagnostic documents, health timeline & continuous vitals
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSummaryModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl text-xs font-black shadow-md hover:from-red-700 hover:to-rose-700 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Printer size={15} /> Export Doctor Summary
          </button>

          <button
            onClick={() => setIsCaregiverModalOpen(true)}
            className="px-3 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-700 flex items-center gap-1.5"
          >
            <Shield size={15} className="text-blue-600" /> Caregivers ({profile.caregivers.filter(c => c.status === 'active').length})
          </button>
        </div>
      </div>

      {/* Guest Mode Notice (If not authenticated) */}
      {!isAuthenticated && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-3.5 mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">Local Offline Mode Active</p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                Records are currently stored on this device. Sign in with Firebase to automatically sync and enable multi-device caregiver access.
              </p>
            </div>
          </div>
          <Link
            to="/login"
            className="px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold shrink-0 hover:bg-amber-700"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <div className="flex bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-1 mb-5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'dashboard'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <Activity size={15} /> Dashboard
        </button>

        <button
          onClick={() => setActiveTab('vitals')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'vitals'
              ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <Heart size={15} /> Vitals & Charts
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'documents'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <FileText size={15} /> Documents ({profile.documents.length})
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'timeline'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <Clock size={15} /> Health Timeline
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <Stethoscope size={15} /> Medical History
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DASHBOARD OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Quick Action Shortcuts Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => setIsVitalModalOpen(true)}
              className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl flex items-center gap-2.5 text-left hover:bg-red-100 transition-all active:scale-95 group"
            >
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Heart size={18} />
              </div>
              <div>
                <p className="font-black text-xs text-red-900 dark:text-red-200">+ Record Vital</p>
                <p className="text-[10px] text-red-700 dark:text-red-400">BP, Pulse, SpO2, Sugar</p>
              </div>
            </button>

            <button
              onClick={() => setIsDocModalOpen(true)}
              className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-2xl flex items-center gap-2.5 text-left hover:bg-blue-100 transition-all active:scale-95 group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <UploadCloud size={18} />
              </div>
              <div>
                <p className="font-black text-xs text-blue-900 dark:text-blue-200">+ Upload Report</p>
                <p className="text-[10px] text-blue-700 dark:text-blue-400">PDF, JPG, Lab Slips</p>
              </div>
            </button>

            <button
              onClick={() => {
                setHistorySection('condition');
                setIsHistoryModalOpen(true);
              }}
              className="p-3 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/40 rounded-2xl flex items-center gap-2.5 text-left hover:bg-teal-100 transition-all active:scale-95 group"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Stethoscope size={18} />
              </div>
              <div>
                <p className="font-black text-xs text-teal-900 dark:text-teal-200">+ Add History</p>
                <p className="text-[10px] text-teal-700 dark:text-teal-400">Surgery, Allergy, Notes</p>
              </div>
            </button>

            <button
              onClick={() => setIsSummaryModalOpen(true)}
              className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 rounded-2xl flex items-center gap-2.5 text-left hover:bg-purple-100 transition-all active:scale-95 group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Printer size={18} />
              </div>
              <div>
                <p className="font-black text-xs text-purple-900 dark:text-purple-200">Doctor Summary</p>
                <p className="text-[10px] text-purple-700 dark:text-purple-400">Export Clinical PDF</p>
              </div>
            </button>
          </div>

          {/* LATEST RECORDED VITALS CARDS (5 VITALS GRID) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Heart size={14} className="text-red-500" /> Latest Recorded Vitals
              </h2>
              <button
                onClick={() => setActiveTab('vitals')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
              >
                View Trend Charts <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {/* BP Card */}
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-gray-500 mb-1">
                  <span className="text-[10px] uppercase font-bold">Blood Pressure</span>
                  <Activity size={14} className="text-red-500" />
                </div>
                <p className="text-lg font-black text-gray-900 dark:text-white">
                  {latestBp ? `${latestBp.value.systolic}/${latestBp.value.diastolic}` : '—'}
                  <span className="text-[10px] font-normal text-gray-500 ml-1">mmHg</span>
                </p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  latestBp?.status === 'normal' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                  latestBp?.status === 'borderline' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                  'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                }`}>
                  {latestBp?.status || 'No Log'}
                </span>
              </div>

              {/* Heart Rate Card */}
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-gray-500 mb-1">
                  <span className="text-[10px] uppercase font-bold">Heart Rate</span>
                  <Heart size={14} className="text-pink-500" />
                </div>
                <p className="text-lg font-black text-gray-900 dark:text-white">
                  {latestHr ? latestHr.value.bpm : '—'}
                  <span className="text-[10px] font-normal text-gray-500 ml-1">BPM</span>
                </p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  latestHr?.status === 'normal' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                  'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {latestHr?.status || 'No Log'}
                </span>
              </div>

              {/* SpO2 Card */}
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-gray-500 mb-1">
                  <span className="text-[10px] uppercase font-bold">SpO2 Oxygen</span>
                  <Droplet size={14} className="text-cyan-500" />
                </div>
                <p className="text-lg font-black text-gray-900 dark:text-white">
                  {latestSpo2 ? `${latestSpo2.value.percentage}%` : '—'}
                </p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  latestSpo2?.status === 'normal' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                  'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                }`}>
                  {latestSpo2?.status || 'No Log'}
                </span>
              </div>

              {/* Blood Glucose Card */}
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-gray-500 mb-1">
                  <span className="text-[10px] uppercase font-bold">Blood Glucose</span>
                  <Activity size={14} className="text-amber-500" />
                </div>
                <p className="text-lg font-black text-gray-900 dark:text-white">
                  {latestGlucose ? latestGlucose.value.glucose : '—'}
                  <span className="text-[10px] font-normal text-gray-500 ml-1">mg/dL</span>
                </p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  latestGlucose?.status === 'normal' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                  latestGlucose?.status === 'borderline' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                  'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                }`}>
                  {latestGlucose?.value.glucoseContext || 'Glucose'}
                </span>
              </div>

              {/* Temperature Card */}
              <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-gray-500 mb-1">
                  <span className="text-[10px] uppercase font-bold">Temperature</span>
                  <Thermometer size={14} className="text-purple-500" />
                </div>
                <p className="text-lg font-black text-gray-900 dark:text-white">
                  {latestTemp ? `${latestTemp.value.temperature}°${latestTemp.value.tempUnit || 'F'}` : '—'}
                </p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  latestTemp?.status === 'normal' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                  'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {latestTemp?.status || 'No Log'}
                </span>
              </div>
            </div>
          </div>

          {/* UPCOMING APPOINTMENTS & IMPORTANT ALERTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Upcoming Consultations */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Calendar size={16} className="text-blue-600" /> Upcoming Doctor Consultations
                </h3>
                <span className="text-[10px] font-bold text-gray-400">
                  {profile.appointments.length} Scheduled
                </span>
              </div>

              {profile.appointments.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-4 text-center">No upcoming appointments scheduled.</p>
              ) : (
                <div className="space-y-2.5">
                  {profile.appointments.map(apt => (
                    <div key={apt.id} className="p-3 bg-blue-50/50 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-blue-900 dark:text-blue-200">{apt.doctor}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {apt.date} • {apt.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
                        {apt.specialty} • {apt.hospitalOrClinic}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1 italic">"{apt.reason}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Critical Health Alerts */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                  <AlertCircle size={16} className="text-red-600" /> Active Medical Alerts
                </h3>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded">
                  Requires Attention
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                {profile.personalHistory.allergies.filter(a => a.severity === 'severe' || a.severity === 'life_threatening').map(a => (
                  <div key={a.id} className="p-3 bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl flex items-start gap-2.5">
                    <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-red-900 dark:text-red-200">Severe Allergy: {a.allergen}</p>
                      <p className="text-[11px] text-red-800 dark:text-red-300 mt-0.5">{a.reaction}</p>
                    </div>
                  </div>
                ))}

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Caregiver Network Connected</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {profile.caregivers.filter(c => c.status === 'active').length} active caregivers are authorized to review clinical documentation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RECENT DOCUMENTS & REPORTS PREVIEW */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                <FileText size={16} className="text-indigo-600" /> Recent Medical Reports ({profile.documents.length})
              </h3>
              <button
                onClick={() => setActiveTab('documents')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
              >
                Browse All Documents <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.documents.slice(0, 4).map(doc => (
                <div key={doc.id} className="p-3 border border-gray-100 dark:border-slate-800 rounded-2xl flex items-start justify-between gap-3 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-start gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">{doc.title}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">{doc.facilityOrDoctor} • {doc.documentDate}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                        {doc.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (doc.fileUrl && doc.fileUrl.startsWith('data:')) {
                        const win = window.open();
                        win?.document.write(`<iframe src="${doc.fileUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                      } else {
                        alert(`Viewing archived record: ${doc.title}`);
                      }
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg shrink-0"
                    title="View Document"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VITALS & INTERACTIVE CHARTS */}
      {/* ========================================================================= */}
      {activeTab === 'vitals' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Health Vitals & Trends</h2>
              <p className="text-xs text-gray-500">Historical plots with strict non-inferenced empirical measurements</p>
            </div>
            <button
              onClick={() => setIsVitalModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl text-xs font-black shadow-md hover:from-red-700 hover:to-rose-700 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus size={16} /> Record Reading
            </button>
          </div>

          {/* Interactive SVG Chart Component */}
          <VitalsChart vitals={profile.vitals} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MEDICAL DOCUMENTS & LABS */}
      {/* ========================================================================= */}
      {activeTab === 'documents' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Medical Documents & Labs</h2>
              <p className="text-xs text-gray-500">Encrypted digital archive of prescriptions, diagnostic reports & scans</p>
            </div>
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <UploadCloud size={16} /> Archive Document
            </button>
          </div>

          {/* Filters & Search Bar */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, doctor, laboratory, or tag..."
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {(['all', 'laboratory', 'prescription', 'discharge_summary', 'imaging_scan'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setDocCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap capitalize transition-all ${
                    docCategoryFilter === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? 'All Files' : cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Documents Grid */}
          {filteredDocuments.length === 0 ? (
            <div className="p-10 text-center border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900">
              <FileText size={40} className="mx-auto mb-2 text-gray-400 opacity-60" />
              <p className="font-bold text-sm text-gray-700 dark:text-gray-300">No documents found matching filters</p>
              <p className="text-xs text-gray-500 mt-1">Upload a PDF or image report to start your clinical archive.</p>
              <button
                onClick={() => setIsDocModalOpen(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                <UploadCloud size={15} /> Upload Document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredDocuments.map(doc => (
                <div key={doc.id} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-gray-900 dark:text-white line-clamp-1">{doc.title}</h4>
                          <span className="text-[10px] text-gray-500">
                            {doc.fileType.toUpperCase()} • {(doc.fileSize / 1024).toFixed(0)} KB • {doc.documentDate}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 shrink-0">
                        {doc.category.replace('_', ' ')}
                      </span>
                    </div>

                    {doc.facilityOrDoctor && (
                      <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300 mt-1">
                        🏥 {doc.facilityOrDoctor}
                      </p>
                    )}

                    {doc.summary && (
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1.5 line-clamp-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
                        "{doc.summary}"
                      </p>
                    )}

                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doc.tags.map(t => (
                          <span key={t} className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded text-[10px]">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">
                      Archived: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          if (doc.fileUrl && doc.fileUrl.startsWith('data:')) {
                            const win = window.open();
                            win?.document.write(`<iframe src="${doc.fileUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                          } else {
                            alert(`Viewing archived record: ${doc.title}`);
                          }
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                        title="Delete Document"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: HEALTH TIMELINE */}
      {/* ========================================================================= */}
      {activeTab === 'timeline' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Health Timeline</h2>
              <p className="text-xs text-gray-500">Chronological history of consultations, lab reports, surgeries & medication changes</p>
            </div>
          </div>

          {/* Timeline Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(['all', 'consultation', 'lab_report', 'surgery', 'medication_change'] as const).map(f => (
              <button
                key={f}
                onClick={() => setTimelineTypeFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                  timelineTypeFilter === f
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All Events' : f.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Chronological Vertical Stepper */}
          <div className="relative pl-6 sm:pl-8 border-l-2 border-emerald-500/30 space-y-6 my-4 ml-3">
            {filteredTimeline.map(ev => {
              const badgeColor = 
                ev.type === 'surgery' ? 'bg-purple-600' :
                ev.type === 'consultation' ? 'bg-blue-600' :
                ev.type === 'medication_change' ? 'bg-amber-600' :
                'bg-emerald-600';

              return (
                <div key={ev.id} className="relative group">
                  {/* Stepper Dot */}
                  <span className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow ${badgeColor}`} />

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-gray-900 dark:text-white">{ev.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase text-white ${badgeColor}`}>
                          {ev.type.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-400">{ev.date}</span>
                    </div>

                    {ev.facilityOrDoctor && (
                      <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 mt-1">
                        📍 {ev.facilityOrDoctor}
                      </p>
                    )}

                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                      {ev.description}
                    </p>

                    {ev.outcome && (
                      <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={13} /> {ev.outcome}
                        </span>
                        <button
                          onClick={() => handleDeleteTimeline(ev.id)}
                          className="text-[11px] text-gray-400 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PERSONAL MEDICAL HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Personal Medical History</h2>
              <p className="text-xs text-gray-500">Documented clinical conditions, previous surgeries, allergies & notes</p>
            </div>
            <button
              onClick={() => {
                setHistorySection('condition');
                setIsHistoryModalOpen(true);
              }}
              className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-teal-700 active:scale-95 transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus size={16} /> Add Clinical Entry
            </button>
          </div>

          {/* Conditions Section */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                <HeartPulse size={16} className="text-teal-600" /> Existing Medical Conditions ({profile.personalHistory.conditions.length})
              </h3>
              <button
                onClick={() => {
                  setHistorySection('condition');
                  setIsHistoryModalOpen(true);
                }}
                className="text-xs font-bold text-teal-600 hover:underline"
              >
                + Add Condition
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.personalHistory.conditions.map(c => (
                <div key={c.id} className="p-3.5 border border-gray-100 dark:border-slate-800 rounded-2xl bg-gray-50/50 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-900 dark:text-white">{c.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">Diagnosed {c.diagnosedYear} • Severity: {c.severity}</p>
                  {c.notes && <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 italic">"{c.notes}"</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Surgeries Section */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                <Scissors size={16} className="text-purple-600" /> Previous Surgeries & Operations ({profile.personalHistory.surgeries.length})
              </h3>
              <button
                onClick={() => {
                  setHistorySection('surgery');
                  setIsHistoryModalOpen(true);
                }}
                className="text-xs font-bold text-purple-600 hover:underline"
              >
                + Add Surgery
              </button>
            </div>

            <div className="space-y-3">
              {profile.personalHistory.surgeries.map(s => (
                <div key={s.id} className="p-3.5 border border-gray-100 dark:border-slate-800 rounded-2xl bg-gray-50/50 dark:bg-slate-800/40 flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-gray-900 dark:text-white">{s.procedure}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">{s.hospital} • Year {s.year}</p>
                    {s.surgeon && <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1">Surgeon: {s.surgeon}</p>}
                    {s.notes && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1.5 italic">"{s.notes}"</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Allergies Section */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                <AlertTriangle size={16} className="text-red-500" /> Known Allergies ({profile.personalHistory.allergies.length})
              </h3>
              <button
                onClick={() => {
                  setHistorySection('allergy');
                  setIsHistoryModalOpen(true);
                }}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                + Add Allergy
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.personalHistory.allergies.map(a => (
                <div key={a.id} className="p-3.5 border border-red-100 dark:border-red-900/30 rounded-2xl bg-red-50/50 dark:bg-red-950/20">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-red-900 dark:text-red-200">{a.allergen}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200">
                      {a.severity}
                    </span>
                  </div>
                  <p className="text-xs text-red-800 dark:text-red-300 mt-1">{a.reaction}</p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-gray-500 uppercase">
                    Type: {a.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Family History Section */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                <Users size={16} className="text-blue-600" /> Family Medical History ({profile.personalHistory.familyHistory.length})
              </h3>
              <button
                onClick={() => {
                  setHistorySection('family');
                  setIsHistoryModalOpen(true);
                }}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                + Add Family Risk
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {profile.personalHistory.familyHistory.map(f => (
                <div key={f.id} className="p-3.5 border border-gray-100 dark:border-slate-800 rounded-2xl bg-gray-50/50 dark:bg-slate-800/40">
                  <span className="font-bold text-xs text-blue-800 dark:text-blue-300 block">{f.relative}</span>
                  <p className="font-black text-xs text-gray-900 dark:text-white mt-1">{f.condition}</p>
                  {f.notes && <p className="text-[11px] text-gray-500 mt-1 italic">{f.notes}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Important Clinical Notes */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                <FileText size={16} className="text-indigo-600" /> Clinical Notes & Physician Observations
              </h3>
              <button
                onClick={() => {
                  setHistorySection('note');
                  setIsHistoryModalOpen(true);
                }}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                + Add Clinical Note
              </button>
            </div>

            <div className="space-y-3">
              {profile.personalHistory.medicalNotes.map(n => (
                <div key={n.id} className="p-4 border border-gray-100 dark:border-slate-800 rounded-2xl bg-gray-50/50 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-900 dark:text-white">{n.title}</span>
                    <span className="text-[10px] text-gray-400 font-bold">{n.date}</span>
                  </div>
                  {n.author && <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">{n.author}</p>}
                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}
      <VitalEntryModal
        isOpen={isVitalModalOpen}
        onClose={() => setIsVitalModalOpen(false)}
        onSaved={loadData}
        userId={user?.uid}
      />

      <DocumentUploadModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onSaved={loadData}
        userId={user?.uid}
      />

      <HistoryEntryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onSaved={loadData}
        initialSection={historySection}
        currentHistory={profile.personalHistory}
        userId={user?.uid}
      />

      <CaregiverManageModal
        isOpen={isCaregiverModalOpen}
        onClose={() => setIsCaregiverModalOpen(false)}
        caregivers={profile.caregivers}
        onUpdated={loadData}
        userId={user?.uid}
      />

      <MedicalSummaryPrintModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        profile={profile}
        userName={user?.displayName || 'Verified Patient'}
      />
    </div>
  );
};

export default HealthRecordsPage;
