import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '../services/api';

export type ThemeMode = 'light' | 'dark' | 'mixed';

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
  isDark: boolean;
  isLight: boolean;
  isMixed: boolean;
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

const darkTheme: ThemeColors = {
  // Background colors
  background: 'bg-gray-950',
  backgroundSecondary: 'bg-gray-900',
  backgroundTertiary: 'bg-gray-800',
  
  // Sidebar colors
  sidebarBackground: 'bg-gray-900 border-r border-gray-800',
  sidebarBorder: 'border-gray-800',
  sidebarText: 'text-gray-100',
  sidebarTextSecondary: 'text-gray-400',
  sidebarActive: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg',
  sidebarActiveText: 'text-white',
  sidebarHover: 'hover:bg-gray-800 hover:text-white',
  sidebarProfileBackground: 'bg-gray-800',
  
  // Text colors
  textPrimary: 'text-white',
  textSecondary: 'text-gray-300',
  textTertiary: 'text-gray-400',
  
  // Border colors
  border: 'border-gray-700',
  borderSecondary: 'border-gray-600',
  
  // Card colors
  cardBackground: 'bg-gray-800',
  cardBorder: 'border-gray-700',
  cardShadow: 'shadow-xl shadow-black/30',
  
  // Button colors
  buttonPrimary: 'bg-blue-600 hover:bg-blue-700',
  buttonPrimaryText: 'text-white',
  buttonSecondary: 'bg-gray-800 hover:bg-gray-700',
  buttonSecondaryText: 'text-gray-200',
  
  // Input colors
  inputBackground: 'bg-gray-800',
  inputBorder: 'border-gray-600',
  inputText: 'text-white',
  inputPlaceholder: 'placeholder-gray-400',
  
  // Status colors
  success: 'text-green-400 bg-green-900/50 border-green-700',
  warning: 'text-yellow-400 bg-yellow-900/50 border-yellow-700',
  error: 'text-red-400 bg-red-900/50 border-red-700',
  info: 'text-blue-400 bg-blue-900/50 border-blue-700'
};

const mixedTheme: ThemeColors = {
  // Background colors
  background: 'bg-gray-50',
  backgroundSecondary: 'bg-white',
  backgroundTertiary: 'bg-gray-100',
  
  // Sidebar colors (dark sidebar with light content)
  sidebarBackground: 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700',
  sidebarBorder: 'border-slate-700',
  sidebarText: 'text-slate-100',
  sidebarTextSecondary: 'text-slate-300',
  sidebarActive: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25',
  sidebarActiveText: 'text-white',
  sidebarHover: 'hover:bg-slate-700 hover:text-white',
  sidebarProfileBackground: 'bg-slate-800',
  
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
  light: lightTheme,
  dark: darkTheme,
  mixed: mixedTheme
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<ThemeMode>('mixed'); // Default to mixed (current design)

  // Initialize theme from user preference
  useEffect(() => {
    if (user?.theme && ['light', 'dark', 'mixed'].includes(user.theme)) {
      setThemeState(user.theme as ThemeMode);
    }
  }, [user]);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-mixed');
    
    // Add current theme class
    root.classList.add(`theme-${theme}`);
    
    // Set CSS custom properties for dynamic theming
    const colors = themeConfigs[theme];
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });
  }, [theme]);

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    
    // Update user preference in backend
    try {
      if (user) {
        await apiService.updateUserProfile({ theme: newTheme });
      }
    } catch (error) {
      console.error('Failed to update theme preference:', error);
    }
  };

  const colors = themeConfigs[theme];

  const value: ThemeContextType = {
    theme,
    setTheme,
    colors,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    isMixed: theme === 'mixed'
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