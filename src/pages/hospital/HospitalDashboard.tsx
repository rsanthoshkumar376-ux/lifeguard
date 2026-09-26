import React, { useState } from 'react';
import { Plus, CheckCircle, Clock, XCircle, Users, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const HospitalDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('active');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
           <div>
             <h1 className="text-xl font-bold text-gray-900">City General Hospital</h1>
             <span className="inline-flex items-center bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full mt-1">
                <CheckCircle size={12} className="mr-1" /> Verified
             </span>
           </div>
           <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
             H
           </div>
        </div>
        
        <Link to="/hospital/create-request" className="w-full bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center shadow active:scale-95 transition-transform">
          <Plus size={20} className="mr-2" /> CREATE BLOOD REQUEST
        </Link>
      </div>

      <div className="p-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
           <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
             <div className="text-2xl font-black text-red-600">3</div>
             <div className="text-xs text-gray-500 font-medium">Active Req</div>
           </div>
           <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
             <div className="text-2xl font-black text-blue-600">12</div>
             <div className="text-xs text-gray-500 font-medium">Responses</div>
           </div>
           <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
             <div className="text-2xl font-black text-green-600">45</div>
             <div className="text-xs text-gray-500 font-medium">Completed</div>
           </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button onClick={() => setActiveTab('active')} className={`flex-1 py-2 font-semibold text-sm ${activeTab === 'active' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500'}`}>Active (3)</button>
          <button onClick={() => setActiveTab('completed')} className={`flex-1 py-2 font-semibold text-sm ${activeTab === 'completed' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500'}`}>Completed</button>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
           {/* Card 1 */}
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-black text-xl">O-</div>
                    <div>
                      <h3 className="font-bold text-gray-900">Emergency Dept</h3>
                      <p className="text-xs text-gray-500">Ref: PAT-99281</p>
                    </div>
                 </div>
                 <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold animate-pulse">Critical</span>
              </div>
              
              <div className="flex justify-between items-center text-sm mb-4 bg-gray-50 p-2 rounded-lg">
                 <span className="font-medium text-gray-700">2 Units Required</span>
                 <span className="text-gray-500 flex items-center"><Clock size={14} className="mr-1"/> 2h left</span>
              </div>

              <div className="border-t pt-3">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-700 flex items-center"><Users size={16} className="mr-2"/> 3 Responses</span>
                    <button className="text-xs text-blue-600 font-semibold">View All</button>
                 </div>
                 {/* Mini Donor Item */}
                 <div className="flex justify-between items-center bg-green-50 p-2 rounded border border-green-100">
                    <div>
                      <p className="text-sm font-bold text-green-800">John D. (O-)</p>
                      <p className="text-xs text-green-600">Confirmed • 15 mins away</p>
                    </div>
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold shadow-sm">Mark Donated</button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
