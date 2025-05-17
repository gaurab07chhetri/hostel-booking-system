import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaUserCog,
  FaTrash,
  FaEdit,
  FaSearch,
  FaArrowLeft,
  FaHotel,
  FaTimes,
  FaTachometerAlt,
  FaSignOutAlt,
  FaStar
} from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found in localStorage');
        setError('Authentication token not found. Please log in again.');
        navigate('/login');
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Received unexpected data format from server');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setError('Authentication failed. Please log in again.');
          navigate('/login');
        } else if (error.response.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          setError(error.response.data.message || 'Failed to fetch users');
        }
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('Error setting up request: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const getHostelStatus = React.useCallback((user) => {
    if (!user.bookings || user.bookings.length === 0) {
      return { status: '', class: 'not-booked', details: 'No active bookings' };
    }
    
    const activeBooking = user.bookings.find(booking => 
      booking.status === 'approved' || booking.status === 'pending'
    );
    
    if (activeBooking) {
      const statusClass = activeBooking.status === 'approved' ? '' : 'pending';
      const statusText = activeBooking.status === 'approved' ? '' : 'Pending';
      return { 
        status: statusText, 
        class: statusClass, 
        details: `Room: ${activeBooking.roomType || 'N/A'}`
      };
    }
    
    return { status: 'Not Booked', class: 'not-booked', details: 'No active bookings' };
  }, []);

  const filteredUsers = React.useMemo(() => 
    users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ), [users, searchTerm]
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <div className="admin-loading">Loading users...</div>;
  if (error) return <div className="admin-error-message">{error}</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" className="nav-item">
            <FaTachometerAlt />
            Dashboard
          </Link>
          <Link to="/admin/users" className="nav-item active">
            <FaUserCog />
            User Management
          </Link>
          <Link to="/admin/hostels" className="nav-item">
            <FaHotel />
            Hostel Management
          </Link>
          <Link to="/admin/ratings" className="nav-item">
            <FaStar />
            Reviews & Ratings
          </Link>
          <button onClick={handleLogout} className="nav-item logout-btn">
            <FaSignOutAlt />
            Logout
          </button>
        </nav>
      </div>

      <div className="admin-user-management">
        <div className="admin-management-header">
          <h1>User Management</h1>
          {/* <button className="admin-back-button" onClick={() => navigate('/admin/dashboard')}>
            <FaArrowLeft /> Back to Dashboard
          </button> */}
        </div>

        <div className="admin-search-section">
          <div className="admin-search-container">
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="admin-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="admin-search-icon" />
          </div>
        </div>

        <div className="admin-users-table-container">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Hostel Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const hostelStatus = getHostelStatus(user);
                return (
                  <tr key={user._id}>
                    <td>
                      <div className="admin-user-info">
                        <div className="admin-user-avatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="admin-user-details">
                          <span className="admin-user-name">{user.name}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-user-email">{user.email}</span>
                    </td>
                    <td>
                      <span className="admin-user-phone">{user.phone}</span>
                    </td>
                    <td>
                      <span className={`admin-role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="admin-hostel-status-container">
                        <span className={`admin-hostel-status ${hostelStatus.class}`}>
                          <FaHotel className="admin-status-icon" />
                          {hostelStatus.status}
                        </span>
                        <span className="admin-hostel-status-details">
                          {hostelStatus.details}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="admin-action-buttons">
                        <button
                          className="admin-action-button admin-delete-button"
                          onClick={() => handleDeleteUser(user._id)}
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="admin-no-results">
                    <FaTimes className="admin-no-results-icon" />
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement; 