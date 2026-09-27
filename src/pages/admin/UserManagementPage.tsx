import React, { useState } from 'react';
import { Search, User, Shield, ShieldOff, MoreVertical } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  phone: string;
  email: string;
  bloodGroup: string;
  role: 'user' | 'admin' | 'hospital_staff';
  status: 'active' | 'suspended';
  joinedDate: string;
}

const mockUsers: UserData[] = [];

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.phone.includes(searchQuery) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStatus = (id: string) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'active' ? 'suspended' : 'active' };
      }
      return u;
    }));
    setOpenMenuId(null);
  };

  const changeRole = (id: string, newRole: UserData['role']) => {
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    setOpenMenuId(null);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 mt-1">Manage user roles and access</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Blood Group</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-900">{user.phone}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-red-100 text-red-700 font-bold text-sm">
                      {user.bloodGroup}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'hospital_staff' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {user.joinedDate}
                  </td>
                  <td className="p-4 text-right relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {openMenuId === user.id && (
                      <div className="absolute right-8 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1">
                        <button 
                          onClick={() => toggleStatus(user.id)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          {user.status === 'active' ? <><ShieldOff size={16}/> Suspend User</> : <><Shield size={16}/> Activate User</>}
                        </button>
                        <hr className="my-1 border-gray-100" />
                        <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Change Role</div>
                        <button onClick={() => changeRole(user.id, 'user')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Set as User</button>
                        <button onClick={() => changeRole(user.id, 'hospital_staff')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Set as Hospital Staff</button>
                        <button onClick={() => changeRole(user.id, 'admin')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Set as Admin</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No users found matching your search.
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <Shield className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Privacy Notice:</strong> As an administrator, you cannot view user medical profiles or personal health records. System rules enforce strict data isolation for medical information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
