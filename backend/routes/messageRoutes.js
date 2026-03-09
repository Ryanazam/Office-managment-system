const express = require('express');
const { getMessages, sendMessage, updateMessage, deleteMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .post(sendMessage);

router.route('/:userId')
    .get(getMessages);

router.route('/:id')
    .put(updateMessage)
    .delete(deleteMessage);

module.exports = router;
