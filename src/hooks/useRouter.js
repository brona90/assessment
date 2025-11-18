import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing browser history and navigation
 * Supports back/forward buttons and page reload
 */
export const useRouter = () => {
  // Parse the current route from URL hash
  const parseRoute = () => {
    const hash = window.location.hash.slice(1); // Remove '#'
    if (hash === 'results') return 'results';
    if (hash === 'admin') return 'admin';
    return 'assessment';
  };

  const [currentRoute, setCurrentRoute] = useState(parseRoute());

  // Navigate to a new route
  const navigate = useCallback((route) => {
    const hash = route === 'assessment' ? '' : route;
    
    // Update the URL hash, which will trigger the popstate event
    if (window.location.hash.slice(1) !== hash) {
      window.location.hash = hash;
    }
    
    setCurrentRoute(route);
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const newRoute = parseRoute();
      setCurrentRoute(newRoute);
    };

    // Listen for hash changes (back/forward buttons)
    window.addEventListener('hashchange', handlePopState);
    
    // Also listen for popstate events
    window.addEventListener('popstate', handlePopState);

    // Initial route setup
    const initialRoute = parseRoute();
    if (initialRoute !== currentRoute) {
      setCurrentRoute(initialRoute);
    }

    return () => {
      window.removeEventListener('hashchange', handlePopState);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentRoute]);

  return {
    currentRoute,
    navigate,
    isRoute: (route) => currentRoute === route,
  };
};