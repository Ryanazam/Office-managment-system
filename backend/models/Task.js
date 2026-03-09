const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a task title'],
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
        },
        assignedTo: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        assignedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        deadline: {
            type: Date,
            required: [true, 'Please add a deadline'],
        },
        status: {
            type: String,
            enum: ['To Do', 'In Progress', 'Completed'],
            default: 'To Do',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Task', taskSchema);
