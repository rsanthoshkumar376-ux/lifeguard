import React, { useState } from 'react';
import { X, UserPlus, Shield, Heart, Baby, Send, Users } from 'lucide-react';
import { 
  inviteFamilyMember, 
  FamilyRelation, 
  MemberRole, 
  FamilyInvitation 
} from '../../services/familyCircleService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  circleId: string;
  circleName: string;
  senderName: string;
  userId?: string;
  onMemberInvited: (invitation: FamilyInvitation) => void;
}

export const InviteMemberModal: React.FC<Props> = ({
  isOpen,
  onClose,
  circleId,
  circleName,
  senderName,
  userId,
  onMemberInvited
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relation, setRelation] = useState<FamilyRelation>('Parent');
  const [role, setRole] = useState<MemberRole>('member');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    try {
      const invite = await inviteFamilyMember(
        circleId,
        {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          relation,
          role
        },
        senderName,
        userId
      );
      onMemberInvited(invite);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to send family invitation.');
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
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Invite Family Member</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Add to {circleName}</p>
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
              Member Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Lakshmi Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Relation *
              </label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value as FamilyRelation)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="Parent">Parent</option>
                <option value="Spouse">Spouse</option>
                <option value="Child">Child</option>
                <option value="Sibling">Sibling</option>
                <option value="Grandparent">Grandparent</option>
                <option value="In-Law">In-Law</option>
                <option value="Guardian">Guardian</option>
                <option value="Caregiver">Caregiver</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Role in Family Circle *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('member')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  role === 'member'
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold'
                    : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <Users size={16} className="mx-auto mb-1" />
                <span className="text-xs block">Standard</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('senior')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  role === 'senior'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold'
                    : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <Heart size={16} className="mx-auto mb-1" />
                <span className="text-xs block">Senior Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('child')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  role === 'child'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                    : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <Baby size={16} className="mx-auto mb-1" />
                <span className="text-xs block">Child (Minor)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Email Address (Optional)
            </label>
            <input
              type="email"
              placeholder="member@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
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
              disabled={isSubmitting || !name.trim() || !phone.trim()}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send size={14} />
              <span>{isSubmitting ? 'Inviting...' : 'Send Invitation'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default InviteMemberModal;
