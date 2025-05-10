import React, { useState, useContext } from 'react';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBook, FaBed } from 'react-icons/fa';
import './UserDetailsForm.css';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const UserDetailsForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    nameEnglish: '',
    email: '',
    phone: '',
    streetAddress: '',
    municipality: '',
    district: '',
    roomType: '',
    stayDuration: '',
    educationalQualification: '',
    institutionName: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nameEnglish) errors.nameEnglish = 'Full Name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.phone) errors.phone = 'Phone number is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (!id) throw new Error('Hostel ID is missing. Please refresh the page.');
      const amount = 1000; // Replace with dynamic amount

      const response = await fetch('http://localhost:5000/api/esewa/initialize-esewa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          itemId: id,
          totalPrice: amount,
          packageDetails: {
            title: "Sample Hostel", // replace with dynamic title
            duration: formData.stayDuration,
            category: formData.roomType
          },
          firstName: formData.nameEnglish.split(' ')[0],
          lastName: formData.nameEnglish.split(' ').slice(1).join(' '),
          email: formData.email,
          phone: formData.phone,
          address: `${formData.streetAddress}, ${formData.municipality}, ${formData.district}`,
          userId: user._id,
          ...(formData.educationalQualification && { educationalQualification: formData.educationalQualification }),
          ...(formData.institutionName && { institutionName: formData.institutionName })
        })
      });

      const data = await response.json();
      if (data.success) {
        const form = document.createElement('form');
        form.setAttribute('method', 'POST');
        form.setAttribute('action', data.formAction);

        Object.entries(data.formData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.setAttribute('type', 'hidden');
          input.setAttribute('name', key);
          input.setAttribute('value', value);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        setTimeout(() => form.remove(), 1000); // Clean up form
      } else {
        throw new Error(data.message || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to process booking');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="user-details-form">
      <h2>Book Your Hostel</h2>

      <div>
        <label htmlFor="nameEnglish"><FaUser /> Full Name</label>
        <input id="nameEnglish" type="text" name="nameEnglish" value={formData.nameEnglish} onChange={handleChange} />
        {errors.nameEnglish && <span className="error">{errors.nameEnglish}</span>}
      </div>

      <div>
        <label htmlFor="email"><FaEnvelope /> Email</label>
        <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div>
        <label htmlFor="phone"><FaPhone /> Phone Number</label>
        <input id="phone" type="text" name="phone" value={formData.phone} onChange={handleChange} />
        {errors.phone && <span className="error">{errors.phone}</span>}
      </div>

      <div>
        <label><FaMapMarkerAlt /> Address</label>
        <input type="text" name="streetAddress" placeholder="Street" onChange={handleChange} />
        <input type="text" name="municipality" placeholder="Municipality" onChange={handleChange} />
        <input type="text" name="district" placeholder="District" onChange={handleChange} />
      </div>

      <div>
        <label htmlFor="roomType"><FaBed /> Room Type</label>
        <select id="roomType" name="roomType" onChange={handleChange}>
          <option value="">Select Room Type</option>
          <option value="1-seater">1-Seater</option>
          <option value="2-seater">2-Seater</option>
          <option value="3-seater">3-Seater</option>
          <option value="4-seater">4-Seater</option>
        </select>
      </div>

      <div>
        <label htmlFor="stayDuration">Stay Duration (in months)</label>
        <input id="stayDuration" type="number" name="stayDuration" value={formData.stayDuration} onChange={handleChange} />
      </div>

      <h3>Educational Information <span style={{ fontWeight: 'normal', fontSize: '14px' }}>(Optional)</span></h3>

      <div>
        <label htmlFor="educationalQualification"><FaBook /> Educational Qualification</label>
        <input
          id="educationalQualification"
          type="text"
          name="educationalQualification"
          value={formData.educationalQualification}
          onChange={handleChange}
          placeholder="e.g., Bachelor's in CS"
        />
      </div>

      <div>
        <label htmlFor="institutionName"><FaBook /> Institution Name</label>
        <input
          id="institutionName"
          type="text"
          name="institutionName"
          value={formData.institutionName}
          onChange={handleChange}
          placeholder="e.g., TU Institute of Engineering"
        />
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Processing..." : "Book Now"}
      </button>
    </form>
  );
};

export default UserDetailsForm;