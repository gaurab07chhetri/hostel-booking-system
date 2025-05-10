import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Signup = () => {
    const [name, setName] = useState(''); // New state for name
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('User');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post('http://localhost:5000/api/auth/signup', {
                name, // Include name in request
                email,
                password,
                role,
            });
            
            setSuccess('Account created successfully.');
            setError('');
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed.');
            setSuccess('');
            setLoading(false);
        }
    };

    return (
        <div className="signup-page d-flex justify-content-center align-items-center vh-100">
            <style>{`
                .signup-page {
                    position: relative;
                    overflow: hidden;
                }
                .signup-page video {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    z-index: -1;
                }
                .card {
                    background: rgba(255, 255, 255, 0.85);
                    border-radius: 15px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                }
                .card-body {
                    padding: 2rem;
                }
                .btn-primary {
                    background: linear-gradient(to right, #6a11cb, #2575fc);
                    border: none;
                    border-radius: 30px;
                }
                .btn-primary:hover {
                    background: linear-gradient(to right, #2575fc, #6a11cb);
                }
                .form-control {
                    border-radius: 15px;
                }
                .password-container {
                    position: relative;
                    width: 100%;
                }
                .password-input {
                    width: 100%;
                    padding: 12px 20px 12px 45px;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 16px;
                    transition: all 0.3s ease;
                    padding-right: 40px; /* Make room for the eye icon */
                }
                .password-toggle-icon {
                    position: absolute;
                    right: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    color: #6c757d;
                    background: none;
                    border: none;
                    padding: 0;
                    z-index: 2;
                }
            `}</style>
            <video autoPlay muted loop>
                <source src="https://videos.pexels.com/video-files/5158546/5158546-sd_960_506_25fps.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <Card style={{ width: '30rem' }}>
                <Card.Body>
                    <h3 className="text-center mb-4">Create Your Account</h3>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    <Form onSubmit={handleSignup}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <div className="password-container">
                                <Form.Control
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="password-input"
                                />
                                <div
                                    className="password-toggle-icon"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </div>
                            </div>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Sign Up As</Form.Label>
                            <div>
                                <Form.Check
                                    type="radio"
                                    label="User"
                                    name="role"
                                    value="User"
                                    checked={role === 'User'}
                                    onChange={(e) => setRole(e.target.value)}
                                    inline
                                />
                                <Form.Check
                                    type="radio"
                                    label="Owner"
                                    name="role"
                                    value="Owner"
                                    checked={role === 'Owner'}
                                    onChange={(e) => setRole(e.target.value)}
                                    inline
                                />
                            </div>
                        </Form.Group>
                        <Button 
                            variant="primary" 
                            type="submit" 
                            className="w-100" 
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </Form>
                    <div className="text-center mt-3">
                        <Button
                            variant="link"
                            className="btn-secondary"
                            onClick={() => navigate('/')}
                        >
                            <span>Already have an account?</span>
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Signup;