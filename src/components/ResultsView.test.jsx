import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResultsView } from './ResultsView';

vi.mock('./DomainRadarChart', () => ({
  DomainRadarChart: ({ benchmarks }) => (
    <div data-testid="domain-radar-chart" data-has-benchmarks={!!benchmarks}>Radar Chart</div>
  )
}));
vi.mock('./DomainBarChart', () => ({
  DomainBarChart: ({ benchmarks }) => (
    <div data-testid="domain-bar-chart" data-has-benchmarks={!!benchmarks}>Bar Chart</div>
  )
}));
vi.mock('./DomainHeatmap', () => ({
  DomainHeatmap: () => <div data-testid="domain-heatmap">Heatmap</div>
}));
vi.mock('../services/dataService', () => ({
  dataService: {
    loadBenchmarks: vi.fn().mockResolvedValue({
      current: { domain1: 3.2, domain2: 3.5, industry: 'Financial Services' }
    })
  }
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
    expect(screen.getByText('📝 Next Steps')).toBeInTheDocument();
    expect(screen.getByText('You have 1 questions remaining.')).toBeInTheDocument();
  });

  it('should not show next steps when 100% complete', () => {
    render(<ResultsView {...defaultProps} progress={{ answered: 3, total: 3, percentage: 100 }} />);
    expect(screen.queryByText('📝 Next Steps')).not.toBeInTheDocument();
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

  it('should render heatmap chart by default', () => {
    render(<ResultsView {...defaultProps} />);
    expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
  });

  it('should switch to radar chart when tab is clicked', () => {
    render(<ResultsView {...defaultProps} />);
    fireEvent.click(screen.getByTestId('radar-chart-tab'));
    expect(screen.getByTestId('domain-radar-chart')).toBeInTheDocument();
  });

  it('should switch to bar chart when tab is clicked', () => {
    render(<ResultsView {...defaultProps} />);
    fireEvent.click(screen.getByTestId('bar-chart-tab'));
    expect(screen.getByTestId('domain-bar-chart')).toBeInTheDocument();
  });

  it('should display domain scores derived from assigned questions', () => {
    render(<ResultsView {...defaultProps} />);
    expect(screen.getByText('Test Domain')).toBeInTheDocument();
  });

  it('should only show domains with assigned questions', () => {
    const singleDomainQuestions = [
      { id: 'q1', domainId: 'domain1', domainTitle: 'Only Domain', categoryId: 'cat1', categoryTitle: 'Cat' }
    ];
    render(<ResultsView {...defaultProps} questions={singleDomainQuestions} />);
    expect(screen.getByText('Only Domain')).toBeInTheDocument();
    expect(screen.queryByText('domain2')).not.toBeInTheDocument();
  });

  it('should call onBackToAssessment when continue button is clicked', () => {
    render(<ResultsView {...defaultProps} />);
    fireEvent.click(screen.getByTestId('continue-assessment'));
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should display overall score', () => {
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

  it('should display maturity label for each domain', () => {
    render(<ResultsView {...defaultProps} />);
    expect(screen.getByTestId('maturity-domain1')).toBeInTheDocument();
  });

  it('should pass benchmarks to radar chart after load', async () => {
    render(<ResultsView {...defaultProps} />);
    fireEvent.click(screen.getByTestId('radar-chart-tab'));
    await waitFor(() => {
      expect(screen.getByTestId('domain-radar-chart').dataset.hasBenchmarks).toBe('true');
    });
  });

  it('should pass benchmarks to bar chart after load', async () => {
    render(<ResultsView {...defaultProps} />);
    fireEvent.click(screen.getByTestId('bar-chart-tab'));
    await waitFor(() => {
      expect(screen.getByTestId('domain-bar-chart').dataset.hasBenchmarks).toBe('true');
    });
  });
});
