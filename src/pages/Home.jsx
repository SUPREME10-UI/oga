import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DownloadModal from '../components/common/DownloadModal';
import './Home.css';

function Home({ onOpenAuth }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [downloadModal, setDownloadModal] = useState({ isOpen: false, store: null });
    const location = useLocation();

    // Handle scroll to hash from navigation
    useEffect(() => {
        if (location.state && location.state.scrollTo) {
            const element = document.getElementById(location.state.scrollTo);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location]);

    const slides = [
        "url('images/carpenter.png')",
        "url('images/electrician.png')",
        "url('images/plumber.png')"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Simple scroll reveal effect
    useEffect(() => {
        const reveal = () => {
            const reveals = document.querySelectorAll('.scroll-reveal');
            for (let i = 0; i < reveals.length; i++) {
                const windowHeight = window.innerHeight;
                const elementTop = reveals[i].getBoundingClientRect().top;
                const elementVisible = 100;
                if (elementTop < windowHeight - elementVisible) {
                    reveals[i].classList.add('active');
                }
            }
        };
        window.addEventListener('scroll', reveal);
        reveal(); // Trigger once on load
        return () => window.removeEventListener('scroll', reveal);
    }, []);

    const openDownloadModal = (store) => {
        setDownloadModal({ isOpen: true, store });
    };

    const closeDownloadModal = () => {
        setDownloadModal({ isOpen: false, store: null });
    };

    return (
        <>
            {/* Hero Section */}
            <section className="hero" id="home">
                <div className="hero-slideshow">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`slide ${index === currentSlide ? 'active' : ''}`}
                            style={{ backgroundImage: slide }}
                        ></div>
                    ))}
                </div>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1>Connect with <span className="highlight">Skilled Artisans</span> Instantly</h1>
                    <p className="hero-subtitle">
                        Find the right person for your job or showcase your skills to get hired.
                        Professional, verified, and ready to work.
                    </p>
                    <div className="hero-buttons">
                        <button
                            className="hero-btn primary"
                            onClick={() => onOpenAuth('signup')}
                        >
                            <span>I'm Hiring</span>
                            <i className="fas fa-arrow-right"></i>
                        </button>
                        <button
                            className="hero-btn secondary"
                            onClick={() => onOpenAuth('signup')}
                        >
                            <span>I'm Looking for Work</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="section" id="features">
                <div className="container">
                    <div className="section-header scroll-reveal">
                        <h2 className="section-title">Why Choose Oga?</h2>
                        <p className="section-description">The trusted platform for connecting skilled workers with opportunities.</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card scroll-reveal">
                            <div className="feature-icon"><i className="fas fa-user-check"></i></div>
                            <h3 className="feature-title">Verified Professionals</h3>
                            <p className="feature-description">
                                All labourers are deeply vetted with skills verification and background checks.
                            </p>
                        </div>

                        <div className="feature-card scroll-reveal">
                            <div className="feature-icon"><i className="fas fa-bolt"></i></div>
                            <h3 className="feature-title">Instant Matching</h3>
                            <p className="feature-description">
                                Get matched with the right talent quickly instead of waiting days for quotes.
                            </p>
                        </div>

                        <div className="feature-card scroll-reveal">
                            <div className="feature-icon"><i className="fas fa-briefcase"></i></div>
                            <h3 className="feature-title">Diverse Skills</h3>
                            <p className="feature-description">
                                From carpentry to plumbing, electrical work to masonry - experts in every trade.
                            </p>
                        </div>

                        <div className="feature-card scroll-reveal">
                            <div className="feature-icon"><i className="fas fa-comments"></i></div>
                            <h3 className="feature-title">Easy Communication</h3>
                            <p className="feature-description">
                                Direct messaging between hirers and labourers makes coordination simple and transparent.
                            </p>
                        </div>

                        <div className="feature-card scroll-reveal">
                            <div className="feature-icon"><i className="fas fa-star"></i></div>
                            <h3 className="feature-title">Rating System</h3>
                            <p className="feature-description">
                                Make informed decisions with ratings and reviews from previous completed jobs.
                            </p>
                        </div>

                        <div className="feature-card scroll-reveal">
                            <div className="feature-icon"><i className="fas fa-lock"></i></div>
                            <h3 className="feature-title">Secure & Safe</h3>
                            <p className="feature-description">
                                Your data and payments are protected with industry-standard security measures.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="section alt" id="how-it-works">
                <div className="container">
                    <div className="section-header scroll-reveal">
                        <h2 className="section-title">How It Works</h2>
                        <p className="section-description">Getting started is simple for both hirers and labourers</p>
                    </div>

                    <div className="steps-grid">
                        <div className="step-card scroll-reveal">
                            <div className="step-number">01</div>
                            <h3 className="step-title">Create Account</h3>
                            <p className="feature-description">Sign up as a Hirer to post jobs, or as a Labourer to showcase your skills.</p>
                        </div>

                        <div className="step-card scroll-reveal">
                            <div className="step-number">02</div>
                            <h3 className="step-title">Connect & Match</h3>
                            <p className="feature-description">Browse profiles, send job offers, or accept requests that match your expertise.</p>
                        </div>

                        <div className="step-card scroll-reveal">
                            <div className="step-number">03</div>
                            <h3 className="step-title">Get Work Done</h3>
                            <p className="feature-description">Agree on details, complete the job, and leave a review to build trust.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="section" id="about">
                <div className="container">
                    <div className="section-header scroll-reveal">
                        <h2 className="section-title">About Oga</h2>
                        <p className="section-description">Bridging the gap between skilled workers and opportunities</p>
                    </div>

                    <div className="scroll-reveal about-text">
                        <p>
                            Oga is a modern platform designed to connect hirers with skilled labourers across various trades.
                            Whether you're a carpenter, electrician, plumber, or any other skilled professional, Oga helps you
                            find work opportunities that match your expertise.
                        </p>
                        <br />
                        <p>
                            For hirers, we make it easy to find reliable, verified professionals for your projects. Browse
                            profiles, check ratings, and connect directly with the right person for the job.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <div className="container">
                <section className="cta-section scroll-reveal">
                    <h2>Ready to Get Started?</h2>
                    <p>Join thousands of hirers and labourers already using Oga</p>
                    <div className="cta-buttons">
                        <button className="hero-btn secondary" onClick={() => onOpenAuth('signup')}>Find Labourers</button>
                        <button className="hero-btn primary" onClick={() => onOpenAuth('signup')}>Sign Up as Labourer</button>
                    </div>
                    <div className="cta-download-section">
                        <p className="cta-download-text">Or download our mobile app</p>
                        <div className="app-download-links">
                            <button
                                className="app-download-btn"
                                aria-label="Download on Google Play Store"
                                onClick={() => openDownloadModal('google')}
                            >
                                <i className="fab fa-google-play"></i>
                                <div className="app-btn-text">
                                    <span className="app-btn-label">Get it on</span>
                                    <span className="app-btn-name">Google Play</span>
                                </div>
                            </button>
                            <button
                                className="app-download-btn"
                                aria-label="Download on Apple App Store"
                                onClick={() => openDownloadModal('apple')}
                            >
                                <i className="fab fa-apple"></i>
                                <div className="app-btn-text">
                                    <span className="app-btn-label">Download on the</span>
                                    <span className="app-btn-name">App Store</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            <DownloadModal
                isOpen={downloadModal.isOpen}
                onClose={closeDownloadModal}
                store={downloadModal.store}
            />
        </>
    );
}

export default Home;
