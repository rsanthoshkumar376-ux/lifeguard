import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Hospital as HospitalIcon, Phone, MapPin, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../config/api';

const NearbyHospitalsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/hospitals');
      if (Array.isArray(data)) {
        setHospitals(data);
      } else if (data && Array.isArray(data.hospitals)) {
        setHospitals(data.hospitals);
      } else {
        setHospitals([]);
      }
    } catch (e) {
      console.error(e);
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredHospitals = hospitals.filter(h => 
    h.name?.toLowerCase().includes(search.toLowerCase()) ||
    h.city?.toLowerCase().includes(search.toLowerCase()) ||
    h.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-gray-900">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link to="/" className="mr-3 text-gray-600 hover:text-gray-900"><ArrowLeft size={24} /></Link>
            <h1 className="text-xl font-bold text-gray-900">Nearby Hospitals</h1>
          </div>
          <Link
            to="/hospital/register"
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow text-xs font-bold flex items-center gap-1"
            title="Register Hospital"
          >
            <Plus size={18} />
          </Link>
        </div>
        
        <div className="relative">
           <Search className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
           <input 
             type="text" 
             placeholder="Search hospitals by name, area, or city..." 
             className="w-full bg-gray-100 text-gray-900 placeholder:text-gray-400 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>
      </div>

      {/* Emergency Hotlines Bar */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <a href="tel:108" className="bg-red-600 text-white p-3 rounded-2xl flex items-center justify-between shadow-sm active:scale-95 transition-all">
          <div>
            <p className="text-[10px] font-bold uppercase text-red-200">Ambulance (24/7)</p>
            <p className="text-lg font-black">108</p>
          </div>
          <Phone size={20} className="text-white" />
        </a>
        <a href="tel:112" className="bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-between shadow-sm active:scale-95 transition-all">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-300">National Emergency</p>
            <p className="text-lg font-black">112</p>
          </div>
          <Phone size={20} className="text-white" />
        </a>
      </div>

      <div className="px-4 pb-4">
         <p className="text-xs text-gray-500 font-bold mb-3 uppercase tracking-wider">
           Registered Hospitals ({filteredHospitals.length})
         </p>
         
         {loading ? (
           <div className="text-center py-16">
             <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
             <p className="text-sm font-bold text-gray-600">Locating hospitals...</p>
           </div>
         ) : filteredHospitals.length === 0 ? (
           <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 space-y-4 max-w-md mx-auto my-6">
             <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto">
               <HospitalIcon size={32} />
             </div>
             <div>
               <h3 className="font-bold text-base text-gray-900">No Hospitals Found</h3>
               <p className="text-xs text-gray-500 mt-1">
                 {search ? 'No registered hospitals matched your search.' : 'No hospitals have been registered in your area yet.'}
               </p>
             </div>
             <Link 
               to="/hospital/register"
               className="inline-block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow active:scale-95 transition-all"
             >
               Register Hospital or Clinic
             </Link>
           </div>
         ) : (
           <div className="space-y-3">
             {filteredHospitals.map(h => (
                <div key={h.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                   <div className="flex items-start space-x-3">
                      <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-bold shrink-0">
                        <HospitalIcon size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                         <h3 className="font-bold text-gray-900 text-base truncate">{h.name}</h3>
                         <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                           <MapPin size={12} className="shrink-0 text-gray-400" />
                           <span className="truncate">{h.address || h.city || 'Emergency Centre'}</span>
                         </p>
                      </div>
                   </div>

                   <div className="flex gap-2 pt-1 border-t border-gray-100">
                      {h.phone && (
                        <a 
                          href={`tel:${h.phone}`} 
                          className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                        >
                           <Phone size={14} /> Call Hospital
                        </a>
                      )}
                      <Link 
                        to="/hospital/create-request"
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow"
                      >
                         Request Blood
                      </Link>
                   </div>
                </div>
             ))}
           </div>
         )}
      </div>
    </div>
  );
};

export default NearbyHospitalsPage;
