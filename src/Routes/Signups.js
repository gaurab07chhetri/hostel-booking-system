import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../Model/User.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
    const { name, email, phone, password, role } = req.body;

    try {
        // Validate required fields
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ 
                message: "All fields are required",
                missingFields: {
                    name: !name,
                    email: !email,
                    phone: !phone,
                    password: !password
                }
            });
        }

        // Check if user already exists by email
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ message: "Email is already in use" });
        }

        // Check if user already exists by phone
        const existingUserByPhone = await User.findOne({ phone });
        if (existingUserByPhone) {
            return res.status(400).json({ message: "Phone number is already in use" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ 
            name, 
            email, 
            phone, 
            password: hashedPassword, 
            role: role || 'User' // Default to 'User' if not specified
        });

        // Save to MongoDB
        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ 
            message: "Account created successfully",
            token: token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (err) {
        console.error("Error in signup:", err);
        
        // Handle Mongoose validation errors
        if (err.name === 'ValidationError') {
            const validationErrors = {};
            for (const field in err.errors) {
                validationErrors[field] = err.errors[field].message;
            }
            return res.status(400).json({ 
                message: "Validation error", 
                errors: validationErrors 
            });
        }
        
        // Handle duplicate key errors
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ 
                message: `${field} is already in use` 
            });
        }
        
        // Generic server error
        res.status(500).json({ 
            message: "Server error during signup", 
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
});

export default router;
