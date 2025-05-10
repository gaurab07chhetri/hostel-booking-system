import mongoose from 'mongoose';

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
        hostelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hostel'
        },
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking'
        },
        roomType: {
            type: String,
            required: true
        },
        roomNumber: {
            type: String,
            default: null
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'paid'],
            default: 'pending'
        },
        amount: {
            type: Number,
            required: true
        },
        bookingDate: {
            type: Date,
            default: Date.now
        },
        roomAssignedAt: {
            type: Date,
            default: null
        },
        roomAssignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    hostelData: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel'
    }],
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel'
    }]
}, {
    timestamps: true
});

export default mongoose.model('User', userSchema); 