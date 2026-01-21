import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/layout/DashboardSidebar';
import './Applications.css';

function Applications() {
    const { applications, updateApplicationStatus, jobs } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [hirerNames, setHirerNames] = useState({});

    // Fetch hirer names from Firestore
    useEffect(() => {
        const fetchHirerNames = async () => {
            const names = {};
            const uniqueHirerIds = [...new Set(jobs.map(j => j.hirerId).filter(Boolean))];

            for (const hirerId of uniqueHirerIds) {
                try {
                    const hirerDoc = await getDoc(doc(db, 'users', hirerId));
                    if (hirerDoc.exists()) {
                        names[hirerId] = hirerDoc.data().name || 'Unknown Hirer';
                    }
                } catch (error) {
                    console.error('Error fetching hirer name:', error);
                }
            }
            setHirerNames(names);
        };

        if (jobs.length > 0) {
            fetchHirerNames();
        }
    }, [jobs]);

    // Filter applications for the current labourer
    const myApps = applications.filter(app => app.labourerId === user?.id).map(app => {
        const job = jobs.find(j => j.id === app.jobId);
        const hirerId = job?.hirerId;
        const hirerName = job?.hirerName || hirerNames[hirerId] || 'Unknown Hirer';

        return {
            ...app,
            jobTitle: job?.title || `Job #${app.jobId}`,
            hirerId,
            hirerName
        };
    });

    const handleMessageHirer = (app) => {
        navigate('/dashboard/labourer/messages', {
            state: {
                chatWith: {
                    id: app.hirerId,
                    name: app.hirerName,
                    photo: null
                }
            }
        });
    };

    return (
        <div className="dashboard-page-container">
            <header className="page-header">
                <div className="header-side-left"></div>
                <div className="header-left">
                    <h1>My Applications</h1>
                    <p>Track the status of jobs you've applied for</p>
                </div>
                <div className="header-side-right">
                    <button className="btn-primary btn-sm" onClick={() => navigate('/dashboard/labourer')}>
                        <i className="fas fa-search"></i> Browse Jobs
                    </button>
                </div>
            </header>

            <div className="page-content">
                <div className="applications-table-card">
                    {myApps.length > 0 ? (
                        <table className="apps-table">
                            <thead>
                                <tr>
                                    <th>Job Details</th>
                                    <th>Hirer</th>
                                    <th>Applied On</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myApps.map(app => (
                                    <tr key={app.id}>
                                        <td className="job-title-cell">
                                            <div style={{ fontWeight: 600, color: 'var(--neutral-900)' }}>{app.jobTitle}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', fontWeight: 400 }}>Ref: #{app.jobId.slice(0, 8)}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neutral-400)' }}>
                                                    <i className="fas fa-user"></i>
                                                </div>
                                                <span>{app.hirerName}</span>
                                            </div>
                                        </td>
                                        <td>{app.date}</td>
                                        <td>
                                            <span className={`status-pill ${app.status.toLowerCase()}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                                            <button className="btn-view" onClick={() => navigate(`/job/${app.jobId}`)}>
                                                View Details
                                            </button>
                                            {app.status === 'Accepted' && (
                                                <button
                                                    className="btn-complete"
                                                    onClick={() => updateApplicationStatus(app.id, 'Completed')}
                                                    title="Mark this job as completed"
                                                >
                                                    <i className="fas fa-check"></i> Done
                                                </button>
                                            )}
                                            <button
                                                className="btn-message"
                                                onClick={() => handleMessageHirer(app)}
                                                title="Message Hirer"
                                            >
                                                <i className="fas fa-envelope"></i> Message
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="no-apps-state">
                            <i className="fas fa-paper-plane"></i>
                            <h3>No applications yet</h3>
                            <p>You haven't applied for any jobs. Explore the latest opportunities and start your journey.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Applications;
