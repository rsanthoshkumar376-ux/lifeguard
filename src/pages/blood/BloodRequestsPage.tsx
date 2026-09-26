import React, { useState } from 'react';
import { Filter, Droplet, Clock, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockRequests = [
  { id: '1', group: 'O-', hospital: 'City General Hospital', distance: '1.2 km', units: 2, urgency: 'Critical', time: '10 mins ago' },
  { id: '2', group: 'A+', hospital: 'Hope Medical Center', distance: '3.5 km', units: 1, urgency: 'Urgent', time: '1 hr ago' },
  { id: '3', group: 'B+', hospital: 'St. Mary Clinic', distance: '5.0 km', units: 3, urgency: 'Normal', time: '3 hrs ago' },
];

const BloodRequestsPage: React.FC = () => {
  const [filter, setFilter] = useState('All');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Blood Requests</h1>
        <button className="p-2 text-gray-600 bg-gray-100 rounded-full">
          <Search size={20} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 flex space-x-2 overflow-x-auto">
        {['All', 'Critical', 'Urgent', 'Normal', 'O-', 'A+', 'B+'].map((f) => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full whitespace-nowrap font-medium text-sm border ${
              filter === f ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {mockRequests.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <Droplet size={48} className="mx-auto mb-2 text-gray-300" />
            <p>No blood requests in your area.</p>
          </div>
        ) : (
          mockRequests.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-black text-2xl">
                    {req.group}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{req.hospital}</h3>
                    <div className="flex items-center text-sm text-gray-500 space-x-2 mt-1">
                      <span className="flex items-center"><MapPin size={14} className="mr-1"/> {req.distance}</span>
                      <span>•</span>
                      <span>{req.units} Units</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  req.urgency === 'Critical' ? 'bg-red-100 text-red-600 animate-pulse' :
                  req.urgency === 'Urgent' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {req.urgency}
                </span>
              </div>
              
              <div className="flex items-center text-xs text-gray-400 mb-4">
                <Clock size={12} className="mr-1" /> Posted {req.time}
              </div>

              <div className="flex space-x-3">
                <Link to={`/blood-requests/${req.id}`} className="flex-1 bg-red-600 text-white text-center py-2.5 rounded-xl font-bold active:scale-95 transition-transform">
                  I CAN DONATE
                </Link>
                <button className="flex-1 bg-gray-100 text-gray-600 text-center py-2.5 rounded-xl font-bold active:scale-95 transition-transform">
                  NOT AVAILABLE
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="fixed bottom-24 right-4 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg">
        <Filter size={24} />
      </button>
    </div>
  );
};

export default BloodRequestsPage;
