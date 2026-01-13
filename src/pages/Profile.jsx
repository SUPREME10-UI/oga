import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import ReviewModal from '../components/common/ReviewModal';
import './Profile.css';

function Profile({ onOpenAuth }) {
    const { id } = useParams();
    const { user } = useAuth();
    const { labourers } = useData();
    const [labourer, setLabourer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    // 1. Fetch Labourer Details
    useEffect(() => {
        setLoading(true);
        const found = labourers.find(l => String(l.id) === String(id));

        setTimeout(() => {
            setLabourer(found);
            setLoading(false);
        }, 100);
        window.scrollTo(0, 0);
    }, [id, labourers]);

    // 2. Real-time Reviews Listener
    useEffect(() => {
        if (!id) return;

        const qReviews = query(collection(db, 'users', id, 'reviews'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(qReviews, (snapshot) => {
            const fetchedReviews = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setReviews(fetchedReviews);
        });

        return () => unsubscribe();
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

    const isHirer = user?.type === 'hirer';
    const canReview = isHirer && user.uid !== labourer.id;

    return (
        <div className="profile-page">
            {/* Custom Profile Navigation */}
            <nav className="profile-nav">
                <div className="container profile-nav-content">
                    <Link to="/" className="brand-logo">
                        <i className="fas fa-wrench"></i>
                        <span>Oga</span>
                    </Link>
                    <Link to="/explore" className="btn-back">
                        <i className="fas fa-arrow-left"></i> Back
                    </Link>
                </div>
            </nav>

            <div className="container">
                <div className="profile-layout">
                    {/* Left Sidebar: Key Info */}
                    <aside className="profile-sidebar">
                        <div className="profile-card">
                            <div className="profile-hero-bg"></div>
                            <div className="profile-img-container">
                                <img src={labourer.photo || labourer.image} alt={labourer.name} className="profile-img-large" />
                            </div>

                            <div className="profile-card-content">
                                <div className="profile-header-center">
                                    <h1 className="profile-name">{labourer.name}</h1>
                                    <p className="profile-profession">{labourer.profession}</p>

                                    <div className="profile-rating-badge">
                                        <i className="fas fa-star"></i>
                                        <span>{labourer.rating || 0}</span>
                                        <span className="review-count">({labourer.reviewCount || reviews.length} reviews)</span>
                                    </div>
                                </div>

                                <div className="profile-verified-badge">
                                    {labourer.verified ? (
                                        <>
                                            <i className="fas fa-check-circle"></i> Verified Professional
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-user-clock"></i> Member
                                        </>
                                    )}
                                </div>

                                <div className="profile-stats-grid">
                                    <div className="stat-item">
                                        <span className="stat-label">Rate</span>
                                        <span className="stat-value">GH₵{labourer.hourlyRate || 50}/hr</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Location</span>
                                        <span className="stat-value">{labourer.location}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Experience</span>
                                        <span className="stat-value">{labourer.experience || 'N/A'}</span>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary btn-block"
                                    onClick={() => onOpenAuth ? onOpenAuth('signup') : null}
                                >
                                    Hire {labourer.name.split(' ')[0]}
                                </button>
                                {user && user.uid !== labourer.id && (
                                    <>
                                        <Link
                                            to={`/dashboard/${user.type}/messages`}
                                            state={{ chatWith: { id: labourer.id, name: labourer.name, photo: labourer.image || labourer.photo } }}
                                            className="btn btn-white btn-block"
                                            style={{ textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            Message
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Main Content: Bio, Skills, Reviews */}
                    <main className="profile-main">
                        <section className="profile-section">
                            <h3>About</h3>
                            <p className="profile-bio">{labourer.bio || "This user hasn't written a bio yet."}</p>
                        </section>

                        <section className="profile-section">
                            <h3>Skills</h3>
                            <div className="profile-skills-list">
                                {labourer.skills && labourer.skills.map(skill => (
                                    <span key={skill} className="skill-badge">{skill}</span>
                                ))}
                                {(!labourer.skills || labourer.skills.length === 0) && (
                                    <span className="no-skill-badge">No specific skills listed</span>
                                )}
                            </div>
                        </section>

                        <section className="profile-section" id="reviews">
                            <div className="section-head-row">
                                <h3>Reviews ({reviews.length})</h3>
                                {canReview && (
                                    <button
                                        className="btn-write-review"
                                        onClick={() => setIsReviewOpen(true)}
                                    >
                                        <i className="fas fa-pen"></i> Write a Review
                                    </button>
                                )}
                            </div>

                            <div className="reviews-list">
                                {reviews.length > 0 ? (
                                    reviews.map(review => (
                                        <div key={review.id} className="review-card">
                                            <div className="review-header">
                                                <div className="reviewer-info">
                                                    <div className="reviewer-avatar">
                                                        <i className="fas fa-user"></i>
                                                    </div>
                                                    <div>
                                                        <span className="review-user">{review.user}</span>
                                                        <span className="review-date">{review.date}</span>
                                                    </div>
                                                </div>
                                                <div className="review-rating">
                                                    {[...Array(5)].map((_, i) => (
                                                        <i
                                                            key={i}
                                                            className={`fas fa-star ${i < review.rating ? 'active' : ''}`}
                                                        ></i>
                                                    ))}
                                                </div>
                                            </div>
                                            {review.comment && <p className="review-comment">{review.comment}</p>}
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-reviews-state">
                                        <i className="far fa-star"></i>
                                        <p>No reviews yet.</p>
                                        {canReview && <span>Be the first to review this {labourer.profession}!</span>}
                                    </div>
                                )}
                            </div>
                        </section>
                    </main>
                </div>
            </div>

            <ReviewModal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                labourerId={labourer.id}
                reviewerId={user?.uid}
                reviewerName={user?.name}
            />
        </div>
    );
}

export default Profile;
