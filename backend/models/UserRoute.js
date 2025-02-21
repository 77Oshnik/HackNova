const mongoose = require('mongoose');

const userRouteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  route: [{
    type: {
      type: String,
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  }],
  plannedDate: {
    type: Date
  },
  travelMode: {
    type: String,
    required: true
  },
  advisory: [{
    message: {
      type: String
    },
    relatedTo: {
      type: String,
    },
    severity: {
      type: Number
    },
    timestamp: {
      type: Date
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const UserRoute = mongoose.model('UserRoute', userRouteSchema);

module.exports = UserRoute;
