import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCompliance } from './useCompliance';
import { complianceService } from '../services/complianceService';
import { dataStore } from '../services/dataStore';

vi.mock('../services/complianceService');
vi.mock('../services/dataStore', () => ({
  dataStore: {
    initialized: false,
    initialize: vi.fn(),
    getSelectedFrameworks: vi.fn()
  }
}));

describe('useCompliance', () => {
  const mockSelectedFrameworks = [
    { id: 'sox', name: 'SOX', mappedQuestions: ['q1'] },
    { id: 'pii', name: 'PII', mappedQuestions: ['q2'] }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    dataStore.initialized = false;
    dataStore.initialize.mockResolvedValue();
    dataStore.getSelectedFrameworks.mockReturnValue(mockSelectedFrameworks);
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

    expect(dataStore.initialize).toHaveBeenCalled();
    expect(dataStore.getSelectedFrameworks).toHaveBeenCalled();
    expect(Object.keys(result.current.frameworks)).toHaveLength(2);
  });

  it('should skip initialization if dataStore already initialized', async () => {
    dataStore.initialized = true;

    const { result } = renderHook(() => useCompliance());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(dataStore.initialize).not.toHaveBeenCalled();
    expect(dataStore.getSelectedFrameworks).toHaveBeenCalled();
  });

  it('should get enabled frameworks', async () => {
    const { result } = renderHook(() => useCompliance());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const enabled = result.current.getEnabledFrameworks();
    expect(enabled).toHaveLength(2);
  });

  it('should calculate framework score', async () => {
    const { result } = renderHook(() => useCompliance({ q1: 4 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const score = result.current.getFrameworkScore('sox');
    expect(score).toBe(80);
  });

  it('should toggle framework', async () => {
    const { result } = renderHook(() => useCompliance());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.toggleFramework('sox');
    });

    expect(complianceService.saveCompliance).toHaveBeenCalled();
  });

  it('should update framework', async () => {
    const { result } = renderHook(() => useCompliance());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.updateFramework('sox', { name: 'Updated SOX' });
    });

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

    expect(dataStore.getSelectedFrameworks).toHaveBeenCalledTimes(2);
  });

  it('should handle errors', async () => {
    dataStore.initialize.mockRejectedValue(new Error('Load failed'));

    const { result } = renderHook(() => useCompliance());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });
});