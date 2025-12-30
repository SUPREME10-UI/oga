import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/common/JobCard';
import './MyJobs.css';

function MyJobs() {
    const { jobs } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();

    // In a real app, we'd filter by user ID. For now, showing all for demo.
    const myJobs = jobs;

    return (
        <div className="dashboard-page-container">
            <header className="page-header">
                <div className="header-left">
                    <h1>My Job Postings</h1>
                    <p>Manage and track your active job listings</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/dashboard/hirer')}>
                    <i className="fas fa-plus"></i> Post New Job
                </button>
            </header>

            <div className="page-content">
                {myJobs.length > 0 ? (
                    <div className="jobs-grid">
                        {myJobs.map(job => (
                            <JobCard key={job.id} job={job} />
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
    );
}

export default MyJobs;
