import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Show loading state while Firebase determines auth status
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <div>Loading...</div>
            </div>
        );
    }

    if (!user) {
        console.log('ProtectedRoute: No user found, redirecting to /');
        // Redirect to home if not logged in, but save the location they were trying to go to
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.type)) {
        console.log(`ProtectedRoute: User type ${user.type} not allowed for roles:`, allowedRoles);
        // If user has the wrong role, redirect them to their appropriate dashboard
        return <Navigate to={`/dashboard/${user.type}`} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
