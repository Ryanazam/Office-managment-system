const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        checkIn: {
            type: Date,
        },
        checkOut: {
            type: Date,
        },
        totalHours: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['Present', 'Absent', 'Half Day'],
            default: 'Present',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
