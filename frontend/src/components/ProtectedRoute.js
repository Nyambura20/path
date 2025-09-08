import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null, redirectTo = '/login' }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access if required role is specified
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const dashboardMap = {
      'admin': '/admin/dashboard',
      'teacher': '/teacher/dashboard',
      'student': '/student/dashboard',
    };
    
    const userDashboard = dashboardMap[user.role] || '/dashboard';
    return <Navigate to={userDashboard} replace />;
  }

  return children;
};

export default ProtectedRoute;
