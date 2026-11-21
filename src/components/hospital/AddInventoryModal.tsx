import React, { useState } from 'react';
import { X, Plus, AlertTriangle, CheckCircle2, Droplet, Calendar, ShieldCheck } from 'lucide-react';
import { BloodGroup, ALL_BLOOD_GROUPS, BloodComponent, BLOOD_COMPONENTS } from '../../services/bloodCompatibilityService';
import { BloodInventoryItem, getAllInventoryItems } from '../../services/hospitalNetworkService';

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  bloodBankId: string;
  bloodBankName: string;
  onItemAdded: (item: BloodInventoryItem) => void;
}

export const AddInventoryModal: React.FC<AddInventoryModalProps> = ({
  isOpen,
  onClose,
  bloodBankId,
  bloodBankName,
  onItemAdded
}) => {
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [bloodComponent, setBloodComponent] = useState<BloodComponent>('Packed Red Blood Cells (PRBC)');
  const [units, setUnits] = useState<number>(5);
  const [batchNumber, setBatchNumber] = useState<string>(`BATCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  
  // Default expiry date: 35 days for PRBC
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 35);
  const [expiryDate, setExpiryDate] = useState<string>(defaultDate.toISOString().split('T')[0]);
  const [staffName, setStaffName] = useState<string>('Duty Transfusion Officer');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleComponentChange = (comp: BloodComponent) => {
    setBloodComponent(comp);
    const date = new Date();
    if (comp.includes('Platelet')) {
      date.setDate(date.getDate() + 5); // 5 days for platelets
    } else if (comp.includes('Fresh Frozen Plasma')) {
      date.setDate(date.getDate() + 365); // 1 year for FFP
    } else if (comp.includes('Cryo')) {
      date.setDate(date.getDate() + 365);
    } else {
      date.setDate(date.getDate() + 35); // 35-42 days for red cells
    }
    setExpiryDate(date.toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const now = new Date().toISOString();
      const newItem: BloodInventoryItem = {
        id: `inv_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        bloodBankId,
        bloodBankName,
        bloodGroup,
        bloodComponent,
        availableUnits: Number(units) || 1,
        reservedUnits: 0,
        expiryDate: new Date(expiryDate).toISOString(),
        batchNumber: batchNumber.trim() || `BATCH-${Date.now()}`,
        status: Number(units) > 2 ? 'available' : Number(units) > 0 ? 'low_stock' : 'critical',
        lastUpdated: now,
        verifiedByStaff: staffName.trim() || 'Verified Transfusion Officer'
      };

      // Save to localStorage
      try {
        const raw = localStorage.getItem('lifeguard_blood_inventory_data');
        const list = raw ? JSON.parse(raw) : [];
        list.unshift(newItem);
        localStorage.setItem('lifeguard_blood_inventory_data', JSON.stringify(list));
      } catch {}

      onItemAdded(newItem);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-xl">
              🩸
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight leading-tight">Add Blood Stock Batch</h3>
              <p className="text-xs text-red-100 font-medium">{bloodBankName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 text-gray-900">
          {/* Blood Group */}
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-2">
              Blood Group *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ALL_BLOOD_GROUPS.map((bg) => (
                <button
                  type="button"
                  key={bg}
                  onClick={() => setBloodGroup(bg)}
                  className={`py-2.5 rounded-xl font-black text-base border-2 transition-all ${
                    bloodGroup === bg 
                      ? 'border-red-600 bg-red-50 text-red-600 shadow-sm' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Blood Component */}
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1.5">
              Blood Component *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BLOOD_COMPONENTS.map((comp) => (
                <button
                  type="button"
                  key={comp}
                  onClick={() => handleComponentChange(comp)}
                  className={`p-2.5 rounded-xl text-xs font-bold text-left border-2 transition-all flex items-center justify-between ${
                    bloodComponent === comp
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="truncate">{comp}</span>
                  {bloodComponent === comp && <span className="text-red-600 font-black">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Available Units & Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1">
                Units Tested & Available *
              </label>
              <div className="flex items-center space-x-3 bg-gray-50 p-2 border border-gray-200 rounded-xl justify-between">
                <button 
                  type="button" 
                  onClick={() => setUnits(Math.max(1, units - 1))} 
                  className="w-8 h-8 rounded-lg bg-white shadow-sm font-bold text-gray-700"
                >
                  -
                </button>
                <span className="font-black text-base text-gray-900">{units} Unit(s)</span>
                <button 
                  type="button" 
                  onClick={() => setUnits(units + 1)} 
                  className="w-8 h-8 rounded-lg bg-white shadow-sm font-bold text-gray-700"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1">
                Expiry Date *
              </label>
              <input 
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-gray-800 focus:bg-white"
              />
            </div>
          </div>

          {/* Batch Number & Staff Attestation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1">
                Testing Batch Reference *
              </label>
              <input 
                type="text" 
                required
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-gray-800 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-700 uppercase tracking-wide mb-1">
                Attesting Transfusion Officer *
              </label>
              <input 
                type="text" 
                required
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-gray-800 focus:bg-white"
              />
            </div>
          </div>

          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-[11px] text-amber-950 flex items-start gap-2">
            <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Quality Attestation:</strong> Adding this batch certifies that viral marker screening (HIV, HBV, HCV, Syphilis, Malaria) and ABO/Rh grouping have passed national blood safety protocols.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              <span>RECORD BATCH & UPDATE LIVE INVENTORY</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
