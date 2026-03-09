const express = require('express');
const { register, login, getMe } = require('../controllers/authController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', protect, authorize('manager'), register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
