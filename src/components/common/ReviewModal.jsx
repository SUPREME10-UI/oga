import { useState } from 'react';
import { useData } from '../../context/DataContext';
import './ReviewModal.css';

function ReviewModal({ isOpen, onClose, labourerId, reviewerId, reviewerName }) {
    const { addReview } = useData();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert("Please select a star rating");
            return;
        }

        setIsSubmitting(true);
        try {
            await addReview(labourerId, {
                rating,
                comment,
                user: reviewerName || 'Anonymous', // Current user's name
                reviewerId: reviewerId
            });
            onClose();
            setRating(0);
            setComment('');
        } catch (error) {
            alert("Failed to submit review. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="review-modal-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className="review-modal">
                <div className="review-modal-header">
                    <h2>Rate Experience</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="star-rating-lg">
                        {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                                <button
                                    type="button"
                                    key={index}
                                    className={`star-btn ${ratingValue <= (hover || rating) ? 'active' : ''}`}
                                    onClick={() => setRating(ratingValue)}
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(rating)}
                                >
                                    <i className="fas fa-star"></i>
                                </button>
                            );
                        })}
                    </div>
                    <p className="rating-text">
                        {rating === 1 && "Poor"}
                        {rating === 2 && "Fair"}
                        {rating === 3 && "Good"}
                        {rating === 4 && "Very Good"}
                        {rating === 5 && "Excellent"}
                        {rating === 0 && "Select a rating"}
                    </p>

                    <div className="form-group">
                        <label>Write a review (optional)</label>
                        <textarea
                            placeholder="Share details of your own experience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows="4"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="btn-submit-review"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ReviewModal;
