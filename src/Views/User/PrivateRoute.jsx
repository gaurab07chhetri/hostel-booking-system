import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const PrivateRoute = ({ children, adminOnly = false, ownerOnly = false, role }) => {
    const { token, user, loading } = useContext(AuthContext);

    // Show loading state
    if (loading) {
        return <div>Loading...</div>;
    }

    // If no token, redirect to login
    if (!token) {
        return <Navigate to="/" />;
    }

    // Check for admin access if required
    if (adminOnly && (!user || user.role !== 'Admin')) {
        return <Navigate to="/user/home" />;
    }

    // Check for owner access if required
    if (ownerOnly && (!user || user.role !== 'Hostel Owner')) {
        return <Navigate to="/user/home" />;
    }

    // Check for specific role if required
    if (role && (!user || user.role !== role)) {
        return <Navigate to="/user/home" />;
    }

    return children;
};

export default PrivateRoute;
