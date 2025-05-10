import React, { useState, useContext, useEffect, useRef } from 'react';
import { FaBars, FaTimes, FaUser, FaHeart, FaSignOutAlt, FaEdit, FaHotel, FaSearch, FaHome, FaBook } from 'react-icons/fa';
import { IoMdSettings } from 'react-icons/io';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Homepage.css';
import { Card, Button } from 'react-bootstrap';

const HOBBY_OPTIONS = [
    'Sports', 'Science', 'Maths', 'Lok Sewa', 'Law', 'Management',
    'Technologies', 'Music', 'MBBS', 'Engineering', 'Night Owl'
];

const Homepage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showPersonalInfo, setShowPersonalInfo] = useState(false);
    const [showBookings, setShowBookings] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [favoriteHostels, setFavoriteHostels] = useState([]);
    const [userHostel, setUserHostel] = useState(null);
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const sidebarRef = useRef(null);
    const [availableHobbies, setAvailableHobbies] = useState([]);
    const [selectedHobbies, setSelectedHobbies] = useState([]);

    // User data state
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        phone: "",
        // address: "",
        activeStatus: "Active",
        hobbies: []
    });

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

    // Fetch user data on component mount
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
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                if (error.response?.status === 401) {
                    toast.error('Session expired. Please login again.');
                    logout();
                    navigate('/');
                } else {
                    toast.error(error.response?.data?.message || 'Failed to load user data. Please try again.');
                }
                setIsLoading(false);
            }
        };

        fetchUserData();
        fetchHobbies();
    }, [navigate, logout]);

    // Fetch user's hostel if they are an owner
    useEffect(() => {
        const fetchUserHostel = async () => {
            if (!user || user.role !== 'Owner') return;
            
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('Please login to continue');
                    navigate('/');
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/hostels/my-hostel', {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.data && response.data.hostel) {
                    setUserHostel(response.data.hostel);
                }
            } catch (error) {
                console.error('Error fetching user hostel:', error);
                if (error.response?.status === 401) {
                    toast.error('Session expired. Please login again.');
                    logout();
                    navigate('/');
                } else if (error.response?.status === 404) {
                    // No hostel registered yet
                    setUserHostel(null);
                } else {
                    toast.error('Failed to fetch hostel information');
                }
            }
        };

        fetchUserHostel();
    }, [user, navigate, logout]);

    // Handle clicks outside sidebar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) && 
                !event.target.closest('.hamburger')) {
                setIsSidebarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                    phone: userData.phone,
                    // address: userData.address
                },
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update hobbies
            const hobbiesResponse = await axios.put(
                'http://localhost:5000/api/hobbies/user-hobbies',
                {
                    hobbies: userData.hobbies
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
                    hobbies: userData.hobbies
                });
                setIsEditing(false);
                toast.success('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                logout();
                navigate('/');
            } else {
                toast.error(error.response?.data?.message || 'Failed to update profile');
            }
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleSearch = () => {
        navigate('/dashboard');
    };

    const handleRegisterHostel = () => {
        navigate('/register-hostel');
    };

    const handleHomeClick = () => {
        setShowPersonalInfo(false);
        setShowBookings(false);
        navigate('/user/home');
    };

    const handleViewBookings = () => {
        setShowPersonalInfo(false);
        setShowBookings(true);
        navigate('/my-bookings');
    };

    const fetchHobbies = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            // Fetch available hobbies
            const hobbiesResponse = await axios.get('http://localhost:5000/api/hobbies/hobbies');
            setAvailableHobbies(hobbiesResponse.data);

            // Fetch user's selected hobbies
            const userHobbiesResponse = await axios.get('http://localhost:5000/api/hobbies/user-hobbies', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedHobbies(userHobbiesResponse.data || []);
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
            toast.success('Hobbies updated successfully');
        } catch (error) {
            console.error('Error updating hobbies:', error);
            toast.error('Failed to update hobbies');
        }
    };

    const handleMyHostelClick = () => {
        if (userHostel) {
            navigate('/owner/dashboard');
        } else {
            navigate('/register-hostel');
        }
    };

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="homepage">
            <ToastContainer />
            {/* Header */}
            <header className="header">
                <div className="hamburger" onClick={toggleSidebar}>
                    {isSidebarOpen ? <FaTimes /> : <FaBars />}
                </div>
                <nav className="main-nav">
                    <ul>
                        <li>
                            <button onClick={handleHomeClick} className="nav-link">
                                <FaHome /> Home
                            </button>
                        </li>
                        <li>
                            <button className="nav-link search-btn" onClick={handleSearch}>
                                <FaSearch /> Search
                            </button>
                        </li>
                        <li><a href="#about">About Us</a></li>
                        <li><a href="#contact">Contact</a></li>
                        <li>
                            <button className="register-hostel-btn" onClick={handleRegisterHostel}>
                                <FaHotel /> Register your Hostel
                            </button>
                        </li>
                    </ul>
                </nav>
            </header>

            {/* Sidebar */}
            <div ref={sidebarRef} className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                {/* <button className="close-sidebar" onClick={() => setIsSidebarOpen(false)}>
                    <FaTimes />
                </button> */}
                <div className="sidebar-header">
                    <div className="user-avatar">
                        <FaUser />
                    </div>
                    <h3>{userData.name}</h3>
                </div>
                <div className="sidebar-menu">
                    <button 
                        className={`menu-item ${!showPersonalInfo && !showBookings ? 'active' : ''}`}
                        onClick={handleHomeClick}
                    >
                        <div className="status-indicator"></div>
                        Active Status
                    </button>
                    <button 
                        className={`menu-item ${showPersonalInfo ? 'active' : ''}`}
                        onClick={() => {
                            setShowPersonalInfo(true);
                            setShowBookings(false);
                        }}
                    >
                        <FaUser /> Personal Information
                    </button>
                    <button 
                        className="menu-item"
                        onClick={() => {
                            setShowPersonalInfo(true);
                            setShowBookings(false);
                        }}
                    >
                        <FaHeart /> Favourite Hostels ({favoriteHostels.length})
                    </button>
                    <button 
                        className={`menu-item ${showBookings ? 'active' : ''}`}
                        onClick={handleViewBookings}
                    >
                        <FaBook /> My Bookings
                    </button>
                    {user?.role === 'User' && (
                        <button 
                            className="menu-item"
                            onClick={handleMyHostelClick}
                        >
                            {/* <FaHotel /> My Hostel */}
                        </button>
                    )}
                    <button className="menu-item" onClick={handleLogout}>
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
                {showPersonalInfo ? (
                    <div className="personal-info-card">
                        <div className="card-header">
                            <h2>Personal Information</h2>
                            <button className="edit-button" onClick={handleEditToggle}>
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
                                {/* <div className="form-group">
                                    <label>Address:</label>
                                    <textarea 
                                        value={userData.address}
                                        onChange={(e) => setUserData({...userData, address: e.target.value})}
                                        required
                                    />
                                </div> */}
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
                            <>
                                <div className="info-display">
                                    <p><strong>Name:</strong> {userData.name}</p>
                                    <p><strong>Email:</strong> {userData.email}</p>
                                    <p><strong>Phone:</strong> {userData.phone}</p>
                                    {/* <p><strong>Address:</strong> {userData.address}</p> */}
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

                                {/* Favorite Hostels Section */}
                                <div className="favorite-hostels-section">
                                    <h3>Favorite Hostels</h3>
                                    {favoriteHostels.length > 0 ? (
                                        <div className="favorite-hostels-list">
                                            {favoriteHostels.map(hostel => (
                                                <Card key={hostel._id} className="favorite-hostel-card">
                                                    <Card.Img 
                                                        variant="top" 
                                                        src={hostel.image_url} 
                                                        alt={hostel.hostel_name}
                                                    />
                                                    <Card.Body>
                                                        <Card.Title>{hostel.hostel_name}</Card.Title>
                                                        <Card.Text>
                                                            <strong>Location:</strong> {hostel.hostel_location}<br />
                                                            <strong>Type:</strong> {hostel.hostel_type}<br />
                                                            <strong>Fee:</strong> Rs.{hostel.feeStructure}
                                                        </Card.Text>
                                                        <Button 
                                                            variant="primary" 
                                                            size="sm"
                                                            onClick={() => navigate(`/hostel-details/${hostel._id}`)}
                                                        >
                                                            View Details
                                                        </Button>
                                                    </Card.Body>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="no-favorites">No favorite hostels yet</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="welcome-section">
                        <h1>Welcome, {userData.name}!</h1>
                        <p>Find your perfect hostel accommodation here!</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Homepage; 