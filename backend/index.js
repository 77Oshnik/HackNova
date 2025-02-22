require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/database");

//API Routes
const analyzeAreaRoute = require("./routes/analyzeAreaRoute");
const { travelInfoController } = require('./controllers/travelInfoController');
const forecastRoutes = require('./routes/forecastRoutes');
const tweetRoutes = require('./routes/tweetRoute');
const incidentRoutes = require('./routes/incidentRoutes');
const app = express();
 
// Connect Database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(cors({
    origin: process.env.FRONTEND_URL, // Use dynamic origin
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
}));
app.use('/uploads', express.static('uploads'));

// app.use(morgan("dev"));

// Routes
app.use("/api",analyzeAreaRoute);
app.use("/api/travelInfo",travelInfoController);
app.use('/api/forecast', forecastRoutes);
app.use('/api', tweetRoutes);
app.use('/api/incidents', incidentRoutes);
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
