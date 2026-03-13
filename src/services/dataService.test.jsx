import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { dataService } from './dataService';

const originalFetch = globalThis.fetch;
globalThis.fetch = vi.fn();

describe('DataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  describe('loadQuestions', () => {
    it('should load questions successfully', async () => {
      const mockData = {
        domains: {
          domain1: { title: 'Test Domain', weight: 0.3, categories: {} }
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const result = await dataService.loadQuestions();
      expect(result).toEqual(mockData.domains);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('data/questions.json'));
    });

    it('should return null on error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false
      });

      const result = await dataService.loadQuestions();
      expect(result).toBeNull();
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('data/questions.json'));
    });
  });

  describe('loadUsers', () => {
    it('should load users successfully', async () => {
      const mockUsers = [{ id: 1, name: 'Test User' }];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers
      });

      const result = await dataService.loadUsers();
      expect(result).toEqual(mockUsers);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('data/users.json'));
    });

    it('should return empty array on error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false
      });

      const result = await dataService.loadUsers();
      expect(result).toEqual([]);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('data/users.json'));
    });
  });

  describe('loadCompliance', () => {
    it('should load compliance data successfully', async () => {
      const mockCompliance = { frameworks: [{ id: 'sox', name: 'SOX' }] };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCompliance
      });

      const result = await dataService.loadCompliance();
      expect(result).toEqual(mockCompliance);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('data/compliance.json'));
    });

    it('should return default structure on error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false
      });

      const result = await dataService.loadCompliance();
      expect(result).toEqual({ frameworks: [] });
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('data/compliance.json'));
    });
  });

  describe('loadBenchmarks', () => {
    it('should load benchmarks successfully', async () => {
      const mockBenchmarks = { industry: 3.2 };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBenchmarks
      });

      const result = await dataService.loadBenchmarks();
      expect(result).toEqual(mockBenchmarks);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('data/benchmarks.json'));
    });

    it('should return empty object on error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false
      });

      const result = await dataService.loadBenchmarks();
      expect(result).toEqual({});
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('data/benchmarks.json'));
    });
  });
});
