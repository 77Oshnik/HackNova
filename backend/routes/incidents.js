const express = require("express");
const { createIncident, getNearbyIncidents, voteIncident, commentOnIncident, deleteIncident, editIncident, editComment, deleteComment } = require("../controllers/incidentController");
const upload = require("../middleware/multer");
const router = express.Router();

// Routes
router.post("/report", upload.array("images", 5), createIncident); // Report incident with images
router.get("/nearby", getNearbyIncidents); // Fetch incidents near user
router.post("/:incidentId/vote", voteIncident); // Upvote/downvote incident
router.post("/:incidentId/comment", commentOnIncident); // Comment on an incident
router.delete("/:incidentId", deleteIncident); // Delete an incident
router.put("/:incidentId", editIncident); // Edit an incident
router.put("/:incidentId/comments/:commentId", editComment); // Edit a comment
router.delete("/:incidentId/comments/:commentId", deleteComment); // Delete a comment

module.exports = router;