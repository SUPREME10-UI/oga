import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import './LabourerDashboard.css';

function LabourerDashboard() {
    const [activeTab, setActiveTab] = useState('jobs');
    const { jobs } = useData();

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
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
        <div className="dashboard-wrapper">
            <div className="dashboard-sidebar">
                <div className="sidebar-profile">
                    <div className="profile-img-placeholder">
                        {user?.photo ? (
                            <img src={user.photo} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <i className="fas fa-user-circle"></i>
                        )}
                    </div>
                    <h3>{user?.formattedName || user?.name || 'User'}</h3>
                    <p>{user?.profession || 'Labourer'}</p>
                    <div className="profile-rating">
                        <i className="fas fa-star"></i> {user?.rating || 'New'} ({user?.reviewCount || 0} reviews)
                    </div>
                </div>
                <nav className="sidebar-nav">
                    <a href="#" className="active"><i className="fas fa-briefcase"></i> Find Jobs</a>
                    <Link to="/explore"><i className="fas fa-search"></i> Explore</Link>
                    <a href="#"><i className="fas fa-check-circle"></i> My Applications</a>
                    <a href="#"><i className="fas fa-wallet"></i> Earnings</a>
                    <a href="#"><i className="fas fa-user-cog"></i> Profile</a>
                </nav>
            </div>

            <div className="dashboard-main">
                <header className="dashboard-topbar">
                    <h1>Find Work</h1>
                    <div className="header-actions">
                        <span className="status-badge available">Status: Available</span>
                        <button className="btn-icon-circle"><i className="fas fa-bell"></i></button>
                        <button
                            className="btn-icon-circle"
                            onClick={handleLogout}
                            title="Logout"
                            style={{ color: '#e53e3e', border: '1px solid #e53e3e', width: 'auto', padding: '0 15px', borderRadius: '20px', fontSize: '0.9rem' }}
                        >
                            <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </header>

                <section className="dashboard-section">
                    <div className="search-bar-container">
                        <i className="fas fa-search"></i>
                        <input type="text" placeholder="Search for jobs (e.g. Plumbing in Accra)..." />
                        <button className="btn-search">Search</button>
                    </div>

                    <div className="filter-tags">
                        <button className="filter-tag active">All</button>
                        <button className="filter-tag">Plumbing</button>
                        <button className="filter-tag">Electrical</button>
                        <button className="filter-tag">Masonry</button>
                        <button className="filter-tag">Painting</button>
                    </div>
                </section>

                <section className="job-feed">
                    {jobs.length > 0 ? (
                        jobs.map(job => (
                            <div className="job-card" key={job.id}>
                                <div className="job-card-header">
                                    <div className={`job-icon ${job.category || 'other'}`}>
                                        <i className={`fas ${getCategoryIconClass(job.category)}`}></i>
                                    </div>
                                    <div className="job-header-text">
                                        <h3>{job.title}</h3>
                                        <span className="job-location"><i className="fas fa-map-marker-alt"></i> {job.location}</span>
                                    </div>
                                    <span className="job-time">{job.date}</span>
                                </div>
                                <div className="job-body">
                                    <p>{job.description || 'No description provided.'}</p>
                                    <div className="job-tags">
                                        <span><i className="fas fa-tag"></i> ₵{job.budget}</span>
                                        <span><i className="fas fa-info-circle"></i> {job.status}</span>
                                    </div>
                                </div>
                                <div className="job-footer">
                                    <button className="btn-apply">Apply Now</button>
                                    <button className="btn-save"><i className="far fa-heart"></i></button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-jobs-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '12px' }}>
                            <i className="fas fa-clipboard-list" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }}></i>
                            <h3 style={{ color: '#4b5563', marginBottom: '0.5rem' }}>No Jobs Available</h3>
                            <p style={{ color: '#6b7280' }}>There are currently no active job postings. Check back later!</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default LabourerDashboard;
