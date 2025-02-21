const mongoose = require('mongoose');

const crimeSchema = new mongoose.Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  crimeType: {
    type: String,
    required: true,
    enum: ['Theft', 'Assault', 'Burglary', 'Vandalism', 'Fraud', 'Other']
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
    required: true
  },
  source: {
    type: String // Source of the data (e.g., police dept, news)
  },
  reportedBy: {
    type: String
  },
  status: {
    type: String,
    enum: ['Active', 'Resolved'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
crimeSchema.index({ location: '2dsphere' });

const Crime = mongoose.model('Crime', crimeSchema);

module.exports = Crime;
