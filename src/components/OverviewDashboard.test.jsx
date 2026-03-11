import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OverviewDashboard } from './OverviewDashboard';

vi.mock('./DomainHeatmap', () => ({
  DomainHeatmap: () => <div data-testid="domain-heatmap">Heatmap</div>
}));
vi.mock('./DomainRadarChart', () => ({
  DomainRadarChart: () => <div data-testid="domain-radar-chart">Radar Chart</div>
}));
vi.mock('./DomainBarChart', () => ({
  DomainBarChart: () => <div data-testid="domain-bar-chart">Bar Chart</div>
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
});
