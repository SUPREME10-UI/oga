import { useLocation, Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function MainLayout({ onOpenAuth }) {
    const location = useLocation();

    // Check specific routes
    const isHirerDashboard = location.pathname.startsWith('/dashboard/hirer');
    const isLabourerDashboard = location.pathname.startsWith('/dashboard/labourer');
    const isExplorePage = location.pathname.startsWith('/explore');

    // Hide Navbar for dashboards and explore page
    const showNavbar = !isHirerDashboard && !isLabourerDashboard && !isExplorePage;

    // Hide Footer for dashboards and explore page
    const showFooter = !isHirerDashboard && !isLabourerDashboard && !isExplorePage;

    // Use fluid container for Labourer dashboard if it has navbar
    const isFluidNavbar = isLabourerDashboard;

    return (
        <div className="app-container">
            {showNavbar && (
                <Navbar
                    onLoginClick={() => onOpenAuth('login')}
                    isFluid={isFluidNavbar}
                />
            )}

            <main className="main-content">
                <Outlet />
            </main>

            {showFooter && <Footer />}
        </div>
    );
}

export default MainLayout;
