import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './PendingBookings.css';

const PendingBookings = () => {
    const [pendingBookings, setPendingBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPendingBookings();
    }, []);

    const fetchPendingBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/bookings/pending', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (response.ok) {
                setPendingBookings(data.bookings);
            } else {
                throw new Error(data.message || 'Failed to fetch pending bookings');
            }
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveBooking = async (bookingId, roomNumber) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/bookings/approve/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ roomNumber })
            });

            const data = await response.json();
            
            if (response.ok) {
                toast.success('Booking approved successfully');
                // Remove the approved booking from the list
                setPendingBookings(prev => prev.filter(booking => booking._id !== bookingId));
            } else {
                throw new Error(data.message || 'Failed to approve booking');
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleRejectBooking = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/bookings/reject/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (response.ok) {
                toast.success('Booking rejected successfully');
                // Remove the rejected booking from the list
                setPendingBookings(prev => prev.filter(booking => booking._id !== bookingId));
            } else {
                throw new Error(data.message || 'Failed to reject booking');
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                toast.success('Booking deleted successfully');
                setPendingBookings(prev => prev.filter(booking => booking._id !== bookingId));
            } else {
                throw new Error(data.message || 'Failed to delete booking');
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="pending-bookings-container">
            <ToastContainer />
            <h2>Pending Bookings</h2>
            
            {pendingBookings.length === 0 ? (
                <p className="no-bookings">No pending bookings available</p>
            ) : (
                <div className="bookings-grid">
                    {pendingBookings.map(booking => (
                        <div key={booking._id} className="booking-card">
                            <div className="booking-header">
                                <h3>{booking.nameEnglish}</h3>
                                <span className="status-badge pending">Pending</span>
                            </div>
                            
                            <div className="booking-details">
                                <p><strong>Room Type:</strong> {booking.roomType}</p>
                                <p><strong>Phone:</strong> {booking.phone}</p>
                                <p><strong>Email:</strong> {booking.email}</p>
                                <p><strong>Institute:</strong> {booking.educationalInstitute}</p>
                                <p><strong>Food Preference:</strong> {booking.foodPreference}</p>
                                <p><strong>Stay Duration:</strong> {booking.stayDuration}</p>
                            </div>

                            <div className="room-assignment">
                                <input
                                    type="text"
                                    placeholder="Enter Room Number"
                                    className="room-number-input"
                                    onChange={(e) => booking.roomNumber = e.target.value}
                                />
                            </div>

                            <div className="booking-actions">
                                <button 
                                    className="approve-btn"
                                    onClick={() => {
                                        if (!booking.roomNumber) {
                                            toast.error('Please enter a room number');
                                            return;
                                        }
                                        handleApproveBooking(booking._id, booking.roomNumber);
                                    }}
                                >
                                    Approve
                                </button>
                                <button 
                                    className="reject-btn"
                                    onClick={() => handleRejectBooking(booking._id)}
                                >
                                    Reject
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDeleteBooking(booking._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PendingBookings; 