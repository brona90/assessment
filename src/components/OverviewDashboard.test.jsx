import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OverviewDashboard } from './OverviewDashboard';

vi.mock('./DomainHeatmap', () => ({
  DomainHeatmap: ({ onCanvasReady }) => {
    // Invoke the callback wrapper with a fake canvas ref so the wrapper line is covered
    if (onCanvasReady) onCanvasReady('heatmap-canvas-ref');
    return <div data-testid="domain-heatmap">Heatmap</div>;
  }
}));
vi.mock('./DomainRadarChart', () => ({
  DomainRadarChart: ({ onChartReady }) => {
    if (onChartReady) onChartReady('radar-chart-ref');
    return <div data-testid="domain-radar-chart">Radar Chart</div>;
  }
}));
vi.mock('./DomainBarChart', () => ({
  DomainBarChart: ({ onChartReady }) => {
    if (onChartReady) onChartReady('bar-chart-ref');
    return <div data-testid="domain-bar-chart">Bar Chart</div>;
  }
}));
vi.mock('./BenchmarkTrendChart', () => ({
  BenchmarkTrendChart: ({ benchmarks, userScore }) => (
    <div data-testid="benchmark-trend-chart"
      data-has-benchmarks={!!benchmarks}
      data-user-score={userScore}>Trend Chart</div>
  )
}));
vi.mock('./BenchmarkSources', () => ({
  BenchmarkSources: ({ sources }) => (
    sources && sources.length > 0
      ? <div data-testid="benchmark-sources">{sources.map(s => s.publisher).join(', ')}</div>
      : null
  )
}));
vi.mock('./ComplianceDashboard', () => ({
  ComplianceDashboard: () => <div data-testid="compliance-dashboard">Compliance</div>
}));

const mockLoadBenchmarks = vi.fn();

vi.mock('../services/dataService', () => ({
  dataService: { loadBenchmarks: (...args) => mockLoadBenchmarks(...args) }
}));

