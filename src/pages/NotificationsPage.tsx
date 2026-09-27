import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Droplet, ShieldAlert, CheckCheck, Trash2, CheckCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AppNotification {
  id: string;
  type: 'emergency' | 'blood' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    type: 'system',
    title: 'Welcome to LifeGuard',
    message: 'Your emergency assistance network is active. Keep your medical profile updated.',
    timestamp: 'Just now',
    read: false,
    link: '/profile'
  },
  {
    id: 'n2',
    type: 'emergency',
    title: 'Emergency SOS Protocol Ready',
    message: 'In an emergency, 1-tap SOS alerts nearby verified hospitals and registered emergency contacts.',
    timestamp: '1 hour ago',
    read: true,
    link: '/sos'
  }
];

const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'emergency' | 'blood' | 'system'>('all');
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('lifeguard_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem('lifeguard_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filtered = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 text-gray-900">
      {/* Top Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Link to="/" className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft size={22} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">Emergency alerts and blood network updates</p>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Mark all as read"
            >
              <CheckCheck size={18} />
            </button>
            <button
              onClick={clearAll}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Clear all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-200 px-4 gap-2 overflow-x-auto scrollbar-none py-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'emergency', label: '🚨 SOS & Emergency' },
          { key: 'blood', label: '🩸 Blood Requests' },
          { key: 'system', label: 'ℹ️ System' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
              filter === tab.key
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 max-w-2xl mx-auto">
        {filtered.length > 0 ? (
          filtered.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all ${
                !item.read
                  ? 'bg-white border-red-200 shadow-sm ring-1 ring-red-100'
                  : 'bg-white/80 border-gray-100 opacity-90'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    item.type === 'emergency'
                      ? 'bg-red-100 text-red-600'
                      : item.type === 'blood'
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {item.type === 'emergency' && <ShieldAlert size={20} />}
                  {item.type === 'blood' && <Droplet size={20} />}
                  {item.type === 'system' && <Info size={20} />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                    <span className="text-[11px] text-gray-400 font-medium">{item.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.message}</p>

                  {item.link && (
                    <Link
                      to={item.link}
                      className="inline-block mt-2.5 text-xs font-bold text-red-600 hover:text-red-700 underline"
                    >
                      View Details →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 space-y-3 my-8">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-3xl flex items-center justify-center mx-auto">
              <Bell size={28} />
            </div>
            <h3 className="font-bold text-base text-gray-900">No Notifications</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              When hospitals request your blood type or an emergency SOS is triggered nearby, real-time alerts will appear right here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
