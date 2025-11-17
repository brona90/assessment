import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnhancedAdminPanel } from './EnhancedAdminPanel';

// Mock the useDataStore hook
const mockImportData = vi.fn();
const mockDownloadData = vi.fn();
const mockAddDomain = vi.fn();
const mockUpdateDomain = vi.fn();
const mockDeleteDomain = vi.fn();
const mockAddUser = vi.fn();
const mockUpdateUser = vi.fn();
const mockDeleteUser = vi.fn();
const mockAddFramework = vi.fn();
const mockUpdateFramework = vi.fn();
const mockDeleteFramework = vi.fn();
const mockSetSelectedFrameworks = vi.fn();
const mockAddQuestion = vi.fn();
const mockUpdateQuestion = vi.fn();
const mockDeleteQuestion = vi.fn();
const mockAssignQuestionsToUser = vi.fn();
const mockGetUserAssignments = vi.fn();
const mockSetAnswers = vi.fn();
const mockSetEvidence = vi.fn();
const mockClearAllData = vi.fn();

const mockDomains = {
  'domain1': { id: 'domain1', title: 'Security', description: 'Security domain', weight: 1 }
};

const mockUsers = [
  { id: 'user1', name: 'John Doe', email: 'john@example.com', role: 'user' }
];

const mockFrameworks = [
  { id: 'fw1', name: 'ISO 27001', description: 'ISO framework' }
];

const mockQuestions = [
  { id: 'q1', text: 'Question 1', domainId: 'domain1', categoryId: 'cat1', requiresEvidence: true }
];

vi.mock('../hooks/useDataStore', () => ({
  useDataStore: () => ({
    initialized: true,
    loading: false,
    error: null,
    getDomains: vi.fn(() => mockDomains),
    getUsers: vi.fn(() => mockUsers),
    getFrameworks: vi.fn(() => mockFrameworks),
    getQuestions: vi.fn(() => mockQuestions),
    getSelectedFrameworks: vi.fn(() => [mockFrameworks[0]]),
    addDomain: mockAddDomain,
    updateDomain: mockUpdateDomain,
    deleteDomain: mockDeleteDomain,
    addUser: mockAddUser,
    updateUser: mockUpdateUser,
    deleteUser: mockDeleteUser,
    addFramework: mockAddFramework,
    updateFramework: mockUpdateFramework,
    deleteFramework: mockDeleteFramework,
    setSelectedFrameworks: mockSetSelectedFrameworks,
    addQuestion: mockAddQuestion,
    updateQuestion: mockUpdateQuestion,
    deleteQuestion: mockDeleteQuestion,
    assignQuestionsToUser: mockAssignQuestionsToUser,
    getUserAssignments: mockGetUserAssignments,
    importData: mockImportData,
    downloadData: mockDownloadData,
    setAnswers: mockSetAnswers,
    setEvidence: mockSetEvidence,
    clearAllData: mockClearAllData
  })
}));

// Mock userExportService
vi.mock('../services/userExportService', () => ({
  userExportService: {
    mergeExports: vi.fn(() => ({ merged: true })),
    generateMergedReport: vi.fn(() => 'merged report data')
  }
}));

// Mock storageService
vi.mock('../services/storageService', () => ({
  storageService: {
    getAnswers: vi.fn(() => ({})),
    getEvidence: vi.fn(() => ({}))
  }
}));

