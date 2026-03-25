import { useLocation, Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileNav from './MobileNav';

function MainLayout({ onOpenAuth }) {
    const location = useLocation();

    // Check specific routes
    const isHirerDashboard = location.pathname.startsWith('/dashboard/hirer');
    const isLabourerDashboard = location.pathname.startsWith('/dashboard/labourer');
    const isExplorePage = location.pathname.startsWith('/explore');
    const isProfilePage = location.pathname.startsWith('/profile');

    // Hide Navbar for dashboards, explore page, and profile page
    const showNavbar = !isHirerDashboard && !isLabourerDashboard && !isExplorePage && !isProfilePage;

    // Hide Footer for dashboards and explore page
    const showFooter = !isHirerDashboard && !isLabourerDashboard && !isExplorePage;

    // Use fluid container for Labourer dashboard if it has navbar
    const isFluidNavbar = isLabourerDashboard;

    return (
        <div className="app-container pb-16 md:pb-0">
            {showNavbar && (
                <Navbar
                    onLoginClick={(tab) => onOpenAuth(tab || 'login')}
                    isFluid={isFluidNavbar}
                />
            )}

            <main className="main-content">
                <Outlet />
            </main>

            {showFooter && <Footer />}
            <MobileNav />
        </div>
    );
}

export default MainLayout;
