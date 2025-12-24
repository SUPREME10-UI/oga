import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import JobPostModal from '../components/jobs/JobPostModal';
import './HirerDashboard.css';

function HirerDashboard() {
    const [isPostJobValOpen, setIsPostJobValOpen] = useState(false);

    // Use data from context instead of local mock state
    const { jobs: allJobs, addJob } = useData();
    // Filter to only show jobs created by this hirer (or for demo, maybe all jobs if we want simple testing, but better to simulate "My Jobs")
    // For this simple demo without real user IDs linking, let's just show all jobs or assume they are mine since I just posted them. 
    // To make it cleaner, let's filter by nothing for now or just show all.
    // Actually, good practice: "My Jobs" should just be all jobs in this simple context.
    const jobs = allJobs;

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleAddJob = (newJob) => {
        addJob(newJob);
        // Date and Id are handled in context
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
        <div className="hirer-dashboard-wrapper">
            <div className="dashboard-sidebar">
                <div className="sidebar-logo">
                    <i className="fas fa-wrench"></i> Oga
                </div>
                <div className="sidebar-profile">
                    <div className="profile-img-placeholder">
                        {user?.photo ? (
                            <img src={user.photo} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <i className="fas fa-user-tie"></i>
                        )}
                    </div>
                    <h3>{user?.name || 'Hirer'}</h3>
                    <p>Hirer Account</p>
                </div>
                <nav className="sidebar-nav">
                    <a href="#" className="active"><i className="fas fa-th-large"></i> Overview</a>
                    <a href="#"><i className="fas fa-briefcase"></i> My Jobs</a>
                    <Link to="/explore"><i className="fas fa-search"></i> Explore</Link>
                    <a href="#"><i className="fas fa-envelope"></i> Messages</a>
                    <a href="#"><i className="fas fa-cog"></i> Settings</a>
                </nav>
            </div>

            <div className="hirer-dashboard-main">
                <header className="dashboard-topbar">
                    <h1>Dashboard</h1>
                    <div className="topbar-actions">
                        <button className="btn-icon-circle"><i className="fas fa-bell"></i></button>
                        <button
                            className="btn-post-job"
                            onClick={handleLogout}
                            style={{ backgroundColor: '#fff', color: '#e53e3e', border: '1px solid #e53e3e', marginRight: '10px' }}
                        >
                            <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                        <button className="btn-post-job" onClick={() => setIsPostJobValOpen(true)}>
                            <i className="fas fa-plus"></i> Post New Job
                        </button>
                    </div>
                </header>

                <div className="dashboard-content-container">
                    <section className="stats-grid">
                        <div className="stat-box">
                            <div className="stat-label">Active Jobs</div>
                            <div className="stat-number">{jobs.length}</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">Applications</div>
                            <div className="stat-number">12</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">In Review</div>
                            <div className="stat-number">5</div>
                        </div>
                    </section>

                    <section className="dashboard-section">
                        <div className="section-head">
                            <h2>Your Recent Listings</h2>
                            <a href="#" className="view-all">View All</a>
                        </div>
                        <div className="listings-list">
                            {jobs.map(job => (
                                <div className="listing-item" key={job.id}>
                                    <div className="listing-img">
                                        <i className={getCategoryIcon(job.category)}></i>
                                    </div>
                                    <div className="listing-details">
                                        <h4>{job.title}</h4>
                                        <div className="listing-meta">
                                            <span><i className="fas fa-map-marker-alt"></i> {job.location}</span>
                                            <span><i className="fas fa-clock"></i> {job.date}</span>
                                        </div>
                                        <div className="listing-price">{isNaN(job.budget) ? job.budget : `₵${job.budget}`}</div>
                                    </div>
                                    <div className="listing-actions">
                                        <span className={`badge ${job.status === 'Active' ? 'active' : 'review'}`}>{job.status}</span>
                                        <button className="btn-icon"><i className="fas fa-ellipsis-v"></i></button>
                                    </div>
                                </div>
                            ))}

                            {jobs.length === 0 && (
                                <div className="no-listings">
                                    <p>No active jobs. Post a job to get started!</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="dashboard-section">
                        <div className="section-head">
                            <h2>Quick Actions</h2>
                        </div>
                        <div className="action-buttons">
                            <Link to="/explore" className="quick-action-btn">
                                <i className="fas fa-search"></i>
                                <span>Find Labourers</span>
                            </Link>
                            <button className="quick-action-btn" onClick={() => setIsPostJobValOpen(true)}>
                                <i className="fas fa-plus-circle"></i>
                                <span>Post Job</span>
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            <JobPostModal
                isOpen={isPostJobValOpen}
                onClose={() => setIsPostJobValOpen(false)}
                onJobPost={handleAddJob}
            />
        </div>
    );
}

export default HirerDashboard;
