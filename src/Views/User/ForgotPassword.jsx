import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
                email
            });

            toast.success('OTP sent to your email!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            // Store email in localStorage for OTP verification
            localStorage.setItem('resetEmail', email);
            
            // Redirect to OTP verification page
            setTimeout(() => {
                navigate('/verify-otp');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
            toast.error(err.response?.data?.message || 'Failed to send OTP. Please try again.', {
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
                        <h3 className="text-center mb-4">Forgot Password</h3>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-4">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Button 
                                variant="primary" 
                                type="submit" 
                                className="w-100 mb-3 login-button"
                                disabled={loading}
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
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

export default ForgotPassword; 