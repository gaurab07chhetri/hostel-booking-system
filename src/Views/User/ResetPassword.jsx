import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedEmail = localStorage.getItem('resetEmail');
        if (!storedEmail) {
            navigate('/forgot-password');
        } else {
            setEmail(storedEmail);
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
                email,
                password
            });

            toast.success('Password reset successfully!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            // Clear stored email
            localStorage.removeItem('resetEmail');

            // Redirect to login page
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
            toast.error(err.response?.data?.message || 'Failed to reset password. Please try again.', {
                position: "top-right",
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <ToastContainer />
            <video className="background-video" autoPlay muted loop>
                <source src="https://videos.pexels.com/video-files/5157339/5157339-sd_960_506_25fps.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            <div className="login-container d-flex justify-content-center align-items-center">
                <Card className="login-card">
                    <Card.Body>
                        <h3 className="text-center mb-4">Reset Password</h3>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-4">
                                <Form.Label>New Password</Form.Label>
                                <div className="password-container">
                                    <Form.Control
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter new password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <div className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </div>
                                </div>
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Label>Confirm New Password</Form.Label>
                                <div className="password-container">
                                    <Form.Control
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <div className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                    </div>
                                </div>
                            </Form.Group>
                            <Button 
                                variant="primary" 
                                type="submit" 
                                className="w-100 mb-3 login-button"
                                disabled={loading}
                            >
                                {loading ? 'Resetting Password...' : 'Reset Password'}
                            </Button>
                        </Form>
                        <div className="text-center mt-4">
                            <span className="account-text">Remember your password? </span>
                            <span onClick={() => navigate('/')} className="signup-link">
                                Login
                            </span>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

export default ResetPassword; 