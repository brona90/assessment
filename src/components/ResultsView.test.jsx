import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultsView } from './ResultsView';

vi.mock('./DomainRadarChart', () => ({
  DomainRadarChart: () => <div data-testid="domain-radar-chart">Radar Chart</div>
}));
vi.mock('./DomainBarChart', () => ({
  DomainBarChart: () => <div data-testid="domain-bar-chart">Bar Chart</div>
}));
vi.mock('./DomainHeatmap', () => ({
  DomainHeatmap: () => <div data-testid="domain-heatmap">Heatmap</div>
}));

describe('ResultsView', () => {
  const mockUser = { id: 'user1', name: 'John Doe' };

  const mockDomains = {
    domain1: {
      title: 'Test Domain',
      weight: 1,
      categories: {
        cat1: {
          questions: [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }]
        }
      }
    }
  };

  const mockAnswers = { q1: 3, q2: 4 };

  const mockProgress = { answered: 2, total: 3, percentage: 67 };

  const mockOnBack = vi.fn();
  const mockOnLogout = vi.fn();

  const defaultProps = {
    user: mockUser,
    domains: mockDomains,
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

  it('should display domain scores', () => {
    render(<ResultsView {...defaultProps} />);
    expect(screen.getByText('Test Domain')).toBeInTheDocument();
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
});
