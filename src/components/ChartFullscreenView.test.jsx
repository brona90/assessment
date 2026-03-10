import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { ChartFullscreenView } from './ChartFullscreenView';

// Capture chart/canvas callbacks for PNG export tests
let capturedChartReady = null;
let capturedCanvasReady = null;

// Minimal stubs for heavy chart dependencies
vi.mock('./DomainHeatmap', () => ({
  DomainHeatmap: ({ onCanvasReady }) => {
    if (onCanvasReady) capturedCanvasReady = onCanvasReady;
    return <div data-testid="mock-heatmap">Heatmap</div>;
  }
}));
vi.mock('./DomainRadarChart', () => ({
  DomainRadarChart: () => <div data-testid="mock-radar">Radar</div>
}));
vi.mock('./DomainBarChart', () => ({
  DomainBarChart: ({ onChartReady }) => {
    if (onChartReady) capturedChartReady = onChartReady;
    return <div data-testid="mock-bar">Bar</div>;
  }
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
  beforeEach(() => {
    onBack = vi.fn();
    capturedChartReady = null;
    capturedCanvasReady = null;
  });

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

  it('renders toolbar toggle button in header', () => {
    render(
      <ChartFullscreenView chartType="radar" questions={mockQuestions} answers={mockAnswers} onBack={onBack} />
    );
    expect(screen.getByTestId('cfs-toolbar-toggle')).toBeInTheDocument();
  });

  it('toolbar toggle button hides and shows toolbar', () => {
    render(
      <ChartFullscreenView chartType="radar" questions={mockQuestions} answers={mockAnswers} onBack={onBack} />
    );
    const toolbar = screen.getByTestId('cfs-toolbar');
    const toggle = screen.getByTestId('cfs-toolbar-toggle');

    // Starts open — no closed class
    expect(toolbar).not.toHaveClass('cfs-toolbar--closed');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(toggle);
    expect(toolbar).toHaveClass('cfs-toolbar--closed');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);
    expect(toolbar).not.toHaveClass('cfs-toolbar--closed');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
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

  it('top quartile toggle becomes inactive after click', () => {
    render(
      <ChartFullscreenView chartType="bar" questions={mockQuestions} answers={mockAnswers} onBack={onBack} />
    );
    const btn = screen.getByTestId('cfs-toggle-top-quartile');
    expect(btn).toHaveClass('active');
    fireEvent.click(btn);
    expect(btn).not.toHaveClass('active');
  });

  it('does not show benchmark toggles for heatmap', () => {
    render(
      <ChartFullscreenView chartType="heatmap" questions={mockQuestions} answers={mockAnswers} onBack={onBack} />
    );
    expect(screen.queryByTestId('cfs-toggle-industry-avg')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cfs-toggle-top-quartile')).not.toBeInTheDocument();
  });

  it('does not show target toggle for trend chart', () => {
    render(
      <ChartFullscreenView chartType="trend" questions={mockQuestions} answers={mockAnswers} onBack={onBack} />
    );
    expect(screen.queryByTestId('cfs-toggle-target')).not.toBeInTheDocument();
  });

  it('trend range buttons toggle active state', () => {
    render(
      <ChartFullscreenView chartType="trend" questions={mockQuestions} answers={mockAnswers} onBack={onBack} />
    );
    const allBtn = screen.getByTestId('cfs-trend-all');
    const recentBtn = screen.getByTestId('cfs-trend-recent');

    expect(allBtn).toHaveClass('active');
    expect(recentBtn).not.toHaveClass('active');

    fireEvent.click(recentBtn);
    expect(recentBtn).toHaveClass('active');
    expect(allBtn).not.toHaveClass('active');

    fireEvent.click(allBtn);
    expect(allBtn).toHaveClass('active');
    expect(recentBtn).not.toHaveClass('active');
  });

  describe('domain chip toggling', () => {
    const multiDomainQuestions = [
      { id: 'qa', domainId: 'da', domainTitle: 'Alpha Domain', categoryId: 'c1', categoryTitle: 'Cat 1' },
      { id: 'qb', domainId: 'db', domainTitle: 'Beta Domain', categoryId: 'c2', categoryTitle: 'Cat 2' }
    ];

    it('renders a chip for each domain', () => {
      render(
        <ChartFullscreenView chartType="radar" questions={multiDomainQuestions} answers={{}} onBack={onBack} />
      );
      expect(screen.getByTestId('cfs-domain-chip-da')).toBeInTheDocument();
      expect(screen.getByTestId('cfs-domain-chip-db')).toBeInTheDocument();
    });

    it('chip gets hidden class on first click', () => {
      render(
        <ChartFullscreenView chartType="bar" questions={multiDomainQuestions} answers={{}} onBack={onBack} />
      );
      const chip = screen.getByTestId('cfs-domain-chip-da');
      expect(chip).not.toHaveClass('hidden');
      fireEvent.click(chip);
      expect(chip).toHaveClass('hidden');
    });

    it('chip loses hidden class on second click', () => {
      render(
        <ChartFullscreenView chartType="bar" questions={multiDomainQuestions} answers={{}} onBack={onBack} />
      );
      const chip = screen.getByTestId('cfs-domain-chip-da');
      fireEvent.click(chip); // hide
      fireEvent.click(chip); // show again
      expect(chip).not.toHaveClass('hidden');
    });

    it('does not show domain chips for trend chart', () => {
      render(
        <ChartFullscreenView chartType="trend" questions={multiDomainQuestions} answers={{}} onBack={onBack} />
      );
      expect(screen.queryByTestId('cfs-domain-chip-da')).not.toBeInTheDocument();
    });
  });

  describe('PNG export', () => {
    it('clicking PNG export does not throw when no chart or canvas instance', () => {
      render(
        <ChartFullscreenView chartType="radar" questions={mockQuestions} answers={mockAnswers} onBack={onBack} />
      );
      expect(() => fireEvent.click(screen.getByTestId('cfs-export-png'))).not.toThrow();
    });

    it('PNG export creates a download link when chart instance is ready', () => {
      render(
        <ChartFullscreenView chartType="bar" questions={mockQuestions} answers={mockAnswers} onBack={onBack} />
      );

      const fakeChart = { toBase64Image: vi.fn().mockReturnValue('data:image/png;base64,abc') };
      act(() => { capturedChartReady?.(fakeChart); });

      const mockAnchor = { href: '', download: '', click: vi.fn() };
      const spy = vi.spyOn(document, 'createElement').mockReturnValueOnce(mockAnchor);

      fireEvent.click(screen.getByTestId('cfs-export-png'));

      expect(fakeChart.toBase64Image).toHaveBeenCalled();
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockAnchor.download).toBe('chart-bar.png');

      spy.mockRestore();
    });

    it('PNG export for heatmap uses canvas toDataURL', () => {
      render(
        <ChartFullscreenView chartType="heatmap" questions={mockQuestions} answers={mockAnswers} onBack={onBack} />
      );

      const fakeCanvas = { toDataURL: vi.fn().mockReturnValue('data:image/png;base64,heatmap') };
      act(() => { capturedCanvasReady?.(fakeCanvas); });

      const mockAnchor = { href: '', download: '', click: vi.fn() };
      const spy = vi.spyOn(document, 'createElement').mockReturnValueOnce(mockAnchor);

      fireEvent.click(screen.getByTestId('cfs-export-png'));

      expect(fakeCanvas.toDataURL).toHaveBeenCalledWith('image/png');
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockAnchor.download).toBe('chart-heatmap.png');

      spy.mockRestore();
    });
  });
});
