import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMedicalProfile, MedicalProfile, getEmergencyContacts, EmergencyContact, getMedications, Medication } from '../../services/medicalProfile';
import { AlertTriangle, Phone, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmergencyIdPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<MedicalProfile | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const p = await getMedicalProfile(user.uid);
    const c = await getEmergencyContacts(user.uid);
    const m = await getMedications(user.uid);
    setProfile(p);
    setContacts(c.filter(contact => contact.emergencyVisible !== false));
    setMedications(m.filter(med => med.emergencyVisible !== false));
    setLoading(false);
  };

  if (loading) return <div className="p-8 text-center text-xl font-bold">Loading...</div>;

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
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl">User</div>
            )}
          </div>
          <h2 className="text-3xl font-black text-slate-800">{profile?.visibility?.name ? profile.name : 'HIDDEN'}</h2>
          {profile?.visibility?.bloodGroup && (
            <div className="mt-4 inline-block bg-red-100 text-red-700 px-6 py-2 rounded-full font-black text-2xl border-2 border-red-200">
              {profile.bloodGroup}
            </div>
          )}
        </div>

        {profile?.visibility?.emergencyInstructions && profile.emergencyInstructions && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm">
            <h3 className="font-bold text-amber-800 mb-1 text-lg">EMERGENCY INSTRUCTIONS</h3>
            <p className="text-amber-900 font-medium">{profile.emergencyInstructions}</p>
          </div>
        )}

        {contacts.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-700 px-2 text-lg">EMERGENCY CONTACTS</h3>
            {contacts.map(contact => (
              <a key={contact.id} href={`tel:${contact.phone}`} className="flex items-center gap-4 bg-red-600 text-white p-4 rounded-xl shadow-md active:scale-95 transition-transform">
                <div className="bg-white/20 p-3 rounded-full">
                  <Phone size={24} />
                </div>
                <div>
                  <div className="font-bold text-lg">{contact.name}</div>
                  <div className="text-red-100">{contact.relationship}</div>
                </div>
              </a>
            ))}
          </div>
        )}

        <button onClick={() => navigate('/qr')} className="w-full bg-slate-800 text-white p-4 rounded-xl font-bold flex justify-center items-center gap-2 shadow-md">
          <QrCode /> VIEW QR CODE
        </button>

        <p className="text-center text-xs text-slate-400 mt-8 px-4">
          This application provides medical information as entered by the user. It does not replace professional medical advice.
        </p>
      </div>
    </div>
  );
};

export default EmergencyIdPage;
