import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import userRoutes from './Routes/userRoutes.js';
import hostelRoutes from './Routes/hostelRoutes.js';
import bookingRoutes from './Routes/bookingRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/bookings', bookingRoutes);

export default app; 