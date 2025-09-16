import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) => `
    px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
    ${isActive(path) 
      ? 'bg-primary-600 text-white' 
      : 'text-gray-100 hover:text-primary-400 hover:bg-darkbg-700'
    }
  `;

  return (
  <nav className="bg-darkbg-800 dark:bg-darkbg-800 shadow-sm border-b border-darkbg-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold text-gray-100">BrightPath</span>
            </Link>
          </div>

          {/* Navigation links - centered */}
          <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
            <Link to="/" className={navLinkClass('/')}>
              Home
            </Link>
            <Link to="/about" className={navLinkClass('/about')}>
              About
            </Link>
            
            {isAuthenticated && (
              <Link to="/logout" className={navLinkClass('/logout')}>
                Sign Out
              </Link>
            )}
          </div>

          {/* Right side - Auth buttons for non-authenticated users */}
          {!isAuthenticated && (
            <div className="hidden md:flex items-center space-x-1">
              <Link to="/login" className={navLinkClass('/login')}>
                Login
              </Link>
              <Link to="/register" className="btn-primary ml-2">
                Sign Up
              </Link>
            </div>
          )}

          {/* User menu */}
          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-100 hover:text-primary-400 transition-colors">
                  <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {user?.first_name || user?.username}
                  </span>
                  {/* Dropdown arrow */}
                  <svg className="w-4 h-4 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown menu with profile link only */}
                <div className="absolute right-0 mt-2 w-48 bg-darkbg-800 rounded-md shadow-xl border border-darkbg-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-100 hover:bg-darkbg-700 hover:text-primary-400 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Profile</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
