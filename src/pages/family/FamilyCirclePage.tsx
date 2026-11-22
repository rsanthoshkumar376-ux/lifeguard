import React, { useState, useEffect } from 'react';
import { 
  Users, ShieldAlert, ShieldCheck, Baby, Heart, 
  Bell, FileText, Plus, PhoneCall, Check, X, 
  Trash2, UserPlus, ArrowLeft, ExternalLink, Calendar, 
  Clock, Pill, HeartPulse, ChevronRight, AlertTriangle, 
  Activity, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  FamilyCircle, 
  FamilyMember, 
  FamilyInvitation, 
  CaregiverPermissions, 
  ChildEmergencyProfile, 
  CaregiverAccessLog, 
  FamilyNotificationItem,
  getFamilyCircleState, 
  saveFamilyCircleState, 
  respondToInvitation, 
  removeFamilyMember, 
  assignFamilyAdmin, 
  setSeniorModeActive 
} from '../../services/familyCircleService';
import CreateCircleModal from '../../components/family/CreateCircleModal';
import InviteMemberModal from '../../components/family/InviteMemberModal';
import CaregiverPermissionsModal from '../../components/family/CaregiverPermissionsModal';
import ChildProfileModal from '../../components/family/ChildProfileModal';
import FamilyEmergencyDashboard from '../../components/family/FamilyEmergencyDashboard';

