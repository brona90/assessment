import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAssessment } from './useAssessment';
import { storageService } from '../services/storageService';
import { dataService } from '../services/dataService';

vi.mock('../services/storageService');
vi.mock('../services/dataService');

describe('useAssessment', () => {
  const mockDomains = {
    domain1: {
      weight: 0.3,
      categories: {
        cat1: { questions: [{ id: 'q1' }, { id: 'q2' }] }
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    dataService.loadQuestions.mockResolvedValue(mockDomains);
    storageService.loadAssessment.mockResolvedValue({});
    storageService.loadAllEvidence.mockResolvedValue({});
    storageService.loadComments.mockReturnValue({});
    storageService.saveComments.mockImplementation(() => {});
  });

  it('should load data on mount', async () => {
    const { result } = renderHook(() => useAssessment('user1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.domains).toEqual(mockDomains);
    expect(dataService.loadQuestions).toHaveBeenCalled();
  });

  it('should save answer with userId', async () => {
    storageService.saveAssessment.mockResolvedValue(true);
    const { result } = renderHook(() => useAssessment('user1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.saveAnswer('q1', 3);
    });

    expect(result.current.answers).toEqual({ q1: 3 });
    expect(storageService.saveAssessment).toHaveBeenCalledWith('user1', { q1: 3 });
  });

  it('should clear answer', async () => {
    storageService.saveAssessment.mockResolvedValue(true);
    storageService.loadAssessment.mockResolvedValue({ q1: 3, q2: 4 });

    const { result } = renderHook(() => useAssessment('user1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.clearAnswer('q1');
    });

    expect(result.current.answers).toEqual({ q2: 4 });
  });

  it('should save evidence', async () => {
    storageService.saveEvidence.mockResolvedValue(true);
    const { result } = renderHook(() => useAssessment('user1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const evidenceData = { text: 'Test evidence', images: [] };

    await act(async () => {
      await result.current.saveEvidenceForQuestion('q1', evidenceData);
    });

    expect(result.current.evidence).toEqual({ q1: evidenceData });
    expect(storageService.saveEvidence).toHaveBeenCalledWith('q1', evidenceData);
  });

  it('should clear all data', async () => {
    storageService.clearAssessment.mockResolvedValue(true);
    storageService.clearAllEvidence.mockResolvedValue(true);

    const { result } = renderHook(() => useAssessment('user1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.clearAllData();
    });

    expect(result.current.answers).toEqual({});
    expect(result.current.evidence).toEqual({});
    expect(storageService.clearAssessment).toHaveBeenCalledWith('user1');
    expect(storageService.clearAllEvidence).toHaveBeenCalled();
  });

  it('should calculate progress', async () => {
    storageService.loadAssessment.mockResolvedValue({ q1: 3 });
    const { result } = renderHook(() => useAssessment('user1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const progress = result.current.getProgress();
    expect(progress.answered).toBe(1);
    expect(progress.total).toBe(2);
    expect(progress.percentage).toBe(50);
  });

  it('should handle errors', async () => {
    dataService.loadQuestions.mockResolvedValue(null);
    const { result } = renderHook(() => useAssessment('user1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('should get domain score', async () => {
    storageService.loadAssessment.mockResolvedValue({ q1: 3, q2: 4 });
    const { result } = renderHook(() => useAssessment('user1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const score = result.current.getDomainScore('domain1');
    expect(score).toBe(3.5);
  });

  it('should get overall score', async () => {
    storageService.loadAssessment.mockResolvedValue({ q1: 3, q2: 4 });
    const { result } = renderHook(() => useAssessment('user1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const score = result.current.getOverallScore();
    expect(score).toBeGreaterThan(0);
  });

  it('should reload data', async () => {
    const { result } = renderHook(() => useAssessment('user1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.reload();
    });

    expect(dataService.loadQuestions).toHaveBeenCalledTimes(2);
  });

  it('should return 0 for domain score when domain does not exist', async () => {
    const { result } = renderHook(() => useAssessment('user1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const score = result.current.getDomainScore('nonexistent');
    expect(score).toBe(0);
  });

  it('should return 0 for overall score when no domains', async () => {
    dataService.loadQuestions.mockResolvedValue(null);
    storageService.loadAssessment.mockResolvedValue({});

    const { result } = renderHook(() => useAssessment('user1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const score = result.current.getOverallScore();
    expect(score).toBe(0);
  });

  it('should return default progress when no domains', async () => {
    dataService.loadQuestions.mockResolvedValue(null);

    const { result } = renderHook(() => useAssessment('user1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const progress = result.current.getProgress();
    expect(progress).toEqual({ answered: 0, total: 0, percentage: 0 });
  });

  describe('Comments', () => {
    it('should load comments on mount', async () => {
      storageService.loadComments.mockReturnValue({ q1: 'a note' });
      const { result } = renderHook(() => useAssessment('user1'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.comments).toEqual({ q1: 'a note' });
      expect(storageService.loadComments).toHaveBeenCalledWith('user1');
    });

    it('should save comment and update state', async () => {
      const { result } = renderHook(() => useAssessment('user1'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.saveComment('q1', 'my note');
      });

      expect(result.current.comments).toEqual({ q1: 'my note' });
      expect(storageService.saveComments).toHaveBeenCalledWith('user1', { q1: 'my note' });
    });

    it('should preserve existing comments when saving a new one', async () => {
      storageService.loadComments.mockReturnValue({ q1: 'first' });
      const { result } = renderHook(() => useAssessment('user1'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => {
        result.current.saveComment('q2', 'second');
      });

      expect(result.current.comments).toEqual({ q1: 'first', q2: 'second' });
    });

    it('should clear comments on clearAllData', async () => {
      storageService.loadComments.mockReturnValue({ q1: 'a note' });
      storageService.clearAssessment.mockResolvedValue(true);
      storageService.clearAllEvidence.mockResolvedValue(true);

      const { result } = renderHook(() => useAssessment('user1'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.clearAllData();
      });

      expect(result.current.comments).toEqual({});
      expect(storageService.saveComments).toHaveBeenCalledWith('user1', {});
    });
  });

  it('should reload answers when userId changes', async () => {
    storageService.loadAssessment
      .mockResolvedValueOnce({ q1: 3 })
      .mockResolvedValueOnce({ q2: 5 });

    let userId = 'user1';
    const { result, rerender } = renderHook(() => useAssessment(userId));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.answers).toEqual({ q1: 3 });

    userId = 'user2';
    rerender();

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.answers).toEqual({ q2: 5 });
  });
});