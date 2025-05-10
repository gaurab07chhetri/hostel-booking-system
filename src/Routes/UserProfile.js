import express from 'express';
import auth from '../middleware/auth.js';
import User from '../Model/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        console.log('Fetching user profile for ID:', req.user.id);
        
        const user = await User.findById(req.user.id)
            .select('-password'); // Exclude password from the response
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            activeHostelId: user.activeHostelId
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        console.log('Update request body:', req.body); // Debug log
        
        // Find user by ID
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is being changed and if it's already in use
        if (email !== user.email) {
            const emailExists = await User.findOne({ email, _id: { $ne: req.user.id } });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // Check if phone is being changed and if it's already in use
        if (phone !== user.phone) {
            const phoneExists = await User.findOne({ phone, _id: { $ne: req.user.id } });
            if (phoneExists) {
                return res.status(400).json({ message: 'Phone number already in use' });
            }
        }

        // Update user
        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.address = address || user.address || ''; // Add address update

        await user.save();
        
        // Return updated user without password
        const updatedUser = {
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role
        };
        
        console.log('Updated user:', updatedUser); // Debug log
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router; 