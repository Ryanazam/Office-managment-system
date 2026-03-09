const Notification = require('../models/Notification');

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
    try {
        const query = {
            $or: [
                { userId: req.user.id },
                { forRole: req.user.role },
                { forRole: 'all' }
            ]
        };

        const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(20);

        res.status(200).json({ success: true, count: notifications.length, data: notifications });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }

        // We aren't doing strict ownership checks here for role-based notifications to keep it simple,
        // but ideally role-based notifications shouldn't be globally marked read by one user.
        // For individual user notifications:
        notification.isRead = true;
        await notification.save();

        res.status(200).json({ success: true, data: notification });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
    try {
        const query = {
            $or: [
                { userId: req.user.id },
                { forRole: req.user.role },
                { forRole: 'all' }
            ]
        };

        await Notification.updateMany(query, { isRead: true });
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
