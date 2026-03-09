const express = require('express');
const {
    createTask,
    getTasks,
    updateTaskStatus,
} = require('../controllers/taskController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .post(authorize('manager'), createTask)
    .get(getTasks);

router.route('/:id')
    .put(updateTaskStatus);

module.exports = router;
