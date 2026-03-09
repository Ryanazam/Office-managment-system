const Leave = require('../models/Leave');

// @desc    Apply for a leave
// @route   POST /api/leaves
// @access  Private/Employee
exports.applyLeave = async (req, res, next) => {
    try {
        req.body.userId = req.user.id;
        req.body.status = 'Pending'; // Override any status sent by user

        const leave = await Leave.create(req.body);

        res.status(201).json({ success: true, data: leave });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all leaves (Manager sees all, Employee sees own)
// @route   GET /api/leaves
// @access  Private
exports.getLeaves = async (req, res, next) => {
    try {
        let query;

        if (req.user.role === 'manager') {
            query = Leave.find().populate('userId', 'name email department');
        } else {
            query = Leave.find({ userId: req.user.id }).populate('userId', 'name email department');
        }

        const leaves = await query;

        res.status(200).json({ success: true, count: leaves.length, data: leaves });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update leave status
// @route   PUT /api/leaves/:id
// @access  Private/Manager
exports.updateLeaveStatus = async (req, res, next) => {
    try {
        let leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ success: false, error: 'Leave not found' });
        }

        // Manager can only update the status
        leave.status = req.body.status || leave.status;
        await leave.save();

        res.status(200).json({ success: true, data: leave });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
