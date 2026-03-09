const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        leaveType: {
            type: String,
            enum: ['Sick Leave', 'Casual Leave', 'Paid Leave', 'Unpaid Leave'],
            required: [true, 'Please select a leave type'],
        },
        startDate: {
            type: Date,
            required: [true, 'Please select a start date'],
        },
        endDate: {
            type: Date,
            required: [true, 'Please select an end date'],
        },
        reason: {
            type: String,
            required: [true, 'Please provide a reason'],
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Leave', leaveSchema);
