import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, AlertCircle, Eye, Building2, MapPin, Phone, Calendar } from 'lucide-react';

type TabType = 'pending' | 'verified' | 'rejected' | 'suspended';

interface Hospital {
  id: string;
  name: string;
  regNumber: string;
  address: string;
  phone: string;
  submittedDate: string;
  status: TabType;
}

const mockHospitals: Hospital[] = [];

const HospitalVerificationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>(mockHospitals);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredHospitals = hospitals.filter(h => 
    h.status === activeTab && 
    (h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     h.regNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAction = (id: string, action: TabType) => {
    if (window.confirm(`Are you sure you want to mark this hospital as ${action}?`)) {
      setHospitals(prev => prev.map(h => h.id === id ? { ...h, status: action } : h));
      setExpandedId(null);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Hospital Verification</h1>
        <p className="text-gray-500 mt-1">Review and manage hospital registrations</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
          {(['pending', 'verified', 'rejected', 'suspended'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search hospitals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Hospital List */}
      <div className="space-y-4">
        {filteredHospitals.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
            No hospitals found in this category.
          </div>
        ) : (
          filteredHospitals.map(hospital => (
            <div key={hospital.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-shadow hover:shadow-md">
              <div 
                className="p-5 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                onClick={() => setExpandedId(expandedId === hospital.id ? null : hospital.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${activeTab === 'pending' ? 'bg-yellow-100 text-yellow-700' : activeTab === 'verified' ? 'bg-green-100 text-green-700' : activeTab === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{hospital.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{hospital.regNumber}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col md:items-end gap-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2"><MapPin size={14}/> {hospital.address}</div>
                  <div className="flex items-center gap-2"><Calendar size={14}/> Submitted: {hospital.submittedDate}</div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === hospital.id && (
                <div className="border-t border-gray-100 p-5 bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-3">Verification Documents</h4>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-blue-600 hover:bg-blue-50 transition-colors shadow-sm">
                      <Eye size={16} /> View License
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-blue-600 hover:bg-blue-50 transition-colors shadow-sm">
                      <Eye size={16} /> View ID Proof
                    </button>
                  </div>

                  <div className="flex gap-3">
                    {activeTab === 'pending' && (
                      <>
                        <button onClick={() => handleAction(hospital.id, 'verified')} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                          <CheckCircle size={18} /> Approve
                        </button>
                        <button onClick={() => handleAction(hospital.id, 'rejected')} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                          <XCircle size={18} /> Reject
                        </button>
                      </>
                    )}
                    {activeTab === 'verified' && (
                      <button onClick={() => handleAction(hospital.id, 'suspended')} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
                        <AlertCircle size={18} /> Suspend
                      </button>
                    )}
                    {(activeTab === 'suspended' || activeTab === 'rejected') && (
                      <button onClick={() => handleAction(hospital.id, 'pending')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        Move to Pending
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HospitalVerificationPage;
