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

  it('should render 4 labels (3 history + current)', () => {
    render(<BenchmarkTrendChart benchmarks={mockBenchmarks} />);
    const chart = screen.getByTestId('line-chart');
    const labels = JSON.parse(chart.dataset.labels);
    expect(labels).toHaveLength(4);
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
});
