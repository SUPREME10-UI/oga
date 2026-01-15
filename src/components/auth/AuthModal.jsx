import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [loginError, setLoginError] = useState('');

    const { login, signup, resetPassword } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Sync internal tab state when prop changes
    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab, isOpen]);

    // Automatically close modal when route changes
    useEffect(() => {
        if (isOpen) {
            onClose();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

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

    const handleLogin = async (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        if (!formData.email || !formData.password) {
            setLoginError('Please fill in both email and password fields.');
            return;
        }

        setIsLoading(true);
        setLoginError(''); // Clear previous errors
        try {
            console.log('AuthModal: Logging in with Firebase');
            const userData = await login(formData.email, formData.password);

            if (userData && userData.type) {
                navigate(`/dashboard/${userData.type}`);
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Error during login:', error);

            // Provide user-friendly error messages
            let errorMessage = 'Failed to sign in. ';
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                errorMessage = 'Invalid email or password. Please try again.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed attempts. Please try again later.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Please check your connection.';
            } else {
                errorMessage += error.message;
            }

            setLoginError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };


    const handleSignup = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (accountType === 'labourer') {
            if (!formData.profession || !formData.experience || !formData.bio) {
                alert('Please fill in all labourer details (profession, experience, and bio).');
                return;
            }
        }

        if (!formData.photo) {
            alert('Please upload a profile photo.');
            return;
        }

        const profileData = {
            name: formData.fullName,
            phoneNumber: formData.phoneNumber,
            location: formData.location,
            profession: formData.profession,
            experience: formData.experience,
            bio: formData.bio,
            photo: formData.photo,
            type: accountType,
            rating: 'New',
            reviewCount: 0
        };

        setIsLoading(true);
        try {
            console.log('AuthModal: Creating account with Firebase');
            const userData = await signup(formData.email, formData.password, profileData);

            // Show Success UI
            setNewUserName(formData.fullName);
            setShowSuccess(true);

            // Auto-redirect after 4 seconds
            setTimeout(() => {
                setShowSuccess(false);
                navigate(`/dashboard/${userData.type}`);
            }, 4000);
        } catch (error) {
            console.error('Error during signup:', error);
            alert('Failed to create account: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLegalClick = (path) => {
        onClose();
        navigate(path);
    };

    if (!isOpen) return null;

    return (
        <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div
                className="auth-modal-container"
                onClick={(e) => {
                    // Prevent clicks inside modal from closing it
                    e.stopPropagation();
                }}
            >
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

                                <form
                                    className="auth-form"
                                    onSubmit={handleLogin}
                                >
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

                                    {loginError && (
                                        <div style={{
                                            padding: '0.75rem 1rem',
                                            backgroundColor: '#fee',
                                            border: '1px solid #fcc',
                                            borderRadius: '8px',
                                            color: '#c33',
                                            fontSize: '0.9rem',
                                            marginBottom: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <i className="fas fa-exclamation-circle"></i>
                                            <span>{loginError}</span>
                                        </div>
                                    )}

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
                                        <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); setActiveTab('forgot-password'); }}>Forgot password?</a>
                                    </div>

                                    <button
                                        type="submit"
                                        className={`btn-auth btn-primary btn-auth-medium ${isLoading ? 'loading' : ''}`}
                                        style={{ margin: '0 auto', display: 'block', padding: '0.8rem 2rem', cursor: isLoading ? 'not-allowed' : 'pointer', border: 'none' }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Signing In...' : 'Sign In'}
                                    </button>
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



                        {/* Forgot Password Tab Content */}
                        {activeTab === 'forgot-password' && (
                            <div className="auth-tab-content active">
                                <h2 className="auth-form-title">Reset Password</h2>
                                <p className="auth-form-subtitle">Enter your email and we'll send you a link to reset your password.</p>

                                <form className="auth-form" onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (!formData.email) {
                                        alert('Please enter your email address.');
                                        return;
                                    }

                                    setIsLoading(true);
                                    try {
                                        await resetPassword(formData.email);
                                        setActiveTab('email-sent');
                                    } catch (error) {
                                        console.error('Password reset error:', error);
                                        let errorMessage = 'Failed to send reset email. ';
                                        if (error.code === 'auth/user-not-found') {
                                            errorMessage = 'No account found with this email address.';
                                        } else if (error.code === 'auth/invalid-email') {
                                            errorMessage = 'Invalid email address.';
                                        } else {
                                            errorMessage += error.message;
                                        }
                                        alert(errorMessage);
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}>
                                    <div className="form-group">
                                        <label htmlFor="reset-email">Email</label>
                                        <input
                                            type="email"
                                            id="reset-email"
                                            placeholder="Enter your email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className={`btn-auth btn-primary btn-auth-medium ${isLoading ? 'loading' : ''}`}
                                        style={{ margin: '0 auto', display: 'block', padding: '0.8rem 2rem' }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                                    </button>
                                </form>

                                <p className="login-create-account">
                                    Remember your password?
                                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('login'); }}>Back to Login</a>
                                </p>
                            </div>
                        )}

                        {/* Email Sent Tab Content */}
                        {activeTab === 'email-sent' && (
                            <div className="auth-tab-content active" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', color: 'var(--color-success)', marginBottom: '1.5rem' }}>
                                    <i className="fas fa-paper-plane"></i>
                                </div>
                                <h2 className="auth-form-title">Check Your Email</h2>
                                <p className="auth-form-subtitle">
                                    We've sent a password reset link to: <br />
                                    <strong style={{ color: 'var(--neutral-900)' }}>{formData.email}</strong>
                                </p>

                                <div style={{ background: 'var(--brand-primary-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', margin: '1.5rem 0', color: 'var(--neutral-700)', fontSize: '0.9rem' }}>
                                    <p style={{ margin: 0 }}>Didn't receive the email? Check your spam folder or try resending it.</p>
                                </div>

                                <button
                                    className="btn-auth btn-outline btn-auth-medium"
                                    style={{ margin: '0 auto 1.5rem', display: 'block', padding: '0.6rem 1.5rem', border: '1px solid var(--neutral-300)' }}
                                    onClick={async () => {
                                        try {
                                            await resetPassword(formData.email);
                                            alert('Reset email resent to ' + formData.email);
                                        } catch (error) {
                                            alert('Failed to resend email. Please try again.');
                                        }
                                    }}
                                >
                                    Resend Email
                                </button>

                                <p className="login-create-account">
                                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('login'); }} style={{ fontWeight: '600' }}>
                                        <i className="fas fa-arrow-left" style={{ marginRight: '0.5rem' }}></i>
                                        Back to Login
                                    </a>
                                </p>
                            </div>
                        )}
                        {/* Signup Tab Content */}
                        {activeTab === 'signup' && !showSuccess && (
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
                                        <label htmlFor="fullName">Full Name <span className="required-asterisk">*</span></label>
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
                                        <label htmlFor="signupEmail">Email Address <span className="required-asterisk">*</span></label>
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
                                        <label htmlFor="phoneNumber">Phone Number <span className="required-asterisk">*</span></label>
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
                                        <label htmlFor="location">Location <span className="required-asterisk">*</span></label>
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
                                        <label htmlFor="photo">Profile Photo <span className="required-asterisk">*</span></label>
                                        <div className="photo-upload-container" style={{ border: '1px dashed #ccc', padding: '1rem', borderRadius: '8px', textAlign: 'center', cursor: 'pointer' }}>
                                            <input
                                                type="file"
                                                id="photo"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                style={{ display: 'none' }}
                                                required
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
                                                <label htmlFor="profession">What kind of work do you do? <span className="required-asterisk">*</span></label>
                                                <select
                                                    id="profession"
                                                    className="form-select"
                                                    value={formData.profession}
                                                    onChange={handleInputChange}
                                                    required
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
                                                <label htmlFor="experience">Years of Experience <span className="required-asterisk">*</span></label>
                                                <select
                                                    id="experience"
                                                    className="form-select"
                                                    value={formData.experience}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="">Select experience level</option>
                                                    <option value="0-1">Less than 1 year</option>
                                                    <option value="1-3">1 - 3 years</option>
                                                    <option value="3-5">3 - 5 years</option>
                                                    <option value="5+">5+ years</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="bio">About You (Bio) <span className="required-asterisk">*</span></label>
                                                <textarea
                                                    id="bio"
                                                    placeholder="Briefly describe your skills and work ethic..."
                                                    rows="3"
                                                    style={{ width: '100%', padding: 'var(--space-3)', border: '1px solid var(--neutral-300)', borderRadius: 'var(--radius-md)', outline: 'none', backgroundColor: 'var(--neutral-50)', fontSize: 'var(--text-base)', fontFamily: 'inherit' }}
                                                    value={formData.bio}
                                                    onChange={handleInputChange}
                                                    required
                                                ></textarea>
                                            </div>
                                        </>
                                    )}

                                    <div className="form-group">
                                        <label htmlFor="signupPassword">Password <span className="required-asterisk">*</span></label>
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
                                        <label htmlFor="confirmPassword">Confirm Password <span className="required-asterisk">*</span></label>
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
                                            <span>I agree to the <button type="button" onClick={() => handleLegalClick('/terms')} style={{ color: 'var(--color-primary)', fontWeight: '600', padding: 0, border: 'none', background: 'none', font: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}>Terms</button> and <button type="button" onClick={() => handleLegalClick('/privacy')} style={{ color: 'var(--color-primary)', fontWeight: '600', padding: 0, border: 'none', background: 'none', font: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</button></span>
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        className={`btn-auth btn-primary btn-auth-medium ${isLoading ? 'loading' : ''}`}
                                        style={{ margin: '0 auto', display: 'block' }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Creating Account...' : 'Create Account'}
                                    </button>
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

                        {/* Success State View */}
                        {showSuccess && (
                            <div className="auth-success-view">
                                <div className="success-icon-container">
                                    <div className="success-checkmark">
                                        <i className="fas fa-check"></i>
                                    </div>
                                </div>
                                <h1 className="success-title">Welcome to Oga, {newUserName.split(' ')[0]}!</h1>
                                <p className="success-message">
                                    Your account as a <strong>{accountType}</strong> has been created successfully.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthModal;
