import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, ListGroup, Spinner, Container, Row, Col, Alert, Modal } from 'react-bootstrap';
import { FaArrowLeft, FaBookmark, FaTimes, FaMapMarkerAlt, FaPhone, FaEnvelope, FaBed, FaUtensils, FaStar, FaRegStar } from 'react-icons/fa';
import './HostelDetails.css';
import { toast } from 'react-toastify';

// Add HostelDetailsModal Component
export const HostelDetailsModal = ({ hostel, show, onClose }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);

    useEffect(() => {
        if (hostel) {
            fetchRatings();
        }
    }, [hostel]);

    const fetchRatings = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/users/all`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const users = response.data;
            const allRatings = users.flatMap(user =>
                (user.ratings || []).filter(r => r.hostelId === hostel._id || r.hostelId === hostel._id?.toString())
            );
            const avg = allRatings.length > 0 ? (allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length).toFixed(1) : 0;
            setAverageRating(parseFloat(avg));
            setTotalRatings(allRatings.length);
        } catch (error) {
            console.error('Error fetching ratings:', error);
        }
    };

    const handleRatingSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/users/rate', {
                hostelId: hostel._id,
                rating,
                review
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 201) {
                toast.success('Rating submitted successfully!');
                setRating(0);
                setReview('');
                fetchRatings();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error submitting rating');
        }
    };

    if (!hostel) return null;

    return (
        <Modal show={show} onHide={onClose} size="lg" centered className="hostel-details-modal">
            <Modal.Header closeButton>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                        <Modal.Title>{hostel.hostel_name}</Modal.Title>
                    </div>
                </div>
            </Modal.Header>
            <Modal.Body>
                <div className="modal-image-container">
                    <img
                        src={hostel.hostelImage || 'https://via.placeholder.com/400x300?text=No+Image'}
                        alt={hostel.hostel_name}
                        className="modal-hostel-image"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                    />
                </div>
                <div className="modal-details-grid">
                    <div className="detail-item">
                        <FaMapMarkerAlt /> <strong>Location:</strong>
                        <p>{hostel.hostel_location}</p>
                    </div>
                    <div className="detail-item">
                        <FaBed /> <strong>Type:</strong>
                        <p>{hostel.hostel_type} Hostel</p>
                    </div>
                    <div className="detail-item">
                        <FaPhone /> <strong>Contact:</strong>
                        <p>{hostel.phone_number}</p>
                    </div>
                    <div className="detail-item">
                        <FaEnvelope /> <strong>Email:</strong>
                        <p>{hostel.email}</p>
                    </div>
                </div>

                <div className="modal-section">
                    <h5>Features</h5>
                    <p>{hostel.features}</p>
                </div>

                <div className="modal-section rating-section" id="rate-hostel-section">
                    <h5>Ratings & Reviews</h5>
                    <div className="current-rating">
                        <div className="rating-stars">
                            {[...Array(5)].map((_, index) => (
                                <span key={index} className="star">
                                    {index < averageRating ? <FaStar /> : <FaRegStar />}
                                </span>
                            ))}
                        </div>
                        <span className="rating-count">
                            {totalRatings ? `(${totalRatings} reviews)` : 'No reviews yet'}
                        </span>
                    </div>
                    <div className="rate-hostel">
                        <h6>Rate this hostel:</h6>
                        <div className="rating-stars interactive">
                            {[...Array(5)].map((_, index) => (
                                <span
                                    key={index}
                                    className="star"
                                    onMouseEnter={() => setHoverRating(index + 1)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(index + 1)}
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
                        <button
                            className="submit-rating-btn"
                            onClick={handleRatingSubmit}
                            disabled={rating === 0}
                        >
                            Submit Rating
                        </button>
                    </div>
                </div>

                {hostel.rooms && hostel.rooms.length > 0 && (
                    <div className="modal-section">
                        <h5>Room Types</h5>
                        <div className="rooms-grid">
                            {hostel.rooms.map((room, index) => (
                                <div key={index} className="room-card">
                                    <h6>{room.type}</h6>
                                    <p>Available: {room.availableRooms}</p>
                                    <p>Fee: Rs.{room.feePerMonth}/month</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {hostel.foodSchedule && hostel.foodSchedule.length > 0 && (
                    <div className="modal-section">
                        <h5>Food Schedule</h5>
                        <div className="food-schedule-grid">
                            {hostel.foodSchedule.map((schedule, index) => (
                                <div key={index} className="schedule-card">
                                    <h6>{schedule.day}</h6>
                                    <p>Breakfast: {schedule.breakfast}</p>
                                    <p>Lunch: {schedule.lunch}</p>
                                    <p>Dinner: {schedule.dinner}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {hostel.precise_location && (
                    <div className="modal-section">
                        <h5>Address Details</h5>
                        <p>
                            {hostel.precise_location.address}, {hostel.precise_location.city},<br />
                            {hostel.precise_location.state} - {hostel.precise_location.zipCode}
                        </p>
                        {hostel.precise_location.landmarks && (
                            <p><strong>Landmarks:</strong> {hostel.precise_location.landmarks}</p>
                        )}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <button
                    className="rate-us-btn"
                    style={{ background: '#ffc107', color: '#222', border: 'none', borderRadius: 6, padding: '8px 22px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => {
                        const rateSection = document.getElementById('rate-hostel-section');
                        if (rateSection) {
                            rateSection.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}
                >
                    <FaStar style={{ color: '#ff9800' }} /> Rate Us
                </button>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
                <Button 
                    variant="primary" 
                    onClick={() => window.location.href = `/booking/${hostel._id}`}
                >
                    Book Now
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

const HostelDetails = () => {
    const { id } = useParams();
    const [hostel, setHostel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);

    useEffect(() => {
        const fetchHostelDetails = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get token from localStorage
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Please login to view hostel details');
                    return;
                }

                if (!id || id.length !== 24) {
                    console.error('Invalid hostel ID:', id);
                    setError('Invalid hostel ID format');
                    return;
                }

                console.log('=== Fetching Hostel Details ===');
                console.log('Hostel ID:', id);
                console.log('ID length:', id.length);
                console.log('Token present:', !!token);
                
                const url = `http://localhost:5000/api/hostels/${id}`;
                console.log('Request URL:', url);
                
                const response = await axios.get(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Response received:', {
                    status: response.status,
                    statusText: response.statusText,
                    hasData: !!response.data
                });
                
                if (!response.data) {
                    throw new Error('No data received from server');
                }

                setHostel(response.data);
                fetchRatings();
            } catch (error) {
                console.error("=== Error fetching hostel details ===");
                console.error("Error type:", error.name);
                console.error("Error message:", error.message);
                console.error("Error response:", error.response?.data);
                console.error("Status code:", error.response?.status);
                console.error("Full error:", error);
                
                if (error.response?.status === 401) {
                    setError('Please login to view hostel details');
                    navigate('/login');
                } else if (error.response?.status === 404) {
                    setError(`Hostel not found (ID: ${id})`);
                } else if (error.response?.status === 400) {
                    setError(`Invalid hostel ID format (${id})`);
                } else {
                    setError('Error loading hostel details. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchHostelDetails();
        } else {
            setError('No hostel ID provided');
        }
    }, [id, navigate]);

    const fetchRatings = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/users/all`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const users = response.data;
            const allRatings = users.flatMap(user =>
                (user.ratings || []).filter(r => r.hostelId === id || r.hostelId === id?.toString())
            );
            const avg = allRatings.length > 0 ? (allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length).toFixed(1) : 0;
            setAverageRating(parseFloat(avg));
            setTotalRatings(allRatings.length);
        } catch (error) {
            console.error('Error fetching ratings:', error);
        }
    };

    const handleRatingSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/users/rate', {
                hostelId: id,
                rating,
                review
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 201) {
                toast.success('Rating submitted successfully!');
                setRating(0);
                setReview('');
                fetchRatings();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error submitting rating');
        }
    };

    if (loading) {
        return (
            <div className="loading-container-include1">
                <Spinner animation="border" variant="primary" />
                <h2>Loading Hostel Details...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="hostel-details-container-include1">
                <Button className="back-btn-include1" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back to Dashboard
                </Button>
                <Alert variant="danger" className="mt-3">
                    {error}
                </Alert>
            </div>
        );
    }

    if (!hostel) {
        return (
            <div className="hostel-details-container-include1">
                <Button className="back-btn-include1" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back to Dashboard
                </Button>
                <Alert variant="warning" className="mt-3">
                    No hostel details found
                </Alert>
            </div>
        );
    }

    return (
        <div className="hostel-details-container-include1">
            {/* Back Button */}
            <Button className="back-btn-include1" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Back to Dashboard
            </Button>

            <Card className="hostel-details-card-include1">
                <Card.Img 
                    variant="top" 
                    src={hostel.image_url} 
                    alt={hostel.hostel_name} 
                    className="hostel-details-img-include1"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                />
                <Card.Body>
                    <Card.Title className="hostel-title-include1">{hostel.hostel_name}</Card.Title>
                    <Card.Text>
                        <strong>📍 Location:</strong> {hostel.hostel_location}<br />
                        <strong>💰 Fee Structure:</strong> Rs. {hostel.feeStructure} per month<br />
                        <strong>🏠 Type:</strong> {hostel.hostel_type} Hostel<br />
                        <strong>📞 Contact:</strong> {hostel.phone_number}<br />
                        <strong>✉ Email:</strong> {hostel.email}<br />
                        <strong>✨ Features:</strong> {hostel.features}<br />
                        <strong>Status:</strong> <span className={`status-badge ${hostel.status.toLowerCase()}`}>{hostel.status}</span>
                    </Card.Text>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: 32 }}>
                        <button
                            className="rate-us-btn"
                            style={{ background: '#ffc107', color: '#222', border: 'none', borderRadius: 6, padding: '8px 22px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                            onClick={() => {
                                const rateSection = document.getElementById('rate-hostel-section');
                                if (rateSection) {
                                    rateSection.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                        >
                            <FaStar style={{ color: '#ff9800' }} /> Rate Us
                        </button>
                        <Button 
                            variant="primary" 
                            size="lg"
                            className="booking-btn-include1"
                            onClick={() => {
                                navigate(`/booking/${hostel._id}`);
                            }}
                        >
                            <FaBookmark /> Click here for Booking
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            {/* Food Listing Section */}
            {hostel.foodListing && hostel.foodListing.length > 0 && (
                <>
                    <h5 className="food-listing-title-include1">🍽 Food Listing</h5>
                    <Container>
                        <Row>
                            {hostel.foodListing.map((food, index) => (
                                <Col md={4} key={index} className="food-listing-col-include1">
                                    <Card className="food-card-include1">
                                        <Card.Body>
                                            <Card.Text className="food-item-include1">{food}</Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </>
            )}

            {/* Rating Section */}
            <div className="modal-section rating-section" id="rate-hostel-section" style={{ marginTop: 40 }}>
                <h5>Ratings & Reviews</h5>
                <div className="current-rating">
                    <div className="rating-stars">
                        {[...Array(5)].map((_, index) => (
                            <span key={index} className="star">
                                {index < averageRating ? <FaStar /> : <FaRegStar />}
                            </span>
                        ))}
                    </div>
                    <span className="rating-count">
                        {totalRatings ? `(${totalRatings} reviews)` : 'No reviews yet'}
                    </span>
                </div>
                <div className="rate-hostel">
                    <h6>Rate this hostel:</h6>
                    <div className="rating-stars interactive">
                        {[...Array(5)].map((_, index) => (
                            <span
                                key={index}
                                className="star"
                                onMouseEnter={() => setHoverRating(index + 1)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(index + 1)}
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
                    <button
                        className="submit-rating-btn"
                        onClick={handleRatingSubmit}
                        disabled={rating === 0}
                    >
                        Submit Rating
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HostelDetails;