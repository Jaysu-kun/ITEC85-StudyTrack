import api from './api';
import { Task } from '../types';

export interface CreateTaskPayload {
  userId?: string;
  title: string;
  description?: string;
  priority: Task['priority'];
  deadline: string;
  subject: string;
  completed?: boolean;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  priority?: Task['priority'];
  deadline?: string;
  subject?: string;
  completed?: boolean;
}

export const taskService = {
  fetchTasks: async (): Promise<Task[]> => {
    // The backend uses the JWT token to identify the user securely, 
    // so we can just hit /acadtasks instead of /acadtasks/user/:userId
    const response = await api.get<Task[]>('/acadtasks');
    return response.data;
  },

  createTask: async (payload: CreateTaskPayload): Promise<Task> => {
    const response = await api.post<Task>('/acadtasks', payload);
    return response.data;
  },

  updateTask: async (id: string, payload: UpdateTaskPayload): Promise<{ message: string; id: string }> => {
    const response = await api.put<{ message: string; id: string }>(`/acadtasks/${id}`, payload);
    return response.data;
  },

  deleteTask: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/acadtasks/${id}`);
    return response.data;
  },

  toggleTaskCompletion: async (id: string): Promise<{ message: string; completed: boolean }> => {
    const response = await api.patch<{ message: string; completed: boolean }>(`/acadtasks/${id}/toggle`);
    return response.data;
  },
};

export default taskService;
