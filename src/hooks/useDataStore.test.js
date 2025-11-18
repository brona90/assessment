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
    downloadData: vi.fn(),
      setAnswers: vi.fn(),
      setEvidence: vi.fn(),
      updateEvidence: vi.fn(),
      clearEvidence: vi.fn(),
      clearAllData: vi.fn(),
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
      dataStore.downloadData.mockReturnValue(true);

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const exported = await result.current.exportData();
      expect(exported).toEqual({ success: true });
      expect(dataStore.downloadData).toHaveBeenCalled();
    });

    it('should import data', async () => {
      dataStore.initialized = true;
      dataStore.importData.mockReturnValue(true);

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.importData('{"data": "test"}');
      expect(response.success).toBe(true);
    });

    it('should handle import error', async () => {
      dataStore.initialized = true;
      dataStore.importData.mockImplementation(() => {
        throw new Error('Invalid data');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.importData('invalid');
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

  describe('Question Assignments', () => {
    it('should add question assignments successfully', async () => {
      dataStore.initialized = true;
      dataStore.addQuestionAssignments.mockReturnValue({ userId: 'user1', questionIds: ['q1', 'q2'] });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.addQuestionAssignments('user1', ['q1', 'q2']);
      expect(response.success).toBe(true);
      expect(response.data).toEqual({ userId: 'user1', questionIds: ['q1', 'q2'] });
    });

    it('should handle add question assignments error', async () => {
      dataStore.initialized = true;
      dataStore.addQuestionAssignments.mockImplementation(() => {
        throw new Error('Assignment failed');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.addQuestionAssignments('user1', ['q1']);
      expect(response.success).toBe(false);
      expect(response.error).toBe('Assignment failed');
    });

    it('should remove question assignments successfully', async () => {
      dataStore.initialized = true;
      dataStore.removeQuestionAssignments.mockReturnValue({ userId: 'user1', questionIds: [] });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.removeQuestionAssignments('user1', ['q1']);
      expect(response.success).toBe(true);
      expect(response.data).toEqual({ userId: 'user1', questionIds: [] });
    });

    it('should handle remove question assignments error', async () => {
      dataStore.initialized = true;
      dataStore.removeQuestionAssignments.mockImplementation(() => {
        throw new Error('Removal failed');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.removeQuestionAssignments('user1', ['q1']);
      expect(response.success).toBe(false);
      expect(response.error).toBe('Removal failed');
    });
  });

  describe('Question Management', () => {
    it('should delete question successfully', async () => {
      dataStore.initialized = true;
      dataStore.deleteQuestion.mockReturnValue(true);

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.deleteQuestion('q1');
      expect(response.success).toBe(true);
      expect(dataStore.deleteQuestion).toHaveBeenCalledWith('q1');
    });

    it('should handle delete question error', async () => {
      dataStore.initialized = true;
      dataStore.deleteQuestion.mockImplementation(() => {
        throw new Error('Delete failed');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.deleteQuestion('q1');
      expect(response.success).toBe(false);
      expect(response.error).toBe('Delete failed');
    });

    it('should update question successfully', async () => {
      dataStore.initialized = true;
      dataStore.updateQuestion.mockReturnValue({ id: 'q1', text: 'Updated Question' });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.updateQuestion('q1', { text: 'Updated Question' });
      expect(response.success).toBe(true);
      expect(response.data.text).toBe('Updated Question');
    });

    it('should handle update question error', async () => {
      dataStore.initialized = true;
      dataStore.updateQuestion.mockImplementation(() => {
        throw new Error('Update failed');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.updateQuestion('q1', { text: 'Updated' });
      expect(response.success).toBe(false);
      expect(response.error).toBe('Update failed');
    });

    it('should add question successfully', async () => {
      dataStore.initialized = true;
      dataStore.addQuestion.mockReturnValue({ id: 'q2', text: 'New Question' });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.addQuestion({ id: 'q2', text: 'New Question' });
      expect(response.success).toBe(true);
      expect(response.data.id).toBe('q2');
    });

    it('should handle add question error', async () => {
      dataStore.initialized = true;
      dataStore.addQuestion.mockImplementation(() => {
        throw new Error('Add failed');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.addQuestion({ id: 'q2', text: 'New Question' });
      expect(response.success).toBe(false);
      expect(response.error).toBe('Add failed');
    });
  });

  describe('User Management', () => {
    it('should add user successfully', async () => {
      dataStore.initialized = true;
      dataStore.addUser.mockReturnValue({ id: 'user2', name: 'New User' });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.addUser({ id: 'user2', name: 'New User' });
      expect(response.success).toBe(true);
      expect(response.data.name).toBe('New User');
    });

    it('should handle add user error', async () => {
      dataStore.initialized = true;
      dataStore.addUser.mockImplementation(() => {
        throw new Error('User add failed');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.addUser({ id: 'user2', name: 'New User' });
      expect(response.success).toBe(false);
      expect(response.error).toBe('User add failed');
    });

    it('should delete user successfully', async () => {
      dataStore.initialized = true;
      dataStore.deleteUser.mockReturnValue(true);

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.deleteUser('user1');
      expect(response.success).toBe(true);
    });

    it('should handle delete user error', async () => {
      dataStore.initialized = true;
      dataStore.deleteUser.mockImplementation(() => {
        throw new Error('User delete failed');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.deleteUser('user1');
      expect(response.success).toBe(false);
      expect(response.error).toBe('User delete failed');
    });

    it('should update user successfully', async () => {
      dataStore.initialized = true;
      dataStore.updateUser.mockReturnValue({ id: 'user1', name: 'Updated User' });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.updateUser('user1', { name: 'Updated User' });
      expect(response.success).toBe(true);
      expect(response.data.name).toBe('Updated User');
    });

    it('should handle update user error', async () => {
      dataStore.initialized = true;
      dataStore.updateUser.mockImplementation(() => {
        throw new Error('User update failed');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.updateUser('user1', { name: 'Updated' });
      expect(response.success).toBe(false);
      expect(response.error).toBe('User update failed');
    });
  });

  describe('Framework Management', () => {
    it('should delete framework successfully', async () => {
      dataStore.initialized = true;
      dataStore.deleteFramework.mockReturnValue(true);

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.deleteFramework('f1');
      expect(response.success).toBe(true);
    });

    it('should handle delete framework error', async () => {
      dataStore.initialized = true;
      dataStore.deleteFramework.mockImplementation(() => {
        throw new Error('Framework delete failed');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.deleteFramework('f1');
      expect(response.success).toBe(false);
      expect(response.error).toBe('Framework delete failed');
    });

    it('should set selected frameworks successfully', async () => {
      dataStore.initialized = true;
      dataStore.setSelectedFrameworks.mockReturnValue(['f1', 'f2']);

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.setSelectedFrameworks(['f1', 'f2']);
      expect(response.success).toBe(true);
      expect(response.data).toEqual(['f1', 'f2']);
    });

    it('should handle set selected frameworks error', async () => {
      dataStore.initialized = true;
      dataStore.setSelectedFrameworks.mockImplementation(() => {
        throw new Error('Set frameworks failed');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.setSelectedFrameworks(['f1']);
      expect(response.success).toBe(false);
      expect(response.error).toBe('Set frameworks failed');
    });

    it('should add framework successfully', async () => {
      dataStore.initialized = true;
      dataStore.addFramework.mockReturnValue({ id: 'f2', name: 'New Framework' });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.addFramework({ id: 'f2', name: 'New Framework' });
      expect(response.success).toBe(true);
      expect(response.data.name).toBe('New Framework');
    });

    it('should handle add framework error', async () => {
      dataStore.initialized = true;
      dataStore.addFramework.mockImplementation(() => {
        throw new Error('Framework add failed');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.addFramework({ id: 'f2', name: 'New Framework' });
      expect(response.success).toBe(false);
      expect(response.error).toBe('Framework add failed');
    });

    it('should update framework successfully', async () => {
      dataStore.initialized = true;
      dataStore.updateFramework.mockReturnValue({ id: 'f1', name: 'Updated Framework' });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.updateFramework('f1', { name: 'Updated Framework' });
      expect(response.success).toBe(true);
      expect(response.data.name).toBe('Updated Framework');
    });

    it('should handle update framework error', async () => {
      dataStore.initialized = true;
      dataStore.updateFramework.mockImplementation(() => {
        throw new Error('Framework update failed');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.updateFramework('f1', { name: 'Updated' });
      expect(response.success).toBe(false);
      expect(response.error).toBe('Framework update failed');
    });
  });

  describe('Domain Management', () => {
    it('should update domain successfully', async () => {
      dataStore.initialized = true;
      dataStore.updateDomain.mockReturnValue({ id: 'd1', title: 'Updated Domain' });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.updateDomain('d1', { title: 'Updated Domain' });
      expect(response.success).toBe(true);
      expect(response.data.title).toBe('Updated Domain');
    });

    it('should handle update domain error', async () => {
      dataStore.initialized = true;
      dataStore.updateDomain.mockImplementation(() => {
        throw new Error('Domain update failed');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.updateDomain('d1', { title: 'Updated' });
      expect(response.success).toBe(false);
      expect(response.error).toBe('Domain update failed');
    });

    it('should delete domain successfully', async () => {
      dataStore.initialized = true;
      dataStore.deleteDomain.mockReturnValue(true);

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.deleteDomain('d1');
      expect(response.success).toBe(true);
    });

    it('should handle delete domain error', async () => {
      dataStore.initialized = true;
      dataStore.deleteDomain.mockImplementation(() => {
        throw new Error('Domain delete failed');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.deleteDomain('d1');
      expect(response.success).toBe(false);
      expect(response.error).toBe('Domain delete failed');
    });
  });
});
  describe('Framework Error Handling', () => {
    it('should handle deleteFramework error', async () => {
      dataStore.initialized = true;
      dataStore.deleteFramework.mockImplementation(() => {
        throw new Error('Framework delete failed');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.deleteFramework('fw1');
      expect(response.success).toBe(false);
      expect(response.error).toBe('Framework delete failed');
    });
  });

  describe('Evidence Error Handling', () => {
    it('should handle updateEvidence error', async () => {
      dataStore.initialized = true;
      dataStore.updateEvidence.mockImplementation(() => {
        throw new Error('Evidence update failed');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.updateEvidence('q1', { images: [] });
      expect(response.success).toBe(false);
      expect(response.error).toBe('Evidence update failed');
    });

    it('should handle clearEvidence error', async () => {
      dataStore.initialized = true;
      dataStore.clearEvidence.mockImplementation(() => {
        throw new Error('Evidence clear failed');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.clearEvidence();
      expect(response.success).toBe(false);
      expect(response.error).toBe('Evidence clear failed');
    });
  });

  describe('Additional Error Scenarios', () => {
    it('should handle getFrameworks when not initialized', () => {
      dataStore.initialized = false;
      dataStore.getFrameworks.mockReturnValue([]);
      const { result } = renderHook(() => useDataStore());
      
      const frameworks = result.current.getFrameworks();
      expect(Array.isArray(frameworks)).toBe(true);
    });

    it('should handle getSelectedFrameworks when not initialized', () => {
      dataStore.initialized = false;
      dataStore.getSelectedFrameworks.mockReturnValue([]);
      const { result } = renderHook(() => useDataStore());
      
      const selected = result.current.getSelectedFrameworks();
      expect(Array.isArray(selected)).toBe(true);
    });

    it('should handle setSelectedFrameworks error', async () => {
      dataStore.initialized = true;
      dataStore.setSelectedFrameworks.mockImplementation(() => {
        throw new Error('Set selected frameworks failed');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.setSelectedFrameworks(['fw1']);
      expect(response.success).toBe(false);
      expect(response.error).toBe('Set selected frameworks failed');
    });

    it('should handle assignQuestionsToUser error', async () => {
      dataStore.initialized = true;
      dataStore.assignQuestionsToUser.mockImplementation(() => {
        throw new Error('Assignment failed');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.assignQuestionsToUser('user1', ['q1']);
      expect(response.success).toBe(false);
      expect(response.error).toBe('Assignment failed');
    });

    it('should handle getUserAssignments when not initialized', () => {
      dataStore.initialized = false;
      dataStore.getUserAssignments.mockReturnValue([]);
      const { result } = renderHook(() => useDataStore());
      
      const assignments = result.current.getUserAssignments('user1');
      expect(Array.isArray(assignments)).toBe(true);
    });

    it('should handle downloadData error', async () => {
      dataStore.initialized = true;
      dataStore.downloadData.mockImplementation(() => {
        throw new Error('Download failed');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = result.current.downloadData('test.json');
      expect(response.success).toBe(false);
      expect(response.error).toBe('Download failed');
    });

    it('should handle importData error', async () => {
      dataStore.initialized = true;
      dataStore.importData.mockImplementation(() => {
        throw new Error('Import failed');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.importData({});
      expect(response.success).toBe(false);
      expect(response.error).toBe('Import failed');
    });

    it('should handle clearAllData error', async () => {
      dataStore.initialized = true;
      dataStore.clearAllData.mockImplementation(() => {
        throw new Error('Clear failed');
      });

      const { result } = renderHook(() => useDataStore());

      await waitFor(() => expect(result.current.initialized).toBe(true));

      const response = await result.current.clearAllData();
      expect(response.success).toBe(false);
      expect(response.error).toBe('Clear failed');
    });
  });
