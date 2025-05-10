import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HobbySelection.css';

const HOBBY_OPTIONS = [
    'Sports', 'Science', 'Maths', 'Lok Sewa', 'Law', 'Management',
    'Technologies', 'Music', 'MBBS', 'Engineering', 'Night Owl'
];

const HobbySelection = () => {
    const [selectedHobbies, setSelectedHobbies] = useState([]);
    const [error, setError] = useState('');
    const [token, setToken] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Get token from localStorage when component mounts
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            setError('Authentication token not found. Please log in again.');
            // Redirect to login after a short delay
            setTimeout(() => {
                navigate('/');
            }, 2000);
            return;
        }
        setToken(storedToken);
    }, [navigate]);

    const handleHobbyChange = (hobby) => {
        setSelectedHobbies(prev => {
            if (prev.includes(hobby)) {
                return prev.filter(h => h !== hobby);
            } else {
                if (prev.length >= 4) {
                    setError('You can only select up to 4 hobbies');
                    return prev;
                }
                setError('');
                return [...prev, hobby];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!token) {
            setError('Authentication token not found. Please log in again.');
            return;
        }
        
        try {
            console.log('Submitting hobbies with token:', token);
            const response = await axios.put(
                'http://localhost:5000/api/hobbies/user-hobbies', 
                { hobbies: selectedHobbies },
                { 
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } 
                }
            );
            
            console.log('Response:', response.data);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error saving hobbies:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                setError(error.response.data.message || 'Failed to save hobbies');
                
                if (error.response.status === 401) {
                    localStorage.removeItem('token');
                    setTimeout(() => {
                        navigate('/');
                    }, 2000);
                }
            } else {
                setError('Network error. Please try again.');
            }
        }
    };

    const handleSkip = () => {
        navigate('/dashboard');
    };

    return (
        <div className="hobby-selection-container">
            <div className="hobby-selection-card">
                <h2>Select Your Hobbies</h2>
                <p className="description">Choose 1-4 hobbies to help us match you with compatible roommates</p>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="hobbies-grid">
                        {HOBBY_OPTIONS.map(hobby => (
                            <label key={hobby} className="hobby-checkbox">
                                <input
                                    type="checkbox"
                                    checked={selectedHobbies.includes(hobby)}
                                    onChange={() => handleHobbyChange(hobby)}
                                    disabled={!selectedHobbies.includes(hobby) && selectedHobbies.length >= 4}
                                />
                                <span>{hobby}</span>
                            </label>
                        ))}
                    </div>

                    <div className="selected-count">
                        Selected: {selectedHobbies.length}/4 (Select at least 1 hobby)
                    </div>

                    <div className="button-group">
                        <button type="button" onClick={handleSkip} className="skip-button">
                            Skip for Now
                        </button>
                        <button 
                            type="submit" 
                            className="submit-button"
                            disabled={selectedHobbies.length === 0}
                        >
                            Save Preferences
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HobbySelection; 