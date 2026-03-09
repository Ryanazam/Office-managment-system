const express = require('express');
const { createMeeting, getMeetings, deleteMeeting } = require('../controllers/meetingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Only managers can schedule, but both can get their own meetings
router.post('/', protect, authorize('manager'), createMeeting);
router.get('/', protect, getMeetings);
router.delete('/:id', protect, authorize('manager'), deleteMeeting);

module.exports = router;
