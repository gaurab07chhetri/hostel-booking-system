import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import HostelRegistrationForm from '../User/HostelRegistrationForm';
import './EditHostel.css';

const EditHostel = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hostelData, setHostelData] = useState(null);

    useEffect(() => {
        // If we have hostel data passed through navigation state, use it
        if (location.state?.hostel) {
            setHostelData(location.state.hostel);
            setLoading(false);
        } else {
            // Otherwise fetch from API
            fetchHostelDetails();
        }
    }, [id, location.state]);

    const fetchHostelDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('No authentication token found. Please login again.');
                navigate('/login');
                return;
            }

            const response = await axios.get(`http://localhost:5000/api/hostels/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Check if response has the expected structure
            if (response.data && response.data.hostel) {
                setHostelData(response.data.hostel);
            } else if (response.data) {
                // If the response is the hostel data directly
                setHostelData(response.data);
            } else {
                setError('Failed to fetch hostel details: Invalid response format');
            }
        } catch (error) {
            console.error('Error fetching hostel details:', error);
            setError(error.response?.data?.message || 'Error fetching hostel details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (formData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to continue');
                return;
            }

            // Create a new FormData object for the update
            const updateData = new FormData();
            
            // Add all form fields
            updateData.append('email', formData.get('email'));
            updateData.append('phone_number', formData.get('phone_number'));
            updateData.append('hostel_name', formData.get('hostel_name'));
            updateData.append('hostel_location', formData.get('hostel_location'));
            updateData.append('hostel_type', formData.get('hostel_type'));
            updateData.append('feeStructure', formData.get('feeStructure'));
            updateData.append('features', formData.get('features'));
            updateData.append('precise_location', formData.get('precise_location'));
            updateData.append('foodSchedule', formData.get('foodSchedule'));
            updateData.append('rooms', formData.get('rooms'));

            // Add hostel image if it exists and is a File object
            const hostelImage = formData.get('hostelImage');
            if (hostelImage instanceof File) {
                updateData.append('hostelImage', hostelImage);
            }

            // Add room images if they exist and are File objects
            const rooms = JSON.parse(formData.get('rooms'));
            rooms.forEach((room, index) => {
                const roomImage = formData.get(`roomImage-${index}`);
                if (roomImage instanceof File) {
                    updateData.append(`roomImage-${index}`, roomImage);
                }
            });

            const response = await fetch(`http://localhost:5000/api/hostels/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: updateData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update hostel');
            }

            toast.success('Hostel updated successfully!');
            navigate('/admin/hostels');
        } catch (error) {
            console.error('Error updating hostel:', error);
            toast.error(error.message || 'Failed to update hostel');
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!hostelData) {
        return <div className="error">Hostel not found</div>;
    }

    return (
        <div className="edit-hostel-container">
            <div className="edit-header">
                <h2>Edit Hostel</h2>
                <button 
                    className="back-button"
                    onClick={() => navigate('/admin/hostels')}
                >
                    Back to Hostel Management
                </button>
            </div>
            <HostelRegistrationForm 
                initialData={hostelData}
                onSubmit={handleSubmit}
                isEditing={true}
            />
        </div>
    );
};

export default EditHostel; 