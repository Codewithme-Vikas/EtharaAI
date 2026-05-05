const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

// Get dashboard statistics for logged-in user
exports.getDashboard = async (req, res) => {
    try {
        const userId = req.userInfo.id;

        // Find all projects where user is creator or member
        const userProjects = await Project.find({
            $or: [
                { creator: userId },
                { members: userId }
            ]
        }).select("_id");

        const projectIds = userProjects.map(p => p._id);

        if (projectIds.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Dashboard retrieved successfully!",
                data: {
                    totalTasks: 0,
                    totalProjects: 0,
                    tasksByStatus: {
                        "To Do": 0,
                        "In Progress": 0,
                        "Done": 0
                    },
                    tasksByPriority: {
                        "Low": 0,
                        "Medium": 0,
                        "High": 0
                    },
                    overdueTasks: 0
                }
            });
        }

        // Aggregation pipeline for comprehensive task statistics
        const taskStats = await Task.aggregate([
            {
                $match: { projectId: { $in: projectIds } }
            },
            {
                $facet: {
                    totalCount: [
                        { $count: "count" }
                    ],
                    statusBreakdown: [
                        {
                            $group: {
                                _id: "$status",
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $sort: { _id: 1 }
                        }
                    ],
                    priorityBreakdown: [
                        {
                            $group: {
                                _id: "$priority",
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $sort: { _id: 1 }
                        }
                    ],
                    overdueCount: [
                        {
                            $match: {
                                dueDate: { $lt: new Date() },
                                status: { $ne: "Done" }
                            }
                        },
                        { $count: "count" }
                    ]
                }
            }
        ]);

        // Format response
        const stats = taskStats[0];

        const totalTasks = stats.totalCount[0]?.count || 0;

        const tasksByStatus = {
            "To Do": 0,
            "In Progress": 0,
            "Done": 0
        };
        stats.statusBreakdown.forEach(item => {
            tasksByStatus[item._id] = item.count;
        });

        const tasksByPriority = {
            "Low": 0,
            "Medium": 0,
            "High": 0
        };
        stats.priorityBreakdown.forEach(item => {
            tasksByPriority[item._id] = item.count;
        });

        const overdueTasks = stats.overdueCount[0]?.count || 0;

        return res.status(200).json({
            success: true,
            message: "Dashboard retrieved successfully!",
            data: {
                totalTasks,
                totalProjects: projectIds.length,
                tasksByStatus,
                tasksByPriority,
                overdueTasks
            }
        });

    } catch (error) {
        console.log(error, 'getDashboard endpoint');
        return res.status(500).json({ success: false, message: "Error retrieving dashboard!" });
    }
};

