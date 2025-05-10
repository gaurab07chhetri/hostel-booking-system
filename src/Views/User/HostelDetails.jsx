import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, ListGroup, Spinner, Container, Row, Col, Alert, Modal } from 'react-bootstrap';
import { FaArrowLeft, FaBookmark, FaTimes, FaMapMarkerAlt, FaPhone, FaEnvelope, FaBed, FaUtensils } from 'react-icons/fa';
import './HostelDetails.css';

// Add HostelDetailsModal Component
export const HostelDetailsModal = ({ hostel, show, onClose }) => {
    if (!hostel) return null;

    return (
        <Modal show={show} onHide={onClose} size="lg" centered className="hostel-details-modal">
            <Modal.Header closeButton>
                <Modal.Title>{hostel.hostel_name}</Modal.Title>
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
                    <Button 
                        variant="primary" 
                        size="lg" 
                        className="booking-btn-include1"
                        onClick={() => {
                            console.log('Navigating to booking page with ID:', hostel._id);
                            navigate(`/booking/${hostel._id}`);
                        }}
                    >
                        <FaBookmark /> Click here for Booking
                    </Button>
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
        </div>
    );
};

export default HostelDetails;