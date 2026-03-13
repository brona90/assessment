import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResultsView } from './ResultsView';

vi.mock('./DomainRadarChart', () => ({
  DomainRadarChart: ({ benchmarks, domains, answers }) => (
    <div data-testid="domain-radar-chart"
      data-has-benchmarks={!!benchmarks}
      data-domain-count={domains ? Object.keys(domains).length : 0}
      data-answer-count={answers ? Object.keys(answers).length : 0}>Radar Chart</div>
  )
}));
vi.mock('./DomainBarChart', () => ({
  DomainBarChart: ({ benchmarks, domains, answers }) => (
    <div data-testid="domain-bar-chart"
      data-has-benchmarks={!!benchmarks}
      data-domain-count={domains ? Object.keys(domains).length : 0}
      data-answer-count={answers ? Object.keys(answers).length : 0}>Bar Chart</div>
  )
}));
vi.mock('./DomainHeatmap', () => ({
  DomainHeatmap: ({ domains, answers }) => (
    <div data-testid="domain-heatmap"
      data-domain-count={domains ? Object.keys(domains).length : 0}
      data-answer-count={answers ? Object.keys(answers).length : 0}>Heatmap</div>
  )
}));
vi.mock('./BenchmarkTrendChart', () => ({
  BenchmarkTrendChart: ({ benchmarks, userScore }) => (
    <div data-testid="benchmark-trend-chart"
      data-has-benchmarks={!!benchmarks}
      data-user-score={userScore}>Trend Chart</div>
  )
}));
vi.mock('./ComplianceDashboard', () => ({
  ComplianceDashboard: () => <div data-testid="compliance-dashboard">Compliance</div>
}));

const mockLoadBenchmarks = vi.fn().mockResolvedValue({
  current: { domain1: 3.2, domain2: 3.5, industry: 'Financial Services', overall: 3.15 },
  history: [{ date: '2024-Q3', overall: 3.05 }]
});

vi.mock('../services/dataService', () => ({
  dataService: { loadBenchmarks: (...args) => mockLoadBenchmarks(...args) }
}));

