import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageService } from './storageService';

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Assessment Data', () => {
    it('should save assessment data', async () => {
      const testData = { q1: 3, q2: 4 };
      const result = await storageService.saveAssessment(testData);
      
      expect(result).toBe(true);
      const saved = localStorage.getItem('assessmentData');
      expect(JSON.parse(saved)).toEqual(testData);
    });

    it('should load assessment data', async () => {
      const testData = { q1: 3, q2: 4 };
      localStorage.setItem('assessmentData', JSON.stringify(testData));
      
      const loaded = await storageService.loadAssessment();
      expect(loaded).toEqual(testData);
    });

    it('should return empty object when no data exists', async () => {
      const loaded = await storageService.loadAssessment();
      expect(loaded).toEqual({});
    });

    it('should clear assessment data', async () => {
      localStorage.setItem('assessmentData', JSON.stringify({ q1: 3 }));
      
      const result = await storageService.clearAssessment();
      expect(result).toBe(true);
      expect(localStorage.getItem('assessmentData')).toBeNull();
    });

    it('should handle save errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });
      
      const result = await storageService.saveAssessment({ q1: 3 });
      expect(result).toBe(false);
      
      setItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should handle load errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const result = await storageService.loadAssessment();
      expect(result).toEqual({});
      
      getItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should handle clear errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const result = await storageService.clearAssessment();
      expect(result).toBe(false);
      
      removeItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('Evidence Storage', () => {
    it('should save evidence for a question', async () => {
      const evidence = { images: [], text: 'Test evidence' };
      const result = await storageService.saveEvidence('q1', evidence);
      
      expect(result).toBe(true);
    });

    it('should load evidence for a question', async () => {
      const evidence = { images: [], text: 'Test evidence' };
      await storageService.saveEvidence('q1', evidence);
      
      const loaded = await storageService.loadEvidence('q1');
      expect(loaded).toEqual(evidence);
    });

    it('should return null when evidence does not exist', async () => {
      const loaded = await storageService.loadEvidence('nonexistent');
      expect(loaded).toBeNull();
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
      const setItemSpy = vi.spyOn(storageService.evidenceDB, 'setItem')
        .mockRejectedValue(new Error('Storage error'));
      
      const result = await storageService.saveEvidence('q1', { text: 'test' });
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error saving evidence:', expect.any(Error));
      
      setItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should handle load evidence errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const getItemSpy = vi.spyOn(storageService.evidenceDB, 'getItem')
        .mockRejectedValue(new Error('Load error'));
      
      const result = await storageService.loadEvidence('q1');
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Error loading evidence:', expect.any(Error));
      
      getItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should handle load all evidence errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const keysSpy = vi.spyOn(storageService.evidenceDB, 'keys')
        .mockRejectedValue(new Error('Keys error'));
      
      const result = await storageService.loadAllEvidence();
      expect(result).toEqual({});
      expect(consoleSpy).toHaveBeenCalledWith('Error loading all evidence:', expect.any(Error));
      
      keysSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should handle clear all evidence errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const clearSpy = vi.spyOn(storageService.evidenceDB, 'clear')
        .mockRejectedValue(new Error('Clear error'));
      
      const result = await storageService.clearAllEvidence();
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error clearing evidence:', expect.any(Error));
      
      clearSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });
});