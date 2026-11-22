import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';

// Lazy load pages
const Home = React.lazy(() => import('./pages/Home'));
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));
const EmergencyIdPage = React.lazy(() => import('./pages/emergency/EmergencyIdPage'));
const EmergencyViewPage = React.lazy(() => import('./pages/emergency/EmergencyViewPage'));
const SosPage = React.lazy(() => import('./pages/emergency/SosPage'));
const MedicalProfilePage = React.lazy(() => import('./pages/profile/MedicalProfilePage'));
const MedicalRecordsPage = React.lazy(() => import('./pages/profile/MedicalRecordsPage'));
const HealthRecordsPage = React.lazy(() => import('./pages/health/HealthRecordsPage'));
const MedicineTrackerPage = React.lazy(() => import('./pages/meds/MedicineTrackerPage'));
const QrCodePage = React.lazy(() => import('./pages/qr/QrCodePage'));
const BloodRequestsPage = React.lazy(() => import('./pages/blood/BloodRequestsPage'));
const BloodRequestDetailPage = React.lazy(() => import('./pages/blood/BloodRequestDetailPage'));
const DonorProfilePage = React.lazy(() => import('./pages/blood/DonorProfilePage'));
const DonorImpactPage = React.lazy(() => import('./pages/blood/DonorImpactPage'));
const HospitalDashboard = React.lazy(() => import('./pages/hospital/HospitalDashboard'));
const CreateRequestPage = React.lazy(() => import('./pages/hospital/CreateRequestPage'));
const HospitalRegisterPage = React.lazy(() => import('./pages/hospital/HospitalRegisterPage'));
const NearbyHospitalsPage = React.lazy(() => import('./pages/NearbyHospitalsPage'));
const ActivityPage = React.lazy(() => import('./pages/ActivityPage'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'));
const SettingsPage = React.lazy(() => import('./pages/profile/SettingsPage'));
const AiChatPage = React.lazy(() => import('./pages/ai/AiChatPage'));
const ResetAppPage = React.lazy(() => import('./pages/ResetAppPage'));
const FirstAidPage = React.lazy(() => import('./pages/FirstAidPage'));
const FamilyCirclePage = React.lazy(() => import('./pages/family/FamilyCirclePage'));
const SeniorModePage = React.lazy(() => import('./pages/family/SeniorModePage'));
const SecurityCenterPage = React.lazy(() => import('./pages/security/SecurityCenterPage'));

// Admin pages
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const HospitalVerificationPage = React.lazy(() => import('./pages/admin/HospitalVerificationPage'));
const UserManagementPage = React.lazy(() => import('./pages/admin/UserManagementPage'));
const RequestMonitoringPage = React.lazy(() => import('./pages/admin/RequestMonitoringPage'));

import AppUpdatePrompt from './components/common/AppUpdatePrompt';

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
    <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-2xl mx-auto mb-4">
      404
    </div>
    <h1 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h1>
    <p className="text-gray-500 mb-6 text-sm">The emergency screen you are looking for does not exist or has been moved.</p>
    <a href="/" className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold shadow-md hover:bg-red-700 active:scale-95 transition-transform">
      Return to Home
    </a>
  </div>
);

const App: React.FC = () => {
  return (
    <>
      <AppUpdatePrompt />
      <React.Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <div className="text-center p-6 bg-white rounded-2xl shadow-md">
              <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm font-bold text-gray-700">Loading LifeGuard...</p>
            </div>
          </div>
        }
      >
        <Routes>
        {/* Main App Layout with BottomNav */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          
          {/* Medical ID aliases */}
          <Route path="/medical-id" element={<EmergencyIdPage />} />
          <Route path="/emergency/id" element={<EmergencyIdPage />} />
          
          {/* Profile aliases */}
          <Route path="/profile" element={<MedicalProfilePage />} />
          <Route path="/medical-profile" element={<MedicalProfilePage />} />
          <Route path="/medical-records" element={<HealthRecordsPage />} />
          
          {/* Digital Health Records (EHR / PHR) */}
          <Route path="/health-records" element={<HealthRecordsPage />} />
          <Route path="/health" element={<HealthRecordsPage />} />
          <Route path="/records" element={<HealthRecordsPage />} />
          <Route path="/my-health" element={<HealthRecordsPage />} />
          <Route path="/ehr" element={<HealthRecordsPage />} />
          
          {/* Medicine Management & Appointments */}
          <Route path="/medicines" element={<MedicineTrackerPage />} />
          <Route path="/medications" element={<MedicineTrackerPage />} />
          <Route path="/appointments" element={<MedicineTrackerPage />} />
          <Route path="/medicine-tracker" element={<MedicineTrackerPage />} />
          <Route path="/pill-tracker" element={<MedicineTrackerPage />} />
          
          {/* QR Code aliases */}
          <Route path="/qr" element={<QrCodePage />} />
          <Route path="/qr-id" element={<QrCodePage />} />
          
          {/* Blood Requests aliases */}
          <Route path="/blood" element={<BloodRequestsPage />} />
          <Route path="/blood/requests" element={<BloodRequestsPage />} />
          <Route path="/blood-requests" element={<BloodRequestsPage />} />
          <Route path="/blood/requests/:id" element={<BloodRequestDetailPage />} />
          <Route path="/blood-requests/:id" element={<BloodRequestDetailPage />} />
          <Route path="/blood/:id" element={<BloodRequestDetailPage />} />
          
          {/* Donor aliases */}
          <Route path="/blood/donor-profile" element={<DonorProfilePage />} />
          <Route path="/blood-donor" element={<DonorProfilePage />} />
          <Route path="/blood/impact" element={<DonorImpactPage />} />
          <Route path="/blood/achievements" element={<DonorImpactPage />} />
          <Route path="/donor/impact" element={<DonorImpactPage />} />
          
          {/* SOS Emergency aliases */}
          <Route path="/emergency/sos" element={<SosPage />} />
          <Route path="/sos" element={<SosPage />} />

          {/* Offline First-Aid & CPR Center */}
          <Route path="/first-aid" element={<FirstAidPage />} />
          <Route path="/firstaid" element={<FirstAidPage />} />
          <Route path="/cpr" element={<FirstAidPage />} />
          <Route path="/emergency/first-aid" element={<FirstAidPage />} />
          
          {/* Hospitals & Blood Banks */}
          <Route path="/nearby-hospitals" element={<NearbyHospitalsPage />} />
          <Route path="/hospitals" element={<NearbyHospitalsPage />} />
          <Route path="/blood-banks" element={<NearbyHospitalsPage />} />
          <Route path="/blood-bank" element={<NearbyHospitalsPage />} />
          <Route path="/handover" element={<NearbyHospitalsPage />} />
          <Route path="/emergency/handover" element={<NearbyHospitalsPage />} />
          
          {/* Common tabs */}
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/alerts" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/ai-chat" element={<AiChatPage />} />
          <Route path="/assistant" element={<AiChatPage />} />
          <Route path="/ai" element={<AiChatPage />} />
          <Route path="/reset" element={<ResetAppPage />} />
          <Route path="/reset-app" element={<ResetAppPage />} />
          
          {/* Family Health Circle & Caregivers */}
          <Route path="/family" element={<FamilyCirclePage />} />
          <Route path="/family-circle" element={<FamilyCirclePage />} />
          <Route path="/caregivers" element={<FamilyCirclePage />} />
          <Route path="/senior-mode" element={<SeniorModePage />} />
          <Route path="/family/senior" element={<SeniorModePage />} />
          
          {/* Security, Privacy & Compliance */}
          <Route path="/security" element={<SecurityCenterPage />} />
          <Route path="/privacy" element={<SecurityCenterPage />} />
          <Route path="/compliance" element={<SecurityCenterPage />} />
          
          {/* Hospital Staff */}
          <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
          <Route path="/hospital/create-request" element={<CreateRequestPage />} />
          <Route path="/blood-requests/create" element={<CreateRequestPage />} />
          <Route path="/hospital/register" element={<HospitalRegisterPage />} />
          
          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/hospitals" element={<HospitalVerificationPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/requests" element={<RequestMonitoringPage />} />
        </Route>

        {/* Public Standalone Views */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/emergency/view" element={<EmergencyViewPage />} />
        <Route path="/emergency/view/:token" element={<EmergencyViewPage />} />
        
        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </React.Suspense>
    </>
  );
};

export default App;
