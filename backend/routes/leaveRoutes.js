const express = require('express');
const {
    applyLeave,
    getLeaves,
    updateLeaveStatus,
} = require('../controllers/leaveController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .post(applyLeave)
    .get(getLeaves);

router.route('/:id')
    .put(authorize('manager'), updateLeaveStatus);

module.exports = router;
