import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authenticateToken = (req, res, next) => {
    console.log('Auth middleware - Checking authorization header');
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        console.log('Token found, attempting verification');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verified successfully:', decoded);
        
        // Add decoded token data to request object
        req.user = {
            id: decoded.id,  // Using id consistently
            role: decoded.role
        };
        
        console.log('User ID from token:', req.user.id);
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).json({ message: 'Invalid token.' });
    }
};

export default authenticateToken; 