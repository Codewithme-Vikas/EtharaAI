const Project = require("../models/Project");

// Middleware to check project access and attach project + role to request
exports.projectAccess = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const userId = req.userInfo.id;

        // Fetch project
        const project = await Project.findById(projectId)
            .populate("creator", "username email")
            .populate("members", "username email");

        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found!" });
        }

        // Check if user is creator or member
        const isCreator = project.creator._id.toString() === userId;
        const isMember = project.members.some(member => member._id.toString() === userId);

        if (!isCreator && !isMember) {
            return res.status(403).json({ success: false, message: "You do not have access to this project!" });
        }

        // Attach project and role to request
        req.project = project;
        req.role = isCreator ? "admin" : "member";

        next();

    } catch (error) {
        console.log(error, 'projectAccess middleware');
        return res.status(500).json({ success: false, message: "Error accessing project!" });
    }
};

// Middleware to check if user is admin (creator) of the project
exports.isProjectAdmin = (req, res, next) => {
    if (req.role !== "admin") {
        return res.status(403).json({ success: false, message: "Only project admin can perform this action!" });
    }
    next();
};
