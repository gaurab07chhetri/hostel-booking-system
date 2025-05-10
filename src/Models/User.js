const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['User', 'Owner', 'Admin'],
        default: 'User'
    },
    hobbies: [{
        type: String
    }],
    bookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    }],
    hostelData: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel'
    }],
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Favorite'
    }],
    ratings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rating'
    }]
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User; 