export const FamilyCirclePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'circles' | 'emergency' | 'caregivers' | 'children' | 'logs' | 'notifications'>('circles');
  const [circles, setCircles] = useState<FamilyCircle[]>([]);
  const [selectedCircleId, setSelectedCircleId] = useState<string>('');
  const [invitations, setInvitations] = useState<FamilyInvitation[]>([]);
  const [caregiverPermissions, setCaregiverPermissions] = useState<CaregiverPermissions[]>([]);
  const [childProfiles, setChildProfiles] = useState<ChildEmergencyProfile[]>([]);
  const [accessLogs, setAccessLogs] = useState<CaregiverAccessLog[]>([]);
  const [notifications, setNotifications] = useState<FamilyNotificationItem[]>([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState<any[]>([]);

  // Modals
  const [isCreateCircleOpen, setIsCreateCircleOpen] = useState(false);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);
  const [isCaregiverModalOpen, setIsCaregiverModalOpen] = useState(false);
  const [editingCaregiverPerm, setEditingCaregiverPerm] = useState<CaregiverPermissions | null>(null);
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [editingChildProfile, setEditingChildProfile] = useState<ChildEmergencyProfile | null>(null);

  const currentUserId = 'user_rajesh';
  const currentUserName = 'Rajesh Kumar';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const state = await getFamilyCircleState(currentUserId);
      setCircles(state.circles);
      if (state.circles.length > 0 && !selectedCircleId) {
        setSelectedCircleId(state.circles[0].id);
      }
      setInvitations(state.invitations);
      setCaregiverPermissions(state.caregiverPermissions);
      setChildProfiles(state.childProfiles);
      setAccessLogs(state.accessLogs);
      setNotifications(state.notifications);
      setEmergencyAlerts(state.emergencyAlerts);
    } catch (err) {
      console.error(err);
    }
  };

  const activeCircle = circles.find(c => c.id === selectedCircleId) || circles[0];

  const handleRespondInvitation = async (invitationId: string, accept: boolean) => {
    await respondToInvitation(invitationId, accept, currentUserId);
    await loadData();
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!activeCircle) return;
    if (window.confirm('Remove this member from the family circle?')) {
      await removeFamilyMember(activeCircle.id, memberId, currentUserId);
      await loadData();
    }
  };

  const handleAssignAdmin = async (memberId: string) => {
    if (!activeCircle) return;
    if (window.confirm('Transfer circle administration to this family member?')) {
      await assignFamilyAdmin(activeCircle.id, memberId, currentUserId);
      await loadData();
    }
  };

  const handleEnterSeniorMode = () => {
    setSeniorModeActive(true);
    navigate('/senior-mode');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors pb-20">
      
      {/* Top Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')} 
              className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center shadow-md shadow-red-500/20">
                <Users size={20} />
              </div>
              <div>
                <h1 className="font-black text-base text-gray-900 dark:text-white leading-tight flex items-center gap-2">
                  Family Health Circle
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                    Caregiver Network
                  </span>
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Caregiver permissions, pediatric safety & senior citizen monitoring
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Senior Mode Quick Button */}
            <button
              onClick={handleEnterSeniorMode}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Heart size={14} className="fill-white" />
              <span>Senior Mode</span>
            </button>

            <button
              onClick={() => setIsCreateCircleOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Plus size={14} />
              <span>New Circle</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto p-4 space-y-5">

        {/* Senior Citizen Mode Promo Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-300 dark:border-amber-800/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Heart size={20} className="fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Senior Citizen Mode Available</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Large buttons, high-contrast text, 1-tap 108 calling, and automatic fall detection.
              </p>
            </div>
          </div>
          <button
            onClick={handleEnterSeniorMode}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            Launch Senior Mode →
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-800 overflow-x-auto no-scrollbar text-xs font-semibold">
          <button
            onClick={() => setActiveTab('circles')}
            className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'circles'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Users size={15} />
            <span>Circle & Members ({activeCircle?.members.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('emergency')}
            className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'emergency'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <ShieldAlert size={15} className="text-rose-500" />
            <span>Emergency Dashboard ({emergencyAlerts.filter(a => a.status !== 'Resolved').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('caregivers')}
            className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'caregivers'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <ShieldCheck size={15} className="text-teal-500" />
            <span>Caregiver Permissions ({caregiverPermissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('children')}
            className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'children'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Baby size={15} className="text-blue-500" />
            <span>Child Safety ({childProfiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Bell size={15} className="text-amber-500" />
            <span>Family Notifications ({notifications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <FileText size={15} className="text-gray-400" />
            <span>Access Audit Logs</span>
          </button>
        </div>

        {/* TAB 1: CIRCLE & MEMBERS */}
        {activeTab === 'circles' && activeCircle && (
          <div className="space-y-4">
            
            {/* Circle Card Header */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-base text-gray-900 dark:text-white flex items-center gap-2">
                  {activeCircle.name}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Active Circle
                  </span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Admin: {activeCircle.adminName} ({activeCircle.adminPhone}) • Created {new Date(activeCircle.createdAt).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => setIsInviteMemberOpen(true)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-500/20 active:scale-95 transition-all"
              >
                <UserPlus size={14} />
                <span>Invite Member</span>
              </button>
            </div>

            {/* Pending Invitations */}
            {invitations.filter(i => i.status === 'pending').length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Pending Invitations ({invitations.filter(i => i.status === 'pending').length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {invitations.filter(i => i.status === 'pending').map(inv => (
                    <div key={inv.id} className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white block">{inv.recipientName} ({inv.relation})</span>
                        <span className="text-gray-500 dark:text-gray-400 text-[11px]">{inv.recipientPhone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleRespondInvitation(inv.id, true)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px]"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespondInvitation(inv.id, false)}
                          className="px-2.5 py-1 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold text-[11px]"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Members Grid */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Circle Members ({activeCircle.members.length})
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeCircle.members.map((member) => (
                  <div
                    key={member.userId}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">
                          {member.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          member.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' :
                          member.role === 'senior' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          member.role === 'child' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                          'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300'
                        }`}>
                          {member.role === 'admin' ? '👑 Admin' :
                           member.role === 'senior' ? '👵 Senior Citizen' :
                           member.role === 'child' ? '👶 Child (Minor)' : 'Member'}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.relation} • {member.phone}
                      </p>

                      {member.status === 'pending' && (
                        <span className="inline-block text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                          ⏳ Invitation Pending
                        </span>
                      )}
                    </div>

                    {/* Member Options */}
                    {activeCircle.adminUserId === currentUserId && member.userId !== currentUserId && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleAssignAdmin(member.userId)}
                          className="p-1.5 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg"
                          title="Assign as Circle Administrator"
                        >
                          👑
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member.userId)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg"
                          title="Remove from Circle"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: EMERGENCY DASHBOARD */}
        {activeTab === 'emergency' && (
          <FamilyEmergencyDashboard
            alerts={emergencyAlerts}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            onAlertUpdated={loadData}
          />
        )}

        {/* TAB 3: CAREGIVER PERMISSIONS */}
        {activeTab === 'caregivers' && (
          <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div>
                <h3 className="font-black text-sm text-gray-900 dark:text-white">Caregiver Permission Grants</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Granular control over who can view your Medical ID, medications, lab reports, appointments, and SOS alerts.
                </p>
              </div>
              <button
                onClick={() => { setEditingCaregiverPerm(null); setIsCaregiverModalOpen(true); }}
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Plus size={14} />
                <span>Grant Caregiver Access</span>
              </button>
            </div>

            <div className="space-y-3">
              {caregiverPermissions.map((perm) => (
                <div
                  key={perm.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-sm text-gray-900 dark:text-white block">
                        Caregiver: {perm.caregiverName} ({perm.relation})
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Authorized for patient: <strong>{perm.ownerName}</strong> • Phone: {perm.caregiverPhone}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      perm.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {perm.status === 'active' ? 'Active Grant ✓' : 'Revoked ✕'}
                    </span>
                  </div>

                  {/* Permissions Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {perm.canViewMedicalId && (
                      <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 text-[11px] font-bold flex items-center gap-1">
                        <HeartPulse size={12} /> Medical ID
                      </span>
                    )}
                    {perm.canViewMedicineSchedule && (
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-[11px] font-bold flex items-center gap-1">
                        <Pill size={12} /> Medicines
                      </span>
                    )}
                    {perm.canManageMedications && (
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 text-[11px] font-bold flex items-center gap-1">
                        <ShieldCheck size={12} /> Can Administer Meds
                      </span>
                    )}
                    {perm.canViewHealthRecords && (
                      <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 text-[11px] font-bold flex items-center gap-1">
                        <FileText size={12} /> Health Records
                      </span>
                    )}
                    {perm.canViewAppointments && (
                      <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 text-[11px] font-bold flex items-center gap-1">
                        <Calendar size={12} /> Appointments
                      </span>
                    )}
                    {perm.canReceiveSosAlerts && (
                      <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 text-[11px] font-bold flex items-center gap-1">
                        <ShieldAlert size={12} /> SOS Alerts
                      </span>
                    )}
                  </div>

                  {perm.notes && (
                    <p className="text-xs text-gray-500 italic">"{perm.notes}"</p>
                  )}

                  <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Consented at {new Date(perm.consentedAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => { setEditingCaregiverPerm(perm); setIsCaregiverModalOpen(true); }}
                      className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
                    >
                      Edit Permissions / Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CHILD SAFETY PROFILES */}
        {activeTab === 'children' && (
          <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div>
                <h3 className="font-black text-sm text-gray-900 dark:text-white">Child & Minor Safety Profiles</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Pediatric emergency IDs with legal guardian consent for school, daycare, and trauma emergencies.
                </p>
              </div>
              <button
                onClick={() => { setEditingChildProfile(null); setIsChildModalOpen(true); }}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Plus size={14} />
                <span>Add Child Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {childProfiles.map((cp) => (
                <div
                  key={cp.childId}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-base text-gray-900 dark:text-white flex items-center gap-2">
                        {cp.childName}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          🩸 {cp.bloodGroup}
                        </span>
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        DOB: {cp.dob} • Guardian: {cp.guardianName} ({cp.guardianRelation})
                      </p>
                    </div>

                    <button
                      onClick={() => { setEditingChildProfile(cp); setIsChildModalOpen(true); }}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Allergies & Conditions */}
                  <div className="space-y-1 text-xs">
                    {cp.allergies.length > 0 && (
                      <p className="text-rose-600 dark:text-rose-400 font-medium">
                        <strong>Allergies:</strong> {cp.allergies.join(', ')}
                      </p>
                    )}
                    {cp.criticalConditions.length > 0 && (
                      <p className="text-amber-700 dark:text-amber-300 font-medium">
                        <strong>Conditions:</strong> {cp.criticalConditions.join(', ')}
                      </p>
                    )}
                    {cp.currentMedications.length > 0 && (
                      <p className="text-blue-600 dark:text-blue-400">
                        <strong>Meds:</strong> {cp.currentMedications.join(', ')}
                      </p>
                    )}
                  </div>

                  {/* School & Pediatrician */}
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 text-xs space-y-1">
                    {cp.schoolOrDaycareName && (
                      <p className="text-gray-700 dark:text-gray-300">
                        🏫 {cp.schoolOrDaycareName} {cp.schoolContactNumber && `(${cp.schoolContactNumber})`}
                      </p>
                    )}
                    {cp.pediatricianName && (
                      <p className="text-gray-700 dark:text-gray-300">
                        🩺 {cp.pediatricianName} {cp.pediatricianPhone && `(${cp.pediatricianPhone})`}
                      </p>
                    )}
                  </div>

                  {cp.emergencyInstructions && (
                    <div className="p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200 font-medium">
                      ⚠️ <strong>Instructions:</strong> {cp.emergencyInstructions}
                    </div>
                  )}

                  <span className="text-[10px] text-gray-400 block pt-1">
                    Guardian consent confirmed at {new Date(cp.consentTimestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ACCESS AUDIT LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-3">
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-black text-sm text-gray-900 dark:text-white">Caregiver Access Audit Trail</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Immutable chronological log of all caregiver views, medication logs, and permission updates.
              </p>
            </div>

            <div className="space-y-2">
              {accessLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {log.caregiverName} {log.action === 'viewed' ? 'viewed' : log.action === 'logged_dose' ? 'logged dose in' : 'updated'} {log.resourceAccessed.replace('_', ' ')}
                    </span>
                    {log.details && (
                      <p className="text-gray-500 dark:text-gray-400 text-[11px]">{log.details}</p>
                    )}
                  </div>
                  <span className="text-gray-400 text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: FAMILY NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="space-y-3">
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-black text-sm text-gray-900 dark:text-white">Family Circle Notifications</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Consolidated stream of family emergency alerts, medicine compliance, and clinic visits.
              </p>
            </div>

            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 ${
                    n.priority === 'urgent' ? 'bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-900' :
                    n.priority === 'high' ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900' :
                    'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    {n.type === 'sos_alert' && <ShieldAlert size={16} className="text-red-500" />}
                    {n.type === 'med_reminder' && <Pill size={16} className="text-blue-500" />}
                    {n.type === 'appointment' && <Calendar size={16} className="text-purple-500" />}
                    {n.type === 'caregiver_grant' && <ShieldCheck size={16} className="text-teal-500" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-gray-900 dark:text-white block">{n.title}</span>
                    <p className="text-gray-600 dark:text-gray-300 text-[11px] mt-0.5">{n.description}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* MODALS */}
      <CreateCircleModal
        isOpen={isCreateCircleOpen}
        onClose={() => setIsCreateCircleOpen(false)}
        userId={currentUserId}
        onCircleCreated={(c) => {
          setCircles(prev => [...prev, c]);
          setSelectedCircleId(c.id);
        }}
      />

      {activeCircle && (
        <InviteMemberModal
          isOpen={isInviteMemberOpen}
          onClose={() => setIsInviteMemberOpen(false)}
          circleId={activeCircle.id}
          circleName={activeCircle.name}
          senderName={currentUserName}
          userId={currentUserId}
          onMemberInvited={() => loadData()}
        />
      )}

      <CaregiverPermissionsModal
        isOpen={isCaregiverModalOpen}
        onClose={() => setIsCaregiverModalOpen(false)}
        ownerUserId={currentUserId}
        ownerName={currentUserName}
        initialPermission={editingCaregiverPerm}
        availableCaregivers={
          activeCircle?.members
            .filter(m => m.userId !== currentUserId)
            .map(m => ({
              userId: m.userId,
              name: m.name,
              phone: m.phone,
              email: m.email,
              relation: m.relation
            })) || []
        }
        onPermissionSaved={() => loadData()}
        onPermissionRevoked={() => loadData()}
      />

      <ChildProfileModal
        isOpen={isChildModalOpen}
        onClose={() => setIsChildModalOpen(false)}
        guardianUserId={currentUserId}
        guardianName={currentUserName}
        initialProfile={editingChildProfile}
        onProfileSaved={() => loadData()}
        onProfileDeleted={() => loadData()}
      />

    </div>
  );
};

export default FamilyCirclePage;
