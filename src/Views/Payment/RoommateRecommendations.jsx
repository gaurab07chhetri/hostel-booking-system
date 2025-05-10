import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RoommateRecommendations.css';

const RoommateRecommendations = ({ onSelectRoommate, hostelId }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRoommate, setSelectedRoommate] = useState(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                if (!token) {
                    setError('Authentication token not found. Please log in again.');
                    setLoading(false);
                    return;
                }
                
                const response = await axios.get(
                    `http://localhost:5000/api/roommates/recommendations?hostelId=${hostelId}`,
                    { 
                        headers: { Authorization: `Bearer ${token}` },
                        params: {
                            hostelId,
                            matchType: 'similar'
                        }
                    }
                );
                
                const filteredRecommendations = response.data.recommendations.filter(
                    roommate => roommate.bookedHostelId === hostelId
                );
                
                setRecommendations(filteredRecommendations || []);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching roommate recommendations:', err);
                setError(err.response?.data?.message || 'Failed to fetch roommate recommendations');
                setLoading(false);
            }
        };
        
        fetchRecommendations();
    }, [hostelId]);

    const handleSelectRoommate = (roommate) => {
        setSelectedRoommate(roommate);
        if (onSelectRoommate) {
            onSelectRoommate(roommate);
        }
    };

    if (loading) {
        return (
            <div className="roommate-recommendations-container">
                <div className="loading-spinner">Loading recommendations...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="roommate-recommendations-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return (
            <div className="roommate-recommendations-container">
                <div className="no-matches">
                    <h3>No Matching Roommates Found</h3>
                    <p>We couldn't find any roommates with similar hobbies in this hostel.</p>
                    <p>You can still proceed with your booking and we'll try to match you with roommates later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="roommate-recommendations-container">
            <h3>Recommended Roommates</h3>
            <p className="recommendations-description">
                These roommates have similar hobbies and are staying in the same hostel. Select one to book together.
            </p>
            
            <div className="roommate-cards">
                {recommendations.map((roommate) => (
                    <div 
                        key={roommate._id} 
                        className={`roommate-card ${selectedRoommate?._id === roommate._id ? 'selected' : ''}`}
                        onClick={() => handleSelectRoommate(roommate)}
                    >
                        <div className="roommate-avatar">
                            {roommate.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="roommate-info">
                            <h4>{roommate.name}</h4>
                            <p className="shared-hobbies">
                                <strong>Similar Hobbies:</strong> {roommate.similarHobbies.join(', ')}
                            </p>
                            <p className="match-percentage">
                                <strong>Match:</strong> {roommate.matchPercentage}%
                            </p>
                            <p className="room-details">
                                <strong>Room:</strong> {roommate.roomNumber || 'Not assigned yet'}
                            </p>
                        </div>
                        <div className="select-indicator">
                            {selectedRoommate?._id === roommate._id ? '✓ Selected' : 'Select'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RoommateRecommendations; 