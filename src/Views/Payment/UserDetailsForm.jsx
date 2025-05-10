import React, { useState, useEffect, useContext } from 'react';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBook, FaBed, FaUserFriends } from 'react-icons/fa';
import './UserDetailsForm.css';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import RoommateRecommendations from './RoommateRecommendations';
import { toast } from 'react-hot-toast';

const HOBBY_OPTIONS = [
    'Sports', 'Science', 'Loksewa', 'Law', 'Management',
    'Technology', 'Music', 'MBBS', 'Night Owl', 'Early Bird', 'Engineering'
];

const ROOM_TYPES = ['1-seater', '2-seater', '3-seater', '4-seater'];

const UserDetailsForm = () => {
    const { id } = useParams();
  const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [hostel, setHostel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRoommateFinder, setShowRoommateFinder] = useState(false);
    const [selectedRoommate, setSelectedRoommate] = useState(null);

    useEffect(() => {
        const fetchHostelDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5000/api/hostels/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                
                // Debug logs
                console.log('Response status:', response.status);
                console.log('Response data:', data);
                
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch hostel details');
                }
                
                // Handle different response formats
                if (data.hostel) {
                    console.log('Using Format 1: { hostel: {...} }');
                    setHostel(data.hostel);
                } else if (data.success && data.data) {
                    console.log('Using Format 2: { success: true, data: {...} }');
                    setHostel(data.data);
                } else if (typeof data === 'object' && data !== null && Object.keys(data).length > 0) {
                    console.log('Using Format 3: Direct hostel object');
                    setHostel(data);
                } else {
                    console.error('Invalid data format received:', data);
                    throw new Error('No hostel data found');
                }
            } catch (err) {
                console.error('Error fetching hostel details:', err);
                setError(err.message || 'Error fetching hostel details');
            } finally {
                setLoading(false);
            }
        };

        fetchHostelDetails();
    }, [id]);

  const [formData, setFormData] = useState({
        // Student's Basic Information
        nameEnglish: '',
        dateOfBirth: '',
        phone: '',
    email: '',
        
        // Address Information
        district: '',
        municipality: '',
        wardNo: '',
        streetAddress: '',
        
        
        educationalInstitute: '',
        classTime: '',
        levelOfStudy: '',
        stayDuration: '',
        
        // Health and Food Information
        bloodGroup: '',
        foodPreference: '',
        diseases: '',
        
        // Hobbies
        selectedHobbies: [],
        
        // Room Preference
        roomType: '',
        preferredRoommate: '',
        
        // Guardian Information
        guardianInfo: {
            father: { name: '', contact: '', occupation: '' },
            mother: { name: '', contact: '', occupation: '' },
            spouse: { name: '', contact: '', occupation: '' }
        },
        localGuardian: {
            name: '',
            contact: '',
            occupation: '',
            relation: '',
            address: ''
        }
    });

    const [suggestedRoommates, setSuggestedRoommates] = useState([]);
    const [showRoommateMatches, setShowRoommateMatches] = useState(false);
    const [roommateMatchMessage, setRoommateMatchMessage] = useState('');
    const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle hobby selection
    const handleHobbyChange = (hobby) => {
        const currentHobbies = [...formData.selectedHobbies];
        const hobbyIndex = currentHobbies.indexOf(hobby);

        if (hobbyIndex === -1 && currentHobbies.length < 4) {
            currentHobbies.push(hobby);
        } else if (hobbyIndex !== -1) {
            currentHobbies.splice(hobbyIndex, 1);
        }

      setFormData(prev => ({
        ...prev,
            selectedHobbies: currentHobbies
        }));

        // Trigger roommate matching when hobbies change
        if (currentHobbies.length > 0) {
            findPotentialRoommates(currentHobbies);
        }
    };

    // Find potential roommates based on matching hobbies
    const findPotentialRoommates = async (hobbies) => {
        try {
            // Check if hostel ID is available
            if (!id) {
                console.error('Hostel ID is missing');
                setErrors(prev => ({
                    ...prev,
                    roommate: 'Hostel information is missing. Please refresh the page.'
                }));
                return;
            }

            const response = await fetch(`http://localhost:5000/api/roommates/match`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    hostelId: id,
                    hobbies: hobbies
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to find roommates');
            }

            const data = await response.json();
            
            if (data.success) {
                setSuggestedRoommates(data.matches);
                setRoommateMatchMessage(data.message);
                setShowRoommateMatches(true);
            } else {
                setErrors(prev => ({
                    ...prev,
                    roommate: data.message || 'Failed to find roommates'
                }));
            }
        } catch (error) {
            console.error('Error finding roommates:', error);
            setErrors(prev => ({
                ...prev,
                roommate: 'Error finding roommates. Please try again.'
      }));
    }
    };

    // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
        
        // Handle nested objects
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
        }

    // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

    // Handle guardian info changes
    const handleGuardianChange = (type, field, value) => {
        setFormData(prev => ({
            ...prev,
            guardianInfo: {
                ...prev.guardianInfo,
                [type]: {
                    ...prev.guardianInfo[type],
                    [field]: value
                }
            }
        }));
    };

    // Form validation
    const validateForm = () => {
        const newErrors = {};
        
        // Basic validations
        if (!formData.nameEnglish) newErrors.nameEnglish = 'Name is required';
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.district) newErrors.district = 'District is required';
        if (formData.selectedHobbies.length === 0) newErrors.hobbies = 'Please select at least one hobby';
        if (!formData.roomType) newErrors.roomType = 'Please select a room type';

        // Add more validations as needed

        return newErrors;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            // Check if hostel ID is available
            if (!id) {
                throw new Error('Hostel ID is missing. Please refresh the page.');
            }

            // Prepare form data for submission
            const submissionData = {
                ...formData,
                // Ensure preferredRoommate is null if empty
                preferredRoommate: formData.preferredRoommate || null
            };

            // Directly submit booking without payment
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/bookings/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    hostelId: id,
                    ...submissionData
                })
            });

            const data = await response.json();
            
            if (data.success) {
                toast.success('Booking completed successfully!');
                navigate('/my-bookings');
            } else {
                throw new Error(data.message || 'Failed to complete booking');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.message || 'Failed to process booking');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFindRoommate = async () => {
        if (formData.selectedHobbies.length === 0) {
            setErrors(prev => ({
                ...prev,
                hobbies: 'Please select at least one hobby to find roommates'
            }));
      return;
    }

        try {
            const response = await fetch('http://localhost:5000/api/roommates/match', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    hostelId: id,
                    hobbies: formData.selectedHobbies,
                    roomType: formData.roomType
                })
            });

            const data = await response.json();
            
            if (data.success) {
                setSuggestedRoommates(data.matches);
                setRoommateMatchMessage(data.message);
                setShowRoommateMatches(true);
            } else {
                setErrors(prev => ({
                    ...prev,
                    roommate: data.message || 'Failed to find roommates'
                }));
            }
    } catch (error) {
            console.error('Error finding roommates:', error);
            setErrors(prev => ({
                ...prev,
                roommate: 'Error finding roommates. Please try again.'
            }));
        }
    };

    const handleRoommateSelect = (roommate) => {
        setSelectedRoommate(roommate);
        setFormData(prev => ({
            ...prev,
            preferredRoommate: roommate._id
        }));
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!hostel) return <div className="error">Hostel not found</div>;

  return (
        <div className="booking-form-container">
            <div className="booking-form-content">
                <div className="booking-form-header">
                    <h2>Book Room at {hostel.hostel_name}</h2>
                    <p className="hostel-type">{hostel.hostel_type} Hostel</p>
        </div>

                <form onSubmit={handleSubmit} className="booking-form">
                    {/* Personal Information Section */}
                    <div className="form-section">
            <h3>Personal Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name *</label>
                <input
                  type="text"
                                    name="nameEnglish"
                                    value={formData.nameEnglish}
                  onChange={handleChange}
                                    className={errors.nameEnglish ? 'error' : ''}
                />
                                {errors.nameEnglish && <span className="error-message">{errors.nameEnglish}</span>}
              </div>

                            <div className="form-group">
                                <label>Date of Birth*</label>
                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

                            <div className="form-group">
                                <label>Phone Number*</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={errors.phone ? 'error' : ''}
                                />
                                {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

                            <div className="form-group">
                                <label>Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                                    className={errors.email ? 'error' : ''}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="form-section">
                        <h3>Address Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>District*</label>
                                <input
                                    type="text"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Metro/Sub-Metro/Rural/Municipality*</label>
                                <input
                                    type="text"
                                    name="municipality"
                                    value={formData.municipality}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Ward No.*</label>
                                <input
                                    type="text"
                                    name="wardNo"
                                    value={formData.wardNo}
                                    onChange={handleChange}
                                />
              </div>

                            <div className="form-group">
                                <label>Street Name/Tole/Chowk*</label>
                <input
                                    type="text"
                                    name="streetAddress"
                                    value={formData.streetAddress}
                  onChange={handleChange}
                />
                            </div>
              </div>
            </div>

                    {/* Educational Information */}
                    <div className="form-section">
                        <h3>Educational Information (Optional)</h3>
                        <div className="form-grid">
                            <div className="form-group">
                               
                            </div>

                            <div className="form-group">
                                <label>Name of Educational Institute*</label>
                                <input
                                    type="text"
                                    name="educationalInstitute"
                                    value={formData.educationalInstitute}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Class Time*</label>
                                <input
                                    type="text"
                                    name="classTime"
                                    value={formData.classTime}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Level of Study*</label>
                                <input
                                    type="text"
                                    name="levelOfStudy"
                                    value={formData.levelOfStudy}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Time Duration to Stay in Hostel*</label>
              <input
                type="text"
                                    name="stayDuration"
                                    value={formData.stayDuration}
                onChange={handleChange}
              />
                            </div>
            </div>
          </div>

                    {/* Health and Food Section */}
                    <div className="form-section">
                        <h3>Health and Food Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Blood Group*</label>
                                <input
                                    type="text"
                                    name="bloodGroup"
                                    value={formData.bloodGroup}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Food Preference*</label>
                                <div className="food-preferences">
                                    <label>
                                        <input
                                            type="radio"
                                            name="foodPreference"
                                            value="Vegetarian"
                                            checked={formData.foodPreference === 'Vegetarian'}
                                            onChange={handleChange}
                                        />
                                        Vegetarian
                                    </label>
                                    <label>
                <input
                  type="radio"
                                            name="foodPreference"
                                            value="Only Egg"
                                            checked={formData.foodPreference === 'Only Egg'}
                  onChange={handleChange}
                />
                                        Only Egg
                </label>
                                    <label>
                <input
                  type="radio"
                                            name="foodPreference"
                                            value="Non-Vegetarian"
                                            checked={formData.foodPreference === 'Non-Vegetarian'}
                  onChange={handleChange}
                />
                                        Non-Vegetarian
                </label>
              </div>
            </div>

                            <div className="form-group">
                                <label>Mention any disease (if any)</label>
                                <textarea
                                    name="diseases"
                                    value={formData.diseases}
                                    onChange={handleChange}
                                    placeholder="List any medical conditions..."
                                />
                            </div>
                        </div>
          </div>

                    {/* Hobbies Section */}
                    <div className="form-section">
                        <h3>Select Your Hobbies (Max 4)</h3>
                        <div className="hobbies-grid">
                            {HOBBY_OPTIONS.map(hobby => (
                                <label key={hobby} className="hobby-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.selectedHobbies.includes(hobby)}
                                        onChange={() => handleHobbyChange(hobby)}
                                        disabled={!formData.selectedHobbies.includes(hobby) && formData.selectedHobbies.length >= 4}
                                    />
                                    {hobby}
                                </label>
                            ))}
                        </div>
                        {errors.hobbies && <span className="error-message">{errors.hobbies}</span>}
                        
                        <button
                            type="button"
                            className="find-roommate-button"
                            onClick={handleFindRoommate}
                        >
                            Find Roommate
                        </button>

                        {showRoommateMatches && (
                            <div className="roommate-matches-section">
                                <h4>{roommateMatchMessage}</h4>
                                {suggestedRoommates.length > 0 ? (
                                    <div className="roommates-grid">
                                        {suggestedRoommates.map(roommate => (
                                            <div 
                                                key={roommate._id} 
                                                className={`roommate-card ${selectedRoommate?._id === roommate._id ? 'selected' : ''}`}
                                            >
                                                <h5>{roommate.name}</h5>
                                                <p>Matching Hobbies: {roommate.matchingHobbies.join(', ')}</p>
                                                <p>Match Score: {Math.round(roommate.matchScore * 100)}%</p>
            <button
              type="button"
                                                    onClick={() => handleRoommateSelect(roommate)}
                                                    className={selectedRoommate?._id === roommate._id ? 'selected' : ''}
            >
                                                    {selectedRoommate?._id === roommate._id ? 'Selected' : 'Select as Roommate'}
            </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-matches-message">
                                        No matching roommates found. You can proceed with room selection and payment.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    

                    {/* Room Selection */}
                    <div className="form-section">
                        <h3>Room Selection</h3>
                        <div className="form-group">
                            <label>Select Room Type*</label>
                            <select
                                name="roomType"
                                value={formData.roomType}
                                onChange={handleChange}
                                className={errors.roomType ? 'error' : ''}
                            >
                                <option value="">Select a room type</option>
                                {ROOM_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            {errors.roomType && <span className="error-message">{errors.roomType}</span>}
                        </div>
                    </div>

                    {/* Guardian's Information */}
                    <div className="form-section">
                        <h3>Guardian's Information</h3>
                        <div className="guardian-info">
                            {/* Father's Information */}
                            <div className="guardian-group">
                                <h4>Father's Details</h4>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Name*</label>
                                        <input
                                            type="text"
                                            value={formData.guardianInfo.father.name}
                                            onChange={(e) => handleGuardianChange('father', 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Contact*</label>
                                        <input
                                            type="tel"
                                            value={formData.guardianInfo.father.contact}
                                            onChange={(e) => handleGuardianChange('father', 'contact', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Occupation*</label>
                                        <input
                                            type="text"
                                            value={formData.guardianInfo.father.occupation}
                                            onChange={(e) => handleGuardianChange('father', 'occupation', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Mother's Information */}
                            <div className="guardian-group">
                                <h4>Mother's Details</h4>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Name*</label>
                                        <input
                                            type="text"
                                            value={formData.guardianInfo.mother.name}
                                            onChange={(e) => handleGuardianChange('mother', 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Contact*</label>
                                        <input
                                            type="tel"
                                            value={formData.guardianInfo.mother.contact}
                                            onChange={(e) => handleGuardianChange('mother', 'contact', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Occupation*</label>
                                        <input
                                            type="text"
                                            value={formData.guardianInfo.mother.occupation}
                                            onChange={(e) => handleGuardianChange('mother', 'occupation', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Spouse Information */}
                            <div className="guardian-group">
                                <h4>Spouse Details (if applicable)</h4>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            value={formData.guardianInfo.spouse.name}
                                            onChange={(e) => handleGuardianChange('spouse', 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Contact</label>
                                        <input
                                            type="tel"
                                            value={formData.guardianInfo.spouse.contact}
                                            onChange={(e) => handleGuardianChange('spouse', 'contact', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Occupation</label>
                                        <input
                                            type="text"
                                            value={formData.guardianInfo.spouse.occupation}
                                            onChange={(e) => handleGuardianChange('spouse', 'occupation', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Local Guardian Information */}
                    <div className="form-section">
                        <h3>Local Guardian Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Name*</label>
                                <input
                                    type="text"
                                    name="localGuardian.name"
                                    value={formData.localGuardian.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Contact*</label>
                                <input
                                    type="tel"
                                    name="localGuardian.contact"
                                    value={formData.localGuardian.contact}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Occupation*</label>
                                <input
                                    type="text"
                                    name="localGuardian.occupation"
                                    value={formData.localGuardian.occupation}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Relation*</label>
                                <input
                                    type="text"
                                    name="localGuardian.relation"
                                    value={formData.localGuardian.relation}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Address*</label>
                                <input
                                    type="text"
                                    name="localGuardian.address"
                                    value={formData.localGuardian.address}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="form-actions">
                       
            <button
              type="submit"
                            className="proceed-button"
                            disabled={isSubmitting || !formData.roomType}
                        >
                            {isSubmitting ? 'Submitting...' : 'Proceed to Book Room'}
            </button>
          </div>

                    {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}
        </form>

                {showRoommateFinder && (
                    <RoommateRecommendations
                        hostelId={id}
                        onSelect={handleRoommateSelect}
                        selectedRoommate={selectedRoommate}
                    />
                )}
      </div>
    </div>
  );
};

export default UserDetailsForm;