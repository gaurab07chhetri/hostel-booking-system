const Hostel = require('../models/Hostel');
const Booking = require('../models/Booking');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all bookings for a specific hostel
// @route   GET /api/hostels/:hostelId/bookings
// @access  Private/Admin
exports.getHostelBookings = asyncHandler(async (req, res, next) => {
    const hostel = await Hostel.findById(req.params.hostelId);

    if (!hostel) {
        return next(new ErrorResponse(`Hostel not found with id of ${req.params.hostelId}`, 404));
    }

    // Get all bookings for this hostel
    const bookings = await Booking.find({ hostelId: req.params.hostelId })
        .select('nameEnglish roomNumber phone email roomType stayDuration educationalInstitute status')
        .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
        success: true,
        count: bookings.length,
        bookings
    });
}); 