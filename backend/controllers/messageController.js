const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get conversation between logged in user and target user
// @route   GET /api/messages/:userId
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        const { userId: otherUserId } = req.params;
        const myId = req.user.id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json({ success: true, count: messages.length, data: messages });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Send a new message (Stored via REST, but Socket.io emitted in frontend)
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.id;

        const message = await Message.create({
            senderId,
            receiverId,
            content
        });

        // The socket.io emit happens on the frontend when success is returned,
        // or we can emit it from here since we attached req.io in server.js!
        const messageData = message.toJSON();
        console.log(`[Socket.io] Broadcasting to room: ${receiverId.toString()}`);
        console.log(`[Socket.io] Payload:`, messageData);
        req.io.to(receiverId.toString()).emit('receive_message', messageData);

        res.status(201).json({ success: true, data: messageData });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update a message
// @route   PUT /api/messages/:id
// @access  Private
exports.updateMessage = async (req, res) => {
    try {
        const { content } = req.body;
        let message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }

        // Make sure user owns message
        if (message.senderId.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to update this message' });
        }

        message = await Message.findByIdAndUpdate(req.params.id, {
            content,
            isEdited: true
        }, {
            new: true,
            runValidators: true
        });

        // Broadcast update to receiver so their screen updates instantly
        const messageData = message.toJSON();
        req.io.to(message.receiverId.toString()).emit('update_message', messageData);

        res.status(200).json({ success: true, data: messageData });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete a message (soft delete/tombstone)
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = async (req, res) => {
    try {
        let message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }

        // Make sure user owns message
        if (message.senderId.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to delete this message' });
        }

        // We do a soft delete so the chat history keeps the space, but wipes the text
        message = await Message.findByIdAndUpdate(req.params.id, {
            content: "This message was deleted",
            isDeleted: true
        }, {
            new: true
        });

        const messageData = message.toJSON();
        req.io.to(message.receiverId.toString()).emit('delete_message', messageData);

        res.status(200).json({ success: true, data: messageData });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
