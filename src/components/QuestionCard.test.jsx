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
    comment: '',
    onAnswerChange: vi.fn(),
    onClearAnswer: vi.fn(),
    onCommentChange: vi.fn(),
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

  describe('Comments / Notes', () => {
    it('should render a comment toggle button', () => {
      render(<QuestionCard {...mockProps} />);
      expect(screen.getByTestId('comment-toggle-q1')).toBeInTheDocument();
    });

    it('should not show textarea initially when no comment', () => {
      render(<QuestionCard {...mockProps} />);
      expect(screen.queryByTestId('comment-area-q1')).not.toBeInTheDocument();
    });

    it('should show textarea when toggle button is clicked', () => {
      render(<QuestionCard {...mockProps} />);
      fireEvent.click(screen.getByTestId('comment-toggle-q1'));
      expect(screen.getByTestId('comment-area-q1')).toBeInTheDocument();
    });

    it('should show textarea automatically when comment prop has a value', () => {
      render(<QuestionCard {...mockProps} comment="Existing note" />);
      expect(screen.getByTestId('comment-area-q1')).toBeInTheDocument();
    });

    it('should display existing comment text in textarea', () => {
      render(<QuestionCard {...mockProps} comment="Existing note" />);
      expect(screen.getByTestId('comment-input-q1').value).toBe('Existing note');
    });

    it('should call onCommentChange when textarea is edited', () => {
      render(<QuestionCard {...mockProps} />);
      fireEvent.click(screen.getByTestId('comment-toggle-q1'));
      fireEvent.change(screen.getByTestId('comment-input-q1'), { target: { value: 'new note' } });
      expect(mockProps.onCommentChange).toHaveBeenCalledWith('new note');
    });

    it('should show has-comment class on toggle when comment is non-empty', () => {
      render(<QuestionCard {...mockProps} comment="has text" />);
      expect(screen.getByTestId('comment-toggle-q1')).toHaveClass('has-comment');
    });

    it('should hide textarea when toggle button is clicked again', () => {
      render(<QuestionCard {...mockProps} />);
      fireEvent.click(screen.getByTestId('comment-toggle-q1'));
      fireEvent.click(screen.getByTestId('comment-toggle-q1'));
      expect(screen.queryByTestId('comment-area-q1')).not.toBeInTheDocument();
    });
  });

  describe('Compliance Tags', () => {
    const mockTags = [
      { id: 'sox', name: 'SOX', color: '#10b981', icon: 'SOX' },
      { id: 'pii', name: 'PII/GDPR', color: '#22c55e', icon: 'PII' }
    ];

    it('should not render compliance tags section when no tags provided', () => {
      render(<QuestionCard {...mockProps} />);
      expect(screen.queryByTestId('compliance-tags-q1')).not.toBeInTheDocument();
    });

    it('should not render compliance tags section for empty array', () => {
      render(<QuestionCard {...mockProps} complianceTags={[]} />);
      expect(screen.queryByTestId('compliance-tags-q1')).not.toBeInTheDocument();
    });

    it('should render compliance tags section when tags provided', () => {
      render(<QuestionCard {...mockProps} complianceTags={mockTags} />);
      expect(screen.getByTestId('compliance-tags-q1')).toBeInTheDocument();
    });

    it('should render a badge for each tag', () => {
      render(<QuestionCard {...mockProps} complianceTags={mockTags} />);
      expect(screen.getByTestId('compliance-tag-q1-sox')).toBeInTheDocument();
      expect(screen.getByTestId('compliance-tag-q1-pii')).toBeInTheDocument();
    });

    it('should display the icon text inside each badge', () => {
      render(<QuestionCard {...mockProps} complianceTags={mockTags} />);
      expect(screen.getByTestId('compliance-tag-q1-sox')).toHaveTextContent('SOX');
      expect(screen.getByTestId('compliance-tag-q1-pii')).toHaveTextContent('PII');
    });

    it('should apply the framework color via inline style', () => {
      render(<QuestionCard {...mockProps} complianceTags={[mockTags[0]]} />);
      const badge = screen.getByTestId('compliance-tag-q1-sox');
      expect(badge.style.color).toBe('rgb(16, 185, 129)');
    });

    it('should use the framework name as title attribute', () => {
      render(<QuestionCard {...mockProps} complianceTags={[mockTags[0]]} />);
      expect(screen.getByTestId('compliance-tag-q1-sox')).toHaveAttribute('title', 'SOX');
    });
  });
});