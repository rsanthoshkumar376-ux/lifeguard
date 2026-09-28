import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMedicalProfile, saveMedicalProfile, MedicalProfile } from '../../services/medicalProfile';
import { Save, AlertCircle, Check, Sparkles } from 'lucide-react';
import AiReportModal from '../../components/medical/AiReportModal';
import DobSelector from '../../components/ui/DobSelector';

const MedicalProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MedicalProfile>({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const today = new Date();
  const maxBirthDate18 = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split('T')[0];
  const minBirthDate100 = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate()).toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      // Load from localStorage or defaults for guest mode
      const savedLocal = localStorage.getItem('guest_medical_profile');
      if (savedLocal) {
        try {
          setProfile(JSON.parse(savedLocal));
        } catch (e) {
          // fallback
        }
      } else {
        setProfile({});
      }
      setLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const data = await getMedicalProfile(user.uid);
      if (data) setProfile(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof MedicalProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const save = async () => {
    try {
      if (user) {
        await saveMedicalProfile(user.uid, profile);
        setToast('Medical profile saved to cloud!');
      } else {
        localStorage.setItem('guest_medical_profile', JSON.stringify(profile));
        setToast('Medical profile saved locally! (Sign in to sync)');
      }
      setTimeout(() => setToast(''), 4000);
    } catch (e: any) {
      setToast('Failed to save profile. Please try again.');
      setTimeout(() => setToast(''), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-6">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-bold text-gray-700">Loading Medical Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto pb-28 text-gray-900">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Medical Profile</h1>

      {!user && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-blue-600" />
          <span>You are editing in Demo Mode. Your changes save locally. <a href="/login" className="font-bold underline">Login / Register</a> to sync securely with hospitals.</span>
        </div>
      )}

      {toast && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 p-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-bounce">
          <Check size={18} className="text-green-600" />
          <span>{toast}</span>
        </div>
      )}

            {/* AI Report Auto-fill Banner */}
      <div className="mb-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles size={20} className="text-yellow-300" />
          </div>
          <div>
            <p className="font-black text-sm">Auto-Fill Profile with AI Report</p>
            <p className="text-xs text-blue-100">Upload your PDF or JPG lab test to detect blood group & conditions</p>
          </div>
        </div>
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="bg-white text-blue-900 px-3.5 py-2 rounded-xl text-xs font-black shadow hover:bg-blue-50 active:scale-95 transition-transform shrink-0 ml-3"
        >
          Scan Report
        </button>
      </div>
      {/* Personal Info */}
      <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4 space-y-4">
        <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Personal Information</h2>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
          <input 
            type="text" 
            className="w-full bg-white text-gray-900 font-medium placeholder:text-gray-400 border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
            value={profile.name || ''} 
            onChange={(e) => handleChange('name', e.target.value)} 
            placeholder="e.g. John Doe"
          />
        </div>

        <div className="space-y-4">
          <DobSelector 
            value={profile.dob || ''} 
            onChange={(dobVal) => handleChange('dob', dobVal)} 
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
            <select 
              className="w-full bg-white text-gray-900 font-medium border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
              value={profile.gender || ''} 
              onChange={(e) => handleChange('gender', e.target.value)}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Blood Group</label>
          <select 
            className="w-full bg-white text-gray-900 font-bold border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-red-600" 
            value={profile.bloodGroup || ''} 
            onChange={(e) => handleChange('bloodGroup', e.target.value)}
          >
            <option value="">Select Blood Group</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Critical Medical Info */}
      <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4 space-y-4">
        <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Emergency Details</h2>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Known Allergies (Comma separated)</label>
          <input 
            type="text" 
            className="w-full bg-white text-gray-900 font-medium placeholder:text-gray-400 border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
            value={Array.isArray(profile.allergies) ? profile.allergies.join(', ') : (profile.allergies || '')} 
            onChange={(e) => handleChange('allergies', e.target.value.split(',').map(s => s.trim()))} 
            placeholder="e.g. Penicillin, Peanuts, Sulfa"
          />
        </div>

        {/* Stranger & Pandemic Safety Notice */}
        <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">😷</span>
            <div>
              <label className="block text-sm font-bold text-amber-950">
                Notice for Strangers • Pandemic Safety Note
              </label>
              <p className="text-xs text-amber-800">
                Displayed prominently when strangers or paramedics open your Medical ID during an emergency or pandemic.
              </p>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-amber-900 block mb-1.5">
              Quick 1-Tap Pandemic Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "😷 Wear Mask & Gloves Before Helping", text: "PANDEMIC PRECAUTION: Please wear a mask & gloves before assisting. Call 108 immediately. Patient is immunocompromised." },
                { label: "🫁 Asthma (Non-Contagious) - Inhaler in Pocket", text: "ASTHMA DISTRESS (NOT CONTAGIOUS): Inhaler is in right pocket/bag. Do NOT perform mouth-to-mouth; use compression-only CPR." },
                { label: "🛡️ High Contagion Risk - Protect Patient", text: "HIGH VIRAL RISK: Highly vulnerable patient. Please keep safe distance, sanitize hands, and notify emergency contacts immediately." },
                { label: "🩸 Diabetic Shock - Give Sugar If Awake", text: "DIABETIC EMERGENCY: If conscious, please administer candy or fruit juice from bag. If unconscious, call 108 immediately." },
                { label: "⚠️ Compression-Only CPR", text: "EMERGENCY: Do not perform mouth-to-mouth. Use chest compressions only. Call 108 immediately." }
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChange('pandemicNote', preset.text)}
                  className="text-[11px] bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 px-2 py-1 rounded-lg font-semibold shadow-sm active:scale-95 transition-all text-left"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <textarea 
            rows={3}
            className="w-full bg-white text-gray-900 font-medium placeholder:text-gray-400 border border-amber-300 p-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm" 
            value={profile.pandemicNote || ''} 
            onChange={(e) => handleChange('pandemicNote', e.target.value)} 
            placeholder="e.g. Please wear mask and gloves before physical contact. Inhaler in right bag pocket. Call 108 immediately."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Emergency Instructions for Responders</label>
          <textarea 
            rows={2}
            className="w-full bg-white text-gray-900 font-medium placeholder:text-gray-400 border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
            value={profile.emergencyInstructions || ''} 
            onChange={(e) => handleChange('emergencyInstructions', e.target.value)} 
            placeholder="e.g. Diabetic: Check blood sugar. Carry EpiPen in left bag pocket."
          />
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <input 
            type="checkbox" 
            id="organDonor" 
            checked={!!profile.organDonor} 
            onChange={(e) => handleChange('organDonor', e.target.checked)} 
            className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
          />
          <label htmlFor="organDonor" className="text-sm font-bold text-gray-800 cursor-pointer">
            Pledged Organ Donor (Visible to emergency team)
          </label>
        </div>
      </section>

      <button 
        onClick={save} 
        className="w-full bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white font-bold p-4 rounded-xl flex items-center justify-center gap-2 shadow-lg"
      >
        <Save size={20} /> Save Medical Profile
      </button>
      <AiReportModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} onProfileUpdated={(updated) => { setProfile(prev => ({ ...prev, ...updated })); setToast("Profile updated from AI Report!"); }} />
    </div>
  );
};

export default MedicalProfilePage;
