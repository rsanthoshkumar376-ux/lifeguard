import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Compass, 
  Loader2, 
  ShieldCheck, 
  FileText, 
  Phone, 
  Mail, 
  UserCheck, 
  Droplet 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { registerHospitalFacility, HospitalRecord } from '../../services/hospitalNetworkService';

const HospitalRegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // Facility fields
  const [name, setName] = useState('');
  const [hospitalType, setHospitalType] = useState<HospitalRecord['hospitalType']>('Trauma & Multi-Speciality');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [landlinePhone, setLandlinePhone] = useState('');
  const [emergencyDepartmentAvailable, setEmergencyDepartmentAvailable] = useState(true);
  const [totalBeds, setTotalBeds] = useState(150);
  const [icuBedsAvailable, setIcuBedsAvailable] = useState(12);
  const [hasBloodBank, setHasBloodBank] = useState(true);

  // Admin Account fields
  const [adminStaffName, setAdminStaffName] = useState('');
  const [adminStaffDesignation, setAdminStaffDesignation] = useState('Medical Superintendent');
  const [adminStaffEmail, setAdminStaffEmail] = useState('');
  
  // Document state
  const [licenseDocName, setLicenseDocName] = useState('');
  const [superintendentIdDocName, setSuperintendentIdDocName] = useState('');
  const [locating, setLocating] = useState(false);
  const [lat, setLat] = useState<number>(13.0827);
  const [lng, setLng] = useState<number>(80.2707);

  // Status
  const [loading, setLoading] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const detectedCity = data.address?.city || data.address?.town || data.address?.suburb || '';
            const detectedRoad = data.address?.road || '';
            const detectedPin = data.address?.postcode || '';
            if (detectedCity) setCity(detectedCity);
            if (detectedRoad) setAddress(detectedRoad + (detectedCity ? `, ${detectedCity}` : ''));
            if (detectedPin) setPinCode(detectedPin);
          }
        } catch {
          setCity('Local Area');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        alert('Could not access current GPS position. Please enter city and address manually.');
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter hospital or healthcare center name');
      return;
    }
    if (!licenseNumber.trim()) {
      setErrorMsg('Please provide state registration or clinical establishment license number');
      return;
    }
    if (!adminStaffName.trim() || !adminStaffEmail.trim()) {
      setErrorMsg('Please provide authorized administrator details');
      return;
    }

    setLoading(true);
    try {
      await registerHospitalFacility({
        name: name.trim(),
        hospitalType,
        licenseNumber: licenseNumber.trim(),
        address: address.trim(),
        city: city.trim(),
        pinCode: pinCode.trim(),
        lat,
        lng,
        emergencyPhone: emergencyPhone.trim(),
        landlinePhone: landlinePhone.trim(),
        emergencyDepartmentAvailable,
        totalBeds,
        icuBedsAvailable,
        adminStaffName: adminStaffName.trim(),
        adminStaffEmail: adminStaffEmail.trim(),
        adminStaffDesignation: adminStaffDesignation.trim(),
        hasBloodBank,
        documents: [
          {
            title: licenseDocName || 'Clinical Establishment License Proof',
            fileUrl: '/docs/clinical_establishment_cert.pdf',
            documentType: 'clinical_license'
          },
          {
            title: superintendentIdDocName || 'Medical Superintendent Institutional ID',
            fileUrl: '/docs/superintendent_id.pdf',
            documentType: 'superintendent_id'
          }
        ]
      });

      setSubmittedSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="mr-3 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900 leading-tight">Hospital & Blood Bank Registration</h1>
          <p className="text-xs text-gray-500 font-medium">Join the LifeGuard emergency medical & blood discovery network</p>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-5">
        {submittedSuccess ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 space-y-4 my-6 animate-in fade-in">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Registration Submitted for Verification</h2>
              <p className="text-xs text-gray-600 mt-2 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{adminStaffName}</strong>. Your hospital application for <strong>{name}</strong> (License: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">{licenseNumber}</code>) has been submitted for regulatory review.
              </p>
            </div>

            <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 text-xs text-blue-900 text-left space-y-2">
              <span className="font-black block uppercase tracking-wide text-blue-950">Next Verification Steps:</span>
              <ul className="list-disc list-inside space-y-1">
                <li>State Health Authority & LifeGuard clinical auditors will verify your Clinical Establishment registration.</li>
                <li>Your authorized staff account (<code>{adminStaffEmail}</code>) will receive access credentials upon verification.</li>
                <li>Your 24/7 ER and blood bank facilities will be certified on the public discovery map.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link 
                to="/nearby-hospitals"
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all"
              >
                Return to Directory
              </Link>
              <Link 
                to="/hospital/dashboard"
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition-all"
              >
                Preview Hospital Staff Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Regulatory Notice Banner */}
            <div className="bg-blue-50/90 border border-blue-200 p-4 rounded-3xl text-xs text-blue-900 flex items-start gap-3 shadow-xs">
              <ShieldCheck size={20} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-blue-950 block">Authorized Healthcare Facility Registration</span>
                <p className="leading-relaxed mt-0.5">
                  Only licensed medical centers, accredited hospitals, and drug-controller-approved blood banks may register. All registrations require statutory licensing verification before activation on the public network.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Facility Information */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200/80 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-blue-600" />
                  <h2 className="text-xs font-black text-gray-800 uppercase tracking-wide">1. Facility Profile & Licensing</h2>
                </div>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={locating}
                  className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {locating ? <Loader2 size={12} className="animate-spin" /> : <Compass size={12} />}
                  <span>{locating ? 'Detecting...' : 'Detect GPS'}</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Hospital / Medical Center Name *</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apollo Speciality Hospital"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-bold text-gray-900 focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Hospital Category *</label>
                  <select 
                    value={hospitalType}
                    onChange={(e) => setHospitalType(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-bold text-gray-900 focus:bg-white outline-none"
                  >
                    <option value="Trauma & Multi-Speciality">Trauma & Multi-Speciality</option>
                    <option value="General Hospital">General Hospital</option>
                    <option value="Government Medical College">Government Medical College</option>
                    <option value="Super Speciality">Super Speciality</option>
                    <option value="Emergency Clinic">Emergency Clinic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">State License / Registration No. *</label>
                  <input 
                    type="text" 
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. TN-MED-CHE-2024-098"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-bold text-gray-900 focus:bg-white outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Street Address *</label>
                <textarea 
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Complete campus address and landmark"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs text-gray-900 focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City / District *</label>
                  <input 
                    type="text" 
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Chennai"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-bold text-gray-900 focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">PIN Code *</label>
                  <input 
                    type="text" 
                    required
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="e.g. 600006"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-bold text-gray-900 focus:bg-white outline-none"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Emergency ER Phone *</label>
                  <input 
                    type="tel" 
                    required
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+91 44 2829 0200"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-bold text-gray-900 focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Capacities */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Total Bed Capacity</label>
                  <input 
                    type="number" 
                    value={totalBeds}
                    onChange={(e) => setTotalBeds(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-bold text-gray-900 focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ICU Beds Available</label>
                  <input 
                    type="number" 
                    value={icuBedsAvailable}
                    onChange={(e) => setIcuBedsAvailable(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-bold text-gray-900 focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* 24/7 ER & Blood Bank Toggles */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">24/7 Emergency & Trauma Department</span>
                    <span className="text-[11px] text-gray-500">Facility has round-the-clock attending emergency physicians</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={emergencyDepartmentAvailable}
                    onChange={(e) => setEmergencyDepartmentAvailable(e.target.checked)}
                    className="w-5 h-5 rounded text-red-600 focus:ring-red-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer border-t border-gray-100 pt-3">
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">Licensed On-Site Blood Bank Center</span>
                    <span className="text-[11px] text-gray-500">Facility processes or stores blood components on campus</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={hasBloodBank}
                    onChange={(e) => setHasBloodBank(e.target.checked)}
                    className="w-5 h-5 rounded text-red-600 focus:ring-red-500"
                  />
                </label>
              </div>
            </div>

            {/* 2. Authorized Administrator Account */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200/80 space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <UserCheck size={18} className="text-blue-600" />
                <h2 className="text-xs font-black text-gray-800 uppercase tracking-wide">2. Authorized Administrator Account</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Administrator Full Name *</label>
                  <input 
                    type="text" 
                    required
                    value={adminStaffName}
                    onChange={(e) => setAdminStaffName(e.target.value)}
                    placeholder="e.g. Dr. S. Sundaram, MD"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-bold text-gray-900 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Official Designation *</label>
                  <input 
                    type="text" 
                    required
                    value={adminStaffDesignation}
                    onChange={(e) => setAdminStaffDesignation(e.target.value)}
                    placeholder="e.g. Medical Superintendent"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-bold text-gray-900 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Institutional Email (For Hospital Login) *</label>
                <input 
                  type="email" 
                  required
                  value={adminStaffEmail}
                  onChange={(e) => setAdminStaffEmail(e.target.value)}
                  placeholder="e.g. emergency@apollohospitals.example"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-bold text-gray-900 focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* 3. Verification Documents Proof */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200/80 space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <FileText size={18} className="text-blue-600" />
                <h2 className="text-xs font-black text-gray-800 uppercase tracking-wide">3. Verification Documents Proof</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 text-center space-y-2">
                  <Upload className="mx-auto text-gray-400" size={24} />
                  <span className="text-xs font-bold text-gray-700 block">Clinical Establishment License</span>
                  <input 
                    type="file" 
                    onChange={(e) => setLicenseDocName(e.target.files?.[0]?.name || 'License Certificate Attached')}
                    className="text-xs text-gray-500 w-full"
                  />
                </div>

                <div className="p-4 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 text-center space-y-2">
                  <Upload className="mx-auto text-gray-400" size={24} />
                  <span className="text-xs font-bold text-gray-700 block">Medical Superintendent ID Card</span>
                  <input 
                    type="file" 
                    onChange={(e) => setSuperintendentIdDocName(e.target.files?.[0]?.name || 'Institutional ID Attached')}
                    className="text-xs text-gray-500 w-full"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm shadow-xl active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>TRANSMITTING REGISTRATION DOSSIER...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>SUBMIT HOSPITAL DOSSIER FOR VERIFICATION</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default HospitalRegisterPage;
