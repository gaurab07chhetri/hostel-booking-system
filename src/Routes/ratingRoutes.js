const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    submitRating,
    getHostelRatings
} = require('../controllers/ratingController');

// Submit rating for a booking
router.post('/', protect, submitRating);

// Get ratings for a hostel
router.get('/hostel/:hostelId', getHostelRatings);

module.exports = router; 