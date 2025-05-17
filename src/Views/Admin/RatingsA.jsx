import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
    FaStar, FaRegStar, FaSearch, FaTachometerAlt, FaUserCog, FaHotel, FaSignOutAlt
} from 'react-icons/fa';
import axios from 'axios';
import './RatingsA.css';

const RatingsA = () => {
    const [reviews, setReviews] = useState([]);
    const [hostels, setHostels] = useState([]);
    const [selectedHostel, setSelectedHostel] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const { logout } = React.useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHostels();
        fetchReviews();
    }, []);

    const fetchHostels = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/hostels', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setHostels(response.data);
        } catch (err) {
            console.error('Error fetching hostels:', err);
        }
    };

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await axios.get('http://localhost:5000/api/users/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const users = response.data;
            let allRatings = [];

            // Get ratings from the ratings array
            const ratingsFromArray = users.flatMap(user =>
                (user.ratings || []).map(rating => ({
                    ...rating,
                    hostelName: hostels.find(h => h._id === rating.hostelId)?.hostel_name || 'Unknown Hostel'
                }))
            );

            // Get ratings from bookings
            const ratingsFromBookings = users.flatMap(user =>
                (user.bookings || [])
                    .filter(b => b.rating && b.rating.value)
                    .map(b => ({
                        rating: b.rating.value,
                        review: b.rating.review,
                        createdAt: b.rating.createdAt,
                        hostelId: b.hostelId,
                        hostelName: hostels.find(h => h._id === b.hostelId)?.hostel_name || 'Unknown Hostel'
                    }))
            );

            // Combine both rating sources
            allRatings = [...ratingsFromArray, ...ratingsFromBookings];

            // Filter by selected hostel if not 'all'
            if (selectedHostel !== 'all') {
                allRatings = allRatings.filter(r => r.hostelId === selectedHostel);
            }

            // Filter by search query
            if (searchQuery) {
                allRatings = allRatings.filter(r => 
                    r.review.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    r.hostelName.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            // Calculate average rating for filtered results
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

    useEffect(() => {
        fetchReviews();
    }, [selectedHostel, searchQuery]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>Admin Panel</h2>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/admin/dashboard" className="nav-item">
                        <FaTachometerAlt />
                        Dashboard
                    </Link>
                    <Link to="/admin/users" className="nav-item">
                        <FaUserCog />
                        User Management
                    </Link>
                    <Link to="/admin/hostels" className="nav-item">
                        <FaHotel />
                        Hostel Management
                    </Link>
                    <Link to="/admin/ratings" className="nav-item active">
                        <FaStar />
                        Reviews & Ratings
                    </Link>
                    <button onClick={handleLogout} className="nav-item logout-btn">
                        <FaSignOutAlt />
                        Logout
                    </button>
                </nav>
            </div>
            <div className="main-content00">
                <div className="ratings-container">
                    <div className="ratings-header">
                        <h2>Reviews & Ratings</h2>
                        <div className="filters-section">
                            <div className="search-bar">
                                <FaSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search reviews..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <select
                                value={selectedHostel}
                                onChange={(e) => setSelectedHostel(e.target.value)}
                                className="hostel-filter"
                            >
                                <option value="all">All Hostels</option>
                                {hostels.map(hostel => (
                                    <option key={hostel._id} value={hostel._id}>
                                        {hostel.hostel_name}
                                    </option>
                                ))}
                            </select>
                        </div>
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
                        {loading ? (
                            <div className="loading">Loading reviews...</div>
                        ) : error ? (
                            <div className="error">{error}</div>
                        ) : reviews.length > 0 ? (
                            reviews.map((review, index) => (
                                <div key={index} className="review-card">
                                    <div className="review-header">
                                        <div className="review-info">
                                            <div className="review-rating">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className="star">
                                                        {i < review.rating ? <FaStar /> : <FaRegStar />}
                                                    </span>
                                                ))}
                                            </div>
                                            <span className="hostel-name">{review.hostelName}</span>
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
            </div>
        </div>
    );
};

export default RatingsA; 