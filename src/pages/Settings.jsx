import React from 'react';
import './Settings.css';

function Settings() {
    return (
        <div className="dashboard-page-container">
            <header className="page-header">
                <div className="header-left">
                    <h1>Account Settings</h1>
                    <p>Manage your profile, security, and notifications</p>
                </div>
            </header>

            <div className="settings-grid">
                <section className="settings-section card">
                    <h2><i className="fas fa-user-circle"></i> Profile Information</h2>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" defaultValue="Demo User" />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" defaultValue="demo@oga.com" />
                    </div>
                </section>

                <section className="settings-section card">
                    <h2><i className="fas fa-shield-alt"></i> Security</h2>
                    <button className="btn-outline">Change Password</button>
                    <div className="toggle-group" style={{ marginTop: '1.5rem' }}>
                        <span>Enable Two-Factor Authentication</span>
                        <input type="checkbox" />
                    </div>
                </section>

                <section className="settings-section card">
                    <h2><i className="fas fa-bell"></i> Notifications</h2>
                    <div className="toggle-group">
                        <span>Email Notifications</span>
                        <input type="checkbox" defaultChecked />
                    </div>
                    <div className="toggle-group">
                        <span>New Job Alerts</span>
                        <input type="checkbox" defaultChecked />
                    </div>
                </section>
            </div>

            <div className="settings-actions">
                <button className="btn-primary">Save Changes</button>
            </div>
        </div>
    );
}

export default Settings;
