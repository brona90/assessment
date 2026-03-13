import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserView } from './UserView';

// Mock the child components
vi.mock('./QuestionCard', () => ({
  QuestionCard: ({ question, answer, onAnswerChange, onClearAnswer, onAddEvidence, onCommentChange, hasEvidence }) => (
    <div data-testid={`question-card-${question.id}`}>
      <p>{question.text}</p>
      <button onClick={() => onAnswerChange(3)} data-testid={`answer-${question.id}`}>
        Answer
      </button>
      <button onClick={onClearAnswer} data-testid={`clear-${question.id}`}>
        Clear
      </button>
      <button onClick={onAddEvidence} data-testid={`evidence-${question.id}`}>
        Add Evidence
      </button>
      <button onClick={() => onCommentChange('some comment')} data-testid={`comment-${question.id}`}>
        Comment
      </button>
      <button onClick={() => onCommentChange('')} data-testid={`comment-empty-${question.id}`}>
        Clear Comment
      </button>
      {answer && <span data-testid={`answer-value-${question.id}`}>Answer: {answer}</span>}
      {hasEvidence && <span data-testid={`has-evidence-${question.id}`}>Has Evidence</span>}
    </div>
  )
}));

vi.mock('./ProgressBar', () => ({
  ProgressBar: ({ answered, total, percentage }) => (
    <div data-testid="progress-bar">
      Progress: {answered}/{total} ({percentage}%)
    </div>
  )
}));

