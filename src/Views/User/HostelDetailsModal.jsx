import React, { useState, useEffect } from 'react';
import { FaBed, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUtensils, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import './HostelDetailsModal.css';

const HostelDetailsModal = ({ hostel, show, onClose }) => {
    const navigate = useNavigate();
    const [hasExistingBooking, setHasExistingBooking] = useState(false);

    useEffect(() => {
        checkExistingBooking();
    }, []);

    const checkExistingBooking = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/bookings/my-bookings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (response.ok && data.bookings && data.bookings.length > 0) {
                // Check if there are any active bookings (pending, approved, or paid)
                const activeBookings = data.bookings.filter(booking => 
                    ['pending', 'approved', 'paid'].includes(booking.status.toLowerCase())
                );
                setHasExistingBooking(activeBookings.length > 0);
            }
        } catch (error) {
            console.error('Error checking existing bookings:', error);
        }
    };

    const handleBookNow = () => {
        if (hasExistingBooking) {
            toast.error('You already have an active booking. Please wait for it to be processed or contact support for assistance.');
            return;
        }
        navigate(`/booking/${hostel._id}`);
        onClose();
    };

    if (!hostel || !show) return null;

    // Sort days of the week starting from Sunday
    const sortedFoodSchedule = hostel.foodSchedule?.sort((a, b) => {
        const daysOrder = {
            'Sunday': 0,
            'Monday': 1,
            'Tuesday': 2,
            'Wednesday': 3,
            'Thursday': 4,
            'Friday': 5,
            'Saturday': 6
        };
        return daysOrder[a.day] - daysOrder[b.day];
    });

    return (
        <div className="user-modal-overlay" onClick={onClose}>
            <Toaster position="top-center" />
            <div className="user-modal-content" onClick={e => e.stopPropagation()}>
                <div className="user-modal-header">
                    <h2>{hostel.hostel_name}</h2>
                    {/* <button className="user-book-now-btn header-btn" onClick={handleBookNow}>
                        Book Now <FaArrowRight />
                    </button> */}
                </div>

                <div className="user-modal-body">
                    <div className="user-modal-grid">
                        <div className="user-left-section">
                            <div className="user-main-image-container">
                                <img
                                    src={hostel.hostelImage || 'https://via.placeholder.com/400x300?text=No+Image'}
                                    alt={hostel.hostel_name}
                                    className="user-main-hostel-image"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                    }}
                                />
                            </div>

                            <div className="user-info-section">
                                <div className="user-contact-info">
                                    <h3><FaMapMarkerAlt /> Location & Contact</h3>
                                    <p><strong>Location:</strong> {hostel.hostel_location}</p>
                                    <p><FaPhone /> <strong>Phone:</strong> {hostel.phone_number}</p>
                                    <p><FaEnvelope /> <strong>Email:</strong> {hostel.email}</p>
                                </div>

                                {hostel.precise_location && (
                                    <div className="user-precise-details">
                                        <h4>Precise Location</h4>
                                        <p><strong>Address:</strong> {hostel.precise_location.address}</p>
                                        <p><strong>City:</strong> {hostel.precise_location.city}</p>
                                        <p><strong>State:</strong> {hostel.precise_location.state}</p>
                                        <p><strong>Zip Code:</strong> {hostel.precise_location.zipCode}</p>
                                        {hostel.precise_location.landmarks && (
                                            <p><strong>Landmarks:</strong> {hostel.precise_location.landmarks}</p>
                                        )}
                                    </div>
                                )}

                                <div className="user-hostel-details">
                                    <h3><FaBed /> Hostel Details</h3>
                                    <p><strong>Type:</strong> {hostel.hostel_type}</p>
                                    <p><strong>Features:</strong> {hostel.features}</p>
                                </div>
                            </div>
                        </div>

                        <div className="user-right-section">
                            {hostel.rooms && hostel.rooms.length > 0 && (
                                <div className="user-rooms-section">
                                    <h3><FaBed /> Available Rooms</h3>
                                    <div className="user-rooms-grid">
                                        {hostel.rooms.map((room, index) => (
                                            <div key={index} className="user-room-card">
                                                <div className="user-room-image-container">
                                                    <img
                                                        src={room.roomImage || 'https://via.placeholder.com/200x150?text=No+Room+Image'}
                                                        alt={`${room.type} Room`}
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/200x150?text=No+Room+Image';
                                                        }}
                                                    />
                                                </div>
                                                <div className="user-room-details">
                                                    <h4>{room.type}</h4>
                                                    <p><strong>Available:</strong> {room.availableRooms} rooms</p>
                                                    <p><strong>Monthly Fee:</strong> Rs. {room.feePerMonth}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {sortedFoodSchedule && sortedFoodSchedule.length > 0 && (
                                <div className="user-food-schedule">
                                    <h3><FaUtensils /> Food Schedule</h3>
                                    <div className="user-food-table-container">
                                        <table className="user-food-table">
                                            <thead>
                                                <tr>
                                                    <th>Day</th>
                                                    <th>Breakfast</th>
                                                    <th>Lunch</th>
                                                    <th>Dinner</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sortedFoodSchedule.map((schedule, index) => (
                                                    <tr key={index}>
                                                        <td className="user-day-column">{schedule.day}</td>
                                                        <td>{schedule.breakfast}</td>
                                                        <td>{schedule.lunch}</td>
                                                        <td>{schedule.dinner}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="user-modal-footer">
                    <button className="user-close-btn" onClick={onClose}>Close</button>
                    <button 
                        className="user-book-now-btn"
                        onClick={handleBookNow}
                    >
                        Book Now <FaArrowRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HostelDetailsModal; 