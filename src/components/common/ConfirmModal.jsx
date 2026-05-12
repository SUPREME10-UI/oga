import './ConfirmModal.css';

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', cancelText = 'Cancel', type = 'danger' }) {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-overlay active">
            <div className={`confirm-modal-container ${type}`}>
                <div className="confirm-modal-icon">
                    <i className={type === 'danger' ? 'fas fa-exclamation-circle' : 'fas fa-question-circle'}></i>
                </div>
                <div className="confirm-modal-content">
                    <h3>{title}</h3>
                    <p>{message}</p>
                </div>
                <div className="confirm-modal-actions">
                    <button className="btn-cancel" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button className={`btn-confirm ${type}`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
