import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { QuestionCard } from './QuestionCard';
import { NA_VALUE } from '../utils/scoreCalculator';

describe('QuestionCard', () => {
  const mockQuestion = {
    id: 'q1',
    text: 'Test question?',
    requiresEvidence: true
  };

  const mockProps = {
    question: mockQuestion,
    answer: null,
    onAnswerChange: vi.fn(),
    onClearAnswer: vi.fn(),
    onAddEvidence: vi.fn(),
    hasEvidence: false
  };

  it('should render question text', () => {
    render(<QuestionCard {...mockProps} />);
    expect(screen.getByText('Test question?')).toBeInTheDocument();
  });

  it('should render question ID', () => {
    render(<QuestionCard {...mockProps} />);
    expect(screen.getByText('Q1')).toBeInTheDocument();
  });

  it('should show evidence required badge', () => {
    render(<QuestionCard {...mockProps} />);
    expect(screen.getByText('📎 Evidence Required')).toBeInTheDocument();
  });

  it('should render all rating options', () => {
    render(<QuestionCard {...mockProps} />);
    expect(screen.getByText('Not Implemented')).toBeInTheDocument();
    expect(screen.getByText('Initial/Ad-hoc')).toBeInTheDocument();
    expect(screen.getByText('Defined/Repeatable')).toBeInTheDocument();
    expect(screen.getByText('Managed/Measured')).toBeInTheDocument();
    expect(screen.getByText('Optimized/Innovating')).toBeInTheDocument();
  });

  it('should call onAnswerChange when option is clicked', () => {
    render(<QuestionCard {...mockProps} />);
    const option = screen.getByTestId('option-q1-3');
    fireEvent.click(option);
    expect(mockProps.onAnswerChange).toHaveBeenCalledWith(3);
  });

  it('should highlight selected option', () => {
    render(<QuestionCard {...mockProps} answer={3} />);
    const option = screen.getByTestId('option-q1-3');
    expect(option).toHaveClass('selected');
  });

  it('should show clear button when answer is selected', () => {
    render(<QuestionCard {...mockProps} answer={3} />);
    expect(screen.getByTestId('clear-q1')).toBeInTheDocument();
  });

  it('should call onClearAnswer when clear button is clicked', () => {
    render(<QuestionCard {...mockProps} answer={3} />);
    const clearBtn = screen.getByTestId('clear-q1');
    fireEvent.click(clearBtn);
    expect(mockProps.onClearAnswer).toHaveBeenCalled();
  });

  it('should deselect when clicking selected option', () => {
    render(<QuestionCard {...mockProps} answer={3} />);
    const option = screen.getByTestId('option-q1-3');
    fireEvent.click(option);
    expect(mockProps.onClearAnswer).toHaveBeenCalled();
  });

  it('should call onAddEvidence when evidence button is clicked', () => {
    render(<QuestionCard {...mockProps} />);
    const evidenceBtn = screen.getByTestId('evidence-q1');
    fireEvent.click(evidenceBtn);
    expect(mockProps.onAddEvidence).toHaveBeenCalled();
  });

  it('should show "View Evidence" when evidence exists', () => {
    render(<QuestionCard {...mockProps} hasEvidence={true} />);
    expect(screen.getByText(/View Evidence/)).toBeInTheDocument();
  });

  it('should show "Add Evidence" when no evidence exists', () => {
    render(<QuestionCard {...mockProps} hasEvidence={false} />);
    expect(screen.getByText(/Add Evidence/)).toBeInTheDocument();
  });

  it('should sync selected state when answer prop changes after mount', () => {
    const { rerender } = render(<QuestionCard {...mockProps} answer={undefined} />);
    expect(screen.getByTestId('option-q1-3')).not.toHaveClass('selected');

    act(() => {
      rerender(<QuestionCard {...mockProps} answer={3} />);
    });

    expect(screen.getByTestId('option-q1-3')).toHaveClass('selected');
  });

  describe('N/A option', () => {
    it('should render an N/A button', () => {
      render(<QuestionCard {...mockProps} />);
      expect(screen.getByTestId('na-q1')).toBeInTheDocument();
    });

    it('should mark question as N/A when N/A button is clicked', () => {
      render(<QuestionCard {...mockProps} />);
      fireEvent.click(screen.getByTestId('na-q1'));
      expect(mockProps.onAnswerChange).toHaveBeenCalledWith(NA_VALUE);
    });

    it('should show selected state when answer is NA_VALUE', () => {
      render(<QuestionCard {...mockProps} answer={NA_VALUE} />);
      expect(screen.getByTestId('na-q1')).toHaveClass('selected');
    });

    it('should clear N/A when N/A button is clicked again', () => {
      render(<QuestionCard {...mockProps} answer={NA_VALUE} />);
      fireEvent.click(screen.getByTestId('na-q1'));
      expect(mockProps.onClearAnswer).toHaveBeenCalled();
    });

    it('should not show clear button when question is marked N/A', () => {
      render(<QuestionCard {...mockProps} answer={NA_VALUE} />);
      expect(screen.queryByTestId('clear-q1')).not.toBeInTheDocument();
    });

    it('should switch from rated answer to N/A', () => {
      render(<QuestionCard {...mockProps} answer={3} />);
      fireEvent.click(screen.getByTestId('na-q1'));
      expect(mockProps.onAnswerChange).toHaveBeenCalledWith(NA_VALUE);
    });
  });
});