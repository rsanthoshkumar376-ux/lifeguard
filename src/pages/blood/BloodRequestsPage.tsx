import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Droplet, 
  Clock, 
  MapPin, 
  Search, 
  Plus, 
  CheckCircle2, 
  Navigation,
  Compass,
  UserCheck,
  ShieldCheck,
  Building2,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllEmergencyRequests, EmergencyBloodRequest } from '../../services/bloodRequestLifecycleService';
import { isRequestDonatedByUser } from '../../services/bloodRequest';
import { LiveDonorMap } from '../../components/blood/LiveDonorMap';
import { BloodCompatibilityModal } from '../../components/blood/BloodCompatibilityModal';
import { BloodGroup } from '../../services/bloodCompatibilityService';

const BloodRequestsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'requests' | 'compatibility'>('map');
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState<EmergencyBloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompatibilityModal, setShowCompatibilityModal] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getAllEmergencyRequests();
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching blood requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    // Tab filter
    if (filter !== 'All') {
      if (['Critical', 'Urgent', 'Normal'].includes(filter)) {
        if (req.urgency?.toLowerCase() !== filter.toLowerCase()) return false;
      } else {
        if (req.bloodGroup !== filter) return false;
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchHospital = req.hospitalName?.toLowerCase().includes(q);
      const matchCity = req.city?.toLowerCase().includes(q);
      const matchGroup = req.bloodGroup?.toLowerCase().includes(q);
      const matchComp = req.bloodComponent?.toLowerCase().includes(q);
      if (!matchHospital && !matchCity && !matchGroup && !matchComp) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-gray-900">
      {/* Sticky Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-20 flex items-center justify-between border-b border-gray-100">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <span className="text-red-600">🩸</span>
            <span>Blood Network</span>
          </h1>
          <p className="text-xs text-gray-500 font-medium">Real-time donor discovery & emergency hospital matching</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/blood/donor-profile"
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs transition-all"
            title="My Donor Profile & Consent"
          >
            <UserCheck size={15} />
            <span className="hidden sm:inline">My Donor Profile</span>
          </Link>
          <Link 
            to="/hospital/create-request"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs shadow-md active:scale-95 transition-all"
            title="Create Blood Request"
          >
            <Plus size={16} />
            <span>New Requisition</span>
          </Link>
        </div>
      </div>

      {/* Primary Sub-Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 pt-1 sticky top-[69px] z-10 flex overflow-x-auto no-scrollbar shadow-xs">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-3 text-xs font-black border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'map'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>🗺️</span>
          <span>Live Donor Discovery Map</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-3 text-xs font-black border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'requests'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>🚨</span>
          <span>Hospital Requisitions ({requests.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('compatibility');
            setShowCompatibilityModal(true);
          }}
          className={`px-4 py-3 text-xs font-black border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'compatibility'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>🧪</span>
          <span>Compatibility Guide</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-4 max-w-4xl mx-auto space-y-4">

        {/* Tab 1: Live Donor Discovery Map */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <LiveDonorMap 
              onOpenCompatibilityModal={() => setShowCompatibilityModal(true)}
              onRequestBlood={() => {}}
            />

            {/* Quick Action Cards Below Map */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-3xl p-5 shadow-md flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-200">Are You Available to Help?</span>
                  <h3 className="font-black text-lg">Register as a Verified Donor</h3>
                  <p className="text-xs text-red-100 font-medium">Toggle your location discovery to alert nearby hospitals in emergencies.</p>
                </div>
                <Link
                  to="/blood/donor-profile"
                  className="px-4 py-2.5 bg-white text-red-700 hover:bg-red-50 rounded-xl text-xs font-black shadow-md shrink-0 active:scale-95 transition-all ml-3"
                >
                  Manage Status
                </Link>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Clinical Safeguards</span>
                  <h3 className="font-black text-gray-900 text-lg">Compatibility & Safety</h3>
                  <p className="text-xs text-gray-500 font-medium">Review WHO & NBTC blood transfusion crossmatch requirements.</p>
                </div>
                <button
                  onClick={() => setShowCompatibilityModal(true)}
                  className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-black shadow-sm shrink-0 active:scale-95 transition-all ml-3"
                >
                  View Matrix
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Hospital Emergency Requisitions */}
        {(activeTab === 'requests' || activeTab === 'compatibility') && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hospital, city, blood component, or blood group..."
                  className="w-full bg-white border border-gray-300 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-red-500 outline-none shadow-xs font-medium"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
                {['All', 'Critical', 'Urgent', 'Normal', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3.5 py-1.5 rounded-full whitespace-nowrap font-black text-xs border transition-all ${
                      filter === f 
                        ? 'bg-red-600 text-white border-red-600 shadow-sm' 
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-bold text-gray-600">Loading active emergency requisitions...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 space-y-4 max-w-md mx-auto my-6">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
                  <Droplet size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">No Matching Blood Requisitions</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    There are currently no open emergency requisitions matching this filter or search.
                  </p>
                </div>
                <Link 
                  to="/hospital/create-request"
                  className="inline-block w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow active:scale-95 transition-all"
                >
                  Create New Requisition
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRequests.map((req) => {
                  const isDonated = isRequestDonatedByUser(req.id);
                  const locationDisplay = `${req.city} • ${req.hospitalAddress}`;

                  // Status badge helper
                  const statusColor = 
                    req.status === 'Fulfilled' ? 'bg-emerald-100 text-emerald-800' :
                    req.status === 'Hospital Contacted' ? 'bg-purple-100 text-purple-800' :
                    req.status === 'Donor Responded' ? 'bg-blue-100 text-blue-800' :
                    req.status === 'Donors Notified' ? 'bg-amber-100 text-amber-800' :
                    req.status === 'Cancelled' ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-700';

                  return (
                    <div key={req.id} className="bg-white rounded-3xl shadow-sm border border-gray-200/80 p-5 space-y-3.5 flex flex-col justify-between hover:border-red-300 transition-all">
                      <div className="space-y-3">
                        {/* Header: Blood Group + Hospital & Urgency */}
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3">
                            <div className="w-14 h-14 min-w-[56px] rounded-2xl bg-red-50 border border-red-200 flex flex-col items-center justify-center text-red-600 shadow-sm">
                              <span className="font-black text-2xl leading-none">{req.bloodGroup}</span>
                              <span className="text-[9px] font-bold text-red-400 mt-0.5">RBC</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="font-black text-gray-900 text-base leading-tight">{req.hospitalName}</h3>
                              </div>
                              <div className="flex items-center text-xs text-gray-600 font-medium space-x-1.5 mt-1">
                                <MapPin size={13} className="text-red-500 shrink-0" />
                                <span className="truncate max-w-[190px]" title={locationDisplay}>{req.city}</span>
                                <span>•</span>
                                <span className="font-bold text-gray-800">{req.unitsRequired} Unit(s)</span>
                              </div>
                            </div>
                          </div>

                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-black shrink-0 ${
                            req.urgency === 'Critical' ? 'bg-red-100 text-red-700 animate-pulse' :
                            req.urgency === 'Urgent' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {req.urgency}
                          </span>
                        </div>

                        {/* Component & Department Tag */}
                        <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs flex items-center justify-between border border-gray-100">
                          <span className="font-bold text-gray-700">📦 {req.bloodComponent || 'Packed Red Blood Cells (PRBC)'}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${statusColor}`}>
                            {req.status}
                          </span>
                        </div>

                        {req.notes && (
                          <p className="text-xs text-gray-600 font-medium line-clamp-2 leading-relaxed bg-red-50/40 p-2.5 rounded-xl border border-red-100/50">
                            {req.notes}
                          </p>
                        )}

                        {isDonated && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-bold text-emerald-800">
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                            <span>You pledged to donate for this patient!</span>
                          </div>
                        )}
                      </div>

                      {/* Footer: Timeline status + CTA */}
                      <div className="space-y-2.5 border-t border-gray-100 pt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="text-gray-400" />
                            <span>Needed {req.urgency === 'Critical' ? 'immediately (< 2h)' : 'within 24 hours'}</span>
                          </div>
                          <span className="text-[11px] font-bold text-red-600">{req.notifiedCount || 12} Donors Notified</span>
                        </div>

                        <Link 
                          to={`/blood/${req.id}`} 
                          className={`w-full block text-center py-3 rounded-2xl font-black active:scale-98 transition-all text-xs shadow-sm ${
                            isDonated 
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                              : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                        >
                          {isDonated ? 'VIEW CONFIRMED DETAILS & MAP 🗺️' : 'VIEW CASE & I CAN DONATE 🩸'}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Blood Compatibility Guide Modal */}
      <BloodCompatibilityModal
        isOpen={showCompatibilityModal}
        onClose={() => setShowCompatibilityModal(false)}
      />
    </div>
  );
};

export default BloodRequestsPage;
