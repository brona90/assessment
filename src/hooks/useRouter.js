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
        sub: parts[1] || 'overview' // Default to overview if no sub-route
      };
    }

    // Check for results sub-routes (e.g., results/chart/heatmap)
    if (hash.startsWith('results/')) {
      return { main: 'results', sub: hash.slice('results/'.length) };
    }

    // Handle main routes
    if (hash === 'results') return { main: 'results', sub: null };
    if (hash === 'admin') return { main: 'admin', sub: 'overview' };
    return { main: 'assessment', sub: null };
  };

  const [route, setRoute] = useState(parseRoute());

  // Navigate to a new route
  const navigate = useCallback((mainRoute, subRoute = null) => {
    let hash;
    
    if (mainRoute === 'admin' && subRoute) {
      hash = `admin/${subRoute}`;
    } else if (mainRoute === 'admin') {
      hash = 'admin/overview';
    } else if (mainRoute === 'results' && subRoute) {
      hash = `results/${subRoute}`;
    } else if (mainRoute === 'assessment') {
      hash = '';
    } else {
      hash = mainRoute;
    }
    
    // Update the URL hash, which will trigger the hashchange event
    if (window.location.hash.slice(1) !== hash) {
      window.location.hash = hash;
    }
    
    // Normalise sub-route so state always matches the hash
    const normalizedSub = mainRoute === 'admin' ? (subRoute || 'overview') : subRoute;
    setRoute({ main: mainRoute, sub: normalizedSub });
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRoute());
    };

    window.addEventListener('hashchange', handlePopState);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('hashchange', handlePopState);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

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