const Booking = require('../Models/Booking');
const User = require('../Models/User');
const Hostel = require('../Models/Hostel');

// Find potential roommates based on hobbies and hostel
exports.findPotentialRoommates = async (req, res) => {
    try {
        const { hostelId, hobbies } = req.body;
        const currentUserId = req.user._id;

        // First, find all users who have booked this hostel
        const usersWithBookings = await Booking.aggregate([
            {
                $match: {
                    hostel: hostelId,
                    status: 'Approved',
                    user: { $ne: currentUserId }
                }
            },
            {
                $group: {
                    _id: '$user',
                    bookingCount: { $sum: 1 },
                    latestBooking: { $max: '$createdAt' }
                }
            }
        ]);

        // Get the user IDs who have booked this hostel
        const userIdsWithBookings = usersWithBookings.map(booking => booking._id);

        // Now find users who have booked this hostel and have matching hobbies
        const potentialRoommates = await User.aggregate([
            {
                $match: {
                    _id: { 
                        $in: userIdsWithBookings // Only users who have booked this hostel
                    },
                    hobbies: { $in: hobbies } // Must have matching hobbies
                }
            },
            {
                $lookup: {
                    from: 'bookings',
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$user', '$$userId'] },
                                        { $eq: ['$hostel', hostelId] },
                                        { $eq: ['$status', 'Approved'] }
                                    ]
                                }
                            }
                        },
                        {
                            $sort: { createdAt: -1 }
                        },
                        {
                            $limit: 1
                        }
                    ],
                    as: 'latestBooking'
                }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    phone: 1,
                    hobbies: 1,
                    matchingHobbies: {
                        $filter: {
                            input: '$hobbies',
                            as: 'hobby',
                            cond: { $in: ['$$hobby', hobbies] }
                        }
                    },
                    latestBooking: { $arrayElemAt: ['$latestBooking', 0] },
                    bookingHistory: {
                        hostelId: hostelId,
                        bookingCount: {
                            $size: '$latestBooking'
                        }
                    }
                }
            }
        ]);

        // Sort by:
        // 1. Number of matching hobbies (descending)
        // 2. Latest booking date (most recent first)
        potentialRoommates.sort((a, b) => {
            const hobbyMatchDiff = b.matchingHobbies.length - a.matchingHobbies.length;
            if (hobbyMatchDiff !== 0) return hobbyMatchDiff;
            
            return new Date(b.latestBooking?.createdAt || 0) - new Date(a.latestBooking?.createdAt || 0);
        });

        res.json({
            success: true,
            data: potentialRoommates.map(roommate => ({
                ...roommate,
                matchingHobbiesCount: roommate.matchingHobbies.length,
                totalHobbies: roommate.hobbies.length,
                lastBookedAt: roommate.latestBooking?.createdAt,
                bookingCount: roommate.bookingHistory.bookingCount
            }))
        });
    } catch (error) {
        console.error('Error finding potential roommates:', error);
        res.status(500).json({
            success: false,
            message: 'Error finding potential roommates',
            error: error.message
        });
    }
}; 