// Get user's projects summary
exports.getProjectsSummary = async (req, res) => {
    try {
        const userId = req.userInfo.id;

        // Aggregation for projects with task counts
        const projectsSummary = await Project.aggregate([
            {
                $match: {
                    $or: [
                        { creator: userId },
                        { members: userId }
                    ]
                }
            },
            {
                $lookup: {
                    from: "tasks",
                    localField: "_id",
                    foreignField: "projectId",
                    as: "projectTasks"
                }
            },
            {
                $addFields: {
                    totalTasks: { $size: "$projectTasks" },
                    completedTasks: {
                        $size: {
                            $filter: {
                                input: "$projectTasks",
                                as: "task",
                                cond: { $eq: ["$$task.status", "Done"] }
                            }
                        }
                    },
                    inProgressTasks: {
                        $size: {
                            $filter: {
                                input: "$projectTasks",
                                as: "task",
                                cond: { $eq: ["$$task.status", "In Progress"] }
                            }
                        }
                    },
                    memberCount: { $size: "$members" }
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    creator: 1,
                    totalTasks: 1,
                    completedTasks: 1,
                    inProgressTasks: 1,
                    memberCount: 1,
                    createdAt: 1
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);

        return res.status(200).json({
            success: true,
            message: "Projects summary retrieved successfully!",
            data: { projects: projectsSummary }
        });

    } catch (error) {
        console.log(error, 'getProjectsSummary endpoint');
        return res.status(500).json({ success: false, message: "Error retrieving projects summary!" });
    }
};

// Get overdue tasks with details
exports.getOverdueTasks = async (req, res) => {
    try {
        const userId = req.userInfo.id;

        // Find user's projects
        const userProjects = await Project.find({
            $or: [
                { creator: userId },
                { members: userId }
            ]
        }).select("_id");

        const projectIds = userProjects.map(p => p._id);

        // Get overdue tasks with project and assignee details
        const overdueTasks = await Task.find({
            projectId: { $in: projectIds },
            dueDate: { $lt: new Date() },
            status: { $ne: "Done" }
        })
            .populate("assignedUser", "name email")
            .populate("projectId", "title")
            .sort({ dueDate: 1 });

        return res.status(200).json({
            success: true,
            message: "Overdue tasks retrieved successfully!",
            data: {
                count: overdueTasks.length,
                tasks: overdueTasks
            }
        });

    } catch (error) {
        console.log(error, 'getOverdueTasks endpoint');
        return res.status(500).json({ success: false, message: "Error retrieving overdue tasks!" });
    }
};

// Get tasks by priority across all projects
exports.getTasksByPriority = async (req, res) => {
    try {
        const userId = req.userInfo.id;

        // Find user's projects
        const userProjects = await Project.find({
            $or: [
                { creator: userId },
                { members: userId }
            ]
        }).select("_id");

        const projectIds = userProjects.map(p => p._id);

        // Aggregation for tasks by priority with status breakdown
        const tasksByPriority = await Task.aggregate([
            {
                $match: { projectId: { $in: projectIds } }
            },
            {
                $group: {
                    _id: "$priority",
                    total: { $sum: 1 },
                    byStatus: {
                        $push: {
                            status: "$status",
                            count: 1
                        }
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]);

        // Format the response with status breakdown
        const formattedData = tasksByPriority.map(priority => ({
            priority: priority._id,
            total: priority.total,
            statuses: {
                "To Do": priority.byStatus.filter(s => s.status === "To Do").length || 0,
                "In Progress": priority.byStatus.filter(s => s.status === "In Progress").length || 0,
                "Done": priority.byStatus.filter(s => s.status === "Done").length || 0
            }
        }));

        return res.status(200).json({
            success: true,
            message: "Tasks by priority retrieved successfully!",
            data: { tasksByPriority: formattedData }
        });

    } catch (error) {
        console.log(error, 'getTasksByPriority endpoint');
        return res.status(500).json({ success: false, message: "Error retrieving tasks by priority!" });
    }
};

// Get tasks by status across all projects
exports.getTasksByStatus = async (req, res) => {
    try {
        const userId = req.userInfo.id;

        // Find user's projects
        const userProjects = await Project.find({
            $or: [
                { creator: userId },
                { members: userId }
            ]
        }).select("_id");

        const projectIds = userProjects.map(p => p._id);

        // Aggregation for tasks by status
        const tasksByStatus = await Task.aggregate([
            {
                $match: { projectId: { $in: projectIds } }
            },
            {
                $group: {
                    _id: "$status",
                    total: { $sum: 1 }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]);

        // Format with all statuses included
        const formattedData = {
            "To Do": 0,
            "In Progress": 0,
            "Done": 0
        };

        tasksByStatus.forEach(item => {
            formattedData[item._id] = item.total;
        });

        return res.status(200).json({
            success: true,
            message: "Tasks by status retrieved successfully!",
            data: { tasksByStatus: formattedData }
        });

    } catch (error) {
        console.log(error, 'getTasksByStatus endpoint');
        return res.status(500).json({ success: false, message: "Error retrieving tasks by status!" });
    }
};

// Get statistics for a specific project
exports.getProjectStats = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.userInfo.id;

        // Verify user has access to project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found!" });
        }

        const isCreator = project.creator.toString() === userId;
        const isMember = project.members.some(member => member._id.toString() === userId);

        if (!isCreator && !isMember) {
            return res.status(403).json({ success: false, message: "Access denied!" });
        }

        // Get project statistics
        const stats = await Task.aggregate([
            {
                $match: { projectId: projectId }
            },
            {
                $facet: {
                    totalCount: [{ $count: "count" }],
                    statusBreakdown: [
                        {
                            $group: {
                                _id: "$status",
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    priorityBreakdown: [
                        {
                            $group: {
                                _id: "$priority",
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    assigneeStats: [
                        {
                            $group: {
                                _id: "$assignedUser",
                                taskCount: { $sum: 1 },
                                completedCount: {
                                    $sum: {
                                        $cond: [{ $eq: ["$status", "Done"] }, 1, 0]
                                    }
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "_id",
                                foreignField: "_id",
                                as: "userInfo"
                            }
                        },
                        {
                            $unwind: "$userInfo"
                        },
                        {
                            $project: {
                                _id: 0,
                                userId: "$_id",
                                name: "$userInfo.name",
                                email: "$userInfo.email",
                                taskCount: 1,
                                completedCount: 1
                            }
                        }
                    ]
                }
            }
        ]);

        const projectStats = stats[0];

        return res.status(200).json({
            success: true,
            message: "Project statistics retrieved successfully!",
            data: {
                totalTasks: projectStats.totalCount[0]?.count || 0,
                statusBreakdown: projectStats.statusBreakdown,
                priorityBreakdown: projectStats.priorityBreakdown,
                assigneeStats: projectStats.assigneeStats
            }
        });

    } catch (error) {
        console.log(error, 'getProjectStats endpoint');
        return res.status(500).json({ success: false, message: "Error retrieving project statistics!" });
    }
};
