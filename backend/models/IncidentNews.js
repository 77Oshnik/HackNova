const mongoose = require("mongoose");

const IncidentNewsSchema = new mongoose.Schema({
  userId: {
    type: String, // Clerk user ID
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    placeName: { type: String, default: "Unknown Location" },
  },
  votes: [
    {
      userId: String,
      voteType: { type: String, enum: ["upvote", "downvote"] },
    },
  ],
  upvoteCount: { type: Number, default: 0 },  // Store upvote count
    downvoteCount: { type: Number, default: 0 }, // Store downvote count
  comments: [
    {
      userId: String,
      comment: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  images: [String], // Stores image URLs
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const IncidentNews = mongoose.model("IncidentNews", IncidentNewsSchema);
module.exports = IncidentNews;
