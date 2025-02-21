require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/database");

const app = express();
 
// Connect Database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
// app.use(morgan("dev"));

// Routes
// app.use("/api/users", require("./routes/userRoutes"));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
