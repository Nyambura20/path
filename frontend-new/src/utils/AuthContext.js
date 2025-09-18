import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (apiClient.isAuthenticated()) {
          const userData = await apiClient.getProfile();
          console.log('Fetched user data:', userData); // Debug log
          setUser(userData);
          setIsAuthenticated(true);
          // Store user data in localStorage for quick access
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiClient.login(credentials);
      console.log('Login response:', response); // Debug log
      setUser(response.user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiClient.register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      // Call the API to update the profile
      const updatedUser = await apiClient.updateProfile(profileData);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
