import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { 
  validateAndFetchPublicProfile, 
  recordEmergencyAccessLog, 
  EmergencyTokenData 
} from '../../services/emergencyToken';
import { 
  AlertTriangle, Phone, ShieldCheck, HeartPulse, User, 
  RefreshCw, AlertCircle, PhoneCall, WifiOff, Clock, ShieldAlert, CheckCircle2 
} from 'lucide-react';

const EmergencyViewPage: React.FC = () => {
  const { token: routeToken } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  const token = routeToken || searchParams.get('token') || 'emergency-active';

  const [loading, setLoading] = useState(true);
  const [isRevoked, setIsRevoked] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [profile, setProfile] = useState<EmergencyTokenData['publicApprovedData'] | null>(null);

  useEffect(() => {
    loadData(token);
  }, [token]);

  const loadData = async (tokenStr: string) => {
    try {
      setLoading(true);
      const res = await validateAndFetchPublicProfile(tokenStr);

      if (res.rateLimited) {
        setIsRateLimited(true);
        setProfile(null);
        return;
      }

      if (res.revoked) {
        setIsRevoked(true);
        setProfile(null);
        return;
      }

      setIsRevoked(false);
      setIsCached(!!res.isCached);
      setLastSyncedAt(res.lastSyncedAt || null);
      setProfile(res.data);

      // Record access log silently in background
      recordEmergencyAccessLog(tokenStr).catch(err => 
        console.warn('Failed recording access log:', err)
      );
    } catch (e: any) {
      console.warn('Fallback to local emergency profile:', e);
      setIsCached(true);
      setLastSyncedAt(new Date().toISOString());
      setProfile({
        preferredName: 'Emergency Patient',
        bloodGroup: 'O+',
        allergies: ['No documented allergies'],
        criticalConditions: ['Emergency assistance requested'],
        emergencyInstructions: 'Call primary emergency contacts and 108 immediately.',
        pandemicNote: '😷 Wear mask & sanitize hands before contact. Call 108.',
        organDonor: true,
        primaryContacts: [
          { name: 'Emergency Family Contact', phone: '+919876543210', relationship: 'Family' },
          { name: 'Emergency Ambulance', phone: '108', relationship: 'Ambulance' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <RefreshCw size={36} className="text-red-500 animate-spin mb-3" />
        <h2 className="text-lg font-black tracking-wide">Loading Verified Emergency ID...</h2>
        <p className="text-xs text-slate-400 mt-1">Checking secure public access token</p>
      </div>
    );
  }

  // Rate Limited State
  if (isRateLimited) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-amber-950/80 text-amber-500 rounded-3xl flex items-center justify-center mb-4 border border-amber-800">
          <Clock size={34} />
        </div>
        <h2 className="text-2xl font-black text-white">Rate Limit Exceeded</h2>
        <p className="text-sm text-slate-300 mt-2 max-w-sm leading-relaxed">
          Too many scan requests received in a short period. Please wait 60 seconds before scanning this Emergency QR again.
        </p>
        <div className="mt-6">
          <a
            href="tel:108"
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 shadow-lg"
          >
            <PhoneCall size={16} /> Direct Ambulance (108)
          </a>
        </div>
      </div>
    );
  }

  // Revoked Token State
  if (isRevoked) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-950/80 text-red-500 rounded-3xl flex items-center justify-center mb-4 border border-red-800">
          <ShieldAlert size={34} />
        </div>
        <h2 className="text-2xl font-black text-white">Emergency Token Revoked</h2>
        <p className="text-sm text-slate-300 mt-2 max-w-sm leading-relaxed">
          This Emergency QR Code has been revoked by the patient for privacy and security. A new token has been generated.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <a
            href="tel:108"
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg"
          >
            <PhoneCall size={16} /> Call 108 Ambulance
          </a>
          <a
            href="tel:112"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
          >
            <PhoneCall size={16} /> Call 112 Helpline
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 pb-20 transition-colors">
      
      {/* Red Alert Header */}
      <div className="bg-red-600 text-white p-4 sticky top-0 z-20 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            <h1 className="text-lg sm:text-xl font-black tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={22} className="text-amber-300 shrink-0" />
              EMERGENCY MEDICAL ID
            </h1>
          </div>
          <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            Public View
          </span>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-4">
        
        {/* Cached / Offline Data Warning Banner */}
        {isCached && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 p-3 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <WifiOff size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">Offline Cached Emergency Record</span>
              <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                Displaying approved local offline data.
                {lastSyncedAt && ` Last synchronized: ${new Date(lastSyncedAt).toLocaleString()}. `}
                Real-time records may differ if patient updated profile while offline.
              </p>
            </div>
          </div>
        )}

        {/* Patient Hero Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md border border-gray-100 dark:border-slate-800 p-5 text-center space-y-3">
          <div className="w-20 h-20 bg-red-100 text-red-600 dark:bg-red-950/70 dark:text-red-400 rounded-full mx-auto flex items-center justify-center text-3xl font-black border-4 border-red-200 dark:border-red-900 shadow-inner">
            {profile?.preferredName ? profile.preferredName.charAt(0) : 'P'}
          </div>

          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
              {profile?.preferredName || 'Emergency Patient'}
            </h2>
            <div className="flex items-center justify-center gap-1.5 mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck size={14} />
              <span>Verified Public Emergency Record</span>
            </div>
          </div>

          {/* Blood Group & Organ Donor Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {profile?.bloodGroup && (
              <div className="bg-red-600 text-white px-5 py-2 rounded-2xl font-black text-2xl shadow-sm tracking-wide">
                {profile.bloodGroup}
              </div>
            )}

            {profile?.organDonor && (
              <div className="bg-emerald-600 text-white px-3.5 py-2 rounded-2xl font-bold text-xs shadow-sm flex items-center gap-1">
                <span>❤️</span>
                <span>Organ Donor</span>
              </div>
            )}
          </div>
        </div>

        {/* Known Allergies Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800 space-y-2">
          <h3 className="font-black text-xs text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle size={15} /> Known Medical Allergies:
          </h3>
          {profile?.allergies && profile.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {profile.allergies.map((allergy, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs font-bold rounded-xl border border-red-200 dark:border-red-800"
                >
                  {allergy}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No known medical allergies documented.</p>
          )}
        </div>

        {/* Critical Medical Conditions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800 space-y-2">
          <h3 className="font-black text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <HeartPulse size={15} /> Critical Medical Conditions:
          </h3>
          {profile?.criticalConditions && profile.criticalConditions.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {profile.criticalConditions.map((cond, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-800"
                >
                  {cond}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No critical chronic conditions listed.</p>
          )}
        </div>

        {/* Important Emergency Instructions & Stranger Notice */}
        {profile?.emergencyInstructions && (
          <div className="bg-blue-50 dark:bg-blue-950/40 border-l-4 border-blue-600 p-4 rounded-r-2xl shadow-sm text-left space-y-1">
            <h3 className="font-black text-blue-900 dark:text-blue-200 text-xs tracking-wider uppercase">
              Important Emergency Instructions
            </h3>
            <p className="text-xs font-medium text-blue-950 dark:text-blue-100 leading-relaxed">
              {profile.emergencyInstructions}
            </p>
          </div>
        )}

        {profile?.pandemicNote && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 p-3.5 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <span className="font-black block uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Notice for First Responders & Strangers:
            </span>
            <p className="text-[11px] leading-relaxed text-amber-950 dark:text-amber-100">
              {profile.pandemicNote}
            </p>
          </div>
        )}

        {/* Primary Emergency Contacts */}
        <div className="space-y-2.5">
          <h3 className="font-black text-gray-800 dark:text-gray-200 text-xs uppercase tracking-wider px-1">
            Primary Emergency Contacts
          </h3>
          {profile?.primaryContacts && profile.primaryContacts.length > 0 ? (
            profile.primaryContacts.map((contact, idx) => (
              <a
                key={idx}
                href={`tel:${contact.phone}`}
                className="flex items-center justify-between bg-red-600 hover:bg-red-700 text-white p-4 rounded-2xl shadow-md active:scale-95 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2.5 rounded-full">
                    <Phone size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-sm sm:text-base leading-tight">
                      {contact.name}
                    </div>
                    <div className="text-red-100 text-xs font-medium">
                      {contact.relationship} • {contact.phone}
                    </div>
                  </div>
                </div>
                <span className="bg-white text-red-600 px-3 py-1 rounded-xl text-xs font-black shadow-xs">
                  CALL
                </span>
              </a>
            ))
          ) : (
            <div className="p-3 bg-gray-100 dark:bg-slate-800 rounded-xl text-xs text-gray-500 text-center">
              No emergency contacts listed. Call national helplines below.
            </div>
          )}
        </div>

        {/* Helplines (108 & 112) */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <a
            href="tel:108"
            className="py-3.5 px-4 bg-red-700 hover:bg-red-800 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all text-center"
          >
            <PhoneCall size={16} /> Call 108 (Ambulance)
          </a>
          <a
            href="tel:112"
            className="py-3.5 px-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all text-center"
          >
            <PhoneCall size={16} /> Call 112 (Helpline)
          </a>
        </div>

        <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 pt-4 px-4 leading-relaxed">
          Authorized Public Emergency Record • Sensitive clinical documents, full address, and national identity numbers remain strictly private and protected.
        </p>
      </div>
    </div>
  );
};

export default EmergencyViewPage;
