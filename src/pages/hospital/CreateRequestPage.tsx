import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const CreateRequestPage: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState('O+');
  const [units, setUnits] = useState(1);
  const [urgency, setUrgency] = useState('Urgent');

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center">
        <Link to="/hospital/dashboard" className="mr-4 text-gray-600"><ArrowLeft size={24} /></Link>
        <h1 className="text-xl font-bold text-gray-900">New Blood Request</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Blood Group */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Blood Group Required *</label>
          <div className="grid grid-cols-4 gap-2">
            {bloodGroups.map((bg) => (
              <button
                key={bg}
                onClick={() => setSelectedGroup(bg)}
                className={`py-3 rounded-xl font-bold text-lg border-2 ${
                  selectedGroup === bg 
                    ? 'border-red-500 bg-red-50 text-red-600' 
                    : 'border-gray-200 bg-white text-gray-600 hover:border-red-200'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Units */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Units Required *</label>
          <div className="flex items-center space-x-4 bg-white p-2 rounded-xl border border-gray-200 w-max">
             <button onClick={() => setUnits(Math.max(1, units - 1))} className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-xl text-gray-600">-</button>
             <span className="w-10 text-center font-bold text-xl">{units}</span>
             <button onClick={() => setUnits(Math.min(10, units + 1))} className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-xl text-gray-600">+</button>
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
             <input type="text" placeholder="e.g. PAT-12345" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
             <p className="text-xs text-gray-500 mt-1">Do NOT enter real patient names for privacy.</p>
           </div>
           
           <div>
             <label className="block text-sm font-bold text-gray-700 mb-1">Department/Ward</label>
             <input type="text" placeholder="e.g. ICU, Maternity" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
           </div>

           <div>
             <label className="block text-sm font-bold text-gray-700 mb-1">Additional Message</label>
             <textarea rows={3} placeholder="Any specific requirements..." className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"></textarea>
           </div>
        </div>

        <div className="flex items-start bg-yellow-50 p-4 rounded-xl text-sm text-yellow-800">
           <AlertTriangle size={20} className="mr-3 mt-0.5 shrink-0 text-yellow-600" />
           <p>Creating this request will instantly notify registered donors within a 15km radius of your hospital.</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
         <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-md active:scale-95 transition-transform">
           BROADCAST REQUEST
         </button>
      </div>
    </div>
  );
};

export default CreateRequestPage;
