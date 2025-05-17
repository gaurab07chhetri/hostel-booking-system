import React, { useEffect, useState, useContext } from 'react';
import { Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';  
import { FaSearch, FaHeart, FaShareAlt, FaEllipsisV, FaUserCircle, FaHome, FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope, FaBed, FaMale, FaFemale, FaUser, FaBook, FaSignOutAlt, FaHistory, FaCog, FaTimes, FaBars, FaEdit, FaStar, FaRegStar, FaArrowLeft, FaBookmark } from 'react-icons/fa';  
import { AuthContext } from '../../context/AuthContext';
import HostelDetailsModal from './HostelDetailsModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Dashboard.css';  

const Dashboard = () => {
    const [hostels, setHostels] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredHostels, setFilteredHostels] = useState([]);
    const [hostel_type, setHostelType] = useState('');
    const [favoriteHostels, setFavoriteHostels] = useState([]);
    const [totalHostels, setTotalHostels] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [debouncedSearch] = useState(null);
    const [selectedHostel, setSelectedHostel] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showPersonalInfo, setShowPersonalInfo] = useState(false);
    const [showBookings, setShowBookings] = useState(false);
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        phone: "",
        activeStatus: "Active",
        hobbies: []
    });
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [boysHostelsCount, setBoysHostelsCount] = useState(0);
    const [girlsHostelsCount, setGirlsHostelsCount] = useState(0);
    const [activeTab, setActiveTab] = useState('profile');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedHobbies, setSelectedHobbies] = useState([]);
    const [availableHobbies, setAvailableHobbies] = useState([]);

    // Load favorite hostels
    useEffect(() => {
        const loadFavorites = () => {
            const savedFavorites = localStorage.getItem('favoriteHostels');
            if (savedFavorites) {
                setFavoriteHostels(JSON.parse(savedFavorites));
            }
        };
        loadFavorites();
    }, []);

    // Fetch user data and hobbies on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('Please login to continue');
                    navigate('/');
                    return;
                }

                // Fetch user profile
                const profileResponse = await axios.get('http://localhost:5000/api/users/profile', {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                // Fetch user hobbies
                const userHobbiesResponse = await axios.get('http://localhost:5000/api/hobbies/user-hobbies', {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (profileResponse.data) {
                    setUserData({
                        ...profileResponse.data,
                        activeStatus: "Active",
                        hobbies: userHobbiesResponse.data || []
                    });
                    setSelectedHobbies(userHobbiesResponse.data || []);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                if (error.response?.status === 401) {
                    toast.error('Session expired. Please login again.');
                    logout();
                    navigate('/');
                } else {
                    toast.error(error.response?.data?.message || 'Failed to load user data');
                }
                setLoading(false);
            }
        };

        fetchUserData();
        fetchHobbies();
    }, [navigate, logout]);

    const fetchHobbies = async () => {
        try {
            const hobbiesResponse = await axios.get('http://localhost:5000/api/hobbies/hobbies');
            setAvailableHobbies(hobbiesResponse.data);
        } catch (error) {
            console.error('Error fetching hobbies:', error);
            toast.error('Failed to load hobbies');
        }
    };

    const handleHobbyChange = async (hobby) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to update hobbies');
                return;
            }

            let updatedHobbies;
            if (selectedHobbies.includes(hobby)) {
                updatedHobbies = selectedHobbies.filter(h => h !== hobby);
            } else {
                if (selectedHobbies.length >= 4) {
                    toast.error('Maximum 4 hobbies can be selected');
                    return;
                }
                updatedHobbies = [...selectedHobbies, hobby];
            }

            // Update hobbies in backend
            await axios.put('http://localhost:5000/api/hobbies/user-hobbies', 
                { hobbies: updatedHobbies },
                { headers: { Authorization: `Bearer ${token}` }}
            );

            setSelectedHobbies(updatedHobbies);
            setUserData({ ...userData, hobbies: updatedHobbies });
            toast.success('Hobbies updated successfully');
        } catch (error) {
            console.error('Error updating hobbies:', error);
            toast.error('Failed to update hobbies');
        }
    };

    // Function to fetch hostels with search parameters
    const fetchHostels = async (search, type) => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please login to view hostels');
                setLoading(false);
                return;
            }

            // Build query parameters
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (type) params.append('type', type);

            const url = `http://localhost:5000/api/dashboard${params.toString() ? `?${params.toString()}` : ''}`;
            console.log('Fetching hostels from:', url);

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response from server:', response.data);

            // Handle the response data
            let hostelsData = [];
            let totalCount = 0;

            if (Array.isArray(response.data)) {
                hostelsData = response.data;
                totalCount = response.data.length;
            } else if (response.data.success && Array.isArray(response.data.hostels)) {
                hostelsData = response.data.hostels;
                totalCount = response.data.totalApproved;
            } else {
                throw new Error('Invalid response format');
            }

            // Filter valid hostels
            const validHostels = hostelsData.filter(hostel => 
                hostel.hostel_name && 
                hostel.hostel_location && 
                hostel.hostel_type &&
                hostel.status === 'approved'
            );
            
            // Calculate counts
            const boysCount = validHostels.filter(h => h.hostel_type === 'Boys').length;
            const girlsCount = validHostels.filter(h => h.hostel_type === 'Girls').length;
            
            // Fetch all users to get ratings
            const usersResponse = await axios.get('http://localhost:5000/api/users/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const users = usersResponse.data;

            // Calculate average ratings for each hostel from bookings only
            const hostelsWithRatings = validHostels.map(hostel => {
                // Get ratings from bookings of all users for this hostel
                const ratingsFromBookings = users.flatMap(user =>
                    (user.bookings || [])
                        .filter(b => b.hostelId && (b.hostelId.toString() === hostel._id || b.hostelId === hostel._id))
                        .filter(b => b.rating && b.rating.value)
                        .map(b => b.rating.value)
                );

                const avgRating = ratingsFromBookings.length > 0
                    ? (ratingsFromBookings.reduce((sum, r) => sum + r, 0) / ratingsFromBookings.length).toFixed(1)
                    : 0;

                return {
                    ...hostel,
                    averageRating: parseFloat(avgRating),
                    totalRatings: ratingsFromBookings.length
                };
            });

            setHostels(hostelsWithRatings);
            setFilteredHostels(hostelsWithRatings);
            setTotalHostels(totalCount);
            setBoysHostelsCount(boysCount);
            setGirlsHostelsCount(girlsCount);
            
            if (hostelsWithRatings.length === 0) {
                setError('No approved hostels found matching your criteria');
            }
        } catch (error) {
            console.error("Error fetching hostels:", error);
            handleFetchError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        
        if (debouncedSearch) clearTimeout(debouncedSearch);
        
        setTimeout(() => {
            fetchHostels(value, hostel_type);
        }, 300);
    };

    const handleHostelTypeChange = (e) => {
        const value = e.target.value;
        setHostelType(value);
        fetchHostels(searchQuery, value);
    };

    useEffect(() => {
        fetchHostels('', '');
    }, []);

    const handleFetchError = (error) => {
        if (error.response?.status === 401) {
            setError('Please login to view hostels');
            navigate('/login');
        } else if (error.response) {
            setError(error.response.data.message || 'Failed to fetch hostels');
        } else if (error.request) {
            setError('Network error - please check your connection');
        } else {
            setError('An error occurred while fetching hostels');
        }
        setHostels([]);
        setFilteredHostels([]);
        setTotalHostels(0);
    };

    const toggleFavorite = async (hostel) => {
        try {
            const newFavorites = [...favoriteHostels];
            const index = newFavorites.findIndex(fav => fav._id === hostel._id);

            if (index === -1) {
                newFavorites.push(hostel);
            } else {
                newFavorites.splice(index, 1);
            }

            setFavoriteHostels(newFavorites);
            localStorage.setItem('favoriteHostels', JSON.stringify(newFavorites));

            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/users/favorites', {
                hostelId: hostel._id,
                action: index === -1 ? 'add' : 'remove'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

        } catch (error) {
            console.error('Error updating favorites:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isHostelFavorite = (hostelId) => {
        return favoriteHostels.some(fav => fav._id === hostelId);
    };

    const handleViewDetails = (hostel) => {
        setSelectedHostel(hostel);
        setShowModal(true);
    };

    const handleMenuClick = (itemId) => {
        switch (itemId) {
            case 'dashboard':
                setShowPersonalInfo(false);
                setShowBookings(false);
                navigate('/dashboard');
                break;
            case 'personal':
                setShowPersonalInfo(true);
                setShowBookings(false);
                break;
            case 'favorites':
                setShowPersonalInfo(true);
                setShowBookings(false);
                break;
            case 'bookings':
                setShowPersonalInfo(false);
                setShowBookings(true);
                navigate('/my-bookings');
                break;
            default:
                setShowPersonalInfo(false);
                setShowBookings(false);
                break;
        }
        setActiveTab(itemId);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to continue');
                navigate('/');
                return;
            }

            // Update profile
            const profileResponse = await axios.put(
                'http://localhost:5000/api/users/profile',
                {
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone
                },
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (profileResponse.data) {
                setUserData({
                    ...profileResponse.data,
                    activeStatus: userData.activeStatus,
                    hobbies: selectedHobbies
                });
                setIsEditing(false);
                toast.success('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    const renderContent = () => {
        if (loading) {
            return <div className="loading">Loading...</div>;
        }

        switch (activeTab) {
            case 'personal':
                return (
                    <div className="personal-info-card">
                        <div className="card-header">
                            <h2>Personal Information</h2>
                            <button className="edit-button" onClick={() => setIsEditing(!isEditing)}>
                                {isEditing ? 'Cancel' : <FaEdit />}
                            </button>
                        </div>
                        {isEditing ? (
                            <form onSubmit={handleUpdateProfile}>
                                <div className="form-group">
                                    <label>Name:</label>
                                    <input 
                                        type="text" 
                                        value={userData.name}
                                        onChange={(e) => setUserData({...userData, name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email:</label>
                                    <input 
                                        type="email" 
                                        value={userData.email}
                                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone:</label>
                                    <input 
                                        type="tel" 
                                        value={userData.phone}
                                        onChange={(e) => setUserData({...userData, phone: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Hobbies (select 1-4):</label>
                                    <div className="hobbies-grid">
                                        {availableHobbies.map(hobby => (
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
                                        Selected: {selectedHobbies.length}/4
                                    </div>
                                </div>
                                <button type="submit" className="save-button">Save Changes</button>
                            </form>
                        ) : (
                            <div className="info-display">
                                <p><strong>Name:</strong> {userData.name}</p>
                                <p><strong>Email:</strong> {userData.email}</p>
                                <p><strong>Phone:</strong> {userData.phone}</p>
                                <div className="hobbies-display">
                                    <p><strong>Hobbies:</strong></p>
                                    <div className="hobby-tags">
                                        {selectedHobbies.length > 0 ? (
                                            selectedHobbies.map(hobby => (
                                                <span key={hobby} className="hobby-tag">{hobby}</span>
                                            ))
                                        ) : (
                                            <span className="no-hobbies">No hobbies selected</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'favorites':
                return (
                    <div className="favorite-hostels-section">
                        <h3>Favorite Hostels</h3>
                        {favoriteHostels.length > 0 ? (
                            <div className="hostel-cards-container">
                                {favoriteHostels.map(hostel => (
                                    <Card key={hostel._id} className="hostel-card">
                                        <div className="card-image-container">
                                            <img 
                                                src={hostel.hostelImage || 'https://via.placeholder.com/400x300?text=No+Image'} 
                                                alt={hostel.hostel_name}
                                                className="hostel-image"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                                }}
                                            />
                                            <div className="hostel-type-badge">
                                                {hostel.hostel_type === 'Boys' ? <FaMale /> : <FaFemale />}
                                                {hostel.hostel_type}
                                            </div>
                                        </div>
                                        <Card.Body>
                                            <h3 className="hostel-name">{hostel.hostel_name}</h3>
                                            <div className="info-row">
                                                <FaMapMarkerAlt />
                                                <span>{hostel.hostel_location}</span>
                                            </div>
                                            <div className="info-row">
                                                <FaPhone />
                                                <span>{hostel.phone_number}</span>
                                            </div>
                                            <div className="info-row">
                                                <FaEnvelope />
                                                <span>{hostel.email}</span>
                                            </div>
                                            <div className="card-actions">
                                                <Button 
                                                    variant="link" 
                                                    className="favorite-btn active"
                                                    onClick={() => toggleFavorite(hostel)}
                                                >
                                                    <FaHeart />
                                                </Button>
                                                <Button 
                                                    variant="primary"
                                                    className="view-details-btn1"
                                                    onClick={() => handleViewDetails(hostel)}
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="no-favorites">No favorite hostels yet</p>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="dashboard-layout">
            <ToastContainer />
            <div className="logo-container">
                <img 
                    src="/Mero.png" 
                    alt="Mero Hostel" 
                    className="logo-image"
                />
            </div>
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="user-avatar">
                        <FaUser />
                    </div>
                    <h3>{userData?.name || 'User'}</h3>
                </div>
                <div className="sidebar-menu">
                    <button 
                        className={`menu-item ${!showPersonalInfo && !showBookings ? 'active' : ''}`}
                        onClick={() => handleMenuClick('active')}
                    >
                        {/* <div className="status-indicator"></div>
                        Active Status
                    </button>
                    <button 
                        className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => handleMenuClick('dashboard')}
                    > */}
                        <FaHome /> Dashboard
                    </button>
                    <button 
                        className={`menu-item ${showPersonalInfo && activeTab === 'personal' ? 'active' : ''}`}
                        onClick={() => handleMenuClick('personal')}
                    >
                        <FaUser /> Personal Information
                    </button>
                    <button 
                        className="menu-item"
                        onClick={() => handleMenuClick('favorites')}
                    >
                        <FaHeart /> Favourite Hostels ({favoriteHostels.length})
                    </button>
                    <button 
                        className={`menu-item ${showBookings ? 'active' : ''}`}
                        onClick={() => handleMenuClick('bookings')}
                    >
                        <FaBook /> My Bookings
                    </button>
                    <button className="menu-item" onClick={handleLogout}>
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </aside>
            <main className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
                <div className="dashboard-container">
                    {/* <div className="dashboard-header">
                        <button className="hamburger-btn" onClick={toggleSidebar}>
                            <FaBars />
                        </button>
                    </div> */}

                    {showPersonalInfo ? (
                        activeTab === 'personal' ? (
                            <div className="personal-info-card">
                                <div className="card-header">
                                    <h2>Personal Information</h2>
                                    <button className="edit-button" onClick={() => setIsEditing(!isEditing)}>
                                        {isEditing ? 'Cancel' : <FaEdit />}
                                    </button>
                                </div>
                                {isEditing ? (
                                    <form onSubmit={handleUpdateProfile}>
                                        <div className="form-group">
                                            <label>Name:</label>
                                            <input 
                                                type="text" 
                                                value={userData.name}
                                                onChange={(e) => setUserData({...userData, name: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email:</label>
                                            <input 
                                                type="email" 
                                                value={userData.email}
                                                onChange={(e) => setUserData({...userData, email: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone:</label>
                                            <input 
                                                type="tel" 
                                                value={userData.phone}
                                                onChange={(e) => setUserData({...userData, phone: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Hobbies (select 1-4):</label>
                                            <div className="hobbies-grid">
                                                {availableHobbies.map(hobby => (
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
                                                Selected: {selectedHobbies.length}/4
                                            </div>
                                        </div>
                                        <button type="submit" className="save-button">Save Changes</button>
                                    </form>
                                ) : (
                                    <div className="info-display">
                                        <p><strong>Name:</strong> {userData.name}</p>
                                        <p><strong>Email:</strong> {userData.email}</p>
                                        <p><strong>Phone:</strong> {userData.phone}</p>
                                        <div className="hobbies-display">
                                            <p><strong>Hobbies:</strong></p>
                                            <div className="hobby-tags">
                                                {selectedHobbies.length > 0 ? (
                                                    selectedHobbies.map(hobby => (
                                                        <span key={hobby} className="hobby-tag">{hobby}</span>
                                                    ))
                                                ) : (
                                                    <span className="no-hobbies">No hobbies selected</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : activeTab === 'favorites' ? (
                            <div className="favorite-hostels-section">
                                <h3>Favorite Hostels</h3>
                                {favoriteHostels.length > 0 ? (
                                    <div className="hostel-cards-container">
                                        {favoriteHostels.map(hostel => (
                                            <Card key={hostel._id} className="hostel-card">
                                                <div className="card-image-container">
                                                    <img 
                                                        src={hostel.hostelImage || 'https://via.placeholder.com/400x300?text=No+Image'} 
                                                        alt={hostel.hostel_name}
                                                        className="hostel-image"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                                        }}
                                                    />
                                                    <div className="hostel-type-badge">
                                                        {hostel.hostel_type === 'Boys' ? <FaMale /> : <FaFemale />}
                                                        {hostel.hostel_type}
                                                    </div>
                                                </div>
                                                <Card.Body>
                                                    <h3 className="hostel-name">{hostel.hostel_name}</h3>
                                                    <div className="info-row">
                                                        <FaMapMarkerAlt />
                                                        <span>{hostel.hostel_location}</span>
                                                    </div>
                                                    <div className="info-row">
                                                        <FaPhone />
                                                        <span>{hostel.phone_number}</span>
                                                    </div>
                                                    <div className="info-row">
                                                        <FaEnvelope />
                                                        <span>{hostel.email}</span>
                                                    </div>
                                                    <div className="card-actions">
                                                        <Button 
                                                            variant="link" 
                                                            className="favorite-btn active"
                                                            onClick={() => toggleFavorite(hostel)}
                                                        >
                                                            <FaHeart />
                                                        </Button>
                                                        <Button 
                                                            variant="primary"
                                                            className="view-details-btn1"
                                                            onClick={() => handleViewDetails(hostel)}
                                                        >
                                                            View Details
                                                        </Button>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-favorites">No favorite hostels yet</p>
                                )}
                            </div>
                        ) : null
                    ) : (
                        <>
                            <div className="welcome-section">
                                <h1>Welcome, {userData.name}!</h1>
                                <p>Find your perfect hostel accommodation here!</p>
                            </div>

                            <div className="statistics-section">
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <FaBuilding />
                                    </div>
                                    <div className="stat-content">
                                        <h3>Total Hostels</h3>
                                        <p>{totalHostels}</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <FaMale />
                                    </div>
                                    <div className="stat-content">
                                        <h3>Boys Hostels</h3>
                                        <p>{boysHostelsCount}</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <FaFemale />
                                    </div>
                                    <div className="stat-content">
                                        <h3>Girls Hostels </h3>
                                        <p>{girlsHostelsCount}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="search-section">
                                <div className="search-container">
                                    <div className="search-input-wrapper">
                                        <FaSearch className="search-icon" />
                                        <input 
                                            type="text"
                                            placeholder="Search hostels by name or location..."
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            className="search-input"
                                        />
                                    </div>
                                    <select 
                                        value={hostel_type} 
                                        onChange={handleHostelTypeChange} 
                                        className="hostel-type-select"
                                    >
                                        <option value="">All Hostels</option>
                                        <option value="Boys">Boys Hostel</option>
                                        <option value="Girls">Girls Hostel</option>
                                    </select>
                                </div>
                            </div>

                            {loading && <div className="loading">Loading hostels...</div>}
                            {error && <div className="error-message">{error}</div>}

                            <div className="hostel-cards-container">
                                {filteredHostels.map((hostel) => (
                                    <Card key={hostel._id} className="hostel-card">
                                        <div className="card-image-container">
                                            <img 
                                                src={hostel.hostelImage || 'https://via.placeholder.com/400x300?text=No+Image'} 
                                                alt={hostel.hostel_name}
                                                className="hostel-image"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                                }}
                                            />
                                            <div className="hostel-type-badge">
                                                {hostel.hostel_type === 'Boys' ? <FaMale /> : <FaFemale />}
                                                {hostel.hostel_type}
                                            </div>
                                        </div>
                                        <Card.Body>
                                            <h3 className="hostel-name">{hostel.hostel_name}</h3>
                                            <div className="info-row">
                                                <FaMapMarkerAlt />
                                                <span>{hostel.hostel_location}</span>
                                            </div>
                                            <div className="info-row">
                                                <FaPhone />
                                                <span>{hostel.phone_number}</span>
                                            </div>
                                            <div className="info-row">
                                                <FaEnvelope />
                                                <span>{hostel.email}</span>
                                            </div>
                                            <div className="features">
                                                <p>{hostel.features}</p>
                                            </div>
                                            
                                            <div className="rating-section">
                                                <div className="rating-stars">
                                                    {[...Array(5)].map((_, index) => (
                                                        <span key={index} className="star">
                                                            {index < hostel.averageRating ? <FaStar /> : <FaRegStar />}
                                                        </span>
                                                    ))}
                                                </div>
                                                <span className="rating-count">
                                                    {hostel.totalRatings ? `(${hostel.totalRatings} reviews)` : 'No reviews yet'}
                                                </span>
                                            </div>

                                            <div className="card-actions">
                                                <Button 
                                                    variant="link" 
                                                    className={`favorite-btn ${isHostelFavorite(hostel._id) ? 'active' : ''}`}
                                                    onClick={() => toggleFavorite(hostel)}
                                                >
                                                    <FaHeart />
                                                </Button>
                                                <Button 
                                                    variant="primary"
                                                    className="view-details-btn1"
                                                    onClick={() => handleViewDetails(hostel)}
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                ))}
                                {!loading && filteredHostels.length === 0 && (
                                    <div className="no-hostels">No hostels found</div>
                                )}
                            </div>
                        </>
                    )}

                    <HostelDetailsModal
                        hostel={selectedHostel}
                        show={showModal}
                        onClose={() => setShowModal(false)}
                        onRatingSubmitted={() => fetchHostels(searchQuery, hostel_type)}
                    />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
