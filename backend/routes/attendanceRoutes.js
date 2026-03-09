const express = require('express');
const {
    checkIn,
    checkOut,
    getAttendance,
} = require('../controllers/attendanceController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/check-in', checkIn);
router.put('/check-out', checkOut);
router.get('/', getAttendance);

module.exports = router;
