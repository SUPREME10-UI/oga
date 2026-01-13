import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/common/JobCard';
import DashboardSidebar from '../components/layout/DashboardSidebar';
import './MyJobs.css';

function MyJobs() {
    // Defensive context usage to avoid runtime crashes if provider is missing
    const authCtx = useAuth() || {};
    const dataCtx = useData() || {};
    const { user } = authCtx;
    const jobs = Array.isArray(dataCtx.jobs) ? dataCtx.jobs : [];
    const navigate = useNavigate();

    const myJobs = jobs.filter(j => j.hirerId === user?.id);

    return (
        <div className="hirer-dashboard-wrapper">
            <DashboardSidebar />

            <div className="hirer-dashboard-main">
                <header className="page-header">
                    <div className="header-side-left" />
                    <div className="header-left">
                        <h1>My Job Postings</h1>
                        <p>Manage and track your active job listings</p>
                    </div>
                    <div className="header-side-right">
                        <button className="btn-primary" onClick={() => navigate('/dashboard/hirer')}>
                            <i className="fas fa-plus"></i> Post New Job
                        </button>
                    </div>
                </header>

                <div className="page-content">
                    {myJobs.length > 0 ? (
                        <div className="jobs-grid">
                            {myJobs.map(job => (
                                <div key={job.id} className="my-job-card-wrapper">
                                    <JobCard job={job} />
                                    <div className="my-job-footer-actions">
                                        <button
                                            className="btn-view-applicants"
                                            onClick={() => navigate(`/dashboard/hirer/jobs/${job.id}/applicants`)}
                                        >
                                            <i className="fas fa-users"></i> View Applicants
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <i className="fas fa-briefcase"></i>
                            </div>
                            <h3>No jobs posted yet</h3>
                            <p>You haven't posted any jobs. Create your first listing to find skilled labourers.</p>
                            <button className="btn-outline" onClick={() => navigate('/dashboard/hirer')}>
                                Post a Job Now
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MyJobs;