describe('UserView', () => {
  const mockUser = {
    id: 'user1',
    name: 'John Doe',
    role: 'user',
    title: 'Assessment User'
  };

  const mockQuestions = [
    { 
      id: 'q1', 
      text: 'Question 1', 
      requiresEvidence: false,
      domainId: 'domain1',
      domainTitle: 'Test Domain',
      categoryId: 'cat1',
      categoryTitle: 'Test Category'
    },
    { 
      id: 'q2', 
      text: 'Question 2', 
      requiresEvidence: true,
      domainId: 'domain1',
      domainTitle: 'Test Domain',
      categoryId: 'cat1',
      categoryTitle: 'Test Category'
    },
    { 
      id: 'q3', 
      text: 'Question 3', 
      requiresEvidence: false,
      domainId: 'domain1',
      domainTitle: 'Test Domain',
      categoryId: 'cat2',
      categoryTitle: 'Another Category'
    }
  ];

  const mockAnswers = {
    q1: 3,
    q2: 4
  };

  const mockEvidence = {
    q2: { photos: ['photo1.jpg', 'photo2.jpg'] }
  };

  const mockProgress = {
    answered: 2,
    total: 3,
    percentage: 67
  };

  const mockOnAnswerChange = vi.fn();
  const mockOnClearAnswer = vi.fn();
  const mockOnAddEvidence = vi.fn();
  const mockOnExportUserData = vi.fn();
  const mockOnLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render user view with user name', () => {
    render(
      <UserView
        user={mockUser}
        questions={mockQuestions}
        answers={mockAnswers}
        evidence={mockEvidence}
        progress={mockProgress}
        onAnswerChange={mockOnAnswerChange}
        onClearAnswer={mockOnClearAnswer}
        onAddEvidence={mockOnAddEvidence}
        onExportUserData={mockOnExportUserData}
        onLogout={mockOnLogout}
      />
    );

    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
  });

  it('should render progress bar with correct values', () => {
    render(
      <UserView
        user={mockUser}
        questions={mockQuestions}
        answers={mockAnswers}
        evidence={mockEvidence}
        progress={mockProgress}
        onAnswerChange={mockOnAnswerChange}
        onClearAnswer={mockOnClearAnswer}
        onAddEvidence={mockOnAddEvidence}
        onExportUserData={mockOnExportUserData}
        onLogout={mockOnLogout}
      />
    );

    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    expect(screen.getByText('Progress: 2/3 (67%)')).toBeInTheDocument();
  });

  it('should render all assigned questions', () => {
    render(
      <UserView
        user={mockUser}
        questions={mockQuestions}
        answers={mockAnswers}
        evidence={mockEvidence}
        progress={mockProgress}
        onAnswerChange={mockOnAnswerChange}
        onClearAnswer={mockOnClearAnswer}
        onAddEvidence={mockOnAddEvidence}
        onExportUserData={mockOnExportUserData}
        onLogout={mockOnLogout}
      />
    );

    expect(screen.getByTestId('question-card-q1')).toBeInTheDocument();
    expect(screen.getByTestId('question-card-q2')).toBeInTheDocument();
    expect(screen.getByTestId('question-card-q3')).toBeInTheDocument();
  });

  it('should display question text', () => {
    render(
      <UserView
        user={mockUser}
        questions={mockQuestions}
        answers={mockAnswers}
        evidence={mockEvidence}
        progress={mockProgress}
        onAnswerChange={mockOnAnswerChange}
        onClearAnswer={mockOnClearAnswer}
        onAddEvidence={mockOnAddEvidence}
        onExportUserData={mockOnExportUserData}
        onLogout={mockOnLogout}
      />
    );

    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Question 2')).toBeInTheDocument();
    expect(screen.getByText('Question 3')).toBeInTheDocument();
  });

  it('should render export data button', () => {
    render(
      <UserView
        user={mockUser}
        questions={mockQuestions}
        answers={mockAnswers}
        evidence={mockEvidence}
        progress={mockProgress}
        onAnswerChange={mockOnAnswerChange}
        onClearAnswer={mockOnClearAnswer}
        onAddEvidence={mockOnAddEvidence}
        onExportUserData={mockOnExportUserData}
        onLogout={mockOnLogout}
      />
    );

    expect(screen.getByText(/Export My Data/)).toBeInTheDocument();
  });

  it('should render logout button', () => {
    render(
      <UserView
        user={mockUser}
        questions={mockQuestions}
        answers={mockAnswers}
        evidence={mockEvidence}
        progress={mockProgress}
        onAnswerChange={mockOnAnswerChange}
        onClearAnswer={mockOnClearAnswer}
        onAddEvidence={mockOnAddEvidence}
        onExportUserData={mockOnExportUserData}
        onLogout={mockOnLogout}
      />
    );

    expect(screen.getByText(/Logout/)).toBeInTheDocument();
  });

  it('should call onExportUserData when export button is clicked', () => {
    render(
      <UserView
        user={mockUser}
        questions={mockQuestions}
        answers={mockAnswers}
        evidence={mockEvidence}
        progress={mockProgress}
        onAnswerChange={mockOnAnswerChange}
        onClearAnswer={mockOnClearAnswer}
        onAddEvidence={mockOnAddEvidence}
        onExportUserData={mockOnExportUserData}
        onLogout={mockOnLogout}
      />
    );

    const exportButton = screen.getByTestId('export-user-data');
    fireEvent.click(exportButton);

    expect(mockOnExportUserData).toHaveBeenCalledTimes(1);
  });

  it('should call onLogout when logout button is clicked', () => {
    render(
      <UserView
        user={mockUser}
        questions={mockQuestions}
        answers={mockAnswers}
        evidence={mockEvidence}
        progress={mockProgress}
        onAnswerChange={mockOnAnswerChange}
        onClearAnswer={mockOnClearAnswer}
        onAddEvidence={mockOnAddEvidence}
        onExportUserData={mockOnExportUserData}
        onLogout={mockOnLogout}
      />
    );

    const logoutButton = screen.getByTestId('logout-btn');
    fireEvent.click(logoutButton);

    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it('should pass correct props to QuestionCard', () => {
    render(
      <UserView
        user={mockUser}
        questions={mockQuestions}
        answers={mockAnswers}
        evidence={mockEvidence}
        progress={mockProgress}
        onAnswerChange={mockOnAnswerChange}
        onClearAnswer={mockOnClearAnswer}
        onAddEvidence={mockOnAddEvidence}
        onExportUserData={mockOnExportUserData}
        onLogout={mockOnLogout}
      />
    );

    // Check that answered questions show their answers
    expect(screen.getByTestId('answer-value-q1')).toHaveTextContent('Answer: 3');
    expect(screen.getByTestId('answer-value-q2')).toHaveTextContent('Answer: 4');

    // Check that evidence is passed correctly
    expect(screen.getByTestId('has-evidence-q2')).toBeInTheDocument();
  });

  it('should call onAnswerChange when answer button is clicked', () => {
    render(
      <UserView
        user={mockUser}
        questions={mockQuestions}
        answers={mockAnswers}
        evidence={mockEvidence}
        progress={mockProgress}
        onAnswerChange={mockOnAnswerChange}
        onClearAnswer={mockOnClearAnswer}
        onAddEvidence={mockOnAddEvidence}
        onExportUserData={mockOnExportUserData}
        onLogout={mockOnLogout}
      />
    );

    const answerButton = screen.getByTestId('answer-q1');
    fireEvent.click(answerButton);

    expect(mockOnAnswerChange).toHaveBeenCalledWith('q1', 3);
  });

  it('should call onClearAnswer when clear button is clicked', () => {
    render(
      <UserView
        user={mockUser}
        questions={mockQuestions}
        answers={mockAnswers}
        evidence={mockEvidence}
        progress={mockProgress}
        onAnswerChange={mockOnAnswerChange}
        onClearAnswer={mockOnClearAnswer}
        onAddEvidence={mockOnAddEvidence}
        onExportUserData={mockOnExportUserData}
        onLogout={mockOnLogout}
      />
    );

    const clearButton = screen.getByTestId('clear-q1');
    fireEvent.click(clearButton);

    expect(mockOnClearAnswer).toHaveBeenCalledWith('q1');
  });

  it('should call onAddEvidence when evidence button is clicked', () => {
    render(
      <UserView
        user={mockUser}
        questions={mockQuestions}
        answers={mockAnswers}
        evidence={mockEvidence}
        progress={mockProgress}
        onAnswerChange={mockOnAnswerChange}
        onClearAnswer={mockOnClearAnswer}
        onAddEvidence={mockOnAddEvidence}
        onExportUserData={mockOnExportUserData}
        onLogout={mockOnLogout}
      />
    );

    const evidenceButton = screen.getByTestId('evidence-q1');
    fireEvent.click(evidenceButton);

    expect(mockOnAddEvidence).toHaveBeenCalledWith('q1');
  });

  it('should handle empty questions array', () => {
    render(
      <UserView
        user={mockUser}
        questions={[]}
        answers={mockAnswers}
        evidence={mockEvidence}
        progress={{ answered: 0, total: 0, percentage: 0 }}
        onAnswerChange={mockOnAnswerChange}
        onClearAnswer={mockOnClearAnswer}
        onAddEvidence={mockOnAddEvidence}
        onExportUserData={mockOnExportUserData}
        onLogout={mockOnLogout}
      />
    );

    expect(screen.getByTestId('no-questions')).toBeInTheDocument();
    expect(screen.getByText('No Questions Assigned')).toBeInTheDocument();
  });

  it('should display correct progress for 0% completion', () => {
    render(
      <UserView
        user={mockUser}
        questions={mockQuestions}
        answers={{}}
        evidence={{}}
        progress={{ answered: 0, total: 3, percentage: 0 }}
        onAnswerChange={mockOnAnswerChange}
        onClearAnswer={mockOnClearAnswer}
        onAddEvidence={mockOnAddEvidence}
        onExportUserData={mockOnExportUserData}
        onLogout={mockOnLogout}
      />
    );

    expect(screen.getByText('Progress: 0/3 (0%)')).toBeInTheDocument();
  });

  it('should display correct progress for 100% completion', () => {
    render(
      <UserView
        user={mockUser}
        questions={mockQuestions}
        answers={{ q1: 3, q2: 4, q3: 5 }}
        evidence={mockEvidence}
        progress={{ answered: 3, total: 3, percentage: 100 }}
        onAnswerChange={mockOnAnswerChange}
        onClearAnswer={mockOnClearAnswer}
        onAddEvidence={mockOnAddEvidence}
        onExportUserData={mockOnExportUserData}
        onLogout={mockOnLogout}
      />
    );

    expect(screen.getByText('Progress: 3/3 (100%)')).toBeInTheDocument();
  });

  it('should render questions section header', () => {
    render(
      <UserView
        user={mockUser}
        questions={mockQuestions}
        answers={mockAnswers}
        evidence={mockEvidence}
        progress={mockProgress}
        onAnswerChange={mockOnAnswerChange}
        onClearAnswer={mockOnClearAnswer}
        onAddEvidence={mockOnAddEvidence}
        onExportUserData={mockOnExportUserData}
        onLogout={mockOnLogout}
      />
    );

    expect(screen.getByText('Your Assigned Questions')).toBeInTheDocument();
  });

  it('should group questions by domain and category', () => {
    render(
      <UserView
        user={mockUser}
        questions={mockQuestions}
        answers={mockAnswers}
        evidence={mockEvidence}
        progress={mockProgress}
        onAnswerChange={mockOnAnswerChange}
        onClearAnswer={mockOnClearAnswer}
        onAddEvidence={mockOnAddEvidence}
        onExportUserData={mockOnExportUserData}
        onLogout={mockOnLogout}
      />
    );

    expect(screen.getByText('Test Domain')).toBeInTheDocument();
    expect(screen.getByText('Test Category')).toBeInTheDocument();
    expect(screen.getByText('Another Category')).toBeInTheDocument();
  });

  it('should handle questions without answers', () => {
    render(
      <UserView
        user={mockUser}
        questions={mockQuestions}
        answers={{}}
        evidence={{}}
        progress={{ answered: 0, total: 3, percentage: 0 }}
        onAnswerChange={mockOnAnswerChange}
        onClearAnswer={mockOnClearAnswer}
        onAddEvidence={mockOnAddEvidence}
        onExportUserData={mockOnExportUserData}
        onLogout={mockOnLogout}
      />
    );

    // Questions should still be rendered
    expect(screen.getByTestId('question-card-q1')).toBeInTheDocument();
    expect(screen.getByTestId('question-card-q2')).toBeInTheDocument();
    expect(screen.getByTestId('question-card-q3')).toBeInTheDocument();

    // But no answer values should be shown
    expect(screen.queryByTestId('answer-value-q1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('answer-value-q2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('answer-value-q3')).not.toBeInTheDocument();
  });

  it('should render user role', () => {
    render(
      <UserView
        user={mockUser}
        questions={mockQuestions}
        answers={mockAnswers}
        evidence={mockEvidence}
        progress={mockProgress}
        onAnswerChange={mockOnAnswerChange}
        onClearAnswer={mockOnClearAnswer}
        onAddEvidence={mockOnAddEvidence}
        onExportUserData={mockOnExportUserData}
        onLogout={mockOnLogout}
      />
    );

    expect(screen.getByText('Assessment User')).toBeInTheDocument();
  });

  it('should not render domain tabs when only one domain', () => {
    render(
      <UserView
        user={mockUser}
        questions={mockQuestions}
        answers={mockAnswers}
        evidence={mockEvidence}
        progress={mockProgress}
        onAnswerChange={mockOnAnswerChange}
        onClearAnswer={mockOnClearAnswer}
        onAddEvidence={mockOnAddEvidence}
        onExportUserData={mockOnExportUserData}
        onLogout={mockOnLogout}
      />
    );

    // All mockQuestions share domain1 — no tab UI needed
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByTestId('domain-tab-select')).not.toBeInTheDocument();
  });

  describe('multi-domain navigation', () => {
    const multiDomainQuestions = [
      {
        id: 'q-d1',
        text: 'Domain 1 Question',
        requiresEvidence: false,
        domainId: 'domain1',
        domainTitle: 'Domain One',
        categoryId: 'cat1',
        categoryTitle: 'Category A'
      },
      {
        id: 'q-d2',
        text: 'Domain 2 Question',
        requiresEvidence: false,
        domainId: 'domain2',
        domainTitle: 'Domain Two',
        categoryId: 'cat2',
        categoryTitle: 'Category B'
      }
    ];

    const multiProps = {
      user: { id: 'user1', name: 'John Doe', title: 'Test' },
      questions: multiDomainQuestions,
      answers: {},
      evidence: {},
      progress: { answered: 0, total: 2, percentage: 0 },
      onAnswerChange: vi.fn(),
      onClearAnswer: vi.fn(),
      onCommentChange: vi.fn(),
      onAddEvidence: vi.fn(),
      onExportUserData: vi.fn(),
      onLogout: vi.fn()
    };

    it('renders domain tab buttons and select when multiple domains exist', () => {
      render(<UserView {...multiProps} />);

      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getByTestId('domain-tab-domain1')).toBeInTheDocument();
      expect(screen.getByTestId('domain-tab-domain2')).toBeInTheDocument();
      expect(screen.getByTestId('domain-tab-select')).toBeInTheDocument();
    });

    it('shows first domain questions by default', () => {
      render(<UserView {...multiProps} />);

      expect(screen.getByTestId('question-card-q-d1')).toBeInTheDocument();
      expect(screen.queryByTestId('question-card-q-d2')).not.toBeInTheDocument();
    });

    it('switches domain when tab button is clicked', () => {
      render(<UserView {...multiProps} />);

      fireEvent.click(screen.getByTestId('domain-tab-domain2'));

      expect(screen.queryByTestId('question-card-q-d1')).not.toBeInTheDocument();
      expect(screen.getByTestId('question-card-q-d2')).toBeInTheDocument();
    });

    it('switches domain when select value changes', () => {
      render(<UserView {...multiProps} />);

      fireEvent.change(screen.getByTestId('domain-tab-select'), {
        target: { value: 'domain2' }
      });

      expect(screen.queryByTestId('question-card-q-d1')).not.toBeInTheDocument();
      expect(screen.getByTestId('question-card-q-d2')).toBeInTheDocument();
    });

    it('marks the active tab with aria-selected', () => {
      render(<UserView {...multiProps} />);

      const tab1 = screen.getByTestId('domain-tab-domain1');
      const tab2 = screen.getByTestId('domain-tab-domain2');

      expect(tab1).toHaveAttribute('aria-selected', 'true');
      expect(tab2).toHaveAttribute('aria-selected', 'false');

      fireEvent.click(tab2);

      expect(tab1).toHaveAttribute('aria-selected', 'false');
      expect(tab2).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('handleCommentChange branch coverage', () => {
    const mockOnCommentChange = vi.fn();

    it('should call onCommentChange and set lastSaved when comment text is non-empty', () => {
      render(
        <UserView
          user={mockUser}
          questions={mockQuestions}
          answers={mockAnswers}
          evidence={mockEvidence}
          comments={{}}
          progress={mockProgress}
          onAnswerChange={mockOnAnswerChange}
          onClearAnswer={mockOnClearAnswer}
          onCommentChange={mockOnCommentChange}
          onAddEvidence={mockOnAddEvidence}
          onExportUserData={mockOnExportUserData}
          onLogout={mockOnLogout}
        />
      );

      fireEvent.click(screen.getByTestId('comment-q1'));
      expect(mockOnCommentChange).toHaveBeenCalledWith('q1', 'some comment');
      // After a non-empty comment, lastSaved should be set, shown as autosave indicator
      expect(screen.getByText(/Saved/)).toBeInTheDocument();
    });

    it('should call onCommentChange but NOT update lastSaved when comment text is empty', () => {
      render(
        <UserView
          user={mockUser}
          questions={mockQuestions}
          answers={mockAnswers}
          evidence={mockEvidence}
          comments={{}}
          progress={mockProgress}
          onAnswerChange={mockOnAnswerChange}
          onClearAnswer={mockOnClearAnswer}
          onCommentChange={mockOnCommentChange}
          onAddEvidence={mockOnAddEvidence}
          onExportUserData={mockOnExportUserData}
          onLogout={mockOnLogout}
        />
      );

      // Initially no autosave indicator
      expect(screen.queryByText(/Saved/)).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId('comment-empty-q1'));
      expect(mockOnCommentChange).toHaveBeenCalledWith('q1', '');
      // Empty comment should not trigger autosave indicator
      expect(screen.queryByText(/Saved/)).not.toBeInTheDocument();
    });
  });

  describe('completion banner', () => {
    it('should show assessment complete banner at 100% progress', () => {
      render(
        <UserView
          user={mockUser}
          questions={mockQuestions}
          answers={{ q1: 3, q2: 4, q3: 5 }}
          evidence={mockEvidence}
          progress={{ answered: 3, total: 3, percentage: 100 }}
          onAnswerChange={mockOnAnswerChange}
          onClearAnswer={mockOnClearAnswer}
          onCommentChange={vi.fn()}
          onAddEvidence={mockOnAddEvidence}
          onExportUserData={mockOnExportUserData}
          onSwitchToResults={vi.fn()}
          onLogout={mockOnLogout}
        />
      );

      expect(screen.getByTestId('assessment-complete')).toBeInTheDocument();
      expect(screen.getByText('Assessment Complete!')).toBeInTheDocument();
    });

    it('should show View Results button in banner when onSwitchToResults is provided', () => {
      const mockOnSwitchToResults = vi.fn();
      render(
        <UserView
          user={mockUser}
          questions={mockQuestions}
          answers={{ q1: 3, q2: 4, q3: 5 }}
          evidence={mockEvidence}
          progress={{ answered: 3, total: 3, percentage: 100 }}
          onAnswerChange={mockOnAnswerChange}
          onClearAnswer={mockOnClearAnswer}
          onCommentChange={vi.fn()}
          onAddEvidence={mockOnAddEvidence}
          onExportUserData={mockOnExportUserData}
          onSwitchToResults={mockOnSwitchToResults}
          onLogout={mockOnLogout}
        />
      );

      expect(screen.getByText(/View Your Results/)).toBeInTheDocument();
    });

    it('should not show View Results button in banner when onSwitchToResults is not provided', () => {
      render(
        <UserView
          user={mockUser}
          questions={mockQuestions}
          answers={{ q1: 3, q2: 4, q3: 5 }}
          evidence={mockEvidence}
          progress={{ answered: 3, total: 3, percentage: 100 }}
          onAnswerChange={mockOnAnswerChange}
          onClearAnswer={mockOnClearAnswer}
          onCommentChange={vi.fn()}
          onAddEvidence={mockOnAddEvidence}
          onExportUserData={mockOnExportUserData}
          onLogout={mockOnLogout}
        />
      );

      expect(screen.getByTestId('assessment-complete')).toBeInTheDocument();
      expect(screen.queryByText(/View Your Results/)).not.toBeInTheDocument();
    });
  });

  it('should fall back to "Assessment User" when user.title is not provided', () => {
    const userNoTitle = { id: 'user1', name: 'John Doe' };
    render(
      <UserView
        user={userNoTitle}
        questions={mockQuestions}
        answers={mockAnswers}
        evidence={mockEvidence}
        progress={mockProgress}
        onAnswerChange={mockOnAnswerChange}
        onClearAnswer={mockOnClearAnswer}
        onCommentChange={vi.fn()}
        onAddEvidence={mockOnAddEvidence}
        onExportUserData={mockOnExportUserData}
        onLogout={mockOnLogout}
      />
    );

    expect(screen.getByText('Assessment User')).toBeInTheDocument();
  });
});