import { create } from 'zustand';
import { ToastItem, ToastType } from '../types';

interface ToastState {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const useToast = create<ToastState>((set) => ({
  toasts: [],

  showToast: (message, type = 'success', duration = 3500) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: ToastItem = { id, message, type, duration };

    set((state) => ({
      toasts: [...state.toasts.slice(-4), newToast], // Keep at most 5 toasts on screen
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
}));

export default useToast;