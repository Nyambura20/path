import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Navigation from './components/layout/Navigation';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <AuthProvider>
          <div className="App">
            <Navigation />
            <main className="flex-1">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </Router>
    </NotificationProvider>
  );
}

export default App;
