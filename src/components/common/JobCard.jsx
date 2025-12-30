import React from 'react';
import { useNavigate } from 'react-router-dom';
import './JobCard.css';

function JobCard({ job }) {
    const navigate = useNavigate();
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
                    <p className="job-description">{job.description || 'No description provided.'}</p>

                    <div className="job-info-grid">
                        <div className="info-item">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>{job.location}</span>
                        </div>
                        <div className="info-item">
                            <i className="fas fa-calendar-alt"></i>
                            <span>{job.date}</span>
                        </div>
                        {job.urgency && (
                            <div className={`info-item urgency-${job.urgency}`}>
                                <i className="fas fa-exclamation-circle"></i>
                                <span style={{ textTransform: 'capitalize' }}>{job.urgency} Urgency</span>
                            </div>
                        )}
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
                    <button className="btn-apply-now" onClick={() => navigate(`/job/${job.id}`)}>
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
}

export default JobCard;
