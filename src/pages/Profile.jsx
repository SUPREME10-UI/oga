import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { labourers } from '../services/mockData';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

function Profile({ onOpenAuth }) {
    const { id } = useParams();
    const { user } = useAuth();
    const [labourer, setLabourer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API fetch delay
        setLoading(true);
        const found = labourers.find(l => l.id === parseInt(id));
        // Small timeout to simulate loading (optional, but good for UX feel)
        setTimeout(() => {
            setLabourer(found);
            setLoading(false);
        }, 300);
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    if (!labourer) {
        return (
            <div className="profile-not-found">
                <h2>Labourer not found</h2>
                <Link to="/explore" className="btn-text">Back to Explore</Link>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="container">
                <Link to="/explore" className="back-link">
                    <i className="fas fa-arrow-left"></i> Back to Explore
                </Link>

                <div className="profile-layout">
                    {/* Left Sidebar: Key Info */}
                    <aside className="profile-sidebar">
                        <div className="profile-card">
                            <img src={labourer.image} alt={labourer.name} className="profile-img-large" />

                            <div className="profile-card-content">
                                <div className="profile-verified-badge">
                                    {labourer.verified && (
                                        <>
                                            <i className="fas fa-check-circle"></i> Verified Professional
                                        </>
                                    )}
                                </div>

                                <div className="profile-stats-grid">
                                    <div className="stat-item">
                                        <span className="stat-label">Rate</span>
                                        <span className="stat-value">GH₵{labourer.hourlyRate}/hr</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Experience</span>
                                        <span className="stat-value">{labourer.experience || 'N/A'}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Jobs Completed</span>
                                        <span className="stat-value">{labourer.completedJobs || 0}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Rating</span>
                                        <span className="stat-value">
                                            <i className="fas fa-star" style={{ color: '#ffc107', marginRight: '4px' }}></i>
                                            {labourer.rating}
                                        </span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Location</span>
                                        <span className="stat-value">{labourer.location}</span>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary btn-block"
                                    onClick={() => onOpenAuth ? onOpenAuth('signup') : null}
                                >
                                    Hire {labourer.name.split(' ')[0]}
                                </button>
                                {user?.type === 'hirer' && (
                                    <Link
                                        to="/dashboard/hirer/messages"
                                        state={{ chatWith: { id: labourer.id, name: labourer.name, photo: labourer.image || labourer.photo } }}
                                        className="btn btn-white btn-block"
                                        style={{ textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        Message
                                    </Link>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Main Content: Bio, Skills, Reviews */}
                    <main className="profile-main">
                        <header className="profile-header">
                            <h1 className="profile-name">{labourer.name}</h1>
                            <p className="profile-profession">{labourer.profession}</p>
                        </header>

                        <section className="profile-section">
                            <h3><i className="fas fa-user"></i> About</h3>
                            <p className="profile-bio">{labourer.bio || "No bio provided."}</p>
                        </section>

                        <section className="profile-section">
                            <h3><i className="fas fa-tools"></i> Skills</h3>
                            <div className="profile-skills-list">
                                {labourer.skills.map(skill => (
                                    <span key={skill} className="skill-badge">{skill}</span>
                                ))}
                            </div>
                        </section>

                        <section className="profile-section">
                            <h3><i className="fas fa-star"></i> Reviews ({labourer.reviews})</h3>
                            <div className="reviews-list">
                                {labourer.reviewsList && labourer.reviewsList.length > 0 ? (
                                    labourer.reviewsList.map(review => (
                                        <div key={review.id} className="review-card">
                                            <div className="review-header">
                                                <span className="review-user">{review.user}</span>
                                                <span className="review-date">{review.date}</span>
                                            </div>
                                            <div className="review-rating">
                                                {[...Array(5)].map((_, i) => (
                                                    <i
                                                        key={i}
                                                        className={`fas fa-star ${i < review.rating ? 'active' : ''}`}
                                                    ></i>
                                                ))}
                                            </div>
                                            <p className="review-comment">{review.comment}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-reviews">No detailed reviews yet.</p>
                                )}
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default Profile;
