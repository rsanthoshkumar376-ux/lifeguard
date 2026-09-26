import React, { useState } from 'react';
import { ArrowLeft, Droplet, HeartPulse, Bell, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ActivityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('donations');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center">
        <Link to="/" className="mr-4 text-gray-600"><ArrowLeft size={24} /></Link>
        <h1 className="text-xl font-bold text-gray-900">My Activity</h1>
      </div>

      <div className="flex bg-white border-b sticky top-[60px] z-10">
        <button onClick={() => setActiveTab('donations')} className={`flex-1 py-3 text-sm font-bold flex flex-col items-center justify-center ${activeTab === 'donations' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}>
           <Droplet size={18} className="mb-1" /> Donations
        </button>
        <button onClick={() => setActiveTab('emergency')} className={`flex-1 py-3 text-sm font-bold flex flex-col items-center justify-center ${activeTab === 'emergency' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
           <HeartPulse size={18} className="mb-1" /> Emergency
        </button>
        <button onClick={() => setActiveTab('notifications')} className={`flex-1 py-3 text-sm font-bold flex flex-col items-center justify-center ${activeTab === 'notifications' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500'}`}>
           <Bell size={18} className="mb-1" /> Alerts
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'donations' && (
          <div className="space-y-3">
             <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center">
                   <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mr-3"><Droplet size={24}/></div>
                   <div>
                     <h3 className="font-bold text-gray-900">City General Hospital</h3>
                     <p className="text-sm text-gray-500">12 Oct 2023 • O- Requested</p>
                   </div>
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Donated</span>
             </div>
             <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between opacity-75">
                <div className="flex items-center">
                   <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 mr-3"><Droplet size={24}/></div>
                   <div>
                     <h3 className="font-bold text-gray-900">Hope Medical</h3>
                     <p className="text-sm text-gray-500">05 Sep 2023 • Missed</p>
                   </div>
                </div>
                <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded">Expired</span>
             </div>
          </div>
        )}

        {activeTab === 'emergency' && (
          <div className="space-y-3">
             <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start">
                   <div className="flex items-center">
                     <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3"><HeartPulse size={20}/></div>
                     <div>
                       <h3 className="font-bold text-gray-900">Medical ID Accessed</h3>
                       <p className="text-sm text-gray-500">Via QR Code Scan</p>
                     </div>
                   </div>
                   <span className="text-xs text-gray-400">Today, 2:30 PM</span>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-3">
             <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start">
                <div className="bg-red-100 p-2 rounded-full text-red-600 mr-3 mt-1"><Bell size={16}/></div>
                <div>
                   <h3 className="font-bold text-gray-900 text-sm">Urgent Blood Request Near You</h3>
                   <p className="text-sm text-gray-600 mt-1">O- blood is critically needed at City Hospital (2km away).</p>
                   <p className="text-xs text-gray-400 mt-2">2 hours ago</p>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
