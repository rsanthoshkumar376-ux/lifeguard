import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, ChevronLeft, User, Mail, MapPin, 
  Droplet, Calendar, Check, Camera, Shield, Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const STEPS = ['Personal Info', 'Contact', 'Blood Donation', 'Consent'];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerUser } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: 'Prefer not to say',
    email: '',
    city: '',
    bloodGroup: '',
    willingToDonate: 'No',
    lastDonationDate: '',
    consentData: false,
    consentTerms: false
  });

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const userData = {
        fullName: formData.fullName,
        dateOfBirth: formData.dob,
        gender: formData.gender,
        email: formData.email,
        city: formData.city,
        bloodGroup: formData.bloodGroup,
        donationWillingness: formData.willingToDonate === 'Yes' ? 'yes' : 'no',
        lastDonationDate: formData.lastDonationDate,
        role: 'user'
      };

      await registerUser(userData);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header & Stepper */}
      <div className="bg-white shadow-sm pt-8 pb-4 px-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Registration</h1>
          
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 rounded-full z-0 transition-all duration-300"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            ></div>
            
            {STEPS.map((step, idx) => (
              <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  idx <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {idx < currentStep ? <Check className="w-5 h-5" /> : idx + 1}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-3 text-sm font-medium text-gray-600">
            {STEPS[currentStep]}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-4 max-w-2xl w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-24">
          
          {/* Step 1: Personal Info */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 bg-gray-100 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 relative cursor-pointer hover:bg-gray-50">
                  <Camera className="w-8 h-8" />
                  <span className="absolute -bottom-2 bg-white px-2 text-xs font-medium text-gray-500 rounded-full border shadow-sm">Photo</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={formData.fullName} onChange={e => updateForm('fullName', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter your full name" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="date" value={formData.dob} onChange={e => updateForm('dob', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select value={formData.gender} onChange={e => updateForm('gender', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Contact */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address (Optional)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="email" value={formData.email} onChange={e => updateForm('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="your@email.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={formData.city} onChange={e => updateForm('city', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Chennai" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Blood Group *</label>
                <div className="grid grid-cols-4 gap-3">
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <button key={bg} onClick={() => updateForm('bloodGroup', bg)}
                      className={`py-3 rounded-xl border-2 font-bold text-lg transition-all ${
                        formData.bloodGroup === bg 
                          ? 'border-red-500 bg-red-50 text-red-600' 
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}>
                      {bg}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Blood Donation */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-100 mb-6">
                <Droplet className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Become a Hero</h3>
                <p className="text-sm text-gray-600">Your blood donation can save up to 3 lives. Are you willing to be registered as a donor?</p>
              </div>

              <div className="space-y-3">
                {['Yes', 'No', 'Temporarily unavailable'].map(option => (
                  <label key={option} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${
                    formData.willingToDonate === option ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <input type="radio" name="donor" value={option} 
                      checked={formData.willingToDonate === option}
                      onChange={e => updateForm('willingToDonate', e.target.value)}
                      className="w-5 h-5 text-blue-600" />
                    <span className="ml-3 font-medium text-gray-900">{option}</span>
                  </label>
                ))}
              </div>

              {formData.willingToDonate === 'Yes' && (
                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Donation Date (if any)</label>
                  <input type="date" value={formData.lastDonationDate} onChange={e => updateForm('lastDonationDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              )}
            </div>
          )}

          {/* Step 4: Consent */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3 text-blue-600 mb-4">
                <Shield className="w-6 h-6" />
                <h3 className="font-bold text-lg">Privacy & Consent</h3>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600 space-y-4">
                <p>LifeGuard takes your privacy seriously. Your medical information is encrypted and only shared with verified healthcare providers during emergencies.</p>
                <p>If you registered as a donor, your contact info will only be shared when a verified patient needs your specific blood type.</p>
              </div>

              <div className="space-y-4 pt-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={formData.consentData} onChange={e => updateForm('consentData', e.target.checked)}
                    className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">I consent to the collection and use of my health data for emergency response purposes as described in the Privacy Policy.</span>
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={formData.consentTerms} onChange={e => updateForm('consentTerms', e.target.checked)}
                    className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and confirm that the information provided is accurate.</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation / Actions */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 pb-safe flex justify-between gap-4">
        {currentStep > 0 ? (
          <button onClick={handleBack} className="px-6 py-3.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 flex-1 flex justify-center items-center gap-2 transition-colors">
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
        ) : <div className="flex-1"></div>}
        
        {currentStep < STEPS.length - 1 ? (
          <button 
            onClick={handleNext}
            disabled={
              (currentStep === 0 && (!formData.fullName || !formData.dob)) ||
              (currentStep === 1 && (!formData.city || !formData.bloodGroup))
            }
            className="px-6 py-3.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 flex-[2] flex justify-center items-center gap-2 disabled:opacity-50 transition-colors">
            Continue <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            disabled={loading || !formData.consentData || !formData.consentTerms}
            className="px-6 py-3.5 rounded-xl font-medium text-white bg-green-600 hover:bg-green-700 flex-[2] flex justify-center items-center gap-2 disabled:opacity-50 transition-colors">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Registration'}
          </button>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
