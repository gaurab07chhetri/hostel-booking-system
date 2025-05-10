import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Hostel from "../Model/Hostel.js";
import cloudinaryConfig from "../config/config.js";
import auth from '../middleware/auth.js';

const router = express.Router();

// Check if a hostel with the given email exists
router.get("/check-email", auth, async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    // Use findOne with email field only, not the entire query
    const existingHostel = await Hostel.findOne({ email: email });
    
    res.json({ exists: !!existingHostel });
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ message: "Error checking email", error: error.message });
  }
});

// Cloudinary Configuration
cloudinary.config(cloudinaryConfig);

// Cloudinary Storage Configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "Hostel", // Folder where images will be stored in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"],
    resource_type: "image", // Ensure only images are uploaded
  },
});

// Multer Setup for Uploading Images
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Register Hostel with Multiple Image Uploads
router.post("/", auth, upload.fields([
  { name: 'hostelImage', maxCount: 1 },
  { name: 'roomImage-0', maxCount: 1 },
  { name: 'roomImage-1', maxCount: 1 },
  { name: 'roomImage-2', maxCount: 1 },
  { name: 'roomImage-3', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    console.log('Received files:', req.files);
    console.log('User from token:', req.user);

    const { 
      email, 
      phone_number, 
      hostel_name, 
      hostel_location, 
      foodSchedule, 
      feeStructure, 
      features, 
      hostel_type,
      precise_location,
      rooms 
    } = req.body;

    // Parse JSON strings if needed
    let parsedFoodSchedule, parsedPreciseLocation, parsedRooms;
    try {
      parsedFoodSchedule = typeof foodSchedule === 'string' ? JSON.parse(foodSchedule) : foodSchedule;
      parsedPreciseLocation = typeof precise_location === 'string' ? JSON.parse(precise_location) : precise_location;
      parsedRooms = typeof rooms === 'string' ? JSON.parse(rooms) : rooms;
    } catch (parseError) {
      console.error('Error parsing JSON data:', parseError);
      return res.status(400).json({ 
        message: "Invalid data format. Please check your input.",
        error: parseError.message
      });
    }

    // Validate Required Fields
    if (!email || !phone_number || !hostel_name || !hostel_location || !feeStructure || !features || !hostel_type || !parsedPreciseLocation || !parsedRooms || !parsedFoodSchedule) {
      return res.status(400).json({ 
        message: "All fields are required.",
        missingFields: {
          email: !email,
          phone_number: !phone_number,
          hostel_name: !hostel_name,
          hostel_location: !hostel_location,
          feeStructure: !feeStructure,
          features: !features,
          hostel_type: !hostel_type,
          precise_location: !parsedPreciseLocation,
          rooms: !parsedRooms,
          foodSchedule: !parsedFoodSchedule
        }
      });
    }

    // Check if hostel already exists with the same email
    const existingHostelEmail = await Hostel.findOne({ email });
    if (existingHostelEmail) {
      return res.status(400).json({ message: "A hostel with this email ID already exists." });
    }

    // Check if files are uploaded
    if (!req.files || !req.files['hostelImage']) {
      return res.status(400).json({ message: "Hostel image is required." });
    }

    // Upload hostel image to Cloudinary
    const hostelImageResult = await cloudinary.uploader.upload(req.files['hostelImage'][0].path, {
      folder: 'Hostel',
      resource_type: 'image'
    });

    // Handle room images
    const roomImages = [];
    for (let i = 0; i < 4; i++) {
      const roomImageKey = `roomImage-${i}`;
      if (req.files[roomImageKey] && req.files[roomImageKey][0]) {
        const result = await cloudinary.uploader.upload(req.files[roomImageKey][0].path, {
          folder: 'Hostel/rooms',
          resource_type: 'image'
        });
        roomImages.push(result.secure_url);
      } else {
        roomImages.push('https://res.cloudinary.com/your-cloud-name/image/upload/v1/Hostel/default-room.jpg');
      }
    }

    // Create a new hostel instance
    const newHostel = new Hostel({
      userId: req.user.id,
      email,
      phone_number,
      hostel_name,
      hostel_location,
      precise_location: parsedPreciseLocation,
      foodSchedule: parsedFoodSchedule,
      feeStructure,
      features,
      hostelImage: hostelImageResult.secure_url,
      hostel_type,
      rooms: parsedRooms.map((room, index) => ({
        ...room,
        roomImage: roomImages[index]
      }))
    });

    // Save the hostel
    await newHostel.save();
    
    res.status(201).json({ 
      message: "Hostel registered successfully", 
      hostel: newHostel 
    });
  } catch (error) {
    console.error("Error registering hostel:", error);
    res.status(500).json({ 
      message: "Internal server error occurred while registering hostel", 
      error: error.message 
    });
  }
});

// Get all hostels with auth
router.get("/", auth, async (req, res) => {
    try {
        console.log('GET /api/hostels - Request received');
        console.log('Query parameters:', req.query);
        console.log('Auth header:', req.headers.authorization);
        
        const { search, type, status } = req.query;
        
        // Build the query
        let query = {};
        
        // Add type filter if provided
        if (type) {
            query.hostel_type = type;
        }
        
        // Add status filter if provided
        if (status) {
            query.status = status;
        }
        
        // Add search filter if provided
        if (search) {
            query.$or = [
                { hostel_name: { $regex: search, $options: 'i' } },
                { hostel_location: { $regex: search, $options: 'i' } }
            ];
        }
        
        console.log('MongoDB Query:', JSON.stringify(query, null, 2));
            
        const hostels = await Hostel.find(query)
            .select('_id hostel_name hostel_location hostel_type feeStructure features hostelImage email phone_number foodSchedule status rooms')
            .lean()
            .exec();
            
        console.log('Total hostels found:', hostels.length);

        // Map the hostels with default values for missing fields
        const formattedHostels = hostels.map(hostel => ({
            _id: hostel._id,
            hostel_name: hostel.hostel_name || '',
            hostel_location: hostel.hostel_location || '',
            hostel_type: hostel.hostel_type || '',
            feeStructure: hostel.feeStructure || '',
            features: hostel.features || '',
            hostelImage: hostel.hostelImage || '',
            email: hostel.email || '',
            phone_number: hostel.phone_number || '',
            foodSchedule: hostel.foodSchedule || [],
            rooms: hostel.rooms || [],
            status: hostel.status || 'pending'
        }));

        console.log('Sending response with formatted hostels:', formattedHostels.length);
        return res.status(200).json(formattedHostels);
    } catch (error) {
        console.error("Error in GET /api/hostels:", error);
        return res.status(500).json({ 
            message: "Error fetching hostels", 
            error: error.message
        });
    }
});

// Get all pending hostels (admin only)
router.get("/pending", auth, async (req, res) => {
    try {
        // Only fetch pending hostels
        const hostels = await Hostel.find({ status: 'pending' })
            .select('_id hostel_name hostel_location hostel_type feeStructure features hostelImage email phone_number foodSchedule rooms')
            .lean()
            .exec();

        const formattedHostels = hostels.map(hostel => ({
            _id: hostel._id,
            hostel_name: hostel.hostel_name || '',
            hostel_location: hostel.hostel_location || '',
            hostel_type: hostel.hostel_type || '',
            feeStructure: hostel.feeStructure || '',
            features: hostel.features || '',
            hostelImage: hostel.hostelImage || '',
            email: hostel.email || '',
            phone_number: hostel.phone_number || '',
            foodSchedule: hostel.foodSchedule || [],
            rooms: hostel.rooms || []
        }));

        return res.status(200).json(formattedHostels);
    } catch (error) {
        console.error("Error fetching pending hostels:", error);
        return res.status(500).json({ 
            message: "Error fetching pending hostels", 
            error: error.message 
        });
    }
});

// Update hostel status (admin only)
router.put("/:id/status", auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const hostel = await Hostel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!hostel) {
            return res.status(404).json({ message: "Hostel not found" });
        }

        res.json({ message: `Hostel ${status} successfully`, hostel });
    } catch (error) {
        console.error("Error updating hostel status:", error);
        res.status(500).json({ 
            message: "Error updating hostel status", 
            error: error.message 
        });
    }
});

