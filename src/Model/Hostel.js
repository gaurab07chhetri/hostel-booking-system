import mongoose from 'mongoose';

const RoomTypeSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['1-Seater', '2-Seater', '3-Seater', '4-Seater'],
        required: true
    },
    availableRooms: {
        type: Number,
        required: true,
        min: 0
    },
    feePerMonth: {
        type: Number,
        required: true
    },
    roomImage: {
        type: String,
        required: false,
        default: 'https://res.cloudinary.com/dnfwevjwg/image/upload/v1744462386/Hostel/default-room.jpg'
    }
});

const FoodScheduleSchema = new mongoose.Schema({
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
    },
    breakfast: {
        type: String,
        required: true
    },
    lunch: {
        type: String,
        required: true
    },
    dinner: {
        type: String,
        required: true
    }
});

const HostelSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true
    },
    hostel_name: {
        type: String,
        required: true
    },
    hostel_location: {
        type: String,
        required: true
    },
    precise_location: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        landmarks: {
            type: String,
            required: false
        }
    },
    foodSchedule: {
        type: [FoodScheduleSchema],
        required: true,
        validate: {
            validator: function(schedule) {
                return schedule.length === 7; // Must have all 7 days
            },
            message: 'Food schedule must include all 7 days of the week'
        }
    },
    feeStructure: {
        type: String,
        required: true
    },
    rooms: {
        type: [RoomTypeSchema],
        required: true,
        validate: {
            validator: function(rooms) {
                return rooms.length > 0;
            },
            message: 'At least one room type must be specified'
        }
    },
    features: {
        type: String,
        required: true
    },
    hostelImage: {
        type: String,
        required: true
    },
    hostel_type: {
        type: String,
        enum: ['Boys', 'Girls'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

const Hostel = mongoose.model("Hostel", HostelSchema);

export default Hostel;
