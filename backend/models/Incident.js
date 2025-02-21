const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  location: {
    type: {
      type: String,
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  incidentType: {
    type: String,
    required: true,
  },
  description: {
    type: String
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    default: 'Ongoing'
  },
  severity: {
    type: Number, // Scale 1-5 (1 = low, 5 = high)
    required: true
  },
  source: {
    type: String // e.g., news, emergency services
  },
  reportedBy: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
incidentSchema.index({ location: '2dsphere' });

const Incident = mongoose.model('Incident', incidentSchema);

module.exports = Incident;
