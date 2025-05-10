import React from 'react';
import './HostelDetailsModal.css';
import { FaTimes, FaBed, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUtensils } from 'react-icons/fa';

const HostelDetailsModal = ({ hostel, onClose }) => {
  if (!hostel) return null;

  // Sort days of the week starting from Sunday
  const sortedFoodSchedule = hostel.foodSchedule?.sort((a, b) => {
    const daysOrder = {
      'Sunday': 0,
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6
    };
    return daysOrder[a.day] - daysOrder[b.day];
  });

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
        <button className="admin-close-button" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="admin-modal-header">
          <h2>{hostel.hostel_name}</h2>
          <span className={`admin-status-badge ${hostel.status}`}>{hostel.status}</span>
        </div>

        <div className="admin-modal-body">
          <div className="admin-modal-grid">
            <div className="admin-left-section">
              <div className="admin-main-image-container">
                <img
                  src={hostel.hostelImage || 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/Hostel/default-hostel.jpg'}
                  alt={hostel.hostel_name}
                  className="admin-main-hostel-image"
                  onError={(e) => {
                    e.target.src = 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/Hostel/default-hostel.jpg';
                    console.error('Error loading hostel image:', e);
                  }}
                />
              </div>

              <div className="admin-info-section">
                <div className="admin-contact-info">
                  <h3><FaMapMarkerAlt /> Location & Contact</h3>
                  <p><strong>Location:</strong> {hostel.hostel_location}</p>
                  <p><FaPhone /> <strong>Phone:</strong> {hostel.phone_number}</p>
                  <p><FaEnvelope /> <strong>Email:</strong> {hostel.email}</p>
                </div>

                {/* <div className="Precise-details">
                        <h4>Precise Details</h4>
                        <p><strong>Address:</strong> {hostel.address}</p>
                        <p><strong>City:</strong> {hostel.city}</p>
                        <p><strong>State:</strong> {hostel.state}</p>
                        <p><strong>Zip Code:</strong> {hostel.zipCode}</p>
                        <p><strong>Landmarks:</strong> {hostel.landmarks}</p>
                      </div> */}

                <div className="admin-hostel-details">
                  <h3><FaBed /> Hostel Details</h3>
                  <p><strong>Type:</strong> {hostel.hostel_type}</p>
                  <p><strong>Advanced Fee:</strong> {hostel.feeStructure}</p>
                  <p><strong>Features:</strong> {hostel.features}</p>
                </div>
              </div>
            </div>

            <div className="admin-right-section">
              <div className="admin-rooms-section">
                <h3><FaBed /> Available Rooms</h3>
                <div className="admin-rooms-grid">
                  {hostel.rooms?.map((room, index) => (
                    <div key={index} className="admin-room-card">
                      <div className="admin-room-image-container">
                        <img
                          src={room.roomImage || 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/Hostel/default-room.jpg'}
                          alt={`${room.type} Room`}
                          onError={(e) => {
                            e.target.src = 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/Hostel/default-room.jpg';
                            console.error('Error loading room image:', e);
                          }}
                        />
                      </div>
                      <div className="admin-room-details">
                        <h4>{room.type}</h4>
                        <p><strong>Available:</strong> {room.availableRooms} rooms</p>
                        <p><strong>Monthly Fee:</strong> Rs. {room.feePerMonth}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-food-schedule">
                <h3><FaUtensils /> Food Schedule</h3>
                <div className="admin-food-table-container">
                  <table className="admin-food-table">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Breakfast</th>
                        <th>Lunch</th>
                        <th>Dinner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedFoodSchedule?.map((schedule, index) => (
                        <tr key={index}>
                          <td className="admin-day-column">{schedule.day}</td>
                          <td>{schedule.breakfast}</td>
                          <td>{schedule.lunch}</td>
                          <td>{schedule.dinner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostelDetailsModal; 