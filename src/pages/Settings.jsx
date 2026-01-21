import React, { useState, useEffect, useRef } from 'react';
import DashboardSidebar from '../components/layout/DashboardSidebar';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

function Settings() {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
        type: 'hirer',
        settings: {
            twoFactorEnabled: false,
            notifications: {
                email: true,
                jobAlerts: true
            }
        }
    });

    const [avatarPreview, setAvatarPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [passwordState, setPasswordState] = useState({ current: '', newPass: '', confirm: '' });
    const fileRef = useRef(null);

    // Initialize form from user
    useEffect(() => {
        if (!user) return;
        setForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            location: user.location || '',
            bio: user.bio || '',
            type: user.type || 'hirer',
            settings: {
                twoFactorEnabled: user.settings?.twoFactorEnabled || false,
                notifications: {
                    email: user.settings?.notifications?.email ?? true,
                    jobAlerts: user.settings?.notifications?.jobAlerts ?? true
                }
            }
        });
        setAvatarPreview(user.photo || null);
    }, [user]);

    const onChange = (key) => (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm(prev => {
            // nested settings toggles
            if (key.startsWith('settings.')) {
                const [, sKey, sub] = key.split('.');
                if (sub) {
                    return {
                        ...prev,
                        settings: {
                            ...prev.settings,
                            [sKey]: {
                                ...prev.settings[sKey],
                                [sub]: value
                            }
                        }
                    };
                } else {
                    return { ...prev, settings: { ...prev.settings, [sKey]: value } };
                }
            }
            return { ...prev, [key]: value };
        });
    };

    const handleAvatarClick = () => {
        if (fileRef.current) fileRef.current.click();
    };

    const readFileAsDataUrl = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleAvatarChange = async (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const dataUrl = await readFileAsDataUrl(f);
        setAvatarPreview(dataUrl);
        // Note: we don't save immediately; user must click Save Changes
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        // Basic validation
        if (!form.name.trim()) {
            setMessage({ type: 'error', text: 'Name is required.' });
            setSaving(false);
            return;
        }
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setMessage({ type: 'error', text: 'Please provide a valid email address.' });
            setSaving(false);
            return;
        }

        // Build update payload
        const updates = {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone || '',
            location: form.location || '',
            bio: form.bio || '',
            type: form.type,
            photo: avatarPreview || '',
            settings: {
                twoFactorEnabled: !!form.settings.twoFactorEnabled,
                notifications: {
                    email: !!form.settings.notifications.email,
                    jobAlerts: !!form.settings.notifications.jobAlerts
                }
            }
        };

        try {
            // updateUser merges and persists to localStorage in AuthContext
            updateUser(updates);
            setMessage({ type: 'success', text: 'Profile settings saved.' });
        } catch (err) {
            console.error('Error saving settings', err);
            setMessage({ type: 'error', text: 'Failed to save settings.' });
        } finally {
            setSaving(false);
            // clear password inputs after save
            setPasswordState({ current: '', newPass: '', confirm: '' });
        }
    };

    const handleChangePassword = () => {
        setMessage(null);

        // Simulated password handling stored on the user object.
        // AuthContext stores whatever fields you give it in localStorage.
        const existingPassword = user?.password || '';

        if (!passwordState.newPass || passwordState.newPass.length < 6) {
            setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
            return;
        }
        if (passwordState.newPass !== passwordState.confirm) {
            setMessage({ type: 'error', text: 'New password and confirmation do not match.' });
            return;
        }

        if (existingPassword) {
            // verify current
            if (passwordState.current !== existingPassword) {
                setMessage({ type: 'error', text: 'Current password is incorrect.' });
                return;
            }
        } else {
            // no existing password — allow set new
        }

        // Update password in user profile
        updateUser({ password: passwordState.newPass });
        setMessage({ type: 'success', text: 'Password updated.' });
        setPasswordState({ current: '', newPass: '', confirm: '' });
    };

    return (
        <div className="hirer-dashboard-wrapper">
            <DashboardSidebar />

            <div className="hirer-dashboard-main">
                <header className="page-header settings-topbar">
                    <div className="header-side-left" />
                    <div className="header-left">
                        <h1>Account Settings</h1>
                        <p>Manage your profile, security, and notifications</p>
                    </div>
                    <div className="settings-save-actions">
                        <button className="btn-outline" onClick={() => {
                            // reset to current user values
                            if (user) {
                                setForm({
                                    name: user.name || '',
                                    email: user.email || '',
                                    phone: user.phone || '',
                                    location: user.location || '',
                                    bio: user.bio || '',
                                    type: user.type || 'hirer',
                                    settings: {
                                        twoFactorEnabled: user.settings?.twoFactorEnabled || false,
                                        notifications: {
                                            email: user.settings?.notifications?.email ?? true,
                                            jobAlerts: user.settings?.notifications?.jobAlerts ?? true
                                        }
                                    }
                                });
                                setAvatarPreview(user.photo || null);
                                setMessage({ type: 'info', text: 'Changes reverted.' });
                            }
                        }}>Reset</button>
                        <button className="btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </header>

                <div className="dashboard-content-container settings-page">
                    {message && (
                        <div className={`settings-msg ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="settings-grid">
                        <section className="settings-section card profile-card">
                            <h2><i className="fas fa-user-circle"></i> Profile</h2>

                            <div className="profile-row">
                                <div className="avatar-column">
                                    <div className="avatar-preview" onClick={handleAvatarClick} title="Click to change avatar">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Avatar" />
                                        ) : (
                                            <div className="avatar-initial">{(form.name || 'U').charAt(0).toUpperCase()}</div>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={handleAvatarChange} />
                                    <div className="avatar-hint">Click avatar to upload (PNG, JPG)</div>
                                </div>

                                <div className="profile-fields">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} />
                                    </div>

                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group half">
                                            <label>Phone</label>
                                            <input value={form.phone} onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))} />
                                        </div>
                                        <div className="form-group half">
                                            <label>Location</label>
                                            <input value={form.location} onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))} />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Short Bio</label>
                                        <textarea value={form.bio} onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))} rows={3} />
                                    </div>

                                    <div className="form-group">
                                        <label>Account Type</label>
                                        <select value={form.type} onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}>
                                            <option value="hirer">Hirer</option>
                                            <option value="labourer">Labourer</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="settings-section card security-card">
                            <h2><i className="fas fa-shield-alt"></i> Security</h2>

                            <div className="form-group">
                                <label>Change Password</label>
                                <div className="password-row">
                                    <input type="password" placeholder="Current password" value={passwordState.current} onChange={(e) => setPasswordState(s => ({ ...s, current: e.target.value }))} />
                                    <input type="password" placeholder="New password" value={passwordState.newPass} onChange={(e) => setPasswordState(s => ({ ...s, newPass: e.target.value }))} />
                                    <input type="password" placeholder="Confirm new password" value={passwordState.confirm} onChange={(e) => setPasswordState(s => ({ ...s, confirm: e.target.value }))} />
                                    <button className="btn-primary small" onClick={handleChangePassword}>Update Password</button>
                                </div>
                                <div className="hint">Password must be at least 6 characters.</div>
                            </div>

                            <div className="form-group">
                                <label>Two-Factor Authentication</label>
                                <div className="toggle-group">
                                    <span>Enable Two-Factor Authentication</span>
                                    <input type="checkbox" checked={!!form.settings.twoFactorEnabled} onChange={(e) => setForm(prev => ({ ...prev, settings: { ...prev.settings, twoFactorEnabled: e.target.checked } }))} />
                                </div>
                                <div className="hint">When enabled you'll need a second step to sign in.</div>
                            </div>
                        </section>

                        <section className="settings-section card notifications-card">
                            <h2><i className="fas fa-bell"></i> Notifications</h2>

                            <div className="toggle-row">
                                <label>Email Notifications</label>
                                <input type="checkbox" checked={!!form.settings.notifications.email} onChange={(e) => setForm(prev => ({ ...prev, settings: { ...prev.settings, notifications: { ...prev.settings.notifications, email: e.target.checked } } }))} />
                            </div>

                            <div className="toggle-row">
                                <label>New Job Alerts</label>
                                <input type="checkbox" checked={!!form.settings.notifications.jobAlerts} onChange={(e) => setForm(prev => ({ ...prev, settings: { ...prev.settings, notifications: { ...prev.settings.notifications, jobAlerts: e.target.checked } } }))} />
                            </div>

                            <div className="hint">Notification preferences saved to your profile and used by the app.</div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;