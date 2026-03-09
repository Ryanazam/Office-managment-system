const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a notice title'],
        },
        content: {
            type: String,
            required: [true, 'Please add notice content'],
        },
        priority: {
            type: String,
            enum: ['Normal', 'High', 'Urgent'],
            default: 'Normal',
        },
        authorId: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Announcement', announcementSchema);
