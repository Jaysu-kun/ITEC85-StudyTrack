// server/src/services/task.service.js
const { ObjectId } = require('mongodb');
const { encrypt, decrypt } = require('../utils/encryption');
const ApiError = require('../utils/ApiError');

const VALID_PRIORITIES = ['low', 'medium', 'high'];
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_SUBJECT_LENGTH = 100;

/**
 * Safely transforms a raw database task into an API response object
 * Performs decryption with fallbacks
 */
function transformTask(task) {
  return {
    id: task._id.toString(),
    userId: task.userId,
    title: decrypt(task.title),
    description: decrypt(task.description || ''),
    priority: decrypt(task.priority) || 'medium',
    deadline: task.deadline,
    subject: decrypt(task.subject || ''),
    completed: Boolean(task.completed),
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  };
}

/**
 * Helper to safely parse MongoDB ObjectId
 */
function parseObjectId(idStr) {
  if (!idStr || typeof idStr !== 'string') return null;
  if (!/^[0-9a-fA-F]{24}$/.test(idStr)) return null;
  try {
    return new ObjectId(idStr);
  } catch {
    return null;
  }
}

class TaskService {
  /**
   * Retrieves all tasks belonging to the authenticated user
   */
  async getTasksByUserId(db, userId) {
    if (!db) {
      throw ApiError.serviceUnavailable('Database unavailable');
    }

    const tasks = await db.collection('AcadTasks')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    return tasks.map(transformTask);
  }

  /**
   * Retrieves a single task with strict ownership validation
   */
  async getTaskById(db, taskId, userId) {
    if (!db) {
      throw ApiError.serviceUnavailable('Database unavailable');
    }

    const id = parseObjectId(taskId);
    if (!id) {
      throw ApiError.badRequest('Invalid task ID format');
    }

    const task = await db.collection('AcadTasks').findOne({ _id: id });
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    if (task.userId !== userId) {
      throw ApiError.forbidden("Forbidden: You cannot access another user's task");
    }

    return transformTask(task);
  }

  /**
   * Creates a new academic task for the authenticated user
   */
  async createTask(db, userId, data = {}) {
    if (!db) {
      throw ApiError.serviceUnavailable('Database unavailable');
    }

    const { title, description, priority, deadline, subject, completed } = data;
    
    if (!title || typeof title !== 'string' || !title.trim()) {
      throw ApiError.badRequest('Task title is required');
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      throw ApiError.badRequest(`Title cannot exceed ${MAX_TITLE_LENGTH} characters`);
    }

    if (description && typeof description === 'string' && description.length > MAX_DESCRIPTION_LENGTH) {
      throw ApiError.badRequest(`Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`);
    }

    if (subject && typeof subject === 'string' && subject.length > MAX_SUBJECT_LENGTH) {
      throw ApiError.badRequest(`Subject cannot exceed ${MAX_SUBJECT_LENGTH} characters`);
    }
    
    const sanitizedPriority = VALID_PRIORITIES.includes(priority) ? priority : 'medium';

    let parsedDeadline = new Date();
    if (deadline) {
      const parsedTime = Date.parse(deadline);
      if (isNaN(parsedTime)) {
        throw ApiError.badRequest('Invalid deadline date format');
      }
      parsedDeadline = new Date(parsedTime);
    }
    
    const newTask = {
      userId,
      title: encrypt(trimmedTitle),
      description: encrypt(description || ''),
      priority: encrypt(sanitizedPriority),
      deadline: parsedDeadline,
      subject: encrypt(subject || ''),
      completed: Boolean(completed),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('AcadTasks').insertOne(newTask);
    
    return {
      id: result.insertedId.toString(),
      userId,
      title: trimmedTitle,
      description: description || '',
      priority: sanitizedPriority,
      deadline: newTask.deadline,
      subject: subject || '',
      completed: newTask.completed,
      createdAt: newTask.createdAt,
      updatedAt: newTask.updatedAt
    };
  }

  /**
   * Updates an existing academic task with authorization verification
   */
  async updateTask(db, taskId, userId, data = {}) {
    if (!db) {
      throw ApiError.serviceUnavailable('Database unavailable');
    }

    const id = parseObjectId(taskId);
    if (!id) {
      throw ApiError.badRequest('Invalid task ID format');
    }

    const acadTasksCollection = db.collection('AcadTasks');
    const existingTask = await acadTasksCollection.findOne({ _id: id });
    
    if (!existingTask) {
      throw ApiError.notFound('Task not found');
    }
    
    if (existingTask.userId !== userId) {
      throw ApiError.forbidden("Forbidden: You cannot modify another user's task");
    }
    
    const updateFields = { updatedAt: new Date() };
    const { title, description, priority, deadline, subject, completed } = data;
    
    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        throw ApiError.badRequest('Title cannot be empty');
      }
      const trimmedTitle = title.trim();
      if (trimmedTitle.length > MAX_TITLE_LENGTH) {
        throw ApiError.badRequest(`Title cannot exceed ${MAX_TITLE_LENGTH} characters`);
      }
      updateFields.title = encrypt(trimmedTitle);
    }
    
