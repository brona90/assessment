import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionCard } from './QuestionCard';

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
});