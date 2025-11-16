import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useUser } from './useUser';
import { userService } from '../services/userService';

vi.mock('../services/userService');

describe('useUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should load users on mount', async () => {
    const mockUsers = [
      { id: 'admin', name: 'Admin', role: 'admin' },
      { id: 'user1', name: 'User 1', role: 'assessor' }
    ];

    userService.loadUsers.mockResolvedValue(mockUsers);
    userService.getCurrentUser.mockReturnValue(null);

    const { result } = renderHook(() => useUser());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toEqual(mockUsers);
  });

  it('should load current user from storage', async () => {
    const mockUser = { id: 'user1', name: 'User 1' };
    userService.loadUsers.mockResolvedValue([]);
    userService.getCurrentUser.mockReturnValue(mockUser);

    const { result } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.currentUser).toEqual(mockUser);
  });

  it('should select user', async () => {
    const mockUser = { id: 'user1', name: 'User 1' };
    userService.loadUsers.mockResolvedValue([mockUser]);
    userService.getCurrentUser.mockReturnValue(null);
    userService.setCurrentUser.mockImplementation(() => {});

    const { result } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.selectUser(mockUser);
    });

    expect(userService.setCurrentUser).toHaveBeenCalledWith(mockUser);
    expect(result.current.currentUser).toEqual(mockUser);
  });

  it('should check if user is admin', async () => {
    userService.loadUsers.mockResolvedValue([]);
    userService.getCurrentUser.mockReturnValue({ id: 'admin', role: 'admin' });
    userService.isAdmin.mockReturnValue(true);

    const { result } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAdmin()).toBe(true);
  });

  it('should check if user can access question', async () => {
    const mockUser = { id: 'user1', assignedQuestions: ['q1'] };
    userService.loadUsers.mockResolvedValue([]);
    userService.getCurrentUser.mockReturnValue(mockUser);
    userService.canAccessQuestion.mockReturnValue(true);

    const { result } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.canAccessQuestion('q1')).toBe(true);
  });

  it('should get assigned questions', async () => {
    const mockUser = { id: 'user1', assignedQuestions: ['q1', 'q2'] };
    userService.loadUsers.mockResolvedValue([]);
    userService.getCurrentUser.mockReturnValue(mockUser);
    userService.getUserAssignedQuestions.mockReturnValue(['q1', 'q2']);

    const { result } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.getAssignedQuestions()).toEqual(['q1', 'q2']);
  });

  it('should handle empty users list', async () => {
    userService.loadUsers.mockResolvedValue([]);
    userService.getCurrentUser.mockReturnValue(null);

    const { result } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toEqual([]);
    expect(result.current.currentUser).toBeNull();
  });
});