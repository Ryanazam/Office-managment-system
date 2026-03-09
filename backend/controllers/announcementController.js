const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
exports.getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .populate('authorId', 'name')
            .sort({ createdAt: -1 })
            .limit(10); // Keep dashboard clean with last 10 notices

        res.status(200).json({ success: true, count: announcements.length, data: announcements });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Private/Manager
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, content, priority } = req.body;

        const announcement = await Announcement.create({
            title,
            content,
            priority,
            authorId: req.user.id
        });

        // Broadcast a platform-wide notification
        await Notification.create({
            forRole: 'all',
            title: `New Dashboard Notice: ${title}`,
            message: `A new ${priority || 'Normal'} priority announcement was posted by HR.`
        });

        res.status(201).json({ success: true, data: announcement });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Manager
exports.deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ success: false, error: 'Announcement not found' });
        }

        await announcement.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
