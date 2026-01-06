import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LabourerCard.css';

function LabourerCard({ labourer }) {
    const [imgError, setImgError] = useState(false);

    const formatStatusTime = (timestamp) => {
        if (!timestamp) return 'Just now';

        const now = new Date();
        const updateTime = new Date(timestamp);
        const diffInSeconds = Math.floor((now - updateTime) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
        }
        if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        }
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    };
    const { user } = useAuth();
    const navigate = useNavigate();

    const isHirer = user?.type === 'hirer';
    const profileImg = labourer.photo || labourer.image;

    return (
        <div className="labourer-card">
            <div className="card-header">
                {!imgError && profileImg ? (
                    <img
                        src={profileImg}
                        alt={labourer.name}
                        className="labourer-img"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="labourer-img-placeholder">
                        <i className="fas fa-user"></i>
                    </div>
                )}
                {labourer.verified && (
                    <span className="verified-badge" title="Verified Professional">
                        <i className="fas fa-check-circle"></i>
                    </span>
                )}
            </div>

            <div className="card-body">
                <div className="labourer-info-top">
                    <div className="name-verify">
                        <h3 className="labourer-name">{labourer.name}</h3>
                        {labourer.verified && <i className="fas fa-check-circle verified-icon"></i>}
                    </div>
                    <span className="labourer-profession">{labourer.profession}</span>
                </div>

                {/* Professional Status Update Section - Simplified & Integrated */}
                {labourer.availabilityStatus && (
                    <div className="status-highlight-section">
                        <div className="status-header-row">
                            <div className="status-avatar-mini">
                                {profileImg ? (
                                    <img src={profileImg} alt={labourer.name} />
                                ) : (
                                    <i className="fas fa-user-circle"></i>
                                )}
                            </div>
                            <div className={`status-badge-pill ${labourer.availabilityStatus.toLowerCase()}`}>
                                <i className={`fas fa-${labourer.availabilityStatus === 'Available' ? 'check-circle' : labourer.availabilityStatus === 'Busy' ? 'clock' : 'moon'}`}></i>
                                {labourer.availabilityStatus}
                            </div>
                            <span className="status-time">
                                <i className="fas fa-history"></i>
                                {labourer.statusUpdateTime ? formatStatusTime(labourer.statusUpdateTime) : 'Recent'}
                            </span>
                        </div>

                        {labourer.availabilityNote && (
                            <div className="status-note-content">
                                <p>{labourer.availabilityNote}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Meta data - Always visible now for consistency */}
                <div className="labourer-meta">
                    <div className="meta-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{labourer.location}</span>
                    </div>
                    <div className="meta-item rating">
                        <i className="fas fa-star"></i>
                        <span>{labourer.rating || 0}</span>
                        <span className="review-count">({labourer.reviewCount || labourer.reviews || 0} reviews)</span>
                    </div>
                </div>

                <div className="labourer-skills">
                    {(labourer.skills || []).slice(0, 3).map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                    ))}
                </div>

                <div className="card-footer">
                    <div className="hourly-rate">
                        <span className="currency">GH₵</span>
                        <span className="amount">{labourer.hourlyRate}</span>
                        <span className="period">/hr</span>
                    </div>
                    <div className="card-actions">
                        {isHirer && (
                            <button
                                className="btn-card-action primary"
                                title="Message Labourer"
                                onClick={() => navigate('/dashboard/hirer/messages', {
                                    state: {
                                        chatWith: {
                                            id: labourer.id,
                                            name: labourer.name,
                                            photo: labourer.photo || labourer.image
                                        }
                                    }
                                })}
                            >
                                <i className="fas fa-comment-dots"></i>
                                Message
                            </button>
                        )}
                        <Link to={`/profile/${labourer.id}`} className={`btn-card-action ${isHirer ? 'secondary' : 'primary'}`}>
                            View Profile
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LabourerCard;
