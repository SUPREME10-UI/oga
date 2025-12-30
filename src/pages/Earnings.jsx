import React from 'react';
import './Earnings.css';

function Earnings() {
    const history = [
        { id: 1, job: "Tap Repair", amount: 150, date: "Dec 20, 2025", status: "Completed" },
        { id: 2, job: "Socket Replacement", amount: 200, date: "Dec 15, 2025", status: "Completed" }
    ];

    return (
        <div className="dashboard-page-container">
            <header className="page-header">
                <div className="header-left">
                    <h1>Earnings</h1>
                    <p>Manage your income and payout history</p>
                </div>
                <button className="btn-primary">
                    <i className="fas fa-money-bill-wave"></i> Withdraw GH₵ 350
                </button>
            </header>

            <div className="earnings-stats-grid">
                <div className="econ-stat-box">
                    <span className="econ-label">Total Earnings</span>
                    <span className="econ-value">GH₵ 1,200</span>
                </div>
                <div className="econ-stat-box">
                    <span className="econ-label">Pending Clearances</span>
                    <span className="econ-value highlight">GH₵ 150</span>
                </div>
                <div className="econ-stat-box">
                    <span className="econ-label">Jobs Completed</span>
                    <span className="econ-value">8</span>
                </div>
            </div>

            <div className="activity-card">
                <h2>Recent Transactions</h2>
                <div className="transaction-list">
                    {history.map(item => (
                        <div key={item.id} className="transaction-item">
                            <div className="trans-info">
                                <strong>{item.job}</strong>
                                <span>{item.date}</span>
                            </div>
                            <div className="trans-amount">
                                + GH₵ {item.amount}
                                <span className="trans-status">{item.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Earnings;
