import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, HeartPulse, Droplet, Users, Hospital, Droplets, Activity, Settings, PhoneCall } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { user } = useAuth() as any;
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
             {user?.photoURL ? <img src={user.photoURL} alt="Profile" /> : <span className="text-blue-600 font-bold">{user?.displayName?.charAt(0) || 'U'}</span>}
          </div>
          <div>
            <p className="text-sm text-gray-500">Hello,</p>
            <p className="font-bold text-gray-900">{user?.displayName || 'User'}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="p-2 text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200">
             <Bell size={20} />
          </button>
        </div>
      </header>

      {/* Emergency Banner */}
      <div className="bg-red-600 text-white p-3 flex items-center justify-between animate-pulse">
         <span className="font-bold">CRITICAL: O- Blood needed nearby!</span>
         <Link to="/blood-requests" className="bg-white text-red-600 px-3 py-1 rounded-full text-sm font-bold shadow">View</Link>
      </div>

      <div className="p-4 space-y-4">
        {/* Main Action Grid */}
        <div className="grid grid-cols-2 gap-4">
          <button className="col-span-2 bg-red-600 text-white h-24 rounded-2xl flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform">
             <PhoneCall size={32} className="mb-1" />
             <span className="font-bold text-lg">SOS Emergency</span>
          </button>
          
          <Link to="/blood-requests/create" className="bg-orange-500 text-white h-24 rounded-2xl flex flex-col items-center justify-center shadow active:scale-95 transition-transform">
             <Droplet size={28} className="mb-1" />
             <span className="font-bold">Need Blood</span>
          </Link>
          
          <Link to="/medical-id" className="bg-blue-500 text-white h-24 rounded-2xl flex flex-col items-center justify-center shadow active:scale-95 transition-transform">
             <HeartPulse size={28} className="mb-1" />
             <span className="font-bold">Emergency ID</span>
          </Link>
          
          <Link to="/qr-id" className="bg-purple-500 text-white h-24 rounded-2xl flex flex-col items-center justify-center shadow active:scale-95 transition-transform">
             <span className="text-2xl mb-1">📱</span>
             <span className="font-bold">My QR ID</span>
          </Link>
          
          <Link to="/profile" className="bg-teal-500 text-white h-24 rounded-2xl flex flex-col items-center justify-center shadow active:scale-95 transition-transform">
             <Users size={28} className="mb-1" />
             <span className="font-bold">Medical Profile</span>
          </Link>

          <Link to="/hospitals" className="bg-green-500 text-white h-24 rounded-2xl flex flex-col items-center justify-center shadow active:scale-95 transition-transform">
             <Hospital size={28} className="mb-1" />
             <span className="font-bold">Nearby Hospitals</span>
          </Link>
          
          <Link to="/blood-donor" className="bg-pink-600 text-white h-24 rounded-2xl flex flex-col items-center justify-center shadow active:scale-95 transition-transform">
             <Droplets size={28} className="mb-1" />
             <span className="font-bold">Blood Donation</span>
          </Link>

          <Link to="/activity" className="bg-gray-600 text-white h-24 rounded-2xl flex flex-col items-center justify-center shadow active:scale-95 transition-transform">
             <Activity size={28} className="mb-1" />
             <span className="font-bold">My Activity</span>
          </Link>
          
          <Link to="/settings" className="bg-gray-700 text-white h-24 rounded-2xl flex flex-col items-center justify-center shadow active:scale-95 transition-transform">
             <Settings size={28} className="mb-1" />
             <span className="font-bold">Settings</span>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-between">
           <div className="text-center w-1/2 border-r">
             <p className="text-2xl font-bold text-gray-800">1,204</p>
             <p className="text-xs text-gray-500">Donors Registered</p>
           </div>
           <div className="text-center w-1/2">
             <p className="text-2xl font-bold text-red-500">89</p>
             <p className="text-xs text-gray-500">Lives Saved</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
