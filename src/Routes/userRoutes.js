import express from 'express';
import User from '../Models/User.js';
import Hostel from '../Model/Hostel.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/rate', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { hostelId, rating, review } = req.body;
        if (!hostelId || !rating) {
            return res.status(400).json({ message: 'Hostel ID and rating are required.' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // Prevent duplicate rating for the same hostel
        const alreadyRated = user.ratings.some(r => r.hostelId.toString() === hostelId);
        if (alreadyRated) {
            return res.status(400).json({ message: 'You have already rated this hostel.' });
        }
        user.ratings.push({ hostelId, rating, review });
        await user.save();

        // Also save to Hostel's ratings array
        const hostel = await Hostel.findById(hostelId);
        if (!hostel) {
            console.error('Hostel not found for rating:', hostelId);
            return res.status(404).json({ message: 'Hostel not found.' });
        }
        hostel.ratings.push({
            userId,
            rating,
            review,
            createdAt: new Date()
        });
        await hostel.save();

        res.status(201).json({ message: 'Rating submitted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting rating', error: error.message });
    }
});

export default router; 