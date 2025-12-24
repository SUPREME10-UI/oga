import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AuthModal from './components/auth/AuthModal';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import HirerDashboard from './pages/HirerDashboard';
import LabourerDashboard from './pages/LabourerDashboard';
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

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <Router>
      <Routes>
        <Route element={<MainLayout onOpenAuth={openAuthModal} />}>
          <Route path="/" element={<Home onOpenAuth={openAuthModal} />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/profile/:id" element={<Profile onOpenAuth={openAuthModal} />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['hirer']} />}>
            <Route path="/dashboard/hirer" element={<HirerDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['labourer']} />}>
            <Route path="/dashboard/labourer" element={<LabourerDashboard />} />
          </Route>

          {/* Generic Redirect */}
          <Route path="/dashboard" element={<DashboardRedirect />} />
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
