import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ onLoginClick, isFluid }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrolled]);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
        // Prevent body scroll when menu is open
        document.body.style.overflow = !mobileMenuOpen ? 'hidden' : 'unset';
    };

    const handleNavClick = (hash) => {
        setMobileMenuOpen(false);
        if (location.pathname !== '/') {
            navigate('/', { state: { scrollTo: hash } });
        } else {
            const element = document.getElementById(hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    // Check if link is active
    const isActive = (path) => location.pathname === path;

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className={`nav-container ${isFluid ? 'fluid' : ''}`}>
                <Link to="/" className="logo">
                    <i className="fas fa-wrench"></i>
                    <span>Oga</span>
                </Link>

                {/* Mobile Toggle */}
                <button
                    className={`mobile-toggle ${mobileMenuOpen ? 'open' : ''}`}
                    onClick={toggleMobileMenu}
                    aria-label="Toggle navigation"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Overlay for mobile */}
                {mobileMenuOpen && (
                    <div
                        className="mobile-overlay"
                        onClick={toggleMobileMenu}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.3)',
                            zIndex: 1000
                        }}
                    ></div>
                )}

                <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
                    <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Home</Link>
                    <Link to="/explore" className={`nav-link ${isActive('/explore') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Explore</Link>

                    {/* Hash Links */}
                    {location.pathname === '/' ? (
                        <>
                            <a href="#features" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('features'); }}>Features</a>
                            <a href="#how-it-works" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('how-it-works'); }}>How It Works</a>
                            <a href="#about" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('about'); }}>About</a>
                        </>
                    ) : (
                        <>
                            <Link to="/#features" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Features</Link>
                            <Link to="/#how-it-works" className="nav-link" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
                            <Link to="/#about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>About</Link>
                        </>
                    )}

                    {/* Mobile Only Buttons */}
                    <div className="mobile-buttons">
                        <button className="btn-nav btn-signup" onClick={() => { onLoginClick('signup'); setMobileMenuOpen(false); }}>Get Started</button>
                    </div>
                </div>

                <div className="nav-buttons">
                    <button className="btn-nav btn-signup" onClick={() => onLoginClick('signup')}>Get Started</button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
