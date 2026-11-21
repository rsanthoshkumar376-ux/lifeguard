import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getMedicalProfile, MedicalProfile, 
  getEmergencyContacts, EmergencyContact, 
  getMedications, Medication 
} from '../../services/medicalProfile';
import { 
  getOrCreateActiveEmergencyToken, 
  regenerateEmergencyToken, 
  revokeEmergencyToken, 
  cacheOfflineEmergencyCard, 
  getOfflineEmergencyCard, 
  getEmergencyAccessLogs, 
  EmergencyTokenData, 
  EmergencyAccessLog 
} from '../../services/emergencyToken';
import { 
  AlertTriangle, Phone, QrCode, Printer, User, PlusCircle, 
  Sparkles, Download, RefreshCw, Radio, CreditCard, Shield, 
  CheckCircle2, Clock, Eye, ShieldAlert, PhoneCall, Copy, Check 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AiReportModal from '../../components/medical/AiReportModal';
import { LockScreenGeneratorModal } from '../../components/medical/LockScreenGeneratorModal';
import { EmergencyWristbandModal } from '../../components/medical/EmergencyWristbandModal';
import { NfcWriterModal } from '../../components/medical/NfcWriterModal';

const EmergencyIdPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<MedicalProfile | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [tokenData, setTokenData] = useState<EmergencyTokenData | null>(null);
  const [accessLogs, setAccessLogs] = useState<EmergencyAccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [isWristbandModalOpen, setIsWristbandModalOpen] = useState(false);
  const [isNfcModalOpen, setIsNfcModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [lastOfflineSync, setLastOfflineSync] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const userId = user?.uid || 'guest-user';
      let currentProfile: MedicalProfile | null = null;
      let currentContacts: EmergencyContact[] = [];
      let currentMeds: Medication[] = [];

      if (user) {
        currentProfile = await getMedicalProfile(user.uid);
        currentContacts = await getEmergencyContacts(user.uid);
        currentMeds = await getMedications(user.uid);
      } else {
        const local = localStorage.getItem('guest_medical_profile') || localStorage.getItem('lifeguard_medical_profile');
        if (local) {
          const parsed = JSON.parse(local);
          currentProfile = parsed;
          currentContacts = parsed.contacts || [];
          currentMeds = parsed.medications || [];
        } else {
          currentProfile = {
            name: 'Emergency Patient',
            bloodGroup: 'O+',
            emergencyInstructions: 'Call primary emergency contact and 108 immediately.',
            pandemicNote: '😷 PANDEMIC SAFETY NOTICE FOR STRANGERS: Please wear a mask & gloves before assisting. Call 108.'
          } as any;
          currentContacts = [
            { id: '1', name: 'Emergency Family Contact', phone: '+919876543210', relationship: 'Family', isPrimary: true, emergencyVisible: true }
          ];
          currentMeds = [];
        }
      }

      setProfile(currentProfile);
      const filteredContacts = currentContacts.filter(c => c.emergencyVisible !== false);
      setContacts(filteredContacts);
      setMedications(currentMeds.filter(m => m.emergencyVisible !== false));

      // Fetch or Create Secure Public Emergency Token
      const token = await getOrCreateActiveEmergencyToken(userId, {
        preferredName: currentProfile?.name || 'Emergency Patient',
        bloodGroup: currentProfile?.bloodGroup || 'O+',
        allergies: currentProfile?.allergies || ['No known allergies documented'],
        criticalConditions: currentProfile?.conditions ? Object.keys(currentProfile.conditions) : ['No critical conditions listed'],
        emergencyInstructions: currentProfile?.emergencyInstructions || 'If unconscious, check blood group and call 108.',
        pandemicNote: currentProfile?.pandemicNote,
        organDonor: currentProfile?.organDonor ?? true,
        primaryContacts: filteredContacts.map(c => ({
          name: c.name,
          phone: c.phone,
          relationship: c.relationship
        }))
      });

      setTokenData(token);

      // Check offline cached card timestamp
      const offlineCard = getOfflineEmergencyCard();
      if (offlineCard) {
        setLastOfflineSync(offlineCard.lastSyncedAt);
      }

      // Load Access Logs
      const logs = await getEmergencyAccessLogs(userId);
      setAccessLogs(logs);

    } catch (e) {
      console.error('Error loading medical profile or tokens', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateToken = async () => {
    if (!window.confirm('Are you sure you want to regenerate your Emergency QR Code? This will immediately revoke your old QR code and anyone scanning older printouts will be denied access.')) {
      return;
    }

    try {
      setIsRegenerating(true);
      const userId = user?.uid || 'guest-user';
      const newToken = await regenerateEmergencyToken(userId, {
        preferredName: profile?.name,
        bloodGroup: profile?.bloodGroup,
        allergies: profile?.allergies,
        emergencyInstructions: profile?.emergencyInstructions,
        pandemicNote: profile?.pandemicNote,
        organDonor: profile?.organDonor
      });
      setTokenData(newToken);
      setLastOfflineSync(new Date().toISOString());
    } catch (e) {
      console.error('Failed to regenerate token:', e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRevokeToken = async () => {
    if (!tokenData) return;
    if (!window.confirm('Revoke this emergency QR code? Your public emergency link will become inaccessible until you regenerate it.')) {
      return;
    }

    await revokeEmergencyToken(tokenData.id);
    setTokenData(prev => prev ? { ...prev, active: false } : null);
  };

  const handleSyncOfflineCard = () => {
    if (!tokenData) return;
    cacheOfflineEmergencyCard(tokenData.publicApprovedData, tokenData.token);
    const now = new Date().toISOString();
    setLastOfflineSync(now);
    alert('✅ Approved emergency card has been synchronized to offline local cache!');
  };

  const handleCopyPublicUrl = () => {
    if (!tokenData?.publicUrl) return;
    navigator.clipboard.writeText(tokenData.publicUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleDownloadQrPng = () => {
    if (!tokenData?.publicUrl) return;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=15&data=${encodeURIComponent(tokenData.publicUrl)}`;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `lifeguard_emergency_qr_${tokenData.token}.png`;
    link.target = '_blank';
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-6">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-bold text-gray-700">Loading Medical ID...</p>
        </div>
      </div>
    );
  }

  const primaryContact = contacts.find(c => c.isPrimary) || contacts[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 text-gray-900 dark:text-gray-100 transition-colors">
      
      {/* Red Alert Header */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-4 text-center sticky top-0 z-10 shadow-md">
        <h1 className="text-xl sm:text-2xl font-black tracking-wider flex items-center justify-center gap-2">
          <AlertTriangle size={24} /> EMERGENCY MEDICAL ID
        </h1>
        <p className="text-xs text-red-100 mt-0.5">
          Secure, revocable QR code & offline-cached medical card for first responders
        </p>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-5">
        
        {/* PUBLIC SCANNABLE MEDICAL QR CARD */}
        {tokenData && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-md space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${tokenData.active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  {tokenData.active ? 'Active Public QR Code' : 'QR Token Revoked'}
                </span>
              </div>
              <button
                onClick={() => setIsLogsModalOpen(true)}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Eye size={13} /> {accessLogs.length} Scan Log{accessLogs.length !== 1 ? 's' : ''}
              </button>
            </div>

            {/* QR Code Graphic Frame */}
            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-800">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(tokenData.publicUrl)}`}
                alt="Emergency Medical QR Code"
                className="w-48 h-48 rounded-xl shadow-sm bg-white p-2"
              />
              <span className="text-[10px] font-mono text-gray-400 mt-2 truncate max-w-xs">
                Token: {tokenData.token}
              </span>
            </div>

            {/* Public URL & Copy Button */}
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800/60 p-2 rounded-xl border border-gray-200 dark:border-slate-700">
              <input
                type="text"
                readOnly
                value={tokenData.publicUrl}
                className="w-full bg-transparent text-[11px] font-mono text-gray-600 dark:text-gray-300 focus:outline-none select-all"
              />
              <button
                onClick={handleCopyPublicUrl}
                className="px-2.5 py-1 bg-white dark:bg-slate-700 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 shrink-0 border border-gray-200 dark:border-slate-600 shadow-xs flex items-center gap-1"
              >
                {copiedUrl ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                {copiedUrl ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* QR Management Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleDownloadQrPng}
                className="py-2.5 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold border border-red-200 dark:border-red-900 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Download size={14} /> Download QR PNG
              </button>

              <button
                onClick={handleRegenerateToken}
                disabled={isRegenerating}
                className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <RefreshCw size={14} className={isRegenerating ? 'animate-spin' : ''} />
                Regenerate QR
              </button>
            </div>

            {/* Offline Synchronization Bar */}
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-800 pt-3 text-[11px]">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock size={12} />
                {lastOfflineSync ? `Synced: ${new Date(lastOfflineSync).toLocaleDateString()}` : 'Not synced locally'}
              </span>
              <button
                onClick={handleSyncOfflineCard}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
              >
                💾 Sync Offline Card
              </button>
            </div>
          </div>
        )}

        {/* 4 PRIMARY ACTION BUTTONS: Wallpaper, Wristband, NFC, AI Report */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => setIsWallpaperModalOpen(true)}
            className="p-3 bg-gradient-to-r from-amber-500 to-rose-600 text-white rounded-2xl text-xs font-black shadow flex flex-col items-center justify-center text-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles size={18} className="text-amber-200" />
            <span>🖼️ Lock Wallpaper</span>
          </button>

          <button
            onClick={() => setIsWristbandModalOpen(true)}
            className="p-3 bg-slate-900 text-white rounded-2xl text-xs font-black shadow flex flex-col items-center justify-center text-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <CreditCard size={18} className="text-blue-300" />
            <span>🪪 Wristband & Card</span>
          </button>

          <button
            onClick={() => setIsNfcModalOpen(true)}
            className="p-3 bg-purple-700 text-white rounded-2xl text-xs font-black shadow flex flex-col items-center justify-center text-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <Radio size={18} className="text-purple-200" />
            <span>📶 Write NFC Tag</span>
          </button>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="p-3 bg-blue-600 text-white rounded-2xl text-xs font-black shadow flex flex-col items-center justify-center text-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles size={18} className="text-blue-200" />
            <span>🔬 AI Lab Scanner</span>
          </button>
        </div>

        {/* PATIENT CARD SUMMARY */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md border border-gray-100 dark:border-slate-800 p-6 text-center space-y-3">
          <div className="w-20 h-20 bg-red-100 text-red-600 dark:bg-red-950/70 dark:text-red-400 rounded-full mx-auto flex items-center justify-center text-3xl font-black border-4 border-red-200 dark:border-red-900 shadow-inner">
            {profile?.name ? profile.name.charAt(0) : 'P'}
          </div>

          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              {profile?.name || 'Emergency Patient'}
            </h2>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">
              Verified Emergency Medical Card
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            {profile?.bloodGroup && (
              <span className="bg-red-600 text-white px-5 py-2 rounded-2xl font-black text-2xl shadow">
                {profile.bloodGroup}
              </span>
            )}
            {profile?.organDonor && (
              <span className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow flex items-center gap-1">
                ❤️ Organ Donor
              </span>
            )}
          </div>
        </div>

        {/* KNOWN ALLERGIES */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800 space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <AlertTriangle size={15} /> Known Medical Allergies:
          </h3>
          {profile?.allergies && profile.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {profile.allergies.map((allergy, i) => (
                <span key={i} className="px-3 py-1 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-bold rounded-xl border border-red-200 dark:border-red-800">
                  {allergy}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No known medical allergies documented.</p>
          )}
        </div>

        {/* STRANGER & PANDEMIC SAFETY NOTICE */}
        {profile?.pandemicNote && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 rounded-2xl p-4 text-xs text-amber-950 dark:text-amber-100 space-y-1">
            <span className="font-black text-amber-800 dark:text-amber-300 block uppercase tracking-wider">
              😷 NOTICE FOR FIRST RESPONDERS & STRANGERS:
            </span>
            <p className="leading-relaxed font-medium">
              {profile.pandemicNote}
            </p>
          </div>
        )}

        {/* ADDITIONAL EMERGENCY INSTRUCTIONS */}
        {profile?.emergencyInstructions && (
          <div className="bg-blue-50 dark:bg-blue-950/40 border-l-4 border-blue-500 p-4 rounded-r-2xl shadow-sm text-xs text-blue-950 dark:text-blue-100 space-y-1">
            <span className="font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wide block">
              Emergency Instructions
            </span>
            <p>{profile.emergencyInstructions}</p>
          </div>
        )}

        {/* PRIMARY CONTACTS */}
        {contacts.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 px-1 text-xs uppercase tracking-wide">
              Primary Emergency Contacts
            </h3>
            {contacts.map(contact => (
              <a
                key={contact.id}
                href={`tel:${contact.phone}`}
                className="flex items-center justify-between bg-red-600 hover:bg-red-700 text-white p-3.5 rounded-2xl shadow-md active:scale-95 transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2.5 rounded-full">
                    <Phone size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-sm">{contact.name}</div>
                    <div className="text-red-100 text-xs font-medium">{contact.relationship} • {contact.phone}</div>
                  </div>
                </div>
                <span className="bg-white text-red-600 px-3 py-1 rounded-xl text-xs font-black shadow-xs">
                  CALL
                </span>
              </a>
            ))}
          </div>
        )}

        {/* AMBULANCE 108 & 112 DIRECT BUTTONS */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <a
            href="tel:108"
            className="py-3 px-4 bg-red-700 hover:bg-red-800 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all text-center"
          >
            <PhoneCall size={15} /> Call 108 Ambulance
          </a>
          <a
            href="tel:112"
            className="py-3 px-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all text-center"
          >
            <PhoneCall size={15} /> Call 112 Helpline
          </a>
        </div>
      </div>

      {/* ACCESS LOGS MODAL */}
      {isLogsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
            <div className="bg-slate-900 text-white p-5 relative">
              <button
                onClick={() => setIsLogsModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              >
                ✕
              </button>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <Clock size={20} className="text-blue-400" />
                Emergency QR Access History
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit logs recorded each time your public emergency QR code is scanned
              </p>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 text-xs">
              {accessLogs.length > 0 ? (
                accessLogs.map(log => (
                  <div key={log.id} className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 space-y-1">
                    <div className="flex items-center justify-between font-bold text-gray-900 dark:text-white">
                      <span>📱 Scanned by First Responder</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(log.accessedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-mono truncate">
                      Device: {log.devicePlatform} • Lang: {log.language}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <Eye size={32} className="mx-auto mb-2 opacity-40" />
                  <p>No scans recorded yet. When a bystander scans your QR code, access logs will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LOCK SCREEN WALLPAPER GENERATOR MODAL */}
      <LockScreenGeneratorModal
        isOpen={isWallpaperModalOpen}
        onClose={() => setIsWallpaperModalOpen(false)}
        patientName={profile?.name}
        bloodGroup={profile?.bloodGroup}
        allergies={profile?.allergies}
        emergencyInstructions={profile?.emergencyInstructions}
        pandemicNote={profile?.pandemicNote}
        primaryContact={primaryContact?.phone || '+919876543210'}
        qrValue={tokenData?.publicUrl}
      />

      {/* EMERGENCY WRISTBAND & WALLET CARD MODAL */}
      <EmergencyWristbandModal
        isOpen={isWristbandModalOpen}
        onClose={() => setIsWristbandModalOpen(false)}
        patientName={profile?.name || 'Emergency Patient'}
        bloodGroup={profile?.bloodGroup || 'O+'}
        allergies={profile?.allergies || []}
        conditions={profile?.conditions ? Object.keys(profile.conditions) : []}
        emergencyInstructions={profile?.emergencyInstructions}
        organDonor={profile?.organDonor}
        primaryContact={primaryContact?.phone || '+919876543210'}
        contactName={primaryContact?.name || 'Primary Contact'}
        publicUrl={tokenData?.publicUrl || 'https://lifeguard-azure.vercel.app/emergency/view/active'}
      />

      {/* NFC TAG WRITER MODAL */}
      <NfcWriterModal
        isOpen={isNfcModalOpen}
        onClose={() => setIsNfcModalOpen(false)}
        publicEmergencyUrl={tokenData?.publicUrl || 'https://lifeguard-azure.vercel.app/emergency/view/active'}
      />

      {/* AI REPORT SCANNER MODAL */}
      <AiReportModal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
        onProfileUpdated={() => loadData()} 
      />
    </div>
  );
};

export default EmergencyIdPage;
