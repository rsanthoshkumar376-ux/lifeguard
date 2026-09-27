import React, { useState, useEffect } from 'react';
import { Filter, Droplet, Clock, MapPin, Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getActiveRequests } from '../../services/bloodRequest';

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
          <p className="text-xs text-gray-500">Live emergency requests in your network</p>
        </div>
        <Link 
          to="/hospital/create-request"
          className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow"
          title="Create Blood Request"
        >
          <Plus size={20} />
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="p-4 flex space-x-2 overflow-x-auto">
        {['All', 'Critical', 'Urgent', 'Normal', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((f) => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full whitespace-nowrap font-medium text-xs border transition-colors ${
              filter === f ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white text-gray-700 border-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
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
          filteredRequests.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 font-black text-2xl border border-red-200">
                    {req.bloodGroup || req.group}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{req.hospitalName || req.hospital || 'Hospital'}</h3>
                    <div className="flex items-center text-xs text-gray-500 space-x-2 mt-1">
                      <span className="flex items-center"><MapPin size={13} className="mr-1"/> {req.location?.city || req.distance || 'Nearby'}</span>
                      <span>•</span>
                      <span>{req.unitsRequested || req.units || 1} Units</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  req.urgency === 'Critical' || req.urgency === 'critical' ? 'bg-red-100 text-red-700 animate-pulse' :
                  req.urgency === 'Urgent' || req.urgency === 'urgent' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {req.urgency}
                </span>
              </div>
              
              <div className="flex items-center text-xs text-gray-400 mb-4">
                <Clock size={12} className="mr-1" /> Needed within {req.urgency === 'Critical' ? '< 2 hours' : '24 hours'}
              </div>

              <div className="flex space-x-3">
                <Link to={`/blood-requests/${req.id}`} className="flex-1 bg-red-600 text-white text-center py-2.5 rounded-xl font-bold active:scale-95 transition-transform text-xs shadow">
                  I CAN DONATE
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BloodRequestsPage;
