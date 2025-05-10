import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../../context/AuthContext';
import { FaEdit, FaCheck, FaTimes, FaBed, FaUser, FaCalendarAlt, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import HostelRegistrationForm from './HostelRegistrationForm';
import './MyHostel.css';

const MyHostel = () => {
    const [hostel, setHostel] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [roomAssignments, setRoomAssignments] = useState({});
    const [availableRooms, setAvailableRooms] = useState({});
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user || user.role !== 'Owner') {
            toast.error('You do not have permission to access this page');
            navigate('/user/home');
            return;
        }

        fetchHostelData();
        fetchBookings();
    }, [user, navigate]);

    const fetchHostelData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to continue');
                navigate('/');
                return;
            }

            const response = await axios.get('http://localhost:5000/api/hostels/my-hostel', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.hostel) {
                setHostel(response.data.hostel);
                
                // Calculate available rooms for each room type
                const available = {};
                response.data.hostel.rooms.forEach(room => {
                    available[room.type] = room.availableRooms;
                });
                setAvailableRooms(available);
            } else {
                toast.error('No hostel found. Please register a hostel first.');
                navigate('/register-hostel');
            }
        } catch (error) {
            console.error('Error fetching hostel data:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                navigate('/');
            } else {
                toast.error('Failed to fetch hostel information');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to continue');
                navigate('/');
                return;
            }

            const response = await axios.get('http://localhost:5000/api/bookings/hostel-bookings', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.bookings) {
                setBookings(response.data.bookings);
                
                // Initialize room assignments from existing bookings
                const assignments = {};
                response.data.bookings.forEach(booking => {
                    if (booking.roomNumber) {
                        assignments[booking._id] = booking.roomNumber;
                    }
                });
                setRoomAssignments(assignments);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                navigate('/');
            } else {
                toast.error('Failed to fetch bookings');
            }
        }
    };

    const handleEditSubmit = async (formData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put('http://localhost:5000/api/hostels/update', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data) {
                toast.success('Hostel details updated successfully');
                setIsEditing(false);
                fetchHostelData();
            }
        } catch (error) {
            console.error('Error updating hostel:', error);
            toast.error('Failed to update hostel details');
        }
    };

    const handleApproveBooking = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:5000/api/bookings/${bookingId}/approve`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data) {
                toast.success('Booking approved successfully');
                fetchBookings();
            }
        } catch (error) {
            console.error('Error approving booking:', error);
            toast.error('Failed to approve booking');
        }
    };

    const handleRejectBooking = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:5000/api/bookings/${bookingId}/reject`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data) {
                toast.success('Booking rejected successfully');
                fetchBookings();
            }
        } catch (error) {
            console.error('Error rejecting booking:', error);
            toast.error('Failed to reject booking');
        }
    };

    const handleAssignRoom = async (bookingId, roomNumber) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:5000/api/bookings/${bookingId}/assign-room`, 
                { roomNumber },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data) {
                toast.success('Room assigned successfully');
                setRoomAssignments(prev => ({
                    ...prev,
                    [bookingId]: roomNumber
                }));
                fetchBookings();
            }
        } catch (error) {
            console.error('Error assigning room:', error);
            toast.error('Failed to assign room');
        }
    };

    const renderOverview = () => {
        if (!hostel) return null;

        return (
            <div className="overview-section">
                <div className="hostel-info">
                    <h2>{hostel.hostel_name}</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <FaMapMarkerAlt />
                            <span>{hostel.hostel_location}</span>
                        </div>
                        <div className="info-item">
                            <FaPhone />
                            <span>{hostel.phone_number}</span>
                        </div>
                        <div className="info-item">
                            <FaEnvelope />
                            <span>{hostel.email}</span>
                        </div>
                    </div>
                </div>

                <div className="room-types">
                    <h3>Room Types</h3>
                    <div className="room-grid">
                        {hostel.rooms.map((room, index) => (
                            <div key={index} className="room-card">
                                <FaBed />
                                <h4>{room.type}</h4>
                                <p>Available: {room.availableRooms}</p>
                                <p>Fee: ₹{room.feePerMonth}/month</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="features">
                    <h3>Features</h3>
                    <p>{hostel.features}</p>
                </div>

                <div className="food-schedule">
                    <h3>Food Schedule</h3>
                    <div className="schedule-grid">
                        {hostel.foodSchedule.map((day, index) => (
                            <div key={index} className="day-schedule">
                                <h4>{day.day}</h4>
                                <p>Breakfast: {day.breakfast}</p>
                                <p>Lunch: {day.lunch}</p>
                                <p>Dinner: {day.dinner}</p>
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
                <div className="bookings-grid">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="booking-card">
                            <div className="booking-header">
                                <FaUser />
                                <h3>{booking.user.name}</h3>
                            </div>
                            <div className="booking-details">
                                <p><FaCalendarAlt /> Check-in: {new Date(booking.checkInDate).toLocaleDateString()}</p>
                                <p><FaBed /> Room Type: {booking.roomType}</p>
                                <p>Status: {booking.status}</p>
                            </div>
                            <div className="booking-actions">
                                {booking.status === 'pending' && (
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
                                {booking.status === 'approved' && !booking.roomNumber && (
                                    <div className="room-assignment">
                                        <input
                                            type="text"
                                            placeholder="Room Number"
                                            value={roomAssignments[booking._id] || ''}
                                            onChange={(e) => setRoomAssignments(prev => ({
                                                ...prev,
                                                [booking._id]: e.target.value
                                            }))}
                                        />
                                        <button 
                                            className="assign-btn"
                                            onClick={() => handleAssignRoom(booking._id, roomAssignments[booking._id])}
                                        >
                                            Assign Room
                                        </button>
                                    </div>
                                )}
                                {booking.roomNumber && (
                                    <p className="room-number">Room: {booking.roomNumber}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (isEditing) {
        return (
            <div className="edit-section">
                <HostelRegistrationForm 
                    initialData={hostel}
                    onSubmit={handleEditSubmit}
                    isEditing={true}
                />
            </div>
        );
    }

    return (
        <div className="my-hostel-container">
            <ToastContainer />
            <div className="header">
                <h1>My Hostel</h1>
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                    <FaEdit /> Edit Hostel
                </button>
            </div>

            <div className="tabs">
                <button 
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    Bookings
                </button>
            </div>

            <div className="content">
                {activeTab === 'overview' ? renderOverview() : renderBookings()}
            </div>
        </div>
    );
};

export default MyHostel; 