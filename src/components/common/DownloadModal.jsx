import React from 'react';
import './DownloadModal.css';

const DownloadModal = ({ isOpen, onClose, store }) => {
    if (!isOpen) return null;

    const storeName = store === 'apple' ? 'App Store' : 'Google Play';
    const storeIcon = store === 'apple' ? 'fa-apple' : 'fa-google-play';

    return (
        <div className={`download-modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
            <div className="download-modal-container" onClick={e => e.stopPropagation()}>
                <button className="download-modal-close" onClick={onClose} aria-label="Close">
                    <i className="fas fa-times"></i>
                </button>

                <div className="download-modal-content">
                    <div className="download-modal-icon">
                        <i className={`fab ${storeIcon}`}></i>
                    </div>
                    <h2>Mobile App Coming Soon!</h2>
                    <p>
                        We're currently perfecting the <strong>Oga</strong> experience for {storeName}.
                        Our mobile app is in the final stages of development and will be available soon.
                    </p>

                    <div className="download-notify-form">
                        <p className="notify-text">Want to be the first to know when we launch?</p>
                        <div className="notify-input-group">
                            <input type="email" placeholder="Enter your email" aria-label="Email address" />
                            <button className="btn-notify">Notify Me</button>
                        </div>
                    </div>

                    <button className="btn-close-modal" onClick={onClose}>
                        Continue with Web version
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DownloadModal;
