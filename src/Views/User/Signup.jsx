import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiEye, FiEyeOff, FiUser, FiHome } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Alert } from 'react-bootstrap';
import './Signup.css';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('User');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (!termsAccepted) {
            setError('You must accept the terms and conditions.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/sign-up', {
                name,
                email,
                phone,
                password,
                role,
            });

            setSuccess('Account created successfully! Redirecting...');
            localStorage.setItem('token', response.data.token);
            
            setTimeout(() => {
                navigate('/hobby-selection');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <motion.div
                className="signup-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h3 className="text-center mb-4">Join Our Hostel Community</h3>
                
                {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
                {success && <Alert variant="success" className="mb-3">{success}</Alert>}

                <form onSubmit={handleSignup}>
                    <div className="form-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="tel"
                            className="form-control"
                            placeholder="Phone Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <div className="password-container">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-control"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <span
                                className="password-toggle-icon"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </span>
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="password-container">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                className="form-control"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <span
                                className="password-toggle-icon"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                            </span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Sign Up As</label>
                        <div className="role-selector">
                            <motion.div
                                className={`role-option ${role === 'User' ? 'active' : ''}`}
                                onClick={() => setRole('User')}
                                whileHover={{ scale: 1.05 }}
                            >
                                <FiUser /> User
                            </motion.div>
                            <motion.div
                                className={`role-option ${role === 'Hostel Owner' ? 'active' : ''}`}
                                onClick={() => setRole('Hostel Owner')}
                                whileHover={{ scale: 1.05 }}
                            >
                                <FiHome /> Owner
                            </motion.div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                required
                            /> I agree to the terms and conditions
                        </label>
                    </div>

                    <motion.button
                        className="signup-button"
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Get Started'}
                    </motion.button>
                </form>

                <div className="text-center mt-3">
                    <span 
                        className="login-link"
                        onClick={() => navigate('/')}
                    >
                       <motion.button
        className="login-link"
        onClick={() => navigate('/login')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
    >
        Already have an account? <span>Login</span>
    </motion.button>
                    </span>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;