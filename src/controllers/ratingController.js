const Rating = require('../models/Rating');
const Booking = require('../models/Booking');
const User = require('../Models/User');

exports.submitRating = async (req, res) => {
    try {
        const { bookingId, hostelId, rating, feedback } = req.body;
        const userId = req.user._id;

        // Check if booking exists and belongs to the user
        const booking = await Booking.findOne({
            _id: bookingId,
            userId: userId,
            paymentStatus: 'completed'
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found or not eligible for rating'
            });
        }

        // Check if rating already exists for this booking
        const existingRating = await Rating.findOne({ bookingId });
        if (existingRating) {
            return res.status(400).json({
                success: false,
                message: 'Rating already submitted for this booking'
            });
        }

        // Create new rating
        const newRating = await Rating.create({
            userId,
            hostelId,
            bookingId,
            rating,
            feedback
        });

        // Update booking with rating reference
        booking.rating = newRating._id;
        await booking.save();

        // Add rating to user's ratings array
        await User.findByIdAndUpdate(userId, { $push: { ratings: newRating._id } });

        res.status(201).json({
            success: true,
            message: 'Rating submitted successfully',
            data: newRating
        });
    } catch (error) {
        console.error('Error submitting rating:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting rating',
            error: error.message
        });
    }
};

exports.getHostelRatings = async (req, res) => {
    try {
        const { hostelId } = req.params;

        const ratings = await Rating.find({ hostelId })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });

        const averageRating = ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length;

        res.status(200).json({
            success: true,
            data: {
                ratings,
                averageRating: averageRating || 0,
                totalRatings: ratings.length
            }
        });
    } catch (error) {
        console.error('Error fetching ratings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ratings',
            error: error.message
        });
    }
}; 