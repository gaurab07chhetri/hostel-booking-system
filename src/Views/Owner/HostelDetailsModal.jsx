import React from 'react';
import { FaTimes, FaBed, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUtensils } from 'react-icons/fa';
import './HostelDetailsModal.css';

const HostelDetailsModal = ({ hostel, onClose }) => {
    if (!hostel) return null;

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
        <div className="owner-modal-overlay" onClick={onClose}>
            <div className="owner-modal-content" onClick={e => e.stopPropagation()}>
                <button className="owner-close-button" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className="owner-modal-header">
                    <h2>{hostel.hostel_name}</h2>
                    <span className={`owner-status-badge ${hostel.status}`}>{hostel.status}</span>
                </div>

                <div className="owner-modal-body">
                    <div className="owner-modal-grid">
                        <div className="owner-left-section">
                            <div className="owner-main-image-container">
                                <img
                                    src={hostel.hostelImage || 'https://via.placeholder.com/400x300?text=No+Image'}
                                    alt={hostel.hostel_name}
                                    className="owner-main-hostel-image"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                    }}
                                />
                            </div>

                            <div className="owner-info-section">
                                <div className="owner-contact-info">
                                    <h3><FaMapMarkerAlt /> Location & Contact</h3>
                                    <p><strong>Location:</strong> {hostel.hostel_location}</p>
                                    <p><FaPhone /> <strong>Phone:</strong> {hostel.phone_number}</p>
                                    <p><FaEnvelope /> <strong>Email:</strong> {hostel.email}</p>
                                </div>

                                {hostel.precise_location && (
                                    <div className="owner-precise-details">
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

                                <div className="owner-hostel-details">
                                    <h3><FaBed /> Hostel Details</h3>
                                    <p><strong>Type:</strong> {hostel.hostel_type}</p>
                                    <p><strong>Features:</strong> {hostel.features}</p>
                                </div>
                            </div>
                        </div>

                        <div className="owner-right-section">
                            {hostel.rooms && hostel.rooms.length > 0 && (
                                <div className="owner-rooms-section">
                                    <h3><FaBed /> Available Rooms</h3>
                                    <div className="owner-rooms-grid">
                                        {hostel.rooms.map((room, index) => (
                                            <div key={index} className="owner-room-card">
                                                <div className="owner-room-image-container">
                                                    <img
                                                        src={room.roomImage || 'https://via.placeholder.com/200x150?text=No+Room+Image'}
                                                        alt={`${room.type} Room`}
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/200x150?text=No+Room+Image';
                                                        }}
                                                    />
                                                </div>
                                                <div className="owner-room-details">
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
                                <div className="owner-food-schedule">
                                    <h3><FaUtensils /> Food Schedule</h3>
                                    <div className="owner-food-table-container">
                                        <table className="owner-food-table">
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
                                                        <td className="owner-day-column">{schedule.day}</td>
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
            </div>
        </div>
    );
};

export default HostelDetailsModal; 