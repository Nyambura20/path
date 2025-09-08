import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useNotification } from './NotificationContext';

const AuthContext = createContext();

const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state
  useEffect(() => {
    const initAuth = () => {
      const user = getCurrentUser();
      const authenticated = isAuthenticated();

      if (authenticated && user) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: user,
        });
      } else {
        dispatch({
          type: AUTH_ACTIONS.SET_LOADING,
          payload: false,
        });
      }
    };

    initAuth();
  }, []);

  // Login function
    const login = useCallback(async (email, password) => {
    try {
      const response = await api.post('/api/users/login/', {
        email,
        password
      });
      
      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      
      success(`Welcome back, ${userData.first_name || userData.email}!`);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Login failed. Please try again.';
      showError(message);
      return { success: false, error: message };
    }
  }, [success, showError]);

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    
    try {
      const response = await apiService.register(userData);
      // Registration successful, but user needs to login
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          'Registration failed. Please try again.';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Update user profile
  const updateUser = async (profileData) => {
    try {
      const response = await apiService.updateProfile(profileData);
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.user,
      });
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await apiService.getProfile();
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.user,
      });
      localStorage.setItem('user', JSON.stringify(response.user));
      return response;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
