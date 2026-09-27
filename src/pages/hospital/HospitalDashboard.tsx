import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Clock, Users, Activity, Droplet, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

const HospitalDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/blood/requests');
      if (Array.isArray(data)) {
        setRequests(data);
      } else if (data && Array.isArray(data.requests)) {
        setRequests(data.requests);
      } else {
        setRequests([]);
      }
    } catch (e) {
      console.error(e);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const activeRequests = requests.filter(r => (r.status || 'open').toLowerCase() === 'open');
  const completedRequests = requests.filter(r => (r.status || '').toLowerCase() === 'completed' || (r.status || '').toLowerCase() === 'fulfilled');

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
           <div>
             <h1 className="text-xl font-bold text-gray-900">{(user as any)?.hospitalName || user?.fullName || 'Hospital Staff Dashboard'}</h1>
             <span className="inline-flex items-center bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full mt-1">
                <CheckCircle size={12} className="mr-1" /> Hospital Network
             </span>
           </div>
           <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">
             H
           </div>
        </div>
        
        <Link to="/hospital/create-request" className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center shadow active:scale-95 transition-transform text-xs">
          <Plus size={18} className="mr-1.5" /> CREATE BLOOD REQUEST
        </Link>
      </div>

      <div className="p-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
           <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 text-center">
             <div className="text-2xl font-black text-red-600">{activeRequests.length}</div>
             <div className="text-[11px] text-gray-500 font-bold uppercase mt-0.5">Active Req</div>
           </div>
           <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 text-center">
             <div className="text-2xl font-black text-blue-600">0</div>
             <div className="text-[11px] text-gray-500 font-bold uppercase mt-0.5">Responses</div>
           </div>
           <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 text-center">
             <div className="text-2xl font-black text-green-600">{completedRequests.length}</div>
             <div className="text-[11px] text-gray-500 font-bold uppercase mt-0.5">Fulfilled</div>
           </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4 bg-white rounded-xl p-1">
          <button 
            onClick={() => setActiveTab('active')} 
            className={`flex-1 py-2 font-bold text-xs rounded-lg transition-all ${activeTab === 'active' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-500'}`}
          >
            Active ({activeRequests.length})
          </button>
          <button 
            onClick={() => setActiveTab('completed')} 
            className={`flex-1 py-2 font-bold text-xs rounded-lg transition-all ${activeTab === 'completed' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-500'}`}
          >
            Completed ({completedRequests.length})
          </button>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-bold text-gray-600">Loading requests...</p>
          </div>
        ) : (activeTab === 'active' ? activeRequests : completedRequests).length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 space-y-3 max-w-md mx-auto my-4">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
              <Droplet size={28} />
            </div>
            <h3 className="font-bold text-base text-gray-900">No {activeTab} blood requests</h3>
            <p className="text-xs text-gray-500">
              {activeTab === 'active' ? 'You have no open emergency blood requests. Tap the button above to post one.' : 'No completed requests in history.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(activeTab === 'active' ? activeRequests : completedRequests).map(req => (
              <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 font-black text-xl">
                      {req.bloodGroup || req.group}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{req.patientRef ? `Patient: ${req.patientRef}` : 'Emergency Patient'}</h3>
                      <p className="text-xs text-gray-500">{req.department || 'Emergency Ward'} • {req.unitsRequested || req.units || 1} Units</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    req.urgency === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {req.urgency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard;
