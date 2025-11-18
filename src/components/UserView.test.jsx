import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserView } from './UserView';

// Mock the child components
vi.mock('./QuestionCard', () => ({
  QuestionCard: ({ question, answer, onAnswerChange, onClearAnswer, onAddEvidence, hasEvidence }) => (
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
    role: 'user'
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
});