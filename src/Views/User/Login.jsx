import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Particles } from "react-tsparticles";
import { AuthContext } from '../../context/AuthContext';
import './Login.css';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('User');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    useEffect(() => {
        document.title = 'Login - My App';
        const token = localStorage.getItem('token');
        if (token) navigate('/dashboard');
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/login', {
                email,
                password,
                role,
            });

            login(res.data.token, res.data.user);
            toast.success('Login successful!', { autoClose: 2000 });

            setTimeout(() => {
                if (res.data.user.role === 'Admin') navigate('/admin/dashboard');
                else if (res.data.user.role === 'Hostel Owner') navigate('/owner/hostel-dashboard');
                else navigate('/dashboard');
            }, 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage, { autoClose: 4000 });
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="background-particles">
                <Particles
                    options={{
                        particles: {
                            number: { value: 50 },
                            size: { value: 3 },
                            move: { speed: 1 },
                            opacity: { value: 0.5 },
                            links: {
                                enable: true,
                                distance: 150,
                                color: "#ffffff",
                                opacity: 0.4,
                                width: 1
                            }
                        },
                        interactivity: {
                            events: {
                                onHover: { enable: true, mode: "repulse" }
                            }
                        }
                    }}
                />
            </div>

            <ToastContainer position="top-right" />

            <motion.div
                className="login-container"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'anticipate' }}
            >
                <motion.div
                    className="login-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <motion.h2
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-center mb-6 text-2xl font-bold text-gray-800"
                    >
                        Welcome Back
                    </motion.h2>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="password-container">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-control"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <span
                                        className="password-toggle-icon"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.0 }}
                        >
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Login As
                                </label>
                                <select
                                    className="form-control"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="User">User</option>
                                    <option value="Hostel Owner">Hostel Owner</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2 }}
                        >
                            <button
                                type="submit"
                                className="login-button"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    'Logging In...'
                                ) : (
                                    <span className="flex items-center justify-center">
                                        Login <FiArrowRight className="ml-2" />
                                    </span>
                                )}
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.4 }}
                            className="text-center mt-4"
                        >
                            <span
                                onClick={() => navigate('/forgot-password')}
                                className="forgot-password-link text-sm font-medium"
                            >
                                Forgot Password?
                            </span>
                        </motion.div>
                    </form>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.6 }}
                        className="text-center mt-6 pt-4 border-t border-gray-200"
                    >
                        <span className="text-sm text-gray-600">
                            Don't have an account?{' '}
                        </span>
                        <span
                            onClick={() => navigate('/signup')}
                            className="signup-link text-sm font-medium"
                        >
                            Sign Up Now
                        </span>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;