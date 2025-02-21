const mongoose = require('mongoose');

const weatherAlertSchema = new mongoose.Schema({
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
  alertType: {
    type: String,
    required: true,
    enum: ['Storm', 'Flood', 'Heatwave', 'Snow', 'Fog', 'Wind', 'Other']
  },
  description: {
    type: String
  },
  severity: {
    type: String,
    enum: ['Minor', 'Moderate', 'Severe', 'Extreme'],
    required: true
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  source: {
    type: String // e.g., Weather API, Meteorological Agency
  },
  issuedBy: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
weatherAlertSchema.index({ location: '2dsphere' });

const WeatherAlert = mongoose.model('WeatherAlert', weatherAlertSchema);

module.exports = WeatherAlert;
