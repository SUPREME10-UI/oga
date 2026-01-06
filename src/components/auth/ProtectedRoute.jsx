import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user } = useAuth();
    const location = useLocation();

    console.log('ProtectedRoute: checking access for user:', user, 'allowedRoles:', allowedRoles);

    // Fail-safe: Check localStorage if user is null to prevent race conditions during login
    // This allows us to wait for the Context to update instead of immediately redirecting
    const storedUser = !user ? localStorage.getItem('oga_user') : null;

    if (!user) {
        if (storedUser) {
            console.log('ProtectedRoute: waiting for auth context to synchronize...');
            return null; // Or a loading spinner if you prefer
        }

        console.log('ProtectedRoute: No user found, redirecting to /');
        // Redirect to home if not logged in, but save the location they were trying to go to
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.type)) {
        // If user has the wrong role, redirect them to their appropriate dashboard
        return <Navigate to={`/dashboard/${user.type}`} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
