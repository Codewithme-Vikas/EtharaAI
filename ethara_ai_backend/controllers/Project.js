const Project = require("../models/Project");
const User = require("../models/User");

// Create a new project (authenticated user becomes creator)
exports.createProject = async (req, res) => {
    try {
        const { title, description, members } = req.body;
        const userId = req.userInfo.id;

        // Validation
        if (!title || title.trim() === "") {
            return res.status(400).json({ success: false, message: "Project title is required!" });
        }

        // Initialize members array with creator
        let projectMembers = [userId];

        // If members are provided, validate and add them
        if (members && Array.isArray(members) && members.length > 0) {
            // Check if members is an array
            if (!Array.isArray(members)) {
                return res.status(400).json({ success: false, message: "Members must be an array!" });
            }

            // Validate each member ID exists in database
            const validMembers = await User.find({ _id: { $in: members } });

            if (validMembers.length !== members.length) {
                return res.status(404).json({
                    success: false,
                    message: "One or more member IDs do not exist!"
                });
            }

            // Add members to the array (avoid duplicates if creator is included)
            members.forEach(memberId => {
                if (!projectMembers.includes(memberId)) {
                    projectMembers.push(memberId);
                }
            });
        }

        // Create project with creator and members
        const project = await Project.create({
            title: title.trim(),
            description: description || "",
            creator: userId,
            members: projectMembers
        });

        // Populate creator and members
        const populatedProject = await Project.findById(project._id)
            .populate("creator", "name email")
            .populate("members", "name email");

        return res.status(201).json({
            success: true,
            message: "Project created successfully!",
            data: { project: populatedProject }
        });

    } catch (error) {
        console.log(error, 'createProject endpoint');
        return res.status(500).json({ success: false, message: "Error creating project!" });
    }
};

// Get all projects for logged-in user (created or member)
exports.getAllProjects = async (req, res) => {
    try {
        const userId = req.userInfo.id;

        // Find projects where user is creator OR a member
        const projects = await Project.find({
            $or: [
                { creator: userId },
                { members: userId }
            ]
        })
            .populate("creator", "name email")
            .populate("members", "name email")
            .populate("tasks")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Projects retrieved successfully!",
            data: { projects }
        });

    } catch (error) {
        console.log(error, 'getAllProjects endpoint');
        return res.status(500).json({ success: false, message: "Error retrieving projects!" });
    }
};

// Get single project by ID (middleware handles access control)
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.project._id)
            .populate("creator", "name email")
            .populate("members", "name email")
            .populate("tasks");

        return res.status(200).json({
            success: true,
            message: "Project retrieved successfully!",
            data: { project }
        });

    } catch (error) {
        console.log(error, 'getProjectById endpoint');
        return res.status(500).json({ success: false, message: "Error retrieving project!" });
    }
};

// Add member to project (middleware ensures user is admin)
exports.addMember = async (req, res) => {
    try {
        const { email } = req.body;
        const project = req.project;

        // Validation
        if (!email || email.trim() === "") {
            return res.status(400).json({ success: false, message: "Member email is required!" });
        }

        // Find user by email
        const newMember = await User.findOne({ email: email.trim() });

        if (!newMember) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        // Check if already a member
        if (project.members.some(member => member._id.toString() === newMember._id.toString())) {
            return res.status(400).json({ success: false, message: "User is already a member!" });
        }

        // Add member
        project.members.push(newMember._id);
        await project.save();

        const updatedProject = await Project.findById(project._id)
            .populate("creator", "name email")
            .populate("members", "name email");

        return res.status(200).json({
            success: true,
            message: "Member added successfully!",
            data: { project: updatedProject }
        });

    } catch (error) {
        console.log(error, 'addMember endpoint');
        return res.status(500).json({ success: false, message: "Error adding member!" });
    }
};

// Remove member from project (middleware ensures user is admin)
exports.removeMember = async (req, res) => {
    try {
        const { memberId } = req.params;
        const project = req.project;

        // Check if member exists in project
        if (!project.members.some(member => member._id.toString() === memberId)) {
            return res.status(400).json({ success: false, message: "User is not a member of this project!" });
        }

        // Prevent removing creator
        if (project.creator._id.toString() === memberId) {
            return res.status(400).json({ success: false, message: "Cannot remove project creator!" });
        }

        // Remove member
        project.members = project.members.filter(id => id.toString() !== memberId);
        await project.save();

        const updatedProject = await Project.findById(project._id)
            .populate("creator", "name email")
            .populate("members", "name email");

        return res.status(200).json({
            success: true,
            message: "Member removed successfully!",
            data: { project: updatedProject }
        });

    } catch (error) {
        console.log(error, 'removeMember endpoint');
        return res.status(500).json({ success: false, message: "Error removing member!" });
    }
};


// **************** Fetch all users ***********************
exports.fetchAllUsers = async (req, res) => {

    try {
        const usersDoc = await User.find();

        return res.status(200)
            .json({
                success: true,
                message: "fetch all user successfully",
                data: { users: usersDoc }
            })

    } catch (error) {
        console.log(error, 'failed to fetch all user')
        return res.status(500).json({ success: false, message: "Error During fetch all user." })
    }
}