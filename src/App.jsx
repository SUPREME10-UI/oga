import { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AuthModal from './components/auth/AuthModal';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import HirerDashboard from './pages/HirerDashboard';
import LabourerDashboard from './pages/LabourerDashboard';
import JobDetail from './pages/JobDetail';
import MyJobs from './pages/MyJobs';
import Applications from './pages/Applications';
import Earnings from './pages/Earnings';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import Applicants from './pages/Applicants';
import AllApplicants from './pages/AllApplicants';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import MainLayout from './components/layout/MainLayout';
import './App.css';

import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return <Navigate to={`/dashboard/${user.type}`} replace />;
};

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  const openAuthModal = useCallback((tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  return (
    <Router>
      <Routes>
        <Route element={<MainLayout onOpenAuth={openAuthModal} />}>
          <Route path="/" element={<Home onOpenAuth={openAuthModal} />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/profile/:id" element={<Profile onOpenAuth={openAuthModal} />} />
          <Route path="/job/:id" element={<JobDetail />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['hirer']} />}>
            <Route path="/dashboard/hirer" element={<HirerDashboard />} />
            <Route path="/dashboard/hirer/jobs" element={<MyJobs />} />
            <Route path="/dashboard/hirer/jobs/:jobId/applicants" element={<Applicants />} />
            <Route path="/dashboard/hirer/applicants" element={<AllApplicants />} />
            <Route path="/dashboard/hirer/messages" element={<Messages />} />
            <Route path="/dashboard/hirer/settings" element={<Settings />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['labourer']} />}>
            <Route path="/dashboard/labourer" element={<LabourerDashboard />} />
            <Route path="/dashboard/labourer/applications" element={<Applications />} />
            <Route path="/dashboard/labourer/earnings" element={<Earnings />} />
            <Route path="/dashboard/labourer/messages" element={<Messages />} />
            <Route path="/dashboard/labourer/settings" element={<Settings />} />
          </Route>


          {/* Generic Redirect */}
          <Route path="/dashboard" element={<DashboardRedirect />} />

          {/* Fallback Catch-All - Fixes "pages aren't open" for bad URLs */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialTab={authModalTab}
      />
    </Router>
  );
}

export default App;
