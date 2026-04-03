import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useTheme } from '../utils/ThemeContext';
import Dropdown from './ui/Dropdown';

function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive(path)
        ? 'bg-primary-600 text-white'
        : 'text-neutral-700 hover:bg-primary-50 hover:text-primary-700'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-300 bg-[var(--bp-surface)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-base font-bold text-white">
            B
          </div>
          <span className="text-lg font-semibold text-[var(--bp-text)]">BrightPath</span>
        </Link>

        {!isAuthenticated && (
          <div className="hidden items-center gap-2 md:flex">
            <Link to="/" className={navLinkClass('/')}>
              Home
            </Link>
            <Link to="/about" className={navLinkClass('/about')}>
              About
            </Link>
          </div>
        )}

        {!isAuthenticated ? (
          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:border-primary-300 hover:text-primary-700"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.95 6.95-1.41-1.41M7.46 7.46 6.05 6.05m12.9 0-1.41 1.41M7.46 16.54l-1.41 1.41M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.8A9 9 0 1111.2 3a7 7 0 109.8 9.8z" />
                </svg>
              )}
              <span className="hidden sm:inline">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            </button>
            <Link to="/login" className="btn-secondary">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Sign Up
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-300 bg-neutral-50 text-neutral-700 transition hover:border-primary-300 hover:text-primary-700"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.95 6.95-1.41-1.41M7.46 7.46 6.05 6.05m12.9 0-1.41 1.41M7.46 16.54l-1.41 1.41M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.8A9 9 0 1111.2 3a7 7 0 109.8 9.8z" />
                </svg>
              )}
            </button>
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-[var(--bp-text)]">{user?.first_name || user?.username}</p>
              <p className="text-xs capitalize text-neutral-500">{user?.role}</p>
            </div>
            <Dropdown
              trigger={
                <span className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
                    {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </span>
                </span>
              }
              items={[
                { label: 'Profile', onClick: () => (window.location.href = '/profile') },
                { label: 'Sign Out', onClick: () => (window.location.href = '/logout') },
              ]}
            />
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
