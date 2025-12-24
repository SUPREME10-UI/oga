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
                        <a href="#home">Home</a>
                        <a href="#how-it-works">How It Works</a>
                        <a href="#features">Features</a>
                        <a href="#about">About</a>
                    </div>

                    <div className="footer-section">
                        <h3>For Labourers</h3>
                        <a href="#">Sign Up</a>
                        <a href="#">Create Profile</a>
                        <a href="#">Browse Jobs</a>
                        <a href="#">Success Stories</a>
                    </div>

                    <div className="footer-section">
                        <h3>For Hirers</h3>
                        <a href="#">Sign Up</a>
                        <a href="#">Find Labourers</a>
                        <a href="#">Post Jobs</a>
                        <a href="#">Pricing</a>
                    </div>

                    <div className="footer-section">
                        <h3>Support</h3>
                        <a href="#">Help Center</a>
                        <a href="#">Contact Us</a>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>


                </div>
            </div>
        </footer>
    );
}

export default Footer;
