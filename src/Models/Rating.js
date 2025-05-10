const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hostelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    feedback: {
        type: String,
        trim: true,
        maxlength: 500
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index to ensure one rating per booking
ratingSchema.index({ bookingId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema); 