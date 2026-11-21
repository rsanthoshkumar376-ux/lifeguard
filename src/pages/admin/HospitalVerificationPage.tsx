import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye, 
  Building2, 
  MapPin, 
  Phone, 
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Droplet,
  FileText,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  HospitalRecord, 
  getAllHospitals, 
  updateHospitalVerificationStatus 
} from '../../services/hospitalNetworkService';

type TabType = 'pending' | 'verified' | 'rejected' | 'suspended';

const HospitalVerificationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitals, setHospitals] = useState<HospitalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    setLoading(true);
    try {
      const data = await getAllHospitals();
      setHospitals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: TabType) => {
    let reason: string | undefined;
    if (action === 'rejected') {
      const promptReason = window.prompt('Enter regulatory rejection reason (sent to hospital):', 'Clinical establishment documentation expired or incomplete.');
      if (!promptReason) return;
      reason = promptReason;
    } else if (action === 'suspended') {
      const promptReason = window.prompt('Enter reason for suspension:', 'Routine clinical audit failed or license under inquiry.');
      if (!promptReason) return;
      reason = promptReason;
    }

    try {
      const updated = await updateHospitalVerificationStatus(id, action, 'State Health Accreditation Board', reason);
      if (updated) {
        setHospitals(prev => prev.map(h => h.id === id ? updated : h));
        setActionMessage(`Facility ${updated.name} successfully updated to ${action.toUpperCase()}`);
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (e) {
      console.error('Failed to update verification status:', e);
    }
  };

  const filteredHospitals = hospitals.filter(h => {
    if (h.verificationStatus !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = h.name.toLowerCase().includes(q);
      const matchLic = h.licenseNumber.toLowerCase().includes(q);
      const matchCity = h.city.toLowerCase().includes(q);
      if (!matchName && !matchLic && !matchCity) return false;
    }
    return true;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen pb-28 text-gray-900">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/admin" className="text-gray-500 hover:text-gray-900">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900">Hospital Regulatory Verification</h1>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Clinical establishment licensing, blood bank facility certification & periodic re-attestation
          </p>
        </div>

        <Link
          to="/nearby-hospitals"
          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 shadow-xs"
        >
          View Public Directory
        </Link>
      </div>

      {actionMessage && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle size={16} className="text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Controls: Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex space-x-1 bg-gray-200/80 p-1 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
          {(['pending', 'verified', 'rejected', 'suspended'] as TabType[]).map(tab => {
            const count = hospitals.filter(h => h.verificationStatus === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-black capitalize whitespace-nowrap transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <input
            type="text"
            placeholder="Search license, hospital, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
          />
        </div>
      </div>

      {/* Hospital List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
            <RefreshCw size={24} className="animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-xs font-bold text-gray-600">Loading facility dossiers...</p>
          </div>
        ) : filteredHospitals.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center space-y-2">
            <Building2 size={32} className="mx-auto text-gray-400" />
            <h3 className="font-bold text-base text-gray-800">No facilities in {activeTab} review</h3>
            <p className="text-xs text-gray-500">There are currently no hospitals or blood banks with this status.</p>
          </div>
        ) : (
          filteredHospitals.map(hospital => {
            const isExpanded = expandedId === hospital.id;

            return (
              <div 
                key={hospital.id} 
                className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:border-blue-300 transition-all"
              >
                <div 
                  className="p-5 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  onClick={() => setExpandedId(isExpanded ? null : hospital.id)}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`p-3 rounded-2xl shrink-0 ${
                      activeTab === 'pending' ? 'bg-amber-100 text-amber-700' : 
                      activeTab === 'verified' ? 'bg-emerald-100 text-emerald-700' : 
                      activeTab === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      <Building2 size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-base text-gray-900 leading-tight">{hospital.name}</h3>
                        <span className="font-mono bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          {hospital.licenseNumber}
                        </span>
                        {hospital.emergencyDepartmentAvailable && (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black">
                            24/7 ER
                          </span>
                        )}
                        {hospital.hasBloodBank && (
                          <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-black border border-red-200">
                            Licensed Blood Bank
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
                        <MapPin size={12} className="text-gray-400 shrink-0" />
                        <span>{hospital.city} • {hospital.address}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5 font-bold text-gray-800">
                      <Phone size={13} className="text-gray-400"/> {hospital.emergencyPhone}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Calendar size={13} className="text-gray-400"/> Registered: {new Date(hospital.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Expanded Dossier Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50/70 space-y-4">
                    {/* Facility Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-2xl border border-gray-200">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">Facility Type</span>
                        <span className="font-black text-gray-900 block">{hospital.hospitalType}</span>
                      </div>
                      <div className="bg-white p-3 rounded-2xl border border-gray-200">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">Inpatient & ICU</span>
                        <span className="font-black text-gray-900 block">{hospital.totalBeds} Beds ({hospital.icuBedsAvailable} ICU)</span>
                      </div>
                      <div className="bg-white p-3 rounded-2xl border border-gray-200">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">Administrator</span>
                        <span className="font-black text-gray-900 block truncate">{hospital.adminStaffName}</span>
                        <span className="text-[10px] text-gray-500">{hospital.adminStaffDesignation}</span>
                      </div>
                      <div className="bg-white p-3 rounded-2xl border border-gray-200">
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">Official Email</span>
                        <span className="font-mono text-gray-800 text-[11px] block truncate">{hospital.adminStaffEmail}</span>
                      </div>
                    </div>

                    {/* Rejection / Suspension Notice */}
                    {hospital.rejectionReason && (
                      <div className="bg-red-50 p-3.5 rounded-2xl border border-red-200 text-xs text-red-900">
                        <span className="font-bold block mb-0.5">Auditor Rejection Note:</span>
                        {hospital.rejectionReason}
                      </div>
                    )}

                    {/* Periodic Verification Validity */}
                    {hospital.periodicVerificationExpiresAt && (
                      <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                        <span className="font-bold">
                          ✓ Verified by {hospital.verifiedBy || 'State Medical Council'} on {new Date(hospital.verifiedAt!).toLocaleDateString()}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700">
                          Re-attestation due: {new Date(hospital.periodicVerificationExpiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {/* Uploaded Documents */}
                    <div>
                      <h4 className="font-black text-gray-900 text-xs uppercase tracking-wide mb-2">
                        Statutory Licensing & Credentials Proof
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {hospital.verificationDocuments && hospital.verificationDocuments.length > 0 ? (
                          hospital.verificationDocuments.map(doc => (
                            <a 
                              key={doc.id}
                              href={doc.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors shadow-xs"
                            >
                              <FileText size={15} />
                              <span>{doc.title}</span>
                              <Eye size={13} className="text-gray-400" />
                            </a>
                          ))
                        ) : (
                          <div className="text-xs text-gray-400 italic">No external document files uploaded. Clinical establishment license checked via state portal.</div>
                        )}
                      </div>
                    </div>

                    {/* Review Actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                      {activeTab === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleAction(hospital.id, 'verified')} 
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-bold text-xs shadow-sm"
                          >
                            <CheckCircle size={16} /> Approve & Certify Facility (90 Days)
                          </button>
                          <button 
                            onClick={() => handleAction(hospital.id, 'rejected')} 
                            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold text-xs shadow-sm"
                          >
                            <XCircle size={16} /> Reject Dossier
                          </button>
                        </>
                      )}

                      {activeTab === 'verified' && (
                        <button 
                          onClick={() => handleAction(hospital.id, 'suspended')} 
                          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all font-bold text-xs shadow-sm"
                        >
                          <AlertCircle size={16} /> Suspend Certification
                        </button>
                      )}

                      {(activeTab === 'suspended' || activeTab === 'rejected') && (
                        <button 
                          onClick={() => handleAction(hospital.id, 'pending')} 
                          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-xs shadow-sm"
                        >
                          Reopen Review in Pending
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HospitalVerificationPage;
