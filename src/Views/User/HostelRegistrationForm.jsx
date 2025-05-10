import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import "./HostelRegistrationForm.css";

const HostelRegistrationForm = ({ initialData, onSubmit, isEditing = false }) => {
  const [formData, setFormData] = useState({
    email: "",
    phone_number: "",
    hostel_name: "",
    hostel_location: "",
    foodSchedule: Array(7).fill().map((_, index) => ({
      day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index],
      breakfast: "",
      lunch: "",
      dinner: ""
    })),
    feeStructure: "",
    features: "",
    hostelImage: null,
    hostel_type: "Boys",
    precise_location: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
      landmarks: ""
    },
    rooms: [
      { type: "1-Seater", availableRooms: 0, feePerMonth: 0, roomImage: null },
      { type: "2-Seater", availableRooms: 0, feePerMonth: 0, roomImage: null },
      { type: "3-Seater", availableRooms: 0, feePerMonth: 0, roomImage: null },
      { type: "4-Seater", availableRooms: 0, feePerMonth: 0, roomImage: null }
    ]
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (initialData) {
      const processedData = {
        ...initialData,
        foodSchedule: typeof initialData.foodSchedule === 'string' 
          ? JSON.parse(initialData.foodSchedule) 
          : initialData.foodSchedule,
        rooms: typeof initialData.rooms === 'string' 
          ? JSON.parse(initialData.rooms) 
          : initialData.rooms,
        precise_location: typeof initialData.precise_location === 'string' 
          ? JSON.parse(initialData.precise_location) 
          : initialData.precise_location
      };
      setFormData(processedData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      if (name === "hostelImage") {
        setFormData(prev => ({ ...prev, hostelImage: files[0] }));
      } else if (name.startsWith("roomImage")) {
        const index = parseInt(name.split("-")[1]);
        const newRooms = [...formData.rooms];
        newRooms[index].roomImage = files[0];
        setFormData(prev => ({ ...prev, rooms: newRooms }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePreciseLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      precise_location: { ...prev.precise_location, [name]: value }
    }));
  };

  const handleRoomChange = (index, field, value) => {
    const updatedRooms = [...formData.rooms];
    updatedRooms[index][field] = field === 'type' ? value : Number(value);
    setFormData(prev => ({ ...prev, rooms: updatedRooms }));
  };

  const handleFoodChange = (index, meal, value) => {
    const updatedFoodSchedule = [...formData.foodSchedule];
    updatedFoodSchedule[index][meal] = value;
    setFormData(prev => ({ ...prev, foodSchedule: updatedFoodSchedule }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to continue');
        return;
      }

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (['precise_location', 'foodSchedule', 'rooms'].includes(key)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (key === 'hostelImage' && value) {
          formDataToSend.append(key, value);
        } else {
          formDataToSend.append(key, value);
        }
      });

      formData.rooms.forEach((room, index) => {
        if (room.roomImage) formDataToSend.append(`roomImage-${index}`, room.roomImage);
      });

      const response = await axios.post('http://localhost:5000/api/hostels', formDataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(isEditing ? 'Hostel updated!' : 'Hostel registered!');
      navigate('/owner/hostel-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  return (
    <div className="container">
      <div className="form-wrapper">
        <h2 className="title">{isEditing ? 'Edit Hostel' : 'Register New Hostel'}</h2>
        
        <form className="form" onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="field-group">
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              className="input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label className="label">Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              className="input"
              value={formData.phone_number}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label className="label">Hostel Name</label>
            <input
              type="text"
              name="hostel_name"
              className="input"
              value={formData.hostel_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label className="label">General Location</label>
            <input
              type="text"
              name="hostel_location"
              className="input"
              value={formData.hostel_location}
              onChange={handleChange}
              required
            />
          </div>

          {/* Precise Location Section */}
          <div className="section-title">Location Details</div>
          <div className="field-group">
            <label className="label">Street Address</label>
            <input
              type="text"
              name="address"
              className="input"
              value={formData.precise_location.address}
              onChange={handlePreciseLocationChange}
              required
            />
          </div>

          <div className="field-group">
            <label className="label">City</label>
            <input
              type="text"
              name="city"
              className="input"
              value={formData.precise_location.city}
              onChange={handlePreciseLocationChange}
              required
            />
          </div>

          <div className="field-group">
            <label className="label">State</label>
            <input
              type="text"
              name="state"
              className="input"
              value={formData.precise_location.state}
              onChange={handlePreciseLocationChange}
              required
            />
          </div>

          <div className="field-group">
            <label className="label">ZIP Code</label>
            <input
              type="text"
              name="zipCode"
              className="input"
              value={formData.precise_location.zipCode}
              onChange={handlePreciseLocationChange}
              required
            />
          </div>

          <div className="field-group">
            <label className="label">Nearby Landmarks</label>
            <input
              type="text"
              name="landmarks"
              className="input"
              value={formData.precise_location.landmarks}
              onChange={handlePreciseLocationChange}
              placeholder="Optional"
            />
          </div>

          <div className="field-group">
            <label className="label">Hostel Type</label>
            <select
              className="select"
              name="hostel_type"
              value={formData.hostel_type}
              onChange={handleChange}
              required
            >
              <option value="Boys">Boys</option>
              <option value="Girls">Girls</option>
            </select>
          </div>

          {/* Room Types Section */}
          <div className="section-title">Room Configuration</div>
          <div className="rooms-grid">
            {formData.rooms.map((room, index) => (
              <div key={index} className="room-type-card">
                <h3>{room.type}</h3>
                <div className="field-group">
                  <label className="label">Available Rooms</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={room.availableRooms}
                    onChange={(e) => handleRoomChange(index, 'availableRooms', e.target.value)}
                    required
                  />
                </div>
                <div className="field-group">
                  <label className="label">Monthly Fee (₹)</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={room.feePerMonth}
                    onChange={(e) => handleRoomChange(index, 'feePerMonth', e.target.value)}
                    required
                  />
                </div>
                <div className="field-group">
                  <label className="label">Room Image</label>
                  <input
                    className="input"
                    type="file"
                    name={`roomImage-${index}`}
                    onChange={handleChange}
                    accept="image/*"
                    required={!isEditing}
                  />
                  {room.roomImage && (
                    <div className="image-preview">
                      <img
                        src={room.roomImage instanceof File ? URL.createObjectURL(room.roomImage) : room.roomImage}
                        alt={`${room.type} preview`}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Food Schedule Section */}
          <div className="section-title">Meal Schedule</div>
          <div className="food-schedule-grid">
            {formData.foodSchedule.map((day, index) => (
              <div key={index} className="food-day-card">
                <h3>{day.day}</h3>
                <div className="field-group">
                  <label className="label">Breakfast</label>
                  <input
                    className="input"
                    type="text"
                    value={day.breakfast}
                    onChange={(e) => handleFoodChange(index, 'breakfast', e.target.value)}
                    required
                  />
                </div>
                <div className="field-group">
                  <label className="label">Lunch</label>
                  <input
                    className="input"
                    type="text"
                    value={day.lunch}
                    onChange={(e) => handleFoodChange(index, 'lunch', e.target.value)}
                    required
                  />
                </div>
                <div className="field-group">
                  <label className="label">Dinner</label>
                  <input
                    className="input"
                    type="text"
                    value={day.dinner}
                    onChange={(e) => handleFoodChange(index, 'dinner', e.target.value)}
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="section-title">Additional Details</div>
          <div className="field-group">
            <label className="label">Booking Fee</label>
            <input
              className="input"
              type="text"
              name="feeStructure"
              value={formData.feeStructure}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label className="label">Features</label>
            <input
              className="input"
              type="text"
              name="features"
              value={formData.features}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label className="label">Hostel Image</label>
            <input
              className="input"
              type="file"
              name="hostelImage"
              onChange={handleChange}
              accept="image/*"
              required
            />
          </div>

          <button type="submit" className="submit-button">
            {isEditing ? 'Update Hostel' : 'Register Hostel'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HostelRegistrationForm;