import { NavLink } from 'react-router-dom';
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
                <NavLink to={`/dashboard/${user?.type}`} end>
                    <i className="fas fa-th-large"></i> <span>Overview</span>
                </NavLink>
                {user?.type === 'hirer' ? (
                    <>
                        <NavLink to="/dashboard/hirer/jobs">
                            <i className="fas fa-briefcase"></i> <span>My Jobs</span>
                        </NavLink>
                        <NavLink to="/dashboard/hirer/applicants">
                            <i className="fas fa-users"></i> <span>Applicants</span>
                        </NavLink>
                    </>
                ) : (
                    <>
                        <NavLink to="/dashboard/labourer/applications">
                            <i className="fas fa-file-alt"></i> <span>Applications</span>
                        </NavLink>
                    </>
                )}
                <NavLink to="/explore">
                    <i className="fas fa-search"></i> <span>Explore</span>
                </NavLink>
                <NavLink to={`/dashboard/${user?.type}/messages`} className="nav-messages-link">
                    <i className="fas fa-envelope"></i> <span>Messages</span>
                    {unreadCount > 0 && (
                        <span className="sidebar-msg-badge">{unreadCount}</span>
                    )}
                </NavLink>
                <NavLink to={`/dashboard/${user?.type}/settings`}>
                    <i className="fas fa-cog"></i> <span>Settings</span>
                </NavLink>
            </nav>
        </aside>
    );
}