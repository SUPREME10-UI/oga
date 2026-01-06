import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import './Applications.css';

function Applications() {
    const { applications, updateApplicationStatus, jobs } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Filter applications for the current labourer
    const myApps = applications.filter(app => app.labourerId === user?.id).map(app => {
        const job = jobs.find(j => j.id === app.jobId);
        return { ...app, jobTitle: job?.title || `Job #${app.jobId}` };
    });

    return (
        <div className="dashboard-page-container">
            <header className="page-header">
                <div className="header-left">
                    <h1>My Applications</h1>
                    <p>Track the status of jobs you've applied for</p>
                </div>
            </header>

            <div className="page-content">
                <div className="applications-table-card">
                    <table className="apps-table">
                        <thead>
                            <tr>
                                <th>Job Title</th>
                                <th>Hirer</th>
                                <th>Applied Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myApps.length > 0 ? (
                                myApps.map(app => (
                                    <tr key={app.id}>
                                        <td className="job-title-cell">{app.jobTitle}</td>
                                        <td>{app.labourerName}</td>
                                        <td>{app.date}</td>
                                        <td>
                                            <span className={`status-pill ${app.status.toLowerCase()}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            <button className="btn-view" onClick={() => navigate(`/job/${app.jobId}`)}>View Job</button>
                                            {app.status === 'Accepted' && (
                                                <button
                                                    className="btn-complete"
                                                    onClick={() => updateApplicationStatus(app.id, 'Completed')}
                                                    title="Mark this job as completed to receive earnings"
                                                >
                                                    <i className="fas fa-check-double"></i> Mark Completed
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>You haven't applied for any jobs yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Applications;
