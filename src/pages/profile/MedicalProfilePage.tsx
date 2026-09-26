import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMedicalProfile, saveMedicalProfile, MedicalProfile } from '../../services/medicalProfile';
import { useTranslation } from 'react-i18next';
import { Save, AlertCircle } from 'lucide-react';

const MedicalProfilePage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<MedicalProfile>({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const data = await getMedicalProfile(user.uid);
    if (data) setProfile(data);
    setLoading(false);
  };

  const handleChange = (field: keyof MedicalProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleVisibilityChange = (field: string, visible: boolean) => {
    setProfile(prev => ({
      ...prev,
      visibility: { ...(prev.visibility || {}), [field]: visible }
    }));
  };

  const save = async () => {
    if (!user) return;
    await saveMedicalProfile(user.uid, profile);
    setToast('Profile saved successfully!');
    setTimeout(() => setToast(''), 3000);
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Medical Profile</h1>
      
      {/* Personal Info */}
      <section className="bg-white p-4 rounded-xl shadow-sm mb-4">
        <h2 className="text-xl font-semibold mb-4 text-slate-700">Personal Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
            <input type="text" className="w-full border p-2 rounded-lg" value={profile.name || ''} onChange={(e) => handleChange('name', e.target.value)} />
            <VisibilityToggle field="name" visible={!!profile.visibility?.name} onChange={handleVisibilityChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Date of Birth</label>
            <input type="date" className="w-full border p-2 rounded-lg" value={profile.dob || ''} onChange={(e) => handleChange('dob', e.target.value)} />
            <VisibilityToggle field="dob" visible={!!profile.visibility?.dob} onChange={handleVisibilityChange} />
          </div>
        </div>
      </section>

      {/* Blood Info */}
      <section className="bg-white p-4 rounded-xl shadow-sm mb-4">
        <h2 className="text-xl font-semibold mb-4 text-slate-700">Blood Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Blood Group</label>
            <select className="w-full border p-2 rounded-lg" value={profile.bloodGroup || ''} onChange={(e) => handleChange('bloodGroup', e.target.value)}>
              <option value="">Select...</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
            <VisibilityToggle field="bloodGroup" visible={!!profile.visibility?.bloodGroup} onChange={handleVisibilityChange} />
          </div>
        </div>
      </section>

      {/* Emergency Instructions */}
      <section className="bg-white p-4 rounded-xl shadow-sm mb-4">
        <h2 className="text-xl font-semibold mb-4 text-slate-700">Emergency Instructions</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">If I become unconscious, please...</label>
            <textarea className="w-full border p-2 rounded-lg h-32" value={profile.emergencyInstructions || ''} onChange={(e) => handleChange('emergencyInstructions', e.target.value)} />
            <VisibilityToggle field="emergencyInstructions" visible={!!profile.visibility?.emergencyInstructions} onChange={handleVisibilityChange} />
          </div>
        </div>
      </section>

      <button onClick={save} className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-3 rounded-full shadow-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
        <Save size={20} /> Save Profile
      </button>

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};

const VisibilityToggle = ({ field, visible, onChange }: { field: string, visible: boolean, onChange: (f: string, v: boolean) => void }) => (
  <div className="flex items-center gap-2 mt-2">
    <button onClick={() => onChange(field, !visible)} className={`w-12 h-6 rounded-full p-1 transition-colors ${visible ? 'bg-green-500' : 'bg-slate-300'}`}>
      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${visible ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
    <span className="text-xs text-slate-500 flex items-center gap-1">
      <AlertCircle size={12} /> Show on Emergency ID
    </span>
  </div>
);

export default MedicalProfilePage;
