const express = require("express");
const router = express.Router();

const { auth } = require("../middlewares/auth");
const { projectAccess, isProjectAdmin } = require("../middlewares/projectAccess");
const {
    createProject,
    getAllProjects,
    getProjectById,
    addMember,
    removeMember,
    fetchAllUsers
} = require("../controllers/Project");

// Protected routes - all require authentication
router.post("/", auth, createProject);
router.get("/", auth, getAllProjects);
router.get('/fetchAllUsers', auth, fetchAllUsers);
router.get("/:projectId", auth, projectAccess, getProjectById);

// Member management routes - require projectAccess and isProjectAdmin
router.post("/:projectId/members", auth, projectAccess, isProjectAdmin, addMember);
router.delete("/:projectId/members/:memberId", auth, projectAccess, isProjectAdmin, removeMember);

module.exports = router;
