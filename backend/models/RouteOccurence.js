const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Sub-schema for Crimes
const CrimeSchema = new Schema({
    crimeType: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    severity: { type: Number, required: true, min: 1, max: 5 },
    source: { type: String, required: true },
    status: { type: String, required: true }
});

// Sub-schema for Incidents
const IncidentSchema = new Schema({
    incidentType: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, required: true },
    severity: { type: Number, required: true, min: 1, max: 5 },
    source: { type: String, required: true },
    reportedBy: { type: String, required: true }
});

// Sub-schema for Weather Alerts
const WeatherAlertSchema = new Schema({
    alertType: { type: String, required: true },
    description: { type: String, required: true },
    severity: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    source: { type: String, required: true },
    issuedBy: { type: String, required: true }
});

// Main Schema for Route Occurrence
const RouteOccurrenceSchema = new Schema({
    source: { type: String, required: true },
    destination: { type: String, required: true },
    date: { type: Date, required: true }, // Date of the occurrence
    occurrences: {
        crimes: [CrimeSchema],        // Array of Crime objects
        incidents: [IncidentSchema],  // Array of Incident objects
        weather: [WeatherAlertSchema] // Array of Weather Alert objects
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

const RouteOccurrence = mongoose.model('RouteOccurrence', RouteOccurrenceSchema);
module.exports = RouteOccurrence
