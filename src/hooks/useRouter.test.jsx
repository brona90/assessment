import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRouter } from './useRouter';

describe('useRouter', () => {
  let originalHash;

  beforeEach(() => {
    // Save original hash
    originalHash = window.location.hash;
    // Reset hash before each test
    window.location.hash = '';
  });

  afterEach(() => {
    // Restore original hash
    window.location.hash = originalHash;
  });

  describe('Main Routes', () => {
    it('should initialize with assessment route by default', () => {
      const { result } = renderHook(() => useRouter());
      expect(result.current.currentRoute).toBe('assessment');
      expect(result.current.currentSubRoute).toBe(null);
    });

    it('should initialize with results route when hash is #results', () => {
      window.location.hash = '#results';
      const { result } = renderHook(() => useRouter());
      expect(result.current.currentRoute).toBe('results');
      expect(result.current.currentSubRoute).toBe(null);
    });

    it('should initialize with admin route when hash is #admin', () => {
      window.location.hash = '#admin';
      const { result } = renderHook(() => useRouter());
      expect(result.current.currentRoute).toBe('admin');
      expect(result.current.currentSubRoute).toBe('domains');
    });

    it('should navigate to results route', () => {
      const { result } = renderHook(() => useRouter());
      
      act(() => {
        result.current.navigate('results');
      });

      expect(result.current.currentRoute).toBe('results');
      expect(window.location.hash).toBe('#results');
    });

    it('should navigate to admin route', () => {
      const { result } = renderHook(() => useRouter());
      
      act(() => {
        result.current.navigate('admin');
      });

      expect(result.current.currentRoute).toBe('admin');
      expect(result.current.currentSubRoute).toBe('domains');
      expect(window.location.hash).toBe('#admin/domains');
    });

    it('should navigate to assessment route and clear hash', () => {
      window.location.hash = '#results';
      const { result } = renderHook(() => useRouter());
      
      act(() => {
        result.current.navigate('assessment');
      });

      expect(result.current.currentRoute).toBe('assessment');
      expect(window.location.hash).toBe('');
    });

    it('should update route when hash changes (simulating back/forward)', () => {
      const { result } = renderHook(() => useRouter());
      
      // Navigate to results
      act(() => {
        result.current.navigate('results');
      });
      expect(result.current.currentRoute).toBe('results');

      // Simulate browser back button by changing hash
      act(() => {
        window.location.hash = '';
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });

      expect(result.current.currentRoute).toBe('assessment');
    });

    it('should correctly identify current route with isRoute', () => {
      const { result } = renderHook(() => useRouter());
      
      expect(result.current.isRoute('assessment')).toBe(true);
      expect(result.current.isRoute('results')).toBe(false);
      
      act(() => {
        result.current.navigate('results');
      });
      
      expect(result.current.isRoute('assessment')).toBe(false);
      expect(result.current.isRoute('results')).toBe(true);
    });

    it('should handle multiple navigation calls', () => {
      const { result } = renderHook(() => useRouter());
      
      act(() => {
        result.current.navigate('results');
      });
      expect(result.current.currentRoute).toBe('results');
      
      act(() => {
        result.current.navigate('admin');
      });
      expect(result.current.currentRoute).toBe('admin');
      
      act(() => {
        result.current.navigate('assessment');
      });
      expect(result.current.currentRoute).toBe('assessment');
    });

    it('should handle navigation to the same route gracefully', () => {
      const { result } = renderHook(() => useRouter());
      
      // Navigate to assessment (already on assessment)
      act(() => {
        result.current.navigate('assessment');
      });

      // Should remain on assessment route
      expect(result.current.currentRoute).toBe('assessment');
      expect(window.location.hash).toBe('');
    });
  });

  describe('Admin Sub-Routes', () => {
    it('should initialize with admin/domains when hash is #admin/domains', () => {
      window.location.hash = '#admin/domains';
      const { result } = renderHook(() => useRouter());
      expect(result.current.currentRoute).toBe('admin');
      expect(result.current.currentSubRoute).toBe('domains');
    });

    it('should navigate to admin frameworks tab', () => {
      const { result } = renderHook(() => useRouter());
      
      act(() => {
        result.current.navigate('admin', 'frameworks');
      });

      expect(result.current.currentRoute).toBe('admin');
      expect(result.current.currentSubRoute).toBe('frameworks');
      expect(window.location.hash).toBe('#admin/frameworks');
    });

    it('should navigate between admin tabs', () => {
      const { result } = renderHook(() => useRouter());
      
      act(() => {
        result.current.navigate('admin', 'domains');
      });
      expect(result.current.currentSubRoute).toBe('domains');
      
      act(() => {
        result.current.navigate('admin', 'users');
      });
      expect(result.current.currentSubRoute).toBe('users');
      
      act(() => {
        result.current.navigate('admin', 'questions');
      });
      expect(result.current.currentSubRoute).toBe('questions');
    });

    it('should handle browser back/forward between admin tabs', () => {
      const { result } = renderHook(() => useRouter());
      
      // Navigate to frameworks
      act(() => {
        result.current.navigate('admin', 'frameworks');
      });
      expect(result.current.currentSubRoute).toBe('frameworks');

      // Navigate to users
      act(() => {
        result.current.navigate('admin', 'users');
      });
      expect(result.current.currentSubRoute).toBe('users');

      // Simulate browser back button
      act(() => {
        window.location.hash = '#admin/frameworks';
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
      expect(result.current.currentSubRoute).toBe('frameworks');
    });

    it('should correctly identify admin sub-routes with isRoute', () => {
      const { result } = renderHook(() => useRouter());
      
      act(() => {
        result.current.navigate('admin', 'frameworks');
      });
      
      expect(result.current.isRoute('admin')).toBe(true);
      expect(result.current.isRoute('admin', 'frameworks')).toBe(true);
      expect(result.current.isRoute('admin', 'domains')).toBe(false);
    });

    it('should handle all admin tabs', () => {
      const { result } = renderHook(() => useRouter());
      const tabs = ['domains', 'frameworks', 'users', 'questions', 'assignments', 'data-management', 'dashboard', 'compliance'];
      
      tabs.forEach(tab => {
        act(() => {
          result.current.navigate('admin', tab);
        });
        expect(result.current.currentSubRoute).toBe(tab);
        expect(window.location.hash).toBe(`#admin/${tab}`);
      });
    });

    it('should default to domains when navigating to admin without sub-route', () => {
      const { result } = renderHook(() => useRouter());
      
      act(() => {
        result.current.navigate('admin');
      });

      expect(result.current.currentRoute).toBe('admin');
      expect(result.current.currentSubRoute).toBe('domains');
      expect(window.location.hash).toBe('#admin/domains');
    });
  });
});