    if (description !== undefined) {
      if (typeof description === 'string' && description.length > MAX_DESCRIPTION_LENGTH) {
        throw ApiError.badRequest(`Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`);
      }
      updateFields.description = encrypt(description || '');
    }
    
    if (priority !== undefined) {
      if (!VALID_PRIORITIES.includes(priority)) {
        throw ApiError.badRequest('Invalid priority value. Must be low, medium, or high');
      }
      updateFields.priority = encrypt(priority);
    }
    
    if (subject !== undefined) {
      if (typeof subject === 'string' && subject.length > MAX_SUBJECT_LENGTH) {
        throw ApiError.badRequest(`Subject cannot exceed ${MAX_SUBJECT_LENGTH} characters`);
      }
      updateFields.subject = encrypt(subject || '');
    }
    
    if (deadline !== undefined) {
      const parsedTime = Date.parse(deadline);
      if (isNaN(parsedTime)) {
        throw ApiError.badRequest('Invalid deadline date format');
      }
      updateFields.deadline = new Date(parsedTime);
    }
    
    if (completed !== undefined) {
      updateFields.completed = Boolean(completed);
    }
    
    await acadTasksCollection.updateOne(
      { _id: id, userId },
      { $set: updateFields }
    );
    
    return { success: true, id: taskId };
  }

  /**
   * Deletes an academic task with authorization verification
   */
  async deleteTask(db, taskId, userId) {
    if (!db) {
      throw ApiError.serviceUnavailable('Database unavailable');
    }

    const id = parseObjectId(taskId);
    if (!id) {
      throw ApiError.badRequest('Invalid task ID format');
    }

    const acadTasksCollection = db.collection('AcadTasks');
    const taskToDelete = await acadTasksCollection.findOne({ _id: id });
    
    if (!taskToDelete) {
      throw ApiError.notFound('Task not found');
    }
    
    if (taskToDelete.userId !== userId) {
      throw ApiError.forbidden("Forbidden: You cannot delete another user's task");
    }
    
    await acadTasksCollection.deleteOne({ _id: id, userId });
    
    return { success: true, message: 'Task deleted successfully' };
  }

  /**
   * Toggles task completion status
   */
  async toggleTaskCompletion(db, taskId, userId) {
    if (!db) {
      throw ApiError.serviceUnavailable('Database unavailable');
    }

    const id = parseObjectId(taskId);
    if (!id) {
      throw ApiError.badRequest('Invalid task ID format');
    }

    const acadTasksCollection = db.collection('AcadTasks');
    const task = await acadTasksCollection.findOne({ _id: id });
    
    if (!task) {
      throw ApiError.notFound('Task not found');
    }
    
    if (task.userId !== userId) {
      throw ApiError.forbidden("Forbidden: You cannot modify another user's task");
    }
    
    const newCompletionStatus = !task.completed;
    await acadTasksCollection.updateOne(
      { _id: id, userId },
      { 
        $set: { 
          completed: newCompletionStatus,
          updatedAt: new Date()
        }
      }
    );
    
    return { completed: newCompletionStatus };
  }
}

module.exports = new TaskService();
