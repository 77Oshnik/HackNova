const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "openstreetmap", // Use OpenStreetMap (free, no API key required)
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;