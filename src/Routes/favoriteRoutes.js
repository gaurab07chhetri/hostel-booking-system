const express = require('express');
const router = express.Router();
const favoriteController = require('../Controllers/favoriteController');
const auth = require('../Middleware/auth');

// All routes require authentication
router.use(auth);

// Add hostel to favorites
router.post('/add', favoriteController.addToFavorites);

// Remove hostel from favorites
router.delete('/remove/:hostelId', favoriteController.removeFromFavorites);

// Get user's favorite hostels
router.get('/', favoriteController.getFavorites);

// Check if a hostel is in user's favorites
router.get('/check/:hostelId', favoriteController.checkFavorite);

module.exports = router; 