import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from './App';
import { useAssessment } from './hooks/useAssessment';
import { useUser } from './hooks/useUser';
import { useCompliance } from './hooks/useCompliance';
import { useDataStore } from './hooks/useDataStore';
import { pdfService } from './services/pdfService';
import { userExportService } from './services/userExportService';

vi.mock('./hooks/useAssessment');
vi.mock('./hooks/useUser');
vi.mock('./hooks/useCompliance');
vi.mock('./hooks/useDataStore');
vi.mock('./services/pdfService');
vi.mock('./services/userExportService');
vi.mock('./components/UserSelectionScreen', () => ({
  UserSelectionScreen: ({ users, onSelectUser }) => (
    <div data-testid="user-selection-screen">
      <h1>Select User</h1>
      {users.map(user => (
        <button 
          key={user.id} 
          onClick={() => onSelectUser(user)}
          data-testid={`select-user-${user.id}`}
        >
          {user.name}
        </button>
      ))}
    </div>
  )
}));
vi.mock('./components/AdminView', () => ({
  AdminView: ({ onExportPDF }) => (
    <div data-testid="admin-view">
      <h1>Admin View</h1>
      <button onClick={onExportPDF} data-testid="export-pdf-btn">Export PDF</button>
    </div>
  )
}));
vi.mock('./components/UserView', () => ({
  UserView: ({ user, questions, progress, onAnswerChange, onClearAnswer, onAddEvidence, onExportUserData, onLogout }) => (
    <div data-testid="user-view">
      <h1>User View: {user.name}</h1>
      <div data-testid="progress-bar">Progress: {progress.percentage}%</div>
      <button onClick={onLogout} data-testid="logout-btn">Logout</button>
      <button onClick={onExportUserData} data-testid="export-user-data-btn">Export Data</button>
      {questions.map(q => (
        <div key={q.id} data-testid={`question-${q.id}`}>
          <p>{q.text}</p>
          <button onClick={() => onAnswerChange(q.id, 3)} data-testid={`answer-${q.id}`}>Answer</button>
          <button onClick={() => onClearAnswer(q.id)} data-testid={`clear-${q.id}`}>Clear</button>
          <button onClick={() => onAddEvidence(q.id)} data-testid={`evidence-${q.id}`}>Add Evidence</button>
        </div>
      ))}
    </div>
  )
}));
vi.mock('./components/EvidenceModal', () => ({
  EvidenceModal: ({ questionId, onSave, onClose }) => (
    <div data-testid="evidence-modal">
      <h2>Evidence Modal for {questionId}</h2>
      <button onClick={() => onSave({ photos: [] })} data-testid="save-evidence-btn">Save</button>
      <button onClick={onClose} data-testid="close-evidence-btn">Close</button>
    </div>
  )
}));

