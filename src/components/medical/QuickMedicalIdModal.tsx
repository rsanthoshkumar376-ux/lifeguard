import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMedicalProfile, saveMedicalProfile, MedicalProfile, getEmergencyContacts, EmergencyContact, getMedications, Medication } from '../../services/medicalProfile';
import { 
  AlertTriangle, Phone, X, Camera, ShieldAlert, Sparkles, Check, 
  ExternalLink, Edit3, HeartPulse, User, QrCode, AlertCircle, RefreshCw,
  Pin, Smartphone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import { pinEmergencyToLockScreen } from '../../services/lockScreenNotification';
import { LockScreenGuideModal } from './LockScreenGuideModal';

interface QuickMedicalIdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PANDEMIC_PRESETS = [
  {
    title: "😷 Mask & Gloves Required",
    text: "PANDEMIC PRECAUTION: Please wear a mask & gloves before assisting. Call 108 immediately. Patient is immunocompromised."
  },
  {
    title: "🫁 Asthma (Non-Contagious)",
    text: "ASTHMA DISTRESS (NOT CONTAGIOUS): Inhaler is in right pocket/bag. Do NOT perform mouth-to-mouth; use compression-only CPR."
  },
  {
    title: "🛡️ High Contagion Risk",
    text: "HIGH VIRAL RISK: Highly vulnerable patient. Please keep safe distance, sanitize hands, and notify emergency contacts immediately."
  },
  {
    title: "🩸 Diabetic Shock",
    text: "DIABETIC EMERGENCY: If conscious, please administer candy or fruit juice from bag. If unconscious, call 108 immediately."
  },
  {
    title: "⚠️ Unconscious Responder Note",
    text: "EMERGENCY: Do not move my neck/spine. Check blood group on this screen. Call my emergency contact and 108 immediately."
  }
];

export const QuickMedicalIdModal: React.FC<QuickMedicalIdModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'id' | 'camera'>('id');
  const [profile, setProfile] = useState<MedicalProfile | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showLockScreenGuide, setShowLockScreenGuide] = useState(false);
  const [pinMessage, setPinMessage] = useState<string | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const handlePinLockScreen = async () => {
    setPinMessage('Pinning alert to lock screen...');
    const res = await pinEmergencyToLockScreen({
      name: profile?.name || user?.fullName || 'Patient',
      bloodGroup: profile?.bloodGroup || 'O+',
      pandemicNote: profile?.pandemicNote || ''
    });
    setPinMessage(res.message);
    setTimeout(() => setPinMessage(null), 4000);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    } else {
      stopCamera();
      setIsEditingNote(false);
    }
  }, [isOpen, user]);

  const loadData = async () => {
    try {
      if (user) {
        const p = await getMedicalProfile(user.uid);
        const c = await getEmergencyContacts(user.uid);
        const m = await getMedications(user.uid);
        setProfile(p);
        setContacts(c.filter(contact => contact.emergencyVisible !== false));
        setMedications(m.filter(med => med.emergencyVisible !== false));
        setCustomNote(p?.pandemicNote || '');
      } else {
        const local = localStorage.getItem('guest_medical_profile') || localStorage.getItem('lifeguard_medical_profile');
        if (local) {
          const parsed = JSON.parse(local);
          setProfile(parsed);
          setContacts(parsed.contacts || []);
          setMedications(parsed.medications || []);
          setCustomNote(parsed.pandemicNote || '');
        } else {
          // Default demo profile for instant preview
          const defaultProfile: MedicalProfile = {
            name: 'Emergency Guest',
            bloodGroup: 'O+',
            emergencyInstructions: 'Allergic to Penicillin. Contact primary family immediately.',
            pandemicNote: '😷 PANDEMIC SAFETY NOTICE FOR STRANGERS: Please wear a mask & gloves before physical contact. Call 108 immediately. Patient has chronic asthma (non-contagious) — Inhaler in right pocket. Do NOT perform mouth-to-mouth CPR; chest compressions only.'
          };
          setProfile(defaultProfile);
          setCustomNote(defaultProfile.pandemicNote || '');
        }
      }
    } catch (e) {
      console.error('Error loading quick medical id', e);
    }
  };

  const handleSaveNote = async () => {
    const updated = {
      ...(profile || {}),
      pandemicNote: customNote
    };
    setProfile(updated);
    try {
      if (user) {
        await saveMedicalProfile(user.uid, updated);
      } else {
        localStorage.setItem('guest_medical_profile', JSON.stringify(updated));
        localStorage.setItem('lifeguard_medical_profile', JSON.stringify(updated));
      }
      setSaveSuccess(true);
      setIsEditingNote(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Error saving note', e);
    }
  };

  // Camera Scanner Logic
  const startCamera = async () => {
    setCameraError(null);
    try {
      const qrCodeId = "quick-qr-reader";
      const qrElement = document.getElementById(qrCodeId);
      if (!qrElement) return;

      const html5QrCode = new Html5Qrcode(qrCodeId);
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          stopCamera();
          onClose();
          // Check if decoded text is a LifeGuard emergency link or contains token
          if (decodedText.includes('/emergency/view')) {
            window.location.href = decodedText;
          } else if (decodedText.startsWith('http')) {
            window.location.href = decodedText;
          } else {
            navigate(`/emergency/view?token=${encodeURIComponent(decodedText)}`);
          }
        },
        () => {
          // ignore scan frame errors
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.error("Camera error:", err);
      setCameraError(err?.message || "Camera access denied or unavailable. Please grant camera permission.");
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        // ignore
      }
      html5QrCodeRef.current = null;
      setIsScanning(false);
    }
  };

  const handleSwitchTab = (tab: 'id' | 'camera') => {
    setActiveTab(tab);
    if (tab === 'camera') {
      setTimeout(() => {
        startCamera();
      }, 150);
    } else {
      stopCamera();
    }
  };

  if (!isOpen) return null;

  const currentStrangerNote = profile?.pandemicNote || customNote || "😷 PANDEMIC SAFETY NOTICE FOR STRANGERS: Please wear a mask & sanitize before touching. Call 108 immediately. Patient requires urgent medical attention.";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[84vh] sm:max-h-[88vh] border border-red-500/20 my-auto">
        
        {/* Top Header styled like Camera / Medical Lockscreen */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-4 relative">
          <button 
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center active:scale-95 transition-all"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping"></span>
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-200">
              RAPID EMERGENCY DISPLAY
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
            <AlertTriangle size={24} className="text-amber-300 shrink-0" />
            EMERGENCY MEDICAL ID
          </h2>

          <p className="text-xs text-red-100 font-medium mt-0.5">
            Instant 1-tap view for Strangers, Bystanders & Paramedics
          </p>

          {/* Quick Toggle Tabs */}
          <div className="flex mt-3 bg-black/25 p-1 rounded-xl gap-1">
            <button
              onClick={() => handleSwitchTab('id')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'id' ? 'bg-white text-red-600 shadow' : 'text-white/80 hover:text-white'
              }`}
            >
              <HeartPulse size={14} /> My Medical ID & Note
            </button>
            <button
              onClick={() => handleSwitchTab('camera')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'camera' ? 'bg-white text-red-600 shadow' : 'text-white/80 hover:text-white'
              }`}
            >
              <Camera size={14} /> 📷 Camera Scanner
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {saveSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
              <Check size={16} className="text-emerald-600" />
              <span>Stranger & Pandemic safety note updated successfully!</span>
            </div>
          )}

          {activeTab === 'camera' ? (
            /* Camera Scanner Screen */
            <div className="text-center py-4 space-y-4">
              <div className="bg-slate-900 rounded-2xl p-4 text-white">
                <p className="text-sm font-bold flex items-center justify-center gap-2 text-red-400">
                  <Camera size={18} /> Scan Stranger's Medical ID QR
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Point the camera at an injured or unconscious person's LifeGuard QR code.
                </p>
              </div>

              <div className="relative w-full max-w-[300px] h-[300px] mx-auto rounded-3xl overflow-hidden border-4 border-red-500 shadow-xl bg-black flex items-center justify-center">
                <div id="quick-qr-reader" className="w-full h-full"></div>
                {!isScanning && !cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/60 p-4">
                    <RefreshCw className="animate-spin text-red-500 mb-2" size={32} />
                    <p className="text-xs font-semibold">Starting camera...</p>
                  </div>
                )}
                {cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/85 p-6 text-center">
                    <AlertCircle size={36} className="text-amber-400 mb-2" />
                    <p className="text-xs font-bold text-red-300 mb-1">Camera Permission Needed</p>
                    <p className="text-[11px] text-gray-300 mb-3">{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleSwitchTab('id')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Back to My Medical ID Card
              </button>
            </div>
          ) : (
            /* Medical ID Card View */
            <>
              {/* Patient Basic Card */}
              <div className="bg-gradient-to-br from-white to-red-50/50 dark:from-slate-800 dark:to-slate-800/60 rounded-2xl p-4 border border-red-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/70 dark:text-red-400 flex items-center justify-center font-black text-xl border-2 border-red-200 dark:border-red-900 shadow-inner overflow-hidden shrink-0">
                    {user?.profilePhotoUrl ? (
                      <img src={user.profilePhotoUrl} alt="Patient" className="w-full h-full object-cover" />
                    ) : (
                      <span>{profile?.name?.charAt(0) || user?.fullName?.charAt(0) || 'P'}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-gray-900 dark:text-white leading-tight">
                      {profile?.name || user?.fullName || 'Emergency Patient'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {profile?.gender || 'Gender Unspecified'} {profile?.dob ? `• Born ${profile.dob}` : ''}
                    </p>
                    {profile?.organDonor && (
                      <span className="inline-block mt-1 text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                        ❤️ Organ Donor
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                    Blood Group
                  </div>
                  <div className="bg-red-600 text-white font-black text-2xl px-3.5 py-1 rounded-2xl shadow-md inline-block">
                    {profile?.bloodGroup || 'O+'}
                  </div>
                </div>
              </div>

              {/* 📱 DIRECT SCANNABLE MEDICAL QR CODE */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border-2 border-red-500/30 shadow-md text-center space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <QrCode size={16} /> Patient Medical QR Code
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    No Password Needed
                  </span>
                </div>

                <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-2xl inline-block border border-gray-200 dark:border-slate-700 shadow-inner">
                  <QRCodeSVG
                    value={
                      typeof window !== 'undefined'
                        ? `${window.location.origin}/emergency/view?token=${user?.uid ? 'active-' + user.uid.slice(0, 8) : 'guest-108'}`
                        : 'https://lifeguard.app'
                    }
                    size={175}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-tight">
                  Scan with any phone camera to view full medical history, allergies & emergency contacts
                </p>

                {/* 📌 LOCK SCREEN DIRECT INTEGRATION */}
                <div className="pt-2 border-t border-gray-100 dark:border-slate-700/80 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={handlePinLockScreen}
                      className="py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      <Pin size={14} />
                      <span>📌 Pin to Lock Screen</span>
                    </button>

                    <button
                      onClick={() => setShowLockScreenGuide(true)}
                      className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700/80 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                    >
                      <Smartphone size={14} />
                      <span>Lock Screen Setup Guide</span>
                    </button>
                  </div>

                  {pinMessage && (
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-[11px] font-bold animate-in fade-in flex items-center justify-center gap-1.5">
                      <Check size={14} className="text-emerald-600" />
                      <span>{pinMessage}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ⭐ HIGHLIGHTED STRANGER & PANDEMIC SAFETY NOTICE */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600/70 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow">
                      😷
                    </div>
                    <div>
                      <h4 className="font-black text-xs text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                        Notice For Strangers • Pandemic Safety
                      </h4>
                      <p className="text-[10px] text-amber-700 dark:text-amber-400">
                        Instructions to anyone finding this patient in an outbreak or emergency
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsEditingNote(!isEditingNote)}
                    className="px-2.5 py-1 bg-amber-200 dark:bg-amber-900/60 hover:bg-amber-300 text-amber-900 dark:text-amber-200 rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shrink-0"
                  >
                    <Edit3 size={13} /> {isEditingNote ? 'Cancel' : 'Edit Note'}
                  </button>
                </div>

                {!isEditingNote ? (
                  <div className="bg-white/80 dark:bg-slate-900/70 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/50 shadow-inner">
                    <p className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-100 leading-relaxed whitespace-pre-wrap">
                      {currentStrangerNote}
                    </p>
                  </div>
                ) : (
                  /* Note Editor & Presets */
                  <div className="space-y-3 mt-3 animate-in fade-in">
                    <div>
                      <label className="text-[11px] font-bold text-amber-900 dark:text-amber-200 block mb-1">
                        Select a Pandemic / Emergency Template:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {PANDEMIC_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCustomNote(preset.text)}
                            className="text-[11px] bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 px-2 py-1 rounded-lg font-semibold text-amber-900 dark:text-amber-200 hover:bg-amber-100 active:scale-95 transition-all text-left"
                          >
                            {preset.title}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-amber-900 dark:text-amber-200 block mb-1">
                        Or write your custom note for strangers:
                      </label>
                      <textarea
                        rows={3}
                        value={customNote}
                        onChange={(e) => setCustomNote(e.target.value)}
                        placeholder="e.g. Wear mask and gloves before touching. Severe asthma - inhaler in right pocket. Do not perform mouth-to-mouth resuscitation."
                        className="w-full text-xs font-medium p-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsEditingNote(false)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNote}
                        className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <Check size={14} /> Save Note to ID
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 1-Tap Emergency Calling for Strangers */}
              <div>
                <h4 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  1-Tap Emergency Calling For Responders
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:108"
                    className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-2xl flex items-center justify-center gap-2 shadow active:scale-95 transition-all"
                  >
                    <Phone size={18} className="animate-bounce" />
                    <div className="text-left leading-tight">
                      <div className="text-xs font-black">Call 108</div>
                      <div className="text-[10px] text-red-100">National Ambulance</div>
                    </div>
                  </a>

                  {contacts.length > 0 ? (
                    <a
                      href={`tel:${contacts[0].phone}`}
                      className="bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white p-3 rounded-2xl flex items-center justify-center gap-2 shadow active:scale-95 transition-all"
                    >
                      <Phone size={18} className="text-green-400" />
                      <div className="text-left leading-tight truncate">
                        <div className="text-xs font-black truncate">{contacts[0].name}</div>
                        <div className="text-[10px] text-gray-300 truncate">{contacts[0].relationship || 'Emergency Contact'}</div>
                      </div>
                    </a>
                  ) : (
                    <a
                      href="tel:112"
                      className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl flex items-center justify-center gap-2 shadow active:scale-95 transition-all"
                    >
                      <Phone size={18} />
                      <div className="text-left leading-tight">
                        <div className="text-xs font-black">Call 112</div>
                        <div className="text-[10px] text-blue-100">National Helpline</div>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              {/* Allergies & Critical Medications */}
              {(profile?.allergies?.length || medications?.length) ? (
                <div className="bg-gray-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-2">
                  {profile?.allergies && profile.allergies.length > 0 && (
                    <div>
                      <div className="text-[11px] font-black text-red-600 uppercase tracking-wider mb-1">
                        ⚠️ Critical Allergies:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(profile.allergies) ? profile.allergies : [profile.allergies]).map((allergy, i) => (
                          <span key={i} className="text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 px-2 py-0.5 rounded-md">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {medications && medications.length > 0 && (
                    <div className="pt-1">
                      <div className="text-[11px] font-black text-blue-600 uppercase tracking-wider mb-1">
                        💊 Emergency Medications:
                      </div>
                      <div className="space-y-1">
                        {medications.slice(0, 3).map((med, i) => (
                          <div key={i} className="text-xs font-medium text-gray-700 dark:text-gray-300 flex justify-between bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-gray-100 dark:border-slate-700">
                            <span className="font-bold">{med.name} ({med.dosage})</span>
                            <span className="text-[10px] text-gray-500">{med.emergencyNote || med.instructions}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Additional Emergency Instructions */}
              {profile?.emergencyInstructions && (
                <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-3 rounded-2xl text-xs text-blue-900 dark:text-blue-200">
                  <span className="font-black block uppercase text-[10px] text-blue-700 mb-0.5">
                    Additional Instructions:
                  </span>
                  {profile.emergencyInstructions}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-gray-50 dark:bg-slate-800/90 border-t border-gray-100 dark:border-slate-700 flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <Link
              to="/emergency/id"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:bg-gray-100 text-gray-800 dark:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all text-center"
            >
              <User size={14} /> Full Medical ID
            </Link>

            <Link
              to="/qr"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all text-center"
            >
              <QrCode size={14} /> Show My QR Code
            </Link>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl active:scale-95 transition-all text-center"
          >
            ✕ Close Emergency View
          </button>
        </div>

      </div>

      {/* Lock Screen Setup Guide Modal */}
      <LockScreenGuideModal
        isOpen={showLockScreenGuide}
        onClose={() => setShowLockScreenGuide(false)}
        patientName={profile?.name || user?.fullName || 'Patient'}
        bloodGroup={profile?.bloodGroup || 'O+'}
        pandemicNote={profile?.pandemicNote || ''}
      />
    </div>
  );
};

export default QuickMedicalIdModal;
