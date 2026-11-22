import React, { useState } from 'react';
import { X, Users, Check, Sparkles } from 'lucide-react';
import { createFamilyCircle, FamilyCircle } from '../../services/familyCircleService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  defaultAdminName?: string;
  defaultAdminPhone?: string;
  onCircleCreated: (circle: FamilyCircle) => void;
}

export const CreateCircleModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userId,
  defaultAdminName = 'Rajesh Kumar',
  defaultAdminPhone = '+91 98765 43210',
  onCircleCreated
}) => {
  const [name, setName] = useState('');
  const [adminName, setAdminName] = useState(defaultAdminName);
  const [adminPhone, setAdminPhone] = useState(defaultAdminPhone);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const circle = await createFamilyCircle(
        name.trim(),
        adminName.trim() || 'Family Admin',
        adminPhone.trim() || '+91 98765 43210',
        userId
      );
      onCircleCreated(circle);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to create family circle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-500/10 via-rose-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-500/20">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Create Family Health Circle</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Connect family members for health & emergency support</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Family Circle Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Kumar Family Circle"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Your Name (Administrator) *
            </label>
            <input
              type="text"
              required
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Administrator Contact Phone *
            </label>
            <input
              type="tel"
              required
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 text-[11px] text-blue-900 dark:text-blue-200 space-y-1">
            <span className="font-bold block">🔒 Strict Medical Data Isolation:</span>
            <span>Creating a family circle does not automatically share your private medical documents with all members. Each member chooses which information to authorize.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Family Circle'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CreateCircleModal;
