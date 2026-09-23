import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token?: string) => void;
  signup: (userData: { id?: string; name: string; email: string }, token?: string) => void;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
  getToken: () => string | null;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user: User, token?: string) => {
        const authToken = token || user.token || null;
        set({
          user: { ...user, token: authToken || undefined },
          token: authToken,
          isAuthenticated: true,
        });
      },

      signup: (userData: { id?: string; name: string; email: string }, token?: string) => {
        const authToken = token || null;
        const newUser: User = {
          id: userData.id || generateId(),
          name: userData.name,
          email: userData.email,
          token: authToken || undefined,
          createdAt: new Date().toISOString(),
        };
        set({
          user: newUser,
          token: authToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateProfile: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      getToken: () => {
        const state = get();
        return state.token || state.user?.token || null;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const getAuthToken = () => {
  return useAuthStore.getState().getToken();
};

export default useAuthStore;