const Favorite = require('../Models/Favorite');
const User = require('../Models/User');
const Hostel = require('../Models/Hostel');

// Add a hostel to favorites
exports.addToFavorites = async (req, res) => {
    try {
        const { hostelId } = req.body;
        const userId = req.user._id;

        // Check if hostel exists
        const hostel = await Hostel.findById(hostelId);
        if (!hostel) {
            return res.status(404).json({ message: 'Hostel not found' });
        }

        // Create new favorite
        const favorite = new Favorite({
            user: userId,
            hostel: hostelId
        });

        await favorite.save();

        // Add favorite to user's favorites array
        await User.findByIdAndUpdate(
            userId,
            { $push: { favorites: favorite._id } }
        );

        res.status(201).json({
            message: 'Hostel added to favorites',
            favorite
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Hostel already in favorites' });
        }
        res.status(500).json({ message: 'Error adding to favorites', error: error.message });
    }
};

// Remove a hostel from favorites
exports.removeFromFavorites = async (req, res) => {
    try {
        const { hostelId } = req.params;
        const userId = req.user._id;

        // Find and delete the favorite
        const favorite = await Favorite.findOneAndDelete({
            user: userId,
            hostel: hostelId
        });

        if (!favorite) {
            return res.status(404).json({ message: 'Favorite not found' });
        }

        // Remove favorite from user's favorites array
        await User.findByIdAndUpdate(
            userId,
            { $pull: { favorites: favorite._id } }
        );

        res.json({ message: 'Hostel removed from favorites' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing from favorites', error: error.message });
    }
};

// Get user's favorite hostels
exports.getFavorites = async (req, res) => {
    try {
        const userId = req.user._id;

        const favorites = await Favorite.find({ user: userId })
            .populate({
                path: 'hostel',
                select: 'hostel_name hostel_location image price features'
            });

        res.json(favorites);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching favorites', error: error.message });
    }
};

// Check if a hostel is in user's favorites
exports.checkFavorite = async (req, res) => {
    try {
        const { hostelId } = req.params;
        const userId = req.user._id;

        const favorite = await Favorite.findOne({
            user: userId,
            hostel: hostelId
        });

        res.json({ isFavorite: !!favorite });
    } catch (error) {
        res.status(500).json({ message: 'Error checking favorite status', error: error.message });
    }
}; 