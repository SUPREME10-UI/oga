import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import JobCard from '../components/common/JobCard';
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
                            <i className="fas fa-user-circle"></i>
                        )}
                    </div>
                    <h3>{user?.formattedName || user?.name || 'User'}</h3>
                    <p>{user?.profession || 'Labourer'}</p>
                    <div className="profile-rating">
                        <i className="fas fa-star" style={{ color: '#ecc94b' }}></i> {user?.rating || 'New'} ({user?.reviewCount || 0} reviews)
                    </div>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard/labourer" className="active"><i className="fas fa-briefcase"></i> Find Jobs</Link>
                    <Link to="/explore"><i className="fas fa-search"></i> Explore</Link>
                    <Link to="/dashboard/labourer/applications"><i className="fas fa-check-circle"></i> My Applications</Link>
                    <Link to="/dashboard/labourer/earnings"><i className="fas fa-wallet"></i> Earnings</Link>
                    <Link to="/dashboard/labourer/messages"><i className="fas fa-envelope"></i> Messages</Link>
                    <Link to="/dashboard/labourer/settings"><i className="fas fa-cog"></i> Settings</Link>
                </nav>
            </div>

            <div className="hirer-dashboard-main">
                <header className="dashboard-topbar">
                    <h1>Find Work</h1>
                    <div className="topbar-actions">
                        <span className="status-badge available">Status: Available</span>
                        <button className="btn-icon-circle"><i className="fas fa-bell"></i></button>
                        <button
                            className="btn-icon-circle"
                            onClick={handleLogout}
                            title="Logout"
                            style={{ color: '#e53e3e', border: '1px solid #fee2e2', background: '#fff', width: 'auto', padding: '0 15px', borderRadius: '10px' }}
                        >
                            <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </header>

                <div className="dashboard-content-container">

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
                </div>
            </div>
        </div>
    );
}

export default LabourerDashboard;
