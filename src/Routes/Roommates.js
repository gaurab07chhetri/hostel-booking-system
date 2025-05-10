import express from 'express';
import User from '../Model/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Match roommates based on hobbies and hostel
router.post('/match', auth, async (req, res) => {
    try {
        const { hostelId, hobbies } = req.body;
        
        // Validate input
        if (!hostelId) {
            return res.status(400).json({ 
                success: false,
                message: 'HostelId is required.' 
            });
        }

        // If no hobbies provided, return empty matches
        if (!Array.isArray(hobbies) || hobbies.length === 0) {
            return res.json({
                success: true,
                matches: [],
                message: 'No hobbies selected. You can proceed with room selection.'
            });
        }

        // Find users with matching hobbies in the same hostel
        const potentialRoommates = await User.find({
            _id: { $ne: req.user.id }, // Exclude current user
            hobbies: { $in: hobbies }, // Match any of the hobbies
            role: 'User' // Only match with regular users
        }).select('name hobbies');

        // Calculate matching hobbies for each potential roommate
        const matches = potentialRoommates.map(roommate => {
            const matchingHobbies = roommate.hobbies.filter(hobby => 
                hobbies.includes(hobby)
            );
            
            return {
                _id: roommate._id,
                name: roommate.name,
                matchingHobbies,
                matchScore: matchingHobbies.length / hobbies.length // Calculate match percentage
            };
        });

        // Sort matches by match score (highest first)
        matches.sort((a, b) => b.matchScore - a.matchScore);

        res.json({
            success: true,
            matches,
            message: matches.length > 0 ? 
                'Found potential roommates' : 
                'No matching roommates found. You can proceed with room selection.'
        });
    } catch (error) {
        console.error('Error matching roommates:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error finding potential roommates',
            error: error.message 
        });
    }
});

export default router; 