import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import JobPostModal from '../components/jobs/JobPostModal';
import ConfirmModal from '../components/common/ConfirmModal';
import DashboardSidebar from '../components/layout/DashboardSidebar';
import './HirerDashboard.css';

function HirerDashboard() {
    const [isPostJobValOpen, setIsPostJobValOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [jobToDelete, setJobToDelete] = useState(null);

    const { jobs: allJobs, addJob, updateJob, deleteJob, notifications, markNotificationAsRead, applications } = useData();
    const { user, logout } = useAuth();

    const [showNotifications, setShowNotifications] = useState(false);

    const jobs = allJobs.filter(j => j.hirerId === user?.id || !j.hirerId); // Fallback for initial mock data

    const myNotifications = notifications.filter(n => n.userId === user?.id);
    const unreadCount = myNotifications.filter(n => !n.read).length;

    const activeJobsCount = jobs.filter(j => j.status === 'Active').length;
    const totalAppsCount = applications.filter(app => jobs.some(j => j.id === app.jobId)).length;
    const pendingAppsCount = applications.filter(app => jobs.some(j => j.id === app.jobId) && app.status === 'Pending').length;

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleAddJob = (jobData) => {
        if (editingJob) {
            updateJob(editingJob.id, { ...jobData, hirerId: user.id, hirerName: user.name });
            setEditingJob(null);
        } else {
            addJob(jobData, user.id, user.name);
        }
    };

    const handleDeleteJob = (id) => {
        setJobToDelete(id);
    };

    const confirmDelete = () => {
        if (jobToDelete) {
            deleteJob(jobToDelete);
            setJobToDelete(null);
        }
    };

    const handleEditJob = (job) => {
        setEditingJob(job);
        setIsPostJobValOpen(true);
    };

    const handleCloseModal = () => {
        setIsPostJobValOpen(false);
        setEditingJob(null);
    };

    const handleNotificationClick = (notif) => {
        markNotificationAsRead(notif.id);
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
            <DashboardSidebar />

            <div className="hirer-dashboard-main">
                <header className="dashboard-topbar">
                    <h1>Dashboard</h1>
                    <div className="topbar-actions">
                        <div className="notification-wrapper">
                            <button
                                className={`btn-icon-circle ${unreadCount > 0 ? 'has-unread' : ''}`}
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <i className="fas fa-bell"></i>
                                {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                            </button>

                            {showNotifications && (
                                <div className="notification-dropdown">
                                    <div className="dropdown-header">
                                        <h3>Notifications</h3>
                                        {unreadCount > 0 && <span>{unreadCount} new</span>}
                                    </div>
                                    <div className="notification-list">
                                        {myNotifications.length > 0 ? (
                                            myNotifications.map(notif => (
                                                <div
                                                    key={notif.id}
                                                    className={`notification-item ${!notif.read ? 'unread' : ''}`}
                                                    onClick={() => handleNotificationClick(notif)}
                                                >
                                                    <div className="notif-icon">
                                                        <i className={notif.type === 'application' ? 'fas fa-file-alt' : 'fas fa-info-circle'}></i>
                                                    </div>
                                                    <div className="notif-content">
                                                        <p>{notif.message}</p>
                                                        <span className="notif-time">{notif.time}, {notif.date}</span>
                                                    </div>
                                                    {!notif.read && <div className="unread-dot"></div>}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="no-notifications">
                                                <i className="fas fa-bell-slash"></i>
                                                <p>No notifications yet</p>
                                            </div>
                                        )}
                                    </div>
                                    {myNotifications.length > 0 && (
                                        <div className="dropdown-footer">
                                            <button>View All Notifications</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <button
                            className="btn-post-job"
                            onClick={handleLogout}
                            style={{ backgroundColor: '#fff', color: '#e53e3e', border: '1px solid #fee2e2', marginRight: '10px' }}
                        >
                            <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                        <button className="btn-post-job" onClick={() => setIsPostJobValOpen(true)}>
                            <i className="fas fa-plus"></i> Post New Job
                        </button>
                    </div>
                </header>

                <div className="dashboard-content-container">
                    {/* Stats, Recent listings, Quick actions unchanged */}
                    <section className="stats-grid">
                        <div className="stat-box">
                            <div className="stat-label">Active Jobs</div>
                            <div className="stat-number">{activeJobsCount}</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">Total Applications</div>
                            <div className="stat-number">{totalAppsCount}</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">Pending Review</div>
                            <div className="stat-number">{pendingAppsCount}</div>
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
                                        <div className="action-btns-group">
                                            <button className="btn-action-edit" onClick={() => navigate(`/job/${job.id}`)} title="View Job" style={{ color: 'var(--brand-primary)', backgroundColor: 'var(--brand-primary-subtle)' }}>
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            <button className="btn-action-edit" onClick={() => handleEditJob(job)} title="Edit Job">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button className="btn-action-delete" onClick={() => handleDeleteJob(job.id)} title="Delete Job">
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
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
                onClose={handleCloseModal}
                onJobPost={handleAddJob}
                initialData={editingJob}
            />

            <ConfirmModal
                isOpen={!!jobToDelete}
                onClose={() => setJobToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Job Posting?"
                message="Are you sure you want to delete this job? This action cannot be undone."
                confirmText="Okay"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
}

export default HirerDashboard;