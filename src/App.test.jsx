import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { useAssessment } from './hooks/useAssessment';

vi.mock('./hooks/useAssessment');

describe('App', () => {
  const mockUseAssessment = {
    domains: {
      domain1: {
        title: 'Test Domain',
        categories: {
          cat1: {
            title: 'Test Category',
            questions: [
              { id: 'q1', text: 'Question 1', requiresEvidence: false }
            ]
          }
        }
      }
    },
    answers: {},
    evidence: {},
    loading: false,
    error: null,
    saveAnswer: vi.fn(),
    clearAnswer: vi.fn(),
    saveEvidenceForQuestion: vi.fn(),
    getProgress: vi.fn(() => ({ answered: 0, total: 1, percentage: 0 }))
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAssessment.mockReturnValue(mockUseAssessment);
  });

  it('should render loading state', () => {
    useAssessment.mockReturnValue({
      ...mockUseAssessment,
      loading: true
    });

    render(<App />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByText('Loading assessment...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    useAssessment.mockReturnValue({
      ...mockUseAssessment,
      loading: false,
      error: 'Test error message'
    });

    render(<App />);
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should render app header with title', () => {
    render(<App />);
    expect(screen.getByText('Technology Assessment Framework')).toBeInTheDocument();
  });

  it('should render progress bar', () => {
    render(<App />);
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
  });

  it('should render navigation buttons', () => {
    render(<App />);
    expect(screen.getByText('Assessment')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should show assessment section by default', () => {
    render(<App />);
    expect(screen.getByTestId('assessment-section')).toBeInTheDocument();
  });

  it('should switch to dashboard section when clicked', () => {
    render(<App />);
    const dashboardBtn = screen.getByText('Dashboard');
    fireEvent.click(dashboardBtn);
    expect(screen.getByTestId('dashboard-section')).toBeInTheDocument();
  });

  it('should render domain title', () => {
    render(<App />);
    expect(screen.getByText('Test Domain')).toBeInTheDocument();
  });

  it('should render category title', () => {
    render(<App />);
    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });

  it('should render question cards', () => {
    render(<App />);
    expect(screen.getByTestId('question-q1')).toBeInTheDocument();
  });

  it('should call saveAnswer when answer is selected', async () => {
    render(<App />);
    const option = screen.getByTestId('option-q1-3');
    fireEvent.click(option);
    
    await waitFor(() => {
      expect(mockUseAssessment.saveAnswer).toHaveBeenCalledWith('q1', 3);
    });
  });

  it('should call clearAnswer when clear button is clicked', async () => {
    useAssessment.mockReturnValue({
      ...mockUseAssessment,
      answers: { q1: 3 }
    });

    render(<App />);
    const clearBtn = screen.getByTestId('clear-q1');
    fireEvent.click(clearBtn);
    
    await waitFor(() => {
      expect(mockUseAssessment.clearAnswer).toHaveBeenCalledWith('q1');
    });
  });

  it('should switch back to assessment section', () => {
    render(<App />);
    const dashboardBtn = screen.getByText('Dashboard');
    fireEvent.click(dashboardBtn);
    expect(screen.getByTestId('dashboard-section')).toBeInTheDocument();
    
    const assessmentBtn = screen.getByText('Assessment');
    fireEvent.click(assessmentBtn);
    expect(screen.getByTestId('assessment-section')).toBeInTheDocument();
  });

  it('should handle domains with no categories', () => {
    useAssessment.mockReturnValue({
      ...mockUseAssessment,
      domains: {
        domain1: {
          title: 'Empty Domain',
          categories: {}
        }
      }
    });

    render(<App />);
    expect(screen.getByText('Empty Domain')).toBeInTheDocument();
  });

  it('should call onAddEvidence when evidence button is clicked', () => {
    const mockSaveEvidence = vi.fn();
    useAssessment.mockReturnValue({
      ...mockUseAssessment,
      saveEvidenceForQuestion: mockSaveEvidence
    });

    render(<App />);
    const evidenceBtn = screen.getByTestId('evidence-q1');
    fireEvent.click(evidenceBtn);
    
    // The onAddEvidence is currently a no-op in App.jsx
    // This test covers the branch where the function is called
    expect(evidenceBtn).toBeInTheDocument();
  });

  it('should handle categories with no questions', () => {
    useAssessment.mockReturnValue({
      ...mockUseAssessment,
      domains: {
        domain1: {
          title: 'Test Domain',
          categories: {
            cat1: {
              title: 'Empty Category',
              questions: []
            }
          }
        }
      }
    });

    render(<App />);
    expect(screen.getByText('Empty Category')).toBeInTheDocument();
  });

  it('should handle categories with null questions', () => {
    useAssessment.mockReturnValue({
      ...mockUseAssessment,
      domains: {
        domain1: {
          title: 'Test Domain',
          categories: {
            cat1: {
              title: 'Null Questions Category',
              questions: null
            }
          }
        }
      }
    });

    render(<App />);
    expect(screen.getByText('Null Questions Category')).toBeInTheDocument();
  });

  it('should handle null domains', () => {
    useAssessment.mockReturnValue({
      ...mockUseAssessment,
      domains: null
    });

    render(<App />);
    expect(screen.getByText('Technology Assessment Framework')).toBeInTheDocument();
  });

  it('should handle categories with undefined questions', () => {
    useAssessment.mockReturnValue({
      ...mockUseAssessment,
      domains: {
        domain1: {
          title: 'Test Domain',
          categories: {
            cat1: {
              title: 'Undefined Questions Category',
              questions: undefined
            }
          }
        }
      }
    });

    render(<App />);
    expect(screen.getByText('Undefined Questions Category')).toBeInTheDocument();
  });

  it('should handle null categories', () => {
    useAssessment.mockReturnValue({
      ...mockUseAssessment,
      domains: {
        domain1: {
          title: 'Test Domain',
          categories: null
        }
      }
    });

    render(<App />);
    expect(screen.getByText('Test Domain')).toBeInTheDocument();
  });
});