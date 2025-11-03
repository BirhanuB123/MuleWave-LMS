const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, deleteUser, getAllCourses } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes protected and admin-only
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

router.get('/courses', protect, authorize('admin'), getAllCourses);

module.exports = router;
