const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// Environmental variables
require("dotenv").config();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:4200",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Database connection
const mongodbConnect = require("./config/database");
mongodbConnect();

// API routes
const userRouter = require("./routes/user");
const projectRouter = require("./routes/project");
const taskRouter = require("./routes/task");
const dashboardRouter = require("./routes/dashboard");

app.use("/api/v1/auth", userRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/projects/:projectId/tasks", taskRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ success: true, message: "API is healthy!" });
});

// Run on the server
app.listen(PORT, () => {
    console.log(`API is running at http://localhost:${PORT}`);
});