const express = require("express");
const router = express.Router({ mergeParams: true });

const { auth } = require("../middlewares/auth");
const { projectAccess, isProjectAdmin } = require("../middlewares/projectAccess");
const {
    createTask,
    assignTask,
    updateTaskStatus,
    getProjectTasks,
    getTaskById,
    deleteTask
} = require("../controllers/Task");

// Get all tasks for project (members and admin)
router.get("/", auth, projectAccess, getProjectTasks);

// Get single task (members and admin)
router.get("/:taskId", auth, projectAccess, getTaskById);

// Create task (admin only)
router.post("/", auth, projectAccess, isProjectAdmin, createTask);

// Assign task (admin only)
router.post("/assign", auth, projectAccess, isProjectAdmin, assignTask);

// Update task status (admin can update any, member can update assigned)
router.patch("/status", auth, projectAccess, updateTaskStatus);

// Delete task (admin only)
router.delete("/:taskId", auth, projectAccess, isProjectAdmin, deleteTask);

module.exports = router;
