import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/layout/DashboardSidebar';
import './Applicants.css';

function Applicants() {
    const { jobId } = useParams();
    const { applications, jobs, updateApplicationStatus } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();

    const job = jobs.find(j => j.id === parseInt(jobId));
    const jobApplicants = applications.filter(app => app.jobId === parseInt(jobId));

    const handleStatusUpdate = (appId, status) => {
        updateApplicationStatus(appId, status);
    };

    if (!job) return <div className="applicants-page">Job not found.</div>;

    return (
        <div className="hirer-dashboard-wrapper">
            <DashboardSidebar />
            <div className="hirer-dashboard-main">
                <div className="dashboard-page-container applicants-page">
            <header className="page-header">
                <div className="header-left">
                    <h1>Applicants for "{job.title}"</h1>
                    <p>{jobApplicants.length} people have applied for this position</p>
                </div>
            </header>

            <div className="page-content">
                <div className="applicants-grid">
                    {jobApplicants.length > 0 ? (
                        jobApplicants.map(app => (
                            <div key={app.id} className="applicant-card">
                                <div className="applicant-info">
                                    <div className="applicant-avatar">
                                        <i className="fas fa-user"></i>
                                    </div>
                                    <div className="applicant-details">
                                        <h3>{app.labourerName}</h3>
                                        <p className="applied-date">Applied on {app.date}</p>
                                        <span className={`status-badge ${app.status.toLowerCase()}`}>{app.status}</span>
                                    </div>
                                </div>
                                <div className="applicant-actions">
                                    <button className="btn-profile" onClick={() => navigate(`/profile/${app.labourerId}`)}>
                                        View Profile
                                    </button>
                                    {app.status === 'Pending' && (
                                        <div className="status-actions">
                                            <button className="btn-accept" onClick={() => handleStatusUpdate(app.id, 'Accepted')}>
                                                Accept
                                            </button>
                                            <button className="btn-reject" onClick={() => handleStatusUpdate(app.id, 'Rejected')}>
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                    {app.status !== 'Pending' && (
                                        <button
                                            className="btn-message"
                                            onClick={() => navigate('/dashboard/hirer/messages', { state: { chatWith: { id: app.labourerId, name: app.labourerName } } })}
                                        >
                                            Send Message
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-applicants">
                            <i className="fas fa-user-slash"></i>
                            <h3>No applicants yet</h3>
                            <p>Once labourers apply for this job, they will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
                </div>
            </div>
        </div>
    );
}

export default Applicants;
