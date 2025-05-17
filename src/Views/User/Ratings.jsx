import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaStar, FaRegStar } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import './Ratings.css';

const Ratings = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const hostel = location.state?.hostel;
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!hostel) {
        toast.error('No hostel selected for rating.');
        navigate('/dashboard');
        return null;
    }

    const handleRatingSubmit = async () => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users/rate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    hostelId: hostel._id,
                    rating,
                    review
                })
            });
            const data = await response.json();
            
            if (response.ok && data.success) {
                toast.success('Rating submitted successfully!');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            } else {
                toast.error(data.message || 'Error submitting rating');
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            toast.error('Error submitting rating. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="ratings-page-container">
            <Toaster position="top-center" />
            <div className="ratings-modal-content">
                <h2 className="ratings-title">Rate this Hostel</h2>
                <div className="rating-stars interactive">
                    {[...Array(5)].map((_, index) => (
                        <span
                            key={index}
                            className="star"
                            onMouseEnter={() => setHoverRating(index + 1)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(index + 1)}
                            style={{ cursor: 'pointer' }}
                        >
                            {index < (hoverRating || rating) ? <FaStar /> : <FaRegStar />}
                        </span>
                    ))}
                </div>
                <textarea
                    className="review-input"
                    placeholder="Share your experience (optional)"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    maxLength={500}
                />
                <div className="rating-modal-actions">
                    <button
                        className="submit-rating-btn"
                        type="button"
                        onClick={handleRatingSubmit}
                        disabled={rating === 0 || submitting}
                    >
                        Submit Rating
                    </button>
                    <button
                        className="cancel-rating-btn"
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Ratings; 