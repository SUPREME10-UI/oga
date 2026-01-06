import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LabourerCard.css';

function LabourerCard({ labourer }) {
    const { user } = useAuth();
    const navigate = useNavigate();

    const isHirer = user?.type === 'hirer';
    return (
        <div className="labourer-card">
            <div className="card-header">
                <img src={labourer.photo || labourer.image || 'https://via.placeholder.com/150'} alt={labourer.name} className="labourer-img" />
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

                {labourer.availabilityStatus && (
                    <div className={`availability-banner ${labourer.availabilityStatus.toLowerCase()}`}>
                        <i className={`fas fa-${labourer.availabilityStatus === 'Available' ? 'clock' : 'exclamation-triangle'}`}></i>
                        <span>{labourer.availabilityStatus}</span>
                        {labourer.availabilityNote && <span className="avail-note">- {labourer.availabilityNote}</span>}
                    </div>
                )}

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
                                className="btn-message-circle"
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
                            </button>
                        )}
                        <Link to={`/profile/${labourer.id}`} className="btn-card-action">
                            View Profile
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LabourerCard;
