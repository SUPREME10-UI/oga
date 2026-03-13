import { Home, Search, User } from 'lucide-react';

function MobileNav() {
    return (
        <nav className="mobile-nav">
            <div className="mobile-nav-item active">
                <Home size={24} />
                <span>Home</span>
            </div>
            <div className="mobile-nav-item">
                <Search size={24} />
                <span>Explore</span>
            </div>
            <div className="mobile-nav-item">
                <User size={24} />
                <span>Profile</span>
            </div>
        </nav>
    );
}

export default MobileNav;
