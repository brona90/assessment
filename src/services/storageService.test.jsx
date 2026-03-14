import { describe, it, expect, beforeEach, vi } from 'vitest';

// In-memory fake IndexedDB store for testing
const fakeStore = new Map();
const fakeDB = {
  put: vi.fn(async (_store, value, key) => { fakeStore.set(key, value); }),
  get: vi.fn(async (_store, key) => fakeStore.get(key) ?? undefined),
  getAllKeys: vi.fn(async () => [...fakeStore.keys()]),
  getAll: vi.fn(async () => [...fakeStore.values()]),
  clear: vi.fn(async () => { fakeStore.clear(); })
};

vi.mock('idb', () => ({
  openDB: vi.fn(async () => fakeDB)
}));

// Import after mock is set up
const { storageService } = await import('./storageService');

describe('StorageService', () => {
  beforeEach(async () => {
    localStorage.clear();
    vi.clearAllMocks();
    fakeStore.clear();
    storageService._resetDB();
  });

  describe('Assessment Data', () => {
    it('should save assessment data with userId', async () => {
      const testData = { q1: 3, q2: 4 };
      const result = await storageService.saveAssessment('user1', testData);

      expect(result).toBe(true);
      const saved = localStorage.getItem('assessmentData_user1');
      expect(JSON.parse(saved)).toEqual(testData);
    });

    it('should fall back to default key when no userId', async () => {
      const testData = { q1: 3 };
      await storageService.saveAssessment(null, testData);
      expect(localStorage.getItem('assessmentData')).not.toBeNull();
    });

    it('should load assessment data with userId', async () => {
      const testData = { q1: 3, q2: 4 };
      localStorage.setItem('assessmentData_user1', JSON.stringify(testData));

      const loaded = await storageService.loadAssessment('user1');
      expect(loaded).toEqual(testData);
    });

    it('should return empty object when no data exists', async () => {
      const loaded = await storageService.loadAssessment('user1');
      expect(loaded).toEqual({});
    });

    it('should clear assessment data with userId', async () => {
      localStorage.setItem('assessmentData_user1', JSON.stringify({ q1: 3 }));

      const result = await storageService.clearAssessment('user1');
      expect(result).toBe(true);
      expect(localStorage.getItem('assessmentData_user1')).toBeNull();
    });

    it('should isolate data between different users', async () => {
      await storageService.saveAssessment('user1', { q1: 3 });
      await storageService.saveAssessment('user2', { q1: 5 });

      const user1Data = await storageService.loadAssessment('user1');
      const user2Data = await storageService.loadAssessment('user2');

      expect(user1Data).toEqual({ q1: 3 });
      expect(user2Data).toEqual({ q1: 5 });
    });

    it('should handle save errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });

      const result = await storageService.saveAssessment('user1', { q1: 3 });
      expect(result).toBe(false);

      setItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should handle load errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = await storageService.loadAssessment('user1');
      expect(result).toEqual({});

      getItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should handle clear errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = await storageService.clearAssessment('user1');
      expect(result).toBe(false);

      removeItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('Assignments', () => {
    it('should save and load assignments', () => {
      const assignments = { user1: ['q1', 'q2'], user2: ['q3'] };
      const saved = storageService.saveAssignments(assignments);
      expect(saved).toBe(true);

      const loaded = storageService.loadAssignments();
      expect(loaded).toEqual(assignments);
    });

    it('should return null when no assignments saved', () => {
      expect(storageService.loadAssignments()).toBeNull();
    });

    it('should overwrite previous assignments on save', () => {
      storageService.saveAssignments({ user1: ['q1'] });
      storageService.saveAssignments({ user1: ['q1', 'q2'] });
      expect(storageService.loadAssignments()).toEqual({ user1: ['q1', 'q2'] });
    });

    it('should handle save errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });

      const result = storageService.saveAssignments({ user1: ['q1'] });
      expect(result).toBe(false);

      setItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should handle load errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(storageService.loadAssignments()).toBeNull();

      getItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('Framework Mappings', () => {
    it('should save and load framework mappings', () => {
      const mappings = { fw1: ['q1', 'q2'], fw2: ['q3'] };
      const saved = storageService.saveFrameworkMappings(mappings);
      expect(saved).toBe(true);

      const loaded = storageService.loadFrameworkMappings();
      expect(loaded).toEqual(mappings);
    });

    it('should return empty object when no mappings saved', () => {
      const loaded = storageService.loadFrameworkMappings();
      expect(loaded).toEqual({});
    });

    it('should overwrite previous mappings on save', () => {
      storageService.saveFrameworkMappings({ fw1: ['q1'] });
      storageService.saveFrameworkMappings({ fw1: ['q1', 'q2'] });
      expect(storageService.loadFrameworkMappings()).toEqual({ fw1: ['q1', 'q2'] });
    });

    it('should handle save errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });

      const result = storageService.saveFrameworkMappings({ fw1: ['q1'] });
      expect(result).toBe(false);

      setItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should handle load errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = storageService.loadFrameworkMappings();
      expect(result).toEqual({});

      getItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('Last Active Tracking', () => {
    it('should save last active timestamp for a user', () => {
      storageService.saveLastActive('user1');
      const stored = localStorage.getItem('lastActive_user1');
      expect(stored).toBeTruthy();
      expect(new Date(stored).toString()).not.toBe('Invalid Date');
    });

    it('should load last active timestamp for a user', () => {
      const ts = new Date().toISOString();
      localStorage.setItem('lastActive_user1', ts);
      expect(storageService.loadLastActive('user1')).toBe(ts);
    });

    it('should return null when no last active timestamp exists', () => {
      expect(storageService.loadLastActive('ghost')).toBeNull();
    });

    it('should do nothing when userId is null', () => {
      expect(() => storageService.saveLastActive(null)).not.toThrow();
      expect(storageService.loadLastActive(null)).toBeNull();
    });
  });

  describe('loadUsersCompletionStatus', () => {
    it('should return completion stats per user', async () => {
      const users = [{ id: 'u1', name: 'Alice' }];
      const questions = [{ id: 'q1' }, { id: 'q2' }];
      localStorage.setItem('assessmentData_u1', JSON.stringify({ q1: 3 }));

      const statuses = await storageService.loadUsersCompletionStatus(users, { u1: questions });
      expect(statuses).toHaveLength(1);
      expect(statuses[0].userId).toBe('u1');
      expect(statuses[0].answered).toBe(1);
      expect(statuses[0].total).toBe(2);
      expect(statuses[0].percentage).toBe(50);
    });

    it('should return 0% for user with no answers', async () => {
      const users = [{ id: 'u1', name: 'Alice' }];
      const questions = [{ id: 'q1' }];
      const statuses = await storageService.loadUsersCompletionStatus(users, { u1: questions });
      expect(statuses[0].answered).toBe(0);
      expect(statuses[0].percentage).toBe(0);
    });

    it('should handle empty user list', async () => {
      const statuses = await storageService.loadUsersCompletionStatus([], {});
      expect(statuses).toEqual([]);
    });

    it('should include last active timestamp in status', async () => {
      const ts = new Date().toISOString();
      localStorage.setItem('lastActive_u1', ts);
      const users = [{ id: 'u1', name: 'Alice' }];
      const statuses = await storageService.loadUsersCompletionStatus(users, { u1: [] });
      expect(statuses[0].lastActive).toBe(ts);
    });
  });

  describe('loadAllUsersAnswers', () => {
    it('should merge answers from multiple users', async () => {
      localStorage.setItem('assessmentData_u1', JSON.stringify({ q1: 3 }));
      localStorage.setItem('assessmentData_u2', JSON.stringify({ q2: 4 }));

      const merged = await storageService.loadAllUsersAnswers(['u1', 'u2']);
      expect(merged).toEqual({ q1: 3, q2: 4 });
    });

    it('should return empty object when no users provided', async () => {
      const merged = await storageService.loadAllUsersAnswers([]);
      expect(merged).toEqual({});
    });

    it('should skip missing user storage gracefully', async () => {
      const merged = await storageService.loadAllUsersAnswers(['ghost']);
      expect(merged).toEqual({});
    });

    it('should let later user answers overwrite earlier ones for same question', async () => {
      localStorage.setItem('assessmentData_u1', JSON.stringify({ q1: 2 }));
      localStorage.setItem('assessmentData_u2', JSON.stringify({ q1: 5 }));

      const merged = await storageService.loadAllUsersAnswers(['u1', 'u2']);
      expect(merged.q1).toBe(5);
    });
  });

  describe('Evidence Storage', () => {
    it('should save evidence for a question', async () => {
      const evidence = { images: [], text: 'Test evidence' };
      const result = await storageService.saveEvidence('q1', evidence);
      expect(result).toBe(true);
      expect(fakeDB.put).toHaveBeenCalledWith('evidence', evidence, 'q1');
    });

    it('should load evidence for a question', async () => {
      const evidence = { images: [], text: 'Test evidence' };
      await storageService.saveEvidence('q1', evidence);

      const loaded = await storageService.loadEvidence('q1');
      expect(loaded).toEqual(evidence);
    });

    it('should return null when evidence does not exist', async () => {
      fakeDB.get.mockResolvedValueOnce(undefined);
      const loaded = await storageService.loadEvidence('nonexistent');
      expect(loaded).toBeUndefined();
    });

    it('should load all evidence', async () => {
      await storageService.saveEvidence('q1', { text: 'Evidence 1' });
      await storageService.saveEvidence('q2', { text: 'Evidence 2' });

      const allEvidence = await storageService.loadAllEvidence();
      expect(Object.keys(allEvidence).length).toBeGreaterThanOrEqual(2);
    });

    it('should clear all evidence', async () => {
      await storageService.saveEvidence('q1', { text: 'Evidence 1' });

      const result = await storageService.clearAllEvidence();
      expect(result).toBe(true);

      const allEvidence = await storageService.loadAllEvidence();
      expect(Object.keys(allEvidence).length).toBe(0);
    });

    it('should handle save evidence errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      fakeDB.put.mockRejectedValueOnce(new Error('Storage error'));

      const result = await storageService.saveEvidence('q1', { text: 'test' });
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error saving evidence:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle load evidence errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      fakeDB.get.mockRejectedValueOnce(new Error('Load error'));

      const result = await storageService.loadEvidence('q1');
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Error loading evidence:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle load all evidence errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      fakeDB.getAllKeys.mockRejectedValueOnce(new Error('Keys error'));

      const result = await storageService.loadAllEvidence();
      expect(result).toEqual({});
      expect(consoleSpy).toHaveBeenCalledWith('Error loading all evidence:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle clear all evidence errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      fakeDB.clear.mockRejectedValueOnce(new Error('Clear error'));

      const result = await storageService.clearAllEvidence();
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error clearing evidence:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('Comments', () => {
    it('should save and load comments for a user', () => {
      storageService.saveComments('user1', { q1: 'My note', q2: 'Another note' });
      const loaded = storageService.loadComments('user1');
      expect(loaded).toEqual({ q1: 'My note', q2: 'Another note' });
    });

    it('should return empty object when no comments exist', () => {
      const loaded = storageService.loadComments('user1');
      expect(loaded).toEqual({});
    });

    it('should isolate comments between users', () => {
      storageService.saveComments('user1', { q1: 'user1 note' });
      storageService.saveComments('user2', { q1: 'user2 note' });
      expect(storageService.loadComments('user1')).toEqual({ q1: 'user1 note' });
      expect(storageService.loadComments('user2')).toEqual({ q1: 'user2 note' });
    });

    it('should do nothing when userId is falsy', () => {
      storageService.saveComments(null, { q1: 'test' });
      expect(storageService.loadComments(null)).toEqual({});
    });

    it('should overwrite previous comments on save', () => {
      storageService.saveComments('user1', { q1: 'first' });
      storageService.saveComments('user1', { q1: 'updated' });
      expect(storageService.loadComments('user1')).toEqual({ q1: 'updated' });
    });
  });

  describe('Assessment Snapshots', () => {
    it('should save a snapshot for a user', () => {
      const snapshot = { timestamp: '2025-01-15T10:00:00Z', overallScore: 3.5 };
      const result = storageService.saveSnapshot('user1', snapshot);
      expect(result).toBe(true);

      const stored = JSON.parse(localStorage.getItem('snapshots_user1'));
      expect(stored).toHaveLength(1);
      expect(stored[0]).toEqual(snapshot);
    });

    it('should append to existing snapshots', () => {
      const snap1 = { timestamp: '2025-01-01T00:00:00Z', overallScore: 2.0 };
      const snap2 = { timestamp: '2025-02-01T00:00:00Z', overallScore: 3.5 };
      storageService.saveSnapshot('user1', snap1);
      storageService.saveSnapshot('user1', snap2);

      const stored = JSON.parse(localStorage.getItem('snapshots_user1'));
      expect(stored).toHaveLength(2);
      expect(stored[0]).toEqual(snap1);
      expect(stored[1]).toEqual(snap2);
    });

    it('should keep only the last 20 snapshots', () => {
      for (let i = 0; i < 25; i++) {
        storageService.saveSnapshot('user1', {
          timestamp: `2025-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
          overallScore: i * 0.2
        });
      }
      const stored = JSON.parse(localStorage.getItem('snapshots_user1'));
      expect(stored).toHaveLength(20);
      // The first 5 should have been shifted out
      expect(stored[0].overallScore).toBeCloseTo(1.0); // i=5
    });

    it('should return false on save error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });

      const result = storageService.saveSnapshot('user1', { timestamp: 'x', overallScore: 1 });
      expect(result).toBe(false);

      setItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should load snapshots for a user', () => {
      const snapshots = [
        { timestamp: '2025-01-01T00:00:00Z', overallScore: 2.0 },
        { timestamp: '2025-02-01T00:00:00Z', overallScore: 3.5 }
      ];
      localStorage.setItem('snapshots_user1', JSON.stringify(snapshots));

      const loaded = storageService.loadSnapshots('user1');
      expect(loaded).toEqual(snapshots);
    });

    it('should return empty array when no snapshots exist', () => {
      const loaded = storageService.loadSnapshots('user1');
      expect(loaded).toEqual([]);
    });

    it('should return empty array on load error (corrupted JSON)', () => {
      localStorage.setItem('snapshots_user1', 'not-valid-json');
      // JSON.parse will throw SyntaxError
      const loaded = storageService.loadSnapshots('user1');
      expect(loaded).toEqual([]);
    });

    it('should clear snapshots for a user', () => {
      localStorage.setItem('snapshots_user1', JSON.stringify([{ timestamp: 'x', overallScore: 1 }]));
      const result = storageService.clearSnapshots('user1');
      expect(result).toBe(true);
      expect(localStorage.getItem('snapshots_user1')).toBeNull();
    });

    it('should return true when clearing snapshots that do not exist', () => {
      const result = storageService.clearSnapshots('ghost');
      expect(result).toBe(true);
    });

    it('should return false on clear error', () => {
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = storageService.clearSnapshots('user1');
      expect(result).toBe(false);

      removeItemSpy.mockRestore();
    });
  });
});
