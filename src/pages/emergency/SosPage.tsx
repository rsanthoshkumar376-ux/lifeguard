import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertCircle, Phone, Navigation, Shield, AlertTriangle, CheckCircle2, 
  RefreshCw, Settings, Sliders, ExternalLink, MapPin, Share2, 
  MessageSquare, UserPlus, Check, ChevronRight, X, Clock, Eye, Activity, HeartPulse
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  EmergencyCase, EmergencyCategory, EmergencyStatus, EmergencyLocationData,
  createEmergencyCase, updateEmergencyCaseStatus, updateEmergencyLocation,
  getActiveLocalCase, getLocalCaseHistory, setLiveTrackingState
} from '../../services/emergencyResponseService';
import { 
  startAccidentMonitoring, stopAccidentMonitoring, getMonitoringStatus,
  calibrateSensor, getSensorConfig, saveSensorConfig, getCalibrationData,
  requestMotionPermission, isAccidentDetectionSupported, triggerImpactDetected,
  SensitivityLevel
} from '../../services/accidentDetectionService';
import { 
  EmergencyContact, getEmergencyContacts, addEmergencyContact, getMedicalProfile 
} from '../../services/medicalProfile';
import AccidentCountdownModal from '../../components/emergency/AccidentCountdownModal';
import EmergencySmsModal from '../../components/emergency/EmergencySmsModal';

const CATEGORIES: Array<{ key: EmergencyCategory; label: string; icon: string }> = [
  { key: 'General SOS', label: 'General SOS', icon: '🚨' },
  { key: 'Vehicle Accident', label: 'Vehicle Crash', icon: '🚗' },
  { key: 'Severe Fall', label: 'Hard Fall', icon: '⚠️' },
  { key: 'Cardiac Emergency', label: 'Cardiac Crisis', icon: '❤️' },
  { key: 'Medical Crisis', label: 'Medical Emergency', icon: '🏥' },
  { key: 'Physical Threat', label: 'Danger / Threat', icon: '🛡️' }
];

const STATUS_STEPS: EmergencyStatus[] = [
  'Created',
  'Alert Sent',
  'Acknowledged',
  'Assistance Accepted',
  'Resolved'
];

