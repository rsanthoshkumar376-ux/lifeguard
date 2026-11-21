import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  Users, 
  Activity, 
  Droplet, 
  MapPin, 
  Phone, 
  Building2, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar, 
  RefreshCw,
  Ambulance,
  Heart,
  Search,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  EmergencyBloodRequest, 
  getAllEmergencyRequests, 
  updateRequestLifecycleStatus 
} from '../../services/bloodRequestLifecycleService';
import { 
  BloodInventoryItem, 
  getAllInventoryItems, 
  updateInventoryItemUnits,
  attestBloodBankStock,
  PatientHandoverRecord,
  getHandoversForHospital,
  updateHandoverStatus
} from '../../services/hospitalNetworkService';
import { AddInventoryModal } from '../../components/hospital/AddInventoryModal';
import { PatientHandoverModal } from '../../components/hospital/PatientHandoverModal';
import { BloodGroup, ALL_BLOOD_GROUPS } from '../../services/bloodCompatibilityService';

const HospitalDashboard: React.FC = () => {
  const { user } = useAuth();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'requests' | 'inventory' | 'handovers' | 'history'>('requests');
  
  // Requisitions State
  const [requests, setRequests] = useState<EmergencyBloodRequest[]>([]);
  const [inventory, setInventory] = useState<BloodInventoryItem[]>([]);
  const [handovers, setHandovers] = useState<PatientHandoverRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
  const [selectedHandover, setSelectedHandover] = useState<PatientHandoverRecord | null>(null);
  const [statusNotification, setStatusNotification] = useState('');

  // Hospital profile info
  const hospitalName = (user as any)?.hospitalName || 'Apollo Speciality Hospital';
  const hospitalId = (user as any)?.hospitalId || 'hosp_apollo_01';
  const bloodBankId = 'bb_apollo_01';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [reqList, invList, hoList] = await Promise.all([
        getAllEmergencyRequests(),
        getAllInventoryItems(),
        getHandoversForHospital('all')
      ]);
      setRequests(reqList);
      setInventory(invList);
      setHandovers(hoList);
    } catch (e) {
      console.error('Failed loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLifecycle = async (requestId: string, newStatus: any, note: string) => {
    try {
      const updated = await updateRequestLifecycleStatus(requestId, newStatus, note, hospitalName);
      if (updated) {
        setRequests(prev => prev.map(r => r.id === requestId ? updated : r));
        setStatusNotification(`Requisition #${requestId.slice(-5)} marked as "${newStatus}"`);
        setTimeout(() => setStatusNotification(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAttestStock = async () => {
    await attestBloodBankStock(bloodBankId);
    setStatusNotification('Blood bank stock attestation confirmed! Freshness timestamp updated.');
    setTimeout(() => setStatusNotification(''), 3000);
  };

  const handleAdjustInventoryUnits = async (itemId: string, currentUnits: number, delta: number) => {
    const updated = await updateInventoryItemUnits(itemId, currentUnits + delta);
    if (updated) {
      setInventory(prev => prev.map(i => i.id === itemId ? updated : i));
    }
  };

  // Filter requests
  const activeRequests = requests.filter(r => r.status !== 'Fulfilled' && r.status !== 'Cancelled');
  const completedRequests = requests.filter(r => r.status === 'Fulfilled' || r.status === 'Cancelled');
  const activeHandovers = handovers.filter(h => h.status !== 'admitted');

  // Total inventory units
  const totalBloodUnits = inventory.reduce((sum, item) => sum + item.availableUnits, 0);
  const totalPledgedDonors = requests.reduce((sum, r) => sum + (r.donorResponses?.filter(d => d.status === 'accepted').length || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-20 border-b border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center font-black text-xl border border-red-100 shadow-xs">
              🏥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-gray-900 leading-tight">{hospitalName}</h1>
                <span className="inline-flex items-center bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  <CheckCircle size={11} className="mr-1" /> Verified Facility
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">Licensed Trauma Center & Blood Bank Coordination Desk</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link 
              to="/hospital/create-request" 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-black flex items-center justify-center shadow-md active:scale-95 transition-all text-xs gap-1.5"
            >
              <Plus size={16} />
              <span>NEW BLOOD REQUISITION</span>
            </Link>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="bg-red-50/70 p-3 rounded-2xl border border-red-100">
            <span className="text-[10px] text-red-600 font-bold uppercase block">Active Requisitions</span>
            <span className="text-2xl font-black text-red-700 leading-none">{activeRequests.length}</span>
            <span className="text-[10px] text-red-500 font-medium block mt-0.5">Emergency cases</span>
          </div>

          <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-100">
            <span className="text-[10px] text-blue-600 font-bold uppercase block">Pledged Donors</span>
            <span className="text-2xl font-black text-blue-700 leading-none">{totalPledgedDonors}</span>
            <span className="text-[10px] text-blue-500 font-medium block mt-0.5">Matched & en route</span>
          </div>

          <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
            <span className="text-[10px] text-emerald-600 font-bold uppercase block">In-Stock Blood Units</span>
            <span className="text-2xl font-black text-emerald-700 leading-none">{totalBloodUnits}</span>
            <span className="text-[10px] text-emerald-500 font-medium block mt-0.5">Tested & crossmatch-ready</span>
          </div>

          <div className="bg-purple-50/70 p-3 rounded-2xl border border-purple-100">
            <span className="text-[10px] text-purple-600 font-bold uppercase block">Inbound Handovers</span>
            <span className="text-2xl font-black text-purple-700 leading-none">{activeHandovers.length}</span>
            <span className="text-[10px] text-purple-500 font-medium block mt-0.5">Ambulances en route</span>
          </div>
        </div>
      </div>

      {statusNotification && (
        <div className="max-w-5xl mx-auto px-4 mt-3">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{statusNotification}</span>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 pt-1 sticky top-[138px] z-10 flex overflow-x-auto no-scrollbar shadow-xs">
        <button 
          onClick={() => setActiveTab('requests')} 
          className={`px-4 py-3 text-xs font-black border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'requests' 
              ? 'border-red-600 text-red-600' 
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Droplet size={15} />
          <span>Active Requisitions ({activeRequests.length})</span>
        </button>

        <button 
          onClick={() => setActiveTab('inventory')} 
          className={`px-4 py-3 text-xs font-black border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'inventory' 
              ? 'border-red-600 text-red-600' 
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Activity size={15} />
          <span>Blood Bank Inventory ({inventory.length} Batches)</span>
        </button>

        <button 
          onClick={() => setActiveTab('handovers')} 
          className={`px-4 py-3 text-xs font-black border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'handovers' 
              ? 'border-red-600 text-red-600' 
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Ambulance size={15} />
          <span>Patient Handovers ({handovers.length})</span>
        </button>

        <button 
          onClick={() => setActiveTab('history')} 
          className={`px-4 py-3 text-xs font-black border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'history' 
              ? 'border-red-600 text-red-600' 
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Clock size={15} />
          <span>Completed Cases ({completedRequests.length})</span>
        </button>
      </div>

      {/* Main Content Body */}
      <div className="p-4 max-w-5xl mx-auto space-y-4">
        {loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <RefreshCw size={24} className="animate-spin mx-auto text-red-600 mb-2" />
            <p className="text-xs font-bold text-gray-600">Syncing hospital emergency desk...</p>
          </div>
        ) : (
          <>
            {/* SUB-TAB 1: BLOOD REQUISITIONS */}
            {activeTab === 'requests' && (
              <div className="space-y-4">
                {activeRequests.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 space-y-3">
                    <Droplet size={32} className="mx-auto text-gray-400" />
                    <h3 className="font-bold text-base text-gray-900">No Open Blood Requisitions</h3>
                    <p className="text-xs text-gray-500">All current requisitions are fulfilled. Tap below to create an emergency requisition.</p>
                    <Link
                      to="/hospital/create-request"
                      className="inline-block px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold shadow-sm"
                    >
                      Broadcast New Requisition
                    </Link>
                  </div>
                ) : (
                  activeRequests.map(req => {
                    const pledgedDonors = req.donorResponses?.filter(d => d.status === 'accepted') || [];

                    return (
                      <div key={req.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200/80 space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-13 h-13 min-w-[52px] rounded-2xl bg-red-50 border border-red-200 flex flex-col items-center justify-center text-red-600 shadow-xs">
                              <span className="font-black text-2xl leading-none">{req.bloodGroup}</span>
                              <span className="text-[9px] font-bold text-red-400 mt-0.5">RBC</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-black text-gray-900 text-base">Requisition #{req.id.slice(-6)}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  req.urgency === 'Critical' ? 'bg-red-100 text-red-700 animate-pulse' :
                                  req.urgency === 'Urgent' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {req.urgency}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 font-medium mt-0.5">
                                {req.department} • Ref: <span className="font-mono font-bold text-gray-700">{req.patientReference}</span> • {req.unitsRequired} Unit(s) {req.bloodComponent}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800 uppercase">
                              {req.status}
                            </span>
                          </div>
                        </div>

                        {req.notes && (
                          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-700 font-medium">
                            <span className="font-bold text-gray-900 block mb-0.5">Clinical Requirement Notes:</span>
                            {req.notes}
                          </div>
                        )}

                        {/* Lifecycle Stepper Action Bar */}
                        <div className="bg-gray-50/80 rounded-2xl p-3 border border-gray-200/80 space-y-2">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-wide block">
                            Update Clinical Requisition Lifecycle Stage
                          </span>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleUpdateLifecycle(req.id, 'Hospital Contacted', 'Hospital blood bank coordinator contacted donor to confirm crossmatch appointment.')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                req.status === 'Hospital Contacted' 
                                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm' 
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              📞 Donor Contacted
                            </button>

                            <button
                              onClick={() => handleUpdateLifecycle(req.id, 'Fulfilled', 'Required blood units collected, crossmatched, and delivered to trauma ward.')}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1"
                            >
                              <CheckCircle size={13} />
                              <span>Mark Fulfilled & Collected</span>
                            </button>

                            <button
                              onClick={() => handleUpdateLifecycle(req.id, 'Cancelled', 'Requisition cancelled or requirement fulfilled by blood bank emergency reserves.')}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 transition-all"
                            >
                              Cancel Requisition
                            </button>

                            <Link
                              to={`/blood/${req.id}`}
                              className="ml-auto px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
                            >
                              Public Case View →
                            </Link>
                          </div>
                        </div>

                        {/* Responded Donors */}
                        {pledgedDonors.length > 0 && (
                          <div className="space-y-2 pt-1 border-t border-gray-100">
                            <span className="text-[11px] font-black text-gray-700 uppercase tracking-wide block">
                              Pledged Donors for this Requisition ({pledgedDonors.length})
                            </span>
                            <div className="space-y-1.5">
                              {pledgedDonors.map((d, index) => (
                                <div key={index} className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                                      {d.bloodGroup}
                                    </div>
                                    <div>
                                      <span className="font-black text-gray-900 block">{d.donorName}</span>
                                      <span className="text-[10px] text-emerald-800">
                                        Pledged at {new Date(d.respondedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {d.phone && (
                                      <a
                                        href={`tel:${d.phone}`}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                                      >
                                        <Phone size={12} /> Contact Donor
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* SUB-TAB 2: BLOOD BANK INVENTORY */}
            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200/80 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-black text-base text-gray-900 leading-tight">Live Blood Component Inventory</h3>
                      <p className="text-xs text-gray-500 font-medium">Real-time units with batch numbers, expiration timers, and quality attestation</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAttestStock}
                        className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-emerald-200"
                        title="Attest inventory is verified and active today"
                      >
                        <ShieldCheck size={15} className="text-emerald-600" />
                        <span>Attest Stock Freshness</span>
                      </button>

                      <button
                        onClick={() => setShowAddInventoryModal(true)}
                        className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Plus size={15} />
                        <span>Add Stock Batch</span>
                      </button>
                    </div>
                  </div>

                  {/* Stock Gauge Grid for 8 Blood Groups */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
                    {ALL_BLOOD_GROUPS.map(bg => {
                      const groupUnits = inventory
                        .filter(i => i.bloodGroup === bg)
                        .reduce((sum, i) => sum + i.availableUnits, 0);

                      const isCritical = groupUnits <= 2;
                      const isAdequate = groupUnits >= 5;

                      return (
                        <div key={bg} className={`p-3 rounded-2xl text-center border transition-all ${
                          isCritical ? 'bg-red-50 border-red-200' :
                          isAdequate ? 'bg-emerald-50/70 border-emerald-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <span className="font-black text-sm block text-gray-900">{bg}</span>
                          <span className={`text-xl font-black block mt-0.5 ${
                            isCritical ? 'text-red-600 animate-pulse' :
                            isAdequate ? 'text-emerald-700' : 'text-gray-700'
                          }`}>
                            {groupUnits}
                          </span>
                          <span className="text-[9px] font-bold uppercase text-gray-400 block">Units</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-500">
                      Inventory Batches ({inventory.length})
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold">
                        <tr>
                          <th className="p-3.5">Group</th>
                          <th className="p-3.5">Component</th>
                          <th className="p-3.5">Available Units</th>
                          <th className="p-3.5">Batch No.</th>
                          <th className="p-3.5">Expiry Date</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Quick Adjust</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        {inventory.map(item => {
                          const expiry = new Date(item.expiryDate);
                          const isExpired = expiry.getTime() < Date.now();

                          return (
                            <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                              <td className="p-3.5 font-black text-red-600 text-sm">
                                {item.bloodGroup}
                              </td>
                              <td className="p-3.5 font-bold text-gray-900">
                                {item.bloodComponent}
                              </td>
                              <td className="p-3.5 font-black text-base text-gray-900">
                                {item.availableUnits} Units
                              </td>
                              <td className="p-3.5 font-mono text-[11px] text-gray-600">
                                {item.batchNumber}
                              </td>
                              <td className="p-3.5">
                                <span className={isExpired ? 'text-red-600 font-bold' : 'text-gray-700'}>
                                  {expiry.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  isExpired ? 'bg-red-100 text-red-800' :
                                  item.status === 'critical' ? 'bg-red-100 text-red-700' :
                                  item.status === 'low_stock' ? 'bg-orange-100 text-orange-700' :
                                  'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {isExpired ? 'EXPIRED' : item.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleAdjustInventoryUnits(item.id, item.availableUnits, -1)}
                                    className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs"
                                    title="Deduct 1 unit (transfused)"
                                  >
                                    -
                                  </button>
                                  <button
                                    onClick={() => handleAdjustInventoryUnits(item.id, item.availableUnits, 1)}
                                    className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs"
                                    title="Add 1 unit"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: EMERGENCY PATIENT HANDOVERS */}
            {activeTab === 'handovers' && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200/80 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-base text-gray-900 leading-tight">Incoming Ambulance Emergency Handovers</h3>
                    <p className="text-xs text-gray-500 font-medium">Digital SBAR handover protocol from 108 ambulances & emergency dispatch</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {handovers.map(ho => (
                    <div 
                      key={ho.id} 
                      className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-sm space-y-3 hover:border-emerald-500 transition-all cursor-pointer"
                      onClick={() => setSelectedHandover(ho)}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center font-black text-lg border border-emerald-100">
                            {ho.bloodGroup}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-base text-gray-900">{ho.patientName}</h4>
                              <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded font-bold text-gray-700">
                                {ho.handoverCode}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 font-medium">
                              {ho.patientAge} yrs • {ho.patientGender} • SOS: {new Date(ho.sosTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                          ho.status === 'en_route' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          ho.status === 'received' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {ho.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-2xl border border-gray-100 leading-relaxed font-medium">
                        {ho.emergencyNotes}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="bg-blue-50/70 p-2 rounded-xl text-center">
                          <span className="text-[10px] text-blue-600 font-bold block">Pulse</span>
                          <span className="font-black text-gray-900">{ho.vitalSigns.pulseBpm || '--'} BPM</span>
                        </div>
                        <div className="bg-purple-50/70 p-2 rounded-xl text-center">
                          <span className="text-[10px] text-purple-600 font-bold block">Blood Pressure</span>
                          <span className="font-black text-gray-900">{ho.vitalSigns.bloodPressure || '--'}</span>
                        </div>
                        <div className="bg-emerald-50/70 p-2 rounded-xl text-center">
                          <span className="text-[10px] text-emerald-600 font-bold block">SpO2 Oxygen</span>
                          <span className="font-black text-gray-900">{ho.vitalSigns.spO2Percent || '--'}%</span>
                        </div>
                        <div className="bg-amber-50/70 p-2 rounded-xl text-center">
                          <span className="text-[10px] text-amber-600 font-bold block">GCS Scale</span>
                          <span className="font-black text-gray-900">{ho.vitalSigns.gcsScore || 15} / 15</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-medium">{ho.transportingAmbulance}</span>
                        <span className="text-blue-600 font-bold flex items-center gap-1">
                          <FileText size={13} /> View Full SBAR Slip & Triage Actions →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-TAB 4: CASE HISTORY */}
            {activeTab === 'history' && (
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-gray-500 block">
                  Fulfilled & Closed Blood Requisitions ({completedRequests.length})
                </span>

                {completedRequests.map(req => (
                  <div key={req.id} className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center font-black">
                        {req.bloodGroup}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-sm">{req.patientReference} • {req.department}</h4>
                        <p className="text-xs text-gray-500">
                          {req.unitsRequired} Unit(s) {req.bloodComponent} • Closed on {new Date(req.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Blood Stock Batch Modal */}
      <AddInventoryModal
        isOpen={showAddInventoryModal}
        onClose={() => setShowAddInventoryModal(false)}
        bloodBankId={bloodBankId}
        bloodBankName={`${hospitalName} Blood Bank`}
        onItemAdded={(item) => {
          setInventory(prev => [item, ...prev]);
          setStatusNotification(`Batch #${item.batchNumber} successfully recorded into live inventory.`);
          setTimeout(() => setStatusNotification(''), 3000);
        }}
      />

      {/* Patient Handover SBAR Modal */}
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

export default HospitalDashboard;
