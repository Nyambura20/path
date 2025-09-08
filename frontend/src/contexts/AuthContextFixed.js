import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useNotification } from './NotificationContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const { success, error: showError } = useNotification();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/api/users/profile/');
          setUser(response.data);
        } catch (err) {
          console.error('Failed to initialize auth:', err);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

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

  const register = useCallback(async (userData) => {
    try {
      // Check password confirmation
      if (userData.password !== userData.password_confirm) {
        showError('Passwords do not match');
        return { success: false, error: 'Passwords do not match' };
      }

      const response = await api.post('/api/users/register/', userData);
      
      success('Registration successful! Please log in with your new account.');
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Registration error:', err);
      const message = err.response?.data?.detail || 
                      err.response?.data?.email?.[0] ||
                      err.response?.data?.username?.[0] ||
                      'Registration failed. Please try again.';
      showError(message);
      return { success: false, error: message };
    }
  }, [success, showError]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    success('You have been logged out successfully.');
  }, [success]);

  const isAuthenticated = Boolean(token && user);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
