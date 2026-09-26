import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createBloodRequest } from '../../services/bloodRequest';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const CreateRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState('O+');
  const [units, setUnits] = useState(1);
  const [urgency, setUrgency] = useState<'Normal' | 'Urgent' | 'Critical'>('Urgent');
  const [patientRef, setPatientRef] = useState('');
  const [department, setDepartment] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createBloodRequest('hosp-current', {
        bloodGroup: selectedGroup,
        unitsRequired: units,
        urgency,
        patientReference: patientRef || 'PAT-' + Math.floor(1000 + Math.random() * 9000),
        department: department || 'Emergency Trauma',
        message
      });
      alert('Blood request broadcasted successfully! Nearby donors are being notified.');
      navigate('/blood');
    } catch (err: any) {
      alert(err.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">New Blood Request</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6 flex-1">
        {/* Blood Group */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Blood Group Required *</label>
          <div className="grid grid-cols-4 gap-2">
            {bloodGroups.map((bg) => (
              <button
                type="button"
                key={bg}
                onClick={() => setSelectedGroup(bg)}
                className={`py-3 rounded-xl font-bold text-lg border-2 ${
                  selectedGroup === bg 
                    ? 'border-red-500 bg-red-50 text-red-600' 
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Units Required */}
        <div>
           <label className="block text-sm font-bold text-gray-700 mb-2">Units Required *</label>
           <div className="flex items-center space-x-4 bg-white p-2 border rounded-xl w-36 justify-between">
              <button 
                type="button" 
                onClick={() => setUnits(Math.max(1, units - 1))} 
                className="w-10 h-10 rounded-lg bg-gray-100 font-bold text-lg text-gray-600"
              >
                -
              </button>
              <span className="font-bold text-xl">{units}</span>
              <button 
                type="button" 
                onClick={() => setUnits(units + 1)} 
                className="w-10 h-10 rounded-lg bg-gray-100 font-bold text-lg text-gray-600"
              >
                +
              </button>
           </div>
        </div>

        {/* Urgency */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Urgency Level *</label>
          <div className="space-y-2">
             <label className={`flex items-center p-3 border-2 rounded-xl cursor-pointer ${urgency === 'Normal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                <input type="radio" name="urgency" checked={urgency === 'Normal'} onChange={() => setUrgency('Normal')} className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500" />
                <div>
                   <div className="font-bold text-blue-900">Normal</div>
                   <div className="text-xs text-blue-700">Needed within 24-48 hours</div>
                </div>
             </label>

             <label className={`flex items-center p-3 border-2 rounded-xl cursor-pointer ${urgency === 'Urgent' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}`}>
                <input type="radio" name="urgency" checked={urgency === 'Urgent'} onChange={() => setUrgency('Urgent')} className="mr-3 w-4 h-4 text-orange-600 focus:ring-orange-500" />
                <div>
                   <div className="font-bold text-orange-900">Urgent</div>
                   <div className="text-xs text-orange-700">Needed within 6-12 hours</div>
                </div>
             </label>

             <label className={`flex items-center p-3 border-2 rounded-xl cursor-pointer ${urgency === 'Critical' ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}>
                <input type="radio" name="urgency" checked={urgency === 'Critical'} onChange={() => setUrgency('Critical')} className="mr-3 w-4 h-4 text-red-600 focus:ring-red-500" />
                <div>
                   <div className="font-bold text-red-900">Critical</div>
                   <div className="text-xs text-red-700">Needed Immediately ({'<'} 2 hours)</div>
                </div>
             </label>
          </div>
        </div>

        {/* Patient Details */}
        <div className="space-y-4">
           <div>
             <label className="block text-sm font-bold text-gray-700 mb-1">Patient Reference ID *</label>
             <input 
               type="text" 
               value={patientRef}
               onChange={(e) => setPatientRef(e.target.value)}
               placeholder="e.g. PAT-12345" 
               className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
             />
             <p className="text-xs text-gray-500 mt-1">Do NOT enter real patient names for privacy.</p>
           </div>
           
           <div>
             <label className="block text-sm font-bold text-gray-700 mb-1">Department/Ward</label>
             <input 
               type="text" 
               value={department}
               onChange={(e) => setDepartment(e.target.value)}
               placeholder="e.g. ICU, Maternity" 
               className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
             />
           </div>

           <div>
             <label className="block text-sm font-bold text-gray-700 mb-1">Additional Message</label>
             <textarea 
               rows={3} 
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               placeholder="Any specific requirements..." 
               className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
             />
           </div>
        </div>

        <div className="flex items-start bg-yellow-50 p-4 rounded-xl text-sm text-yellow-800">
           <AlertTriangle size={20} className="mr-3 mt-0.5 shrink-0 text-yellow-600" />
           <p>Creating this request will instantly notify registered donors within a 15km radius of your hospital.</p>
        </div>

        {/* Submission Button in content flow — never cut off! */}
        <div className="pt-2 pb-6">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? 'BROADCASTING...' : 'BROADCAST REQUEST'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRequestPage;
