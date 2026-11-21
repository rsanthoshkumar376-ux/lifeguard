import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Hospital as HospitalIcon, 
  Phone, 
  MapPin, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Navigation, 
  Droplet, 
  ShieldCheck, 
  Building2, 
  Activity, 
  Calendar,
  FileText,
  Filter,
  RefreshCw,
  Ambulance
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  HospitalRecord, 
  BloodBankRecord, 
  getAllHospitals, 
  getAllBloodBanks, 
  getInventoryByBloodBank,
  BloodInventoryItem,
  PatientHandoverRecord,
  getHandoversForHospital
} from '../services/hospitalNetworkService';
import { PatientHandoverModal } from '../components/hospital/PatientHandoverModal';

const NearbyHospitalsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hospitals' | 'blood_banks' | 'handover'>('hospitals');
  const [search, setSearch] = useState('');
  
  // Data state
  const [hospitals, setHospitals] = useState<HospitalRecord[]>([]);
  const [bloodBanks, setBloodBanks] = useState<BloodBankRecord[]>([]);
  const [handovers, setHandovers] = useState<PatientHandoverRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedCity, setSelectedCity] = useState('All');

  // Blood Bank stock drawer
  const [selectedBloodBank, setSelectedBloodBank] = useState<BloodBankRecord | null>(null);
  const [bankInventory, setBankInventory] = useState<BloodInventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);

  // Handover modal
  const [selectedHandover, setSelectedHandover] = useState<PatientHandoverRecord | null>(null);
  const [handoverLookupCode, setHandoverLookupCode] = useState('');
  const [lookupError, setLookupError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [hospList, bbList, hoList] = await Promise.all([
        getAllHospitals(),
        getAllBloodBanks(),
        getHandoversForHospital('all')
      ]);
      setHospitals(hospList);
      setBloodBanks(bbList);
      setHandovers(hoList);
    } catch (e) {
      console.error('Error fetching directory data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBloodBank = async (bb: BloodBankRecord) => {
    setSelectedBloodBank(bb);
    setLoadingInventory(true);
    try {
      const inv = await getInventoryByBloodBank(bb.id);
      setBankInventory(inv);
    } finally {
      setLoadingInventory(false);
    }
  };

  const handleLookupHandover = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    const code = handoverLookupCode.trim().toUpperCase();
    if (!code) return;

    const match = handovers.find(h => h.handoverCode.toUpperCase() === code || h.id.toUpperCase() === code);
    if (match) {
      setSelectedHandover(match);
    } else {
      setLookupError(`No emergency patient handover found with code "${code}". Please verify with the ambulance crew.`);
    }
  };

  // Filter hospitals
  const filteredHospitals = hospitals.filter(h => {
    if (emergencyOnly && !h.emergencyDepartmentAvailable) return false;
    if (verifiedOnly && h.verificationStatus !== 'verified') return false;
    if (selectedCity !== 'All' && h.city !== selectedCity) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = h.name.toLowerCase().includes(q);
      const matchCity = h.city.toLowerCase().includes(q);
      const matchAddr = h.address.toLowerCase().includes(q);
      if (!matchName && !matchCity && !matchAddr) return false;
    }
    return true;
  });

  // Filter blood banks
  const filteredBloodBanks = bloodBanks.filter(b => {
    if (verifiedOnly && b.verificationStatus !== 'verified') return false;
    if (selectedCity !== 'All' && b.city !== selectedCity) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = b.name.toLowerCase().includes(q);
      const matchCity = b.city.toLowerCase().includes(q);
      const matchAddr = b.address.toLowerCase().includes(q);
      const matchComp = b.availableComponents.some(c => c.toLowerCase().includes(q));
      if (!matchName && !matchCity && !matchAddr && !matchComp) return false;
    }
    return true;
  });

  const cities = Array.from(new Set([...hospitals.map(h => h.city), ...bloodBanks.map(b => b.city)]));

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-gray-900">
      {/* Sticky Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-20 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Link to="/" className="mr-3 text-gray-600 hover:text-gray-900">
              <ArrowLeft size={22} />
            </Link>
            <div>
              <h1 className="text-xl font-black text-gray-900 leading-tight">Healthcare & Blood Directory</h1>
              <p className="text-[11px] text-gray-500 font-medium">Verified hospitals, 24/7 emergency departments & blood banks</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/hospital/dashboard"
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs transition-all hidden sm:flex items-center gap-1.5"
            >
              <Building2 size={14} />
              <span>Staff Portal</span>
            </Link>
            <Link
              to="/hospital/register"
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow text-xs font-bold transition-all active:scale-95"
              title="Register Hospital"
            >
              <Plus size={15} />
              <span>Register</span>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <input 
            type="text" 
            placeholder="Search by facility name, city, address, or blood component..." 
            className="w-full bg-gray-100 text-gray-900 placeholder:text-gray-400 rounded-2xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Directory Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 pt-1 sticky top-[98px] z-10 flex overflow-x-auto no-scrollbar shadow-xs">
        <button
          onClick={() => setActiveTab('hospitals')}
          className={`px-4 py-3 text-xs font-black border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'hospitals'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <HospitalIcon size={15} />
          <span>Hospitals ({filteredHospitals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('blood_banks')}
          className={`px-4 py-3 text-xs font-black border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'blood_banks'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Droplet size={15} />
          <span>Blood Banks ({filteredBloodBanks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('handover')}
          className={`px-4 py-3 text-xs font-black border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'handover'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Ambulance size={15} />
          <span>Patient Handover Lookup</span>
        </button>
      </div>

      {/* Emergency Hotlines Bar */}
      <div className="p-4 grid grid-cols-2 gap-3 max-w-4xl mx-auto">
        <a href="tel:108" className="bg-red-600 hover:bg-red-700 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-sm active:scale-95 transition-all">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-red-200">Ambulance (24/7)</p>
            <p className="text-xl font-black">108</p>
          </div>
          <Phone size={22} className="text-white" />
        </a>
        <a href="tel:112" className="bg-slate-900 hover:bg-black text-white p-3.5 rounded-2xl flex items-center justify-between shadow-sm active:scale-95 transition-all">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-300">National Emergency</p>
            <p className="text-xl font-black">112</p>
          </div>
          <Phone size={22} className="text-white" />
        </a>
      </div>

      {/* Filters Bar */}
      {activeTab !== 'handover' && (
        <div className="px-4 pb-2 max-w-4xl mx-auto flex flex-wrap items-center gap-2">
          {activeTab === 'hospitals' && (
            <button
              onClick={() => setEmergencyOnly(!emergencyOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                emergencyOnly
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              <span>24/7 Emergency Care Only</span>
            </button>
          )}

          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              verifiedOnly
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            <CheckCircle2 size={13} />
            <span>Verified Facilities Only</span>
          </button>

          {cities.length > 0 && (
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl px-3 py-1.5 outline-none"
            >
              <option value="All">All Cities</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-4 max-w-4xl mx-auto space-y-4">
        {loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-bold text-gray-600">Loading healthcare network...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: HOSPITALS */}
            {activeTab === 'hospitals' && (
              <div className="space-y-3">
                {filteredHospitals.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 space-y-4">
                    <HospitalIcon size={32} className="mx-auto text-gray-400" />
                    <h3 className="font-bold text-base text-gray-900">No Hospitals Found</h3>
                    <p className="text-xs text-gray-500">No registered hospitals matched your search or filter.</p>
                  </div>
                ) : (
                  filteredHospitals.map(h => {
                    const isVerified = h.verificationStatus === 'verified';
                    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${h.name} ${h.address} ${h.city}`)}`;

                    return (
                      <div key={h.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200/80 space-y-3.5 hover:border-blue-300 transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold shrink-0 border border-blue-100">
                              <HospitalIcon size={24} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-black text-gray-900 text-base leading-tight">{h.name}</h3>
                                {isVerified ? (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-1">
                                    <CheckCircle2 size={11} /> Verified Facility
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                                    <Clock size={11} /> Unverified • Pending Review
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mt-1">
                                <MapPin size={13} className="shrink-0 text-red-500" />
                                <span>{h.city} • {h.address}</span>
                              </p>
                            </div>
                          </div>

                          {h.emergencyDepartmentAvailable && (
                            <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-black shrink-0 border border-red-200 animate-pulse">
                              24/7 ER OPEN
                            </span>
                          )}
                        </div>

                        {/* Facility Attributes */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                            <span className="text-[10px] text-gray-400 font-bold block uppercase">Facility Type</span>
                            <span className="font-black text-gray-800 truncate block">{h.hospitalType}</span>
                          </div>
                          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                            <span className="text-[10px] text-gray-400 font-bold block uppercase">ICU Capacity</span>
                            <span className="font-black text-gray-800 block">{h.icuBedsAvailable} Available ({h.totalBeds} Beds)</span>
                          </div>
                          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                            <span className="text-[10px] text-gray-400 font-bold block uppercase">On-Site Blood Bank</span>
                            <span className={`font-black ${h.hasBloodBank ? 'text-red-600' : 'text-gray-500'}`}>
                              {h.hasBloodBank ? 'Licensed Facility ✓' : 'External Tie-up'}
                            </span>
                          </div>
                          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                            <span className="text-[10px] text-gray-400 font-bold block uppercase">Verification Validity</span>
                            <span className="font-bold text-gray-700 block text-[11px] truncate">
                              {h.verifiedAt ? `Audited ${new Date(h.verifiedAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}` : 'Self-declared'}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-1 border-t border-gray-100">
                          {h.emergencyPhone && (
                            <a 
                              href={`tel:${h.emergencyPhone}`} 
                              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Phone size={14} /> Call Emergency ({h.emergencyPhone})
                            </a>
                          )}
                          <a 
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                          >
                            <Navigation size={14} /> Directions
                          </a>
                          <Link 
                            to="/hospital/create-request"
                            className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                          >
                            <Droplet size={14} /> Requisition
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 2: BLOOD BANKS */}
            {activeTab === 'blood_banks' && (
              <div className="space-y-3">
                {filteredBloodBanks.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 space-y-4">
                    <Droplet size={32} className="mx-auto text-red-500" />
                    <h3 className="font-bold text-base text-gray-900">No Blood Banks Found</h3>
                    <p className="text-xs text-gray-500">No licensed blood bank facilities matched your criteria.</p>
                  </div>
                ) : (
                  filteredBloodBanks.map(b => {
                    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.name} ${b.address} ${b.city}`)}`;
                    const isFresh = b.freshness === 'fresh';
                    const isModerate = b.freshness === 'moderate';

                    return (
                      <div key={b.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200/80 space-y-3.5 hover:border-red-300 transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center font-bold shrink-0 border border-red-100">
                              <Droplet size={24} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-black text-gray-900 text-base leading-tight">{b.name}</h3>
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                                  {b.licenseNumber}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mt-1">
                                <MapPin size={13} className="shrink-0 text-red-500" />
                                <span>{b.city} • {b.address}</span>
                              </p>
                            </div>
                          </div>

                          {/* Data Freshness Indicator Badge */}
                          <div className="text-right shrink-0">
                            {isFresh ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-1 border border-emerald-200">
                                <CheckCircle2 size={11} /> Stock Verified Today
                              </span>
                            ) : isModerate ? (
                              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1 border border-amber-200">
                                <Clock size={11} /> Updated 2d Ago • Call to verify
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-bold flex items-center gap-1 border border-red-200">
                                <AlertTriangle size={11} /> Unverified Stock (&gt;3d)
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400 block mt-1">
                              {b.operatingHours}
                            </span>
                          </div>
                        </div>

                        {/* Available Components */}
                        <div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide block mb-1">
                            Processed & Stored Blood Components
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {b.availableComponents.map(comp => (
                              <span key={comp} className="px-2.5 py-1 bg-red-50 text-red-800 text-xs font-bold rounded-lg border border-red-100">
                                🩸 {comp}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-1 border-t border-gray-100">
                          {b.contactPhone && (
                            <a 
                              href={`tel:${b.contactPhone}`} 
                              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Phone size={14} /> Call Blood Bank ({b.contactPhone})
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSelectBloodBank(b)}
                            className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                          >
                            <Activity size={14} /> Check In-Stock Units
                          </button>
                          <a 
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors"
                            title="Navigate in Google Maps"
                          >
                            <Navigation size={16} />
                          </a>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 3: EMERGENCY PATIENT HANDOVER LOOKUP */}
            {activeTab === 'handover' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-md space-y-3">
                  <div className="flex items-center gap-2">
                    <Ambulance size={24} />
                    <h2 className="text-lg font-black">Emergency Patient Handover Portal</h2>
                  </div>
                  <p className="text-xs text-emerald-100 leading-relaxed font-medium">
                    Paramedics and emergency triage teams can look up or transmit clinical SBAR handovers using unique handover codes (`HO-XXXXX`). Contains patient-approved Medical ID, allergies, vitals, and SOS timeline.
                  </p>

                  <form onSubmit={handleLookupHandover} className="flex gap-2 pt-1">
                    <input 
                      type="text" 
                      placeholder="Enter Handover Code (e.g. HO-98214)..." 
                      value={handoverLookupCode}
                      onChange={(e) => setHandoverLookupCode(e.target.value)}
                      className="flex-1 bg-white text-gray-900 rounded-xl px-4 py-3 text-xs font-bold placeholder:text-gray-400 outline-none shadow-sm"
                    />
                    <button 
                      type="submit"
                      className="px-5 py-3 bg-gray-900 hover:bg-black text-white text-xs font-black rounded-xl shadow transition-all active:scale-95"
                    >
                      View Handover
                    </button>
                  </form>

                  {lookupError && (
                    <div className="p-3 bg-red-500/20 border border-red-300 text-white rounded-xl text-xs font-bold flex items-center gap-2">
                      <AlertTriangle size={15} />
                      <span>{lookupError}</span>
                    </div>
                  )}
                </div>

                {/* Recent Handovers List */}
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-500 block">
                    Active & Recent Inbound Handovers ({handovers.length})
                  </span>

                  {handovers.map(ho => (
                    <div 
                      key={ho.id} 
                      onClick={() => setSelectedHandover(ho)}
                      className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xs shrink-0 border border-emerald-100">
                          {ho.bloodGroup}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-gray-900 text-sm">{ho.patientName}</h4>
                            <span className="font-mono text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-bold">
                              {ho.handoverCode}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 font-medium">
                            {ho.receivingHospitalName} • SOS {new Date(ho.sosTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          ho.status === 'en_route' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          ho.status === 'received' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {ho.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Selected Blood Bank Live Stock Modal */}
      {selectedBloodBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-red-600 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-black text-base">{selectedBloodBank.name}</h3>
                <p className="text-xs text-red-100 font-medium">{selectedBloodBank.city} • {selectedBloodBank.licenseNumber}</p>
              </div>
              <button onClick={() => setSelectedBloodBank(null)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-3 text-gray-900">
              <div className="flex items-center justify-between text-xs text-gray-500 pb-2 border-b">
                <span>Last Attested: {new Date(selectedBloodBank.lastStockUpdate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                <span className={`px-2 py-0.5 rounded-full font-bold ${
                  selectedBloodBank.freshness === 'fresh' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedBloodBank.freshness.toUpperCase()}
                </span>
              </div>

              {loadingInventory ? (
                <div className="text-center py-8">
                  <RefreshCw size={20} className="animate-spin mx-auto text-red-600 mb-2" />
                  <p className="text-xs text-gray-500 font-bold">Querying verified blood bank stock...</p>
                </div>
              ) : bankInventory.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-500">
                  No inventory units currently reported. Contact blood bank directly for emergency reservation.
                </div>
              ) : (
                <div className="space-y-2">
                  {bankInventory.map(item => (
                    <div key={item.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-black">
                          {item.bloodGroup}
                        </div>
                        <div>
                          <span className="font-black text-gray-900 block">{item.bloodComponent}</span>
                          <span className="text-[10px] text-gray-500">
                            Batch: {item.batchNumber} • Exp: {new Date(item.expiryDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-gray-900 block">{item.availableUnits} Units</span>
                        <span className={`text-[9px] font-black uppercase ${
                          item.status === 'critical' ? 'text-red-600' : item.status === 'low_stock' ? 'text-orange-600' : 'text-emerald-600'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setSelectedBloodBank(null)}
                className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Handover Modal */}
      {selectedHandover && (
        <PatientHandoverModal
          isOpen={!!selectedHandover}
          onClose={() => setSelectedHandover(null)}
          handover={selectedHandover}
          onStatusUpdated={(updated) => {
            setSelectedHandover(updated);
            setHandovers(prev => prev.map(h => h.id === updated.id ? updated : h));
          }}
        />
      )}
    </div>
  );
};

export default NearbyHospitalsPage;
