import React, { useState } from 'react';
import './BookingActionModal.css';

const BookingActionModal = ({ isOpen, onClose, onConfirm, action, booking }) => {
    const [formData, setFormData] = useState({
        roomNumber: '',
        rejectionReason: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (action === 'approve' && !formData.roomNumber) {
            alert('Please enter a room number');
            return;
        }
        if (action === 'reject' && !formData.rejectionReason) {
            alert('Please enter a reason for rejection');
            return;
        }
        onConfirm(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{action === 'approve' ? 'Approve Booking' : 'Reject Booking'}</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="booking-details">
                        <h3>Booking Details</h3>
                        <p><strong>Guest:</strong> {booking.nameEnglish}</p>
                        <p><strong>Room Type:</strong> {booking.roomType}</p>
                        <p><strong>Duration:</strong> {booking.stayDuration}</p>
                        <p><strong>Institute:</strong> {booking.educationalInstitute}</p>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        {action === 'approve' ? (
                            <div className="form-group">
                                <label htmlFor="roomNumber">Room Number</label>
                                <input
                                    type="text"
                                    id="roomNumber"
                                    name="roomNumber"
                                    value={formData.roomNumber}
                                    onChange={handleChange}
                                    placeholder="Enter room number"
                                    required
                                />
                            </div>
                        ) : (
                            <div className="form-group">
                                <label htmlFor="rejectionReason">Reason for Rejection</label>
                                <textarea
                                    id="rejectionReason"
                                    name="rejectionReason"
                                    value={formData.rejectionReason}
                                    onChange={handleChange}
                                    placeholder="Enter reason for rejection"
                                    required
                                    rows="4"
                                />
                            </div>
                        )}
                        
                        <div className="modal-actions">
                            <button type="button" className="cancel-button" onClick={onClose}>
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className={`confirm-button ${action === 'approve' ? 'approve' : 'reject'}`}
                            >
                                {action === 'approve' ? 'Approve' : 'Reject'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingActionModal; 