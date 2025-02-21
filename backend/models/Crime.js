const mongoose = require('mongoose');

const crimeSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  destination: {
    type: String
  },
  crimeType: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String
  },
  severity: {
    type: Number, // Scale 1-5 (1 = low, 5 = high)
  },
  source: {
    type: String // Source of the data (e.g., police dept, news)
  },
  reportedBy: {
    type: String
  },
  status: {
    type: String,
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Crime = mongoose.model('Crime', crimeSchema);

module.exports = Crime;