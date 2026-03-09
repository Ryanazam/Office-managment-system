const express = require('express');
const { getAnnouncements, createAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(protect, getAnnouncements)
    .post(protect, authorize('manager'), createAnnouncement);

router.route('/:id')
    .delete(protect, authorize('manager'), deleteAnnouncement);

module.exports = router;
