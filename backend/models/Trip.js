const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  userId: {
    type: String, // Storing Clerk user ID
    required: true,
  },
  source: {
    type: String, // Storing Clerk user ID
    required: true,
  },
  destination: {
    type: String, // Storing Clerk user ID
    required: true,
  },
  date: {
    type: Date,
    default: Date.now, // Automatically stores the current date
  },
});

const Route = mongoose.model("Route", RouteSchema);
module.exports = Route;
