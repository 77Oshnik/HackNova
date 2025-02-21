const Trip = require("../models/Trip");

// Fetch all trips for a specific user
const getUserTrips = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);
    

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const trips = await Trip.find({ userId }).sort({ date: -1 });

    if (!trips.length) {
      return res.status(404).json({ message: "No trips found for this user" });
    }

    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Export using CommonJS
module.exports = { getUserTrips };
