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
const QrCodePage = React.lazy(() => import('./pages/qr/QrCodePage'));
const BloodRequestsPage = React.lazy(() => import('./pages/blood/BloodRequestsPage'));
const BloodRequestDetailPage = React.lazy(() => import('./pages/blood/BloodRequestDetailPage'));
const DonorProfilePage = React.lazy(() => import('./pages/blood/DonorProfilePage'));
const HospitalDashboard = React.lazy(() => import('./pages/hospital/HospitalDashboard'));
const CreateRequestPage = React.lazy(() => import('./pages/hospital/CreateRequestPage'));
const HospitalRegisterPage = React.lazy(() => import('./pages/hospital/HospitalRegisterPage'));
const NearbyHospitalsPage = React.lazy(() => import('./pages/NearbyHospitalsPage'));
const ActivityPage = React.lazy(() => import('./pages/ActivityPage'));
const SettingsPage = React.lazy(() => import('./pages/profile/SettingsPage'));

// Admin pages
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const HospitalVerificationPage = React.lazy(() => import('./pages/admin/HospitalVerificationPage'));
const UserManagementPage = React.lazy(() => import('./pages/admin/UserManagementPage'));
const RequestMonitoringPage = React.lazy(() => import('./pages/admin/RequestMonitoringPage'));

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
    <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
    <p className="text-gray-600 mb-4">Page not found</p>
    <a href="/" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Go Home</a>
  </div>
);

const App: React.FC = () => {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs font-semibold text-gray-500">Loading LifeGuard...</p>
          </div>
        </div>
      }
    >
      <Routes>
        {/* Main App Layout with BottomNav */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/emergency/id" element={<EmergencyIdPage />} />
          <Route path="/emergency/sos" element={<SosPage />} />
          <Route path="/medical-profile" element={<MedicalProfilePage />} />
          <Route path="/medical-records" element={<MedicalRecordsPage />} />
          <Route path="/qr" element={<QrCodePage />} />
          <Route path="/blood/requests" element={<BloodRequestsPage />} />
          <Route path="/blood/requests/:id" element={<BloodRequestDetailPage />} />
          <Route path="/blood/donor-profile" element={<DonorProfilePage />} />
          <Route path="/nearby-hospitals" element={<NearbyHospitalsPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/hospital/register" element={<HospitalRegisterPage />} />
          <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
          <Route path="/hospital/create-request" element={<CreateRequestPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/hospitals" element={<HospitalVerificationPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/requests" element={<RequestMonitoringPage />} />
        </Route>

        {/* Auth & Standalone Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/emergency/view" element={<EmergencyViewPage />} />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </React.Suspense>
  );
};

export default App;
