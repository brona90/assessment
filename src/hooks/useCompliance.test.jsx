import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCompliance } from './useCompliance';
import { complianceService } from '../services/complianceService';

vi.mock('../services/complianceService');

describe('useCompliance', () => {
  const mockFrameworks = {
    sox: { id: 'sox', name: 'SOX', enabled: true, mappedQuestions: ['q1'] },
    pii: { id: 'pii', name: 'PII', enabled: false, mappedQuestions: ['q2'] }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    complianceService.loadCompliance.mockResolvedValue(mockFrameworks);
    complianceService.loadSavedCompliance.mockReturnValue(null);
    complianceService.getEnabledFrameworks.mockImplementation((f) => 
      Object.values(f).filter(fw => fw.enabled)
    );
    complianceService.calculateFrameworkScore.mockReturnValue(80);
    complianceService.saveCompliance.mockReturnValue(true);
  });

  it('should load frameworks on mount', async () => {
    const { result } = renderHook(() => useCompliance());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.frameworks).toEqual(mockFrameworks);
  });

  it('should load saved frameworks if available', async () => {
    const savedFrameworks = { sox: { id: 'sox', enabled: false } };
    complianceService.loadSavedCompliance.mockReturnValue(savedFrameworks);

    const { result } = renderHook(() => useCompliance());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.frameworks).toEqual(savedFrameworks);
    expect(complianceService.loadCompliance).not.toHaveBeenCalled();
  });

  it('should get enabled frameworks', async () => {
    const { result } = renderHook(() => useCompliance());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const enabled = result.current.getEnabledFrameworks();
    expect(enabled).toHaveLength(1);
    expect(enabled[0].id).toBe('sox');
  });

  it('should get framework score', async () => {
    const answers = { q1: 4 };
    const { result } = renderHook(() => useCompliance(answers));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const score = result.current.getFrameworkScore('sox');
    expect(score).toBe(80);
  });

  it('should return 0 for non-existent framework', async () => {
    const { result } = renderHook(() => useCompliance());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const score = result.current.getFrameworkScore('nonexistent');
    expect(score).toBe(0);
  });

  it('should toggle framework', async () => {
    const { result } = renderHook(() => useCompliance());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.toggleFramework('sox');
    });

    expect(result.current.frameworks.sox.enabled).toBe(false);
    expect(complianceService.saveCompliance).toHaveBeenCalled();
  });

  it('should update framework', async () => {
    const { result } = renderHook(() => useCompliance());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.updateFramework('sox', { threshold: 4.5 });
    });

    expect(result.current.frameworks.sox.threshold).toBe(4.5);
    expect(complianceService.saveCompliance).toHaveBeenCalled();
  });

  it('should reload frameworks', async () => {
    const { result } = renderHook(() => useCompliance());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.reload();
    });

    expect(complianceService.loadCompliance).toHaveBeenCalledTimes(2);
  });

  it('should handle errors', async () => {
    complianceService.loadCompliance.mockRejectedValue(new Error('Load failed'));
    complianceService.loadSavedCompliance.mockReturnValue(null);

    const { result } = renderHook(() => useCompliance());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });
});