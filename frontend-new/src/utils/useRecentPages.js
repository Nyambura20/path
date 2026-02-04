import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'brightpath_recent_pages';
const MAX_RECENT_PAGES = 10;

// Page metadata mapping
const PAGE_METADATA = {
  '/dashboard': { title: 'Dashboard', icon: 'home', description: 'Main dashboard' },
  '/courses': { title: 'Courses', icon: 'book', description: 'Browse courses' },
  '/attendance': { title: 'Attendance', icon: 'clipboard', description: 'Attendance records' },
  '/performance': { title: 'Performance', icon: 'chart', description: 'Performance analytics' },
  '/notifications': { title: 'Notifications', icon: 'bell', description: 'View notifications' },
  '/profile': { title: 'Profile', icon: 'user', description: 'Your profile' },
  '/students': { title: 'Students', icon: 'users', description: 'Student management' },
  '/teachers': { title: 'Teachers', icon: 'users', description: 'Teacher directory' },
  '/teacher/attendance/mark': { title: 'Mark Attendance', icon: 'clipboard', description: 'Mark student attendance' },
  '/teacher/attendance/reports': { title: 'Attendance Reports', icon: 'chart', description: 'View attendance reports' },
  '/teacher/performance/record': { title: 'Record Performance', icon: 'edit', description: 'Record student grades' },
  '/teacher/performance/reports': { title: 'Performance Reports', icon: 'chart', description: 'View performance reports' },
};

// Format time ago
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

export const useRecentPages = () => {
  const [recentPages, setRecentPages] = useState([]);

  // Load recent pages from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const pages = JSON.parse(stored);
        setRecentPages(pages);
      }
    } catch (error) {
      console.error('Error loading recent pages:', error);
    }
  }, []);

  // Add a page visit
  const addPageVisit = useCallback((path, customTitle = null) => {
    const metadata = PAGE_METADATA[path] || { 
      title: customTitle || path.split('/').pop() || 'Page', 
      icon: 'page', 
      description: `Visited ${path}` 
    };

    const newEntry = {
      path,
      title: customTitle || metadata.title,
      description: metadata.description,
      icon: metadata.icon,
      timestamp: new Date().toISOString(),
    };

    setRecentPages((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((p) => p.path !== path);
      // Add new entry at the beginning
      const updated = [newEntry, ...filtered].slice(0, MAX_RECENT_PAGES);
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving recent pages:', error);
      }
      return updated;
    });
  }, []);

  // Get formatted recent pages for display
  const getFormattedPages = useCallback(() => {
    return recentPages.map((page) => ({
      ...page,
      timeAgo: formatTimeAgo(page.timestamp),
    }));
  }, [recentPages]);

  // Clear recent pages
  const clearRecentPages = useCallback(() => {
    setRecentPages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing recent pages:', error);
    }
  }, []);

  return {
    recentPages: getFormattedPages(),
    addPageVisit,
    clearRecentPages,
  };
};

export default useRecentPages;
