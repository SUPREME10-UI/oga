import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './JobDetail.css';

function JobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { jobs } = useData();

    const job = jobs.find(j => j.id.toString() === id);

    if (!job) {
        return (
            <div className="job-detail-page">
                <div className="job-detail-container">
                    <button className="btn-back" onClick={() => navigate(-1)}>
                        <i className="fas fa-arrow-left"></i> Back
                    </button>
                    <div className="no-results" style={{ background: '#fff', padding: '3rem', borderRadius: '1rem', textAlign: 'center' }}>
                        <i className="fas fa-search" style={{ fontSize: '3rem', color: 'var(--neutral-300)', marginBottom: '1rem' }}></i>
                        <h2>Job Not Found</h2>
                        <p>Sorry, the job posting you're looking for doesn't exist or has been removed.</p>
                        <button className="btn-nav btn-signup" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/explore')}>
                            Browse Other Jobs
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
        <div className="job-detail-page">
            <div className="job-detail-container">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <i className="fas fa-arrow-left"></i> Back to Explore
                </button>

                <div className="job-detail-card">
                    <div className="job-detail-header">
                        <div className="job-header-main">
                            <div className="job-meta-top">
                                <span className="category-badge">
                                    <i className={getCategoryIcon(job.category)}></i> {job.category}
                                </span>
                                <span className={`status-badge active`}>
                                    {job.status || 'Active'}
                                </span>
                            </div>
                            <h1>{job.title}</h1>
                            <div className="info-content" style={{ fontSize: 'var(--text-base)', color: 'var(--neutral-500)' }}>
                                <i className="fas fa-calendar-alt"></i> Posted on {job.date}
                            </div>
                        </div>
                    </div>

                    <div className="job-detail-body">
                        <section className="job-section">
                            <h2>Project Description</h2>
                            <p className="description-text">{job.description || 'No description provided.'}</p>
                        </section>

                        <section className="job-section">
                            <h2>Key Information</h2>
                            <div className="job-info-grid">
                                <div className="info-box">
                                    <span className="info-label">Location</span>
                                    <span className="info-content">
                                        <i className="fas fa-map-marker-alt"></i> {job.location}
                                    </span>
                                </div>
                                <div className="info-box">
                                    <span className="info-label">Estimated Budget</span>
                                    <span className="info-content" style={{ color: 'var(--brand-primary)', fontWeight: '800' }}>
                                        GH₵ {job.budget}
                                    </span>
                                </div>
                                {job.urgency && (
                                    <div className="info-box">
                                        <span className="info-label">Urgency Level</span>
                                        <span className={`info-content urgency-text ${job.urgency}`}>
                                            <i className="fas fa-exclamation-circle"></i>
                                            <span style={{ textTransform: 'capitalize' }}>{job.urgency}</span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="job-detail-footer">
                        <button className="btn-apply" onClick={() => alert('Application feature coming soon!')}>
                            Apply for this Job
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default JobDetail;
