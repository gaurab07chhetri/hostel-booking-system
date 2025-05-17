import express from 'express';
import auth from '../middleware/auth.js';
import User from '../Model/User.js';
import { authenticateToken } from '../middleware/auth.js';
import Hostel from '../Model/Hostel.js';

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

// Update the /rate endpoint to check for both booking formats
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

        // Find the booking for this hostel
        const booking = user.bookings.find(b => b.hostelId.toString() === hostelId);
        if (!booking) {
            return res.status(403).json({ message: 'You can only rate hostels you have booked.' });
        }

        // Check if already rated
        if (booking.rating && booking.rating.value) {
            return res.status(400).json({ message: 'You have already rated this hostel.' });
        }

        // Add rating to the booking
        booking.rating = {
            value: rating,
            review,
            createdAt: new Date()
        };

        // Also add to user's ratings array for backward compatibility
        if (!user.ratings) user.ratings = [];
        user.ratings.push({
            hostelId,
            rating,
            review,
            createdAt: new Date()
        });

        await user.save();

        // Update hostel's ratings
        const hostel = await Hostel.findById(hostelId);
        if (hostel) {
            if (!hostel.ratings) hostel.ratings = [];
            hostel.ratings.push({
                userId,
                rating,
                review,
                createdAt: new Date()
            });
            await hostel.save();
        }

        res.status(201).json({ 
            success: true,
            message: 'Rating submitted successfully.',
            rating: booking.rating
        });
    } catch (error) {
        console.error('Error submitting rating:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error submitting rating', 
            error: error.message 
        });
    }
});

// Add a GET /all endpoint to return all users with their ratings and bookings
router.get('/all', authenticateToken, async (req, res) => {
    try {
        // Return name, ratings, and bookings for each user
        const users = await User.find({}, 'name ratings bookings');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// Get user by ID (for roommate display)
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('name nameEnglish email');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ name: user.name || user.nameEnglish || user.email });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
});

export default router; 