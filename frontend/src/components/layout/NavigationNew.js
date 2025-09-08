import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => {
    const baseClass = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
    if (isActive(path)) {
      return `${baseClass} bg-primary-700 text-white`;
    }
    return `${baseClass} text-primary-100 hover:bg-primary-700 hover:text-white`;
  };

  if (!isAuthenticated) {
    return (
      <nav className="bg-primary-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-white">BrightPath</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className={navLinkClass('/login')}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-white text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-primary-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-white">BrightPath</h1>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link
                  to="/dashboard"
                  className={navLinkClass('/dashboard')}
                >
                  Dashboard
                </Link>
                <Link
                  to="/courses"
                  className={navLinkClass('/courses')}
                >
                  Courses
                </Link>
                <Link
                  to="/progress"
                  className={navLinkClass('/progress')}
                >
                  Progress
                </Link>
                <Link
                  to="/profile"
                  className={navLinkClass('/profile')}
                >
                  Profile
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <span className="text-primary-100 text-sm">
                Welcome, {user?.first_name || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-primary-700 hover:bg-primary-800 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
