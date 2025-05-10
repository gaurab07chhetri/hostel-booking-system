// Submit a Complaint
app.post("/api/complaints", async (req, res) => {
    const { user_id, hostel_id, complaint_text } = req.body;
    try {
        const newComplaint = new Complaint({ user_id, hostel_id, complaint_text });
        await newComplaint.save();
        res.status(201).json({ message: "Complaint submitted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error submitting complaint", error: err.message });
    }
});

// Get Complaints by User ID
app.get("/api/complaints/:user_id", async (req, res) => {
    try {
        const complaints = await Complaint.find({ user_id: req.params.user_id });
        res.status(200).json(complaints);
    } catch (err) {
        res.status(500).json({ message: "Error fetching complaints", error: err.message });
    }
});
