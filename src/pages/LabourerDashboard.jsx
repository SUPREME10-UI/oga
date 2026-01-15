import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import JobCard from '../components/common/JobCard';
import DashboardSidebar from '../components/layout/DashboardSidebar';
import './LabourerDashboard.css';

function LabourerDashboard() {
    const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' or 'applications'
    const { user, updateUser, logout } = useAuth();
    const { jobs, applications, updateLabourerProfile, notifications, labourers } = useData();

    // Ensure labourer is in the global list when they access dashboard
    useEffect(() => {
        const syncProfile = async () => {
            if (user && user.type === 'labourer' && user.id) {
                const existsInList = labourers.find(l => String(l.id) === String(user.id));
                if (!existsInList) {
                    // Add labourer to the list if they don't exist
                    await updateLabourerProfile(user.id, {
                        id: user.id,
                        name: user.name || 'Labourer',
                        profession: user.profession || 'Labourer',
                        location: user.location || 'Accra, Ghana',
                        photo: user.photo || null,
                        email: user.email || '',
                        availabilityStatus: user.availabilityStatus || 'Available',
                        availabilityNote: user.availabilityNote || '',
                        statusUpdateTime: user.statusUpdateTime || null,
                        rating: user.rating || 0,
                        reviewCount: user.reviewCount || 0,
                        hourlyRate: user.hourlyRate || 50,
                        skills: user.skills || [],
                        verified: user.verified || false
                    });
                    console.log('Added labourer to global list on dashboard load:', user.id);
                }
            }
        };
        syncProfile();
    }, [user, labourers, updateLabourerProfile]);

    const [isAvailabilityEditing, setIsAvailabilityEditing] = useState(false);
    const [availStatus, setAvailStatus] = useState(user?.availabilityStatus || 'Available');
    const [availNote, setAvailNote] = useState(user?.availabilityNote || '');
    const [showNotifications, setShowNotifications] = useState(false);

    const myApplications = applications.filter(app => app.labourerId === user?.id);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSaveAvailability = async () => {
        const statusUpdateTime = new Date().toISOString();

        // Ensure labourer is added to the global list with all required fields
        const labourerData = {
            id: user.id,
            uid: user.id,
            name: user.name || 'Labourer',
            profession: user.profession || 'Labourer',
            location: user.location || 'Accra, Ghana',
            photo: user.photo || null,
            email: user.email || '',
            availabilityStatus: availStatus,
            availabilityNote: availNote,
            statusUpdateTime: statusUpdateTime,
            rating: user.rating || 0,
            reviewCount: user.reviewCount || 0,
            hourlyRate: user.hourlyRate || 50,
            skills: user.skills || [],
            verified: user.verified || false
        };

        // Update global labourers list for Explore page
        await updateLabourerProfile(user.id, labourerData);

        // Update local user state AND Firestore
        try {
            await updateUser({
                availabilityStatus: availStatus,
                availabilityNote: availNote,
                statusUpdateTime: statusUpdateTime
            });
            setIsAvailabilityEditing(false);
            console.log('Status update saved to Firestore and Context:', labourerData);
        } catch (err) {
            console.error('Failed to update status in Firestore:', err);
            alert('Status update failed to sync with server, but updated locally.');
            setIsAvailabilityEditing(false);
        }
    };

    const getCategoryIconClass = (category) => {
        switch (category?.toLowerCase()) {
            case 'plumbing': return 'fa-wrench';
            case 'electrical': return 'fa-bolt';
            case 'masonry': return 'fa-trowel';
            case 'painting': return 'fa-paint-roller';
            case 'carpentry': return 'fa-hammer';
            default: return 'fa-briefcase';
        }
    };

    return (
        <div className="hirer-dashboard-wrapper">
            <DashboardSidebar />
            <div className="hirer-dashboard-main">
                <header className="dashboard-topbar">
                    <div className="topbar-side-left" />
                    <div className="topbar-left">
                        <h1>{activeTab === 'jobs' ? 'Opportunities for You' : 'Application Tracker'}</h1>
                        <p className="topbar-subtitle">
                            {activeTab === 'jobs'
                                ? `Welcome back, ${user?.name}. We found ${jobs.length} jobs matching your skills.`
                                : `You have ${myApplications.length} active applications.`}
                        </p>
                    </div>
                    <div className="topbar-actions">
                        <button
                            className="btn-icon-circle"
                            onClick={() => setShowNotifications(!showNotifications)}
                            style={{ position: 'relative' }}
                        >
                            <i className="fas fa-bell"></i>
                            {notifications.filter(n => !n.read && n.userId === user?.id).length > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: '#ef4444',
                                    borderRadius: '50%',
                                    border: '2px solid white'
                                }}></span>
                            )}
                        </button>
                        <button
                            className="btn-post-job"
                            onClick={handleLogout}
                            style={{ backgroundColor: '#fff', color: '#e53e3e', border: '1px solid #fee2e2' }}
                        >
                            <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </header>

                {/* Notification Panel */}
                {showNotifications && (
                    <div style={{
                        position: 'absolute',
                        top: '80px',
                        right: '20px',
                        width: '350px',
                        maxHeight: '400px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Notifications</h3>
                            <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                            {notifications.filter(n => n.userId === user?.id).length > 0 ? (
                                notifications
                                    .filter(n => n.userId === user?.id)
                                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                    .slice(0, 10)
                                    .map(notif => (
                                        <div
                                            key={notif.id}
                                            style={{
                                                padding: '1rem',
                                                borderBottom: '1px solid #f3f4f6',
                                                backgroundColor: notif.read ? 'white' : '#f0f9ff',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => {
                                                if (notif.type === 'message') {
                                                    navigate('/dashboard/labourer/messages');
                                                }
                                                setShowNotifications(false);
                                            }}
                                        >
                                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    backgroundColor: notif.type === 'message' ? '#dbeafe' : '#fef3c7',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    <i className={`fas fa-${notif.type === 'message' ? 'envelope' : 'bell'}`} style={{ color: notif.type === 'message' ? '#3b82f6' : '#f59e0b' }}></i>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#111827', fontWeight: notif.read ? 400 : 600 }}>{notif.message}</p>
                                                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                                                        {new Date(notif.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                                    <i className="fas fa-bell-slash" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></i>
                                    <p style={{ margin: 0 }}>No notifications yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}


                <div className="dashboard-content-container">
                    <section className="status-posting-area">
                        <div className="status-card-header">
                            <div className="user-mini-info">
                                <div className="mini-avatar">
                                    {user?.photo ? <img src={user.photo} alt="" /> : <i className="fas fa-user-circle"></i>}
                                </div>
                                <div className="mini-text">
                                    <h3>Ready for your next gig?</h3>
                                    <p>Post your current status to stand out to hirers.</p>
                                </div>
                            </div>
                            <button
                                className={`btn-post-status ${isAvailabilityEditing ? 'active' : ''}`}
                                onClick={() => setIsAvailabilityEditing(!isAvailabilityEditing)}
                            >
                                {isAvailabilityEditing ? 'Discard Update' : 'Post Status Update'}
                            </button>
                        </div>

                        {isAvailabilityEditing ? (
                            <div className="status-form-wrapper">
                                <div className="status-form-grid">
                                    <div className="status-input-group">
                                        <label>Availability</label>
                                        <div className="status-radio-group">
                                            {['Available', 'Busy', 'Away'].map(status => (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    className={`radio-btn ${availStatus === status ? 'selected' : ''} ${status.toLowerCase()}`}
                                                    onClick={() => setAvailStatus(status)}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="status-input-group">
                                        <label>What are you working on? (Optional)</label>
                                        <textarea
                                            placeholder="e.g. Just finished a plumbing job in Legon, free for new projects tomorrow!"
                                            value={availNote}
                                            onChange={(e) => setAvailNote(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="status-form-footer">
                                    <p className="hint-text"><i className="fas fa-info-circle"></i> This status will be pinned to your profile on the Explore page.</p>
                                    <button className="btn-publish-status" onClick={handleSaveAvailability}>
                                        Publish Update
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="current-status-display">
                                <div className={`status-pill-large ${availStatus.toLowerCase()}`}>
                                    <i className={`fas fa-${availStatus === 'Available' ? 'check-circle' : availStatus === 'Busy' ? 'clock' : 'moon'}`}></i>
                                    {availStatus}
                                </div>
                                {availNote && (
                                    <div className="status-note-bubble">
                                        <i className="fas fa-quote-left"></i>
                                        <p>{availNote}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {activeTab === 'jobs' ? (
                        <>
                            <section className="job-feed">
                                {jobs.length > 0 ? (
                                    <div className="labourers-grid">
                                        {jobs.map(job => (
                                            <JobCard key={job.id} job={job} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-jobs-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '12px' }}>
                                        <i className="fas fa-clipboard-list" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }}></i>
                                        <h3 style={{ color: '#4b5563', marginBottom: '0.5rem' }}>No Jobs Available</h3>
                                        <p style={{ color: '#6b7280' }}>There are currently no active job postings. Check back later!</p>
                                    </div>
                                )}
                            </section>
                        </>
                    ) : (
                        <section className="applications-section">
                            <div className="applications-list">
                                {myApplications.length > 0 ? (
                                    myApplications.map(app => (
                                        <div className="application-item-card" key={app.id}>
                                            <div className="app-main">
                                                <div className="app-info">
                                                    <h4>Application for Job #{app.jobId}</h4>
                                                    <p className="app-date">Applied on {app.date}</p>
                                                </div>
                                                <div className={`app-status-badge ${app.status.toLowerCase()}`}>
                                                    {app.status}
                                                </div>
                                            </div>
                                            <div className="app-footer">
                                                <button className="btn-view-job" onClick={() => navigate(`/job/${app.jobId}`)}>View Job Details</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-apps-state">
                                        <i className="fas fa-paper-plane"></i>
                                        <h3>No Applications Yet</h3>
                                        <p>Browse jobs and start applying to see them here!</p>
                                        <button className="btn-browse" onClick={() => setActiveTab('jobs')}>Browse Jobs</button>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LabourerDashboard;
