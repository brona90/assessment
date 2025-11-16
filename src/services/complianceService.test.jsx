/* eslint-disable no-undef */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { complianceService } from './complianceService';

global.fetch = vi.fn();

describe('ComplianceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('loadCompliance', () => {
    it('should load compliance frameworks successfully', async () => {
      const mockData = {
        frameworks: {
          sox: { id: 'sox', name: 'SOX', enabled: true }
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const result = await complianceService.loadCompliance();
      expect(result).toEqual(mockData.frameworks);
    });

    it('should return empty object on error', async () => {
      fetch.mockResolvedValueOnce({ ok: false });
      const result = await complianceService.loadCompliance();
      expect(result).toEqual({});
    });

    it('should return empty object when frameworks is missing', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      const result = await complianceService.loadCompliance();
      expect(result).toEqual({});
    });
  });

  describe('getEnabledFrameworks', () => {
    it('should return only enabled frameworks', () => {
      const frameworks = {
        sox: { id: 'sox', enabled: true },
        pii: { id: 'pii', enabled: false },
        hipaa: { id: 'hipaa', enabled: true }
      };

      const result = complianceService.getEnabledFrameworks(frameworks);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('sox');
      expect(result[1].id).toBe('hipaa');
    });

    it('should return empty array when no frameworks enabled', () => {
      const frameworks = {
        sox: { id: 'sox', enabled: false }
      };

      const result = complianceService.getEnabledFrameworks(frameworks);
      expect(result).toEqual([]);
    });
  });

  describe('calculateFrameworkScore', () => {
    const framework = {
      mappedQuestions: ['q1', 'q2', 'q3']
    };

    it('should calculate score correctly', () => {
      const answers = { q1: 4, q2: 5, q3: 3 };
      const score = complianceService.calculateFrameworkScore(framework, answers);
      expect(score).toBe(80);
    });

    it('should return 0 for no mapped questions', () => {
      const score = complianceService.calculateFrameworkScore({}, {});
      expect(score).toBe(0);
    });

    it('should return 0 for null mapped questions', () => {
      const score = complianceService.calculateFrameworkScore({ mappedQuestions: null }, {});
      expect(score).toBe(0);
    });

    it('should return 0 when no questions answered', () => {
      const score = complianceService.calculateFrameworkScore(framework, {});
      expect(score).toBe(0);
    });

    it('should handle partial answers', () => {
      const answers = { q1: 5 };
      const score = complianceService.calculateFrameworkScore(framework, answers);
      expect(score).toBe(100);
    });
  });

  describe('getComplianceStatus', () => {
    it('should return Excellent for 90%+', () => {
      const result = complianceService.getComplianceStatus(95, 4.0);
      expect(result.status).toBe('Excellent');
      expect(result.color).toBe('#10b981');
    });

    it('should return Good for above threshold', () => {
      const result = complianceService.getComplianceStatus(85, 4.0);
      expect(result.status).toBe('Good');
    });

    it('should return Fair for threshold - 10', () => {
      const result = complianceService.getComplianceStatus(75, 4.0);
      expect(result.status).toBe('Fair');
    });

    it('should return Needs Improvement for threshold - 20', () => {
      const result = complianceService.getComplianceStatus(65, 4.0);
      expect(result.status).toBe('Needs Improvement');
    });

    it('should return Critical for below threshold - 20', () => {
      const result = complianceService.getComplianceStatus(50, 4.0);
      expect(result.status).toBe('Critical');
      expect(result.color).toBe('#ef4444');
    });
  });

  describe('saveCompliance', () => {
    it('should save compliance to localStorage', () => {
      const frameworks = { sox: { id: 'sox' } };
      const result = complianceService.saveCompliance(frameworks);
      
      expect(result).toBe(true);
      const saved = localStorage.getItem('complianceFrameworks');
      expect(JSON.parse(saved)).toEqual(frameworks);
    });

    it('should handle save errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = complianceService.saveCompliance({});
      expect(result).toBe(false);

      setItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('loadSavedCompliance', () => {
    it('should load saved compliance', () => {
      const frameworks = { sox: { id: 'sox' } };
      localStorage.setItem('complianceFrameworks', JSON.stringify(frameworks));

      const result = complianceService.loadSavedCompliance();
      expect(result).toEqual(frameworks);
    });

    it('should return null when no saved data', () => {
      const result = complianceService.loadSavedCompliance();
      expect(result).toBeNull();
    });

    it('should handle load errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = complianceService.loadSavedCompliance();
      expect(result).toBeNull();

      getItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });
});