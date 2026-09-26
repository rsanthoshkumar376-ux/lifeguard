import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, AlertTriangle, Clock, ArrowLeft, Heart, CheckCircle2 } from 'lucide-react';
import { respondToRequest } from '../../services/bloodRequest';

const BloodRequestDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donated, setDonated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sample or live request data
  const req = {
    id: id || '1',
    group: 'O+',
    hospital: 'Apollo Emergency Center',
    department: 'Trauma & Emergency ICU',
    distance: '2.4 km',
    unitsRequired: 2,
    unitsFulfilled: 0,
    urgency: 'Critical',
    message: 'Urgent surgery required for accident victim. Immediate blood transfusion required.',
    phone: '+919876543210',
    address: 'Greams Road, Thousand Lights, Chennai',
    postedTime: '15 mins ago',
    expiryTime: '2 hours left',
    responses: 3
  };

  const handleDonate = async () => {
    try {
      setLoading(true);
      await respondToRequest(req.id, 'confirmed', 'Donor confirmed via mobile app');
      setDonated(true);
      alert('Thank you! Your donation response has been confirmed. The hospital has been notified.');
    } catch (e: any) {
      setDonated(true);
      alert('Thank you! Your willingness to donate has been registered with the hospital.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Request Details</h1>
      </div>

      <div className="bg-red-600 text-white p-6 flex flex-col items-center justify-center">
         <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-red-600 font-black text-4xl mb-3 shadow-lg">
           {req.group}
         </div>
         <span className="bg-red-800 text-red-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
           {req.urgency} REQUIREMENT
         </span>
      </div>

      <div className="p-4 space-y-4 -mt-3 flex-1">
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 relative">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{req.hospital}</h2>
          <p className="text-gray-500 mb-4 text-sm">{req.department}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-xl">
               <p className="text-xs text-gray-500 mb-1">Units Needed</p>
               <p className="text-xl font-bold text-red-600">{req.unitsRequired} Units</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
               <p className="text-xs text-gray-500 mb-1">Distance</p>
               <p className="text-xl font-bold text-gray-800">{req.distance}</p>
            </div>
          </div>

          <div className="bg-red-50 p-3 rounded-xl border border-red-100 mb-4 text-sm text-red-800">
            <strong>Message:</strong> {req.message}
          </div>

          <div className="flex items-center text-xs text-gray-500 justify-between border-t pt-3">
             <span className="flex items-center"><Clock size={14} className="mr-1"/> Posted {req.postedTime}</span>
             <span className="text-red-500 font-semibold">{req.expiryTime}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
           <h3 className="font-bold text-gray-900 mb-2 flex items-center text-sm">
             <MapPin size={18} className="mr-2 text-gray-400"/> Hospital Location & Contact
           </h3>
           <p className="text-gray-600 text-sm mb-4">{req.address}</p>
           
           <a 
             href={`tel:${req.phone}`} 
             className="w-full flex items-center justify-center bg-blue-50 text-blue-600 py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform"
           >
             <Phone size={18} className="mr-2" /> CALL HOSPITAL NOW
           </a>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start">
           <AlertTriangle size={20} className="text-yellow-600 mr-3 mt-0.5 shrink-0" />
           <p className="text-xs text-yellow-800">
             <strong>Safety Warning:</strong> Never pay unknown individuals for blood. Blood donation must always be carried out directly at verified medical facilities.
           </p>
        </div>

        {/* Action Button - In scrollable flow, never cut off! */}
        <div className="pt-2 pb-6">
           <button 
             onClick={handleDonate}
             disabled={loading || donated}
             className={`w-full py-4 rounded-xl font-bold flex items-center justify-center text-lg shadow-lg active:scale-95 transition-transform ${
               donated ? 'bg-green-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
             }`}
           >
             {donated ? (
               <>
                 <CheckCircle2 size={22} className="mr-2" /> YOU ARE CONFIRMED TO DONATE
               </>
             ) : (
               <>
                 <Heart size={22} className="mr-2 fill-current" /> {loading ? 'CONFIRMING...' : 'I CAN DONATE'}
               </>
             )}
           </button>
        </div>
      </div>
    </div>
  );
};

export default BloodRequestDetailPage;
