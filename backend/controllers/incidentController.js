const Incident = require("../models/IncidentNews");
const geocoder = require("../utils/geocoder");

// Create a new incident
exports.createIncident = async (req, res) => {
    try {
      const { userId, description, latitude, longitude } = req.body;
      const images = req.files ? req.files.map((file) => file.path) : [];
  
      console.log("Request Body:", req.body); // Log the request body
      console.log("Uploaded Files:", req.files); // Log the uploaded files
  
      // Validate required fields
      if (!userId || !description || !latitude || !longitude) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      // Reverse geocode coordinates to get place name
      let placeName = "Unknown Location";
      try {
        const geoResponse = await geocoder.reverse({ lat: latitude, lon: longitude });
        placeName = geoResponse[0]?.formattedAddress || "Unknown Location";
      } catch (geocodingError) {
        console.error("Geocoding error:", geocodingError);
      }
  
      console.log("Place Name:", placeName); // Log the place name
  
      const newIncident = new Incident({
        userId,
        description,
        location: { latitude, longitude, placeName }, // Include placeName
        images,
      });
  
      await newIncident.save();
      res.status(201).json({ message: "Incident reported successfully", newIncident });
    } catch (error) {
      console.error("Error reporting incident:", error); // Log the full error
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

// Delete an incident
exports.deleteIncident = async (req, res) => {
    try {
      const { userId } = req.body; // User ID from the request body
      const { incidentId } = req.params; // Incident ID from the URL
  
      // Find the incident
      const incident = await Incident.findById(incidentId);
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
  
      // Check if the user is the owner of the incident
      if (incident.userId !== userId) {
        return res.status(403).json({ error: "You are not authorized to delete this incident" });
      }
  
      // Delete the incident
      await Incident.findByIdAndDelete(incidentId);
      res.status(200).json({ message: "Incident deleted successfully" });
    } catch (error) {
      console.error("Error deleting incident:", error);
      res.status(500).json({ error: "Error deleting incident" });
    }
  };

  // Edit an incident
exports.editIncident = async (req, res) => {
    try {
      const { userId, description } = req.body; // User ID and new description from the request body
      const { incidentId } = req.params; // Incident ID from the URL
  
      // Find the incident
      const incident = await Incident.findById(incidentId);
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
  
      // Check if the user is the owner of the incident
      if (incident.userId !== userId) {
        return res.status(403).json({ error: "You are not authorized to edit this incident" });
      }
  
      // Update the description
      incident.description = description;
      await incident.save();
  
      res.status(200).json({ message: "Incident updated successfully", incident });
    } catch (error) {
      console.error("Error updating incident:", error);
      res.status(500).json({ error: "Error updating incident" });
    }
  };

  // Edit a comment
// Edit a comment
exports.editComment = async (req, res) => {
    try {
      const { userId, newComment } = req.body;
      const { incidentId, commentId } = req.params;
  
      const incident = await Incident.findById(incidentId);
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
  
      const comment = incident.comments.id(commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
  
      // Check if the user is the owner of the comment
      if (comment.userId !== userId) {
        return res.status(403).json({ error: "You are not authorized to edit this comment" });
      }
  
      // Update the comment
      comment.comment = newComment;
      await incident.save();
  
      res.status(200).json({ message: "Comment updated successfully", incident });
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(500).json({ error: "Error updating comment" });
    }
  };
  
  // Delete a comment
  exports.deleteComment = async (req, res) => {
  try {
    const { userId } = req.query; // Get userId from query parameters
    const { incidentId, commentId } = req.params;

    const incident = await Incident.findById(incidentId);
    if (!incident) {
      return res.status(404).json({ error: "Incident not found" });
    }

    const comment = incident.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check if the user is the owner of the comment
    if (comment.userId !== userId) {
      return res.status(403).json({ error: "You are not authorized to delete this comment" });
    }

    // Remove the comment
    incident.comments.pull(commentId);
    await incident.save();

    res.status(200).json({ message: "Comment deleted successfully", incident });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Error deleting comment" });
  }
};