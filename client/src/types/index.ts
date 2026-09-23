export type Priority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
  token?: string;
  avatar?: string;
  createdAt: string | Date;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: Priority;
  deadline: string | Date;
  subject: string;
  completed: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Category {
  id: string;
  userId?: string;
  name: string;
  color: string;
}

export type ThemeMode = 'light' | 'dark';

export interface AuthFormData {
  name?: string;
  email: string;
  password: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'add' | 'edit' | 'delete';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}