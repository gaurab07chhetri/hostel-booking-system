import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaUsers,
  FaHotel,
  FaUserTie,
  FaUserCog,
  FaClipboardList,
  FaTachometerAlt,
  FaSignOutAlt,
  FaSearch,
  FaCheck,
  FaTimes,
  FaEye,
  FaMapMarkerAlt,
  FaBed,
  FaPhone,
  FaEnvelope,
  FaHome,
  FaBuilding,
  FaStar
} from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import './AdminDashboard.css';
import HostelDetailsModal from './HostelDetailsModal';
import RatingsA from './RatingsA';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHostels: 0,
    totalOwners: 0,
    pendingRequests: 0,
  });
  const [hostels, setHostels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchHostels = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/hostels', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setHostels(response.data);
      
      // Update stats
      const stats = {
        totalHostels: response.data.length,
        pendingRequests: response.data.filter(h => h.status === 'pending').length,
        approved: response.data.filter(h => h.status === 'approved').length,
        declined: response.data.filter(h => h.status === 'rejected').length
      };
      setStats(stats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching hostels:', error);
      setError('Error fetching hostels');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, [navigate]);

  const handleHostelAction = async (hostelId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/hostels/${hostelId}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh hostels after action
      fetchHostels();
      alert(`Hostel ${status} successfully`);
    } catch (error) {
      console.error('Error updating hostel status:', error);
      alert('Error updating hostel status');
    }
  };

  const filteredHostels = hostels.filter(hostel => {
    const matchesSearch = hostel.hostel_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hostel.hostel_location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || hostel.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const groupedHostels = {
    pending: filteredHostels.filter(h => h.status === 'pending'),
    approved: filteredHostels.filter(h => h.status === 'approved'),
    rejected: filteredHostels.filter(h => h.status === 'rejected')
  };

  const renderHostelSection = (hostels, status) => {
    if (hostels.length === 0) return null;

    const titles = {
      pending: 'Pending Approval Requests',
      approved: 'Approved Hostels',
      rejected: 'Rejected Hostels'
    };
   

    return (
      <div className="hostel-section">
        <h2 className="section-title">{titles[status]}</h2>
        <div className="hostel-cards-grid">
          {hostels.map((hostel) => (
            <div key={hostel._id} className={`hostel-card ${hostel.status}`}>
              <div className="card-image-container">
                <img
                  src={hostel.hostelImage || 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/Hostel/default-hostel.jpg'}
                  alt={hostel.hostel_name}
                  className="hostel-image"
                  onError={(e) => {
                    e.target.src = 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/Hostel/default-hostel.jpg';
                    console.error('Error loading hostel image:', e);
                  }}
                />
              </div>
              <div className="hostel-info">
                <div className="header-row">
                  <h3>{hostel.hostel_name}</h3>
                  <span className={`status-badge ${hostel.status}`}>{hostel.status}</span>
                </div>
                <div className="info-grid">
                  <p><FaMapMarkerAlt /> {hostel.hostel_location}</p>
                  <p><FaBed /> {hostel.hostel_type}</p>
                  <p><FaPhone /> {hostel.phone_number}</p>
                  <p><FaEnvelope /> {hostel.email}</p>
                  <p className="features"><strong>Features:</strong> {hostel.features}</p>
                  <p className="view-details-link" onClick={() => setSelectedHostel(hostel)}>
                    View Details
                  </p>
                </div>
              </div>
              {hostel.status === 'pending' && (
                <div className="action-buttons">
                  <button
                    className="approve-btn"
                    onClick={() => handleHostelAction(hostel._id, 'approved')}
                  >
                    <FaCheck /> Approve
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleHostelAction(hostel._id, 'rejected')}
                  >
                    <FaTimes /> Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'ratings':
        return <RatingsA />;
      default:
        return (
          <div className="admin-dashboard">
            <div className="admin-sidebar">
              <div className="sidebar-header">
                <h2>Admin Panel</h2>
              </div>
              <nav className="sidebar-nav">
                <Link to="/admin/dashboard" className="nav-item active">
                  <FaTachometerAlt />
                  Dashboard
                </Link>
                <Link to="/admin/users" className="nav-item">
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

            <div className="main-content00">
              <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
              </div>

              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon blue">
                    <FaHotel />
                  </div>
                  <div className="stat-info">
                    <h3>Total Hostels</h3>
                    <p>{stats.totalHostels}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon yellow">
                    <FaClipboardList />
                  </div>
                  <div className="stat-info">
                    <h3>Pending Requests</h3>
                    <p>{stats.pendingRequests}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon green">
                    <FaCheck />
                  </div>
                  <div className="stat-info">
                    <h3>Approved</h3>
                    <p>{stats.approved}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon red">
                    <FaTimes />
                  </div>
                  <div className="stat-info">
                    <h3>Declined</h3>
                    <p>{stats.declined}</p>
                  </div>
                </div>
              </div>

              <div className="filters-section">
                <div className="search-bar">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search hostels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="status-filter"
                >
                  <option value="all">All Hostels</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Declined</option>
                </select>
              </div>

              <div className="hostels-container">
                {loading ? (
                  <div className="loading">Loading hostels...</div>
                ) : error ? (
                  <div className="error">{error}</div>
                ) : filteredHostels.length === 0 ? (
                  <div className="no-results">No hostels found</div>
                ) : (
                  <>
                    {renderHostelSection(groupedHostels.pending, 'pending')}
                    {renderHostelSection(groupedHostels.approved, 'approved')}
                    {renderHostelSection(groupedHostels.rejected, 'rejected')}
                  </>
                )}
              </div>

              {selectedHostel && (
                <HostelDetailsModal
                  hostel={selectedHostel}
                  onClose={() => setSelectedHostel(null)}
                />
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" className="nav-item active">
            <FaTachometerAlt />
            Dashboard
          </Link>
          <Link to="/admin/users" className="nav-item">
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

      <div className="main-content00">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
        </div>

        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <FaHotel />
            </div>
            <div className="stat-info">
              <h3>Total Hostels</h3>
              <p>{stats.totalHostels}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon yellow">
              <FaClipboardList />
            </div>
            <div className="stat-info">
              <h3>Pending Requests</h3>
              <p>{stats.pendingRequests}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <FaCheck />
            </div>
            <div className="stat-info">
              <h3>Approved</h3>
              <p>{stats.approved}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">
              <FaTimes />
            </div>
            <div className="stat-info">
              <h3>Declined</h3>
              <p>{stats.declined}</p>
            </div>
          </div>
        </div>

        <div className="filters-section">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search hostels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Hostels</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Declined</option>
          </select>
        </div>

        <div className="hostels-container">
          {loading ? (
            <div className="loading">Loading hostels...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : filteredHostels.length === 0 ? (
            <div className="no-results">No hostels found</div>
          ) : (
            <>
              {renderHostelSection(groupedHostels.pending, 'pending')}
              {renderHostelSection(groupedHostels.approved, 'approved')}
              {renderHostelSection(groupedHostels.rejected, 'rejected')}
            </>
          )}
        </div>

        {selectedHostel && (
          <HostelDetailsModal
            hostel={selectedHostel}
            onClose={() => setSelectedHostel(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;