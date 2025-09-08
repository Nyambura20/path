import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (!isAuthenticated) return [];

    const commonItems = [
      { name: 'Dashboard', href: '/dashboard', icon: 'home' },
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...commonItems,
          { name: 'Users', href: '/admin/users', icon: 'users' },
          { name: 'Students', href: '/admin/students', icon: 'academic-cap' },
          { name: 'Courses', href: '/admin/courses', icon: 'book-open' },
          { name: 'Analytics', href: '/admin/analytics', icon: 'chart-bar' },
        ];
      case 'teacher':
        return [
          ...commonItems,
          { name: 'My Courses', href: '/teacher/courses', icon: 'book-open' },
          { name: 'Students', href: '/teacher/students', icon: 'academic-cap' },
          { name: 'Performance', href: '/teacher/performance', icon: 'chart-bar' },
          { name: 'Attendance', href: '/teacher/attendance', icon: 'clipboard-check' },
        ];
      case 'student':
        return [
          ...commonItems,
          { name: 'My Courses', href: '/student/courses', icon: 'book-open' },
          { name: 'Performance', href: '/student/performance', icon: 'chart-bar' },
          { name: 'Attendance', href: '/student/attendance', icon: 'clipboard-check' },
        ];
      default:
        return commonItems;
    }
  };

  const navigationItems = getNavigationItems();

  const getIcon = (iconName) => {
    const icons = {
      home: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      ),
      users: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      ),
      'academic-cap': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      ),
      'book-open': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      ),
      'chart-bar': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      ),
      'clipboard-check': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      ),
    };
    return icons[iconName] || icons.home;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="ml-2 text-xl font-bold text-secondary-900">BRIGHTPATH</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'border-primary-500 text-secondary-900'
                      : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700'
                  }`}
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {getIcon(item.icon)}
                  </svg>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Profile dropdown */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              <div>
                <button
                  type="button"
                  className="bg-white flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-medium text-sm">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </span>
                  </div>
                </button>
              </div>

              {isProfileOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="px-4 py-2 text-xs text-secondary-500">
                    Signed in as
                  </div>
                  <div className="px-4 py-2 text-sm font-medium text-secondary-900">
                    {user?.first_name} {user?.last_name}
                  </div>
                  <div className="px-4 py-2 text-xs text-secondary-500 border-b border-secondary-100">
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-secondary-600 hover:bg-secondary-50 hover:border-secondary-300 hover:text-secondary-800'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {getIcon(item.icon)}
                  </svg>
                  {item.name}
                </div>
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-secondary-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-700 font-medium text-sm">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-secondary-800">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-sm font-medium text-secondary-500">
                  {user?.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                to="/profile"
                className="block px-4 py-2 text-base font-medium text-secondary-500 hover:text-secondary-800 hover:bg-secondary-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Your Profile
              </Link>
              <Link
                to="/settings"
                className="block px-4 py-2 text-base font-medium text-secondary-500 hover:text-secondary-800 hover:bg-secondary-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left px-4 py-2 text-base font-medium text-secondary-500 hover:text-secondary-800 hover:bg-secondary-50"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
