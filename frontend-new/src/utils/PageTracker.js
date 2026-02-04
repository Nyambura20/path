import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecentPages } from './useRecentPages';

// Component to track page visits - place this in App.js
export const PageTracker = () => {
  const location = useLocation();
  const { addPageVisit } = useRecentPages();

  useEffect(() => {
    // Don't track login/logout pages
    const ignorePaths = ['/login', '/logout', '/register'];
    if (!ignorePaths.includes(location.pathname)) {
      addPageVisit(location.pathname);
    }
  }, [location.pathname, addPageVisit]);

  return null; // This component doesn't render anything
};

export default PageTracker;
