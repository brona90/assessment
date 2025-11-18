/* eslint-disable no-undef */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { userService } from './userService';

describe('UserService', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadUsers', () => {
    it('should load users from JSON file', async () => {
      const mockUsers = [
        { id: 'admin', name: 'Admin', role: 'admin', assignedQuestions: [] },
        { id: 'user1', name: 'User 1', role: 'assessor', assignedQuestions: ['q1'] }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: mockUsers })
      });

      const users = await userService.loadUsers();
      expect(users).toEqual(mockUsers);
      expect(global.fetch).toHaveBeenCalledWith('/assessment/data/users.json');
    });

    it('should return empty array on fetch error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      const users = await userService.loadUsers();
      expect(users).toEqual([]);
    });

    it('should return empty array when response is not ok', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false
      });
      const users = await userService.loadUsers();
      expect(users).toEqual([]);
    });

    it('should return empty array when users property is missing', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });
      const users = await userService.loadUsers();
      expect(users).toEqual([]);
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no user is stored', () => {
      const user = userService.getCurrentUser();
      expect(user).toBeNull();
    });

    it('should return stored user', () => {
      const mockUser = { id: 'user1', name: 'User 1' };
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      const user = userService.getCurrentUser();
      expect(user).toEqual(mockUser);
    });
  });

  describe('setCurrentUser', () => {
    it('should store user in localStorage', () => {
      const mockUser = { id: 'user1', name: 'User 1' };
      userService.setCurrentUser(mockUser);
      const stored = localStorage.getItem('currentUser');
      expect(JSON.parse(stored)).toEqual(mockUser);
    });

    it('should remove user from localStorage when null', () => {
      localStorage.setItem('currentUser', JSON.stringify({ id: 'user1' }));
      userService.setCurrentUser(null);
      const stored = localStorage.getItem('currentUser');
      expect(stored).toBeNull();
    });

    it('should remove user from localStorage when undefined', () => {
      localStorage.setItem('currentUser', JSON.stringify({ id: 'user1' }));
      userService.setCurrentUser(undefined);
      const stored = localStorage.getItem('currentUser');
      expect(stored).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin user', () => {
      const admin = { id: 'admin', role: 'admin' };
      expect(userService.isAdmin(admin)).toBe(true);
    });

    it('should return false for non-admin user', () => {
      const user = { id: 'user1', role: 'assessor' };
      expect(userService.isAdmin(user)).toBe(false);
    });

    it('should return false for null user', () => {
      expect(userService.isAdmin(null)).toBe(false);
    });

    it('should return false for undefined user', () => {
      expect(userService.isAdmin(undefined)).toBe(false);
    });
  });

  describe('canAccessQuestion', () => {
    it('should return true when no user is selected', () => {
      expect(userService.canAccessQuestion(null, 'q1')).toBe(true);
    });

    it('should return true for admin user', () => {
      const admin = { id: 'admin', role: 'admin', assignedQuestions: [] };
      expect(userService.canAccessQuestion(admin, 'q1')).toBe(true);
    });

    it('should return true when user has access to question', () => {
      const user = { id: 'user1', role: 'assessor', assignedQuestions: ['q1', 'q2'] };
      expect(userService.canAccessQuestion(user, 'q1')).toBe(true);
    });

    it('should return false when user does not have access to question', () => {
      const user = { id: 'user1', role: 'assessor', assignedQuestions: ['q1', 'q2'] };
      expect(userService.canAccessQuestion(user, 'q3')).toBe(false);
    });

    it('should return false when user has no assigned questions', () => {
      const user = { id: 'user1', role: 'assessor', assignedQuestions: [] };
      expect(userService.canAccessQuestion(user, 'q1')).toBe(false);
    });

    it('should return false when assignedQuestions is undefined', () => {
      const user = { id: 'user1', role: 'assessor' };
      expect(userService.canAccessQuestion(user, 'q1')).toBe(false);
    });
  });

  describe('getUserAssignedQuestions', () => {
    it('should return empty array when no user', () => {
      expect(userService.getUserAssignedQuestions(null)).toEqual([]);
    });

    it('should return empty array for admin user', () => {
      const admin = { id: 'admin', role: 'admin', assignedQuestions: ['q1'] };
      expect(userService.getUserAssignedQuestions(admin)).toEqual([]);
    });

    it('should return assigned questions for regular user', () => {
      const user = { id: 'user1', role: 'assessor', assignedQuestions: ['q1', 'q2'] };
      expect(userService.getUserAssignedQuestions(user)).toEqual(['q1', 'q2']);
    });

    it('should return empty array when assignedQuestions is undefined', () => {
      const user = { id: 'user1', role: 'assessor' };
      expect(userService.getUserAssignedQuestions(user)).toEqual([]);
    });
  });
});