export const SosPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Active Emergency State
  const [activeCase, setActiveCase] = useState<EmergencyCase | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('General SOS');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [caseHistory, setCaseHistory] = useState<EmergencyCase[]>([]);

  // Accident Detection State
  const [isDetectionActive, setIsDetectionActive] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationSuccess, setCalibrationSuccess] = useState<string | null>(null);
  const [sensorConfig, setSensorConfig] = useState(getSensorConfig());
  const [showCountdownModal, setShowCountdownModal] = useState(false);
  const [detectedMagnitude, setDetectedMagnitude] = useState(30.0);

  // Contacts & Location
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [locationStatus, setLocationStatus] = useState<string>('Ready to acquire GPS');
  const [watchId, setWatchId] = useState<number | null>(null);

  // Add Contact Form State
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRel, setNewContactRel] = useState('Family');

  // Watch position reference for cleanup
  const watchIdRef = useRef<number | null>(null);

  // Load Initial State
  useEffect(() => {
    // 1. Check for ongoing local active case
    const existing = getActiveLocalCase();
    if (existing && existing.status !== 'Resolved') {
      setActiveCase(existing);
      if (existing.liveTrackingActive) {
        startLiveGpsTracking(existing.id);
      }
    }

    // 2. Load contacts and history
    loadContactsAndHistory();

    // 3. Start accident detection if previously enabled
    const supported = isAccidentDetectionSupported();
    if (supported) {
      initAccidentDetection();
    }

    return () => {
      stopGpsTracking();
      stopAccidentMonitoring();
    };
  }, [user]);

  const loadContactsAndHistory = async () => {
    try {
      const c = await getEmergencyContacts(user?.uid);
      setContacts(c);
      setCaseHistory(getLocalCaseHistory());
    } catch (e) {
      console.warn('Failed to load contacts/history', e);
    }
  };

  const initAccidentDetection = () => {
    const started = startAccidentMonitoring((magnitude) => {
      setDetectedMagnitude(magnitude);
      setShowCountdownModal(true);
    });
    setIsDetectionActive(started);
  };

  const handleToggleAccidentDetection = async () => {
    if (isDetectionActive) {
      stopAccidentMonitoring();
      setIsDetectionActive(false);
    } else {
      const permitted = await requestMotionPermission();
      if (!permitted) {
        alert('Motion sensor permission is required to enable accident detection.');
        return;
      }
      initAccidentDetection();
    }
  };

  const handleCalibrate = async () => {
    setIsCalibrating(true);
    setCalibrationSuccess(null);
    try {
      const cal = await calibrateSensor();
      setCalibrationSuccess(`Calibrated: baseline ${cal.baselineGravity} m/s² (±${cal.noiseMargin})`);
      setTimeout(() => setCalibrationSuccess(null), 4000);
    } catch (e) {
      console.warn('Calibration error', e);
    } finally {
      setIsCalibrating(false);
    }
  };

  const handleChangeSensitivity = (sens: SensitivityLevel) => {
    const updated = saveSensorConfig({ sensitivity: sens });
    setSensorConfig(updated);
  };

  const handleSimulateImpact = () => {
    triggerImpactDetected(34.2);
  };

  // -------------------------------------------------------------
  // GPS & Live Tracking
  // -------------------------------------------------------------
  const captureCurrentGps = (): Promise<EmergencyLocationData | undefined> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationStatus('Geolocation is not supported by your device.');
        resolve(undefined);
        return;
      }

      setLocationStatus('Acquiring high-accuracy GPS coordinates...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const locData: EmergencyLocationData = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude,
            speed: pos.coords.speed,
            heading: pos.coords.heading,
            mapsUrl: `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`,
            capturedAt: new Date().toISOString()
          };
          setLocationStatus(`GPS Locked (±${Math.round(pos.coords.accuracy)}m)`);
          resolve(locData);
        },
        (err) => {
          console.warn('GPS error', err);
          setLocationStatus('Could not lock GPS. Please ensure Location is enabled.');
          resolve(undefined);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    });
  };

  const startLiveGpsTracking = (caseId: string) => {
    stopGpsTracking();
    if (!navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const updatedLoc: EmergencyLocationData = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          mapsUrl: `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`,
          capturedAt: new Date().toISOString()
        };
        setLocationStatus(`Live Tracking: ±${Math.round(pos.coords.accuracy)}m`);
        const updatedCase = await updateEmergencyLocation(caseId, updatedLoc);
        if (updatedCase) {
          setActiveCase(updatedCase);
        }
      },
      (err) => console.warn('Watch position error', err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );

    watchIdRef.current = id;
    setWatchId(id);
  };

  const stopGpsTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setWatchId(null);
    }
  };

  const handleToggleLiveSharing = async () => {
    if (!activeCase) return;
    const nextState = !activeCase.liveTrackingActive;
    await setLiveTrackingState(activeCase.id, nextState);
    if (nextState) {
      startLiveGpsTracking(activeCase.id);
    } else {
      stopGpsTracking();
    }
    setActiveCase(prev => prev ? { ...prev, liveTrackingActive: nextState } : null);
  };

  // -------------------------------------------------------------
  // SOS Triggers & Workflows
  // -------------------------------------------------------------
  const handleInitiateSos = async (isImpact = false, magnitude?: number) => {
    setIsConfirmModalOpen(false);
    setShowCountdownModal(false);

    // 1. Capture GPS
    const gps = await captureCurrentGps();

    // 2. Create Emergency Case
    const newCase = await createEmergencyCase({
      userId: user?.uid,
      userName: user?.fullName,
      category: isImpact ? 'Vehicle Accident' : selectedCategory,
      impactDetected: isImpact,
      sensorMagnitude: magnitude,
      location: gps
    });

    setActiveCase(newCase);

    // 3. Start live tracking
    startLiveGpsTracking(newCase.id);
  };

  const handleAdvanceStatus = async (nextStatus: EmergencyStatus) => {
    if (!activeCase) return;
    const updated = await updateEmergencyCaseStatus(
      activeCase.id, 
      nextStatus, 
      `Status changed to ${nextStatus}`, 
      `Updated by user or responder interaction.`,
      user?.fullName || 'User'
    );
    if (updated) {
      setActiveCase(updated);
    }
  };

  const handleResolveSos = async () => {
    if (!activeCase) return;
    stopGpsTracking();
    await updateEmergencyCaseStatus(
      activeCase.id,
      'Resolved',
      'Emergency Case Resolved',
      'User confirmed safety. Live tracking terminated.',
      user?.fullName || 'User'
    );
    setIsResolveModalOpen(false);
    setActiveCase(null);
    loadContactsAndHistory();
  };

  const handleShareLocation = async () => {
    if (!activeCase?.location?.mapsUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `LifeGuard SOS: ${activeCase.category}`,
          text: `🚨 URGENT SOS from ${activeCase.userName}! Location: ${activeCase.location.mapsUrl}`,
          url: activeCase.location.mapsUrl
        });
      } catch (e) {
        console.warn('Share cancelled', e);
      }
    } else {
      navigator.clipboard.writeText(activeCase.location.mapsUrl);
      alert('Location link copied to clipboard!');
    }
  };

  const handleAddContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    await addEmergencyContact(user?.uid || 'guest-user', {
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relationship: newContactRel,
      isPrimary: contacts.length === 0,
      emergencyVisible: true
    });

    setNewContactName('');
    setNewContactPhone('');
    setIsAddContactOpen(false);
    loadContactsAndHistory();
  };

  // -------------------------------------------------------------
  // Render: Active SOS Emergency Hub
  // -------------------------------------------------------------
  if (activeCase) {
    const currentStepIdx = STATUS_STEPS.indexOf(activeCase.status);
    const primaryContact = contacts.find(c => c.isPrimary) || contacts[0];

    return (
      <div className="min-h-screen bg-slate-950 text-white pb-24 transition-colors">
        
        {/* Pulsing Red Emergency Header Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-4 sticky top-0 z-30 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-full bg-white animate-ping shrink-0" />
            <div>
              <h1 className="text-xl font-black tracking-wider flex items-center gap-2">
                🚨 SOS ACTIVE: {activeCase.category.toUpperCase()}
              </h1>
              <p className="text-[11px] text-red-100 font-medium">
                Case ID: #{activeCase.id.slice(-6)} • Created at {new Date(activeCase.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsResolveModalOpen(true)}
            className="px-3.5 py-1.5 bg-black/40 hover:bg-black/60 text-white text-xs font-black rounded-xl border border-white/20 active:scale-95 transition-all cursor-pointer"
          >
            Resolve SOS
          </button>
        </div>

        <div className="p-4 max-w-xl mx-auto space-y-4">
          
          {/* Status Stepper Progression */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Response Workflow Status
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white">
                {activeCase.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1 pt-1">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div key={step} className="flex flex-col items-center gap-1.5 text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      isCurrent
                        ? 'bg-red-600 text-white ring-4 ring-red-500/30 shadow-lg'
                        : isPassed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {isPassed && !isCurrent ? <Check size={14} /> : idx + 1}
                    </div>
                    <span className={`text-[9px] font-bold leading-tight line-clamp-1 ${
                      isCurrent ? 'text-red-400 font-black' : isPassed ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Quick Status Advance Buttons for simulation / responder workflow */}
            {currentStepIdx < STATUS_STEPS.length - 1 && (
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => handleAdvanceStatus(STATUS_STEPS[currentStepIdx + 1])}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <span>Advance Status to: <strong>{STATUS_STEPS[currentStepIdx + 1]}</strong></span>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Live GPS Emergency Sharing Card */}
          <div className="bg-slate-900 border-2 border-red-500/40 rounded-3xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <MapPin size={16} /> Live GPS Location Sharing
              </span>
              <button
                onClick={handleToggleLiveSharing}
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full transition-all ${
                  activeCase.liveTrackingActive 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse' 
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {activeCase.liveTrackingActive ? '● LIVE TRACKING ON' : 'PAUSED'}
              </button>
            </div>

            {activeCase.location ? (
              <div className="space-y-3">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-base font-bold text-white">
                      {activeCase.location.latitude.toFixed(5)}, {activeCase.location.longitude.toFixed(5)}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      Accuracy: ±{Math.round(activeCase.location.accuracy || 0)}m • Updated {new Date(activeCase.location.capturedAt).toLocaleTimeString()}
                    </div>
                  </div>

                  <a
                    href={activeCase.location.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow active:scale-95 transition-all"
                    title="Open in Google Maps"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleShareLocation}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95 transition-all"
                  >
                    <Share2 size={14} />
                    <span>Share Location Link</span>
                  </button>

                  <a
                    href={activeCase.location.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 active:scale-95 transition-all text-center"
                  >
                    <Navigation size={14} />
                    <span>View Map</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-950 rounded-2xl text-center space-y-2">
                <p className="text-xs text-amber-400 font-bold">{locationStatus}</p>
                <button
                  onClick={async () => {
                    const loc = await captureCurrentGps();
                    if (loc) {
                      await updateEmergencyLocation(activeCase.id, loc);
                      setActiveCase(prev => prev ? { ...prev, location: loc } : null);
                    }
                  }}
                  className="py-1.5 px-4 bg-red-600 text-white text-xs font-bold rounded-xl"
                >
                  Retry GPS Lock
                </button>
              </div>
            )}
          </div>

          {/* Emergency Quick Action Calling Grid */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
              Direct Emergency Helplines
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <a
                href="tel:112"
                className="py-3.5 px-4 bg-slate-800 hover:bg-slate-750 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 border border-slate-700 shadow-md active:scale-95 transition-all"
              >
                <Phone size={18} className="text-red-400" />
                <span>CALL 112 (NATIONAL)</span>
              </a>

              <a
                href="tel:108"
                className="py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-950 active:scale-95 transition-all"
              >
                <Phone size={18} />
                <span>CALL 108 (AMBULANCE)</span>
              </a>
            </div>

            {primaryContact && (
              <a
                href={`tel:${primaryContact.phone}`}
                className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <Phone size={18} />
                <span>CALL PRIMARY: {primaryContact.name} ({primaryContact.phone})</span>
              </a>
            )}
          </div>

          {/* Emergency SMS & Medical ID Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setIsSmsModalOpen(true)}
              className="py-3.5 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <MessageSquare size={16} />
              <span>📱 Send Emergency SMS</span>
            </button>

            <button
              onClick={() => navigate('/emergency/id')}
              className="py-3.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <HeartPulse size={16} />
              <span>🪪 Show Medical ID</span>
            </button>
          </div>

          {/* Emergency Chronological Timeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Clock size={15} className="text-red-400" />
              Emergency Event Timeline
            </h3>

            <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {activeCase.timeline.map((entry) => (
                <div key={entry.id} className="relative flex items-start gap-3 pl-1">
                  <div className="w-5 h-5 rounded-full bg-red-600 border-2 border-slate-900 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5 shadow">
                    •
                  </div>
                  <div className="flex-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{entry.title}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{entry.description}</p>
                    <span className="inline-block mt-1 text-[9px] font-semibold text-slate-500">Actor: {entry.actor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Emergency SMS Modal */}
        <EmergencySmsModal
          isOpen={isSmsModalOpen}
          onClose={() => setIsSmsModalOpen(false)}
          emergencyCase={activeCase}
          contacts={contacts}
        />

        {/* Resolve SOS Confirmation Modal */}
        {isResolveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center text-white space-y-4">
              <div className="w-16 h-16 bg-emerald-600/20 text-emerald-400 rounded-full mx-auto flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-xl font-black">Confirm Safe & Resolve?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This will end the active emergency state and cease live location tracking.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setIsResolveModalOpen(false)}
                  className="py-3 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700"
                >
                  Keep Active
                </button>
                <button
                  onClick={handleResolveSos}
                  className="py-3 bg-emerald-600 text-white font-black text-xs rounded-xl hover:bg-emerald-500 shadow-lg"
                >
                  I AM SAFE (RESOLVE)
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // -------------------------------------------------------------
  // Render: IDLE Emergency Dashboard
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 pb-24 transition-colors">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 p-4 sticky top-0 z-20 shadow-xs">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black shadow-md shadow-red-600/20">
              🚨
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
                Emergency Response System
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Accident Detection • Live GPS • Fast Response
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddContactOpen(true)}
            className="p-2 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/60 transition-all flex items-center gap-1 text-xs font-bold"
            title="Manage emergency contacts"
          >
            <UserPlus size={16} />
            <span className="hidden sm:inline">Add Contact</span>
          </button>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto space-y-5">
        
        {/* Category Picker */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
            Emergency Category:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`p-2.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  selectedCategory === cat.key
                    ? 'border-red-600 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 shadow-sm'
                    : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-xl mb-0.5">{cat.icon}</div>
                <div className="font-bold text-xs line-clamp-1">{cat.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* PRIMARY BIG SOS BUTTON */}
        <div className="flex flex-col items-center justify-center py-4">
          <button
            onClick={() => setIsConfirmModalOpen(true)}
            className="relative w-64 h-64 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-rose-600 text-white shadow-[0_0_60px_rgba(220,38,38,0.45)] flex flex-col items-center justify-center border-[14px] border-red-500/40 hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer"
          >
            <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-25 group-hover:opacity-50" />
            <span className="text-6xl font-black tracking-widest relative z-10 drop-shadow-md">SOS</span>
            <span className="text-red-100 font-black text-xs uppercase tracking-widest mt-2 relative z-10">
              TAP FOR {selectedCategory.toUpperCase()}
            </span>
          </button>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 font-medium">
            Requires 1 confirmation tap to prevent accidental alerts
          </p>
        </div>

        {/* SMART ACCIDENT DETECTION CARD */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isDetectionActive ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
              }`}>
                <Activity size={22} />
              </div>
              <div>
                <h3 className="font-black text-sm text-gray-900 dark:text-white">Smart Accident Detection</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {isDetectionActive ? 'Sensor active • 30s countdown ready' : 'Turn on to detect crashes & falls'}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleAccidentDetection}
              className={`py-1.5 px-3.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                isDetectionActive 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              {isDetectionActive ? 'ACTIVE' : 'OFF'}
            </button>
          </div>

          {/* Sensor Settings: Sensitivity & Calibration */}
          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-700 dark:text-gray-300">Sensitivity:</span>
              <div className="flex gap-1">
                {(['low', 'medium', 'high'] as SensitivityLevel[]).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => handleChangeSensitivity(lvl)}
                    className={`px-2.5 py-1 rounded-lg font-bold uppercase text-[10px] transition-all cursor-pointer ${
                      sensorConfig.sensitivity === lvl 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleCalibrate}
                disabled={isCalibrating}
                className="py-1.5 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw size={13} className={isCalibrating ? 'animate-spin' : ''} />
                <span>{isCalibrating ? 'Calibrating...' : 'Calibrate Sensor'}</span>
              </button>

              <button
                onClick={handleSimulateImpact}
                className="py-1.5 px-3 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>🧪 Test Simulation</span>
              </button>
            </div>

            {calibrationSuccess && (
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                ✓ {calibrationSuccess}
              </p>
            )}

            {/* Browser Limitation Notice */}
            <div className="p-2.5 bg-gray-50 dark:bg-slate-800/60 rounded-xl text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
              ⚠️ <strong>Browser Note:</strong> Sensors monitor while this tab is active. Standard web browsers cannot monitor sensors in the deep background when the screen is locked.
            </div>
          </div>
        </div>

        {/* Quick Dial Helplines */}
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 px-1">
            Emergency Hotline Calling
          </h3>

          <div className="grid grid-cols-3 gap-2">
            <a
              href="tel:112"
              className="py-3 px-2 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1 shadow active:scale-95 transition-all text-center"
            >
              <Phone size={16} />
              <span>112 (National)</span>
            </a>

            <a
              href="tel:108"
              className="py-3 px-2 bg-red-700 hover:bg-red-800 text-white rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1 shadow active:scale-95 transition-all text-center"
            >
              <Phone size={16} />
              <span>108 (Ambulance)</span>
            </a>

            <a
              href="tel:100"
              className="py-3 px-2 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1 shadow active:scale-95 transition-all text-center"
            >
              <Phone size={16} />
              <span>100 (Police)</span>
            </a>
          </div>
        </div>

        {/* Registered Emergency Contacts List */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Notified Contacts ({contacts.length})
            </h3>
            <button
              onClick={() => setIsAddContactOpen(true)}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
            >
              + Add Contact
            </button>
          </div>

          {contacts.length > 0 ? (
            <div className="space-y-2">
              {contacts.map((c, i) => (
                <div key={c.id || i} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-slate-800/60 rounded-xl">
                  <div>
                    <div className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                      <span>{c.name}</span>
                      {c.isPrimary && <span className="text-[9px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 px-1.5 py-0.2 rounded font-black">PRIMARY</span>}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">{c.relationship} • {c.phone}</div>
                  </div>
                  <a
                    href={`tel:${c.phone}`}
                    className="p-2 bg-red-600 text-white rounded-lg active:scale-95 transition-transform"
                  >
                    <Phone size={14} />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-2 text-center">
              No contacts saved yet. Tap "+ Add Contact" above to configure.
            </p>
          )}
        </div>

        {/* Past Emergency Cases History */}
        {caseHistory.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Resolved Cases History ({caseHistory.length})
            </h3>
            <div className="space-y-2">
              {caseHistory.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span>{item.category}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">RESOLVED</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* CONFIRM SOS MODAL */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 rounded-full mx-auto flex items-center justify-center animate-bounce">
              <AlertCircle size={36} />
            </div>

            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Confirm Emergency SOS?</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                This will capture your live GPS coordinates, notify your registered emergency contacts, and initiate dispatch tracking.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleInitiateSos(false)}
                className="py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg shadow-red-900/30"
              >
                CONFIRM SOS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACCIDENT COUNTDOWN MODAL (Automatic trigger on impact) */}
      <AccidentCountdownModal
        isOpen={showCountdownModal}
        impactMagnitude={detectedMagnitude}
        countdownSeconds={30}
        onCancelSafe={() => setShowCountdownModal(false)}
        onConfirmSosNow={() => handleInitiateSos(true, detectedMagnitude)}
        onCountdownExpired={() => handleInitiateSos(true, detectedMagnitude)}
      />

      {/* ADD CONTACT MODAL */}
      {isAddContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-gray-900 dark:text-white">Add Emergency Contact</h3>
              <button onClick={() => setIsAddContactOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleAddContactSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newContactName}
                  onChange={e => setNewContactName(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none text-gray-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={newContactPhone}
                  onChange={e => setNewContactPhone(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none text-gray-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Relationship</label>
                <select
                  value={newContactRel}
                  onChange={e => setNewContactRel(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none text-gray-900 dark:text-white font-semibold cursor-pointer"
                >
                  <option value="Family">Family</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Friend">Friend</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddContactOpen(false)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SosPage;
