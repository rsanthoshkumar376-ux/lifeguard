import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMedicalProfile, MedicalProfile, getEmergencyContacts, EmergencyContact, getMedications, Medication } from '../../services/medicalProfile';
import { AlertTriangle, Phone, QrCode, Download, Printer, User } from 'lucide-react';
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
    } else {
      // Demo medical profile for immediate preview
      setProfile({
        name: 'Santhosh Kumar (Sample ID)',
        bloodGroup: 'O+',
        conditions: { asthma: true },
        allergies: ['Penicillin', 'Dust'],
        emergencyInstructions: 'In case of emergency, administer inhaler and call contact.',
        visibility: { name: true, bloodGroup: true, emergencyInstructions: true, conditions: true, allergies: true }
      });
      setContacts([
        { id: 'c1', name: 'Dr. Ramesh (Family Physician)', relationship: 'Doctor', phone: '+919876543210', isPrimary: true, emergencyVisible: true },
        { id: 'c2', name: 'Emergency Ambulance', relationship: 'Emergency', phone: '108', isPrimary: false, emergencyVisible: true }
      ]);
      setMedications([
        { id: 'm1', name: 'Salbutamol Inhaler', dosage: '100mcg', frequency: 'As needed', instructions: '2 puffs during shortness of breath', emergencyNote: 'Keep in pocket', emergencyVisible: true }
      ]);
      setLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const p = await getMedicalProfile(user.uid);
      const c = await getEmergencyContacts(user.uid);
      const m = await getMedications(user.uid);
      setProfile(p);
      setContacts(c.filter(contact => contact.emergencyVisible !== false));
      setMedications(m.filter(med => med.emergencyVisible !== false));
    } catch (e) {
      console.error('Error loading medical profile', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-gray-900">
      <div className="bg-red-600 text-white p-4 text-center sticky top-0 z-10 shadow-md">
        <h1 className="text-xl sm:text-2xl font-black tracking-wider flex items-center justify-center gap-2">
          <AlertTriangle /> EMERGENCY MEDICAL ID
        </h1>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-5">
        {!user && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-xl text-xs flex items-center justify-between">
            <span>Viewing Sample Medical ID.</span>
            <a href="/login" className="font-bold underline text-blue-900">Login to save yours</a>
          </div>
        )}

        {/* Card Component */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 text-center">
          <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden border-2 border-red-200 shadow-inner">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={44} />
            )}
          </div>
          <h2 className="text-2xl font-black text-gray-900">{profile?.name || 'Emergency Patient'}</h2>
          
          {profile?.bloodGroup && (
            <div className="mt-3 inline-block bg-red-600 text-white px-6 py-2 rounded-full font-black text-2xl shadow">
              {profile.bloodGroup}
            </div>
          )}
        </div>

        {profile?.emergencyInstructions && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm">
            <h3 className="font-bold text-amber-900 mb-1 text-sm tracking-wide">EMERGENCY INSTRUCTIONS</h3>
            <p className="text-amber-950 font-medium text-sm">{profile.emergencyInstructions}</p>
          </div>
        )}

        {medications.length > 0 && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Emergency Medications</h3>
            <div className="space-y-2">
              {medications.map(med => (
                <div key={med.id} className="p-2.5 bg-gray-50 rounded-lg text-sm">
                  <div className="font-bold text-gray-900">{med.name} ({med.dosage})</div>
                  <div className="text-xs text-gray-600">{med.instructions}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {contacts.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 px-1 text-sm uppercase tracking-wide">Emergency Contacts</h3>
            {contacts.map(contact => (
              <a key={contact.id} href={`tel:${contact.phone}`} className="flex items-center gap-4 bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl shadow-md active:scale-95 transition-transform">
                <div className="bg-white/20 p-3 rounded-full">
                  <Phone size={22} />
                </div>
                <div>
                  <div className="font-bold text-base">{contact.name}</div>
                  <div className="text-red-100 text-xs font-medium">{contact.relationship} • {contact.phone}</div>
                </div>
              </a>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button onClick={() => navigate('/qr')} className="bg-slate-900 hover:bg-black text-white p-3.5 rounded-xl font-bold flex justify-center items-center gap-2 shadow-md active:scale-95 transition-all text-sm">
            <QrCode size={18} /> View QR Code
          </button>
          <button onClick={handlePrint} className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-3.5 rounded-xl font-bold flex justify-center items-center gap-2 border border-gray-200 shadow-sm active:scale-95 transition-all text-sm">
            <Printer size={18} /> Print ID Card
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 px-4">
          This Emergency ID provides critical responder information during golden hour care.
        </p>
      </div>
    </div>
  );
};

export default EmergencyIdPage;
