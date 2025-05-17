import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaHome, FaUser, FaHeart, FaBook, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import './MyBookings.css';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [userData, setUserData] = useState({
        name: localStorage.getItem('userName') || 'User',
        email: localStorage.getItem('userEmail') || '',
        phone: localStorage.getItem('userPhone') || ''
    });
    const [favoriteHostels, setFavoriteHostels] = useState([]);

    useEffect(() => {
        fetchBookings();
        // Load favorite hostels from localStorage
        const savedFavorites = localStorage.getItem('favoriteHostels');
        if (savedFavorites) {
            setFavoriteHostels(JSON.parse(savedFavorites));
        }

        // Fetch user data
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('Please login to continue');
                    navigate('/');
                    return;
                }

                const response = await fetch('http://localhost:5000/api/users/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                if (response.ok && data) {
                    setUserData({
                        name: data.name,
                        email: data.email,
                        phone: data.phone
                    });
                    // Store in localStorage for persistence
                    localStorage.setItem('userName', data.name);
                    localStorage.setItem('userEmail', data.email);
                    localStorage.setItem('userPhone', data.phone);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                if (error.response?.status === 401) {
                    toast.error('Session expired. Please login again.');
                    logout();
                    navigate('/');
                }
            }
        };

        fetchUserData();
    }, []);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/bookings/my-bookings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (response.ok) {
                const bookingsWithDetails = data.bookings.map(booking => ({
                    ...booking,
                    hostelName: booking.hostelId?.hostel_name || 'Unknown Hostel',
                    amount: booking.hostelId?.feeStructure || '500'
                }));

                console.log('Processed bookings:', bookingsWithDetails);
                setBookings(bookingsWithDetails);
            } else {
                throw new Error(data.message || 'Failed to fetch bookings');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (booking) => {
        try {
            if (!booking.amount) {
                toast.error('Invalid amount for payment');
                return;
            }

            const response = await fetch('http://localhost:5000/api/esewa/initialize-esewa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    itemId: booking._id,
                    totalPrice: booking.amount,
                    packageDetails: {
                        title: booking.hostelName,
                        duration: booking.stayDuration || '1 month',
                        category: booking.roomType
                    },
                    firstName: booking.nameEnglish.split(' ')[0],
                    lastName: booking.nameEnglish.split(' ').slice(1).join(' '),
                    email: booking.email,
                    phone: booking.phone,
                    address: booking.address || 'N/A',
                    userId: booking.userId
                })
            });

            const data = await response.json();
            
            if (data.success) {
                // Create form and submit to eSewa
                const form = document.createElement('form');
                form.setAttribute('method', 'POST');
                form.setAttribute('action', data.formAction);

                // Add form fields
                Object.entries(data.formData).forEach(([key, value]) => {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'hidden');
                    input.setAttribute('name', key);
                    input.setAttribute('value', value);
                    form.appendChild(input);
                });

                // Append form to body and submit
                document.body.appendChild(form);
                form.submit();
            } else {
                throw new Error(data.message || 'Failed to initialize payment');
            }
        } catch (err) {
            console.error('Payment error:', err);
            toast.error('Error processing payment: ' + err.message);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'status-badge approved';
            case 'rejected':
                return 'status-badge rejected';
            case 'paid':
                return 'status-badge paid';
            default:
                return 'status-badge pending';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleMenuClick = (itemId) => {
        switch (itemId) {
            case 'dashboard':
                navigate('/dashboard');
                break;
            case 'personal':
                navigate('/dashboard');
                break;
            case 'favorites':
                navigate('/dashboard');
                break;
            case 'bookings':
                navigate('/my-bookings');
                break;
            default:
                break;
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const renderBookingCard = (booking) => (
        <div key={booking._id} className="booking-card">
            <div className="booking-header">
                <h3>{booking.hostelId?.hostel_name || 'Unknown Hostel'}</h3>
                <span className={getStatusBadgeClass(booking.status)}>
                    {booking.status}
                </span>
            </div>
            
            <div className="booking-details">
                <p><strong>Room Type:</strong> {booking.roomType}</p>
                {booking.roomNumber && (
                    <div className="room-assignment-info">
                        <div className="room-number">
                            <strong>Room Number:</strong> {booking.roomNumber}
                        </div>
                        {booking.roomAssignedAt && (
                            <p className="assignment-date">
                                <strong>Assigned on:</strong> {formatDate(booking.roomAssignedAt)}
                            </p>
                        )}
                        {booking.roomAssignedBy && (
                            <p className="assigned-by">
                                <strong>Assigned by:</strong> {booking.roomAssignedBy.name}
                            </p>
                        )}
                    </div>
                )}
                <p><strong>Booking Date:</strong> {formatDate(booking.bookingDate || booking.createdAt)}</p>
                <p><strong>Amount:</strong> Rs. {booking.amount}</p>
                {booking.rejectionReason && (
                    <p className="rejection-reason">
                        <strong>Reason:</strong> {booking.rejectionReason}
                    </p>
                )}
            </div>

            <div className="booking-actions">
                {/* {booking.status === 'approved' && !booking.roomNumber && (
                    <p className="pending-message">
                        Room assignment pending
                    </p>
                )} */}
                {booking.status === 'approved' && !booking.roomNumber && (
                    <button 
                        className="pay-now-btn"
                        onClick={() => handlePayment(booking)}
                    >
                        Pay with eSewa
                    </button>
                )}
                {booking.status === 'pending' && (
                    <p className="pending-message">
                        Awaiting approval
                    </p>
                )}
            </div>
        </div>
    );

    const renderSidebar = () => (
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="user-avatar">
                    <FaUser />
                </div>
                <h3>{userData?.name || 'User'}</h3>
            </div>
            <div className="sidebar-menu">
                <button 
                    className="menu-item"
                    onClick={() => handleMenuClick('dashboard')}
                >
                    <FaHome /> Dashboard
                </button>
                <button 
                    className="menu-item"
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
                    className="menu-item active"
                    onClick={() => handleMenuClick('bookings')}
                >
                    <FaBook /> My Bookings
                </button>
                <button 
                    className="menu-item"
                    onClick={handleLogout}
                >
                    <FaSignOutAlt /> Logout
                </button>
            </div>
        </aside>
    );

    if (loading) return <div className="loading">Loading your bookings...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="dashboard-layout">
            {renderSidebar()}
            <main className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
                <div className="my-bookings-container">
                    <h2>My Bookings</h2>
                    {bookings.length === 0 ? (
                        <div className="no-bookings">
                            <p>No bookings found</p>
                            <button 
                                className="browse-hostels-btn"
                                onClick={() => navigate('/dashboard')}
                            >
                                Browse Hostels
                            </button>
                        </div>
                    ) : (
                        <div className="bookings-grid">
                            {bookings.map(booking => renderBookingCard(booking))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyBookings; 