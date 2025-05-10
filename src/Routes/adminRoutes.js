import express from 'express';
import User from '../Model/User.js';
import Hostel from '../Model/Hostel.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    console.log('GET /api/admin/users - Fetching all users');
    console.log('User making request:', req.user);
    
    const users = await User.find({})
      .select('-password')
      .lean();
    
    console.log(`Found ${users.length} users`);
    
    if (users.length === 0) {
      console.log('No users found in the database');
    } else {
      console.log('First user sample:', users[0]);
    }
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Delete a user (admin only)
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete the user
    await User.findByIdAndDelete(id);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin dashboard statistics
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalHostels = await Hostel.countDocuments({ status: 'approved' });
    const pendingRequests = await Hostel.countDocuments({ status: 'pending' });

    res.json({
      totalUsers,
      totalOwners,
      totalHostels,
      pendingRequests,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending hostel requests
router.get('/pending-hostels', auth, adminAuth, async (req, res) => {
  try {
    const pendingHostels = await Hostel.find({ status: 'pending' })
      .select('hostel_name hostel_location email createdAt')
      .lean();

    res.json(pendingHostels);
  } catch (error) {
    console.error('Error fetching pending hostels:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update hostel request status
router.put('/hostel-requests/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const hostel = await Hostel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    res.json(hostel);
  } catch (error) {
    console.error('Error updating hostel status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 