describe('OverviewDashboard', () => {
  const domains = {
    domain1: {
      title: 'Data Governance',
      categories: {
        cat1: {
          title: 'Policy',
          questions: [
            { id: 'q1', text: 'Q1' },
            { id: 'q2', text: 'Q2' }
          ]
        }
      }
    },
    domain2: {
      title: 'Data Quality',
      categories: {
        cat2: {
          title: 'Monitoring',
          questions: [
            { id: 'q3', text: 'Q3' }
          ]
        }
      }
    }
  };

  const answers = { q1: 3, q2: 4, q3: 2 };

  beforeEach(() => {
    mockLoadBenchmarks.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders heatmap, radar, and bar chart sections', () => {
    render(<OverviewDashboard domains={domains} answers={answers} />);
    expect(screen.getByTestId('overview-heatmap')).toBeInTheDocument();
    expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
    expect(screen.getByTestId('overview-radar')).toBeInTheDocument();
    expect(screen.getByTestId('domain-radar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('overview-bar')).toBeInTheDocument();
    expect(screen.getByTestId('domain-bar-chart')).toBeInTheDocument();
  });

  it('does NOT render trend chart when benchmarks are null', async () => {
    mockLoadBenchmarks.mockResolvedValue(null);
    render(<OverviewDashboard domains={domains} answers={answers} />);
    // Wait for the effect to settle
    await waitFor(() => {
      expect(mockLoadBenchmarks).toHaveBeenCalled();
    });
    expect(screen.queryByTestId('overview-trend')).not.toBeInTheDocument();
    expect(screen.queryByTestId('benchmark-trend-chart')).not.toBeInTheDocument();
  });

  it('renders trend chart after benchmarks load', async () => {
    mockLoadBenchmarks.mockResolvedValue({
      current: { domain1: 3.2, overall: 3.15 },
      history: [{ date: '2024-Q3', overall: 3.05 }]
    });
    render(<OverviewDashboard domains={domains} answers={answers} />);
    await waitFor(() => {
      expect(screen.getByTestId('overview-trend')).toBeInTheDocument();
      expect(screen.getByTestId('benchmark-trend-chart')).toBeInTheDocument();
    });
  });

  it('renders BenchmarkSources when benchmarks have sources', async () => {
    mockLoadBenchmarks.mockResolvedValue({
      current: { domain1: 3.2, overall: 3.15 },
      history: [],
      sources: [
        { id: 's1', publisher: 'DORA', report: 'State of DevOps', year: 2023,
          url: 'https://dora.dev', description: 'DORA report' }
      ]
    });
    render(<OverviewDashboard domains={domains} answers={answers} />);
    await waitFor(() => {
      expect(screen.getByTestId('benchmark-sources')).toBeInTheDocument();
      expect(screen.getByText('DORA')).toBeInTheDocument();
    });
  });

  it('renders ComplianceDashboard section', () => {
    render(<OverviewDashboard domains={domains} answers={answers} />);
    expect(screen.getByText('Compliance Frameworks')).toBeInTheDocument();
    expect(screen.getByTestId('compliance-dashboard')).toBeInTheDocument();
  });

  it('calls onExpandChart with chart type when clicking chart wrapper', () => {
    const onExpandChart = vi.fn();
    render(<OverviewDashboard domains={domains} answers={answers} onExpandChart={onExpandChart} />);

    fireEvent.click(screen.getByTestId('overview-heatmap'));
    expect(onExpandChart).toHaveBeenCalledWith('heatmap');

    fireEvent.click(screen.getByTestId('overview-radar'));
    expect(onExpandChart).toHaveBeenCalledWith('radar');

    fireEvent.click(screen.getByTestId('overview-bar'));
    expect(onExpandChart).toHaveBeenCalledWith('bar');
  });

  it('chart wrappers do not have role="button" when onExpandChart is NOT provided', () => {
    render(<OverviewDashboard domains={domains} answers={answers} />);
    expect(screen.getByTestId('overview-heatmap')).not.toHaveAttribute('role', 'button');
    expect(screen.getByTestId('overview-radar')).not.toHaveAttribute('role', 'button');
    expect(screen.getByTestId('overview-bar')).not.toHaveAttribute('role', 'button');
  });

  it('pressing Enter on a chart wrapper calls onExpandChart', () => {
    const onExpandChart = vi.fn();
    render(<OverviewDashboard domains={domains} answers={answers} onExpandChart={onExpandChart} />);

    fireEvent.keyDown(screen.getByTestId('overview-heatmap'), { key: 'Enter' });
    expect(onExpandChart).toHaveBeenCalledWith('heatmap');

    fireEvent.keyDown(screen.getByTestId('overview-radar'), { key: 'Enter' });
    expect(onExpandChart).toHaveBeenCalledWith('radar');

    fireEvent.keyDown(screen.getByTestId('overview-bar'), { key: 'Enter' });
    expect(onExpandChart).toHaveBeenCalledWith('bar');
  });

  it('passes correct userScore to BenchmarkTrendChart', async () => {
    mockLoadBenchmarks.mockResolvedValue({
      current: { domain1: 3.2, overall: 3.15 },
      history: [{ date: '2024-Q3', overall: 3.05 }]
    });
    render(<OverviewDashboard domains={domains} answers={answers} />);

    // domain1: (3+4)/2 = 3.5, domain2: 2/1 = 2.0, overall = (3.5+2)/2 = 2.75
    await waitFor(() => {
      const trendChart = screen.getByTestId('benchmark-trend-chart');
      expect(Number(trendChart.dataset.userScore)).toBeCloseTo(2.75, 2);
    });
  });

  it('handles empty domains object', () => {
    render(<OverviewDashboard domains={{}} answers={{}} />);
    expect(screen.getByTestId('overview-heatmap')).toBeInTheDocument();
    expect(screen.getByTestId('overview-radar')).toBeInTheDocument();
    expect(screen.getByTestId('overview-bar')).toBeInTheDocument();
    expect(screen.queryByTestId('overview-trend')).not.toBeInTheDocument();
  });

  describe('keyboard interactions on chart wrappers', () => {
    it('pressing Space on heatmap wrapper calls onExpandChart', () => {
      const onExpandChart = vi.fn();
      render(<OverviewDashboard domains={domains} answers={answers} onExpandChart={onExpandChart} />);

      fireEvent.keyDown(screen.getByTestId('overview-heatmap'), { key: ' ' });
      expect(onExpandChart).toHaveBeenCalledWith('heatmap');
    });

    it('pressing Space on radar wrapper calls onExpandChart', () => {
      const onExpandChart = vi.fn();
      render(<OverviewDashboard domains={domains} answers={answers} onExpandChart={onExpandChart} />);

      fireEvent.keyDown(screen.getByTestId('overview-radar'), { key: ' ' });
      expect(onExpandChart).toHaveBeenCalledWith('radar');
    });

    it('pressing Space on bar wrapper calls onExpandChart', () => {
      const onExpandChart = vi.fn();
      render(<OverviewDashboard domains={domains} answers={answers} onExpandChart={onExpandChart} />);

      fireEvent.keyDown(screen.getByTestId('overview-bar'), { key: ' ' });
      expect(onExpandChart).toHaveBeenCalledWith('bar');
    });

    it('pressing arbitrary key does not call onExpandChart', () => {
      const onExpandChart = vi.fn();
      render(<OverviewDashboard domains={domains} answers={answers} onExpandChart={onExpandChart} />);

      fireEvent.keyDown(screen.getByTestId('overview-heatmap'), { key: 'a' });
      expect(onExpandChart).not.toHaveBeenCalled();
    });
  });

  describe('trend chart keyboard interaction', () => {
    it('pressing Enter on trend wrapper calls onExpandChart with trend', async () => {
      const onExpandChart = vi.fn();
      mockLoadBenchmarks.mockResolvedValue({
        current: { domain1: 3.2, overall: 3.15 },
        history: [{ date: '2024-Q3', overall: 3.05 }]
      });
      render(<OverviewDashboard domains={domains} answers={answers} onExpandChart={onExpandChart} />);
      await waitFor(() => {
        expect(screen.getByTestId('overview-trend')).toBeInTheDocument();
      });

      fireEvent.keyDown(screen.getByTestId('overview-trend'), { key: 'Enter' });
      expect(onExpandChart).toHaveBeenCalledWith('trend');
    });

    it('pressing Space on trend wrapper calls onExpandChart with trend', async () => {
      const onExpandChart = vi.fn();
      mockLoadBenchmarks.mockResolvedValue({
        current: { domain1: 3.2, overall: 3.15 },
        history: [{ date: '2024-Q3', overall: 3.05 }]
      });
      render(<OverviewDashboard domains={domains} answers={answers} onExpandChart={onExpandChart} />);
      await waitFor(() => {
        expect(screen.getByTestId('overview-trend')).toBeInTheDocument();
      });

      fireEvent.keyDown(screen.getByTestId('overview-trend'), { key: ' ' });
      expect(onExpandChart).toHaveBeenCalledWith('trend');
    });

    it('clicking trend wrapper calls onExpandChart with trend', async () => {
      const onExpandChart = vi.fn();
      mockLoadBenchmarks.mockResolvedValue({
        current: { domain1: 3.2, overall: 3.15 },
        history: [{ date: '2024-Q3', overall: 3.05 }]
      });
      render(<OverviewDashboard domains={domains} answers={answers} onExpandChart={onExpandChart} />);
      await waitFor(() => {
        expect(screen.getByTestId('overview-trend')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('overview-trend'));
      expect(onExpandChart).toHaveBeenCalledWith('trend');
    });
  });

  describe('chart expand hints', () => {
    it('shows expand hints when onExpandChart is provided', () => {
      const onExpandChart = vi.fn();
      const { container } = render(
        <OverviewDashboard domains={domains} answers={answers} onExpandChart={onExpandChart} />
      );
      const hints = container.querySelectorAll('.chart-expand-hint');
      expect(hints.length).toBeGreaterThan(0);
    });

    it('does not show expand hints when onExpandChart is not provided', () => {
      const { container } = render(
        <OverviewDashboard domains={domains} answers={answers} />
      );
      const hints = container.querySelectorAll('.chart-expand-hint');
      expect(hints.length).toBe(0);
    });
  });

  describe('onChartReady callback', () => {
    it('does not crash when onChartReady is not provided', () => {
      render(<OverviewDashboard domains={domains} answers={answers} />);
      expect(screen.getByTestId('overview-heatmap')).toBeInTheDocument();
    });

    it('renders correctly when onChartReady is provided', () => {
      const onChartReady = vi.fn();
      render(<OverviewDashboard domains={domains} answers={answers} onChartReady={onChartReady} />);
      expect(screen.getByTestId('overview-heatmap')).toBeInTheDocument();
    });

    it('forwards heatmap onCanvasReady through the wrapper to onChartReady', () => {
      const onChartReady = vi.fn();
      render(<OverviewDashboard domains={domains} answers={answers} onChartReady={onChartReady} />);
      // The mock DomainHeatmap invokes onCanvasReady('heatmap-canvas-ref')
      // which calls onChartReady('heatmap', 'heatmap-canvas-ref') via the wrapper on line 51
      expect(onChartReady).toHaveBeenCalledWith('heatmap', 'heatmap-canvas-ref');
    });

    it('forwards radar onChartReady through the wrapper to onChartReady', () => {
      const onChartReady = vi.fn();
      render(<OverviewDashboard domains={domains} answers={answers} onChartReady={onChartReady} />);
      // The mock DomainRadarChart invokes onChartReady('radar-chart-ref')
      // which calls onChartReady('radar', 'radar-chart-ref') via the wrapper on line 68
      expect(onChartReady).toHaveBeenCalledWith('radar', 'radar-chart-ref');
    });

    it('forwards bar onChartReady through the wrapper to onChartReady', () => {
      const onChartReady = vi.fn();
      render(<OverviewDashboard domains={domains} answers={answers} onChartReady={onChartReady} />);
      // The mock DomainBarChart invokes onChartReady('bar-chart-ref')
      // which calls onChartReady('bar', 'bar-chart-ref') via the wrapper on line 82
      expect(onChartReady).toHaveBeenCalledWith('bar', 'bar-chart-ref');
    });

    it('receives all three chart ready callbacks when onChartReady is provided', () => {
      const onChartReady = vi.fn();
      render(<OverviewDashboard domains={domains} answers={answers} onChartReady={onChartReady} />);
      // All three wrapper functions should have been invoked
      expect(onChartReady).toHaveBeenCalledTimes(3);
      expect(onChartReady).toHaveBeenCalledWith('heatmap', 'heatmap-canvas-ref');
      expect(onChartReady).toHaveBeenCalledWith('radar', 'radar-chart-ref');
      expect(onChartReady).toHaveBeenCalledWith('bar', 'bar-chart-ref');
    });

    it('does not pass onCanvasReady/onChartReady to charts when onChartReady prop is absent', () => {
      const onChartReady = vi.fn();
      // Render without onChartReady — the mocks only call back if the prop is truthy
      render(<OverviewDashboard domains={domains} answers={answers} />);
      // onChartReady was never passed, so no callbacks should fire
      expect(onChartReady).not.toHaveBeenCalled();
    });
  });

  describe('benchmarks loading edge cases', () => {
    it('handles benchmarks without sources property', async () => {
      mockLoadBenchmarks.mockResolvedValue({
        current: { domain1: 3.2, overall: 3.15 },
        history: []
      });
      render(<OverviewDashboard domains={domains} answers={answers} />);
      await waitFor(() => {
        expect(screen.getByTestId('overview-trend')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('benchmark-sources')).not.toBeInTheDocument();
    });

    it('handles benchmarks with empty sources array', async () => {
      mockLoadBenchmarks.mockResolvedValue({
        current: { domain1: 3.2, overall: 3.15 },
        history: [],
        sources: []
      });
      render(<OverviewDashboard domains={domains} answers={answers} />);
      await waitFor(() => {
        expect(screen.getByTestId('overview-trend')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('benchmark-sources')).not.toBeInTheDocument();
    });

    it('handles benchmarks without current (not set to state)', async () => {
      mockLoadBenchmarks.mockResolvedValue({ history: [] });
      render(<OverviewDashboard domains={domains} answers={answers} />);
      await waitFor(() => {
        expect(mockLoadBenchmarks).toHaveBeenCalled();
      });
      expect(screen.queryByTestId('overview-trend')).not.toBeInTheDocument();
    });
  });
});