// Update a hostel
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the hostel first
    const hostel = await Hostel.findById(id);
    
    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }
    
    // Check if the user is an admin or the owner
    if (req.user.role !== 'Admin' && hostel.userId.toString() !== req.user.id) {
      console.log('Authorization failed:');
      console.log('User ID from token:', req.user.id);
      console.log('Hostel owner ID:', hostel.userId);
      console.log('User role:', req.user.role);
      return res.status(403).json({ message: "Not authorized to update this hostel" });
    }
    
    // Update the hostel
    const updatedHostel = await Hostel.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    
    res.json({ 
      message: "Hostel updated successfully",
      hostel: updatedHostel
    });
  } catch (error) {
    console.error("Error updating hostel:", error);
    res.status(500).json({ 
      message: "Error updating hostel", 
      error: error.message 
    });
  }
});

// Get single hostel details by ID
router.get("/:id", auth, async (req, res) => {
    try {
        console.log('=== GET /api/hostels/:id - Request received ===');
        console.log('Full URL:', req.originalUrl);
        console.log('ID parameter:', req.params.id);
        console.log('Auth header:', req.headers.authorization);
        console.log('Query params:', req.query);
        console.log('Route params:', req.params);
        
        // Validate ID format
        if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            console.error('Invalid ID format:', req.params.id);
            return res.status(400).json({ 
                message: "Invalid hostel ID format",
                receivedId: req.params.id
            });
        }
        
        // Try to find the hostel
        console.log('Attempting to find hostel with ID:', req.params.id);
        const hostel = await Hostel.findById(req.params.id)
            .select('_id hostel_name hostel_location hostel_type feeStructure features image_url email phone_number foodListing status')
            .lean();

        console.log('Database query result:', hostel);

        if (!hostel) {
            console.log('No hostel found with ID:', req.params.id);
            return res.status(404).json({ 
                message: "Hostel not found",
                searchedId: req.params.id
            });
        }

        // Format the hostel data
        const formattedHostel = {
            _id: hostel._id,
            hostel_name: hostel.hostel_name || '',
            hostel_location: hostel.hostel_location || '',
            hostel_type: hostel.hostel_type || '',
            feeStructure: hostel.feeStructure || '',
            features: hostel.features || '',
            image_url: hostel.image_url || '',
            email: hostel.email || '',
            phone_number: hostel.phone_number || '',
            foodListing: hostel.foodListing || [],
            status: hostel.status || 'pending'
        };

        console.log('Successfully found and formatted hostel data');
        console.log('Sending formatted hostel:', formattedHostel);
        res.json(formattedHostel);
    } catch (error) {
        console.error("=== Error in GET /api/hostels/:id ===");
        console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        console.error("Request details:", {
            url: req.originalUrl,
            params: req.params,
            query: req.query
        });
        res.status(500).json({ 
            message: "Error fetching hostel details", 
            error: error.message,
            details: {
                url: req.originalUrl,
                id: req.params.id
            }
        });
    }
});

