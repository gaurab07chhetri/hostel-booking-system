import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../Model/User.js';

dotenv.config(); // Load environment variables

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Login Route
router.post('/', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        // Validate request
        if (!email || !password || !role) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        // Find user by email & role
        const user = await User.findOne({ email, role });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials or role' });
        }

        // Compare password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token with user ID and role
        const token = jwt.sign(
            { 
                id: user._id,  // Changed from userId to id to match auth middleware
                role: user.role 
            }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({ 
            message: 'Login successful', 
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

export default router;
