import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
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
    nameEnglish: {
        type: String,
        required: true
    },
    roomType: {
        type: String,
        required: true
    },
    stayDuration: {
        type: String,
        required: true
    },
    educationalInstitute: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'paid'],
        default: 'pending'
    },
    roomAssignment: {
        roomNumber: {
            type: String,
            default: null
        },
        assignedAt: {
            type: Date,
            default: null
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        isAssigned: {
            type: Boolean,
            default: false
        }
    },
    rejectionReason: {
        type: String,
        default: null
    },
    amount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Booking', bookingSchema); 