import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import SignupsRouter from './Routes/Signups.js';
import LoginRouter from './Routes/Login.js';
import HostelRouter from './Routes/Hostels.js';
import dashboardRouters from './Routes/dashboards.js';
import userProfileRoutes from './Routes/UserProfile.js';
import adminRoutes from './Routes/adminRoutes.js';
import userHobbiesRouter from './Routes/UserHobbies.js';
import roommatesRouter from './Routes/Roommates.js';
import bookingsRouter from './Routes/Bookings.js';

// Load environment variables
dotenv.config();

// Create an Express app
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Debug middleware to log incoming requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Debug: Check if MONGO_URI is loaded
if (!process.env.MONGO_URI) {
    console.error('❌ MongoDB URI is missing in .env file!');
    process.exit(1); // Exit if no MongoDB connection string
} else {
    console.log('✅ MongoDB URI loaded.');
}

// Database connection (MongoDB)
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((error) => {
        console.error('❌ Error connecting to MongoDB:', error);
        process.exit(1); // Exit on connection failure
    });

// Routes
app.use('/api/login', LoginRouter);
app.use('/api/sign-up', SignupsRouter);
app.use('/api/hostels', HostelRouter);
app.use('/api/dashboard', dashboardRouters);
app.use('/api/users', userProfileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hobbies', userHobbiesRouter);
app.use('/api/roommates', roommatesRouter);
app.use('/api/bookings', bookingsRouter);

// Debug route to check API status
app.get('/api/test', (req, res) => {
    res.json({ message: '✅ API is working' });
});

// Start the server
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});
