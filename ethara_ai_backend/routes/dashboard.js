const express = require("express");
const router = express.Router();

const { auth } = require("../middlewares/auth");
const {
    getDashboard,
    getProjectsSummary,
    getOverdueTasks,
    getTasksByPriority,
    getTasksByStatus,
    getProjectStats
} = require("../controllers/Dashboard");

// All dashboard routes are protected by auth
router.get("/", auth, getDashboard);
router.get("/projects", auth, getProjectsSummary);
router.get("/overdue", auth, getOverdueTasks);
router.get("/tasks/priority", auth, getTasksByPriority);
router.get("/tasks/status", auth, getTasksByStatus);
router.get("/projects/:projectId/stats", auth, getProjectStats);

module.exports = router;
