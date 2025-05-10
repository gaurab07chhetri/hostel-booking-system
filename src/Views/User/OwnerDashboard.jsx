// import React, { useState, useEffect, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { AuthContext } from '../../context/AuthContext';
// import { FaEdit, FaCheck, FaTimes, FaBed, FaUser, FaCalendarAlt, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
// import './OwnerDashboard.css';

// const OwnerDashboard = () => {
//     const [hostel, setHostel] = useState(null);
//     const [bookings, setBookings] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [activeTab, setActiveTab] = useState('overview');
//     const [roomAssignments, setRoomAssignments] = useState({});
//     const [availableRooms, setAvailableRooms] = useState({});
//     const navigate = useNavigate();
//     const { user } = useContext(AuthContext);

//     useEffect(() => {
//         if (!user || user.role !== 'Owner') {
//             toast.error('You do not have permission to access this page');
//             navigate('/user/home');
//             return;
//         }

//         fetchHostelData();
//         fetchBookings();
//     }, [user, navigate]);

//     const fetchHostelData = async () => {
//         try {
//             const token = localStorage.getItem('token');
//             if (!token) {
//                 toast.error('Please login to continue');
//                 navigate('/');
//                 return;
//             }

//             const response = await axios.get('http://localhost:5000/api/hostels/my-hostel', {
//                 headers: { 
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });

//             if (response.data && response.data.hostel) {
//                 setHostel(response.data.hostel);
                
//                 // Calculate available rooms for each room type
//                 const available = {};
//                 response.data.hostel.rooms.forEach(room => {
//                     available[room.type] = room.availableRooms;
//                 });
//                 setAvailableRooms(available);
//             } else {
//                 toast.error('No hostel found. Please register a hostel first.');
//                 navigate('/register-hostel');
//             }
//         } catch (error) {
//             console.error('Error fetching hostel data:', error);
//             if (error.response?.status === 401) {
//                 toast.error('Session expired. Please login again.');
//                 navigate('/');
//             } else {
//                 toast.error('Failed to fetch hostel information');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchBookings = async () => {
//         try {
//             const token = localStorage.getItem('token');
//             if (!token) {
//                 toast.error('Please login to continue');
//                 navigate('/');
//                 return;
//             }

//             const response = await axios.get('http://localhost:5000/api/bookings/hostel-bookings', {
//                 headers: { 
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });

//             if (response.data && response.data.bookings) {
//                 setBookings(response.data.bookings);
                
//                 // Initialize room assignments from existing bookings
//                 const assignments = {};
//                 response.data.bookings.forEach(booking => {
//                     if (booking.roomNumber) {
//                         assignments[booking._id] = booking.roomNumber;
//                     }
//                 });
//                 setRoomAssignments(assignments);
//             }
//         } catch (error) {
//             console.error('Error fetching bookings:', error);
//             if (error.response?.status === 401) {
//                 toast.error('Session expired. Please login again.');
//                 navigate('/');
//             } else {
//                 toast.error('Failed to fetch bookings');
//             }
//         }
//     };

//     const handleEditHostel = () => {
//         navigate('/edit-hostel');
//     };

//     const handleApproveBooking = async (bookingId) => {
//         try {
//             const token = localStorage.getItem('token');
//             if (!token) {
//                 toast.error('Please login to continue');
//                 navigate('/');
//                 return;
//             }

//             await axios.put(`http://localhost:5000/api/bookings/${bookingId}/approve`, {}, {
//                 headers: { 
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });

//             toast.success('Booking approved successfully');
//             fetchBookings();
//         } catch (error) {
//             console.error('Error approving booking:', error);
//             toast.error('Failed to approve booking');
//         }
//     };

//     const handleRejectBooking = async (bookingId) => {
//         try {
//             const token = localStorage.getItem('token');
//             if (!token) {
//                 toast.error('Please login to continue');
//                 navigate('/');
//                 return;
//             }

//             await axios.put(`http://localhost:5000/api/bookings/${bookingId}/reject`, {}, {
//                 headers: { 
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });

//             toast.success('Booking rejected successfully');
//             fetchBookings();
//         } catch (error) {
//             console.error('Error rejecting booking:', error);
//             toast.error('Failed to reject booking');
//         }
//     };

//     const handleAssignRoom = async (bookingId, roomNumber) => {
//         try {
//             const token = localStorage.getItem('token');
//             if (!token) {
//                 toast.error('Please login to continue');
//                 navigate('/');
//                 return;
//             }

//             await axios.put(`http://localhost:5000/api/bookings/${bookingId}/assign-room`, 
//                 { roomNumber },
//                 {
//                     headers: { 
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json'
//                     }
//                 }
//             );

//             setRoomAssignments({
//                 ...roomAssignments,
//                 [bookingId]: roomNumber
//             });

//             toast.success('Room assigned successfully');
//         } catch (error) {
//             console.error('Error assigning room:', error);
//             toast.error('Failed to assign room');
//         }
//     };

//     const renderOverview = () => {
//         if (!hostel) return <div className="loading">Loading hostel information...</div>;

//         return (
//             <div className="overview-section">
//                 <div className="hostel-header">
//                     <h2>{hostel.hostel_name}</h2>
//                     <button className="edit-btn" onClick={handleEditHostel}>
//                         <FaEdit /> Edit Hostel
//                     </button>
//                 </div>
                
//                 <div className="hostel-image">
//                     <img src={hostel.hostelImage} alt={hostel.hostel_name} />
//                 </div>
                
//                 <div className="hostel-details">
//                     <div className="detail-item">
//                         <FaMapMarkerAlt className="icon" />
//                         <div>
//                             <h4>Location</h4>
//                             <p>{hostel.hostel_location}</p>
//                         </div>
//                     </div>
                    
