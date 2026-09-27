import React, { useState, useEffect } from 'react';
import { ArrowLeft, Droplet, HeartPulse, Bell, Calendar, MapPin, CheckCircle2, Navigation, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUserDonations, UserDonation } from '../services/bloodRequest';

const ActivityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'donations' | 'emergency' | 'notifications'>('donations');
  const [donations, setDonations] = useState<UserDonation[]>([]);

  useEffect(() => {
    const list = getUserDonations();
    setDonations(list);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-gray-900">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center border-b border-gray-100">
        <Link to="/" className="mr-4 text-gray-600 hover:text-gray-900"><ArrowLeft size={24} /></Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Activity</h1>
          <p className="text-xs text-gray-500">Your donation history & emergency logs</p>
        </div>
      </div>

      <div className="flex bg-white border-b sticky top-[69px] z-10">
        <button 
          onClick={() => setActiveTab('donations')} 
          className={`flex-1 py-3 text-xs font-bold flex flex-col items-center justify-center transition-colors ${
            activeTab === 'donations' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Droplet size={16} />
            <span>Donations {donations.length > 0 && `(${donations.length})`}</span>
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('emergency')} 
          className={`flex-1 py-3 text-xs font-bold flex flex-col items-center justify-center transition-colors ${
            activeTab === 'emergency' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <HeartPulse size={16} />
            <span>Emergency</span>
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('notifications')} 
          className={`flex-1 py-3 text-xs font-bold flex flex-col items-center justify-center transition-colors ${
            activeTab === 'notifications' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Bell size={16} />
            <span>Alerts</span>
          </div>
        </button>
      </div>

      <div className="p-4 max-w-xl mx-auto space-y-4">
        {activeTab === 'donations' && (
          donations.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 space-y-3 max-w-md mx-auto my-6">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
                <Droplet size={30} />
              </div>
              <h3 className="font-bold text-base text-gray-900">No Blood Donations Yet</h3>
              <p className="text-xs text-gray-500">
                When you respond to nearby emergency blood requests or complete blood drives, your verified records and badges will appear here.
              </p>
              <Link 
                to="/blood" 
                className="inline-block px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold shadow hover:bg-red-700 active:scale-95 transition-all mt-2"
              >
                Browse Blood Requests
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Confirmed Pledges & Donations ({donations.length})
                </span>
                <Link to="/blood" className="text-xs font-bold text-red-600 hover:underline">
                  Find More
                </Link>
              </div>

              {donations.map((don) => (
                <div key={don.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 font-black text-xl shadow-sm">
                        {don.bloodGroup}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-sm leading-tight">{don.hospitalName}</h4>
                        <div className="flex items-center text-xs text-gray-500 font-medium space-x-1.5 mt-0.5">
                          <MapPin size={12} className="text-red-500 shrink-0" />
                          <span>{don.city}</span>
                          <span>•</span>
                          <span>{don.units} Unit</span>
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                      <CheckCircle2 size={12} />
                      <span>{don.status}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-2.5">
                    <div className="flex items-center gap-1">
                      <Calendar size={13} />
                      <span>{don.date}</span>
                    </div>
                    <span className="text-emerald-700 font-bold text-[11px]">Hero Donor</span>
                  </div>

                  <div className="pt-1">
                    <Link
                      to={`/blood/${don.requestId}`}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 rounded-xl text-xs font-bold active:scale-98 transition-all"
                    >
                      <ExternalLink size={14} />
                      <span>View Request & Hospital Map</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'emergency' && (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 space-y-3 max-w-md mx-auto my-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto">
              <HeartPulse size={30} />
            </div>
            <h3 className="font-bold text-base text-gray-900">No Emergency Accesses</h3>
            <p className="text-xs text-gray-500">
              Emergency responders and doctors scanning your QR code or viewing your Emergency ID will be recorded here for your security.
            </p>
            <Link 
              to="/qr" 
              className="inline-block px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow hover:bg-black active:scale-95 transition-all mt-2"
            >
              View My QR Code
            </Link>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 space-y-3 max-w-md mx-auto my-6">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-3xl flex items-center justify-center mx-auto">
              <Bell size={30} />
            </div>
            <h3 className="font-bold text-base text-gray-900">No New Alerts</h3>
            <p className="text-xs text-gray-500">
              You are all caught up! Emergency alerts and donor matching notifications will appear here.
            </p>
            <Link 
              to="/notifications" 
              className="inline-block px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold shadow hover:bg-black active:scale-95 transition-all mt-2"
            >
              Open Notifications Inbox
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