// Delete a hostel
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the hostel first to check ownership
    const hostel = await Hostel.findById(id);
    
    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }
    
    // Check if the user is an admin
    if (req.user.role === 'Admin') {
      await Hostel.findByIdAndDelete(id);
      return res.json({ message: "Hostel deleted successfully" });
    }
    
    // For non-admin users, check ownership
    if (hostel.userId && hostel.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this hostel" });
    }
    
    // Delete the hostel
    await Hostel.findByIdAndDelete(id);
    
    res.json({ message: "Hostel deleted successfully" });
  } catch (error) {
    console.error("Error deleting hostel:", error);
    res.status(500).json({ 
      message: "Error deleting hostel", 
      error: error.message 
    });
  }
});

// Get hostel by owner ID
router.get('/owner/:userId', auth, async (req, res) => {
    try {
        // Use the authenticated user's ID instead of params
        const userId = req.user.id;
        
        console.log('Fetching hostel for user ID:', userId);
        
        const hostel = await Hostel.findOne({ userId: userId });
        
        if (!hostel) {
            return res.status(404).json({ message: 'No hostel found for this owner' });
        }
        
        res.json(hostel);
    } catch (error) {
        console.error('Error fetching hostel by owner:', error);
        res.status(500).json({ message: 'Error fetching hostel data' });
    }
});

// Get current user's hostel
router.get('/owner/current', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('Fetching hostel for current user:', userId);
        
        const hostel = await Hostel.findOne({ userId: userId });
        
        if (!hostel) {
            return res.status(404).json({ message: 'No hostel found for current user' });
        }
        
        res.json(hostel);
    } catch (error) {
        console.error('Error fetching current user hostel:', error);
        res.status(500).json({ message: 'Error fetching hostel data' });
    }
});

export default router;
