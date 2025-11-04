const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { protect, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All routes here require admin
router.use(protect);
router.use(authorize('admin'));

// GET /api/admin/courses  - list all courses
router.get('/courses', adminController.getAllCourses);

// GET /api/admin/users - list all users
router.get('/users', adminController.getAllUsers);

// GET /api/admin/users/:id - get single user
router.get('/users/:id', adminController.getUser);

// GET /api/admin/stats - get dashboard stats
router.get('/stats', adminController.getStats);

// PUT /api/admin/courses/:id/publish - publish/approve course
router.put('/courses/:id/publish', adminController.publishCourse);

// DELETE /api/admin/users/:id - delete user and related data
router.delete('/users/:id', adminController.deleteUser);

// PUT /api/admin/users/:id/status - update user status
router.put('/users/:id/status', adminController.updateUserStatus);

// DELETE /api/admin/courses/:id - delete course and related data
router.delete('/courses/:id', adminController.deleteCourse);
=======
const { getUsers, updateUserRole, deleteUser, getAllCourses } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes protected and admin-only
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

router.get('/courses', protect, authorize('admin'), getAllCourses);
>>>>>>> origin/feature/LMS2

module.exports = router;
