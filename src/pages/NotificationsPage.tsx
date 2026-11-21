import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Bell, 
  Droplet, 
  ShieldAlert, 
  CheckCheck, 
  Trash2, 
  CheckCircle, 
  Info,
  Calendar,
  Sparkles,
  Heart,
  Clock,
  Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export interface AppNotification {
  id: string;
  type: 'emergency' | 'blood' | 'eligibility' | 'camp' | 'appointment' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n_elig_01',
    type: 'eligibility',
    title: '🩸 Physiological Recovery Complete',
    message: 'Your 90-day rest interval has elapsed. You are now potentially eligible for voluntary Whole Blood donation! Remember: Final eligibility strictly requires on-site medical screening.',
    timestamp: 'Today, 09:30 AM',
    read: false,
    link: '/blood/donor-profile'
  },
  {
    id: 'n_camp_02',
    type: 'camp',
    title: '🏥 Mega Voluntary Blood Donation Camp',
    message: 'Indian Red Cross Society & Rotary Club are organizing a civic voluntary blood drive this Saturday at Egmore Hall, 9 AM - 4 PM. All voluntary donors welcome.',
    timestamp: 'Yesterday',
    read: false,
    link: '/nearby-hospitals'
  },
  {
    id: 'n_rare_03',
    type: 'emergency',
    title: '🚨 Rare Blood Group Standby Alert (O-)',
    message: 'Apollo Speciality Hospital has an active polytrauma requisition for O- Packed Red Blood Cells within 5 km of your location.',
    timestamp: '2 hours ago',
    read: false,
    link: '/blood/req_emergency_01'
  },
  {
    id: 'n_appt_04',
    type: 'appointment',
    title: '⏱️ Scheduled Transfusion Center Appointment',
    message: 'Reminder: Your pre-donation screening appointment is confirmed at Government General Hospital Blood Bank for tomorrow at 10:30 AM.',
    timestamp: '3 days ago',
    read: true,
    link: '/hospital/dashboard'
  },
  {
    id: 'n_sys_05',
    type: 'system',
    title: 'LifeGuard Smart Emergency System Ready',
    message: 'Your emergency assistance and donor discovery network is operational. Keep your medical profile updated.',
    timestamp: '1 week ago',
    read: true,
    link: '/profile'
  }
];

const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'emergency' | 'blood' | 'camp' | 'eligibility'>('all');
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('lifeguard_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
    if (filter === 'blood') return n.type === 'blood' || n.type === 'eligibility' || n.type === 'camp';
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
            <p className="text-xs text-gray-500">Eligibility reminders, blood camps & emergency alerts</p>
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
              title="Clear all notifications"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-4 pt-2 overflow-x-auto no-scrollbar shadow-xs">
        {[
          { key: 'all', label: 'All Alerts' },
          { key: 'eligibility', label: '🩸 Eligibility' },
          { key: 'emergency', label: '🚨 Emergency' },
          { key: 'camp', label: '🏥 Donation Camps' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2.5 text-xs font-black border-b-2 transition-all whitespace-nowrap ${
              filter === tab.key 
                ? 'border-red-600 text-red-600' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 max-w-xl mx-auto space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 space-y-3 max-w-md mx-auto my-6">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-3xl flex items-center justify-center mx-auto">
              <Bell size={28} />
            </div>
            <h3 className="font-bold text-base text-gray-900">No Notifications</h3>
            <p className="text-xs text-gray-500">
              You have no alerts matching this filter.
            </p>
          </div>
        ) : (
          filtered.map(notif => {
            const isUnread = !notif.read;

            return (
              <div 
                key={notif.id} 
                className={`p-4 rounded-3xl border transition-all space-y-2 ${
                  isUnread 
                    ? 'bg-white border-red-200 shadow-sm' 
                    : 'bg-white/70 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                      notif.type === 'emergency' ? 'bg-red-100 text-red-600' :
                      notif.type === 'eligibility' ? 'bg-emerald-100 text-emerald-700' :
                      notif.type === 'camp' ? 'bg-blue-100 text-blue-700' :
                      notif.type === 'appointment' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {notif.type === 'emergency' ? '🚨' :
                       notif.type === 'eligibility' ? '🩸' :
                       notif.type === 'camp' ? '🏥' :
                       notif.type === 'appointment' ? '⏱️' : '🔔'}
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 text-xs leading-tight">{notif.title}</h4>
                      <p className="text-[11px] text-gray-600 font-medium mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-gray-400 font-medium shrink-0">
                    {notif.timestamp}
                  </span>
                </div>

                {notif.link && (
                  <div className="pt-1 flex justify-end">
                    <Link
                      to={notif.link}
                      className="text-xs font-bold text-red-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Take Action</span>
                      <span>→</span>
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
