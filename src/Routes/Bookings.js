import express from 'express';
import auth from '../middleware/auth.js';
import User from '../Model/User.js';

const router = express.Router();

// Create a new booking
router.post('/create', auth, async (req, res) => {
    try {
        const {
            hostelId,
            nameEnglish,
            dateOfBirth,
            phone,
            email,
            district,
            municipality,
            wardNo,
            streetAddress,
            educationalInstitute,
            classTime,
            levelOfStudy,
            stayDuration,
            bloodGroup,
            foodPreference,
            diseases,
            selectedHobbies,
            roomType,
            preferredRoommate,
            guardianInfo,
            localGuardian
        } = req.body;

        // Validate required fields
        if (!hostelId || !nameEnglish || !phone || !email || !roomType) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Get the current user
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user already has a booking for this hostel
        if (user.bookings && user.bookings.length > 0) {
            const existingBooking = user.bookings.find(booking => 
                booking.hostelId.toString() === hostelId && 
                (booking.status === 'pending' || booking.status === 'approved')
            );

            if (existingBooking) {
                return res.status(400).json({
                    success: false,
                    message: 'You already have a booking for this hostel'
                });
            }
        }

        // Create booking object
        const booking = {
            hostelId,
            nameEnglish,
            dateOfBirth,
            phone,
            email,
            district,
            municipality,
            wardNo,
            streetAddress,
            educationalInstitute,
            classTime,
            levelOfStudy,
            stayDuration,
            bloodGroup,
            foodPreference,
            diseases,
            selectedHobbies,
            roomType,
            preferredRoommate: preferredRoommate || null,
            guardianInfo,
            localGuardian,
            status: 'pending',
            createdAt: new Date()
        };

        // Add booking to user's bookings array
        if (!user.bookings) {
            user.bookings = [];
        }
        
        user.bookings.push(booking);
        await user.save();

        // Return success response
        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: {
                id: user.bookings[user.bookings.length - 1]._id,
                hostelId,
                roomType,
                status: 'pending'
            }
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create booking',
            error: error.message
        });
    }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('bookings.hostelId', 'hostel_name hostel_location hostel_type');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            bookings: user.bookings || []
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: error.message
        });
    }
});

// Get bookings by hostel ID
router.get('/hostel/:hostelId', auth, async (req, res) => {
    try {
        const { hostelId } = req.params;
        
        // Find all users who have bookings for this hostel
        const users = await User.find({
            'bookings.hostelId': hostelId
        }).populate('bookings.hostelId', 'hostel_name hostel_location hostel_type');
        
        // Extract all bookings for this hostel
        let hostelBookings = [];
        users.forEach(user => {
            const userBookings = user.bookings.filter(booking => 
                booking.hostelId._id.toString() === hostelId
            );
            
            // Add user information to each booking
            const bookingsWithUser = userBookings.map(booking => ({
                ...booking.toObject(),
                userId: user._id,
                userName: user.name,
                userEmail: user.email,
                userPhone: user.phone
            }));
            
            hostelBookings = [...hostelBookings, ...bookingsWithUser];
        });
        
        res.status(200).json({
            success: true,
            bookings: hostelBookings
        });
    } catch (error) {
        console.error('Error fetching hostel bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch hostel bookings',
            error: error.message
        });
    }
});

// Approve a booking
router.put('/:bookingId/approve', auth, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { roomNumber } = req.body;
        
        // Find the user with this booking
        const user = await User.findOne({
            'bookings._id': bookingId
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        // Find the booking in the user's bookings array
        const bookingIndex = user.bookings.findIndex(booking => 
            booking._id.toString() === bookingId
        );
        
        if (bookingIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        // Update the booking status
        user.bookings[bookingIndex].status = 'approved';
        if (roomNumber) {
            user.bookings[bookingIndex].roomNumber = roomNumber;
        }
        
        await user.save();
        
        res.status(200).json({
            success: true,
            message: 'Booking approved successfully',
            booking: user.bookings[bookingIndex]
        });
    } catch (error) {
        console.error('Error approving booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve booking',
            error: error.message
        });
    }
});

// Reject a booking
router.put('/:bookingId/reject', auth, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { rejectionReason } = req.body;
        
        // Find the user with this booking
        const user = await User.findOne({
            'bookings._id': bookingId
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        // Find the booking in the user's bookings array
        const bookingIndex = user.bookings.findIndex(booking => 
            booking._id.toString() === bookingId
        );
        
        if (bookingIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        // Update the booking status
        user.bookings[bookingIndex].status = 'rejected';
        if (rejectionReason) {
            user.bookings[bookingIndex].rejectionReason = rejectionReason;
        }
        
        await user.save();
        
        res.status(200).json({
            success: true,
            message: 'Booking rejected successfully',
            booking: user.bookings[bookingIndex]
        });
    } catch (error) {
        console.error('Error rejecting booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject booking',
            error: error.message
        });
    }
});

// Delete a booking by ID
router.delete('/:bookingId', auth, async (req, res) => {
    try {
        const { bookingId } = req.params;
        // Find the user with this booking
        const user = await User.findOne({ 'bookings._id': bookingId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        // Remove the booking from the user's bookings array
        user.bookings = user.bookings.filter(booking => booking._id.toString() !== bookingId);
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Booking deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete booking',
            error: error.message
        });
    }
});

export default router; 