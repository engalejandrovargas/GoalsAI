import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '../services/api';

export type ThemeMode = 'light';

interface ThemeColors {
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Sidebar colors
  sidebarBackground: string;
  sidebarBorder: string;
  sidebarText: string;
  sidebarTextSecondary: string;
  sidebarActive: string;
  sidebarActiveText: string;
  sidebarHover: string;
  sidebarProfileBackground: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  
  // Border colors
  border: string;
  borderSecondary: string;
  
  // Card colors
  cardBackground: string;
  cardBorder: string;
  cardShadow: string;
  
  // Button colors
  buttonPrimary: string;
  buttonPrimaryText: string;
  buttonSecondary: string;
  buttonSecondaryText: string;
  
  // Input colors
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  
  // Status colors (these stay consistent across themes)
  success: string;
  warning: string;
  error: string;
  info: string;
}

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  colors: ThemeColors;
  isLight: boolean;
}

const lightTheme: ThemeColors = {
  // Background colors
  background: 'bg-gray-50',
  backgroundSecondary: 'bg-white',
  backgroundTertiary: 'bg-gray-100',
  
  // Sidebar colors
  sidebarBackground: 'bg-white border-r border-gray-200',
  sidebarBorder: 'border-gray-200',
  sidebarText: 'text-gray-700',
  sidebarTextSecondary: 'text-gray-500',
  sidebarActive: 'bg-blue-50 text-blue-700 border border-blue-200',
  sidebarActiveText: 'text-blue-700',
  sidebarHover: 'hover:bg-gray-50 hover:text-gray-900',
  sidebarProfileBackground: 'bg-gray-100',
  
  // Text colors
  textPrimary: 'text-gray-900',
  textSecondary: 'text-gray-600',
  textTertiary: 'text-gray-500',
  
  // Border colors
  border: 'border-gray-200',
  borderSecondary: 'border-gray-300',
  
  // Card colors
  cardBackground: 'bg-white',
  cardBorder: 'border-gray-200',
  cardShadow: 'shadow-sm',
  
  // Button colors
  buttonPrimary: 'bg-blue-600 hover:bg-blue-700',
  buttonPrimaryText: 'text-white',
  buttonSecondary: 'bg-gray-100 hover:bg-gray-200',
  buttonSecondaryText: 'text-gray-700',
  
  // Input colors
  inputBackground: 'bg-white',
  inputBorder: 'border-gray-300',
  inputText: 'text-gray-900',
  inputPlaceholder: 'placeholder-gray-500',
  
  // Status colors
  success: 'text-green-600 bg-green-50 border-green-200',
  warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  error: 'text-red-600 bg-red-50 border-red-200',
  info: 'text-blue-600 bg-blue-50 border-blue-200'
};

const themeConfigs = {
  light: lightTheme
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<ThemeMode>('light');

  // Initialize theme from user preference (always light now)
  useEffect(() => {
    setThemeState('light');
  }, [user]);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-mixed');
    
    // Add light theme class
    root.classList.add('theme-light');
    
    // Set CSS custom properties for light theme
    const colors = themeConfigs.light;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });
  }, []);

  const setTheme = async (newTheme: ThemeMode) => {
    // Always light theme, no need to change
    setThemeState('light');
    
    // Update user preference in backend to light
    try {
      if (user) {
        await apiService.updateUserProfile({ theme: 'light' });
      }
    } catch (error) {
      console.error('Failed to update theme preference:', error);
    }
  };

  const colors = themeConfigs.light;

  const value: ThemeContextType = {
    theme,
    setTheme,
    colors,
    isLight: true
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};