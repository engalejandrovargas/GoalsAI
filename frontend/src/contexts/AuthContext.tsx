import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AuthState, AuthContextType, User } from '../types/auth';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,
};

// Actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on mount
  const checkAuth = async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await apiService.getCurrentUser();
      
      if (response.success && response.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: 'Not authenticated' });
      }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: 'Authentication check failed' });
    }
  };

  // Login function
  const login = (redirectTo?: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const redirectParam = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : '';
    
    // Redirect to Google OAuth
    window.location.href = `${baseUrl}/auth/google${redirectParam}`;
  };

  // Logout function
  const logout = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await apiService.logout();
      
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
      
      // Redirect to login page
      window.location.href = '/';
    } catch (error) {
      toast.error('Logout failed');
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};