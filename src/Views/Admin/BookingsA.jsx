import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  FaSearch,
  FaTrash,
  FaCheck,
  FaTimes,
  FaEye,
  FaHotel,
  FaUserCog,
  FaTachometerAlt,
  FaSignOutAlt,
  FaFilter,
  FaUsers,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaBed,
  FaGraduationCap,
  FaCalendarAlt
} from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import './BookingsA.css';

const BookingsA = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hostelFilter, setHostelFilter] = useState('all');
  const [hostels, setHostels] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    // Get hostelId from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const hostelId = queryParams.get('hostelId');
    if (hostelId) {
      setHostelFilter(hostelId);
    }
    fetchBookings(hostelId);
    fetchHostels();
  }, [location.search]);

  const fetchHostels = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/hostels', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHostels(response.data);
    } catch (error) {
      console.error('Error fetching hostels:', error);
      toast.error('Failed to fetch hostels');
    }
  };

  const fetchBookings = async (hostelId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let response;
      if (hostelId) {
        response = await axios.get(`http://localhost:5000/api/bookings/hostel/${hostelId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(response.data.bookings || []);
      } else {
        response = await axios.get('http://localhost:5000/api/bookings/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(response.data.bookings || []);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings');
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Booking deleted successfully');
      fetchBookings();
    } catch (err) {
      console.error('Error deleting booking:', err);
      toast.error('Failed to delete booking');
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      (booking.nameEnglish && booking.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (booking.email && booking.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (booking.phone && booking.phone.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    // Support both string and object for hostelId
    let bookingHostelId = booking.hostelId;
    if (typeof bookingHostelId === 'object' && bookingHostelId !== null) {
      bookingHostelId = bookingHostelId._id;
    }
    const matchesHostel = hostelFilter === 'all' || bookingHostelId === hostelFilter;

    return matchesSearch && matchesStatus && matchesHostel;
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
          <Link to="/admin/hostels" className="nav-item">
            <FaHotel />
            <span>Hostel Management</span>
          </Link>
          <Link to="/admin/bookings" className="nav-item active">
            <FaUsers />
            <span>Bookings</span>
          </Link>
          <button onClick={handleLogout} className="nav-item logout-btn">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      <div className="bookings-container">
        <div className="dashboard-header">
         
          {hostelFilter !== 'all' && (
            <p className="selected-hostel">
              <h2>Viewing bookings for: {hostels.find(h => h._id === hostelFilter)?.hostel_name}</h2>
            </p>
          )}
        </div>

        <div className="filters-section">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-controls">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={hostelFilter}
              onChange={(e) => setHostelFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Hostels</option>
              {hostels.map(hostel => (
                <option key={hostel._id} value={hostel._id}>
                  {hostel.hostel_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bookings-grid">
          {loading ? (
            <div className="loading">Loading bookings...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : filteredBookings.length === 0 ? (
            <div className="no-bookings">No bookings found</div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <h3>{booking.nameEnglish}</h3>
                  <span className={`status-badge ${booking.status}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="booking-info">
                  <div className="info-item">
                    <FaEnvelope />
                    <span>{booking.email}</span>
                  </div>
                  <div className="info-item">
                    <FaPhone />
                    <span>{booking.phone}</span>
                  </div>
                  <div className="info-item">
                    <FaBed />
                    <span>{booking.roomType}</span>
                  </div>
                  <div className="info-item">
                    <FaGraduationCap />
                    <span>{booking.educationalInstitute || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <FaCalendarAlt />
                    <span>Stay Duration: {booking.stayDuration} months</span>
                  </div>
                </div>
                <div className="booking-actions">
                  <button
                    className="view-btn"
                    onClick={() => handleViewDetails(booking)}
                  >
                    <FaEye /> View Details
                  </button>
                  {/* <button
                    className="delete-btn"
                    onClick={() => handleDelete(booking._id)}
                  >
                    <FaTrash /> Delete
                  </button> */}
                </div>
              </div>
            ))
          )}
        </div>

        {showDetailsModal && selectedBooking && (
          <div className="modal-overlay">
            <div className="booking-details-modal">
              <div className="modal-header">
                <h3>Booking Details</h3>
                <button
                  className="close-modal-btn"
                  onClick={() => setShowDetailsModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="details-grid">
                  <div className="detail-item">
                    <strong>Guest Name:</strong>
                    <span>{selectedBooking.nameEnglish}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Email:</strong>
                    <span>{selectedBooking.email}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Phone:</strong>
                    <span>{selectedBooking.phone}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Room Type:</strong>
                    <span>{selectedBooking.roomType}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Room Number:</strong>
                    <span>{selectedBooking.roomNumber || 'Not assigned'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Stay Duration:</strong>
                    <span>{selectedBooking.stayDuration} months</span>
                  </div>
                  <div className="detail-item">
                    <strong>Educational Institute:</strong>
                    <span>{selectedBooking.educationalInstitute || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong>
                    <span className={`status-badge ${selectedBooking.status}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Booking Date:</strong>
                    <span>{new Date(selectedBooking.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsA; 