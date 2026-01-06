import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user } = useAuth();
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);

    console.log('ProtectedRoute: checking access for user:', user, 'allowedRoles:', allowedRoles);

    // Wait a moment for context to sync after login
    useEffect(() => {
        if (!user) {
            const storedUser = localStorage.getItem('oga_user');
            if (storedUser) {
                // Give the context a moment to sync
                const timer = setTimeout(() => {
                    setIsChecking(false);
                }, 100);
                return () => clearTimeout(timer);
            } else {
                setIsChecking(false);
            }
        } else {
            setIsChecking(false);
        }
    }, [user]);

    // Show loading state while checking
    if (isChecking) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <div>Loading...</div>
            </div>
        );
    }

    // Fail-safe: Check localStorage if user is null to prevent race conditions during login
    const storedUser = !user ? localStorage.getItem('oga_user') : null;
    let currentUser = user;

    // If user is null but localStorage has user data, parse it temporarily
    if (!currentUser && storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            console.log('ProtectedRoute: Using stored user from localStorage:', currentUser);
        } catch (error) {
            console.error('ProtectedRoute: Error parsing stored user:', error);
        }
    }

    if (!currentUser) {
        console.log('ProtectedRoute: No user found, redirecting to /');
        // Redirect to home if not logged in, but save the location they were trying to go to
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.type)) {
        // If user has the wrong role, redirect them to their appropriate dashboard
        return <Navigate to={`/dashboard/${currentUser.type}`} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
