import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { validateEmergencyToken } from '../../services/emergencyToken';
import { AlertTriangle, Phone } from 'lucide-react';

const EmergencyViewPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [profile, setProfile] = useState<any | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      loadData(token);
    } else {
      setError('Invalid URL');
      setLoading(false);
    }
  }, [token]);

  const loadData = async (tokenStr: string) => {
    try {
      const res: any = await validateEmergencyToken(tokenStr);
      if (!res.valid || !res.data) {
        setError(res.error || 'This emergency ID link is no longer active or invalid.');
        setLoading(false);
        return;
      }

      const d = res.data;
      setProfile({
        name: d.name,
        bloodGroup: d.bloodGroup,
        allergies: d.allergies,
        conditions: d.conditions,
        emergencyInstructions: d.emergencyInstructions,
        organDonor: d.organDonor
      });
      setContacts(d.emergencyContacts || []);
      setMedications(d.medications || []);
      setLoading(false);
    } catch (e: any) {
      setError(e.message || 'An error occurred loading the data.');
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-xl font-bold">Loading Emergency Info...</div>;
  
  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-md max-w-sm w-full text-center">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
        <p className="text-slate-600">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-red-600 text-white p-4 text-center sticky top-0 z-10 shadow-md">
        <h1 className="text-2xl font-black tracking-wider flex items-center justify-center gap-2">
          <AlertTriangle /> EMERGENCY MEDICAL ID
        </h1>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <div className="w-32 h-32 bg-slate-200 rounded-full mx-auto mb-4 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl">User</div>
          </div>
          <h2 className="text-3xl font-black text-slate-800">{profile?.visibility?.name ? profile.name : 'HIDDEN'}</h2>
          {profile?.visibility?.bloodGroup && (
            <div className="mt-4 inline-block bg-red-100 text-red-700 px-6 py-2 rounded-full font-black text-2xl border-2 border-red-200">
              {profile.bloodGroup}
            </div>
          )}
        </div>

        {/* Stranger & Pandemic Notice */}
        {(profile?.pandemicNote || "😷 PANDEMIC SAFETY NOTICE FOR STRANGERS: Please wear a mask & sanitize before touching. Call 108 immediately.") && (
          <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-2xl shadow-sm text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">😷</span>
              <div>
                <h3 className="font-bold text-amber-900 text-sm uppercase tracking-wide">NOTICE FOR STRANGERS • PANDEMIC SAFETY</h3>
                <p className="text-xs text-amber-700">Precautionary instructions for first responder safety</p>
              </div>
            </div>
            <p className="text-amber-950 font-bold text-sm bg-white/80 p-3 rounded-xl border border-amber-200 whitespace-pre-wrap">
              {profile?.pandemicNote || "😷 PANDEMIC SAFETY NOTICE FOR STRANGERS: Please wear a mask & sanitize before touching. Call 108 immediately."}
            </p>
          </div>
        )}

        {profile?.visibility?.emergencyInstructions && profile.emergencyInstructions && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl shadow-sm text-left">
            <h3 className="font-bold text-blue-800 mb-1 text-base">EMERGENCY INSTRUCTIONS</h3>
            <p className="text-blue-900 font-medium whitespace-pre-wrap text-sm">{profile.emergencyInstructions}</p>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="font-bold text-slate-700 px-2 text-lg">EMERGENCY ACTIONS</h3>
          {contacts.length > 0 && contacts.map(contact => (
            <a key={contact.id} href={`tel:${contact.phone}`} className="flex items-center gap-4 bg-red-600 text-white p-4 rounded-xl shadow-md active:scale-95 transition-transform">
              <div className="bg-white/20 p-3 rounded-full">
                <Phone size={24} />
              </div>
              <div>
                <div className="font-bold text-lg">Call {contact.name}</div>
                <div className="text-red-100">{contact.relationship}</div>
              </div>
            </a>
          ))}
          
          <a href="tel:112" className="flex items-center gap-4 bg-slate-800 text-white p-4 rounded-xl shadow-md active:scale-95 transition-transform">
            <div className="bg-white/20 p-3 rounded-full">
              <Phone size={24} />
            </div>
            <div>
              <div className="font-bold text-lg">CALL 112</div>
              <div className="text-slate-300">National Emergency Number</div>
            </div>
          </a>
        </div>

        <div className="bg-slate-200 p-4 rounded-xl mt-8">
          <p className="text-center text-xs text-slate-600 font-medium">
            DISCLAIMER: This application provides medical information as entered by the user. Do not administer medications without proper medical training. This application does not replace professional medical advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyViewPage;
