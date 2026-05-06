const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

// Create task (Admin only)
exports.createTask = async (req, res) => {
    try {
        const { title, description, dueDate, priority, assignedUserId } = req.body;
        const project = req.project;

        // Validation
        if (!title || title.trim() === "") {
            return res.status(400).json({ success: false, message: "Task title is required!" });
        }

        // Validate priority if provided
        if (priority && !["Low", "Medium", "High"].includes(priority)) {
            return res.status(400).json({ success: false, message: "Invalid priority! Use: Low, Medium, High" });
        }

        // Check if assigned user exists and is a project member
        if (!assignedUserId) {
            return res.status(400).json({ success: false, message: "Assigned user ID is required!" });
        }

        const assignedUser = await User.findById(assignedUserId);
        if (!assignedUser) {
            return res.status(404).json({ success: false, message: "Assigned user not found!" });
        }

        const isMember = project.members.some(member => member._id.toString() === assignedUserId);
        if (!isMember) {
            return res.status(400).json({ success: false, message: "Assigned user is not a project member!" });
        }

        // Create task
        const task = await Task.create({
            title: title.trim(),
            description: description || "",
            dueDate: dueDate || null,
            priority: priority || "Medium",
            status: "To Do",
            projectId: project._id,
            assignedUser: assignedUserId
        });

        // Add task to project
        project.tasks.push(task._id);
        await project.save();

        const populatedTask = await Task.findById(task._id)
            .populate("assignedUser", "name email")
            .populate("projectId", "title");

        return res.status(201).json({
            success: true,
            message: "Task created successfully!",
            data: { task: populatedTask }
        });

    } catch (error) {
        console.log(error, 'createTask endpoint');
        return res.status(500).json({ success: false, message: "Error creating task!" });
    }
};

// Assign task to project member (Admin only)
exports.assignTask = async (req, res) => {
    try {
        const { taskId, assignedUserId } = req.body;
        const project = req.project;

        // Validation
        if (!taskId || !assignedUserId) {
            return res.status(400).json({ success: false, message: "Task ID and assigned user ID are required!" });
        }

        // Find task
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found!" });
        }

        // Verify task belongs to this project
        if (task.projectId.toString() !== project._id.toString()) {
            return res.status(403).json({ success: false, message: "Task does not belong to this project!" });
        }

        // Check if new assignee exists and is a project member
        const assignedUser = await User.findById(assignedUserId);
        if (!assignedUser) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        const isMember = project.members.some(member => member._id.toString() === assignedUserId);
        if (!isMember) {
            return res.status(400).json({ success: false, message: "User is not a project member!" });
        }

        // Assign task
        task.assignedUser = assignedUserId;
        await task.save();

        const updatedTask = await Task.findById(task._id)
            .populate("assignedUser", "name email")
            .populate("projectId", "title");

        return res.status(200).json({
            success: true,
            message: "Task assigned successfully!",
            data: { task: updatedTask }
        });

    } catch (error) {
        console.log(error, 'assignTask endpoint');
        return res.status(500).json({ success: false, message: "Error assigning task!" });
    }
};

// Update task status (Admin → any task, Member → only assigned tasks)
exports.updateTaskStatus = async (req, res) => {
    try {
        const { taskId, status } = req.body;
        const project = req.project;
        const userId = req.userInfo.id;
        const role = req.role;

        // Validation
        if (!taskId || !status) {
            return res.status(400).json({ success: false, message: "Task ID and status are required!" });
        }

        if (!["To Do", "In Progress", "Done"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status! Use: To Do, In Progress, Done" });
        }

        // Find task
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found!" });
        }

        // Verify task belongs to this project
        if (task.projectId.toString() !== project._id.toString()) {
            return res.status(403).json({ success: false, message: "Task does not belong to this project!" });
        }

        // Authorization check
        if (role === "member" && task.assignedUser.toString() !== userId) {
            return res.status(403).json({ success: false, message: "You can only update status of tasks assigned to you!" });
        }

        // Update status
        task.status = status;
        await task.save();

        const updatedTask = await Task.findById(task._id)
            .populate("assignedUser", "name email")
            .populate("projectId", "title");

        return res.status(200).json({
            success: true,
            message: "Task status updated successfully!",
            data: { task: updatedTask }
        });

    } catch (error) {
        console.log(error, 'updateTaskStatus endpoint');
        return res.status(500).json({ success: false, message: "Error updating task status!" });
    }
};

// Get all tasks for a project
exports.getProjectTasks = async (req, res) => {
    try {
        const project = req.project;

        const tasks = await Task.find({ projectId: project._id })
            .populate("assignedUser", "name email")
            .populate("projectId", "title")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Tasks retrieved successfully!",
            data: { tasks }
        });

    } catch (error) {
        console.log(error, 'getProjectTasks endpoint');
        return res.status(500).json({ success: false, message: "Error retrieving tasks!" });
    }
};

// Get single task by ID
exports.getTaskById = async (req, res) => {
    try {
        const { taskId } = req.params;
        const project = req.project;

        const task = await Task.findById(taskId)
            .populate("assignedUser", "name email")
            .populate("projectId", "title");

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found!" });
        }

        // Verify task belongs to this project
        if (task.projectId._id.toString() !== project._id.toString()) {
            return res.status(403).json({ success: false, message: "Task does not belong to this project!" });
        }

        return res.status(200).json({
            success: true,
            message: "Task retrieved successfully!",
            data: { task }
        });

    } catch (error) {
        console.log(error, 'getTaskById endpoint');
        return res.status(500).json({ success: false, message: "Error retrieving task!" });
    }
};

// Delete task (Admin only)
exports.deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const project = req.project;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found!" });
        }

        // Verify task belongs to this project
        if (task.projectId.toString() !== project._id.toString()) {
            return res.status(403).json({ success: false, message: "Task does not belong to this project!" });
        }

        // Remove task from project
        project.tasks = project.tasks.filter(id => id.toString() !== taskId);
        await project.save();

        // Delete task
        await Task.findByIdAndDelete(taskId);

        return res.status(200).json({
            success: true,
            message: "Task deleted successfully!"
        });

    } catch (error) {
        console.log(error, 'deleteTask endpoint');
        return res.status(500).json({ success: false, message: "Error deleting task!" });
    }
};
