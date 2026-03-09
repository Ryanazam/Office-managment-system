const Meeting = require('../models/Meeting');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Schedule a meeting
// @route   POST /api/meetings
// @access  Private/Manager
exports.createMeeting = async (req, res, next) => {
    try {
        const { title, link, employeeIds, date } = req.body;

        if (!title || !link || !employeeIds || !employeeIds.length || !date) {
            return res.status(400).json({ success: false, error: 'Please provide all details and select at least one employee' });
        }

        // Verify employees exist
        const employees = await User.find({ _id: { $in: employeeIds }, role: 'employee' });
        if (employees.length !== employeeIds.length) {
            return res.status(404).json({ success: false, error: 'One or more employees not found or invalid role' });
        }

        const meeting = await Meeting.create({
            title,
            link,
            managerId: req.user.id,
            employeeIds,
            date
        });

        // Notify the employees
        const notifications = employeeIds.map(empId => ({
            forRole: 'employee',
            userId: empId,
            title: 'New Meeting Scheduled',
            message: `You have a new meeting scheduled: ${title} on ${new Date(date).toLocaleString()}`
        }));

        await Notification.insertMany(notifications);

        res.status(201).json({ success: true, data: meeting });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all meetings for a user
// @route   GET /api/meetings
// @access  Private
exports.getMeetings = async (req, res, next) => {
    try {
        let query;

        if (req.user.role === 'manager') {
            // Manager sees meetings they scheduled
            query = Meeting.find({ managerId: req.user.id })
                .populate('employeeIds', 'name email department');
        } else {
            // Employee sees meetings scheduled for them
            query = Meeting.find({ employeeIds: req.user.id })
                .populate('managerId', 'name email department');
        }

        const meetings = await query.sort('-date');

        res.status(200).json({ success: true, count: meetings.length, data: meetings });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete a meeting
// @route   DELETE /api/meetings/:id
// @access  Private/Manager
exports.deleteMeeting = async (req, res, next) => {
    try {
        const meeting = await Meeting.findById(req.params.id);

        if (!meeting) {
            return res.status(404).json({ success: false, error: 'Meeting not found' });
        }

        // Ensure user is the manager who created it
        if (meeting.managerId.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to delete this meeting' });
        }

        await meeting.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
