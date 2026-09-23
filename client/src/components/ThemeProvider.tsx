// src/components/ThemeProvider.tsx
import React, { useEffect } from 'react';
import useThemeStore from '../store/useThemeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme } = useThemeStore();
  
  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Log theme change for debugging
    console.log('Theme changed to:', theme);
  }, [theme]);
  
  return <>{children}</>;
};
export default ThemeProvider;