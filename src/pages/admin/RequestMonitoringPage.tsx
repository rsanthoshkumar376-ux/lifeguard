import React, { useState } from 'react';
import { AlertTriangle, Clock, MapPin, Search, Filter, Ban, Flag } from 'lucide-react';

interface BloodRequest {
  id: string;
  hospitalName: string;
  bloodGroup: string;
  urgency: 'critical' | 'high' | 'normal';
  unitsRequired: number;
  responses: number;
  createdTime: string;
  status: 'active' | 'flagged' | 'expired' | 'fulfilled';
}

const mockRequests: BloodRequest[] = [
  { id: 'REQ-001', hospitalName: 'City General Hospital', bloodGroup: 'O-', urgency: 'critical', unitsRequired: 3, responses: 1, createdTime: '2 hours ago', status: 'active' },
  { id: 'REQ-002', hospitalName: 'Metro Healthcare', bloodGroup: 'A+', urgency: 'high', unitsRequired: 2, responses: 4, createdTime: '5 hours ago', status: 'active' },
  { id: 'REQ-003', hospitalName: 'Sunrise Clinic', bloodGroup: 'B-', urgency: 'normal', unitsRequired: 1, responses: 0, createdTime: '1 day ago', status: 'flagged' },
  { id: 'REQ-004', hospitalName: 'Hope Medical', bloodGroup: 'AB+', urgency: 'critical', unitsRequired: 5, responses: 5, createdTime: '2 days ago', status: 'expired' },
];

const RequestMonitoringPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'critical' | 'flagged' | 'expired'>('active');
  const [requests, setRequests] = useState<BloodRequest[]>(mockRequests);

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'critical') return req.urgency === 'critical' && req.status === 'active';
    if (activeTab === 'flagged') return req.status === 'flagged';
    if (activeTab === 'expired') return req.status === 'expired';
    return req.status === 'active';
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAction = (id: string, action: string) => {
    if (window.confirm(`Are you sure you want to ${action} this request?`)) {
      setRequests(requests.map(req => {
        if (req.id === id) {
          if (action === 'cancel') return { ...req, status: 'expired' };
          if (action === 'flag') return { ...req, status: 'flagged' };
          if (action === 'unflag') return { ...req, status: 'active' };
        }
        return req;
      }));
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Request Monitoring</h1>
        <p className="text-gray-500 mt-1">Monitor active blood requests and prevent fraud</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Active Requests</p>
          <p className="text-2xl font-bold text-gray-900">{requests.filter(r => r.status === 'active').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Avg Response Time</p>
          <p className="text-2xl font-bold text-gray-900">14 mins</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Fulfillment Rate</p>
          <p className="text-2xl font-bold text-gray-900">84%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200 w-full md:w-fit mb-6 overflow-x-auto">
        {(['active', 'critical', 'flagged', 'expired'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors whitespace-nowrap ${
              activeTab === tab ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab === 'active' ? 'All Active' : tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
            No requests found for this filter.
          </div>
        ) : (
          filteredRequests.map(req => (
            <div key={req.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-lg bg-red-50 border border-red-100 flex flex-col items-center justify-center text-red-600">
                  <span className="font-bold text-lg leading-none">{req.bloodGroup}</span>
                  <span className="text-[10px] uppercase font-semibold mt-1 text-red-400">{req.unitsRequired} Units</span>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{req.hospitalName}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold ${getUrgencyColor(req.urgency)}`}>
                      {req.urgency}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-4">
                    <span className="flex items-center gap-1"><Clock size={14}/> {req.createdTime}</span>
                    <span>ID: {req.id}</span>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium text-gray-700">Responses: </span>
                    <span className={req.responses >= req.unitsRequired ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
                      {req.responses} donors responded
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col gap-2 justify-center md:items-end border-t md:border-t-0 pt-4 md:pt-0">
                {req.status === 'active' && (
                  <button onClick={() => handleAction(req.id, 'flag')} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors w-full md:w-auto justify-center">
                    <Flag size={16} /> Flag Review
                  </button>
                )}
                {req.status === 'flagged' && (
                  <button onClick={() => handleAction(req.id, 'unflag')} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors w-full md:w-auto justify-center">
                    <Flag size={16} /> Unflag
                  </button>
                )}
                {(req.status === 'active' || req.status === 'flagged') && (
                  <button onClick={() => handleAction(req.id, 'cancel')} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors w-full md:w-auto justify-center">
                    <Ban size={16} /> Cancel Fraud
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RequestMonitoringPage;
