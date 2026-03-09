const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const Leave = require('../models/Leave');

// @desc    Check In
// @route   POST /api/attendance/check-in
// @access  Private/Employee
exports.checkIn = async (req, res, next) => {
    try {
        const today = new Date();
        const dayOfWeek = today.getDay();

        // Check for weekends (0 = Sunday, 6 = Saturday)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
            return res.status(400).json({ success: false, error: `Cannot check in on weekends (${dayName}).` });
        }

        today.setHours(0, 0, 0, 0);

        // Check if user is on leave today
        const activeLeave = await Leave.findOne({
            userId: req.user.id,
            status: 'Approved',
            startDate: { $lte: new Date() },
            endDate: { $gte: today }
        });

        if (activeLeave) {
            return res.status(400).json({ success: false, error: 'Cannot check in while on leave.' });
        }

        // Check if user already checked in today
        let attendance = await Attendance.findOne({
            userId: req.user.id,
            date: { $gte: today },
        });

        if (attendance) {
            if (attendance.checkIn) {
                return res.status(400).json({ success: false, error: 'Already checked in today' });
            }
        }

        attendance = await Attendance.create({
            userId: req.user.id,
            date: Date.now(),
            checkIn: Date.now(),
            status: 'Present',
        });

        // Notify managers
        await Notification.create({
            forRole: 'manager',
            title: 'Employee Check-In',
            message: `${req.user.name} has checked in.`
        });

        res.status(201).json({ success: true, data: attendance });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Check Out
// @route   PUT /api/attendance/check-out
// @access  Private/Employee
exports.checkOut = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({
            userId: req.user.id,
            date: { $gte: today },
        });

        if (!attendance) {
            return res.status(404).json({ success: false, error: 'No check-in record found for today' });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ success: false, error: 'Already checked out today' });
        }

        attendance.checkOut = Date.now();

        // Calculate total hours
        const diff = attendance.checkOut.getTime() - attendance.checkIn.getTime();
        const hours = diff / (1000 * 60 * 60);
        attendance.totalHours = hours.toFixed(2);

        await attendance.save();

        // Notify managers
        await Notification.create({
            forRole: 'manager',
            title: 'Employee Check-Out',
            message: `${req.user.name} has checked out. Total hours: ${attendance.totalHours}`
        });

        res.status(200).json({ success: true, data: attendance });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get attendance for a user or all users (if manager)
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res, next) => {
    try {
        let query;

        if (req.user.role === 'manager') {
            // Manager sees all attendance
            query = Attendance.find().populate('userId', 'name email department');
        } else {
            // Employee sees only their own attendance
            query = Attendance.find({ userId: req.user.id }).populate('userId', 'name email department');
        }

        const attendanceRecords = await query;

        res.status(200).json({ success: true, count: attendanceRecords.length, data: attendanceRecords });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
