import React, { useState } from 'react';
import { Settings, Shield, Bell, MapPin, Calendar, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const DonorProfilePage: React.FC = () => {
  const [isDonorActive, setIsDonorActive] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Donor Profile</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Active Donor Status</h2>
            <p className="text-sm text-gray-500">Available for emergencies</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={isDonorActive} onChange={() => setIsDonorActive(!isDonorActive)} />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
          </label>
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b">
             <div className="flex items-center space-x-3">
               <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">O+</div>
               <span className="font-medium text-gray-700">Blood Group</span>
             </div>
             <button className="text-sm text-blue-600 font-semibold">Change</button>
          </div>
          
          <div className="flex justify-between items-center pb-4 border-b">
             <div className="flex items-center space-x-3">
               <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Calendar size={20}/></div>
               <span className="font-medium text-gray-700">Last Donated</span>
             </div>
             <span className="text-sm font-semibold text-gray-900">12 Oct 2023</span>
          </div>

          <div className="flex justify-between items-center">
             <div className="flex items-center space-x-3">
               <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><MapPin size={20}/></div>
               <span className="font-medium text-gray-700">Location Area</span>
             </div>
             <button className="text-sm text-blue-600 font-semibold">Update</button>
          </div>
        </div>

        {/* Preferences */}
        <h3 className="font-bold text-gray-900 px-1 pt-2">Preferences</h3>
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 text-gray-700">
               <Bell size={20} className="text-gray-400"/>
               <span className="font-medium">Notification Radius</span>
            </div>
            <select className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2">
              <option>5 km</option>
              <option>10 km</option>
              <option>25 km</option>
              <option>50 km</option>
            </select>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t">
             <div className="flex items-center space-x-3 text-gray-700">
               <Activity size={20} className="text-gray-400"/>
               <span className="font-medium">Donation History</span>
             </div>
             <Link to="/activity" className="text-sm text-blue-600 font-semibold">View</Link>
          </div>
        </div>

        <div className="flex items-start bg-blue-50 p-4 rounded-xl text-sm text-blue-800">
           <Shield size={20} className="mr-3 mt-0.5 shrink-0 text-blue-600" />
           <p>Your exact location is never shared with hospitals or other users. Only an approximate distance is displayed to preserve privacy.</p>
        </div>
      </div>
    </div>
  );
};

export default DonorProfilePage;
