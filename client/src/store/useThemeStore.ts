// src/store/useThemeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light', // Default theme
      
      setTheme: (theme) => {
        console.log('Setting theme to:', theme);
        set({ theme });
      },
      
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        console.log('Toggling theme from', currentTheme, 'to', newTheme);
        set({ theme: newTheme });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

export default useThemeStore;
