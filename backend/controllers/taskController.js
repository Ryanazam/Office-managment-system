const Task = require('../models/Task');
const Notification = require('../models/Notification');

// @desc    Create a task (Assign to employee)
// @route   POST /api/tasks
// @access  Private/Manager
exports.createTask = async (req, res, next) => {
    try {
        req.body.assignedBy = req.user.id;
        const task = await Task.create(req.body);

        // Notify the assigned employee
        if (req.body.assignedTo) {
            await Notification.create({
                userId: req.body.assignedTo,
                forRole: 'employee',
                title: 'New Task Assigned',
                message: `You have been assigned a new task: ${task.title}`
            });
        }

        res.status(201).json({ success: true, data: task });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
    try {
        let query;

        if (req.user.role === 'manager') {
            // Manager sees all tasks they created or all overall
            query = Task.find().populate('assignedTo assignedBy', 'name email');
        } else {
            // Employee sees tasks assigned to them
            query = Task.find({ assignedTo: req.user.id }).populate('assignedBy', 'name email');
        }

        const tasks = await query;

        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTaskStatus = async (req, res, next) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        // Ensure employee updating task is the one assigned to it, or user is a manager
        if (
            task.assignedTo.toString() !== req.user.id &&
            req.user.role !== 'manager'
        ) {
            return res.status(401).json({ success: false, error: 'Not authorized to update this task' });
        }

        // Usually employees only update status
        task.status = req.body.status || task.status;
        await task.save();

        // Notify managers if an employee updates the status
        if (req.user.role === 'employee') {
            await Notification.create({
                forRole: 'manager',
                title: 'Task Status Updated',
                message: `${req.user.name} updated the task "${task.title}" to ${task.status}.`
            });
        }

        res.status(200).json({ success: true, data: task });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