//                     <div className="detail-item">
//                         <FaBed className="icon" />
//                         <div>
//                             <h4>Hostel Type</h4>
//                             <p>{hostel.hostel_type}</p>
//                         </div>
//                     </div>
                    
//                     <div className="detail-item">
//                         <FaPhone className="icon" />
//                         <div>
//                             <h4>Contact</h4>
//                             <p>{hostel.phone_number}</p>
//                         </div>
//                     </div>
                    
//                     <div className="detail-item">
//                         <FaEnvelope className="icon" />
//                         <div>
//                             <h4>Email</h4>
//                             <p>{hostel.email}</p>
//                         </div>
//                     </div>
//                 </div>
                
//                 <div className="room-types">
//                     <h3>Room Types</h3>
//                     <div className="room-cards">
//                         {hostel.rooms.map((room, index) => (
//                             <div key={index} className="room-card">
//                                 <img src={room.roomImage} alt={`${room.type} Room`} />
//                                 <h4>{room.type}</h4>
//                                 <p>Available: {room.availableRooms}</p>
//                                 <p>Fee: Rs. {room.feePerMonth}/month</p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
                
//                 <div className="features">
//                     <h3>Features</h3>
//                     <p>{hostel.features}</p>
//                 </div>
                
//                 <div className="food-schedule">
//                     <h3>Food Schedule</h3>
//                     <div className="schedule-table">
//                         <table>
//                             <thead>
//                                 <tr>
//                                     <th>Day</th>
//                                     <th>Breakfast</th>
//                                     <th>Lunch</th>
//                                     <th>Dinner</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {hostel.foodSchedule.map((day, index) => (
//                                     <tr key={index}>
//                                         <td>{day.day}</td>
//                                         <td>{day.breakfast}</td>
//                                         <td>{day.lunch}</td>
//                                         <td>{day.dinner}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     const renderBookings = () => {
//         if (bookings.length === 0) {
//             return <div className="no-bookings">No bookings found</div>;
//         }

//         return (
//             <div className="bookings-section">
//                 <h2>Bookings</h2>
//                 <div className="bookings-list">
//                     {bookings.map(booking => (
//                         <div key={booking._id} className="booking-card">
//                             <div className="booking-header">
//                                 <h3>{booking.nameEnglish}</h3>
//                                 <span className={`status-badge ${booking.status}`}>
//                                     {booking.status}
//                                 </span>
//                             </div>
                            
//                             <div className="booking-details">
//                                 <div className="detail-row">
//                                     <FaUser className="icon" />
//                                     <div>
//                                         <h4>Student</h4>
//                                         <p>{booking.nameEnglish}</p>
//                                     </div>
//                                 </div>
                                
//                                 <div className="detail-row">
//                                     <FaCalendarAlt className="icon" />
//                                     <div>
//                                         <h4>Date of Birth</h4>
//                                         <p>{new Date(booking.dateOfBirth).toLocaleDateString()}</p>
//                                     </div>
//                                 </div>
                                
//                                 <div className="detail-row">
//                                     <FaPhone className="icon" />
//                                     <div>
//                                         <h4>Phone</h4>
//                                         <p>{booking.phone}</p>
//                                     </div>
//                                 </div>
                                
//                                 <div className="detail-row">
//                                     <FaBed className="icon" />
//                                     <div>
//                                         <h4>Room Type</h4>
//                                         <p>{booking.roomType}</p>
//                                     </div>
//                                 </div>
                                
//                                 <div className="detail-row">
//                                     <h4>Room Number</h4>
//                                     <div className="room-assignment">
//                                         {booking.status === 'approved' ? (
//                                             <div className="room-input">
//                                                 <input 
//                                                     type="text" 
//                                                     value={roomAssignments[booking._id] || ''} 
//                                                     onChange={(e) => setRoomAssignments({
//                                                         ...roomAssignments,
//                                                         [booking._id]: e.target.value
//                                                     })}
//                                                     placeholder="Enter room number"
//                                                 />
//                                                 <button 
//                                                     onClick={() => handleAssignRoom(booking._id, roomAssignments[booking._id])}
//                                                     disabled={!roomAssignments[booking._id]}
//                                                 >
//                                                     Assign
//                                                 </button>
//                                             </div>
//                                         ) : (
//                                             <p>Not assigned</p>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
                            
//                             <div className="booking-actions">
//                                 {booking.status === 'pending' && (
//                                     <>
//                                         <button 
//                                             className="approve-btn"
//                                             onClick={() => handleApproveBooking(booking._id)}
//                                         >
//                                             <FaCheck /> Approve
//                                         </button>
//                                         <button 
//                                             className="reject-btn"
//                                             onClick={() => handleRejectBooking(booking._id)}
//                                         >
//                                             <FaTimes /> Reject
//                                         </button>
//                                     </>
//                                 )}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         );
//     };

//     if (loading) {
//         return <div className="loading">Loading...</div>;
//     }

//     return (
//         <div className="owner-dashboard">
//             <ToastContainer />
//             <div className="dashboard-header">
//                 <h1>Hostel Owner Dashboard</h1>
//                 <p>Manage your hostel and bookings</p>
//             </div>
            
//             <div className="dashboard-tabs">
//                 <button 
//                     className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
//                     onClick={() => setActiveTab('overview')}
//                 >
//                     Hostel Overview
//                 </button>
//                 <button 
//                     className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
//                     onClick={() => setActiveTab('bookings')}
//                 >
//                     Bookings
//                 </button>
//             </div>
            
//             <div className="dashboard-content">
//                 {activeTab === 'overview' && renderOverview()}
//                 {activeTab === 'bookings' && renderBookings()}
//             </div>
//         </div>
//     );
// };

// export default OwnerDashboard; 