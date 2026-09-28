import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMedicalProfile, MedicalProfile, getEmergencyContacts, EmergencyContact } from '../../services/medicalProfile';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, Download, Bell, Smartphone, ShieldAlert, CheckCircle2, 
  HeartPulse, Sparkles, ExternalLink, Info, AlertTriangle, Phone
} from 'lucide-react';

interface LockScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LockScreenEmergencyModal: React.FC<LockScreenModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MedicalProfile | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen, user]);

  const loadProfile = async () => {
    try {
      if (user) {
        const p = await getMedicalProfile(user.uid);
        const c = await getEmergencyContacts(user.uid);
        setProfile(p);
        setContacts(c);
      } else {
        const local = localStorage.getItem('guest_medical_profile') || localStorage.getItem('lifeguard_medical_profile');
        if (local) {
          const parsed = JSON.parse(local);
          setProfile(parsed);
          setContacts(parsed.contacts || []);
        } else {
          setProfile({
            name: 'Emergency Patient',
            bloodGroup: 'O+',
            pandemicNote: '😷 PANDEMIC SAFETY NOTICE: Please wear mask & sanitize before touching. Call 108 immediately.',
            emergencyInstructions: 'Allergic to Penicillin. Asthma patient - inhaler in right pocket.'
          });
          setContacts([{ 
            id: 'default-contact',
            name: 'Emergency Family', 
            phone: '108', 
            relationship: 'Primary',
            isPrimary: true,
            emergencyVisible: true
          }]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const bloodGroup = profile?.bloodGroup || 'O+';
  const patientName = user?.fullName || profile?.name || 'Emergency Patient';
  const strangerNote = profile?.pandemicNote || '😷 PANDEMIC NOTICE: Please wear a mask & sanitize before touching. Call 108 immediately.';
  const emergencyPhone = contacts[0]?.phone || '108';
  const emergencyContactName = contacts[0]?.name || 'Primary Contact (108)';
  
  // Public URL that anyone can open without login or password
  const emergencyUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/emergency/view?token=emergency-${user?.uid?.slice(0, 8) || 'instant'}`
    : 'https://lifeguard.app';

  // 1-Tap Canvas Wallpaper Generator (1080 x 1920)
  const handleDownloadWallpaper = () => {
    setIsGenerating(true);
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) {
      setIsGenerating(false);
      return;
    }

    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        // Deep Dark Medical Lockscreen Background
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, 1080, 1920);

        // Header Accent Glow
        const gradient = ctx.createLinearGradient(0, 0, 1080, 400);
        gradient.addColorStop(0, '#DC2626');
        gradient.addColorStop(1, '#991B1B');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1080, 240);

        // Header Title
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 48px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🚨 EMERGENCY MEDICAL ID', 540, 120);

        ctx.font = '500 28px Inter, sans-serif';
        ctx.fillStyle = '#FEE2E2';
        ctx.fillText('Scan QR or Call 108 • No Password Needed', 540, 180);

        // Main White Card in center
        ctx.fillStyle = '#FFFFFF';
        ctx.roundRect(80, 300, 920, 1300, 40);
        ctx.fill();

        // Blood Group Badge (Red Box)
        ctx.fillStyle = '#DC2626';
        ctx.roundRect(140, 360, 220, 100, 24);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 64px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(bloodGroup, 250, 435);

        // Patient Name & Title
        ctx.textAlign = 'left';
        ctx.fillStyle = '#64748B';
        ctx.font = '600 24px Inter, sans-serif';
        ctx.fillText('PATIENT NAME', 400, 390);

        ctx.fillStyle = '#0F172A';
        ctx.font = '900 44px Inter, sans-serif';
        ctx.fillText(patientName.slice(0, 18), 400, 440);

        // Divider
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(140, 500);
        ctx.lineTo(940, 500);
        ctx.stroke();

        // QR Code in center
        ctx.drawImage(img, 290, 540, 500, 500);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 26px Inter, sans-serif';
        ctx.fillText('Scan with any phone camera to view full medical history', 540, 1080);

        // Pandemic / Stranger Safety Box
        ctx.fillStyle = '#FEF2F2';
        ctx.roundRect(140, 1130, 800, 260, 28);
        ctx.fill();
        ctx.strokeStyle = '#FCA5A5';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#991B1B';
        ctx.font = '900 26px Inter, sans-serif';
        ctx.fillText('⚠️ PANDEMIC & STRANGER SAFETY INSTRUCTION:', 170, 1180);

        ctx.fillStyle = '#1E293B';
        ctx.font = '600 26px Inter, sans-serif';
        
        // Multi-line wrap note
        const words = strangerNote.split(' ');
        let line = '';
        let y = 1230;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          if (testLine.length > 42 && n > 0) {
            ctx.fillText(line, 170, y);
            line = words[n] + ' ';
            y += 40;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 170, y);

        // Emergency Contact Pill
        ctx.fillStyle = '#0F172A';
        ctx.roundRect(140, 1430, 800, 110, 24);
        ctx.fill();

        ctx.fillStyle = '#F8FAFC';
        ctx.font = '900 32px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`📞 CALL EMERGENCY: ${emergencyPhone} (${emergencyContactName.slice(0, 15)})`, 540, 1500);

        // Bottom Footer
        ctx.fillStyle = '#94A3B8';
        ctx.font = '500 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('LifeGuard India • Set this image as Lock Screen Wallpaper', 540, 1780);
        ctx.fillText('Visible to Responders Without Unlocking Phone', 540, 1820);

        // Download trigger
        const link = document.createElement('a');
        link.download = `LifeGuard-Lockscreen-Emergency-${bloodGroup}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        setIsGenerating(false);
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (e) {
      console.error('Wallpaper generate error:', e);
      setIsGenerating(false);
    }
  };

  // Pin Active Lock Screen Notification
  const handlePinNotification = async () => {
    if (!('Notification' in window)) {
      setNotificationStatus('Notifications are not supported in this browser.');
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        const title = `🚨 EMERGENCY MEDICAL ID: ${bloodGroup} (${patientName})`;
        const options: any = {
          body: `${strangerNote}\nEmergency Contact: ${emergencyPhone} • Tap to view without password`,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: 'lifeguard-emergency-lockscreen',
          requireInteraction: true,
          silent: false,
          data: { url: emergencyUrl }
        };

        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg) {
            await reg.showNotification(title, options);
          } else {
            new Notification(title, options);
          }
        } else {
          new Notification(title, options);
        }

        setNotificationStatus('✅ Pinned to Lock Screen! You will now see this alert on your lock screen without unlocking.');
      } else {
        setNotificationStatus('Notification permission was denied. Please allow notifications in Chrome settings.');
      }
    } catch (err) {
      setNotificationStatus('Could not pin notification: ' + String(err));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] border border-red-500/20 my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-4 relative">
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
              LOCK SCREEN NO-PASSWORD ACCESS
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
            <Smartphone size={24} className="text-amber-300 shrink-0" />
            Phone Lock Screen Emergency Card
          </h2>

          <p className="text-xs text-red-100 font-medium mt-0.5">
            Anyone can view your Medical QR & Pandemic Notes without entering your phone password!
          </p>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1 text-gray-900 dark:text-gray-100">
          
          {/* Visual Phone Mockup Card */}
          <div className="bg-slate-950 text-white p-4 rounded-3xl shadow-xl border-2 border-slate-700/60 text-center relative overflow-hidden">
            <div className="flex justify-between items-center text-[10px] text-slate-400 mb-2 px-1">
              <span>9:41</span>
              <span className="bg-red-600/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                🔒 LOCKED SCREEN
              </span>
              <span>100% 🔋</span>
            </div>

            {/* Inner Medical Emergency Card */}
            <div className="bg-white text-slate-900 rounded-2xl p-3 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="bg-red-600 text-white font-black text-xl px-2.5 py-1 rounded-xl shadow">
                  {bloodGroup}
                </span>
                <div className="text-right">
                  <p className="font-black text-xs text-slate-900">{patientName}</p>
                  <p className="text-[10px] text-red-600 font-bold">EMERGENCY MEDICAL ID</p>
                </div>
              </div>

              {/* Scannable QR Code */}
              <div ref={qrRef} className="bg-gray-50 p-2 rounded-xl flex items-center justify-center border border-gray-200">
                <QRCodeSVG
                  value={emergencyUrl}
                  size={150}
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* Pandemic / Stranger Note */}
              <div className="bg-red-50 border border-red-200 p-2 rounded-xl text-left">
                <p className="text-[10px] font-black text-red-700 uppercase">
                  ⚠️ Stranger & Pandemic Note:
                </p>
                <p className="text-[11px] text-slate-800 font-medium leading-tight mt-0.5">
                  {strangerNote}
                </p>
              </div>

              {/* Call Hotline */}
              <div className="bg-slate-900 text-white p-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5">
                <Phone size={14} className="text-red-400" />
                <span>Call Emergency: {emergencyPhone} ({emergencyContactName})</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 mt-2">
              ✨ Visible immediately when phone screen turns on — No fingerprint or PIN required!
            </p>
          </div>

          {/* Action 1: 1-Tap Download Wallpaper */}
          <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-red-200 dark:border-slate-700 space-y-2">
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Download size={18} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  Method 1: Set as Lock Screen Wallpaper (Recommended)
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  Downloads an exact 9:16 high-res phone wallpaper with your QR code, notes, and contacts.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadWallpaper}
              disabled={isGenerating}
              className="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Download size={16} />
              {isGenerating ? 'Generating HD Wallpaper...' : 'Download Lock Screen Wallpaper (HD)'}
            </button>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center">
              After download: Open Photo in Gallery ➔ Tap (⋮) ➔ Tap "Set as Lock Screen".
            </p>
          </div>

          {/* Action 2: Pin Active Notification */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-blue-200 dark:border-slate-700 space-y-2">
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Bell size={18} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  Method 2: Pin Notification to Lock Screen
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  Places an active Emergency Alert on your lock screen that opens without password.
                </p>
              </div>
            </div>

            <button
              onClick={handlePinNotification}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Bell size={16} /> Pin Emergency Alert to Lock Screen
            </button>

            {notificationStatus && (
              <p className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 p-2 rounded-xl text-center">
                {notificationStatus}
              </p>
            )}
          </div>

          {/* Method 3: Android Native Emergency Feature */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
            <p className="font-black text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Info size={14} className="text-amber-500" /> Method 3: Android Native Emergency Button
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
              Every Android phone has a built-in button on the lock screen:
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
              <li>Swipe up on locked screen ➔ Tap <strong>"Emergency"</strong> button at bottom.</li>
              <li>Tap <strong>"Emergency Information"</strong> at the top.</li>
              <li>You can paste your Medical Notes & LifeGuard emergency QR link here for paramedics.</li>
            </ol>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 dark:bg-slate-800/90 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl active:scale-95 transition-all text-center"
          >
            ✕ Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default LockScreenEmergencyModal;
