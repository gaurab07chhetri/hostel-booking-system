import express from "express";
import Hostel from "../Model/Hostel.js";

const router = express.Router();

// Get All Approved Hostels
router.get("/", async (req, res) => {
    try {
        const { search, type } = req.query;
        
        // Build query object - ensure status is 'approved'
        const query = { status: 'approved' };
        
        // Add search filter if provided
        if (search) {
            query.$or = [
                { hostel_name: { $regex: search, $options: 'i' } },
                { hostel_location: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Add type filter if provided
        if (type) {
            query.hostel_type = type;
        }

        console.log('Fetching hostels with query:', JSON.stringify(query, null, 2));

        // Get total count of approved hostels
        const totalCount = await Hostel.countDocuments({ status: 'approved' });
        console.log(`Total approved hostels in database: ${totalCount}`);

        // Fetch all approved hostels with all necessary fields
        const hostels = await Hostel.find(query)
            .select({
                _id: 1,
                email: 1,
                phone_number: 1,
                hostel_name: 1,
                hostel_location: 1,
                hostel_type: 1,
                foodSchedule: 1,
                rooms: 1,
                features: 1,
                hostelImage: 1,
                status: 1,
                precise_location: 1,
                updatedAt: 1
            })
            .sort({ updatedAt: -1 }); // Sort by most recently updated

        console.log(`Found ${hostels.length} approved hostels matching the query`);

        // Process the hostels to ensure image URLs are correct
        const processedHostels = hostels.map(hostel => {
            const hostelObj = hostel.toObject();
            
            // Ensure the image URL is absolute
            if (hostelObj.hostelImage && !hostelObj.hostelImage.startsWith('http')) {
                hostelObj.hostelImage = `http://localhost:5000${hostelObj.hostelImage}`;
            }

            // Set default image if none exists
            if (!hostelObj.hostelImage) {
                hostelObj.hostelImage = 'https://via.placeholder.com/400x300?text=No+Image';
            }

            return hostelObj;
        });

        // Return the response
        res.status(200).json({
            success: true,
            count: hostels.length,
            totalApproved: totalCount,
            hostels: processedHostels
        });
    } catch (error) {
        console.error('Error fetching hostels:', error);
        res.status(500).json({ 
            success: false,
            message: "Error fetching hostels", 
            error: error.message 
        });
    }
});

export default router;
