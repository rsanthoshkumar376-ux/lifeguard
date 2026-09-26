import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, AlertTriangle, Clock, ArrowLeft, Heart } from 'lucide-react';

const BloodRequestDetailPage: React.FC = () => {
  const { id } = useParams();

  // Mock data
  const req = {
    group: 'O-',
    hospital: 'City General Hospital',
    department: 'Emergency & Trauma',
    distance: '1.2 km',
    unitsRequired: 3,
    unitsFulfilled: 1,
    urgency: 'Critical',
    message: 'Patient in critical condition following an accident. Need O- blood immediately.',
    phone: '+1 234 567 8900',
    address: '123 Medical Way, Cityville',
    postedTime: '10 mins ago',
    expiryTime: '2 hours left',
    responses: 2
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center">
        <Link to="/blood-requests" className="mr-4 text-gray-600"><ArrowLeft size={24} /></Link>
        <h1 className="text-xl font-bold text-gray-900">Request Details</h1>
      </div>

      <div className="bg-red-600 text-white p-6 flex flex-col items-center justify-center">
         <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-red-600 font-black text-5xl mb-3 shadow-lg">
           {req.group}
         </div>
         <span className="bg-red-800 text-red-100 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider animate-pulse">
           {req.urgency} REQUIREMENT
         </span>
      </div>

      <div className="p-4 space-y-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 relative">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{req.hospital}</h2>
          <p className="text-gray-500 mb-4">{req.department}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-xl">
               <p className="text-xs text-gray-500 mb-1">Units Needed</p>
               <p className="text-xl font-bold">{req.unitsRequired - req.unitsFulfilled} <span className="text-sm font-normal text-gray-400">/ {req.unitsRequired}</span></p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
               <p className="text-xs text-gray-500 mb-1">Distance</p>
               <p className="text-xl font-bold">{req.distance}</p>
            </div>
          </div>

          <div className="bg-red-50 p-3 rounded-xl border border-red-100 mb-4 text-sm text-red-800">
            <strong>Message:</strong> {req.message}
          </div>

          <div className="flex items-center text-sm text-gray-500 justify-between border-t pt-3">
             <span className="flex items-center"><Clock size={16} className="mr-1"/> {req.postedTime}</span>
             <span className="text-red-500 font-semibold">{req.expiryTime}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
           <h3 className="font-bold text-gray-900 mb-3 flex items-center"><MapPin size={18} className="mr-2 text-gray-400"/> Location & Contact</h3>
           <p className="text-gray-600 text-sm mb-4">{req.address}</p>
           
           <a href={`tel:${req.phone}`} className="w-full flex items-center justify-center bg-blue-50 text-blue-600 py-3 rounded-xl font-bold">
             <Phone size={18} className="mr-2" /> CALL HOSPITAL
           </a>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start">
           <AlertTriangle size={20} className="text-yellow-600 mr-3 mt-0.5 shrink-0" />
           <p className="text-xs text-yellow-800">
             <strong>Safety Warning:</strong> Never pay unknown persons for blood. Confirm directly with the hospital or blood bank.
           </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex space-x-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
         <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center text-lg shadow-md active:scale-95 transition-transform">
           <Heart size={20} className="mr-2" /> I CAN DONATE
         </button>
      </div>
    </div>
  );
};

export default BloodRequestDetailPage;
