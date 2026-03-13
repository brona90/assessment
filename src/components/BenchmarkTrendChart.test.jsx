import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BenchmarkTrendChart } from './BenchmarkTrendChart';

vi.mock('react-chartjs-2', () => ({
  Line: ({ data }) => (
    <div data-testid="line-chart" data-labels={JSON.stringify(data.labels)}
      data-datasets={data.datasets.length} />
  )
}));

const mockBenchmarks = {
  current: {
    source: 'Industry Average 2024 Q4',
    industry: 'Financial Services',
    overall: 3.15,
    domain1: 3.2
  },
  history: [
    { date: '2024-Q1', overall: 2.85, domain1: 2.9 },
    { date: '2024-Q2', overall: 2.95, domain1: 3.0 },
    { date: '2024-Q3', overall: 3.05, domain1: 3.1 }
  ]
};

describe('BenchmarkTrendChart', () => {
  it('should render the line chart when benchmarks have history', () => {
    render(<BenchmarkTrendChart benchmarks={mockBenchmarks} />);
    expect(screen.getByTestId('benchmark-trend-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('should show empty state when no benchmarks provided', () => {
    render(<BenchmarkTrendChart benchmarks={null} />);
    expect(screen.getByTestId('trend-chart-empty')).toBeInTheDocument();
  });

  it('should show empty state when history is empty', () => {
    render(<BenchmarkTrendChart benchmarks={{ current: {}, history: [] }} />);
    expect(screen.getByTestId('trend-chart-empty')).toBeInTheDocument();
  });

  it('should render labels from history entries', () => {
    render(<BenchmarkTrendChart benchmarks={mockBenchmarks} />);
    const chart = screen.getByTestId('line-chart');
    const labels = JSON.parse(chart.dataset.labels);
    expect(labels).toHaveLength(3);
    expect(labels).toContain('2024-Q1');
    expect(labels).toContain('2024-Q3');
  });

  it('should use one dataset when no userScore provided', () => {
    render(<BenchmarkTrendChart benchmarks={mockBenchmarks} />);
    const chart = screen.getByTestId('line-chart');
    expect(Number(chart.dataset.datasets)).toBe(1);
  });

  it('should add a second dataset when userScore is provided', () => {
    render(<BenchmarkTrendChart benchmarks={mockBenchmarks} userScore={3.5} />);
    const chart = screen.getByTestId('line-chart');
    expect(Number(chart.dataset.datasets)).toBe(2);
  });

  it('should sort history chronologically (oldest first)', () => {
    const shuffledBenchmarks = {
      ...mockBenchmarks,
      history: [
        { date: '2024-Q3', overall: 3.05 },
        { date: '2024-Q1', overall: 2.85 },
        { date: '2024-Q2', overall: 2.95 }
      ]
    };
    render(<BenchmarkTrendChart benchmarks={shuffledBenchmarks} />);
    const chart = screen.getByTestId('line-chart');
    const labels = JSON.parse(chart.dataset.labels);
    expect(labels[0]).toBe('2024-Q1');
    expect(labels[1]).toBe('2024-Q2');
    expect(labels[2]).toBe('2024-Q3');
  });

  it('should slice to last 4 entries when trendRange is "recent" and more than 4 history items', () => {
    const longHistory = {
      ...mockBenchmarks,
      history: [
        { date: '2023-Q1', overall: 2.5 },
        { date: '2023-Q2', overall: 2.6 },
        { date: '2023-Q3', overall: 2.7 },
        { date: '2023-Q4', overall: 2.8 },
        { date: '2024-Q1', overall: 2.9 }
      ]
    };
    render(<BenchmarkTrendChart benchmarks={longHistory} trendRange="recent" />);
    const chart = screen.getByTestId('line-chart');
    const labels = JSON.parse(chart.dataset.labels);
    expect(labels).toHaveLength(4);
    expect(labels[0]).toBe('2023-Q2');
    expect(labels[3]).toBe('2024-Q1');
  });

  it('should include topQuartile dataset when topQ values exist and showTopQuartile is not false', () => {
    const benchmarksWithTopQ = {
      ...mockBenchmarks,
      history: [
        { date: '2024-Q1', overall: 2.85, topQuartileOverall: 4.0 },
        { date: '2024-Q2', overall: 2.95, topQuartileOverall: 4.1 },
        { date: '2024-Q3', overall: 3.05, topQuartileOverall: 4.2 }
      ]
    };
    render(<BenchmarkTrendChart benchmarks={benchmarksWithTopQ} showTopQuartile={true} />);
    const chart = screen.getByTestId('line-chart');
    // Industry Avg + Top Quartile = 2 datasets
    expect(Number(chart.dataset.datasets)).toBe(2);
  });

  it('should omit topQuartile dataset when showTopQuartile is false', () => {
    const benchmarksWithTopQ = {
      ...mockBenchmarks,
      history: [
        { date: '2024-Q1', overall: 2.85, topQuartileOverall: 4.0 },
        { date: '2024-Q2', overall: 2.95, topQuartileOverall: 4.1 }
      ]
    };
    render(<BenchmarkTrendChart benchmarks={benchmarksWithTopQ} showTopQuartile={false} />);
    const chart = screen.getByTestId('line-chart');
    // Only Industry Avg, topQuartile suppressed
    expect(Number(chart.dataset.datasets)).toBe(1);
  });

  it('should omit topQuartile dataset when all topQ values are null', () => {
    const benchmarksNullTopQ = {
      ...mockBenchmarks,
      history: [
        { date: '2024-Q1', overall: 2.85, topQuartileOverall: null },
        { date: '2024-Q2', overall: 2.95, topQuartileOverall: null }
      ]
    };
    render(<BenchmarkTrendChart benchmarks={benchmarksNullTopQ} showTopQuartile={true} />);
    const chart = screen.getByTestId('line-chart');
    expect(Number(chart.dataset.datasets)).toBe(1);
  });

  it('should omit industryAvg dataset when showIndustryAvg is false', () => {
    render(<BenchmarkTrendChart benchmarks={mockBenchmarks} showIndustryAvg={false} />);
    const chart = screen.getByTestId('line-chart');
    expect(Number(chart.dataset.datasets)).toBe(0);
  });

  it('should pass ref callback when onChartReady is provided', () => {
    const onChartReady = vi.fn();
    render(<BenchmarkTrendChart benchmarks={mockBenchmarks} onChartReady={onChartReady} />);
    expect(screen.getByTestId('benchmark-trend-chart')).toBeInTheDocument();
  });

  it('should not pass ref when onChartReady is not provided', () => {
    render(<BenchmarkTrendChart benchmarks={mockBenchmarks} />);
    expect(screen.getByTestId('benchmark-trend-chart')).toBeInTheDocument();
  });

  it('should use label when available instead of date', () => {
    const benchmarksWithLabels = {
      history: [
        { date: '2024-Q1', label: 'Q1 2024', overall: 2.85 },
        { date: '2024-Q2', label: 'Q2 2024', overall: 2.95 }
      ]
    };
    render(<BenchmarkTrendChart benchmarks={benchmarksWithLabels} />);
    const chart = screen.getByTestId('line-chart');
    const labels = JSON.parse(chart.dataset.labels);
    expect(labels[0]).toBe('Q1 2024');
    expect(labels[1]).toBe('Q2 2024');
  });

  it('should show empty state when benchmarks.history is missing', () => {
    render(<BenchmarkTrendChart benchmarks={{ current: {} }} />);
    expect(screen.getByTestId('trend-chart-empty')).toBeInTheDocument();
  });
});
