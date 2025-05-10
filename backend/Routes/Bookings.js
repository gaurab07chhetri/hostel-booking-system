import express from 'express';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Assign room to a booking
router.put('/:bookingId/assign-room', authenticateToken, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { roomNumber } = req.body;

        if (!roomNumber) {
            return res.status(400).json({ 
                success: false,
                message: 'Room number is required' 
            });
        }

        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            return res.status(404).json({ 
                success: false,
                message: 'Booking not found' 
            });
        }

        if (booking.status !== 'approved') {
            return res.status(400).json({ 
                success: false,
                message: 'Can only assign rooms to approved bookings' 
            });
        }

        // Check if room is already assigned to another active booking
        const existingBooking = await Booking.findOne({
            hostelId: booking.hostelId,
            'roomAssignment.roomNumber': roomNumber,
            'roomAssignment.isAssigned': true,
            status: { $in: ['approved', 'paid'] },
            _id: { $ne: bookingId }
        });

        if (existingBooking) {
            return res.status(400).json({ 
                success: false,
                message: 'Room is already assigned to another booking' 
            });
        }

        // Update room assignment in Booking model
        booking.roomAssignment = {
            roomNumber: roomNumber,
            assignedAt: new Date(),
            assignedBy: req.user._id,
            isAssigned: true
        };
        
        await booking.save();

        // Update room assignment in User model
        const user = await User.findById(booking.userId);
        if (user) {
            const bookingIndex = user.bookings.findIndex(b => b.bookingId.toString() === bookingId);
            if (bookingIndex !== -1) {
                user.bookings[bookingIndex].roomNumber = roomNumber;
                user.bookings[bookingIndex].roomAssignedAt = new Date();
                user.bookings[bookingIndex].roomAssignedBy = req.user._id;
                await user.save();
            }
        }

        res.json({ 
            success: true, 
            message: 'Room assigned successfully',
            booking
        });
    } catch (error) {
        console.error('Error assigning room:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error assigning room' 
        });
    }
});

// Get all bookings for a hostel
router.get('/hostel/:hostelId', authenticateToken, async (req, res) => {
    try {
        const bookings = await Booking.find({ hostelId: req.params.hostelId })
            .populate('userId', 'name email phone')
            .populate('roomAssignment.assignedBy', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching bookings' 
        });
    }
});

// Get user's bookings
router.get('/my-bookings', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: 'bookings.hostelId',
                select: 'hostel_name feeStructure'
            })
            .populate({
                path: 'bookings.roomAssignedBy',
                select: 'name'
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({ 
            success: true, 
            bookings: user.bookings 
        });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching bookings' 
        });
    }
});

// Delete a booking
router.delete('/:bookingId', authenticateToken, async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        // Find the booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Find and update the user's bookings array
        const user = await User.findById(booking.userId);
        if (user) {
            user.bookings = user.bookings.filter(b => b.bookingId.toString() !== bookingId);
            await user.save();
        }

        // Delete the booking
        await Booking.findByIdAndDelete(bookingId);

        res.json({
            success: true,
            message: 'Booking deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting booking'
        });
    }
});

// Other existing routes...

export default router; 