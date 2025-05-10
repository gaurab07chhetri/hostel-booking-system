import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaHotel, FaEdit, FaBook, FaSignOutAlt, FaBars, FaTimes, FaMapMarkerAlt, FaPhone, FaEnvelope, FaBed, FaTrash } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import './HostelDashboard.css';
import { toast } from 'react-hot-toast';
import HostelDetailsModal from './HostelDetailsModal';
import EditHostelDetails from './EditHostelDetails';
import BookingActionModal from './BookingActionModal';
import UserDetailsModal from './UserDetailsModal';

const HostelDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [userData, setUserData] = useState(null);
    const [hostelData, setHostelData] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingHostel, setIsEditingHostel] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [hostelFormData, setHostelFormData] = useState({
        hostel_name: '',
        hostel_location: '',
        hostel_type: '',
        feeStructure: '',
        features: ''
    });
    const [availableRooms, setAvailableRooms] = useState({});
    const [selectedHostel, setSelectedHostel] = useState(null);
    const [bookingActionModal, setBookingActionModal] = useState({
        isOpen: false,
        action: null,
        booking: null
    });
    const [roomAssignModal, setRoomAssignModal] = useState({
        isOpen: false,
        booking: null
    });
    const [selectedBooking, setSelectedBooking] = useState(null);

    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchUserData(),
                    fetchHostelData()
                ]);
                
                // Calculate available rooms
                if (hostelData && hostelData.rooms) {
                    const roomAvailability = {};
                    hostelData.rooms.forEach(room => {
                        const bookedCount = bookings.filter(
                            booking => booking.status === 'approved' && 
                            booking.roomType === room.type
                        ).length;
                        roomAvailability[room.type] = room.availableRooms - bookedCount;
                    });
                    setAvailableRooms(roomAvailability);
                }
                
                setError(null);
            } catch (err) {
                setError(err.message || 'An error occurred while fetching data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Add a separate useEffect to fetch bookings when hostelData changes
    useEffect(() => {
        if (hostelData && hostelData._id) {
            // Store hostelId in localStorage for future use
            localStorage.setItem('hostelId', hostelData._id);
            // Fetch bookings
            fetchBookings();
        }
    }, [hostelData]);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserData(response.data);
            setFormData({
                name: response.data.name,
                email: response.data.email,
                phone: response.data.phone
            });
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError('Failed to load user data');
        }
    };

    const fetchHostelData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please login to continue');
                navigate('/login');
                return;
            }

            // Fetch hostel data directly using the authenticated endpoint
            const hostelResponse = await axios.get('http://localhost:5000/api/hostels/owner/current', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (hostelResponse.data) {
                setHostelData(hostelResponse.data);
                
                // Calculate available rooms
                const availableRooms = {};
                if (hostelResponse.data.rooms) {
                    hostelResponse.data.rooms.forEach(room => {
                        availableRooms[room.type] = room.availableRooms;
                    });
                }
                setAvailableRooms(availableRooms);
            } else {
                setError('No hostel found');
                navigate('/register-hostel');
            }
        } catch (error) {
            console.error('Error fetching hostel data:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please login again');
                navigate('/login');
            } else if (error.response?.status === 404) {
                setError('No hostel found. Please register a hostel first.');
                navigate('/register-hostel');
            } else {
                setError(error.message || 'Failed to fetch hostel data');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            // Get hostelId from localStorage or from hostelData
            let hostelId = localStorage.getItem('hostelId');
            
            // If hostelId is not in localStorage, try to get it from hostelData
            if (!hostelId && hostelData && hostelData._id) {
                hostelId = hostelData._id;
                // Store it in localStorage for future use
                localStorage.setItem('hostelId', hostelId);
            }
            
            // If we still don't have a hostelId, we can't fetch bookings
            if (!hostelId) {
                console.error('No hostel ID available');
                setBookings([]);
                setLoading(false);
                return;
            }
            
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/bookings/hostel/${hostelId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            // Ensure bookings is always an array
            if (response.data && Array.isArray(response.data)) {
                setBookings(response.data);
            } else if (response.data && response.data.bookings && Array.isArray(response.data.bookings)) {
                setBookings(response.data.bookings);
            } else {
                console.error('Unexpected bookings data format:', response.data);
                setBookings([]);
            }
        } catch (err) {
            setError('Failed to fetch bookings. Please try again later.');
            console.error('Error fetching bookings:', err);
            setBookings([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/users/profile', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsEditing(false);
            fetchUserData();
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Failed to update profile');
        }
    };

    const handleUpdateHostel = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/hostels/${hostelData._id}`, hostelFormData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsEditingHostel(false);
            fetchHostelData();
        } catch (err) {
            console.error('Error updating hostel:', err);
            setError('Failed to update hostel');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const renderContent = () => {
        if (loading) {
            return <div className="loading">Loading...</div>;
        }

        if (error) {
            return <div className="error-container">{error}</div>;
        }

        if (!hostelData) {
            return (
                <div className="no-hostel-container">
                    <h2>No Hostel Registered</h2>
                    <p>You haven't registered any hostel yet. Would you like to register one now?</p>
                    <button className="register-hostel-btn" onClick={() => navigate('/register-hostel')}>
                        Register Hostel
                    </button>
                </div>
            );
        }

        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="dashboard-content">
                        <div className="stats-container">
                            <div className="stat-card">
                                <h3>Total Rooms</h3>
                                <p>{hostelData.rooms.reduce((total, room) => total + room.availableRooms, 0)}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Available Rooms</h3>
                                <p>{Object.values(availableRooms).reduce((total, count) => total + count, 0)}</p>
                            </div>
                            {/* <div className="stat-card">
                                <h3>Pending Bookings</h3>
                                <p>{bookings.filter(booking => booking.status === 'pending').length}</p>
                            </div> */}
                        </div>

                        <div className="hostel-card">
                            <div className="hostel-card-header">
                                <img 
                                    src={hostelData.hostelImage || 'https://via.placeholder.com/400x200?text=No+Image'} 
                                    alt={hostelData.hostel_name}
                                    className="hostel-image"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                                    }}
                                />
                                <div className="hostel-status">
                                    <span className={`status-badge ${hostelData.status}`}>
                                        {hostelData.status}
                                    </span>
                                </div>
                            </div>
                            <div className="hostel-card-body">
                                <h2>{hostelData.hostel_name}</h2>
                                <div className="hostel-info-grid">
                                    <div className="info-item">
                                        <FaMapMarkerAlt />
                                        <span>{hostelData.hostel_location}</span>
                                    </div>
                                    <div className="info-item">
                                        <FaPhone />
                                        <span>{hostelData.phone_number}</span>
                                    </div>
                                    <div className="info-item">
                                        <FaEnvelope />
                                        <span>{hostelData.email}</span>
                                    </div>
                                    <div className="info-item">
                                        <FaBed />
                                        <span>{hostelData.hostel_type}</span>
                                    </div>
                                </div>
                                <div className="hostel-features">
                                    <h3>Features</h3>
                                    <p>{hostelData.features}</p>
                                </div>
                                <div className="room-types">
                                    <h3>Room Types</h3>
                                    <div className="room-grid">
                                        {hostelData.rooms.map((room, index) => (
                                            <div key={index} className="room-type-card">
                                                <h4>{room.type}</h4>
                                                <p>Available: {room.availableRooms}</p>
                                                <p>Fee: Rs.{room.feePerMonth}/month</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button className="view-details-btn" onClick={() => setSelectedHostel(hostelData)}>
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'personal':
                return (
                    <div className="personal-info">
                        <h2>Personal Information</h2>
                        {isEditing ? (
                            <form onSubmit={handleUpdateProfile}>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="save-btn">Save Changes</button>
                            </form>
                        ) : (
                            <div className="info-display">
                                <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
                                <p><strong>Name:</strong> {userData?.name}</p>
                                <p><strong>Email:</strong> {userData?.email}</p>
                                <p><strong>Phone:</strong> {userData?.phone}</p>
                            </div>
                        )}
                    </div>
                );

            case 'edit':
                return <EditHostelDetails />;

            case 'hostel':
                if (!hostelData) {
                    return (
                        <div className="no-hostel-message">
                            <h2>No Hostel Registered</h2>
                            <p>You haven't registered a hostel yet. Register now to start managing your property.</p>
                            <button onClick={() => navigate('/register-hostel')}>Register Hostel</button>
                        </div>
                    );
                }

                return (
                    <div className="hostel-info">
                        <h2>Hostel Information</h2>
                        {isEditingHostel ? (
                            <form onSubmit={handleUpdateHostel}>
                                <div className="form-group">
                                    <label>Hostel Name</label>
                                    <input
                                        type="text"
                                        value={hostelFormData.hostel_name}
                                        onChange={(e) => setHostelFormData({ ...hostelFormData, hostel_name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        value={hostelFormData.hostel_location}
                                        onChange={(e) => setHostelFormData({ ...hostelFormData, hostel_location: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Type</label>
                                    <select
                                        value={hostelFormData.hostel_type}
                                        onChange={(e) => setHostelFormData({ ...hostelFormData, hostel_type: e.target.value })}
                                    >
                                        <option value="Boys">Boys</option>
                                        <option value="Girls">Girls</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Features</label>
                                    <textarea
                                        value={hostelFormData.features}
                                        onChange={(e) => setHostelFormData({ ...hostelFormData, features: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="save-btn">Save Changes</button>
                            </form>
                        ) : (
                            <div className="info-display">
                                <button className="edit-btn" onClick={() => setIsEditingHostel(true)}>Edit</button>
                                <p><strong>Hostel Name:</strong> {hostelData.hostel_name}</p>
                                <p><strong>Location:</strong> {hostelData.hostel_location}</p>
                                <p><strong>Type:</strong> {hostelData.hostel_type}</p>
                                <p><strong>Features:</strong> {hostelData.features}</p>
                            </div>
                        )}
                    </div>
                );

            case 'bookings':
                return (
                    <div className="bookings-tab">
                        
                        {loading ? (
                            <div className="loading">Loading bookings...</div>
                        ) : error ? (
                            <div className="error">{error}</div>
                        ) : !bookings || bookings.length === 0 ? (
                            <div className="no-bookings">No bookings found</div>
                        ) : (
                            renderBookingsTable()
                        )}
                        {selectedBooking && (
                            <UserDetailsModal
                                booking={selectedBooking}
                                onClose={() => setSelectedBooking(null)}
                            />
                        )}
                        {roomAssignModal.isOpen && (
                            <RoomAssignmentModal
                                isOpen={roomAssignModal.isOpen}
                                booking={roomAssignModal.booking}
                                onClose={() => setRoomAssignModal({ isOpen: false, booking: null })}
                                onAssign={handleRoomAssignment}
                            />
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    const renderBookingsTable = () => {
        return (
            <div className="bookings-section">
                <h2>Bookings Management</h2>
                <div className="bookings-table-container">
                    <table className="bookings-table">
                        <thead>
                            <tr>
                                <th>Guest Name</th>
                                <th>Room Type</th>
                                <th>Booking Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking._id}>
                                    <td>{booking.nameEnglish}</td>
                                    <td>{booking.roomType}</td>
                                    <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge ${booking.status.toLowerCase()}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="action-buttons">
                                        <button
                                            className="view-details-button"
                                            onClick={() => handleViewDetails(booking)}
                                        >
                                            View Details
                                        </button>
                                        {booking.status === 'pending' && (
                                            <>
                                                <button
                                                    className="approve-button"
                                                    onClick={() => handleApprove(booking._id)}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className="reject-button"
                                                    onClick={() => handleReject(booking._id)}
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDeleteBooking(booking._id)}
                                        >
                                            <FaTrash /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const handleApprove = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/bookings/${bookingId}/approve`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            fetchBookings(); // Refresh the bookings list
        } catch (err) {
            console.error('Error approving booking:', err);
            alert('Failed to approve booking. Please try again.');
        }
    };

    const handleReject = async (bookingId) => {
        const reason = prompt('Please enter a reason for rejection:');
        if (reason) {
        try {
            const token = localStorage.getItem('token');
                await axios.put(`http://localhost:5000/api/bookings/${bookingId}/reject`, 
                    { reason },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                fetchBookings(); // Refresh the bookings list
            } catch (err) {
                console.error('Error rejecting booking:', err);
                alert('Failed to reject booking. Please try again.');
            }
        }
    };

    const handleBookingActionConfirm = async (formData) => {
        try {
            const { action, booking } = bookingActionModal;
            
            if (action === 'approve') {
                const response = await axios.put(`/api/bookings/${booking._id}/approve`, {
                    roomNumber: formData.roomNumber
                }, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.data.success) {
                    toast.success('Booking approved successfully');
                    fetchBookings();
                }
            } else if (action === 'reject') {
                const response = await axios.put(`/api/bookings/${booking._id}/reject`, {
                    rejectionReason: formData.rejectionReason
                }, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
            
            if (response.data.success) {
                    toast.success('Booking rejected successfully');
                    fetchBookings();
                }
            }
            
            // Close the modal
            setBookingActionModal({
                isOpen: false,
                action: null,
                booking: null
            });
        } catch (error) {
            console.error(`Error ${bookingActionModal.action}ing booking:`, error);
            toast.error(error.response?.data?.message || `Failed to ${bookingActionModal.action} booking`);
        }
    };

    const closeBookingActionModal = () => {
        setBookingActionModal({
            isOpen: false,
            action: null,
            booking: null
        });
    };

    const handleAssignRoom = async (booking) => {
        try {
            const roomNumber = prompt('Enter room number:');
            if (!roomNumber) return;

            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/bookings/${booking._id}/assign-room`,
                { roomNumber },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                toast.success('Room assigned successfully');
                fetchBookings(); // Refresh the bookings list
            } else {
                toast.error(response.data.message || 'Failed to assign room');
            }
        } catch (error) {
            console.error('Error assigning room:', error);
            toast.error(error.response?.data?.message || 'Failed to assign room');
        }
    };

    const handleRoomAssignment = async (bookingId, roomNumber) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/bookings/${bookingId}/approve`, 
                { roomNumber },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            setRoomAssignModal({ isOpen: false, booking: null });
            fetchBookings(); // Refresh the bookings list
            toast.success('Room assigned successfully');
        } catch (err) {
            console.error('Error assigning room:', err);
            toast.error('Failed to assign room. Please try again.');
        }
    };

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
    };

    const handleDeleteBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                toast.success('Booking deleted successfully');
                fetchBookings(); // Refresh the bookings list
            } else {
                throw new Error(response.data.message || 'Failed to delete booking');
            }
        } catch (error) {
            console.error('Error deleting booking:', error);
            toast.error(error.response?.data?.message || 'Failed to delete booking');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="hostel-owner-dashboard">
            <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h2>Hostel Owner</h2>
                </div>
                <div className="sidebar-menu">
                    <button 
                        className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <FaHotel /> Dashboard
                    </button>
                    <button 
                        className={`menu-item ${activeTab === 'personal' ? 'active' : ''}`}
                        onClick={() => setActiveTab('personal')}
                    >
                        <FaUser /> Personal Information
                    </button>
                    <button 
                        className={`menu-item ${activeTab === 'edit' ? 'active' : ''}`}
                        onClick={() => setActiveTab('edit')}
                    >
                        {/* <FaEdit /> Edit Hostel
                    </button>
                    <button 
                        className={`menu-item ${activeTab === 'hostel' ? 'active' : ''}`}
                        onClick={() => setActiveTab('hostel')}
                    > */}
                        <FaEdit /> Edit Hostel
                    </button>
                                    <button 
                        className={`menu-item ${activeTab === 'bookings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('bookings')}
                                    >
                        <FaBook /> Bookings
                                    </button>
                                    <button 
                        className="menu-item logout-btn"
                        onClick={handleLogout}
                                    >
                        <FaSignOutAlt /> Logout
                                    </button>
                </div>
            </div>
            <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                {renderContent()}
            </div>
            {selectedHostel && (
                <HostelDetailsModal
                    hostel={selectedHostel}
                    onClose={() => setSelectedHostel(null)}
                />
            )}
            {bookingActionModal.isOpen && (
                <BookingActionModal
                    isOpen={bookingActionModal.isOpen}
                    onClose={closeBookingActionModal}
                    onConfirm={handleBookingActionConfirm}
                    action={bookingActionModal.action}
                    booking={bookingActionModal.booking}
                />
            )}
        </div>
    );
};

const RoomAssignmentModal = ({ isOpen, booking, onClose, onAssign }) => {
    const [roomNumber, setRoomNumber] = useState('');

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Assign Room</h3>
                <div className="modal-body">
                    <div className="student-info">
                        <p><strong>Student:</strong> {booking.nameEnglish}</p>
                        <p><strong>Room Type:</strong> {booking.roomType}</p>
                    </div>
                    <div className="form-group">
                        <label>Room Number:</label>
                        <input
                            type="text"
                            value={roomNumber}
                            onChange={(e) => setRoomNumber(e.target.value)}
                            placeholder="Enter room number"
                        />
                    </div>
                </div>
                <div className="modal-actions">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button 
                        className="assign-btn" 
                        onClick={() => onAssign(booking._id, roomNumber)}
                        disabled={!roomNumber}
                    >
                        Assign Room
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HostelDashboard; 