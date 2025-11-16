import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDataStore } from './useDataStore';
import { dataStore } from '../services/dataStore';

vi.mock('../services/dataStore', () => ({
  dataStore: {
    initialized: false,
    initialize: vi.fn(),
    getDomains: vi.fn(),
    addDomain: vi.fn(),
    updateDomain: vi.fn(),
    deleteDomain: vi.fn(),
    getFrameworks: vi.fn(),
    getSelectedFrameworks: vi.fn(),
    addFramework: vi.fn(),
    updateFramework: vi.fn(),
    deleteFramework: vi.fn(),
    setSelectedFrameworks: vi.fn(),
    getUsers: vi.fn(),
    addUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    getQuestions: vi.fn(),
    getQuestionsByDomain: vi.fn(),
    getQuestionsForUser: vi.fn(),
    addQuestion: vi.fn(),
    updateQuestion: vi.fn(),
    deleteQuestion: vi.fn(),
    getUserAssignments: vi.fn(),
    assignQuestionsToUser: vi.fn(),
    addQuestionAssignments: vi.fn(),
    removeQuestionAssignments: vi.fn(),
    exportData: vi.fn(),
    importData: vi.fn(),
    downloadData: vi.fn()
  }
}));

describe('useDataStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dataStore.initialized = false;
  });

  it('should initialize data store on mount', async () => {
    dataStore.initialize.mockResolvedValue();

    const { result } = renderHook(() => useDataStore());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.initialized).toBe(true);
      expect(result.current.loading).toBe(false);
    });

    expect(dataStore.initialize).toHaveBeenCalled();
  });

  it('should handle initialization error', async () => {
    dataStore.initialize.mockRejectedValue(new Error('Init failed'));

    const { result } = renderHook(() => useDataStore());

    await waitFor(() => {
      expect(result.current.error).toBe('Init failed');
      expect(result.current.loading).toBe(false);
    });
  });

  it('should skip initialization if already initialized', () => {
    dataStore.initialized = true;

    const { result } = renderHook(() => useDataStore());

    expect(result.current.initialized).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(dataStore.initialize).not.toHaveBeenCalled();
  });

  describe('domain operations', () => {
    it('should get domains', async () => {
      dataStore.initialized = true;
      dataStore.getDomains.mockReturnValue({ domain1: {} });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const domains = result.current.getDomains();
      expect(domains).toEqual({ domain1: {} });
    });

    it('should add domain successfully', async () => {
      dataStore.initialized = true;
      const newDomain = { id: 'domain1', title: 'Test' };
      dataStore.addDomain.mockReturnValue(newDomain);

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.addDomain(newDomain);
      expect(response.success).toBe(true);
      expect(response.data).toEqual(newDomain);
    });

    it('should handle add domain error', async () => {
      dataStore.initialized = true;
      dataStore.addDomain.mockImplementation(() => {
        throw new Error('Domain exists');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.addDomain({ id: 'domain1' });
      expect(response.success).toBe(false);
      expect(response.error).toBe('Domain exists');
    });

    it('should update domain', async () => {
      dataStore.initialized = true;
      const updated = { id: 'domain1', title: 'Updated' };
      dataStore.updateDomain.mockReturnValue(updated);

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.updateDomain('domain1', { title: 'Updated' });
      expect(response.success).toBe(true);
      expect(response.data).toEqual(updated);
    });

    it('should delete domain', async () => {
      dataStore.initialized = true;
      dataStore.deleteDomain.mockReturnValue(true);

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.deleteDomain('domain1');
      expect(response.success).toBe(true);
    });
  });

  describe('framework operations', () => {
    it('should get frameworks', async () => {
      dataStore.initialized = true;
      dataStore.getFrameworks.mockReturnValue([{ id: 'fw1' }]);

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const frameworks = result.current.getFrameworks();
      expect(frameworks).toHaveLength(1);
    });

    it('should get selected frameworks', async () => {
      dataStore.initialized = true;
      dataStore.getSelectedFrameworks.mockReturnValue([{ id: 'fw1' }]);

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const selected = result.current.getSelectedFrameworks();
      expect(selected).toHaveLength(1);
    });

    it('should set selected frameworks', async () => {
      dataStore.initialized = true;
      dataStore.setSelectedFrameworks.mockReturnValue(['fw1', 'fw2']);

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.setSelectedFrameworks(['fw1', 'fw2']);
      expect(response.success).toBe(true);
      expect(response.data).toEqual(['fw1', 'fw2']);
    });
  });

  describe('user operations', () => {
    it('should get users', async () => {
      dataStore.initialized = true;
      dataStore.getUsers.mockReturnValue([{ id: 'user1' }]);

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const users = result.current.getUsers();
      expect(users).toHaveLength(1);
    });

    it('should add user', async () => {
      dataStore.initialized = true;
      const newUser = { id: 'user1', name: 'Test' };
      dataStore.addUser.mockReturnValue(newUser);

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.addUser(newUser);
      expect(response.success).toBe(true);
      expect(response.data).toEqual(newUser);
    });
  });

  describe('question operations', () => {
    it('should get questions', async () => {
      dataStore.initialized = true;
      dataStore.getQuestions.mockReturnValue([{ id: 'q1' }]);

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const questions = result.current.getQuestions();
      expect(questions).toHaveLength(1);
    });

    it('should get questions by domain', async () => {
      dataStore.initialized = true;
      dataStore.getQuestionsByDomain.mockReturnValue([{ id: 'q1' }]);

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const questions = result.current.getQuestionsByDomain('domain1');
      expect(questions).toHaveLength(1);
    });

    it('should get questions for user', async () => {
      dataStore.initialized = true;
      dataStore.getQuestionsForUser.mockReturnValue([{ id: 'q1' }]);

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const questions = result.current.getQuestionsForUser('user1');
      expect(questions).toHaveLength(1);
    });
  });

  describe('assignment operations', () => {
    it('should get user assignments', async () => {
      dataStore.initialized = true;
      dataStore.getUserAssignments.mockReturnValue(['q1', 'q2']);

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const assignments = result.current.getUserAssignments('user1');
      expect(assignments).toHaveLength(2);
    });

    it('should assign questions to user', async () => {
      dataStore.initialized = true;
      dataStore.assignQuestionsToUser.mockReturnValue(['q1', 'q2']);

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.assignQuestionsToUser('user1', ['q1', 'q2']);
      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(2);
    });
  });

  describe('export/import operations', () => {
    it('should export data', async () => {
      dataStore.initialized = true;
      dataStore.exportData.mockReturnValue('{"data": "test"}');

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const exported = result.current.exportData();
      expect(exported).toBe('{"data": "test"}');
    });

    it('should import data', async () => {
      dataStore.initialized = true;
      dataStore.importData.mockReturnValue(true);

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.importData('{"data": "test"}');
      expect(response.success).toBe(true);
    });

    it('should handle import error', async () => {
      dataStore.initialized = true;
      dataStore.importData.mockImplementation(() => {
        throw new Error('Invalid data');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.importData('invalid');
      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid data');
    });

    it('should download data', async () => {
      dataStore.initialized = true;
      dataStore.downloadData.mockReturnValue();

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      result.current.downloadData('test.json');
      expect(dataStore.downloadData).toHaveBeenCalledWith('test.json');
    });
  });
});