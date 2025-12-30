import React from 'react';
import './Applications.css';

function Applications() {
    // Mock data for demo
    const apps = [
        { id: 1, jobTitle: "Kitchen Cabinet Repair", hirer: "Abena K.", status: "Pending", date: "Dec 28, 2025" },
        { id: 2, jobTitle: "Electrical Rewiring", hirer: "Kojo B.", status: "Reviewing", date: "Dec 25, 2025" }
    ];

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
                            {apps.map(app => (
                                <tr key={app.id}>
                                    <td className="job-title-cell">{app.jobTitle}</td>
                                    <td>{app.hirer}</td>
                                    <td>{app.date}</td>
                                    <td>
                                        <span className={`status-pill ${app.status.toLowerCase()}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-view">View Job</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Applications;
