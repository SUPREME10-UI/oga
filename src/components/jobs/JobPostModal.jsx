import { useState, useEffect } from 'react';
import './JobPostModal.css';

function JobPostModal({ isOpen, onClose, onJobPost, initialData }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        location: '',
        budget: '',
        description: '',
        urgency: 'normal'
    });

    useEffect(() => {
        if (initialData) {
<<<<<<< HEAD
            setFormData(initialData);
        } else {
=======
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData(initialData);
        } else {
             
>>>>>>> ec49e4d07819638bda5eaf94ef1cf271f3cce358
            setFormData({ title: '', category: '', location: '', budget: '', description: '', urgency: 'normal' });
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => setStep(step + 1);
<<<<<<< HEAD
    const handleBack = () => setStep(step - 1);
=======
>>>>>>> ec49e4d07819638bda5eaf94ef1cf271f3cce358

    const handleSubmit = (e) => {
        e.preventDefault();

        if (onJobPost) {
            onJobPost(formData);
        }

        onClose();
        // Reset form
        setStep(1);
        setFormData({ title: '', category: '', location: '', budget: '', description: '', urgency: 'normal' });
    };

    if (!isOpen) return null;

    return (
        <div className="job-modal-overlay">
            <div className="job-modal-container">
                <div className="job-modal-header">
                    <h2>{initialData ? 'Update Job Posting' : 'Post a New Job'}</h2>
                    <button className="close-btn" onClick={onClose}><i className="fas fa-times"></i></button>
                </div>

                <div className="job-modal-progress">
                    <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
                    <div className="progress-line"></div>
                    <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
                </div>

                <form onSubmit={handleSubmit} className="job-modal-form">
                    {step === 1 && (
                        <div className="form-step">
                            <div className="form-group">
<<<<<<< HEAD
                                <label>Job Title</label>
                                <input
                                    type="text"
=======
                                <label htmlFor="title">Job Title</label>
                                <input
                                    type="text"
                                    id="title"
>>>>>>> ec49e4d07819638bda5eaf94ef1cf271f3cce358
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Need a professional plumber"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="form-group">
<<<<<<< HEAD
                                <label>Category</label>
                                <select name="category" value={formData.category} onChange={handleChange} required>
=======
                                <label htmlFor="category">Category</label>
                                <select id="category" name="category" value={formData.category} onChange={handleChange} required>
>>>>>>> ec49e4d07819638bda5eaf94ef1cf271f3cce358
                                    <option value="">Select Category</option>
                                    <option value="Plumbing">Plumbing</option>
                                    <option value="Electrical">Electrical</option>
                                    <option value="Carpentry">Carpentry</option>
                                    <option value="Cleaning">Cleaning</option>
                                </select>
                            </div>

                            <div className="form-group">
<<<<<<< HEAD
                                <label>Location</label>
                                <input
                                    type="text"
=======
                                <label htmlFor="location">Location</label>
                                <input
                                    type="text"
                                    id="location"
>>>>>>> ec49e4d07819638bda5eaf94ef1cf271f3cce358
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="City, Area"
                                    required
                                />
                            </div>

                            <button type="button" className="btn-next" onClick={handleNext}>Next Step</button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="form-step">
                            <div className="form-group">
<<<<<<< HEAD
                                <label>Budget (₵)</label>
                                <input
                                    type="number"
=======
                                <label htmlFor="budget">Budget (₵)</label>
                                <input
                                    type="number"
                                    id="budget"
>>>>>>> ec49e4d07819638bda5eaf94ef1cf271f3cce358
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    placeholder="Enter amount"
                                    required
                                />
                            </div>

                            <div className="form-group">
<<<<<<< HEAD
                                <label>Description</label>
                                <textarea
=======
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
>>>>>>> ec49e4d07819638bda5eaf94ef1cf271f3cce358
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe the work in detail..."
                                    rows="4"
                                    required
                                ></textarea>
                            </div>

                            <div className="form-actions-row">
                                <button type="submit" className="btn-submit">
                                    {initialData ? 'Update Job' : 'Post Job'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default JobPostModal;
