const User = require('../models/User');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private/Manager
exports.getEmployees = async (req, res, next) => {
    try {
        const employees = await User.find({ role: 'employee' }).select('-password');
        res.status(200).json({ success: true, count: employees.length, data: employees });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private/Manager
exports.getEmployee = async (req, res, next) => {
    try {
        const employee = await User.findById(req.params.id).select('-password');

        if (!employee) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({ success: true, data: employee });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private/Manager
exports.updateEmployee = async (req, res, next) => {
    try {
        let employee = await User.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (req.body.password) {
            delete req.body.password; // Don't update password here
        }

        employee = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: employee });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private/Manager
exports.deleteEmployee = async (req, res, next) => {
    try {
        const employee = await User.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
