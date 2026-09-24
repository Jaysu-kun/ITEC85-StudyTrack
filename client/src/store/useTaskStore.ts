import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Category, Priority } from '../types';
import taskService from '../services/taskService';

const DEFAULT_CATEGORIES: Category[] = [];

interface TaskState {
  tasks: Task[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getTasksByCategory: (categoryId: string) => Task[];
  getTasksByPriority: (priority: Priority) => Task[];
  getUpcomingTasks: (days: number) => Task[];
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const LEGACY_DEFAULT_IDS = new Set(['cat-general', 'cat-major', 'cat-gened', 'cat-lab', 'cat-exams']);

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      categories: DEFAULT_CATEGORIES,
      isLoading: false,
      error: null,

      fetchTasks: async () => {
        set({ isLoading: true, error: null });
        try {
          const tasks = await taskService.fetchTasks();
          set({ tasks, isLoading: false });
        } catch (err) {
          console.warn('Could not fetch tasks from server, using local/cached state:', err);
          set({ isLoading: false, error: 'Could not sync tasks with server.' });
        }
      },

      addTask: async (taskData) => {
        const tempId = generateId();
        const deadlineIso = new Date(taskData.deadline).toISOString();
        const localTask: Task = {
          ...taskData,
          id: tempId,
          deadline: deadlineIso,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        try {
          const serverTask = await taskService.createTask({
            userId: taskData.userId,
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority,
            deadline: deadlineIso,
            subject: taskData.subject,
            completed: taskData.completed,
          });

          const finalizedTask: Task = {
            ...localTask,
            ...serverTask,
            id: serverTask.id || (serverTask as unknown as { _id?: string })._id || tempId,
          };

          set((state) => ({
            tasks: [...state.tasks.filter((t) => t.id !== tempId), finalizedTask],
          }));

          return finalizedTask;
        } catch (err) {
          console.warn('Database insert failed, saving locally:', err);
          set((state) => ({
            tasks: [...state.tasks, localTask],
          }));
          return localTask;
        }
      },

      updateTask: async (id, taskData) => {
        const previousTasks = get().tasks;
        const updatedIso = new Date().toISOString();

        // Optimistic update
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  ...taskData,
                  deadline: taskData.deadline ? new Date(taskData.deadline).toISOString() : task.deadline,
                  updatedAt: updatedIso,
                }
              : task
          ),
        }));

        try {
          await taskService.updateTask(id, {
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority,
            deadline: taskData.deadline ? new Date(taskData.deadline).toISOString() : undefined,
            subject: taskData.subject,
            completed: taskData.completed,
          });
        } catch (err) {
          console.warn('Failed to update task on backend, keeping local state:', err);
          // Only rollback if needed, or keep local changes
          set({ tasks: previousTasks });
          throw err;
        }
      },

      deleteTask: async (id) => {
        const previousTasks = get().tasks;

        // Optimistic deletion
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));

        try {
          await taskService.deleteTask(id);
        } catch (err) {
          console.warn('Failed to delete task on server, keeping local state change:', err);
          // Rollback on failure if critical
          set({ tasks: previousTasks });
          throw err;
        }
      },

      toggleTaskCompletion: async (id) => {
        const currentTask = get().tasks.find((t) => t.id === id);
        if (!currentTask) return;

        const newStatus = !currentTask.completed;
        const previousTasks = get().tasks;

        // Optimistic update
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, completed: newStatus, updatedAt: new Date().toISOString() }
              : task
          ),
        }));

        try {
          await taskService.toggleTaskCompletion(id);
        } catch (err) {
          console.warn('Server toggle failed, keeping local state:', err);
          // If server fails, revert
          set({ tasks: previousTasks });
        }
      },

      addCategory: (categoryData) => {
        const newCategory: Category = {
          id: generateId(),
          ...categoryData,
        };

        set((state) => ({
          categories: [...state.categories, newCategory],
        }));

        return newCategory;
      },

      updateCategory: (id, data) => {
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id ? { ...category, ...data } : category
          ),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
        }));
      },

      getTasksByCategory: (categoryId) => {
        return get().tasks.filter((task) => task.subject === categoryId);
      },

      getTasksByPriority: (priority) => {
        return get().tasks.filter((task) => task.priority === priority);
      },

      getUpcomingTasks: (days) => {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);

        return get().tasks.filter(
          (task) => !task.completed && new Date(task.deadline) <= futureDate
        );
      },
    }),
    {
      name: 'task-storage',
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<TaskState> | undefined;
        return {
          ...currentState,
          ...persisted,
          categories: Array.isArray(persisted?.categories)
            ? persisted.categories.filter((cat) => !LEGACY_DEFAULT_IDS.has(cat.id))
            : [],
        };
      },
    }
  )
);

export default useTaskStore;
