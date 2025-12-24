import { useState, useEffect } from 'react';
import './Navbar.css';

function Navbar({ onLoginClick, isFluid }) {
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

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className={`nav-container ${isFluid ? 'fluid' : ''}`}>
                <a href="/" className="logo">
                    <i className="fas fa-wrench"></i>
                    <span>Oga</span>
                </a>

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
                    <a href="/" className="nav-link active" onClick={() => setMobileMenuOpen(false)}>Home</a>
                    <a href="#features" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
                    <a href="#how-it-works" className="nav-link" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
                    <a href="#about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>About</a>

                    {/* Mobile Only Buttons */}
                    <div className="mobile-buttons" style={{ display: window.innerWidth <= 768 ? 'flex' : 'none' }}>
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
