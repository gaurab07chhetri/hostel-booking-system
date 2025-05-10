const express = require('express');
const router = express.Router();
const bookingController = require('../Controllers/bookingController');
const auth = require('../Middleware/auth');

// All routes require authentication
router.use(auth);

// Find potential roommates
router.post('/find-roommates', bookingController.findPotentialRoommates);

// ... rest of your existing routes ...

module.exports = router; 