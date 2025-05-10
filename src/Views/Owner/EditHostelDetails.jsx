import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './EditHostelDetails.css';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaBed, FaUtensils } from 'react-icons/fa';

const EditHostelDetails = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hostelData, setHostelData] = useState(null);
    const [formData, setFormData] = useState({
        hostel_name: '',
        email: '',
        phone_number: '',
        hostel_location: '',
        hostel_type: '',
        features: '',
        feeStructure: '',
        rooms: [],
        foodSchedule: [],
        precise_location: {
            address: '',
            city: '',
            state: '',
            zipCode: '',
            landmarks: ''
        }
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchHostelData();
    }, []);

    const fetchHostelData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/hostels/owner/current', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setHostelData(response.data);
            setFormData({
                hostel_name: response.data.hostel_name,
                email: response.data.email,
                phone_number: response.data.phone_number,
                hostel_location: response.data.hostel_location,
                hostel_type: response.data.hostel_type,
                features: response.data.features,
                feeStructure: response.data.feeStructure,
                rooms: response.data.rooms,
                foodSchedule: response.data.foodSchedule,
                precise_location: response.data.precise_location
            });
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch hostel data');
            setLoading(false);
            toast.error('Failed to fetch hostel data');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePreciseLocationChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            precise_location: {
                ...prev.precise_location,
                [name]: value
            }
        }));
    };

    const handleRoomChange = (index, field, value) => {
        const updatedRooms = [...formData.rooms];
        updatedRooms[index] = {
            ...updatedRooms[index],
            [field]: field === 'availableRooms' || field === 'feePerMonth' ? Number(value) : value
        };
        setFormData(prev => ({
            ...prev,
            rooms: updatedRooms
        }));
    };

    const handleFoodScheduleChange = (index, meal, value) => {
        const updatedSchedule = [...formData.foodSchedule];
        updatedSchedule[index] = {
            ...updatedSchedule[index],
            [meal]: value
        };
        setFormData(prev => ({
            ...prev,
            foodSchedule: updatedSchedule
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token not found. Please login again.');
                navigate('/login');
                return;
            }

            // Validate required fields
            if (!formData.hostel_name || !formData.email || !formData.phone_number || !formData.hostel_location) {
                toast.error('Please fill in all required fields');
                setLoading(false);
                return;
            }

            // First get the hostel ID
            const hostelResponse = await axios.get('http://localhost:5000/api/hostels/owner/current', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!hostelResponse.data || !hostelResponse.data._id) {
                throw new Error('Could not find hostel ID');
            }

            // Make sure the token is properly formatted
            const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

            // Log the request details for debugging
            console.log('Updating hostel with ID:', hostelResponse.data._id);
            console.log('Request data:', formData);
            
            const response = await axios.put(
                `http://localhost:5000/api/hostels/${hostelResponse.data._id}`,
                formData,
                {
                    headers: {
                        'Authorization': formattedToken,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data) {
                // Show success message
                toast.success('Changes saved successfully');
                
                // Navigate to HostelDashboard page
                navigate('/owner/hostel-dashboard');
            }
        } catch (error) {
            console.error('Error updating hostel:', error);
            
            // More detailed error handling
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
                
                if (error.response.status === 403) {
                    toast.error('You do not have permission to update this hostel. Please contact support.');
                } else if (error.response.status === 401) {
                    toast.error('Your session has expired. Please login again.');
                    navigate('/login');
                } else {
                    toast.error(error.response.data.message || 'Failed to update hostel details');
                }
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received:', error.request);
                toast.error('No response from server. Please check your internet connection.');
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error setting up request:', error.message);
                toast.error('An error occurred while updating hostel details');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="edit-hostel-details">
            <div className="edit-header">
                <h2>Edit Hostel Details</h2>
                {!isEditing && (
                    <button 
                        className="edit-button"
                        onClick={() => setIsEditing(true)}
                    >
                        Enable Editing
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="edit-form">
                <div className="form-section">
                    <h3>Basic Information</h3>
                    <div className="form-group">
                        <label>Hostel Name</label>
                        <input
                            type="text"
                            name="hostel_name"
                            value={formData.hostel_name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            name="hostel_location"
                            value={formData.hostel_location}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Precise Location</h3>
                    <div className="form-group">
                        <label>Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.precise_location.address}
                            onChange={handlePreciseLocationChange}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.precise_location.city}
                                onChange={handlePreciseLocationChange}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="form-group">
                            <label>State</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.precise_location.state}
                                onChange={handlePreciseLocationChange}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="form-group">
                            <label>Zip Code</label>
                            <input
                                type="text"
                                name="zipCode"
                                value={formData.precise_location.zipCode}
                                onChange={handlePreciseLocationChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Room Types</h3>
                    <div className="rooms-grid">
                        {formData.rooms.map((room, index) => (
                            <div key={index} className="room-card">
                                <h4>{room.type}</h4>
                                <div className="form-group">
                                    <label>Available Rooms</label>
                                    <input
                                        type="number"
                                        value={room.availableRooms}
                                        onChange={(e) => handleRoomChange(index, 'availableRooms', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Fee per Month</label>
                                    <input
                                        type="number"
                                        value={room.feePerMonth}
                                        onChange={(e) => handleRoomChange(index, 'feePerMonth', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-section">
                    <h3>Food Schedule</h3>
                    <div className="schedule-grid">
                        {formData.foodSchedule.map((schedule, index) => (
                            <div key={index} className="schedule-card">
                                <h4>{schedule.day}</h4>
                                <div className="form-group">
                                    <label>Breakfast</label>
                                    <input
                                        type="text"
                                        value={schedule.breakfast}
                                        onChange={(e) => handleFoodScheduleChange(index, 'breakfast', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Lunch</label>
                                    <input
                                        type="text"
                                        value={schedule.lunch}
                                        onChange={(e) => handleFoodScheduleChange(index, 'lunch', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Dinner</label>
                                    <input
                                        type="text"
                                        value={schedule.dinner}
                                        onChange={(e) => handleFoodScheduleChange(index, 'dinner', e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {isEditing && (
                    <div className="form-actions">
                        <button type="button" className="cancel-button" onClick={() => setIsEditing(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="save-button">
                            Save Changes
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default EditHostelDetails; 