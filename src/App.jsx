import { useState, useCallback, useEffect } from 'react';
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
import Bookings from './pages/Bookings';
import Earnings from './pages/Earnings';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import Applicants from './pages/Applicants';
import AllApplicants from './pages/AllApplicants';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
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

  // ── Location permission flow ────────────────────────────────────────────
  // Show modal only if the user hasn't answered before
  const [locationPhase, setLocationPhase] = useState(() =>
    localStorage.getItem('oga_location_asked') ? 'done' : 'pending'
  );
  const [userPosition, setUserPosition] = useState(null);

  function handleAllowLocation() {
    setLocationPhase('locating');
    if (!navigator.geolocation) {
      localStorage.setItem('oga_location_asked', '1');
      setLocationPhase('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        localStorage.setItem('oga_location_asked', '1');
        setLocationPhase('done');
      },
      () => {
        localStorage.setItem('oga_location_asked', '1');
        setLocationPhase('denied');
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  function handleDenyLocation() {
    localStorage.setItem('oga_location_asked', '1');
    setLocationPhase('denied');
  }
  // ───────────────────────────────────────────────────────────────────────

  const openAuthModal = useCallback((tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  return (
    <ErrorBoundary>
      {/* ── Full-page location permission modal ───────────────────────── */}
      {(locationPhase === 'pending' || locationPhase === 'locating') && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
          background: 'rgba(30,20,10,0.60)',
          backdropFilter: 'blur(8px)',
          animation: 'backdrop-in .25s ease',
        }}>
          <style>{`
            @keyframes backdrop-in{from{opacity:0}to{opacity:1}}
            @keyframes modal-in{from{opacity:0;transform:scale(.94) translateY(14px)}to{opacity:1;transform:scale(1) translateY(0)}}
            @keyframes spin-loc{to{transform:rotate(360deg)}}
          `}</style>
          <div style={{
            background: 'oklch(1 0 0)',
            borderRadius: '20px',
            boxShadow: '0 24px 72px rgba(0,0,0,0.30)',
            maxWidth: 360,
            width: '100%',
            overflow: 'hidden',
            animation: 'modal-in .35s cubic-bezier(.34,1.56,.64,1)',
          }}>
            {/* Amber header */}
            <div style={{
              background: 'linear-gradient(135deg, oklch(0.50 0.16 45) 0%, oklch(0.62 0.16 55) 55%, oklch(0.70 0.15 65) 100%)',
              padding: '32px 24px 28px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position:'absolute',top:-32,right:-32,width:100,height:100,borderRadius:'50%',background:'rgba(255,255,255,0.08)' }}/>
              <div style={{ position:'absolute',bottom:-20,left:-20,width:70,height:70,borderRadius:'50%',background:'rgba(255,255,255,0.06)' }}/>
              {locationPhase === 'locating' ? (
                <div style={{ width:64,height:64,borderRadius:'50%',border:'3px solid rgba(255,255,255,0.35)',borderTopColor:'white',animation:'spin-loc .8s linear infinite',margin:'0 auto 14px' }}/>
              ) : (
                <div style={{ width:70,height:70,background:'rgba(255,255,255,0.15)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',border:'2px solid rgba(255,255,255,0.28)' }}>
                  <svg width='34' height='34' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <path d='M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z'/>
                    <circle cx='12' cy='10' r='3'/>
                  </svg>
                </div>
              )}
              <h2 style={{ color:'#fff',fontSize:20,fontWeight:700,margin:'0 0 6px',letterSpacing:'-.3px' }}>
                {locationPhase === 'locating' ? 'Getting your location…' : 'Find Artisans Near You'}
              </h2>
              <p style={{ color:'rgba(255,255,255,0.82)',fontSize:13,margin:0,lineHeight:1.5 }}>
                {locationPhase === 'locating' ? 'Please wait a moment' : 'OgaHub uses your location to show nearby artisans'}
              </p>
            </div>

            {/* Body */}
            {locationPhase !== 'locating' && (
              <div style={{ padding:'22px 24px' }}>
                {[
                  { icon:'🔍', text:'Find skilled artisans in your area' },
                  { icon:'⚡', text:'Get faster connections to local pros' },
                  { icon:'🔒', text:'Your location is never shared publicly' },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:'1px solid oklch(0.88 0.02 75)' }}>
                    <span style={{ fontSize:18,flexShrink:0 }}>{icon}</span>
                    <span style={{ fontSize:12.5,color:'oklch(0.42 0.03 60)',lineHeight:1.4 }}>{text}</span>
                  </div>
                ))}
                <div style={{ display:'flex',flexDirection:'column',gap:9,marginTop:18 }}>
                  <button
                    onClick={handleAllowLocation}
                    style={{ width:'100%',padding:'13px',background:'linear-gradient(135deg,oklch(0.55 0.16 50),oklch(0.65 0.16 58))',color:'#fff',border:'none',borderRadius:11,fontSize:14,fontWeight:600,cursor:'pointer',boxShadow:'0 4px 14px rgba(180,100,20,0.35)' }}
                  >
                    📍 Allow Location Access
                  </button>
                  <button
                    onClick={handleDenyLocation}
                    style={{ width:'100%',padding:'12px',background:'transparent',color:'oklch(0.52 0.03 60)',border:'1.5px solid oklch(0.88 0.02 75)',borderRadius:11,fontSize:13,fontWeight:500,cursor:'pointer' }}
                  >
                    Not now
                  </button>
                </div>
                <p style={{ textAlign:'center',fontSize:11,color:'oklch(0.70 0.02 70)',marginTop:12 }}>
                  You can change this in browser settings anytime
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ──────────────────────────────────────────────────────────────── */}
      <Router>
        <Routes>
          <Route element={<MainLayout onOpenAuth={openAuthModal} />}>
            <Route path="/" element={<Home onOpenAuth={openAuthModal} />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/profile/:id" element={<Profile onOpenAuth={openAuthModal} />} />
            <Route path="/job/:id" element={<JobDetail />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            {/* Fallback Catch-All - Fixes "pages aren't open" for bad URLs */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>

          {/* Dashboard Shell - completely separate from global Website Shell */}
          <Route element={<DashboardLayout />}>
            <Route element={<ProtectedRoute allowedRoles={['hirer']} />}>
              <Route path="/dashboard/hirer" element={<HirerDashboard />} />
              <Route path="/dashboard/hirer/jobs" element={<MyJobs />} />
              <Route path="/dashboard/hirer/jobs/:jobId/applicants" element={<Applicants />} />
              <Route path="/dashboard/hirer/applicants" element={<AllApplicants />} />
              <Route path="/dashboard/hirer/messages" element={<Messages />} />
              <Route path="/dashboard/hirer/bookings" element={<Bookings />} />
              <Route path="/dashboard/hirer/settings" element={<Settings />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['labourer']} />}>
              <Route path="/dashboard/labourer" element={<LabourerDashboard />} />
              <Route path="/dashboard/labourer/applications" element={<Applications />} />
              <Route path="/dashboard/labourer/earnings" element={<Earnings />} />
              <Route path="/dashboard/labourer/messages" element={<Messages />} />
              <Route path="/dashboard/labourer/bookings" element={<Bookings />} />
              <Route path="/dashboard/labourer/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Generic Redirect */}
          <Route path="/dashboard" element={<DashboardRedirect />} />
        </Routes>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          initialTab={authModalTab}
        />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
