// server/src/controllers/task.controller.js
const taskService = require('../services/task.service');
const asyncHandler = require('../utils/asyncHandler');

class TaskController {
  getTasks = asyncHandler(async (req, res) => {
    const tasks = await taskService.getTasksByUserId(req.db, req.user.userId);
    res.status(200).json(tasks);
  });

  getTaskById = asyncHandler(async (req, res) => {
    const task = await taskService.getTaskById(req.db, req.params.id, req.user.userId);
    res.status(200).json(task);
  });

  createTask = asyncHandler(async (req, res) => {
    const task = await taskService.createTask(req.db, req.user.userId, req.body);
    res.status(201).json(task);
  });

  updateTask = asyncHandler(async (req, res) => {
    await taskService.updateTask(req.db, req.params.id, req.user.userId, req.body);
    res.status(200).json({ message: 'Task updated successfully', id: req.params.id });
  });

  deleteTask = asyncHandler(async (req, res) => {
    await taskService.deleteTask(req.db, req.params.id, req.user.userId);
    res.status(200).json({ message: 'Task deleted successfully' });
  });

  toggleTaskCompletion = asyncHandler(async (req, res) => {
    const result = await taskService.toggleTaskCompletion(req.db, req.params.id, req.user.userId);
    res.status(200).json({ 
      message: 'Task completion toggled successfully',
      completed: result.completed
    });
  });
}

module.exports = new TaskController();
