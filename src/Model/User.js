import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        // Modified validation to be more flexible
        // match: [/^(98|97)\d{8}$/, 'Phone number must start with 98 or 97 and be 10 digits long'],
    },
    password: {
        type: String,
        required: true,
        minlength: 6, // Minimum password length
    },
    role: {
        type: String,
        enum: ['User', 'Hostel Owner', 'Admin'],
        default: 'User',
    },
    activeHostelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel',
        default: null
    },
    hobbies: {
        type: [String],
        default: [],
        validate: [
            {
                validator: function(hobbies) {
                    return hobbies.length <= 4;
                },
                message: 'Maximum 4 hobbies allowed'
            }
        ]
    },
    hostelData: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel'
    }],
    favorites: [{
        hostelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hostel',
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    bookings: [{
        hostelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hostel',
            required: true
        },
        nameEnglish: String,
        dateOfBirth: Date,
        phone: String,
        email: String,
        district: String,
        municipality: String,
        wardNo: String,
        streetAddress: String,
        educationalInstitute: String,
        classTime: String,
        levelOfStudy: String,
        stayDuration: String,
        bloodGroup: String,
        foodPreference: String,
        diseases: String,
        selectedHobbies: [String],
        roomType: String,
        preferredRoommate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        roommate: String,
        guardianInfo: {
            father: {
                name: String,
                contact: String,
                occupation: String
            },
            mother: {
                name: String,
                contact: String,
                occupation: String
            },
            spouse: {
                name: String,
                contact: String,
                occupation: String
            }
        },
        localGuardian: {
            name: String,
            contact: String,
            occupation: String,
            relation: String,
            address: String
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'completed'],
            default: 'pending'
        },
        rating: {
            value: {
                type: Number,
                min: 1,
                max: 5
            },
            review: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true
});

const User = mongoose.model('User', UserSchema);
export default User;
