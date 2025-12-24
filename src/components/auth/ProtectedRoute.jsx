import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
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
