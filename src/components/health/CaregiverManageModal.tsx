import React, { useState, useId } from 'react';
import { 
  X, Shield, UserPlus, Trash2, CheckCircle2, AlertCircle, ShieldAlert, Key, Lock, Users
} from 'lucide-react';
import { 
  CaregiverAccess, 
  addCaregiver, 
  revokeCaregiver, 
  deleteCaregiver 
} from '../../services/healthRecordsService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  caregivers: CaregiverAccess[];
  onUpdated: () => void;
  userId?: string;
}

export const CaregiverManageModal: React.FC<Props> = ({
  isOpen,
  onClose,
  caregivers,
  onUpdated,
  userId
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('Spouse');
  const [role, setRole] = useState<'view_only' | 'manage_records'>('view_only');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate unique IDs for form controls
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const relId = useId();
  const roleId = useId();

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      await addCaregiver({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        relation,
        role
      }, userId);

      setName('');
      setEmail('');
      setPhone('');
      setShowAddForm(false);
      onUpdated();
    } catch (err) {
      console.error(err);
      alert('Failed to add caregiver.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (window.confirm('Revoke access for this caregiver? They will no longer be able to view or manage your records.')) {
      await revokeCaregiver(id, userId);
      onUpdated();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Remove this caregiver entirely from your records?')) {
      await deleteCaregiver(id, userId);
      onUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Shield size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Authorized Caregiver Access</h2>
              <p className="text-xs text-gray-500">Manage who can view or assist with your medical records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Security Banner */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 flex items-start gap-3">
            <Lock className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-gray-700 dark:text-gray-300">
              <p className="font-bold text-gray-900 dark:text-white">Strict Privacy Boundary</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Private health records require verified Firebase authentication. Only your verified account and explicitly granted caregivers listed below have cryptographic decryption access.
              </p>
            </div>
          </div>

          {/* Caregivers List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Active Caregiver Grants ({caregivers.length})
              </h3>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-1"
                >
                  <UserPlus size={14} /> Add Caregiver
                </button>
              )}
            </div>

            {caregivers.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl text-gray-400">
                <Users size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-gray-600 dark:text-gray-300">No authorized caregivers yet</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Only you have access to your health documents and vitals.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {caregivers.map((cg) => {
                  const isRevoked = cg.status === 'revoked';
                  return (
                    <div
                      key={cg.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        isRevoked
                          ? 'bg-gray-50 dark:bg-slate-800/30 border-gray-200 dark:border-slate-800 opacity-60'
                          : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs text-gray-900 dark:text-white">{cg.name}</p>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isRevoked
                              ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                          }`}>
                            {isRevoked ? 'REVOKED' : 'ACTIVE'}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {cg.relation} • {cg.email} {cg.phone && `• ${cg.phone}`}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {cg.role === 'manage_records' ? 'Full Records Management' : 'View Only Access'}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Granted: {new Date(cg.grantedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {!isRevoked ? (
                          <button
                            onClick={() => handleRevoke(cg.id)}
                            className="px-2.5 py-1 text-[11px] font-bold text-amber-600 hover:bg-amber-50 rounded-lg"
                            title="Revoke Access"
                          >
                            Revoke
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDelete(cg.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Caregiver Form */}
          {showAddForm && (
            <form onSubmit={handleAdd} className="bg-blue-50/50 dark:bg-slate-800/80 border border-blue-200 dark:border-blue-900/40 p-4 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <UserPlus size={15} /> Grant New Caregiver Access
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label htmlFor={nameId} className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Caregiver Full Name *
                </label>
                <input
                  id={nameId}
                  type="text"
                  placeholder="e.g. Dr. Rajesh Sharma, Ananya Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor={emailId} className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Caregiver Email *
                  </label>
                  <input
                    id={emailId}
                    type="email"
                    placeholder="caregiver@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor={phoneId} className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    id={phoneId}
                    type="tel"
                    placeholder="+91 98400 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor={relId} className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Relation / Role
                  </label>
                  <select
                    id={relId}
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Child">Adult Child</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Primary Care Physician">Primary Care Physician</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                    <option value="Other">Other Caregiver</option>
                  </select>
                </div>

                <div>
                  <label htmlFor={roleId} className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Access Permission Level
                  </label>
                  <select
                    id={roleId}
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="view_only">View Only (Read-Only)</option>
                    <option value="manage_records">Manage (Upload & Record)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow hover:bg-blue-700"
                >
                  {isSubmitting ? 'Granting...' : 'Grant Access'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
