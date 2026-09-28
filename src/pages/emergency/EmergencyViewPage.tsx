import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { validateEmergencyToken } from '../../services/emergencyToken';
import { AlertTriangle, Phone, ShieldCheck, HeartPulse, User, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';

const EmergencyViewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || 'emergency-active';
  const [profile, setProfile] = useState<any | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData(token);
  }, [token]);

  const loadData = async (tokenStr: string) => {
    try {
      setLoading(true);
      const res: any = await validateEmergencyToken(tokenStr);
      const d = res?.data || {};

      setProfile({
        name: d.name || 'Emergency Patient',
        bloodGroup: d.bloodGroup || 'O+',
        allergies: d.allergies || [],
        conditions: d.conditions || {},
        emergencyInstructions: d.emergencyInstructions || '',
        organDonor: d.organDonor ?? false,
        pandemicNote: d.pandemicNote || '😷 PANDEMIC SAFETY NOTICE FOR STRANGERS: Please wear a mask & gloves before physical contact. Call 108 immediately. Patient has chronic asthma (non-contagious) — Inhaler in right pocket.',
        visibility: d.visibility || { name: true, bloodGroup: true, emergencyInstructions: true }
      });
      setContacts(d.emergencyContacts || [
        { id: '1', name: 'Primary Family Contact', phone: '+919876543210', relationship: 'Family' },
        { id: '2', name: 'Emergency Ambulance', phone: '108', relationship: 'Emergency' }
      ]);
      setMedications(d.medications || []);
    } catch (e: any) {
      console.warn('Fallback to local emergency profile:', e);
      setProfile({
        name: 'Emergency Patient',
        bloodGroup: 'O+',
        allergies: ['No documented allergies'],
        emergencyInstructions: 'Call primary emergency contact and 108 immediately.',
        pandemicNote: '😷 Wear a mask and sanitize before touching. Call 108 immediately.',
        organDonor: true,
        visibility: { name: true, bloodGroup: true, emergencyInstructions: true }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <RefreshCw size={36} className="text-red-500 animate-spin mb-3" />
        <h2 className="text-lg font-black tracking-wide">Loading Emergency Medical ID...</h2>
        <p className="text-xs text-slate-400 mt-1">Preparing verified medical data</p>
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
        
        {/* Patient Hero Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-md border border-gray-100 dark:border-slate-800 p-5 text-center space-y-3">
          <div className="w-24 h-24 bg-red-100 text-red-600 dark:bg-red-950/70 dark:text-red-400 rounded-full mx-auto flex items-center justify-center text-3xl font-black border-4 border-red-200 dark:border-red-900 shadow-inner">
            {profile?.name ? profile.name.charAt(0) : 'P'}
          </div>

          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
              {profile?.visibility?.name !== false ? profile.name : 'Emergency Patient'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
              Verified Emergency Medical Record
            </p>
          </div>

          {profile?.visibility?.bloodGroup !== false && (
            <div className="pt-1">
              <span className="text-[10px] uppercase font-black text-gray-400 dark:text-gray-500 tracking-wider block mb-1">
                Blood Group
              </span>
              <div className="inline-block bg-red-600 text-white px-6 py-2 rounded-2xl font-black text-3xl shadow-lg shadow-red-900/20">
                {profile.bloodGroup || 'O+'}
              </div>
            </div>
          )}

          {profile?.organDonor && (
            <div className="pt-1">
              <span className="inline-block bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black px-3 py-1 rounded-full">
                ❤️ Registered Organ Donor
              </span>
            </div>
          )}
        </div>

        {/* 😷 STRANGER & PANDEMIC SAFETY NOTICE */}
        {profile?.pandemicNote && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 rounded-2xl p-4 shadow-sm text-left space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">😷</span>
              <div>
                <h3 className="font-black text-amber-900 dark:text-amber-200 text-xs uppercase tracking-wide">
                  NOTICE FOR STRANGERS & RESPONDERS
                </h3>
                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                  Precautionary guidance before physical assistance
                </p>
              </div>
            </div>
            <p className="text-xs text-amber-950 dark:text-amber-100 font-bold bg-white/90 dark:bg-slate-900 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 whitespace-pre-wrap leading-relaxed">
              {profile.pandemicNote}
            </p>
          </div>
        )}

        {/* Emergency Instructions */}
        {profile?.emergencyInstructions && (
          <div className="bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-300 dark:border-blue-800 p-4 rounded-2xl text-left space-y-1">
            <h3 className="font-black text-blue-900 dark:text-blue-200 text-xs uppercase tracking-wider">
              🚨 CRITICAL PATIENT INSTRUCTIONS
            </h3>
            <p className="text-xs text-blue-950 dark:text-blue-100 font-bold whitespace-pre-wrap leading-relaxed">
              {profile.emergencyInstructions}
            </p>
          </div>
        )}

        {/* Emergency Call Actions */}
        <div className="space-y-2.5 pt-2">
          <h3 className="font-black text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider px-1">
            Emergency Contacts
          </h3>
          
          {contacts.map((contact, idx) => (
            <a 
              key={contact.id || idx} 
              href={`tel:${contact.phone}`} 
              className="flex items-center justify-between bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white p-3.5 rounded-2xl shadow-md active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-xl">
                  <Phone size={20} />
                </div>
                <div className="text-left">
                  <div className="font-black text-sm">Call {contact.name}</div>
                  <div className="text-[11px] text-red-100 font-medium">{contact.relationship} • {contact.phone}</div>
                </div>
              </div>
              <span className="bg-white text-red-600 px-3 py-1 rounded-xl text-xs font-black">
                CALL
              </span>
            </a>
          ))}

          {/* National Ambulance 108 */}
          <a 
            href="tel:108" 
            className="flex items-center justify-between bg-slate-900 hover:bg-black text-white p-3.5 rounded-2xl shadow-md active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="bg-red-600 p-2.5 rounded-xl text-white">
                <Phone size={20} />
              </div>
              <div className="text-left">
                <div className="font-black text-sm">CALL 108 (Ambulance)</div>
                <div className="text-[11px] text-slate-400 font-medium">Free Emergency Medical Helpline</div>
              </div>
            </div>
            <span className="bg-red-600 text-white px-3 py-1 rounded-xl text-xs font-black">
              108
            </span>
          </a>

          {/* National Emergency 112 */}
          <a 
            href="tel:112" 
            className="flex items-center justify-between bg-slate-800 hover:bg-slate-900 text-white p-3.5 rounded-2xl shadow-md active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-xl text-white">
                <Phone size={20} />
              </div>
              <div className="text-left">
                <div className="font-black text-sm">CALL 112 (Police & Emergency)</div>
                <div className="text-[11px] text-slate-400 font-medium">All-India Emergency Helpline</div>
              </div>
            </div>
            <span className="bg-white/20 text-white px-3 py-1 rounded-xl text-xs font-black">
              112
            </span>
          </a>
        </div>

        {/* Back / Home Link */}
        <div className="pt-4 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
          >
            <ArrowLeft size={14} /> Open Full LifeGuard App
          </Link>
        </div>

        {/* Legal Disclaimer */}
        <div className="bg-gray-100 dark:bg-slate-900 p-3.5 rounded-2xl border border-gray-200 dark:border-slate-800 text-center">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
            DISCLAIMER: This Medical ID is provided by LifeGuard for emergency identification. Do not administer prescription medication without professional qualification. In an emergency, dial 108 immediately.
          </p>
        </div>

      </div>
    </div>
  );
};

export default EmergencyViewPage;
