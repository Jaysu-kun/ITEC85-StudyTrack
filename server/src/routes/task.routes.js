// server/src/routes/task.routes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { authenticateToken } = require('../middleware/auth');
const ApiError = require('../utils/ApiError');

// Public route to verify task service health
router.get('/test', (req, res) => {
  res.json({ message: 'AcadTasks route is working!' });
});

// Protect all remaining academic task routes with JWT authentication
router.use(authenticateToken);

// Get all academic tasks for authenticated user
router.get('/', taskController.getTasks);

// Get tasks by user ID (Strict authorization check for backward compatibility)
router.get('/user/:userId', (req, res, next) => {
  if (req.params.userId !== req.user.userId) {
    return next(ApiError.forbidden("Forbidden: You cannot access another user's tasks"));
  }
  taskController.getTasks(req, res, next);
});

// Get a single academic task by ID
router.get('/:id', taskController.getTaskById);

// Create a new academic task
router.post('/', taskController.createTask);

// Update an academic task
router.put('/:id', taskController.updateTask);

// Delete an academic task
router.delete('/:id', taskController.deleteTask);

// Toggle task completion
router.patch('/:id/toggle', taskController.toggleTaskCompletion);

module.exports = router;
