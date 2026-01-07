import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './JobCard.css';

function JobCard({ job }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isLabourer = user?.type === 'labourer';
    const getCategoryIcon = (category) => {
        switch (category?.toLowerCase()) {
            case 'plumbing': return 'fas fa-wrench';
            case 'electrical': return 'fas fa-bolt';
            case 'painting': return 'fas fa-paint-roller';
            case 'carpentry': return 'fas fa-hammer';
            case 'cleaning': return 'fas fa-broom';
            default: return 'fas fa-briefcase';
        }
    };

    return (
        <div className="job-card">
            {/* Profile Header Section */}
            <div className="job-card-profile-header">
                <div className="hirer-avatar-placeholder">
                    <i className="fas fa-user-tie"></i>
                </div>
            </div>

            <div className="job-card-main">
                <div className="job-card-header">
                    <div className="job-category-tag">
                        <i className={getCategoryIcon(job.category)}></i>
                        <span>{job.category}</span>
                    </div>
                    <div className={`job-status-pill ${job.status?.toLowerCase() || 'active'}`}>
                        {job.status || 'Active'}
                    </div>
                </div>

                <div className="job-card-content">
                    <h3 className="job-title">{job.title}</h3>
                    <div className="job-hirer-summary">
                        <i className="fas fa-user-circle"></i>
                        <span>Posted by <strong>{job.hirerName || 'Oga Hirer'}</strong></span>
                    </div>
                    <p className="job-description">{job.description || 'No description provided.'}</p>

                    <div className="job-info-inline">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{job.location}</span>
                        <span className="separator">•</span>
                        <i className="fas fa-calendar-alt"></i>
                        <span>{job.date}</span>
                    </div>
                </div>

                <div className="job-card-footer">
                    <div className="job-budget-section">
                        <span className="budget-label">Estimated Budget</span>
                        <div className="budget-value">
                            <span className="currency">GH₵</span>
                            <span className="amount">{isNaN(job.budget) ? job.budget : job.budget}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="job-actions-container">
                {isLabourer && (
                    <button
                        className="btn-message-hirer-card"
                        title="Message Hirer"
                        onClick={() => {
                            if (!job.hirerId) {
                                alert("Messaging unavailable: Hirer information not found for this job.");
                                return;
                            }
                            navigate('/dashboard/labourer/messages', {
                                state: {
                                    chatWith: {
                                        name: job.hirerName || 'Oga Hirer',
                                        id: job.hirerId
                                    }
                                }
                            });
                        }}
                    >
                        <i className="fas fa-comment-alt"></i> Message
                    </button>
                )}
                <button className="btn-view-details" onClick={() => navigate(`/job/${job.id}`)}>
                    View Details <i className="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    );
}

export default JobCard;
