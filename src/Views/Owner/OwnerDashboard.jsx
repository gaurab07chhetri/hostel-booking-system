import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaHotel, FaBed, FaCheck, FaTimes, FaEdit, FaKey, FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaEnvelope, FaHeart } from 'react-icons/fa';
import './OwnerDashboard.css';

const OwnerDashboard = () => {
    const navigate = useNavigate();
    const [hostelData, setHostelData] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [roomAssignments, setRoomAssignments] = useState({});
    const [availableRooms, setAvailableRooms] = useState([]);
    const [roomAvailability, setRoomAvailability] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                await fetchHostelData();
                await fetchBookings();
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                if (error.response?.status === 401) {
                    toast.error('Session expired. Please login again.');
                    navigate('/login');
                } else if (error.response?.status === 404) {
                    toast.error('No hostel found. Please register a hostel first.');
                    navigate('/register-hostel');
                } else {
                    toast.error('Failed to load dashboard data');
                }
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const fetchHostelData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/owner/hostel', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHostelData(response.data);
            
            // Generate available rooms based on hostel capacity
            const rooms = [];
            for (let i = 1; i <= response.data.capacity; i++) {
                rooms.push(i);
            }
            setAvailableRooms(rooms);
            
            // Initialize room availability
            const availability = {};
            response.data.roomTypes.forEach(type => {
                availability[type.name] = type.available;
            });
            setRoomAvailability(availability);
        } catch (error) {
            console.error('Error fetching hostel data:', error);
            throw error;
        }
    };

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/owner/bookings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(response.data);
            
            // Initialize room assignments from existing bookings
            const assignments = {};
            response.data.forEach(booking => {
                if (booking.roomNumber) {
                    assignments[booking._id] = booking.roomNumber;
                }
            });
            setRoomAssignments(assignments);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            throw error;
        }
    };

    const handleEditHostel = () => {
        navigate('/owner/edit-hostel');
    };

    const handleApproveBooking = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/owner/bookings/${bookingId}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Booking approved successfully');
            fetchBookings();
        } catch (error) {
            console.error('Error approving booking:', error);
            toast.error('Failed to approve booking');
        }
    };

    const handleRejectBooking = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/owner/bookings/${bookingId}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Booking rejected successfully');
            fetchBookings();
        } catch (error) {
            console.error('Error rejecting booking:', error);
            toast.error('Failed to reject booking');
        }
    };

    const handleAssignRoom = async (bookingId, roomNumber) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/owner/bookings/${bookingId}/assign-room`, 
                { roomNumber }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRoomAssignments({ ...roomAssignments, [bookingId]: roomNumber });
            toast.success(`Room ${roomNumber} assigned successfully`);
            fetchBookings();
        } catch (error) {
            console.error('Error assigning room:', error);
            toast.error('Failed to assign room');
        }
    };

    const handleUpdateRoomAvailability = async (roomType, available) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/owner/hostel/room-availability`, 
                { roomType, available }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setRoomAvailability({
                ...roomAvailability,
                [roomType]: available
            });
            
            toast.success(`Room availability updated successfully`);
            fetchHostelData();
        } catch (error) {
            console.error('Error updating room availability:', error);
            toast.error('Failed to update room availability');
        }
    };

    const renderOverview = () => {
        if (!hostelData) return null;

        return (
            <div className="overview-section">
                <div className="mh-hostel-card-wrapper">
                    <div className="mh-hostel-card">
                        <div className="mh-hostel-image">
                            <img src={hostelData.image || 'default-hostel-image.jpg'} alt={hostelData.hostel_name} />
                            <div className="mh-gender-tag">
                                <FaUsers /> Girls
                            </div>
                        </div>
                        <div className="mh-hostel-content">
                            <h2 className="mh-hostel-name">{hostelData.hostel_name}</h2>
                            <div className="mh-hostel-location">
                                <FaMapMarkerAlt />
                                <span>{hostelData.hostel_location}</span>
                            </div>
                            <div className="mh-hostel-contact">
                                <a href={`tel:${hostelData.phone}`} className="mh-contact-item">
                                    <FaPhone />
                                    <span>{hostelData.phone || '9812923950'}</span>
                                </a>
                                <a href={`mailto:${hostelData.email}`} className="mh-contact-item">
                                    <FaEnvelope />
                                    <span>{hostelData.email || 'rajiv@gmail.com'}</span>
                                </a>
                            </div>
                            <div className="mh-hostel-features">
                                <h3 className="mh-features-title">Features:</h3>
                                <div className="mh-features-list">
                                    {hostelData.features.map((feature, index) => (
                                        <span key={index} className="mh-feature-item">{feature}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="mh-action-buttons">
                                <button className="mh-like-button">
                                    <FaHeart />
                                </button>
                                <button className="mh-view-details" onClick={handleEditHostel}>
                                    View Details
                    </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="hostel-details">
                    <div className="detail-item">
                        <FaHotel />
                        <div>
                            <h3>Location</h3>
                            <p>{hostelData.hostel_location}</p>
                        </div>
                    </div>
                    <div className="detail-item">
                        <FaBed />
                        <div>
                            <h3>Capacity</h3>
                            <p>{hostelData.capacity} rooms</p>
                        </div>
                    </div>
                    <div className="detail-item">
                        <FaUsers />
                        <div>
                            <h3>Current Bookings</h3>
                            <p>{bookings.filter(b => b.status === 'Approved').length} active</p>
                        </div>
                    </div>
                </div>

                <div className="room-types">
                    <h3>Room Types & Availability</h3>
                    <div className="room-types-grid">
                        {hostelData.roomTypes.map((type, index) => (
                            <div key={index} className="room-type-card">
                                <h4>{type.name}</h4>
                                <p>Price: Rs.{type.price}</p>
                                <div className="availability-control">
                                    <p>Available: {roomAvailability[type.name] || type.available}</p>
                                    <div className="availability-buttons">
                                        <button 
                                            className="increase-btn"
                                            onClick={() => handleUpdateRoomAvailability(type.name, (roomAvailability[type.name] || type.available) + 1)}
                                        >
                                            +
                                        </button>
                                        <button 
                                            className="decrease-btn"
                                            onClick={() => handleUpdateRoomAvailability(type.name, Math.max(0, (roomAvailability[type.name] || type.available) - 1))}
                                        >
                                            -
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="food-schedule">
                    <h3>Food Schedule</h3>
                    <div className="schedule-grid">
                        {Object.entries(hostelData.foodSchedule).map(([meal, time]) => (
                            <div key={meal} className="schedule-item">
                                <h4>{meal}</h4>
                                <p>{time}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderBookings = () => {
        return (
            <div className="bookings-section">
                <h2>Bookings</h2>
                {bookings.length === 0 ? (
                    <p className="no-bookings">No bookings found</p>
                ) : (
                    <div className="bookings-list">
                        {bookings.map(booking => (
                            <div key={booking._id} className="booking-card">
                                <div className="booking-header">
                                    <h3>{booking.user.name}</h3>
                                    <span className={`status ${booking.status.toLowerCase()}`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="booking-details">
                                    <p><strong>Email:</strong> {booking.user.email}</p>
                                    <p><strong>Phone:</strong> {booking.user.phone}</p>
                                    <p><strong>Room Type:</strong> {booking.roomType}</p>
                                    <p><strong>Check-in:</strong> {new Date(booking.checkIn).toLocaleDateString()}</p>
                                    <p><strong>Check-out:</strong> {new Date(booking.checkOut).toLocaleDateString()}</p>
                                    {booking.roomNumber && (
                                        <p><strong>Room Number:</strong> {booking.roomNumber}</p>
                                    )}
                                </div>
                                <div className="booking-actions">
                                    {booking.status === 'Pending' && (
                                        <>
                                            <button 
                                                className="approve-btn"
                                                onClick={() => handleApproveBooking(booking._id)}
                                            >
                                                <FaCheck /> Approve
                                            </button>
                                            <button 
                                                className="reject-btn"
                                                onClick={() => handleRejectBooking(booking._id)}
                                            >
                                                <FaTimes /> Reject
                                            </button>
                                        </>
                                    )}
                                    {booking.status === 'Approved' && !booking.roomNumber && (
                                        <div className="assign-room">
                                            <select 
                                                value={roomAssignments[booking._id] || ''}
                                                onChange={(e) => setRoomAssignments({...roomAssignments, [booking._id]: e.target.value})}
                                            >
                                                <option value="">Select Room</option>
                                                {availableRooms.map(room => (
                                                    <option key={room} value={room}>
                                                        Room {room}
                                                    </option>
                                                ))}
                                            </select>
                                            <button 
                                                className="assign-btn"
                                                onClick={() => handleAssignRoom(booking._id, roomAssignments[booking._id])}
                                                disabled={!roomAssignments[booking._id]}
                                            >
                                                <FaKey /> Assign Room
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="owner-dashboard">
            <div className="dashboard-header">
                <h1>Hostel Management Dashboard</h1>
                <div className="dashboard-tabs">
                    <button 
                        className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <FaHotel /> Hostel Overview
                    </button>
                    <button 
                        className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('bookings')}
                    >
                        <FaCalendarAlt /> Bookings
                    </button>
                </div>
            </div>

            <div className="dashboard-content">
                {activeTab === 'overview' ? renderOverview() : renderBookings()}
            </div>
        </div>
    );
};

export default OwnerDashboard; 