describe('EnhancedAdminPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockImportData.mockReturnValue({ success: true });
    mockGetUserAssignments.mockReturnValue([]);
    mockAddDomain.mockReturnValue({ success: true });
    mockUpdateDomain.mockReturnValue({ success: true });
    mockDeleteDomain.mockReturnValue({ success: true });
    mockAddUser.mockReturnValue({ success: true });
    mockUpdateUser.mockReturnValue({ success: true });
    mockDeleteUser.mockReturnValue({ success: true });
    mockAddFramework.mockReturnValue({ success: true });
    mockUpdateFramework.mockReturnValue({ success: true });
    mockDeleteFramework.mockReturnValue({ success: true });
    mockSetSelectedFrameworks.mockReturnValue({ success: true });
    mockAddQuestion.mockReturnValue({ success: true });
    mockUpdateQuestion.mockReturnValue({ success: true });
    mockDeleteQuestion.mockReturnValue({ success: true });
    mockAssignQuestionsToUser.mockReturnValue({ success: true });
    mockClearAllData.mockResolvedValue({ success: true });
    global.confirm = vi.fn(() => true);
    global.alert = vi.fn();
  });

  describe('Component Rendering', () => {
    it('should render the admin panel', () => {
      const { container } = render(<EnhancedAdminPanel />);
      expect(container).toBeTruthy();
    });

    it('should render all tab buttons', () => {
      render(<EnhancedAdminPanel />);
      expect(screen.getByText('Domains')).toBeInTheDocument();
      expect(screen.getByText('Frameworks')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Questions')).toBeInTheDocument();
      expect(screen.getByText('Assignments')).toBeInTheDocument();
      expect(screen.getByText('Data Management')).toBeInTheDocument();
    });

    it('should render domains tab by default', () => {
      render(<EnhancedAdminPanel />);
      expect(screen.getByText('Security')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to frameworks tab', () => {
      render(<EnhancedAdminPanel />);
      fireEvent.click(screen.getByText('Frameworks'));
      expect(screen.getByText('ISO 27001')).toBeInTheDocument();
    });

    it('should switch to users tab', () => {
      render(<EnhancedAdminPanel />);
      fireEvent.click(screen.getByText('Users'));
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should switch to questions tab', () => {
      render(<EnhancedAdminPanel />);
      fireEvent.click(screen.getByText('Questions'));
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    it('should switch to assignments tab', () => {
      render(<EnhancedAdminPanel />);
      fireEvent.click(screen.getByText('Assignments'));
      expect(screen.getByText('Assign Questions to Users')).toBeInTheDocument();
    });

    it('should switch to data management tab', () => {
      render(<EnhancedAdminPanel />);
      fireEvent.click(screen.getByText('Data Management'));
      expect(screen.getByText('Export Data')).toBeInTheDocument();
      expect(screen.getByText('Import Data')).toBeInTheDocument();
    });
  });

  describe('Domain Management - Add', () => {
    it('should call addDomain when form is submitted with valid data', async () => {
      render(<EnhancedAdminPanel />);
      
      const inputs = screen.getAllByRole('textbox');
      const domainIdInput = inputs[0];
      const domainTitleInput = inputs[1];
      
      fireEvent.change(domainIdInput, { target: { value: 'new-domain' } });
      fireEvent.change(domainTitleInput, { target: { value: 'New Domain' } });
      
      const buttons = screen.getAllByRole('button');
      const addButton = buttons.find(btn => btn.textContent === 'Add Domain');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockAddDomain).toHaveBeenCalled();
      });
    });

    it('should show error when addDomain fails', async () => {
      mockAddDomain.mockReturnValue({ success: false, error: 'Failed to add' });
      render(<EnhancedAdminPanel />);
      
      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[0], { target: { value: 'test' } });
      fireEvent.change(inputs[1], { target: { value: 'Test' } });
      
      const buttons = screen.getAllByRole('button');
      const addButton = buttons.find(btn => btn.textContent === 'Add Domain');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to add/)).toBeInTheDocument();
      });
    });
  });

  describe('Domain Management - Edit/Update', () => {
    it('should populate form when edit is clicked', () => {
      render(<EnhancedAdminPanel />);
      
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      const inputs = screen.getAllByRole('textbox');
      expect(inputs[1].value).toBe('Security');
    });

    it('should call updateDomain when update button is clicked', async () => {
      render(<EnhancedAdminPanel />);
      
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[1], { target: { value: 'Updated Security' } });
      
      const updateButton = screen.getByText('Update Domain');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockUpdateDomain).toHaveBeenCalled();
      });
    });

    it('should cancel editing when cancel button is clicked', () => {
      render(<EnhancedAdminPanel />);
      
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(screen.queryByText('Update Domain')).not.toBeInTheDocument();
    });
  });

  describe('Domain Management - Delete', () => {
    it('should call deleteDomain when delete is clicked', async () => {
      render(<EnhancedAdminPanel />);
      
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockDeleteDomain).toHaveBeenCalledWith('domain1');
      });
    });
  });

  describe('Framework Management', () => {
    beforeEach(() => {
      render(<EnhancedAdminPanel />);
      fireEvent.click(screen.getByText('Frameworks'));
    });

    it('should render frameworks', () => {
      expect(screen.getByText('ISO 27001')).toBeInTheDocument();
    });

    it('should call addFramework when form is submitted', async () => {
      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[0], { target: { value: 'new-fw' } });
      fireEvent.change(inputs[1], { target: { value: 'New Framework' } });
      
      const buttons = screen.getAllByRole('button');
      const addButton = buttons.find(btn => btn.textContent === 'Add Framework');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockAddFramework).toHaveBeenCalled();
      });
    });

    it('should call updateFramework when update is clicked', async () => {
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[1], { target: { value: 'Updated ISO' } });
      
      const updateButton = screen.getByText('Update Framework');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockUpdateFramework).toHaveBeenCalled();
      });
    });

    it('should call deleteFramework when delete is clicked', async () => {
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockDeleteFramework).toHaveBeenCalledWith('fw1');
      });
    });

    it('should toggle framework selection', () => {
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(mockSetSelectedFrameworks).toHaveBeenCalled();
    });
  });

  describe('User Management', () => {
    beforeEach(() => {
      render(<EnhancedAdminPanel />);
      fireEvent.click(screen.getByText('Users'));
    });

    it('should render users', () => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should call addUser when form is submitted', async () => {
      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[0], { target: { value: 'new-user' } });
      fireEvent.change(inputs[1], { target: { value: 'New User' } });
      fireEvent.change(inputs[2], { target: { value: 'new@example.com' } });
      
      const buttons = screen.getAllByRole('button');
      const addButton = buttons.find(btn => btn.textContent === 'Add User');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockAddUser).toHaveBeenCalled();
      });
    });

    it('should call updateUser when update is clicked', async () => {
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[1], { target: { value: 'Updated John' } });
      
      const updateButton = screen.getByText('Update User');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalled();
      });
    });

    it('should call deleteUser when delete is clicked', async () => {
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockDeleteUser).toHaveBeenCalledWith('user1');
      });
    });
  });

  describe('Question Management', () => {
    beforeEach(() => {
      render(<EnhancedAdminPanel />);
      fireEvent.click(screen.getByText('Questions'));
    });

    it('should render questions', () => {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    it('should have add question form', () => {
      const buttons = screen.getAllByRole('button');
      const addButton = buttons.find(btn => btn.textContent === 'Add Question');
      expect(addButton).toBeInTheDocument();
    });

    it('should call updateQuestion when update is clicked', async () => {
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[1], { target: { value: 'Updated Question' } });
      
      const updateButton = screen.getByText('Update Question');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockUpdateQuestion).toHaveBeenCalled();
      });
    });

    it('should call deleteQuestion when delete is clicked', async () => {
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockDeleteQuestion).toHaveBeenCalledWith('q1');
      });
    });
  });

  describe('Assignment Management', () => {
    beforeEach(() => {
      render(<EnhancedAdminPanel />);
      fireEvent.click(screen.getByText('Assignments'));
    });

    it('should render assignment interface', () => {
      expect(screen.getByText('Assign Questions to Users')).toBeInTheDocument();
    });

    it('should have user selection dropdown', () => {
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('should have assign button', () => {
      const assignButton = screen.getByText('Assign Selected Questions');
      expect(assignButton).toBeInTheDocument();
    });

    it('should call assignQuestionsToUser when valid', async () => {
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'user1' } });

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      const assignButton = screen.getByText('Assign Selected Questions');
      fireEvent.click(assignButton);

      await waitFor(() => {
        expect(mockAssignQuestionsToUser).toHaveBeenCalled();
      });
    });
  });

  describe('Data Management - Export', () => {
    beforeEach(() => {
      render(<EnhancedAdminPanel />);
      fireEvent.click(screen.getByText('Data Management'));
    });

    it('should have export button', () => {
      const exportButton = screen.getByText('Export Data');
      expect(exportButton).toBeInTheDocument();
    });
  });

  describe('Data Management - Import', () => {
    beforeEach(() => {
      render(<EnhancedAdminPanel />);
      fireEvent.click(screen.getByText('Data Management'));
    });

    it('should have file input for import', () => {
      const fileInput = screen.getByLabelText(/Import Data/);
      expect(fileInput).toBeInTheDocument();
      expect(fileInput.getAttribute('accept')).toBe('.json');
    });

    it('should have import label', () => {
      const importLabel = screen.getByText('Import Data');
      expect(importLabel).toBeInTheDocument();
    });
  });

  describe('Clear All Data', () => {
    beforeEach(() => {
      render(<EnhancedAdminPanel />);
      fireEvent.click(screen.getByText('Data Management'));
    });

    it('should call clearAllData with double confirmation', async () => {
      global.confirm = vi.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true);

      const clearButton = screen.getByText('Clear All Data');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(mockClearAllData).toHaveBeenCalled();
      });
    });

    it('should not clear if first confirmation is cancelled', async () => {
      global.confirm = vi.fn().mockReturnValueOnce(false);

      const clearButton = screen.getByText('Clear All Data');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(mockClearAllData).not.toHaveBeenCalled();
      });
    });

    it('should not clear if second confirmation is cancelled', async () => {
      global.confirm = vi.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const clearButton = screen.getByText('Clear All Data');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(mockClearAllData).not.toHaveBeenCalled();
      });
    });

    it('should handle clear errors', async () => {
      mockClearAllData.mockResolvedValue({ success: false, error: 'Clear failed' });
      global.confirm = vi.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true);

      const clearButton = screen.getByText('Clear All Data');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText(/Clear failed/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error messages', async () => {
      mockAddDomain.mockReturnValue({ success: false, error: 'Test error' });
      render(<EnhancedAdminPanel />);
      
      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[0], { target: { value: 'test' } });
      fireEvent.change(inputs[1], { target: { value: 'Test' } });
      
      const buttons = screen.getAllByRole('button');
      const addButton = buttons.find(btn => btn.textContent === 'Add Domain');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/Test error/)).toBeInTheDocument();
      });
    });

    it('should have message display functionality', async () => {
      mockAddDomain.mockReturnValue({ success: true });
      render(<EnhancedAdminPanel />);
      
      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[0], { target: { value: 'test' } });
      fireEvent.change(inputs[1], { target: { value: 'Test' } });
      
      const buttons = screen.getAllByRole('button');
      const addButton = buttons.find(btn => btn.textContent === 'Add Domain');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockAddDomain).toHaveBeenCalled();
      });
    });
  });

  describe('Data Statistics', () => {
    beforeEach(() => {
      render(<EnhancedAdminPanel />);
      fireEvent.click(screen.getByText('Data Management'));
    });

    it('should display current data statistics', () => {
      expect(screen.getByText(/Current Data Statistics/)).toBeInTheDocument();
      expect(screen.getByText(/Domains:/)).toBeInTheDocument();
      expect(screen.getByText(/Frameworks:/)).toBeInTheDocument();
      expect(screen.getByText(/Users:/)).toBeInTheDocument();
      expect(screen.getByText(/Questions:/)).toBeInTheDocument();
    });
  });
});