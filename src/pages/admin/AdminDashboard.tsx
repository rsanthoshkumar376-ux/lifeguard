import React, { useState } from 'react';
import { Users, Activity, Heart, ShieldCheck, CheckCircle, BarChart3, AlertTriangle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const stats = [
    { label: 'Total Users', value: '12,450', icon: <Users size={24} className="text-blue-500" /> },
    { label: 'Active Donors', value: '3,820', icon: <Heart size={24} className="text-red-500" /> },
    { label: 'Verified Hospitals', value: '145', icon: <ShieldCheck size={24} className="text-green-500" /> },
    { label: 'Active Requests', value: '89', icon: <AlertTriangle size={24} className="text-yellow-500" /> },
    { label: 'Completed Donations', value: '4,521', icon: <CheckCircle size={24} className="text-purple-500" /> },
  ];

  const bloodGroupStats = [
    { group: 'O+', count: 45, percentage: 80 },
    { group: 'O-', count: 12, percentage: 30 },
    { group: 'A+', count: 35, percentage: 65 },
    { group: 'A-', count: 8, percentage: 20 },
    { group: 'B+', count: 28, percentage: 55 },
    { group: 'B-', count: 5, percentage: 15 },
    { group: 'AB+', count: 15, percentage: 40 },
    { group: 'AB-', count: 2, percentage: 5 },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="text-sm text-gray-500">Last updated: Just now</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-full">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Charts Section: Requests by Blood Group */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Requests by Blood Group</h2>
          </div>
          <div className="space-y-4">
            {bloodGroupStats.map((bg, idx) => (
              <div key={idx} className="flex items-center">
                <div className="w-10 font-medium text-gray-700">{bg.group}</div>
                <div className="flex-1 ml-4 relative h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-red-500 rounded-full"
                    style={{ width: `${bg.percentage}%` }}
                  ></div>
                </div>
                <div className="w-12 text-right text-sm text-gray-600 ml-4">{bg.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links & Activity */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h2>
            <div className="space-y-3">
              <a href="/admin/hospitals" className="block p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors">Verify Hospitals</a>
              <a href="/admin/users" className="block p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition-colors">Manage Users</a>
              <a href="/admin/requests" className="block p-3 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg font-medium transition-colors">Monitor Requests</a>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">City Hospital verified</p>
                  <p className="text-xs text-gray-500">2 mins ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-red-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Critical request: O- at Metro</p>
                  <p className="text-xs text-gray-500">15 mins ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">10 new users registered</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
