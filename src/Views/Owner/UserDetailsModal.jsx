import React from 'react';
import './UserDetailsModal.css';

const UserDetailsModal = ({ booking, onClose }) => {
    if (!booking) return null;

    return (
        <div className="user-details-modal-overlay">
            <div className="user-details-modal">
                <div className="modal-header">
                    <h2>Booking Details</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                
                <div className="modal-body">
                    <div className="detail-section">
                        <h3>Basic Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Name:</label>
                                <span>{booking.nameEnglish || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <label>Date of Birth:</label>
                                <span>{booking.dateOfBirth ? new Date(booking.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <label>Phone:</label>
                                <span>{booking.phone || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <label>Email:</label>
                                <span>{booking.email || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Address Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>District:</label>
                                <span>{booking.district || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <label>Municipality:</label>
                                <span>{booking.municipality || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <label>Ward No:</label>
                                <span>{booking.wardNo || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <label>Street Address:</label>
                                <span>{booking.streetAddress || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Educational Information Optional</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Institute:</label>
                                <span>{booking.educationalInstitute || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <label>Class Time:</label>
                                <span>{booking.classTime || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <label>Level of Study:</label>
                                <span>{booking.levelOfStudy || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Room & Stay Details</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Room Type:</label>
                                <span>{booking.roomType || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <label>Room Number:</label>
                                <span>{booking.roomNumber || 'Not assigned'}</span>
                            </div>
                            <div className="info-item">
                                <label>Stay Duration:</label>
                                <span>{booking.stayDuration || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <label>Booking Date:</label>
                                <span>{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Health & Preferences</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Blood Group:</label>
                                <span>{booking.bloodGroup || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <label>Food Preference:</label>
                                <span>{booking.foodPreference || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <label>Diseases:</label>
                                <span>{booking.diseases || 'None'}</span>
                            </div>
                            <div className="info-item">
                                <label>Hobbies:</label>
                                <span>{booking.selectedHobbies?.join(', ') || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Guardian Information</h3>
                        <div className="guardian-info">
                            <div className="guardian-section">
                                <h4>Father's Details</h4>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Name:</label>
                                        <span>{booking.guardianInfo?.father?.name || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Contact:</label>
                                        <span>{booking.guardianInfo?.father?.contact || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Occupation:</label>
                                        <span>{booking.guardianInfo?.father?.occupation || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="guardian-section">
                                <h4>Mother's Details</h4>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Name:</label>
                                        <span>{booking.guardianInfo?.mother?.name || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Contact:</label>
                                        <span>{booking.guardianInfo?.mother?.contact || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Occupation:</label>
                                        <span>{booking.guardianInfo?.mother?.occupation || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="guardian-section">
                                <h4>Local Guardian's Details</h4>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Name:</label>
                                        <span>{booking.localGuardian?.name || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Contact:</label>
                                        <span>{booking.localGuardian?.contact || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Relation:</label>
                                        <span>{booking.localGuardian?.relation || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Address:</label>
                                        <span>{booking.localGuardian?.address || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModal; 