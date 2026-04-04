import React from 'react';
import { Link } from 'react-router-dom';
import { useSidebar } from '../utils/SidebarContext';
import { useAuth } from '../utils/AuthContext';

function Footer() {
  const { isOpen } = useSidebar();
  const { isAuthenticated } = useAuth();

  return (
    <footer
      className={`mt-auto border-t border-neutral-300 bg-[var(--bp-surface)] transition-all duration-300 dark:border-[var(--bp-border)] ${
        isAuthenticated && isOpen ? 'ml-64' : 'ml-0'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-[var(--bp-text-muted)]">
            <Link to="/" className="font-medium hover:text-primary-700 dark:hover:text-primary-400">
              Home
            </Link>
            <span className="text-neutral-300 dark:text-[var(--bp-border)]">|</span>
            <Link to="/about" className="font-medium hover:text-primary-700 dark:hover:text-primary-400">
              About
            </Link>
            {!isAuthenticated && (
              <>
                <span className="text-neutral-300 dark:text-[var(--bp-border)]">|</span>
                <Link to="/courses" className="font-medium hover:text-primary-700 dark:hover:text-primary-400">
                  Courses
                </Link>
              </>
            )}
          </div>
          <p className="text-xs text-neutral-500 dark:text-[var(--bp-text-subtle)]">Copyright {new Date().getFullYear()} BrightPath. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
