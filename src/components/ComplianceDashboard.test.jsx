/* eslint-disable no-undef */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComplianceDashboard } from './ComplianceDashboard';
import { useCompliance } from '../hooks/useCompliance';

vi.mock('../hooks/useCompliance');

describe('ComplianceDashboard', () => {
  const mockFrameworks = {
    sox: {
      id: 'sox',
      name: 'SOX',
      enabled: true,
      icon: '✓',
      category: 'Financial',
      description: 'SOX compliance',
      threshold: 4.0,
      requirements: ['Access controls']
    },
    pii: {
      id: 'pii',
      name: 'PII',
      enabled: true,
      icon: '🔒',
      category: 'Privacy',
      description: 'PII protection',
      threshold: 4.5,
      requirements: ['Data encryption']
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state', () => {
    useCompliance.mockReturnValue({
      frameworks: {},
      loading: true,
      error: null,
      getEnabledFrameworks: () => [],
      getFrameworkScore: () => 0
    });

    render(<ComplianceDashboard answers={{}} />);
    expect(screen.getByTestId('compliance-loading')).toBeInTheDocument();
  });

  it('should show error state', () => {
    useCompliance.mockReturnValue({
      frameworks: {},
      loading: false,
      error: 'Failed to load',
      getEnabledFrameworks: () => [],
      getFrameworkScore: () => 0
    });

    render(<ComplianceDashboard answers={{}} />);
    expect(screen.getByTestId('compliance-error')).toBeInTheDocument();
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument();
  });

  it('should show empty state when no frameworks enabled', () => {
    useCompliance.mockReturnValue({
      frameworks: mockFrameworks,
      loading: false,
      error: null,
      getEnabledFrameworks: () => [],
      getFrameworkScore: () => 0
    });

    render(<ComplianceDashboard answers={{}} />);
    expect(screen.getByTestId('compliance-empty')).toBeInTheDocument();
    expect(screen.getByText('No Compliance Frameworks Enabled')).toBeInTheDocument();
  });

  it('should render enabled frameworks', () => {
    useCompliance.mockReturnValue({
      frameworks: mockFrameworks,
      loading: false,
      error: null,
      getEnabledFrameworks: () => Object.values(mockFrameworks),
      getFrameworkScore: (id) => id === 'sox' ? 85 : 90
    });

    render(<ComplianceDashboard answers={{}} />);
    expect(screen.getByTestId('compliance-dashboard')).toBeInTheDocument();
    expect(screen.getByText('SOX')).toBeInTheDocument();
    expect(screen.getByText('PII')).toBeInTheDocument();
  });

  it('should pass answers to hook', () => {
    const answers = { q1: 4, q2: 5 };
    const mockGetFrameworkScore = vi.fn(() => 85);

    useCompliance.mockReturnValue({
      frameworks: mockFrameworks,
      loading: false,
      error: null,
      getEnabledFrameworks: () => [mockFrameworks.sox],
      getFrameworkScore: mockGetFrameworkScore
    });

    render(<ComplianceDashboard answers={answers} />);
    expect(useCompliance).toHaveBeenCalledWith(answers);
  });

  it('should handle default answers prop', () => {
    useCompliance.mockReturnValue({
      frameworks: {},
      loading: false,
      error: null,
      getEnabledFrameworks: () => [],
      getFrameworkScore: () => 0
    });

    render(<ComplianceDashboard />);
    expect(useCompliance).toHaveBeenCalledWith(undefined);
  });
});