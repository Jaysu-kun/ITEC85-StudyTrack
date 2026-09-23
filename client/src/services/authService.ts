import api from './api';
import { AuthFormData } from '../types';

export interface AuthResponse {
  token: string;
  id: string;
  _id?: string;
  name: string;
  email: string;
  createdAt: string;
}

export const authService = {
  signup: async (data: AuthFormData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/signup', {
      name: data.name?.trim(),
      email: data.email.trim(),
      password: data.password,
    });
    return response.data;
  },

  login: async (data: Pick<AuthFormData, 'email' | 'password'>): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', {
      email: data.email.trim(),
      password: data.password,
    });
    return response.data;
  },

  updateProfile: async (name: string): Promise<{ message: string; name: string }> => {
    const response = await api.post<{ message: string; name: string }>('/auth/update-profile', {
      name: name.trim(),
    });
    return response.data;
  },
};

export default authService;
