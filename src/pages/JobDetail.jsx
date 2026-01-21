import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/common/ConfirmModal';
import './JobDetail.css';

function JobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { jobs, applyForJob } = useData();
    const { user } = useAuth();

    const [isApplyModalOpen, setIsApplyModalOpen] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);

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

    const handleApply = () => {
        if (!user) {
            alert('Please login as a labourer to apply for this job.');
            return;
        }
        if (user.type !== 'labourer') {
            alert('Only labourers can apply for jobs.');
            return;
        }
        setIsApplyModalOpen(true);
    };

    const confirmApply = () => {
        applyForJob(job.id, user.id, user.name, job.hirerId, job.title);
        setIsApplyModalOpen(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

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

                        <section className="job-section">
                            <h2>Hirer Information</h2>
                            <div className="hirer-profile-card">
                                <div className="hirer-avatar">
                                    <i className="fas fa-user-tie"></i>
                                </div>
                                <div className="hirer-info">
                                    <h3>{job.hirerName || 'User'}</h3>
                                    <p className="hirer-meta">Community Member • Verified Account</p>
                                    {user && user.id !== job.hirerId && (
                                        <button
                                            className="btn-message-hirer"
                                            onClick={() => navigate(`/dashboard/${user.type}/messages`, {
                                                state: {
                                                    chatWith: {
                                                        id: job.hirerId,
                                                        name: job.hirerName || 'Hirer',
                                                        photo: null // We might not have photo here, that's okay
                                                    }
                                                }
                                            })}
                                        >
                                            <i className="fas fa-comment-alt"></i> Message Hirer
                                        </button>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="job-detail-footer">
                        {showSuccess ? (
                            <div className="application-success">
                                <i className="fas fa-check-circle"></i> Application Sent Successfully!
                            </div>
                        ) : (
                            <button className="btn-apply" onClick={handleApply}>
                                Apply for this Job
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                onConfirm={confirmApply}
                title="Apply for this Job?"
                message={`Are you sure you want to apply for "${job.title}"? Your profile will be shared with the hirer.`}
                confirmText="Apply Now"
                cancelText="Not Now"
                type="primary"
            />
        </div>
    );
}

export default JobDetail;
