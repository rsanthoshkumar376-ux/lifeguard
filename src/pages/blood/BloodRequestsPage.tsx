import React, { useState, useEffect } from 'react';
import { Filter, Droplet, Clock, MapPin, Search, Plus, CheckCircle2, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getActiveRequests, isRequestDonatedByUser } from '../../services/bloodRequest';

const BloodRequestsPage: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getActiveRequests();
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching blood requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'All') return true;
    if (['Critical', 'Urgent', 'Normal'].includes(filter)) {
      return req.urgency?.toLowerCase() === filter.toLowerCase();
    }
    return req.bloodGroup === filter || req.group === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-gray-900">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center justify-between border-b border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Blood Requests</h1>
          <p className="text-xs text-gray-500">Live emergency requests with hospital locations</p>
        </div>
        <Link 
          to="/hospital/create-request"
          className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all"
          title="Create Blood Request"
        >
          <Plus size={16} />
          <span>New Request</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="p-4 flex space-x-2 overflow-x-auto no-scrollbar">
        {['All', 'Critical', 'Urgent', 'Normal', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((f) => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full whitespace-nowrap font-bold text-xs border transition-colors ${
              filter === f ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4 max-w-xl mx-auto">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-bold text-gray-600">Loading live requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 space-y-4 max-w-md mx-auto my-6">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
              <Droplet size={32} />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">No Active Blood Requests</h3>
              <p className="text-xs text-gray-500 mt-1">
                There are currently no open emergency blood requests matching this filter.
              </p>
            </div>
            <Link 
              to="/hospital/create-request"
              className="inline-block w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow active:scale-95 transition-all"
            >
              Post an Emergency Requirement
            </Link>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isDonated = isRequestDonatedByUser(req.id);
            const hospitalName = req.hospitalName || req.hospital || 'Hospital';
            const city = req.city || req.location?.city || '';
            const address = req.address || req.hospitalAddress || '';
            const locationDisplay = city && address ? `${city} • ${address}` : (city || address || 'Local Hospital');

            return (
              <div key={req.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-13 h-13 min-w-[52px] rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 font-black text-2xl shadow-sm">
                      {req.bloodGroup || req.group}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-base leading-tight">{hospitalName}</h3>
                      <div className="flex items-center text-xs text-gray-600 font-medium space-x-1.5 mt-1">
                        <MapPin size={13} className="text-red-500 shrink-0" />
                        <span className="truncate max-w-[200px]" title={locationDisplay}>{locationDisplay}</span>
                        <span>•</span>
                        <span className="font-bold text-gray-700">{req.unitsRequired || req.unitsRequested || req.units || 1} Units</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-black shrink-0 ${
                    req.urgency === 'Critical' || req.urgency === 'critical' ? 'bg-red-100 text-red-700 animate-pulse' :
                    req.urgency === 'Urgent' || req.urgency === 'urgent' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {req.urgency}
                  </span>
                </div>

                {isDonated && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>You pledged to donate for this patient!</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2.5">
                  <div className="flex items-center">
                    <Clock size={12} className="mr-1 text-gray-400" />
                    <span>Needed {req.urgency === 'Critical' ? 'immediately (< 2h)' : 'within 24 hours'}</span>
                  </div>
                  {req.department && (
                    <span className="text-[11px] text-gray-400 font-medium">{req.department}</span>
                  )}
                </div>

                <div>
                  <Link 
                    to={`/blood/${req.id}`} 
                    className={`w-full block text-center py-3 rounded-2xl font-bold active:scale-98 transition-all text-xs shadow-sm ${
                      isDonated 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isDonated ? 'VIEW CONFIRMED DETAILS & MAP 🗺️' : 'I CAN DONATE'}
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BloodRequestsPage;
