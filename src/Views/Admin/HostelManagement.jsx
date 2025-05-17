import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaSearch, FaTrash, FaMapMarkerAlt, FaPhone, FaEnvelope, FaBed, FaMale, FaFemale, FaUsers, FaHotel, FaUserCog, FaTachometerAlt, FaSignOutAlt, FaStar } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import HostelDetailsModal from './HostelDetailsModal';
import './HostelManagement.css';

const HostelManagement = () => {
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredHostels, setFilteredHostels] = useState([]);
    const [hostel_type, setHostelType] = useState('');
    const [selectedHostel, setSelectedHostel] = useState(null);
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [selectedHostelUsers, setSelectedHostelUsers] = useState([]);
    const [showUsersModal, setShowUsersModal] = useState(false);
    const [selectedHostelName, setSelectedHostelName] = useState('');
    const [hostelBookings, setHostelBookings] = useState([]);

    useEffect(() => {
        fetchHostels();
    }, []);

    const fetchHostels = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }
            
            console.log('Fetching hostels with token:', token.substring(0, 10) + '...');
            
            const response = await fetch('http://localhost:5000/api/hostels', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch hostels');
            }
            
            const data = await response.json();
            console.log('Hostels data received:', data);
            
            if (Array.isArray(data)) {
                setHostels(data);
                setFilteredHostels(data);
            } else {
                console.error('Unexpected data format:', data);
                throw new Error('Invalid data format received from server');
            }
        } catch (err) {
            console.error('Error fetching hostels:', err);
            setError(err.message);
            toast.error(`Failed to load hostels: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (hostel) => {
        setSelectedHostel(hostel);
    };

    const handleDelete = async (hostelId) => {
        if (!window.confirm('Are you sure you want to delete this hostel? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token not found. Please log in again.');
                navigate('/login');
                return;
            }
            
            console.log('Deleting hostel with ID:', hostelId);
            
            const response = await fetch(`http://localhost:5000/api/hostels/${hostelId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to delete hostel' }));
                throw new Error(errorData.message || `Server responded with status: ${response.status}`);
            }

            toast.success('Hostel deleted successfully');
            fetchHostels(); // Refresh the list
        } catch (err) {
            console.error('Error deleting hostel:', err);
            toast.error(`Failed to delete hostel: ${err.message}`);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        filterHostels(value, hostel_type);
    };

    const handleHostelTypeChange = (e) => {
        const value = e.target.value;
        setHostelType(value);
        filterHostels(searchQuery, value);
    };

    const filterHostels = (searchValue, typeValue) => {
        let filtered = hostels;

        // Filter by search query
        if (searchValue) {
            filtered = filtered.filter(hostel => 
                hostel.hostel_name.toLowerCase().includes(searchValue.toLowerCase()) ||
                hostel.hostel_location.toLowerCase().includes(searchValue.toLowerCase())
            );
        }

        // Filter by hostel type
        if (typeValue) {
            filtered = filtered.filter(hostel => hostel.hostel_type === typeValue);
        }

        setFilteredHostels(filtered);
    };

    // Calculate statistics
    const totalHostels = hostels.length;
    const boysHostels = hostels.filter(h => h.hostel_type === 'Boys').length;
    const girlsHostels = hostels.filter(h => h.hostel_type === 'Girls').length;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleViewUsers = (hostelId) => {
        navigate(`/admin/bookings?hostelId=${hostelId}`);
    };

    if (loading) return <div className="loading">Loading hostels...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="admin-dashboard">
            <div className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>Admin Panel</h2>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/admin/dashboard" className="nav-item">
                        <FaTachometerAlt />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/admin/users" className="nav-item">
                        <FaUserCog />
                        <span>User Management</span>
                    </Link>
                    <Link to="/admin/hostels" className="nav-item active">
                        <FaHotel />
                        <span>Hostel Management</span>
                    </Link>
                    <Link to="/admin/ratings" className="nav-item">
                        <FaStar />
                        <span>Reviews & Ratings</span>
                    </Link>
                    <button onClick={handleLogout} className="nav-item logout-btn">
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </button>
                </nav>
            </div>

            <div className="hostel-management-container">
                <div className="dashboard-header">
                    <h2>Hostel Management</h2>
                </div>

                <div className="stats-container">
                    <div className="stat-card">
                        <h3>Total Hostels</h3>
                        <p>{totalHostels}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Boys Hostels</h3>
                        <p>{boysHostels}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Girls Hostels</h3>
                        <p>{girlsHostels}</p>
                    </div>
                </div>

                <div className="search-bar-0">
                    <div className="search-inputs">
                        <div className="search-input-wrapper">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search hostels by name or location..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="search-input-0"
                            />
                        </div>
                        <select 
                            value={hostel_type} 
                            onChange={handleHostelTypeChange} 
                            className="hostel-type-select-0"
                        >
                            <option value="">All Hostels</option>
                            <option value="Boys">Boys Hostel</option>
                            <option value="Girls">Girls Hostel</option>
                        </select>
                    </div>
                </div>

                <div className="hostel-cards-container">
                    {filteredHostels.length > 0 ? (
                        filteredHostels.map((hostel) => (
                            <div key={hostel._id} className="hostel-card">
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
                                <div className="card-body">
  <h3 className="hostel-name">{hostel.hostel_name}</h3>
  <div className="info-grid">
    <div className="info-item">
      <FaMapMarkerAlt /> 
      <span>{hostel.hostel_location}</span>
    </div>
    <div className="info-item">
      <FaPhone />
      <span>{hostel.phone_number}</span>
    </div>
    <div className="info-item">
      <FaEnvelope />
      <span>{hostel.email}</span>
    </div>
  </div>
  
  {hostel.features && (
    <div className="features">
      {hostel.features.split(',').map((feature, index) => (
        <span key={index} className="feature-tag">
          {feature.trim()}
        </span>
      ))}
    </div>
  )}

  <div className="card-actions">
    <button 
      className="action-btn view-details-btn"
      onClick={() => handleViewDetails(hostel)}
    >
      <FaSearch />
      <span>Details</span>
    </button>
    <button 
      className="action-btn view-users-btn"
      onClick={() => handleViewUsers(hostel._id)}
    >
      <FaUsers />
      <span>Users</span>
    </button>
    <button 
      className="action-btn delete-btn"
      onClick={() => handleDelete(hostel._id)}
    >
      <FaTrash />
      <span>Delete</span>
    </button>
  </div>
</div>
                            </div>
                        ))
                    ) : (
                        <div className="no-hostels">No hostels found</div>
                    )}
                </div>

                {selectedHostel && (
                    <HostelDetailsModal 
                        hostel={selectedHostel} 
                        onClose={() => setSelectedHostel(null)} 
                    />
                )}

                {showUsersModal && (
                    <div className="modal-overlay">
                        <div className="users-modal">
                            <div className="modal-header">
                                <h3>Booked Users - {selectedHostelName}</h3>
                                <button 
                                    className="close-modal-btn"
                                    onClick={() => setShowUsersModal(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="users-list">
                                {loading ? (
                                    <div className="loading">Loading users...</div>
                                ) : hostelBookings.length > 0 ? (
                                    hostelBookings.map(booking => (
                                        <div key={booking._id} className="user-card">
                                            <div className="user-info">
                                                <h4>{booking.nameEnglish}</h4>
                                                <div className="booking-details">
                                                    <p><strong>Room:</strong> {booking.roomNumber || 'Not assigned'}</p>
                                                    <p><strong>Phone:</strong> {booking.phone}</p>
                                                    <p><strong>Email:</strong> {booking.email}</p>
                                                    <p><strong>Room Type:</strong> {booking.roomType}</p>
                                                    <p><strong>Stay Duration:</strong> {booking.stayDuration} months</p>
                                                    <p><strong>Institute:</strong> {booking.educationalInstitute || 'Not specified'}</p>
                                                    <p><strong>Status:</strong> 
                                                        <span className={`status-badge ${booking.status}`}>
                                                            {booking.status}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-users">No users have booked this hostel yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HostelManagement; 