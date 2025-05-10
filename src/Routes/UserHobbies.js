import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import User from '../Model/User.js';

const router = express.Router();

// Get all available hobbies
router.get('/hobbies', async (req, res) => {
    try {
        // List of predefined hobbies
        const hobbies = [
            'Sports', 'Science', 'Maths', 'Lok Sewa', 'Law', 'Management',
            'Technologies', 'Music', 'MBBS', 'Engineering', 'Night Owl'
        ];
        
        res.json(hobbies);
    } catch (error) {
        console.error('Error fetching hobbies:', error);
        res.status(500).json({ message: 'Error fetching hobbies' });
    }
});

// Get user's hobbies
router.get('/user-hobbies', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user.hobbies || []);
    } catch (error) {
        console.error('Error fetching user hobbies:', error);
        res.status(500).json({ message: 'Error fetching user hobbies' });
    }
});

// Update user's hobbies
router.put('/user-hobbies', authenticateToken, async (req, res) => {
    try {
        const { hobbies } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.hobbies = hobbies;
        await user.save();
        
        res.json(user.hobbies);
    } catch (error) {
        console.error('Error updating user hobbies:', error);
        res.status(500).json({ message: 'Error updating user hobbies' });
    }
});

export default router; 