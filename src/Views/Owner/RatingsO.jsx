import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import axios from 'axios';
import './RatingsO.css';

const RatingsO = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const hostelId = localStorage.getItem('hostelId');

            if (!hostelId) {
                setError('No hostel found');
                return;
            }

            const response = await axios.get('http://localhost:5000/api/users/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const users = response.data;

            // Get ratings from the ratings array
            const ratingsFromArray = users.flatMap(user =>
                (user.ratings || []).filter(r => r.hostelId === hostelId || r.hostelId === hostelId?.toString())
            );

            // Get ratings from bookings
            const ratingsFromBookings = users.flatMap(user =>
                (user.bookings || [])
                    .filter(b => b.hostelId && (b.hostelId.toString() === hostelId || b.hostelId.toString() === hostelId?.toString()))
                    .filter(b => b.rating && b.rating.value)
                    .map(b => ({
                        rating: b.rating.value,
                        review: b.rating.review,
                        createdAt: b.rating.createdAt
                    }))
            );

            // Combine both rating sources
            const allRatings = [...ratingsFromArray, ...ratingsFromBookings];
            
            const averageRating = allRatings.length > 0 
                ? (allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length).toFixed(1) 
                : 0;
            
            setAverageRating(parseFloat(averageRating));
            setTotalRatings(allRatings.length);
            setReviews(allRatings);
            setError(null);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return <div className="loading">Loading reviews...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="ratings-container">
            <div className="ratings-header">
                <h2>Reviews & Ratings</h2>
                <div className="overall-rating">
                    <div className="rating-stars">
                        {[...Array(5)].map((_, index) => (
                            <span key={index} className="star">
                                {index < averageRating ? <FaStar /> : <FaRegStar />}
                            </span>
                        ))}
                    </div>
                    <div className="rating-summary">
                        <span className="average-rating">{averageRating}</span>
                        <span className="total-ratings">({totalRatings} reviews)</span>
                    </div>
                </div>
            </div>

            <div className="reviews-list">
                {reviews.length > 0 ? (
                    reviews.map((review, index) => (
                        <div key={index} className="review-card">
                            <div className="review-header">
                                <div className="review-rating">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="star">
                                            {i < review.rating ? <FaStar /> : <FaRegStar />}
                                        </span>
                                    ))}
                                </div>
                                <span className="review-date">{formatDate(review.createdAt)}</span>
                            </div>
                            <div className="review-content">
                                <p>{review.review}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-reviews">
                        <p>No reviews available yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RatingsO; 