const Incident = require("../models/IncidentNews");

// Create a new incident
exports.createIncident = async (req, res) => {
  try {
    const { userId, description, latitude, longitude } = req.body;
    const images = req.files ? req.files.map(file => file.path) : []; // If using multer for local storage

    const newIncident = new Incident({
      userId,
      description,
      location: { latitude, longitude },
      images,
    });

    await newIncident.save();
    res.status(201).json({ message: "Incident reported successfully", newIncident });
  } catch (error) {
    res.status(500).json({ error: "Error reporting incident" });
  }
};

// Get incidents near a user's location
exports.getNearbyIncidents = async (req, res) => {
    try {
      const latitude = parseFloat(req.query.latitude);
      const longitude = parseFloat(req.query.longitude);
      const radius = parseFloat(req.query.radius);
      
      // Validate the parsed values
      if (isNaN(latitude) || isNaN(longitude) || isNaN(radius)) {
        return res.status(400).json({ error: "Invalid parameters. Latitude, longitude, and radius must be numbers." });
      }
      
      const nearbyIncidents = await Incident.find({
        "location.latitude": { $gte: latitude - radius, $lte: latitude + radius },
        "location.longitude": { $gte: longitude - radius, $lte: longitude + radius },
      });
  
      res.status(200).json(nearbyIncidents);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      res.status(500).json({ error: "Error fetching incidents" });
    }
  };

// Upvote or downvote an incident

exports.voteIncident = async (req, res) => {
    try {
        const { userId, voteType } = req.body;
        const { incidentId } = req.params;  // Extract incidentId from params properly

        if (!["upvote", "downvote"].includes(voteType)) {
            return res.status(400).json({ error: "Invalid vote type" });
        }

        const incident = await Incident.findById(incidentId);
        if (!incident) {
            return res.status(404).json({ error: "Incident not found" });
        }

        // Rest of your function remains the same...
        // Check if the user has already voted
        const existingVoteIndex = incident.votes.findIndex(vote => vote.userId === userId);

        if (existingVoteIndex !== -1) {
            // User has already voted, update their vote if changed
            if (incident.votes[existingVoteIndex].voteType !== voteType) {
                // Update vote type
                incident.votes[existingVoteIndex].voteType = voteType;
            } else {
                return res.status(200).json({ message: "Vote already recorded", incident });
            }
        } else {
            // New vote, add it to the array
            incident.votes.push({ userId, voteType });
        }

        // Recalculate upvote/downvote counts
        incident.upvoteCount = incident.votes.filter(vote => vote.voteType === "upvote").length;
        incident.downvoteCount = incident.votes.filter(vote => vote.voteType === "downvote").length;

        await incident.save();

        res.status(200).json({ message: "Vote updated", incident });
    } catch (error) {
        console.error("Error updating vote:", error);
        res.status(500).json({ error: "Error updating vote" });
    }
};

// Comment on an incident
exports.commentOnIncident = async (req, res) => {
  try {
    const { userId, comment } = req.body;
    const { incidentId } = req.params;

    const incident = await Incident.findById(incidentId);
    if (!incident) return res.status(404).json({ error: "Incident not found" });

    incident.comments.push({ userId, comment, timestamp: new Date() });
    await incident.save();

    res.status(200).json({ message: "Comment added", incident });
  } catch (error) {
    res.status(500).json({ error: "Error adding comment" });
  }
};
