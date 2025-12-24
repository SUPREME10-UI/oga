import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import './AuthModal.css';

function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [accountType, setAccountType] = useState('hirer'); // Default to hirer
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        location: '',
        profession: '',
        experience: '',
        bio: '',
        confirmPassword: ''
    });

    const { login, demoLogin } = useAuth();
    const navigate = useNavigate();

    // Sync internal tab state when prop changes
    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab, isOpen]);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    photo: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();

        let type = 'hirer';
        let name = 'Demo User';

        // Exact match for demo accounts
        if (formData.email === 'hirer@oga.com') {
            type = 'hirer';
            name = 'Demo Hirer';
        } else if (formData.email === 'labourer@oga.com') {
            type = 'labourer';
            name = 'Demo Labourer';
        } else {
            // Fallback purely for other testing: mock based on email string
            type = formData.email.includes('labour') ? 'labourer' : 'hirer';
        }

        const userData = {
            email: formData.email,
            name: name,
            type: type,
            id: 'demo-' + Date.now(),
            location: 'Accra, Ghana'
        };

        login(userData);
        onClose();
        navigate(`/dashboard/${type}`);
    };

    const fillDemoCredentials = (role) => {
        if (role === 'hirer') {
            setFormData(prev => ({
                ...prev,
                email: 'hirer@oga.com',
                password: 'password123'
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                email: 'labourer@oga.com',
                password: 'password123'
            }));
        }
    };

    const handleSignup = (e) => {
        e.preventDefault();

        const userData = {
            id: 'user-' + Date.now(),
            name: formData.fullName,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            location: formData.location,
            profession: formData.profession || '',
            experience: formData.experience || '',
            bio: formData.bio || '',
            photo: formData.photo || null,
            type: accountType,
            rating: 'New',
            reviewCount: 0
        };

        login(userData);
        onClose();
        navigate(`/dashboard/${accountType}`);
    };

    if (!isOpen) return null;

    return (
        <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className="auth-modal-container">
                <button className="modal-close" onClick={onClose} aria-label="Close modal">
                    <i className="fas fa-times"></i>
                </button>

                <div className="auth-container">
                    {/* Left Column: Branding */}
                    <div className="auth-branding">
                        <div className="auth-brand-content">
                            <div className="auth-logo">
                                <i className="fas fa-wrench"></i>
                                <h1>Oga</h1>
                            </div>
                            <h2 className="auth-tagline">Connect. Work. Grow.</h2>
                            <p className="auth-description">Join thousands of skilled labourers and hirers building the future together.</p>
                            <div className="auth-features">
                                <div className="auth-feature-item">
                                    <i className="fas fa-check-circle"></i>
                                    <span>Verified Professionals</span>
                                </div>
                                <div className="auth-feature-item">
                                    <i className="fas fa-check-circle"></i>
                                    <span>Secure Payments</span>
                                </div>
                                <div className="auth-feature-item">
                                    <i className="fas fa-check-circle"></i>
                                    <span>24/7 Support</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Forms */}
                    <div className="auth-content">
                        {/* Tab Switcher */}
                        <div className="auth-tabs">
                            <button
                                className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                                onClick={() => setActiveTab('login')}
                            >
                                Login
                            </button>
                            <button
                                className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
                                onClick={() => setActiveTab('signup')}
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Login Tab Content */}
                        {activeTab === 'login' && (
                            <div className="auth-tab-content active">
                                <h2 className="auth-form-title">Welcome Back</h2>
                                <p className="auth-form-subtitle">Sign in to continue to your account</p>

                                <form className="auth-form" onSubmit={handleLogin}>
                                    <div className="form-group">
                                        <label htmlFor="email">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            placeholder="Enter your email"
                                            required
                                            value={formData.email}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="password">Password</label>
                                        <input
                                            type="password"
                                            id="password"
                                            placeholder="Enter your password"
                                            required
                                            value={formData.password}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', marginBottom: '1.5rem' }}>
                                        <label className="checkbox-label" style={{ margin: 0 }}>
                                            <input type="checkbox" />
                                            <span>Remember me</span>
                                        </label>
                                        <a href="#" className="forgot-password">Forgot password?</a>
                                    </div>

                                    <button type="submit" className="btn-auth btn-primary" style={{ width: '100%', margin: 0, padding: '0.8rem 2rem' }}>Sign In</button>
                                </form>

                                <p className="login-create-account">
                                    Don't have an account?
                                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('signup'); }}>Create Account</a>
                                </p>

                                <div className="auth-divider">
                                    <span>Or continue with</span>
                                </div>

                                <div className="social-login">
                                    <button className="social-btn google-btn" type="button">
                                        <i className="fab fa-google"></i>
                                        <span>Google</span>
                                    </button>
                                    <button className="social-btn facebook-btn" type="button">
                                        <i className="fab fa-facebook-f"></i>
                                        <span>Facebook</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Demo Logins Section - Display Actual Credentials */}
                        {activeTab === 'login' && (
                            <div className="demo-login-section" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                <p style={{ fontSize: '0.85rem', color: '#666', textAlign: 'center', marginBottom: '10px', fontWeight: '500' }}>Demo Credentials</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '0.8rem' }}>
                                            <span style={{ fontWeight: '600', display: 'block', color: '#1a202c' }}>Hirer</span>
                                            <span style={{ color: '#4a5568' }}>hirer@oga.com / password123</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => fillDemoCredentials('hirer')}
                                            style={{ background: 'none', border: 'none', color: '#0066cc', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', padding: '4px' }}
                                        >
                                            Auto-fill
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '0.8rem' }}>
                                            <span style={{ fontWeight: '600', display: 'block', color: '#1a202c' }}>Labourer</span>
                                            <span style={{ color: '#4a5568' }}>labourer@oga.com / password123</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => fillDemoCredentials('labourer')}
                                            style={{ background: 'none', border: 'none', color: '#0066cc', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', padding: '4px' }}
                                        >
                                            Auto-fill
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Signup Tab Content */}
                        {activeTab === 'signup' && (
                            <div className="auth-tab-content active">
                                <h2 className="auth-form-title">Create Account</h2>
                                <p className="auth-form-subtitle">Join Oga and start connecting today</p>

                                <form className="auth-form" onSubmit={handleSignup}>
                                    <div className="form-group">
                                        <label htmlFor="accountType">I am a</label>
                                        <div className="account-type-selector">
                                            <label className="account-type-option">
                                                <input
                                                    type="radio"
                                                    name="accountType"
                                                    value="hirer"
                                                    checked={accountType === 'hirer'}
                                                    onChange={(e) => setAccountType(e.target.value)}
                                                />
                                                <div className="account-type-card">
                                                    <i className="fas fa-user-tie"></i>
                                                    <span>Hirer</span>
                                                    <p>I want to hire skilled workers</p>
                                                </div>
                                            </label>
                                            <label className="account-type-option">
                                                <input
                                                    type="radio"
                                                    name="accountType"
                                                    value="labourer"
                                                    checked={accountType === 'labourer'}
                                                    onChange={(e) => setAccountType(e.target.value)}
                                                />
                                                <div className="account-type-card">
                                                    <i className="fas fa-tools"></i>
                                                    <span>Labourer</span>
                                                    <p>I am a skilled labourer</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="fullName">Full Name</label>
                                        <input
                                            type="text"
                                            id="fullName"
                                            placeholder="Enter your full name"
                                            required
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="signupEmail">Email Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            placeholder="Enter your email"
                                            required
                                            value={formData.email}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="phoneNumber">Phone Number</label>
                                        <input
                                            type="tel"
                                            id="phoneNumber"
                                            placeholder="Enter your phone number"
                                            required
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="location">Location</label>
                                        <input
                                            type="text"
                                            id="location"
                                            placeholder="City, Region (e.g., Accra, Greater Accra)"
                                            required
                                            value={formData.location}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    {/* Photo upload for all users */}
                                    <div className="form-group">
                                        <label htmlFor="photo">Profile Photo</label>
                                        <div className="photo-upload-container" style={{ border: '1px dashed #ccc', padding: '1rem', borderRadius: '8px', textAlign: 'center', cursor: 'pointer' }}>
                                            <input
                                                type="file"
                                                id="photo"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                style={{ display: 'none' }}
                                            />
                                            <label htmlFor="photo" style={{ cursor: 'pointer', display: 'block' }}>
                                                {formData.photo ? (
                                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto' }}>
                                                        <img src={formData.photo} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-camera" style={{ fontSize: '1.5rem', color: '#666', marginBottom: '0.5rem' }}></i>
                                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Click to upload profile photo</p>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    {accountType === 'labourer' && (
                                        <>
                                            <div className="form-group" id="professionField">
                                                <label htmlFor="profession">What kind of work do you do?</label>
                                                <select
                                                    id="profession"
                                                    className="form-select"
                                                    value={formData.profession}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">Select your profession</option>
                                                    <option value="Carpenter">Carpenter</option>
                                                    <option value="Electrician">Electrician</option>
                                                    <option value="Plumber">Plumber</option>
                                                    <option value="Mason">Mason</option>
                                                    <option value="Painter">Painter</option>
                                                    <option value="Welder">Welder</option>
                                                    <option value="Mechanic">Mechanic</option>
                                                    <option value="Gardener">Gardener</option>
                                                    <option value="Cleaner">Cleaner</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="experience">Years of Experience</label>
                                                <select
                                                    id="experience"
                                                    className="form-select"
                                                    value={formData.experience}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">Select experience level</option>
                                                    <option value="0-1">Less than 1 year</option>
                                                    <option value="1-3">1 - 3 years</option>
                                                    <option value="3-5">3 - 5 years</option>
                                                    <option value="5+">5+ years</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="bio">About You (Bio)</label>
                                                <textarea
                                                    id="bio"
                                                    placeholder="Briefly describe your skills and work ethic..."
                                                    rows="3"
                                                    style={{ width: '100%', padding: 'var(--space-3)', border: '1px solid var(--neutral-300)', borderRadius: 'var(--radius-md)', outline: 'none', backgroundColor: 'var(--neutral-50)', fontSize: 'var(--text-base)', fontFamily: 'inherit' }}
                                                    value={formData.bio}
                                                    onChange={handleInputChange}
                                                ></textarea>
                                            </div>
                                        </>
                                    )}

                                    <div className="form-group">
                                        <label htmlFor="signupPassword">Password</label>
                                        <input
                                            type="password"
                                            id="password"
                                            placeholder="Create a password"
                                            required
                                            value={formData.password}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="confirmPassword">Confirm Password</label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            placeholder="Confirm your password"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input type="checkbox" required style={{ width: 'auto', margin: 0 }} />
                                            <span>I agree to the <a href="#">Terms</a> and <a href="#">Privacy Policy</a></span>
                                        </label>
                                    </div>

                                    <button type="submit" className="btn-auth btn-primary" style={{ width: '100%' }}>Create Account</button>
                                </form>

                                <div className="auth-divider">
                                    <span>Or sign up with</span>
                                </div>

                                <div className="social-login">
                                    <button className="social-btn google-btn" type="button">
                                        <i className="fab fa-google"></i>
                                        <span>Google</span>
                                    </button>
                                    <button className="social-btn facebook-btn" type="button">
                                        <i className="fab fa-facebook-f"></i>
                                        <span>Facebook</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthModal;
