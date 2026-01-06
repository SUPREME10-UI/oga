import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import './Earnings.css';

function Earnings() {
    const { applications, jobs } = useData();
    const { user } = useAuth();

    // Filter completed applications for the current labourer
    const completedJobs = applications
        .filter(app => app.labourerId === user?.id && app.status === 'Completed')
        .map(app => {
            const job = jobs.find(j => j.id === app.jobId);
            return {
                id: app.id,
                jobTitle: job?.title || `Job #${app.jobId}`,
                amount: parseInt(job?.budget) || 0,
                date: app.date,
                status: app.status
            };
        });

    // Calculate stats
    const totalEarnings = completedJobs.reduce((sum, job) => sum + job.amount, 0);
    const jobsCompletedCount = completedJobs.length;

    // For now, pending can be Accepted jobs (work in progress)
    const pendingJobs = applications
        .filter(app => app.labourerId === user?.id && app.status === 'Accepted')
        .map(app => {
            const job = jobs.find(j => j.id === app.jobId);
            return parseInt(job?.budget) || 0;
        });
    const pendingClearance = pendingJobs.reduce((sum, amount) => sum + amount, 0);

    return (
        <div className="dashboard-page-container">
            <header className="page-header">
                <div className="header-left">
                    <h1>Earnings</h1>
                    <p>Manage your income and payout history</p>
                </div>
                <button className="btn-primary" disabled={totalEarnings === 0}>
                    <i className="fas fa-money-bill-wave"></i> Withdraw GH₵ {totalEarnings}
                </button>
            </header>

            <div className="earnings-stats-grid">
                <div className="econ-stat-box">
                    <span className="econ-label">Total Earnings</span>
                    <span className="econ-value">GH₵ {totalEarnings.toLocaleString()}</span>
                </div>
                <div className="econ-stat-box">
                    <span className="econ-label">Pending Clearances</span>
                    <span className="econ-value highlight">GH₵ {pendingClearance.toLocaleString()}</span>
                </div>
                <div className="econ-stat-box">
                    <span className="econ-label">Jobs Completed</span>
                    <span className="econ-value">{jobsCompletedCount}</span>
                </div>
            </div>

            <div className="activity-card">
                <h2>Recent Transactions</h2>
                <div className="transaction-list">
                    {completedJobs.length > 0 ? (
                        completedJobs.map(item => (
                            <div key={item.id} className="transaction-item">
                                <div className="trans-info">
                                    <strong>{item.jobTitle}</strong>
                                    <span>{item.date}</span>
                                </div>
                                <div className="trans-amount">
                                    + GH₵ {item.amount.toLocaleString()}
                                    <span className="trans-status completed">{item.status}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-earnings-state">
                            <i className="fas fa-receipt"></i>
                            <p>No transactions yet.</p>
                            <span>Complete your first job to see your earnings here!</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Earnings;
