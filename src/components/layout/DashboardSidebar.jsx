import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import './DashboardSidebar.css';

export default function DashboardSidebar() {
    const { user } = useAuth();
    const { notifications } = useData();

    const unreadCount = notifications.filter(n => n.userId === user?.id && n.type === 'message' && !n.read).length;

    return (
        <aside className="dashboard-sidebar">
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
                <h3>{user?.name || 'User'}</h3>
                <p>{user?.type === 'hirer' ? 'Hirer Account' : 'Labourer Account'}</p>
            </div>

            <nav className="sidebar-nav">
                <Link to="/dashboard/hirer" className="active"><i className="fas fa-th-large"></i> Overview</Link>
                <Link to="/dashboard/hirer/jobs"><i className="fas fa-briefcase"></i> My Jobs</Link>
                <Link to="/explore"><i className="fas fa-search"></i> Explore</Link>
                <Link to="/dashboard/hirer/messages" className="nav-messages-link">
                    <i className="fas fa-envelope"></i> Messages
                    {unreadCount > 0 && (
                        <span className="sidebar-msg-badge">{unreadCount}</span>
                    )}
                </Link>
                <Link to="/dashboard/hirer/settings"><i className="fas fa-cog"></i> Settings</Link>
            </nav>
        </aside>
    );
}