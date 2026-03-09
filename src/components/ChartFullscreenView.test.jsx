import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChartFullscreenView } from './ChartFullscreenView';

// Minimal stubs for heavy chart dependencies
vi.mock('./DomainHeatmap', () => ({
  DomainHeatmap: () => <div data-testid="mock-heatmap">Heatmap</div>
}));
vi.mock('./DomainRadarChart', () => ({
  DomainRadarChart: () => <div data-testid="mock-radar">Radar</div>
}));
vi.mock('./DomainBarChart', () => ({
  DomainBarChart: () => <div data-testid="mock-bar">Bar</div>
}));
vi.mock('./BenchmarkTrendChart', () => ({
  BenchmarkTrendChart: () => <div data-testid="mock-trend">Trend</div>
}));
vi.mock('../services/dataService', () => ({
  dataService: { loadBenchmarks: () => Promise.resolve(null) }
}));

const mockQuestions = [
  { id: 'q1', text: 'Q1', domainId: 'd1', domainTitle: 'Domain 1', categoryId: 'c1', categoryTitle: 'Cat 1' },
  { id: 'q2', text: 'Q2', domainId: 'd1', domainTitle: 'Domain 1', categoryId: 'c1', categoryTitle: 'Cat 1' }
];
const mockAnswers = { q1: 3, q2: 4 };

describe('ChartFullscreenView', () => {
  let onBack;
  beforeEach(() => { onBack = vi.fn(); });

  it('renders the header with back button and chart title', () => {
    render(
      <ChartFullscreenView chartType="heatmap" questions={mockQuestions} answers={mockAnswers} onBack={onBack} />
    );
    expect(screen.getByTestId('chart-fullscreen-view')).toBeInTheDocument();
    expect(screen.getByTestId('chart-fullscreen-back')).toBeInTheDocument();
    // heading h2 contains the chart label
    expect(screen.getByRole('heading', { name: /Heatmap/i })).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    render(
      <ChartFullscreenView chartType="radar" questions={mockQuestions} answers={mockAnswers} onBack={onBack} />
    );
    fireEvent.click(screen.getByTestId('chart-fullscreen-back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders heatmap chart for chartType=heatmap', () => {
    render(
      <ChartFullscreenView chartType="heatmap" questions={mockQuestions} answers={mockAnswers} onBack={onBack} />
    );
    expect(screen.getByTestId('mock-heatmap')).toBeInTheDocument();
  });

  it('renders radar chart for chartType=radar', () => {
    render(
      <ChartFullscreenView chartType="radar" questions={mockQuestions} answers={mockAnswers} onBack={onBack} />
    );
    expect(screen.getByTestId('mock-radar')).toBeInTheDocument();
  });

  it('renders bar chart for chartType=bar', () => {
    render(
      <ChartFullscreenView chartType="bar" questions={mockQuestions} answers={mockAnswers} onBack={onBack} />
    );
    expect(screen.getByTestId('mock-bar')).toBeInTheDocument();
  });

  it('renders trend chart for chartType=trend', () => {
    render(
      <ChartFullscreenView chartType="trend" questions={mockQuestions} answers={mockAnswers} onBack={onBack} />
    );
    expect(screen.getByTestId('mock-trend')).toBeInTheDocument();
  });

  it('renders fallback message for unknown chartType', () => {
    render(
      <ChartFullscreenView chartType="unknown" questions={[]} answers={{}} onBack={onBack} />
    );
    expect(screen.getByText(/Unknown chart type/i)).toBeInTheDocument();
  });

  it('shows overall score in header', () => {
    render(
      <ChartFullscreenView chartType="bar" questions={mockQuestions} answers={mockAnswers} onBack={onBack} />
    );
    // Score should be 3.5 average of [3, 4]
    expect(screen.getByText('3.50')).toBeInTheDocument();
  });

  it('handles empty questions array', () => {
    render(
      <ChartFullscreenView chartType="radar" questions={[]} answers={{}} onBack={onBack} />
    );
    expect(screen.getByTestId('chart-fullscreen-view')).toBeInTheDocument();
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });

  it('renders toolbar', () => {
    render(
      <ChartFullscreenView chartType="radar" questions={mockQuestions} answers={mockAnswers} onBack={onBack} />
    );
    expect(screen.getByTestId('cfs-toolbar')).toBeInTheDocument();
  });

  it('shows benchmark toggles for radar chart', () => {
    render(
      <ChartFullscreenView chartType="radar" questions={mockQuestions} answers={mockAnswers} onBack={onBack} />
    );
    expect(screen.getByTestId('cfs-toggle-industry-avg')).toBeInTheDocument();
    expect(screen.getByTestId('cfs-toggle-top-quartile')).toBeInTheDocument();
  });

  it('shows domain chips for radar chart', () => {
    render(
      <ChartFullscreenView chartType="radar" questions={mockQuestions} answers={mockAnswers} onBack={onBack} />
    );
    expect(screen.getByTestId('cfs-domain-chip-d1')).toBeInTheDocument();
  });

  it('shows time range controls for trend chart', () => {
    render(
      <ChartFullscreenView chartType="trend" questions={mockQuestions} answers={mockAnswers} onBack={onBack} />
    );
    expect(screen.getByTestId('cfs-trend-all')).toBeInTheDocument();
    expect(screen.getByTestId('cfs-trend-recent')).toBeInTheDocument();
  });

  it('shows PNG export button', () => {
    render(
      <ChartFullscreenView chartType="bar" questions={mockQuestions} answers={mockAnswers} onBack={onBack} />
    );
    expect(screen.getByTestId('cfs-export-png')).toBeInTheDocument();
  });

  it('toggles Industry Avg button active state', () => {
    render(
      <ChartFullscreenView chartType="bar" questions={mockQuestions} answers={mockAnswers} onBack={onBack} />
    );
    const btn = screen.getByTestId('cfs-toggle-industry-avg');
    expect(btn).toHaveClass('active');
    fireEvent.click(btn);
    expect(btn).not.toHaveClass('active');
  });

  it('shows target slider when target toggle is enabled for radar', () => {
    render(
      <ChartFullscreenView chartType="radar" questions={mockQuestions} answers={mockAnswers} onBack={onBack} />
    );
    const targetBtn = screen.getByTestId('cfs-toggle-target');
    expect(screen.queryByTestId('cfs-target-slider')).not.toBeInTheDocument();
    fireEvent.click(targetBtn);
    expect(screen.getByTestId('cfs-target-slider')).toBeInTheDocument();
  });
});
