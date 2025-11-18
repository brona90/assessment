import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing browser history and navigation
 * Supports back/forward buttons and page reload
 * Handles both main routes (assessment, results) and admin sub-routes
 */
export const useRouter = () => {
  // Parse the current route from URL hash
  const parseRoute = () => {
    const hash = window.location.hash.slice(1); // Remove '#'
    
    // Check for admin sub-routes (e.g., admin/domains, admin/frameworks)
    if (hash.startsWith('admin/')) {
      const parts = hash.split('/');
      return {
        main: 'admin',
        sub: parts[1] || 'domains' // Default to domains if no sub-route
      };
    }
    
    // Handle main routes
    if (hash === 'results') return { main: 'results', sub: null };
    if (hash === 'admin') return { main: 'admin', sub: 'domains' };
    return { main: 'assessment', sub: null };
  };

  const [route, setRoute] = useState(parseRoute());

  // Navigate to a new route
  const navigate = useCallback((mainRoute, subRoute = null) => {
    let hash;
    
    if (mainRoute === 'admin' && subRoute) {
      hash = `admin/${subRoute}`;
    } else if (mainRoute === 'admin') {
      hash = 'admin/domains';
    } else if (mainRoute === 'assessment') {
      hash = '';
    } else {
      hash = mainRoute;
    }
    
    // Update the URL hash, which will trigger the hashchange event
    if (window.location.hash.slice(1) !== hash) {
      window.location.hash = hash;
    }
    
    setRoute({ main: mainRoute, sub: subRoute });
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const newRoute = parseRoute();
      setRoute(newRoute);
    };

    // Listen for hash changes (back/forward buttons)
    window.addEventListener('hashchange', handlePopState);
    
    // Also listen for popstate events
    window.addEventListener('popstate', handlePopState);

    // Initial route setup
    const initialRoute = parseRoute();
    if (initialRoute.main !== route.main || initialRoute.sub !== route.sub) {
      setRoute(initialRoute);
    }

    return () => {
      window.removeEventListener('hashchange', handlePopState);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [route]);

  return {
    currentRoute: route.main,
    currentSubRoute: route.sub,
    navigate,
    isRoute: (mainRoute, subRoute = null) => {
      if (subRoute) {
        return route.main === mainRoute && route.sub === subRoute;
      }
      return route.main === mainRoute;
    },
  };
};