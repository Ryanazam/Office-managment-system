const express = require('express');
const {
    getEmployees,
    getEmployee,
    updateEmployee,
    deleteEmployee,
} = require('../controllers/employeeController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All routes require authentication

// Company directory is visible to all authenticated users
router.route('/').get(getEmployees);

// Modifying or viewing specific employee data is restricted to managers
router.route('/:id')
    .get(getEmployee)
    .put(authorize('manager'), updateEmployee)
    .delete(authorize('manager'), deleteEmployee);

module.exports = router;
