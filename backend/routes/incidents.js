const express = require("express");
const multer = require("multer"); // For file uploads
const { createIncident, getNearbyIncidents, voteIncident, commentOnIncident } = require("../controllers/incidentController");

const router = express.Router();

// Set up file storage (for local storage; remove if using Cloudinary/S3)
const upload = multer({ dest: "uploads/" });

// Routes
router.post("/report", upload.array("images"), createIncident); // Report incident with images
router.get("/nearby", getNearbyIncidents); // Fetch incidents near user
router.post("/:incidentId/vote", voteIncident); // Upvote/downvote incident
router.post("/:incidentId/comment", commentOnIncident); // Comment on an incident

module.exports = router;