describe('ResultsView', () => {
  const mockUser = { id: 'user1', name: 'John Doe' };

  const mockQuestions = [
    { id: 'q1', domainId: 'domain1', domainTitle: 'Test Domain', categoryId: 'cat1', categoryTitle: 'Test Category' },
    { id: 'q2', domainId: 'domain1', domainTitle: 'Test Domain', categoryId: 'cat1', categoryTitle: 'Test Category' },
    { id: 'q3', domainId: 'domain1', domainTitle: 'Test Domain', categoryId: 'cat1', categoryTitle: 'Test Category' }
  ];

  const mockAnswers = { q1: 3, q2: 4 };
  const mockProgress = { answered: 2, total: 3, percentage: 67 };
  const mockOnBack = vi.fn();
  const mockOnLogout = vi.fn();

  const defaultProps = {
    user: mockUser,
    questions: mockQuestions,
    answers: mockAnswers,
    progress: mockProgress,
    onBackToAssessment: mockOnBack,
    onLogout: mockOnLogout
  };

  it('should render the results view', () => {
    render(<ResultsView {...defaultProps} />);
    expect(screen.getByTestId('results-view')).toBeInTheDocument();
  });

  it('should display user name', () => {
    render(<ResultsView {...defaultProps} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should show answered and total question counts', () => {
    render(<ResultsView {...defaultProps} />);
    expect(screen.getByText('2 of 3 questions answered')).toBeInTheDocument();
  });

  it('should show progress percentage', () => {
    render(<ResultsView {...defaultProps} />);
    expect(screen.getByText('67%')).toBeInTheDocument();
  });

  it('should show next steps section when not 100% complete', () => {
    render(<ResultsView {...defaultProps} />);
    expect(screen.getByText('Next Steps')).toBeInTheDocument();
    expect(screen.getByText('You have 1 questions remaining.')).toBeInTheDocument();
  });

  it('should not show next steps when 100% complete', () => {
    render(<ResultsView {...defaultProps} progress={{ answered: 3, total: 3, percentage: 100 }} />);
    expect(screen.queryByText('Next Steps')).not.toBeInTheDocument();
  });

  it('should call onBackToAssessment when back button is clicked', () => {
    render(<ResultsView {...defaultProps} />);
    fireEvent.click(screen.getByTestId('back-to-assessment'));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('should call onLogout when logout button is clicked', () => {
    render(<ResultsView {...defaultProps} />);
    fireEvent.click(screen.getByTestId('logout-btn'));
    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it('should render heatmap chart with correct domain and answer counts', () => {
    render(<ResultsView {...defaultProps} />);
    const heatmap = screen.getByTestId('domain-heatmap');
    expect(heatmap).toBeInTheDocument();
    expect(Number(heatmap.dataset.domainCount)).toBe(1);
    expect(Number(heatmap.dataset.answerCount)).toBe(2);
  });

  it('should render radar chart with correct domain and answer counts', () => {
    render(<ResultsView {...defaultProps} />);
    const radar = screen.getByTestId('domain-radar-chart');
    expect(radar).toBeInTheDocument();
    expect(Number(radar.dataset.domainCount)).toBe(1);
    expect(Number(radar.dataset.answerCount)).toBe(2);
  });

  it('should render bar chart with correct domain and answer counts', () => {
    render(<ResultsView {...defaultProps} />);
    const bar = screen.getByTestId('domain-bar-chart');
    expect(bar).toBeInTheDocument();
    expect(Number(bar.dataset.domainCount)).toBe(1);
    expect(Number(bar.dataset.answerCount)).toBe(2);
  });

  it('should display overall score heading', () => {
    render(<ResultsView {...defaultProps} />);
    expect(screen.getByText('Overall Maturity Score')).toBeInTheDocument();
  });

  it('should show 0.00 overall score when no answers', () => {
    render(<ResultsView {...defaultProps} answers={{}} />);
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });

  it('should display a maturity label for overall score', () => {
    render(<ResultsView {...defaultProps} />);
    expect(screen.getByTestId('overall-maturity-label')).toBeInTheDocument();
  });

  it('should show correct maturity label for answered score', () => {
    // q1=3, q2=4 → avg 3.5 → Managed
    render(<ResultsView {...defaultProps} />);
    expect(screen.getByTestId('overall-maturity-label').textContent).toBe('Managed');
  });

  it('should show Not Implemented maturity label when no answers', () => {
    render(<ResultsView {...defaultProps} answers={{}} />);
    expect(screen.getByTestId('overall-maturity-label').textContent).toBe('Not Implemented');
  });

  it('should display domain title from assigned questions', () => {
    render(<ResultsView {...defaultProps} />);
    expect(screen.getAllByText('Test Domain').length).toBeGreaterThan(0);
  });

  it('should call onBackToAssessment when continue button is clicked', () => {
    render(<ResultsView {...defaultProps} />);
    fireEvent.click(screen.getByTestId('continue-assessment'));
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should pass benchmarks to radar chart after load', async () => {
    render(<ResultsView {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByTestId('domain-radar-chart').dataset.hasBenchmarks).toBe('true');
    });
  });

  it('should pass benchmarks to bar chart after load', async () => {
    render(<ResultsView {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByTestId('domain-bar-chart').dataset.hasBenchmarks).toBe('true');
    });
  });

  it('should render trend chart when benchmarks load', async () => {
    render(<ResultsView {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByTestId('benchmark-trend-chart')).toBeInTheDocument();
    });
  });

  it('should pass benchmarks and userScore to trend chart', async () => {
    render(<ResultsView {...defaultProps} />);
    await waitFor(() => {
      const chart = screen.getByTestId('benchmark-trend-chart');
      expect(chart.dataset.hasBenchmarks).toBe('true');
      expect(Number(chart.dataset.userScore)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Gap Analysis / Fix These First', () => {
    it('should render gap analysis section', () => {
      render(<ResultsView {...defaultProps} />);
      expect(screen.getByTestId('gap-analysis')).toBeInTheDocument();
    });

    it('should show gap items for answered questions below target', () => {
      // q1=3, q2=4 → q1 has priority > 0, q2 has priority 0
      render(<ResultsView {...defaultProps} />);
      expect(screen.getByTestId('gap-item-q1')).toBeInTheDocument();
    });

    it('should not show gap item for question at or above target', () => {
      render(<ResultsView {...defaultProps} answers={{ q1: 4, q2: 5 }} />);
      expect(screen.queryByTestId('gap-item-q1')).not.toBeInTheDocument();
      expect(screen.getByTestId('gap-none')).toBeInTheDocument();
    });

    it('should not show gap items for unanswered questions', () => {
      render(<ResultsView {...defaultProps} answers={{}} />);
      expect(screen.getByTestId('gap-none')).toBeInTheDocument();
    });

    it('should not show gap items for N/A questions', () => {
      render(<ResultsView {...defaultProps} answers={{ q1: 0, q2: 0 }} />);
      expect(screen.getByTestId('gap-none')).toBeInTheDocument();
    });

    it('should show at most 10 gap items', () => {
      const manyQuestions = Array.from({ length: 15 }, (_, i) => ({
        id: `q${i + 1}`,
        domainId: 'domain1',
        domainTitle: 'Test Domain',
        categoryId: 'cat1',
        categoryTitle: 'Test Category',
        text: `Question ${i + 1}`
      }));
      const manyAnswers = Object.fromEntries(manyQuestions.map(q => [q.id, 1]));
      render(<ResultsView {...defaultProps} questions={manyQuestions} answers={manyAnswers} />);
      const gapItems = screen.getAllByTestId(/^gap-item-/);
      expect(gapItems.length).toBeLessThanOrEqual(10);
    });

    it('should show a priority badge for each gap item', () => {
      render(<ResultsView {...defaultProps} />);
      expect(screen.getByTestId('priority-q1')).toBeInTheDocument();
    });

    it('should show High priority for score of 1 (gap=3)', () => {
      render(<ResultsView {...defaultProps} answers={{ q1: 1 }} />);
      expect(screen.getByTestId('priority-q1').textContent).toContain('High');
    });

    it('should show Medium priority for score of 3 (gap=1)', () => {
      render(<ResultsView {...defaultProps} answers={{ q1: 3 }} />);
      expect(screen.getByTestId('priority-q1').textContent).toContain('Medium');
    });

    it('should show Low priority for score near target', () => {
      const fractionalQ = [{ id: 'qx', domainId: 'domain1', domainTitle: 'D', categoryId: 'c', categoryTitle: 'C', text: 'X' }];
      render(<ResultsView {...defaultProps} questions={fractionalQ} answers={{ qx: 3.8 }} />);
      expect(screen.getByTestId('priority-qx').textContent).toContain('Low');
    });

    it('should include an icon in the priority badge', () => {
      render(<ResultsView {...defaultProps} answers={{ q1: 1 }} />);
      expect(screen.getByTestId('priority-q1').querySelector('svg')).toBeTruthy();
    });
  });

  describe('onExpandChart', () => {
    it('adds clickable class to charts when onExpandChart is provided', () => {
      const onExpandChart = vi.fn();
      const { container } = render(<ResultsView {...defaultProps} onExpandChart={onExpandChart} />);
      expect(container.querySelectorAll('.chart-display--clickable').length).toBeGreaterThan(0);
    });

    it('does not add clickable class without onExpandChart', () => {
      const { container } = render(<ResultsView {...defaultProps} />);
      expect(container.querySelectorAll('.chart-display--clickable').length).toBe(0);
    });

    it('clicking heatmap fires onExpandChart with heatmap', () => {
      const onExpandChart = vi.fn();
      render(<ResultsView {...defaultProps} onExpandChart={onExpandChart} />);
      fireEvent.click(screen.getByTestId('overview-heatmap'));
      expect(onExpandChart).toHaveBeenCalledWith('heatmap');
    });

    it('clicking radar container fires onExpandChart with radar', () => {
      const onExpandChart = vi.fn();
      render(<ResultsView {...defaultProps} onExpandChart={onExpandChart} />);
      fireEvent.click(screen.getByTestId('overview-radar'));
      expect(onExpandChart).toHaveBeenCalledWith('radar');
    });

    it('clicking bar container fires onExpandChart with bar', () => {
      const onExpandChart = vi.fn();
      render(<ResultsView {...defaultProps} onExpandChart={onExpandChart} />);
      fireEvent.click(screen.getByTestId('overview-bar'));
      expect(onExpandChart).toHaveBeenCalledWith('bar');
    });
  });

  describe('benchmark load failure', () => {
    beforeEach(() => {
      mockLoadBenchmarks.mockResolvedValue(null);
    });

    afterEach(() => {
      mockLoadBenchmarks.mockResolvedValue({
        current: { domain1: 3.2, domain2: 3.5, industry: 'Financial Services', overall: 3.15 },
        history: [{ date: '2024-Q3', overall: 3.05 }]
      });
    });

    it('renders without crashing when loadBenchmarks returns null', async () => {
      render(<ResultsView {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByTestId('results-view')).toBeInTheDocument();
      });
    });

    it('benchmarks stay null (no BenchmarkSources shown) when load returns null', async () => {
      render(<ResultsView {...defaultProps} />);
      await waitFor(() => {
        expect(screen.queryByTestId('benchmark-sources')).not.toBeInTheDocument();
      });
    });
  });

  describe('BenchmarkSources display', () => {
    beforeEach(() => {
      mockLoadBenchmarks.mockResolvedValue({
        current: { domain1: 3.2 },
        history: [],
        sources: [
          { id: 's1', publisher: 'DORA', report: 'Accelerate State of DevOps', year: 2023,
            url: 'https://dora.dev', description: 'DORA report' }
        ]
      });
    });

    afterEach(() => {
      mockLoadBenchmarks.mockResolvedValue({
        current: { domain1: 3.2, domain2: 3.5, industry: 'Financial Services', overall: 3.15 },
        history: [{ date: '2024-Q3', overall: 3.05 }]
      });
    });

    it('shows BenchmarkSources chips when sources are available', async () => {
      render(<ResultsView {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByTestId('benchmark-sources')).toBeInTheDocument();
      });
    });

    it('shows publisher name in source chip', async () => {
      render(<ResultsView {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByText('DORA')).toBeInTheDocument();
      });
    });
  });

  describe('Assessment History / Snapshots', () => {
    it('should not render snapshot history when snapshots is empty', () => {
      render(<ResultsView {...defaultProps} snapshots={[]} />);
      expect(screen.queryByTestId('snapshot-history')).not.toBeInTheDocument();
    });

    it('should not render snapshot history when snapshots is undefined', () => {
      render(<ResultsView {...defaultProps} />);
      expect(screen.queryByTestId('snapshot-history')).not.toBeInTheDocument();
    });

    it('should render snapshot history section when snapshots are provided', () => {
      const snapshots = [
        { timestamp: '2025-01-15T10:00:00Z', overallScore: 3.5 },
        { timestamp: '2025-02-20T14:30:00Z', overallScore: 4.2 }
      ];
      render(<ResultsView {...defaultProps} snapshots={snapshots} />);
      expect(screen.getByTestId('snapshot-history')).toBeInTheDocument();
    });

    it('should render snapshots in reverse chronological order', () => {
      const snapshots = [
        { timestamp: '2025-01-15T10:00:00Z', overallScore: 2.0 },
        { timestamp: '2025-03-01T14:30:00Z', overallScore: 4.5 }
      ];
      render(<ResultsView {...defaultProps} snapshots={snapshots} />);
      const items = screen.getByTestId('snapshot-history').querySelectorAll('.snapshot-item');
      expect(items.length).toBe(2);
      // The last snapshot (4.5) should appear first due to reverse()
      expect(items[0].querySelector('.snapshot-score').textContent).toContain('4.50');
      expect(items[1].querySelector('.snapshot-score').textContent).toContain('2.00');
    });

    it('should apply "high" score class for scores >= 4', () => {
      const snapshots = [
        { timestamp: '2025-01-15T10:00:00Z', overallScore: 4.2 }
      ];
      render(<ResultsView {...defaultProps} snapshots={snapshots} />);
      const scoreEl = screen.getByTestId('snapshot-history').querySelector('.snapshot-score');
      expect(scoreEl.classList.contains('snapshot-score--high')).toBe(true);
    });

    it('should apply "mid" score class for scores >= 2.5 and < 4', () => {
      const snapshots = [
        { timestamp: '2025-01-15T10:00:00Z', overallScore: 3.0 }
      ];
      render(<ResultsView {...defaultProps} snapshots={snapshots} />);
      const scoreEl = screen.getByTestId('snapshot-history').querySelector('.snapshot-score');
      expect(scoreEl.classList.contains('snapshot-score--mid')).toBe(true);
    });

    it('should apply "low" score class for scores < 2.5', () => {
      const snapshots = [
        { timestamp: '2025-01-15T10:00:00Z', overallScore: 1.5 }
      ];
      render(<ResultsView {...defaultProps} snapshots={snapshots} />);
      const scoreEl = screen.getByTestId('snapshot-history').querySelector('.snapshot-score');
      expect(scoreEl.classList.contains('snapshot-score--low')).toBe(true);
    });

    it('should display formatted date for each snapshot', () => {
      const snapshots = [
        { timestamp: '2025-06-15T10:00:00Z', overallScore: 3.5 }
      ];
      render(<ResultsView {...defaultProps} snapshots={snapshots} />);
      const dateEl = screen.getByTestId('snapshot-history').querySelector('.snapshot-date');
      // The date text should contain "Jun" and "2025"
      expect(dateEl.textContent).toContain('2025');
    });

    it('should display maturity level label for each snapshot', () => {
      const snapshots = [
        { timestamp: '2025-01-15T10:00:00Z', overallScore: 4.5 }
      ];
      render(<ResultsView {...defaultProps} snapshots={snapshots} />);
      const labelEl = screen.getByTestId('snapshot-history').querySelector('.snapshot-label');
      expect(labelEl.textContent).toBeTruthy();
    });

    it('should display score formatted to 2 decimal places', () => {
      const snapshots = [
        { timestamp: '2025-01-15T10:00:00Z', overallScore: 3.123 }
      ];
      render(<ResultsView {...defaultProps} snapshots={snapshots} />);
      const scoreEl = screen.getByTestId('snapshot-history').querySelector('.snapshot-score');
      expect(scoreEl.textContent).toContain('3.12');
    });
  });
});