describe('App', () => {
  const mockUseAssessment = {
    domains: {
      domain1: {
        title: 'Test Domain',
        categories: {
          cat1: {
            title: 'Test Category',
            questions: [
              { id: 'q1', text: 'Question 1', requiresEvidence: false },
              { id: 'q2', text: 'Question 2', requiresEvidence: true }
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
    getProgress: vi.fn(() => ({ answered: 0, total: 2, percentage: 0 }))
  };

  const mockUsers = [
    { id: 'user1', name: 'John Doe', role: 'user' },
    { id: 'admin1', name: 'Admin User', role: 'admin' }
  ];

  const mockUseUser = {
    users: mockUsers,
    currentUser: null,
    loading: false,
    selectUser: vi.fn(),
    isAdmin: vi.fn(() => false)
  };

  const mockUseCompliance = {
    frameworks: []
  };

  const mockUseDataStore = {
    getQuestionsForUser: vi.fn(() => [
      { id: 'q1', text: 'Question 1', requiresEvidence: false },
      { id: 'q2', text: 'Question 2', requiresEvidence: true }
    ]),
    initialized: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAssessment.mockReturnValue(mockUseAssessment);
    useUser.mockReturnValue(mockUseUser);
    useCompliance.mockReturnValue(mockUseCompliance);
    useDataStore.mockReturnValue(mockUseDataStore);
    pdfService.generatePDF = vi.fn().mockResolvedValue({});
    pdfService.downloadPDF = vi.fn().mockResolvedValue(undefined);
    userExportService.downloadUserExport = vi.fn().mockReturnValue({ success: true });
  });

  describe('Loading and Error States', () => {
    it('should render loading state when assessment is loading', () => {
      useAssessment.mockReturnValue({
        ...mockUseAssessment,
        loading: true
      });

      render(<App />);
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Loading assessment...')).toBeInTheDocument();
    });

    it('should render loading state when users are loading', () => {
      useUser.mockReturnValue({
        ...mockUseUser,
        loading: true
      });

      render(<App />);
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Loading assessment...')).toBeInTheDocument();
    });

    it('should render error state when there is an error', () => {
      useAssessment.mockReturnValue({
        ...mockUseAssessment,
        loading: false,
        error: 'Test error message'
      });

      render(<App />);
      expect(screen.getByTestId('error')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });
  });

  describe('User Selection Screen', () => {
    it('should render user selection screen when no user is selected', () => {
      render(<App />);
      expect(screen.getByTestId('user-selection-screen')).toBeInTheDocument();
      expect(screen.getByText('Select User')).toBeInTheDocument();
    });

    it('should display all users in selection screen', () => {
      render(<App />);
      expect(screen.getByTestId('select-user-user1')).toBeInTheDocument();
      expect(screen.getByTestId('select-user-admin1')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    it('should call selectUser when a user is clicked', () => {
      render(<App />);
      const userButton = screen.getByTestId('select-user-user1');
      fireEvent.click(userButton);
      expect(mockUseUser.selectUser).toHaveBeenCalledWith(mockUsers[0]);
    });
  });

  describe('Admin View', () => {
    beforeEach(() => {
      useUser.mockReturnValue({
        ...mockUseUser,
        currentUser: mockUsers[1],
        isAdmin: vi.fn(() => true)
      });
    });

    it('should render admin view when admin user is selected', () => {
      render(<App />);
      expect(screen.getByTestId('admin-view')).toBeInTheDocument();
      expect(screen.getByText('Admin View')).toBeInTheDocument();
    });

    it('should not render user view when admin is logged in', () => {
      render(<App />);
      expect(screen.queryByTestId('user-view')).not.toBeInTheDocument();
    });

    it('should handle PDF export when export button is clicked', async () => {
      render(<App />);
      const exportBtn = screen.getByTestId('export-pdf-btn');
      
      await act(async () => {
        fireEvent.click(exportBtn);
      });

      await waitFor(() => {
        expect(pdfService.generatePDF).toHaveBeenCalledWith(
          mockUseAssessment.domains,
          mockUseAssessment.answers,
          mockUseAssessment.evidence,
          mockUseCompliance.frameworks
        );
        expect(pdfService.downloadPDF).toHaveBeenCalled();
      });
    });

    it('should handle PDF export error gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      pdfService.generatePDF.mockRejectedValue(new Error('PDF generation failed'));

      render(<App />);
      const exportBtn = screen.getByTestId('export-pdf-btn');
      
      await act(async () => {
        fireEvent.click(exportBtn);
      });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(alertSpy).toHaveBeenCalledWith('Failed to generate PDF. Please try again.');
      });

      consoleErrorSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });

  describe('User View', () => {
    beforeEach(() => {
      useUser.mockReturnValue({
        ...mockUseUser,
        currentUser: mockUsers[0],
        isAdmin: vi.fn(() => false)
      });
    });

    it('should render user view when regular user is selected', () => {
      render(<App />);
      expect(screen.getByTestId('user-view')).toBeInTheDocument();
      expect(screen.getByText('User View: John Doe')).toBeInTheDocument();
    });

    it('should not render admin view when regular user is logged in', () => {
      render(<App />);
      expect(screen.queryByTestId('admin-view')).not.toBeInTheDocument();
    });

    it('should display progress bar', () => {
      render(<App />);
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
      expect(screen.getByText('Progress: 0%')).toBeInTheDocument();
    });

    it('should display user questions', () => {
      render(<App />);
      expect(screen.getByTestId('question-q1')).toBeInTheDocument();
      expect(screen.getByTestId('question-q2')).toBeInTheDocument();
      expect(screen.getByText('Question 1')).toBeInTheDocument();
      expect(screen.getByText('Question 2')).toBeInTheDocument();
    });

    it('should handle logout', () => {
      render(<App />);
      const logoutBtn = screen.getByTestId('logout-btn');
      fireEvent.click(logoutBtn);
      expect(mockUseUser.selectUser).toHaveBeenCalledWith(null);
    });

    it('should call saveAnswer when answer button is clicked', async () => {
      render(<App />);
      const answerBtn = screen.getByTestId('answer-q1');
      
      await act(async () => {
        fireEvent.click(answerBtn);
      });

      await waitFor(() => {
        expect(mockUseAssessment.saveAnswer).toHaveBeenCalledWith('q1', 3);
      });
    });

    it('should call clearAnswer when clear button is clicked', async () => {
      render(<App />);
      const clearBtn = screen.getByTestId('clear-q1');
      
      await act(async () => {
        fireEvent.click(clearBtn);
      });

      await waitFor(() => {
        expect(mockUseAssessment.clearAnswer).toHaveBeenCalledWith('q1');
      });
    });
  });

  describe('Evidence Modal', () => {
    beforeEach(() => {
      useUser.mockReturnValue({
        ...mockUseUser,
        currentUser: mockUsers[0],
        isAdmin: vi.fn(() => false)
      });
    });

    it('should open evidence modal when evidence button is clicked', async () => {
      render(<App />);
      const evidenceBtn = screen.getByTestId('evidence-q1');
      
      await act(async () => {
        fireEvent.click(evidenceBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('evidence-modal')).toBeInTheDocument();
        expect(screen.getByText('Evidence Modal for q1')).toBeInTheDocument();
      });
    });

    it('should close evidence modal when close button is clicked', async () => {
      render(<App />);
      const evidenceBtn = screen.getByTestId('evidence-q1');
      
      await act(async () => {
        fireEvent.click(evidenceBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('evidence-modal')).toBeInTheDocument();
      });

      const closeBtn = screen.getByTestId('close-evidence-btn');
      await act(async () => {
        fireEvent.click(closeBtn);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('evidence-modal')).not.toBeInTheDocument();
      });
    });

    it('should save evidence and close modal when save button is clicked', async () => {
      render(<App />);
      const evidenceBtn = screen.getByTestId('evidence-q1');
      
      await act(async () => {
        fireEvent.click(evidenceBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('evidence-modal')).toBeInTheDocument();
      });

      const saveBtn = screen.getByTestId('save-evidence-btn');
      await act(async () => {
        fireEvent.click(saveBtn);
      });

      await waitFor(() => {
        expect(mockUseAssessment.saveEvidenceForQuestion).toHaveBeenCalledWith('q1', { photos: [] });
        expect(screen.queryByTestId('evidence-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('User Data Export', () => {
    beforeEach(() => {
      useUser.mockReturnValue({
        ...mockUseUser,
        currentUser: mockUsers[0],
        isAdmin: vi.fn(() => false)
      });
    });

    it('should export user data when export button is clicked', async () => {
      render(<App />);
      const exportBtn = screen.getByTestId('export-user-data-btn');
      
      await act(async () => {
        fireEvent.click(exportBtn);
      });

      await waitFor(() => {
        expect(mockUseDataStore.getQuestionsForUser).toHaveBeenCalledWith('user1');
        expect(userExportService.downloadUserExport).toHaveBeenCalled();
      });
    });

    it('should show alert when export fails due to missing evidence', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      userExportService.downloadUserExport.mockReturnValue({
        success: false,
        error: 'Missing evidence for answered questions',
        validation: {
          totalAnswered: 5,
          missingEvidence: 3
        }
      });

      render(<App />);
      const exportBtn = screen.getByTestId('export-user-data-btn');
      
      await act(async () => {
        fireEvent.click(exportBtn);
      });

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          expect.stringContaining('Export Failed')
        );
        expect(alertSpy).toHaveBeenCalledWith(
          expect.stringContaining('You have answered 5 question(s), but 3 of them are missing evidence')
        );
      });

      alertSpy.mockRestore();
    });

    it('should handle export error gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      userExportService.downloadUserExport.mockImplementation(() => {
        throw new Error('Export failed');
      });

      render(<App />);
      const exportBtn = screen.getByTestId('export-user-data-btn');
      
      await act(async () => {
        fireEvent.click(exportBtn);
      });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(alertSpy).toHaveBeenCalledWith('Failed to export user data. Please try again.');
      });

      consoleErrorSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });

  describe('Data Hydration', () => {
    it('should hydrate user questions when user is selected', async () => {
      const { rerender } = render(<App />);
      
      // Initially no user selected
      expect(screen.getByTestId('user-selection-screen')).toBeInTheDocument();

      // Select a user
      useUser.mockReturnValue({
        ...mockUseUser,
        currentUser: mockUsers[0],
        isAdmin: vi.fn(() => false)
      });

      await act(async () => {
        rerender(<App />);
      });

      await waitFor(() => {
        expect(mockUseDataStore.getQuestionsForUser).toHaveBeenCalledWith('user1');
        expect(screen.getByTestId('user-view')).toBeInTheDocument();
      });
    });

    it('should clear user questions when user logs out', async () => {
      useUser.mockReturnValue({
        ...mockUseUser,
        currentUser: mockUsers[0],
        isAdmin: vi.fn(() => false)
      });

      const { rerender } = render(<App />);
      
      expect(screen.getByTestId('user-view')).toBeInTheDocument();

      // Logout
      useUser.mockReturnValue({
        ...mockUseUser,
        currentUser: null,
        isAdmin: vi.fn(() => false)
      });

      await act(async () => {
        rerender(<App />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-selection-screen')).toBeInTheDocument();
      });
    });

    it('should not hydrate questions when dataStore is not initialized', async () => {
      useDataStore.mockReturnValue({
        ...mockUseDataStore,
        initialized: false
      });

      useUser.mockReturnValue({
        ...mockUseUser,
        currentUser: mockUsers[0],
        isAdmin: vi.fn(() => false)
      });

      render(<App />);

      // getQuestionsForUser should not be called when not initialized
      expect(mockUseDataStore.getQuestionsForUser).not.toHaveBeenCalled();
    });
  });

  describe('Progress Tracking', () => {
    beforeEach(() => {
      useUser.mockReturnValue({
        ...mockUseUser,
        currentUser: mockUsers[0],
        isAdmin: vi.fn(() => false)
      });
    });

    it('should display correct progress percentage', () => {
      useAssessment.mockReturnValue({
        ...mockUseAssessment,
        getProgress: vi.fn(() => ({ answered: 1, total: 2, percentage: 50 }))
      });

      render(<App />);
      expect(screen.getByText('Progress: 50%')).toBeInTheDocument();
    });

    it('should update progress when answers change', async () => {
      const { rerender } = render(<App />);
      expect(screen.getByText('Progress: 0%')).toBeInTheDocument();

      useAssessment.mockReturnValue({
        ...mockUseAssessment,
        answers: { q1: 3 },
        getProgress: vi.fn(() => ({ answered: 1, total: 2, percentage: 50 }))
      });

      await act(async () => {
        rerender(<App />);
      });

      await waitFor(() => {
        expect(screen.getByText('Progress: 50%')).toBeInTheDocument();
      });
    });
  });
});