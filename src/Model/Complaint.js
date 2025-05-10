const Complaint = mongoose.model("Complaint", new mongoose.Schema({
    user_id: String,
    hostel_id: String,
    complaint_text: String,
    status: { type: String, default: "Pending" },
}));