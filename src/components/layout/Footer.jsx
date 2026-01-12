import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3><i className="fas fa-wrench"></i> Oga</h3>
                        <p>Connecting skilled labourers with opportunities since 2025.</p>
                        <div className="social-links">
                            <a href="#" className="social-link" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                            <a href="#" className="social-link" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                            <a href="#" className="social-link" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                            <a href="#" className="social-link" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h3>Quick Links</h3>
                        <Link to="/">Home</Link>
                        <a href="/#how-it-works">How It Works</a>
                        <a href="/#features">Features</a>
                        <a href="/#about">About</a>
                    </div>

                    <div className="footer-section">
                        <h3>For Labourers</h3>
                        <Link to="/explore">Browse Profile</Link>
                        <a href="/#signup">Sign Up</a>
                        <Link to="/explore">Browse Jobs</Link>
                        <a href="/#about">Success Stories</a>
                    </div>

                    <div className="footer-section">
                        <h3>For Hirers</h3>
                        <a href="/#signup">Sign Up</a>
                        <Link to="/explore">Find Labourers</Link>
                        <Link to="/explore">Post Jobs</Link>
                        <a href="/#features">Pricing</a>
                    </div>

                    <div className="footer-section">
                        <h3>Support</h3>
                        <a href="/#about">Help Center</a>
                        <a href="/#about">Contact Us</a>
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms of Service</Link>
                    </div>

                    <div className="footer-section apps-section">
                        <h3>Get the App</h3>
                        <div className="footer-app-links">
                            <a href="/#home" className="footer-app-btn">
                                <i className="fab fa-google-play"></i>
                                <span>Google Play</span>
                            </a>
                            <a href="/#home" className="footer-app-btn">
                                <i className="fab fa-apple"></i>
                                <span>App Store</span>
                            </a>
                        </div>
                    </div>


                </div>
            </div>
        </footer>
    );
}

export default Footer;
