const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a meeting title'],
            trim: true,
            maxlength: [100, 'Title cannot be more than 100 characters']
        },
        link: {
            type: String,
            required: [true, 'Please add a meeting link']
        },
        managerId: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        employeeIds: [{
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        }],
        date: {
            type: Date,
            required: [true, 'Please specify the meeting date and time']
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Meeting', meetingSchema);
