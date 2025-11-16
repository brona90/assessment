/* eslint-disable no-undef */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dataService } from './dataService';

global.fetch = vi.fn();

describe('DataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      expect(fetch).toHaveBeenCalledWith('/assessment/data/questions.json');
    });

    it('should return null on error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false
      });

      const result = await dataService.loadQuestions();
      expect(result).toBeNull();
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
    });

    it('should return empty array on error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false
      });

      const result = await dataService.loadUsers();
      expect(result).toEqual([]);
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
    });

    it('should return default structure on error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false
      });

      const result = await dataService.loadCompliance();
      expect(result).toEqual({ frameworks: [] });
    });
  });

  describe('loadServices', () => {
    it('should load services successfully', async () => {
      const mockServices = [{ id: 'snowflake', name: 'Snowflake' }];
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockServices
      });

      const result = await dataService.loadServices();
      expect(result).toEqual(mockServices);
    });

    it('should return empty array on error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false
      });

      const result = await dataService.loadServices();
      expect(result).toEqual([]);
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
    });

    it('should return empty object on error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false
      });

      const result = await dataService.loadBenchmarks();
      expect(result).toEqual({});
    });
  });
});