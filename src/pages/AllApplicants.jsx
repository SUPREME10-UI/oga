import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/layout/DashboardSidebar';
import './AllApplicants.css';

function AllApplicants() {
    const { applications, jobs, updateApplicationStatus } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Get all applications for jobs posted by this hirer
    const hirerJobs = jobs.filter(j => j.hirerId === user?.id);
    const hirerJobIds = hirerJobs.map(j => j.id);
    const hirerApplications = applications.filter(app => hirerJobIds.includes(app.jobId));

    const handleStatusUpdate = (appId, status) => {
        updateApplicationStatus(appId, status);
    };

    const getJobTitle = (jobId) => {
        const job = jobs.find(j => j.id === jobId);
        return job?.title || `Job #${jobId}`;
    };

    return (
        <div className="hirer-dashboard-wrapper">
            <DashboardSidebar />
            <div className="hirer-dashboard-main">
                <div className="dashboard-page-container all-applicants-page">
                    <header className="page-header">
                        <div className="header-left">
                            <h1>All Applicants</h1>
                            <p>Manage applicants for all your job postings</p>
                        </div>
                    </header>

                    <div className="page-content">
                        {hirerApplications.length > 0 ? (
                            <div className="applicants-table-wrapper">
                                <table className="applicants-table">
                                    <thead>
                                        <tr>
                                            <th>Labourer Name</th>
                                            <th>Job Title</th>
                                            <th>Applied On</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {hirerApplications.map(app => (
                                            <tr key={app.id}>
                                                <td>
                                                    <div className="labourer-cell">
                                                        <div className="avatar-small">{app.labourerName?.charAt(0)}</div>
                                                        <span>{app.labourerName}</span>
                                                    </div>
                                                </td>
                                                <td>{getJobTitle(app.jobId)}</td>
                                                <td>{app.date}</td>
                                                <td>
                                                    <span className={`status-badge ${app.status.toLowerCase()}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="actions-cell">
                                                        <button
                                                            className="btn-view-profile"
                                                            onClick={() => navigate(`/profile/${app.labourerId}`)}
                                                        >
                                                            View Profile
                                                        </button>
                                                        {app.status === 'Pending' && (
                                                            <>
                                                                <button
                                                                    className="btn-accept-small"
                                                                    onClick={() => handleStatusUpdate(app.id, 'Accepted')}
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    className="btn-reject-small"
                                                                    onClick={() => handleStatusUpdate(app.id, 'Rejected')}
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {app.status !== 'Pending' && (
                                                            <button
                                                                className="btn-message-small"
                                                                onClick={() => navigate('/dashboard/hirer/messages', { state: { chatWith: { id: app.labourerId, name: app.labourerName } } })}
                                                            >
                                                                Message
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <i className="fas fa-user-slash"></i>
                                <h3>No applicants yet</h3>
                                <p>Once labourers apply for your jobs, they will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AllApplicants;
