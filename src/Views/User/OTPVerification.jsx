import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';

const OTPVerification = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
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

        try {
            const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
                email,
                otp
            });

            toast.success('OTP verified successfully!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            // Redirect to reset password page
            setTimeout(() => {
                navigate('/reset-password');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
            toast.error(err.response?.data?.message || 'Invalid OTP. Please try again.', {
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

    const handleResendOTP = async () => {
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/auth/forgot-password', {
                email
            });
            toast.success('New OTP sent to your email!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (err) {
            toast.error('Failed to resend OTP. Please try again.', {
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
                        <h3 className="text-center mb-4">Verify OTP</h3>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-4">
                                <Form.Label>Enter OTP</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter the OTP sent to your email"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Button 
                                variant="primary" 
                                type="submit" 
                                className="w-100 mb-3 login-button"
                                disabled={loading}
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </Button>
                            <Button 
                                variant="link" 
                                onClick={handleResendOTP}
                                className="w-100 mb-3"
                                disabled={loading}
                            >
                                Resend OTP
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

export default OTPVerification; 