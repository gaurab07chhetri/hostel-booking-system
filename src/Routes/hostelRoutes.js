const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getHostels,
    getHostel,
    createHostel,
    updateHostel,
    deleteHostel,
    getHostelBookings
} = require('../controllers/hostelController');

router.post('/register', authenticateToken, async (req, res) => {
  try {
    // Check if user already has a hostel
    const existingHostel = await Hostel.findOne({ userId: req.user.id });
    if (existingHostel) {
      return res.status(400).json({ message: 'You already have a registered hostel' });
    }

    // Create new hostel
    const hostelData = {
      ...req.body,
      userId: req.user.id
    };

    const hostel = new Hostel(hostelData);
    await hostel.save();
    res.status(201).json({ message: 'Hostel registered successfully', hostel });
  } catch (error) {
    console.error('Error registering hostel:', error);
    res.status(500).json({ message: 'Error registering hostel', error: error.message });
  }
});

// Get hostel for current owner
router.get('/owner/current', authenticateToken, async (req, res) => {
  try {
    const hostel = await Hostel.findOne({ userId: req.user.id });
    if (!hostel) {
      return res.status(404).json({ message: 'No hostel found for this user' });
    }
    res.json(hostel);
  } catch (error) {
    console.error('Error fetching hostel:', error);
    res.status(500).json({ message: 'Error fetching hostel', error: error.message });
  }
});

// Update hostel details
router.put('/update', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find the hostel by userId
        const hostel = await Hostel.findOne({ userId });
        if (!hostel) {
            return res.status(404).json({ message: 'Hostel not found' });
        }

        // Update the hostel with the new data
        const updatedData = {
            hostel_name: req.body.hostel_name,
            email: req.body.email,
            phone_number: req.body.phone_number,
            hostel_location: req.body.hostel_location,
            hostel_type: req.body.hostel_type,
            features: req.body.features,
            feeStructure: req.body.feeStructure,
            rooms: req.body.rooms,
            foodSchedule: req.body.foodSchedule,
            precise_location: req.body.precise_location
        };

        const updatedHostel = await Hostel.findOneAndUpdate(
            { userId },
            updatedData,
            { new: true, runValidators: true }
        );

        res.json({
            message: 'Hostel updated successfully',
            hostel: updatedHostel
        });
    } catch (error) {
        console.error('Error updating hostel:', error);
        res.status(500).json({ 
            message: 'Error updating hostel',
            error: error.message 
        });
    }
});

// Get all bookings for a specific hostel
router.get('/:hostelId/bookings', protect, authorize('admin'), getHostelBookings);

module.exports = router; 