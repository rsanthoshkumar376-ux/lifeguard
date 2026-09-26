import React, { useState } from 'react';
import { ArrowLeft, Search, Hospital, Navigation, Phone, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const NearbyHospitalsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const mockHospitals = [
    { id: 1, name: 'City General Hospital', address: '123 Main St, City Center', distance: '1.2 km', verified: true, phone: '123-456-7890' },
    { id: 2, name: 'Hope Medical Care', address: '45 West Avenue, North Block', distance: '3.5 km', verified: true, phone: '098-765-4321' },
    { id: 3, name: 'St. Mary Clinic', address: '88 South Road', distance: '5.0 km', verified: false, phone: '555-123-4567' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="flex items-center mb-4">
          <Link to="/" className="mr-4 text-gray-600"><ArrowLeft size={24} /></Link>
          <h1 className="text-xl font-bold text-gray-900">Nearby Hospitals</h1>
        </div>
        
        <div className="relative">
           <Search className="absolute left-3 top-3 text-gray-400" size={20} />
           <input 
             type="text" 
             placeholder="Search hospitals..." 
             className="w-full bg-gray-100 border-none rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>
      </div>

      <div className="p-4">
         <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wider">Showing verified hospitals near you</p>
         
         <div className="space-y-4">
            {mockHospitals.map(h => (
               <div key={h.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3 shrink-0"><Hospital size={20}/></div>
                        <div>
                           <h3 className="font-bold text-gray-900 text-lg flex items-center">
                             {h.name}
                             {h.verified && <Star size={14} className="ml-1 text-yellow-500 fill-yellow-500" />}
                           </h3>
                           <p className="text-sm text-gray-500 line-clamp-1">{h.address}</p>
                        </div>
                     </div>
                  </div>
                  
                  <div className="text-sm font-bold text-blue-600 mb-4 pl-13 ml-13">
                     📍 {h.distance} away
                  </div>

                  <div className="flex space-x-3">
                     <button className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-xl font-bold flex items-center justify-center hover:bg-gray-50">
                        <Phone size={16} className="mr-2" /> CALL
                     </button>
                     <button className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-xl font-bold flex items-center justify-center hover:bg-blue-100">
                        <Navigation size={16} className="mr-2" /> DIRECTIONS
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default NearbyHospitalsPage;
