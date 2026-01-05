const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createModule,
  getCourseModules,
  getModule,
  updateModule,
  deleteModule,
  addModuleItem,
  updateModuleItem,
  deleteModuleItem,
  reorderModules
} = require('../controllers/moduleController');

// Module routes
router.post('/course/:courseId', protect, authorize('instructor', 'admin'), createModule);
router.get('/course/:courseId', protect, getCourseModules);
router.put('/course/:courseId/reorder', protect, authorize('instructor', 'admin'), reorderModules);
router.get('/:id', protect, getModule);
router.put('/:id', protect, authorize('instructor', 'admin'), updateModule);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteModule);

// Module item routes
router.post('/:id/items', protect, authorize('instructor', 'admin'), addModuleItem);
router.put('/:moduleId/items/:itemId', protect, authorize('instructor', 'admin'), updateModuleItem);
router.delete('/:moduleId/items/:itemId', protect, authorize('instructor', 'admin'), deleteModuleItem);

module.exports = router;
