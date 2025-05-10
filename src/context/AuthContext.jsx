import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (token) {
                try {
                    const response = await axios.get('http://localhost:5000/api/users/profile', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    setUser(response.data);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    // If token is invalid, clear it
                    if (error.response?.status === 401) {
                        logout();
                    }
                }
            }
            setLoading(false);
        };

        fetchUserData();
    }, [token]);

    const login = async (newToken, userData) => {
        console.log('Login called with token and user data:', { newToken, userData });
        
        if (newToken) {
            localStorage.setItem('token', newToken);
            setToken(newToken);

            // If userData is provided, set it directly
            if (userData) {
                setUser(userData);
            } else {
                // Otherwise fetch user data
                try {
                    const response = await axios.get('http://localhost:5000/api/users/profile', {
                        headers: {
                            'Authorization': `Bearer ${newToken}`
                        }
                    });
                    setUser(response.data);
                } catch (error) {
                    console.error('Error fetching user data after login:', error);
                }
            }
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const value = {
        token,
        user,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
