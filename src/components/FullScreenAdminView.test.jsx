import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { FullScreenAdminView } from './FullScreenAdminView';

// Mock child components
vi.mock('./DomainRadarChart', () => ({
  DomainRadarChart: () => <div data-testid="domain-radar-chart">Radar Chart</div>
}));

vi.mock('./DomainBarChart', () => ({
  DomainBarChart: () => <div data-testid="domain-bar-chart">Bar Chart</div>
}));

vi.mock('./DomainHeatmap', () => ({
  DomainHeatmap: () => <div data-testid="domain-heatmap">Heatmap</div>
}));

vi.mock('./ComplianceDashboard', () => ({
  ComplianceDashboard: () => <div data-testid="compliance-dashboard">Compliance Dashboard</div>
}));

vi.mock('./BenchmarkTrendChart', () => ({
  BenchmarkTrendChart: () => <div data-testid="benchmark-trend-chart">Benchmark Trend</div>
}));

vi.mock('./CompareExports', () => ({
  CompareExports: () => <div data-testid="compare-exports">Compare Exports</div>
}));

vi.mock('./CSVImportExport', () => ({
  CSVImportExport: () => <div data-testid="csv-import-export-stub">CSV Import Export</div>
}));

vi.mock('../hooks/useRouter', () => {
  const { useState, useCallback } = require('react');
  return {
    useRouter: () => {
      const [subRoute, setSubRoute] = useState(null);
      const navigate = useCallback((route, sub) => {
        setSubRoute(sub || null);
      }, []);
      return {
        currentSubRoute: subRoute,
        navigate,
        currentRoute: 'admin',
        isRoute: vi.fn()
      };
    }
  };
});

// Stable mock references for useDataStore (avoids infinite useEffect loops)
const datastoreMocks = vi.hoisted(() => ({
  getDomains: vi.fn(() => ({})),
  addDomain: vi.fn(),
  updateDomain: vi.fn(),
  deleteDomain: vi.fn(),
  getFrameworks: vi.fn(() => []),
  getSelectedFrameworks: vi.fn(() => []),
  addFramework: vi.fn(),
  updateFramework: vi.fn(),
  deleteFramework: vi.fn(),
  setSelectedFrameworks: vi.fn().mockResolvedValue(undefined),
  getUsers: vi.fn(() => []),
  addUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  getQuestions: vi.fn(() => []),
  addQuestion: vi.fn(),
  updateQuestion: vi.fn(),
  deleteQuestion: vi.fn(),
  getUserAssignments: vi.fn(() => []),
  assignQuestionsToUser: vi.fn(),
}));

vi.mock('../hooks/useDataStore', () => ({
  useDataStore: () => datastoreMocks
}));

vi.mock('../services/storageService', () => ({
  storageService: {
    loadUsersCompletionStatus: vi.fn().mockResolvedValue([]),
    saveLastActive: vi.fn(),
    loadLastActive: vi.fn().mockReturnValue(null)
  }
}));

vi.mock('../services/dataService', () => ({
  dataService: {
    loadBenchmarks: vi.fn().mockResolvedValue(null)
  }
}));

describe('FullScreenAdminView', () => {
  const mockDomains = {
    domain1: {
      title: 'Test Domain',
      categories: {
        cat1: {
          title: 'Test Category',
          questions: [{ id: 'q1', text: 'Question 1' }]
        }
      }
    }
  };

  const mockAnswers = { q1: 3 };
  const mockEvidence = { q1: { photos: ['photo1.jpg'] } };
  const mockFrameworks = [{ id: 'fw1', name: 'Framework 1' }];
  const mockOnExportPDF = vi.fn();
  const mockOnLogout = vi.fn();
  const mockOnImportData = vi.fn();
  const mockOnExportData = vi.fn();
  const mockOnClearAllData = vi.fn();

  const defaultProps = {
    domains: mockDomains,
    answers: mockAnswers,
    evidence: mockEvidence,
    frameworks: mockFrameworks,
    onExportPDF: mockOnExportPDF,
    onLogout: mockOnLogout,
    onImportData: mockOnImportData,
    onExportData: mockOnExportData,
    onClearAllData: mockOnClearAllData
  };

  beforeEach(() => {
    vi.clearAllMocks();
    datastoreMocks.getDomains.mockReturnValue({});
    datastoreMocks.getFrameworks.mockReturnValue([]);
    datastoreMocks.getSelectedFrameworks.mockReturnValue([]);
    datastoreMocks.getUsers.mockReturnValue([]);
    datastoreMocks.getQuestions.mockReturnValue([]);
    datastoreMocks.getUserAssignments.mockReturnValue([]);
    datastoreMocks.setSelectedFrameworks.mockResolvedValue(undefined);
  });

  describe('Component Rendering', () => {
    it('should render full-screen admin layout', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      expect(screen.getByTestId('full-screen-admin-view')).toBeInTheDocument();
    });

    it('should render navigation bar with 3 primary tabs', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      expect(screen.getByTestId('overview-tab')).toBeInTheDocument();
      expect(screen.getByTestId('configure-tab')).toBeInTheDocument();
      expect(screen.getByTestId('data-tab')).toBeInTheDocument();
    });

    it('should show Overview tab as active by default', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      expect(screen.getByTestId('overview-tab')).toHaveClass('active');
    });

    it('should render export PDF button in header', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      expect(screen.getByText(/Export PDF Report/)).toBeInTheDocument();
    });

    it('should render logout button in header', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      expect(screen.getByText(/Logout/)).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should show overview content by default', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      expect(screen.getByTestId('overview-content')).toBeInTheDocument();
    });

    it('should switch to Configure tab when clicked', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      expect(screen.getByTestId('configure-tab')).toHaveClass('active');
      expect(screen.getByTestId('configure-content')).toBeInTheDocument();
    });

    it('should switch to Data tab when clicked', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('data-tab'));
      expect(screen.getByTestId('data-tab')).toHaveClass('active');
      expect(screen.getByTestId('data-management-content')).toBeInTheDocument();
    });

    it('should switch back to Overview tab', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('data-tab'));
      fireEvent.click(screen.getByTestId('overview-tab'));
      expect(screen.getByTestId('overview-content')).toBeInTheDocument();
    });

    it('should only show one tab content at a time', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      expect(screen.getByTestId('overview-content')).toBeInTheDocument();
      expect(screen.queryByTestId('configure-content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('data-management-content')).not.toBeInTheDocument();
    });
  });

  describe('Data Tab', () => {
    it('should render import/export section', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('data-tab'));
      expect(screen.getByTestId('file-input')).toBeInTheDocument();
      expect(screen.getByTestId('export-data-button')).toBeInTheDocument();
    });

    it('should render reset to defaults section', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('data-tab'));
      expect(screen.getByTestId('reset-to-defaults-button')).toBeInTheDocument();
      expect(screen.getByText(/Danger Zone/)).toBeInTheDocument();
    });

    it('should call onImportData when import button is clicked', async () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('data-tab'));
      const file = new File(['{"test": "data"}'], 'test.json', { type: 'application/json' });
      const input = screen.getByTestId('file-input');
      fireEvent.change(input, { target: { files: [file] } });
      await waitFor(() => {
        expect(mockOnImportData).toHaveBeenCalled();
      });
    });

    it('should call onExportData when export button is clicked', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('data-tab'));
      fireEvent.click(screen.getByTestId('export-data-button'));
      expect(mockOnExportData).toHaveBeenCalledTimes(1);
    });

    it('should show inline confirmation when reset button is clicked', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('data-tab'));
      fireEvent.click(screen.getByTestId('reset-to-defaults-button'));
      expect(screen.getByTestId('reset-confirm-row')).toBeInTheDocument();
      expect(screen.getByTestId('reset-confirm-button')).toBeInTheDocument();
      expect(screen.getByTestId('reset-cancel-button')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure/)).toBeInTheDocument();
    });

    it('should call onClearAllData when confirm reset is clicked', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('data-tab'));
      fireEvent.click(screen.getByTestId('reset-to-defaults-button'));
      fireEvent.click(screen.getByTestId('reset-confirm-button'));
      expect(mockOnClearAllData).toHaveBeenCalledTimes(1);
    });

    it('should cancel reset confirmation when cancel is clicked', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('data-tab'));
      fireEvent.click(screen.getByTestId('reset-to-defaults-button'));
      expect(screen.getByTestId('reset-confirm-row')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('reset-cancel-button'));
      expect(screen.queryByTestId('reset-confirm-row')).not.toBeInTheDocument();
      expect(screen.getByTestId('reset-to-defaults-button')).toBeInTheDocument();
    });

    it('should auto-cancel reset confirmation after timeout', () => {
      vi.useFakeTimers();
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('data-tab'));
      fireEvent.click(screen.getByTestId('reset-to-defaults-button'));
      expect(screen.getByTestId('reset-confirm-row')).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.queryByTestId('reset-confirm-row')).not.toBeInTheDocument();
      expect(screen.getByTestId('reset-to-defaults-button')).toBeInTheDocument();
      vi.useRealTimers();
    });
  });

  describe('Overview Tab', () => {
    it('should render charts in Overview tab', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      expect(screen.getByTestId('domain-radar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('domain-bar-chart')).toBeInTheDocument();
    });

    it('should render compliance dashboard in Overview tab', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      expect(screen.getByTestId('compliance-dashboard')).toBeInTheDocument();
    });

    it('should render heatmap in Overview tab', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
    });
  });

  describe('Participant Completion', () => {
    it('should show completion section in Overview tab', async () => {
      const { storageService } = await import('../services/storageService');
      storageService.loadUsersCompletionStatus.mockResolvedValue([]);

      render(<FullScreenAdminView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('completion-section')).toBeInTheDocument();
      });
    });

    it('should show completion table rows for each user', async () => {
      const { storageService } = await import('../services/storageService');
      storageService.loadUsersCompletionStatus.mockResolvedValue([
        { userId: 'u1', name: 'Alice', total: 10, answered: 7, percentage: 70, lastActive: null },
        { userId: 'u2', name: 'Bob', total: 8, answered: 8, percentage: 100, lastActive: '2024-01-15T10:00:00.000Z' }
      ]);

      render(<FullScreenAdminView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('completion-row-u1')).toBeInTheDocument();
        expect(screen.getByTestId('completion-row-u2')).toBeInTheDocument();
      });
    });

    it('should show "—" for users with no last active timestamp', async () => {
      const { storageService } = await import('../services/storageService');
      storageService.loadUsersCompletionStatus.mockResolvedValue([
        { userId: 'u1', name: 'Alice', total: 10, answered: 0, percentage: 0, lastActive: null }
      ]);

      render(<FullScreenAdminView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('—')).toBeInTheDocument();
      });
    });
  });

  describe('Header Actions', () => {
    it('should call onExportPDF when export PDF button is clicked', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('export-pdf-button'));
      expect(mockOnExportPDF).toHaveBeenCalledTimes(1);
    });

    it('should call onLogout when logout button is clicked', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('logout-button'));
      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty domains gracefully', () => {
      render(<FullScreenAdminView {...defaultProps} domains={{}} />);
      expect(screen.getByTestId('full-screen-admin-view')).toBeInTheDocument();
    });

    it('should handle empty frameworks gracefully', () => {
      render(<FullScreenAdminView {...defaultProps} frameworks={[]} />);
      expect(screen.getByTestId('compliance-dashboard')).toBeInTheDocument();
    });
  });

  describe('Configure Tab', () => {
    it('should show People sub-tab by default when Configure is opened', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      expect(screen.getByTestId('people-sub-tab')).toHaveClass('active');
      expect(screen.getByTestId('people-content')).toBeInTheDocument();
    });

    it('should switch to Content sub-tab', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));
      expect(screen.getByTestId('content-sub-tab')).toHaveClass('active');
      expect(screen.getByTestId('content-content')).toBeInTheDocument();
    });

    it('should switch to Frameworks sub-tab', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('frameworks-sub-tab'));
      expect(screen.getByTestId('frameworks-sub-tab')).toHaveClass('active');
      expect(screen.getByTestId('frameworks-content')).toBeInTheDocument();
    });

    it('should show domains-content in Content sub-tab', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));
      expect(screen.getByTestId('domains-content')).toBeInTheDocument();
    });

    it('should show assignments-content in People sub-tab', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      expect(screen.getByTestId('assignments-content')).toBeInTheDocument();
    });

    describe('Frameworks sub-tab', () => {
      it('should show framework checkboxes as checked when framework is selected', () => {
        const fw = { id: 'fw1', name: 'Framework 1' };
        datastoreMocks.getFrameworks.mockReturnValue([fw]);
        datastoreMocks.getSelectedFrameworks.mockReturnValue([fw]);

        render(<FullScreenAdminView {...defaultProps} />);
        fireEvent.click(screen.getByTestId('configure-tab'));
        fireEvent.click(screen.getByTestId('frameworks-sub-tab'));

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeChecked();
      });

      it('should show framework checkboxes as unchecked when framework is not selected', () => {
        const fw = { id: 'fw1', name: 'Framework 1' };
        datastoreMocks.getFrameworks.mockReturnValue([fw]);
        datastoreMocks.getSelectedFrameworks.mockReturnValue([]);

        render(<FullScreenAdminView {...defaultProps} />);
        fireEvent.click(screen.getByTestId('configure-tab'));
        fireEvent.click(screen.getByTestId('frameworks-sub-tab'));

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on primary tabs', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      const dataTab = screen.getByTestId('data-tab');
      expect(dataTab).toHaveAttribute('role', 'tab');
      expect(dataTab).toHaveAttribute('aria-selected', 'false');
    });

    it('should have proper ARIA label on export PDF button', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      expect(screen.getByTestId('export-pdf-button')).toHaveAttribute('aria-label');
    });
  });

  describe('Configure Tab Display', () => {
    it('should show domain list when domains exist', () => {
      datastoreMocks.getDomains.mockReturnValue({
        d1: { id: 'd1', title: 'Domain 1', description: 'First domain', weight: 0.5, categories: {} }
      });

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));

      const domainsSection = screen.getByTestId('domains-content');
      expect(domainsSection).toBeInTheDocument();
      // Domain title appears both as list item and as <option> in question form select; scope to domains section
      expect(domainsSection.querySelector('.cfg-item-title').textContent).toBe('Domain 1');
    });

    it('should show user list when users exist', () => {
      datastoreMocks.getUsers.mockReturnValue([
        { id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'user' },
        { id: 'u2', name: 'Bob', email: 'bob@test.com', role: 'admin' }
      ]);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));

      expect(screen.getByTestId('people-content')).toBeInTheDocument();
      // User names appear both as list item titles and as <option> in assignment select; scope to users section
      const usersSection = screen.getByTestId('users-content');
      const userTitles = usersSection.querySelectorAll('.cfg-item-title');
      const names = Array.from(userTitles).map(el => el.textContent);
      expect(names).toContain('Alice');
      expect(names).toContain('Bob');
    });

    it('should show questions in Content sub-tab', () => {
      datastoreMocks.getQuestions.mockReturnValue([
        { id: 'q1', text: 'How mature is your data pipeline?', domainId: 'domain1', categoryId: 'cat1', requiresEvidence: false },
        { id: 'q2', text: 'Do you have automated testing?', domainId: 'domain1', categoryId: 'cat2', requiresEvidence: true }
      ]);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));

      expect(screen.getByTestId('questions-content')).toBeInTheDocument();
      expect(screen.getByText('How mature is your data pipeline?')).toBeInTheDocument();
      expect(screen.getByText('Do you have automated testing?')).toBeInTheDocument();
    });
  });

  describe('Compliance Framework Question Mapping', () => {
    beforeEach(() => {
      datastoreMocks.getFrameworks.mockReturnValue([
        { id: 'fw1', name: 'Framework 1', mappedQuestions: [] }
      ]);
      datastoreMocks.getQuestions.mockReturnValue([
        { id: 'q1', text: 'Question 1', domainId: 'domain1' },
        { id: 'q2', text: 'Question 2', domainId: 'domain1' }
      ]);
    });

    it('should show mapping toggle on framework items', async () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('frameworks-sub-tab'));

      await waitFor(() => {
        expect(screen.getByTestId('mapping-toggle-fw1')).toBeInTheDocument();
      });
    });

    it('should show mapped question count in toggle summary', async () => {
      datastoreMocks.getFrameworks.mockReturnValue([
        { id: 'fw1', name: 'Framework 1', mappedQuestions: ['q1'] }
      ]);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('frameworks-sub-tab'));

      await waitFor(() => {
        expect(screen.getByText(/1 mapped/)).toBeInTheDocument();
      });
    });

    it('should call updateFramework when a question mapping is toggled', async () => {
      datastoreMocks.updateFramework.mockResolvedValue({ id: 'fw1', mappedQuestions: ['q1'] });

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('frameworks-sub-tab'));

      await waitFor(() => {
        expect(screen.getByTestId('mapping-toggle-fw1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('mapping-toggle-fw1'));

      await waitFor(() => {
        const checkbox = screen.getByTestId('map-question-fw1-q1');
        fireEvent.click(checkbox);
      });

      await waitFor(() => {
        expect(datastoreMocks.updateFramework).toHaveBeenCalledWith(
          'fw1',
          expect.objectContaining({ mappedQuestions: expect.any(Array) })
        );
      });
    });

    it('should show no-questions hint when no questions are available', async () => {
      datastoreMocks.getQuestions.mockReturnValue([]);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('frameworks-sub-tab'));

      await waitFor(() => {
        fireEvent.click(screen.getByTestId('mapping-toggle-fw1'));
      });

      await waitFor(() => {
        expect(screen.getByText('No questions available. Add questions first.')).toBeInTheDocument();
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // NEW TESTS: CRUD handlers, assignment logic, sort, excel export, messages
  // ══════════════════════════════════════════════════════════════════════════

  describe('Domain CRUD Handlers', () => {
    it('should call addDomain and refresh domain list on success', async () => {
      datastoreMocks.addDomain.mockResolvedValue(undefined);
      datastoreMocks.getDomains
        .mockReturnValueOnce({}) // initial useEffect
        .mockReturnValue({
          d_new: { id: 'd_new', title: 'New Domain', description: 'Desc', weight: 0.5, categories: {} }
        });

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));

      fireEvent.change(screen.getByPlaceholderText('e.g. security'), { target: { value: 'd_new' } });
      fireEvent.change(screen.getByPlaceholderText('Data Governance'), { target: { value: 'New Domain' } });
      fireEvent.change(screen.getByPlaceholderText('Optional description'), { target: { value: 'Desc' } });
      fireEvent.change(screen.getByPlaceholderText('1.0'), { target: { value: '0.5' } });

      fireEvent.click(screen.getByText('Add Domain'));

      await waitFor(() => {
        expect(datastoreMocks.addDomain).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'd_new', title: 'New Domain', description: 'Desc', weight: 0.5 })
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Domain added successfully!')).toBeInTheDocument();
      });
    });

    it('should show error message when addDomain fails', async () => {
      datastoreMocks.addDomain.mockRejectedValue(new Error('Duplicate domain ID'));
      datastoreMocks.getDomains.mockReturnValue({});

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));

      fireEvent.change(screen.getByPlaceholderText('e.g. security'), { target: { value: 'd1' } });
      fireEvent.change(screen.getByPlaceholderText('Data Governance'), { target: { value: 'Test' } });

      fireEvent.click(screen.getByText('Add Domain'));

      await waitFor(() => {
        expect(screen.getByText('Duplicate domain ID')).toBeInTheDocument();
      });
    });

    it('should enter edit mode and call updateDomain on save', async () => {
      const existingDomain = { id: 'd1', title: 'Domain 1', description: 'Old', weight: 0.5, categories: {} };
      datastoreMocks.getDomains.mockReturnValue({ d1: existingDomain });
      datastoreMocks.updateDomain.mockResolvedValue(undefined);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));

      // Click Edit button on the domain item
      const domainsSection = screen.getByTestId('domains-content');
      const editBtn = domainsSection.querySelector('.cfg-btn--secondary');
      fireEvent.click(editBtn);

      // Should now show Update Domain button and pre-filled form
      expect(screen.getByText('Update Domain')).toBeInTheDocument();

      // Modify the title
      const titleInput = screen.getByDisplayValue('Domain 1');
      fireEvent.change(titleInput, { target: { value: 'Updated Domain' } });

      fireEvent.click(screen.getByText('Update Domain'));

      await waitFor(() => {
        expect(datastoreMocks.updateDomain).toHaveBeenCalledWith(
          'd1',
          expect.objectContaining({ title: 'Updated Domain' })
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Domain updated successfully!')).toBeInTheDocument();
      });
    });

    it('should show error message when updateDomain fails', async () => {
      const existingDomain = { id: 'd1', title: 'Domain 1', description: '', weight: 1, categories: {} };
      datastoreMocks.getDomains.mockReturnValue({ d1: existingDomain });
      datastoreMocks.updateDomain.mockRejectedValue(new Error('Update failed'));

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));

      const domainsSection = screen.getByTestId('domains-content');
      const editBtn = domainsSection.querySelector('.cfg-btn--secondary');
      fireEvent.click(editBtn);

      fireEvent.click(screen.getByText('Update Domain'));

      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument();
      });
    });

    it('should cancel domain editing and reset form', () => {
      const existingDomain = { id: 'd1', title: 'Domain 1', description: 'Old', weight: 0.5, categories: {} };
      datastoreMocks.getDomains.mockReturnValue({ d1: existingDomain });

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));

      const domainsSection = screen.getByTestId('domains-content');
      const editBtn = domainsSection.querySelector('.cfg-btn--secondary');
      fireEvent.click(editBtn);

      expect(screen.getByText('Update Domain')).toBeInTheDocument();

      // Click Cancel
      fireEvent.click(screen.getByText('Cancel'));

      // Should show Add Domain button again
      expect(screen.getByText('Add Domain')).toBeInTheDocument();
    });

    it('should call deleteDomain and refresh list on confirm', async () => {
      const existingDomain = { id: 'd1', title: 'Domain 1', description: '', weight: 1, categories: {} };
      datastoreMocks.getDomains.mockReturnValue({ d1: existingDomain });
      datastoreMocks.deleteDomain.mockResolvedValue(undefined);
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));

      const domainsSection = screen.getByTestId('domains-content');
      const deleteBtn = domainsSection.querySelector('.cfg-btn--danger');
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(datastoreMocks.deleteDomain).toHaveBeenCalledWith('d1');
      });

      await waitFor(() => {
        expect(screen.getByText('Domain deleted successfully!')).toBeInTheDocument();
      });

      confirmSpy.mockRestore();
    });

    it('should not delete domain when confirm is cancelled', async () => {
      const existingDomain = { id: 'd1', title: 'Domain 1', description: '', weight: 1, categories: {} };
      datastoreMocks.getDomains.mockReturnValue({ d1: existingDomain });
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));

      const domainsSection = screen.getByTestId('domains-content');
      const deleteBtn = domainsSection.querySelector('.cfg-btn--danger');
      fireEvent.click(deleteBtn);

      expect(datastoreMocks.deleteDomain).not.toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it('should show error message when deleteDomain fails', async () => {
      const existingDomain = { id: 'd1', title: 'Domain 1', description: '', weight: 1, categories: {} };
      datastoreMocks.getDomains.mockReturnValue({ d1: existingDomain });
      datastoreMocks.deleteDomain.mockRejectedValue(new Error('Cannot delete'));
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));

      const domainsSection = screen.getByTestId('domains-content');
      const deleteBtn = domainsSection.querySelector('.cfg-btn--danger');
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(screen.getByText('Cannot delete')).toBeInTheDocument();
      });

      confirmSpy.mockRestore();
    });
  });

  describe('User CRUD Handlers', () => {
    it('should call addUser and show success message', async () => {
      datastoreMocks.addUser.mockResolvedValue(undefined);
      datastoreMocks.getUsers
        .mockReturnValueOnce([])
        .mockReturnValue([{ id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'user' }]);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));

      fireEvent.change(screen.getByPlaceholderText('e.g. alice'), { target: { value: 'u1' } });
      fireEvent.change(screen.getByPlaceholderText('Alice Smith'), { target: { value: 'Alice' } });
      fireEvent.change(screen.getByPlaceholderText('alice@example.com'), { target: { value: 'alice@test.com' } });

      fireEvent.click(screen.getByText('Add User'));

      await waitFor(() => {
        expect(datastoreMocks.addUser).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'user' })
        );
      });

      await waitFor(() => {
        expect(screen.getByText('User added successfully!')).toBeInTheDocument();
      });
    });

    it('should show error message when addUser fails', async () => {
      datastoreMocks.addUser.mockRejectedValue(new Error('User ID already exists'));

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));

      fireEvent.change(screen.getByPlaceholderText('e.g. alice'), { target: { value: 'dup' } });
      fireEvent.change(screen.getByPlaceholderText('Alice Smith'), { target: { value: 'Dup' } });

      fireEvent.click(screen.getByText('Add User'));

      await waitFor(() => {
        expect(screen.getByText('User ID already exists')).toBeInTheDocument();
      });
    });

    it('should enter edit mode, update user, and show success', async () => {
      const users = [
        { id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'user' }
      ];
      datastoreMocks.getUsers.mockReturnValue(users);
      datastoreMocks.updateUser.mockResolvedValue(undefined);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));

      // Click Edit on first user
      const usersSection = screen.getByTestId('users-content');
      const editBtn = usersSection.querySelector('.cfg-btn--secondary');
      fireEvent.click(editBtn);

      expect(screen.getByText('Update User')).toBeInTheDocument();

      // Modify name
      const nameInput = screen.getByDisplayValue('Alice');
      fireEvent.change(nameInput, { target: { value: 'Alice Updated' } });

      fireEvent.click(screen.getByText('Update User'));

      await waitFor(() => {
        expect(datastoreMocks.updateUser).toHaveBeenCalledWith(
          'u1',
          expect.objectContaining({ name: 'Alice Updated' })
        );
      });

      await waitFor(() => {
        expect(screen.getByText('User updated successfully!')).toBeInTheDocument();
      });
    });

    it('should show error message when updateUser fails', async () => {
      const users = [{ id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'user' }];
      datastoreMocks.getUsers.mockReturnValue(users);
      datastoreMocks.updateUser.mockRejectedValue(new Error('Update user failed'));

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));

      const usersSection = screen.getByTestId('users-content');
      const editBtn = usersSection.querySelector('.cfg-btn--secondary');
      fireEvent.click(editBtn);

      fireEvent.click(screen.getByText('Update User'));

      await waitFor(() => {
        expect(screen.getByText('Update user failed')).toBeInTheDocument();
      });
    });

    it('should cancel user editing and reset form', () => {
      const users = [{ id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'user' }];
      datastoreMocks.getUsers.mockReturnValue(users);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));

      const usersSection = screen.getByTestId('users-content');
      const editBtn = usersSection.querySelector('.cfg-btn--secondary');
      fireEvent.click(editBtn);

      expect(screen.getByText('Update User')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Cancel'));

      expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('should call deleteUser on confirm and show success', async () => {
      const users = [{ id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'user' }];
      datastoreMocks.getUsers.mockReturnValue(users);
      datastoreMocks.deleteUser.mockResolvedValue(undefined);
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));

      const usersSection = screen.getByTestId('users-content');
      const deleteBtn = usersSection.querySelector('.cfg-btn--danger');
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(datastoreMocks.deleteUser).toHaveBeenCalledWith('u1');
      });

      await waitFor(() => {
        expect(screen.getByText('User deleted successfully!')).toBeInTheDocument();
      });

      confirmSpy.mockRestore();
    });

    it('should not delete user when confirm is cancelled', () => {
      const users = [{ id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'user' }];
      datastoreMocks.getUsers.mockReturnValue(users);
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));

      const usersSection = screen.getByTestId('users-content');
      const deleteBtn = usersSection.querySelector('.cfg-btn--danger');
      fireEvent.click(deleteBtn);

      expect(datastoreMocks.deleteUser).not.toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it('should show error message when deleteUser fails', async () => {
      const users = [{ id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'user' }];
      datastoreMocks.getUsers.mockReturnValue(users);
      datastoreMocks.deleteUser.mockRejectedValue(new Error('Delete user error'));
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));

      const usersSection = screen.getByTestId('users-content');
      const deleteBtn = usersSection.querySelector('.cfg-btn--danger');
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(screen.getByText('Delete user error')).toBeInTheDocument();
      });

      confirmSpy.mockRestore();
    });

    it('should change user role via role select', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));

      const roleSelect = screen.getByDisplayValue('User');
      fireEvent.change(roleSelect, { target: { value: 'admin' } });
      expect(roleSelect.value).toBe('admin');
    });
  });

  describe('Question CRUD Handlers', () => {
    it('should call addQuestion and show success message', async () => {
      datastoreMocks.getDomains.mockReturnValue({
        d1: { id: 'd1', title: 'Domain 1', description: '', weight: 1, categories: {} }
      });
      datastoreMocks.addQuestion.mockResolvedValue(undefined);
      datastoreMocks.getQuestions
        .mockReturnValueOnce([])
        .mockReturnValue([{ id: 'q-new', text: 'New Q', domainId: 'd1', categoryId: 'cat1', requiresEvidence: false }]);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));

      fireEvent.change(screen.getByPlaceholderText('q-001'), { target: { value: 'q-new' } });
      fireEvent.change(screen.getByPlaceholderText('How mature is your data pipeline automation?'), { target: { value: 'New Q' } });
      fireEvent.change(screen.getByPlaceholderText('e.g. pipelines'), { target: { value: 'cat1' } });
      fireEvent.change(screen.getByDisplayValue('— select domain —'), { target: { value: 'd1' } });

      fireEvent.click(screen.getByText('Add Question'));

      await waitFor(() => {
        expect(datastoreMocks.addQuestion).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'q-new', text: 'New Q', domainId: 'd1', categoryId: 'cat1' })
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Question added successfully!')).toBeInTheDocument();
      });
    });

    it('should show error when addQuestion fails', async () => {
      datastoreMocks.getDomains.mockReturnValue({
        d1: { id: 'd1', title: 'Domain 1', description: '', weight: 1, categories: {} }
      });
      datastoreMocks.addQuestion.mockRejectedValue(new Error('Question ID taken'));

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));

      fireEvent.change(screen.getByPlaceholderText('q-001'), { target: { value: 'q-dup' } });
      fireEvent.change(screen.getByPlaceholderText('How mature is your data pipeline automation?'), { target: { value: 'Dup Q' } });

      fireEvent.click(screen.getByText('Add Question'));

      await waitFor(() => {
        expect(screen.getByText('Question ID taken')).toBeInTheDocument();
      });
    });

    it('should enter edit mode, update question, and show success', async () => {
      const questions = [
        { id: 'q1', text: 'Old question', domainId: 'd1', categoryId: 'cat1', requiresEvidence: false }
      ];
      datastoreMocks.getDomains.mockReturnValue({
        d1: { id: 'd1', title: 'Domain 1', description: '', weight: 1, categories: {} }
      });
      datastoreMocks.getQuestions.mockReturnValue(questions);
      datastoreMocks.updateQuestion.mockResolvedValue(undefined);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));

      // Click Edit on the question
      const questionsSection = screen.getByTestId('questions-content');
      const editBtn = questionsSection.querySelector('.cfg-btn--secondary');
      fireEvent.click(editBtn);

      expect(screen.getByText('Update Question')).toBeInTheDocument();

      // Modify text
      const textArea = screen.getByDisplayValue('Old question');
      fireEvent.change(textArea, { target: { value: 'Updated question' } });

      fireEvent.click(screen.getByText('Update Question'));

      await waitFor(() => {
        expect(datastoreMocks.updateQuestion).toHaveBeenCalledWith(
          'q1',
          expect.objectContaining({ text: 'Updated question' })
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Question updated successfully!')).toBeInTheDocument();
      });
    });

    it('should show error when updateQuestion fails', async () => {
      const questions = [
        { id: 'q1', text: 'Old question', domainId: 'd1', categoryId: 'cat1', requiresEvidence: false }
      ];
      datastoreMocks.getDomains.mockReturnValue({
        d1: { id: 'd1', title: 'Domain 1', description: '', weight: 1, categories: {} }
      });
      datastoreMocks.getQuestions.mockReturnValue(questions);
      datastoreMocks.updateQuestion.mockRejectedValue(new Error('Update Q failed'));

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));

      const questionsSection = screen.getByTestId('questions-content');
      const editBtn = questionsSection.querySelector('.cfg-btn--secondary');
      fireEvent.click(editBtn);

      fireEvent.click(screen.getByText('Update Question'));

      await waitFor(() => {
        expect(screen.getByText('Update Q failed')).toBeInTheDocument();
      });
    });

    it('should cancel question editing and reset form', () => {
      const questions = [
        { id: 'q1', text: 'Question text', domainId: 'd1', categoryId: 'cat1', requiresEvidence: true }
      ];
      datastoreMocks.getDomains.mockReturnValue({
        d1: { id: 'd1', title: 'Domain 1', description: '', weight: 1, categories: {} }
      });
      datastoreMocks.getQuestions.mockReturnValue(questions);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));

      const questionsSection = screen.getByTestId('questions-content');
      const editBtn = questionsSection.querySelector('.cfg-btn--secondary');
      fireEvent.click(editBtn);

      expect(screen.getByText('Update Question')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Cancel'));

      expect(screen.getByText('Add Question')).toBeInTheDocument();
    });

    it('should call deleteQuestion on confirm and show success', async () => {
      const questions = [
        { id: 'q1', text: 'To delete', domainId: 'd1', categoryId: 'cat1', requiresEvidence: false }
      ];
      datastoreMocks.getQuestions.mockReturnValue(questions);
      datastoreMocks.getDomains.mockReturnValue({
        d1: { id: 'd1', title: 'Domain 1', description: '', weight: 1, categories: {} }
      });
      datastoreMocks.deleteQuestion.mockResolvedValue(undefined);
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));

      const questionsSection = screen.getByTestId('questions-content');
      const deleteBtn = questionsSection.querySelector('.cfg-btn--danger');
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(datastoreMocks.deleteQuestion).toHaveBeenCalledWith('q1');
      });

      await waitFor(() => {
        expect(screen.getByText('Question deleted successfully!')).toBeInTheDocument();
      });

      confirmSpy.mockRestore();
    });

    it('should not delete question when confirm is cancelled', () => {
      const questions = [
        { id: 'q1', text: 'Keep me', domainId: 'd1', categoryId: 'cat1', requiresEvidence: false }
      ];
      datastoreMocks.getQuestions.mockReturnValue(questions);
      datastoreMocks.getDomains.mockReturnValue({
        d1: { id: 'd1', title: 'Domain 1', description: '', weight: 1, categories: {} }
      });
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));

      const questionsSection = screen.getByTestId('questions-content');
      const deleteBtn = questionsSection.querySelector('.cfg-btn--danger');
      fireEvent.click(deleteBtn);

      expect(datastoreMocks.deleteQuestion).not.toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it('should show error when deleteQuestion fails', async () => {
      const questions = [
        { id: 'q1', text: 'Fail delete', domainId: 'd1', categoryId: 'cat1', requiresEvidence: false }
      ];
      datastoreMocks.getQuestions.mockReturnValue(questions);
      datastoreMocks.getDomains.mockReturnValue({
        d1: { id: 'd1', title: 'Domain 1', description: '', weight: 1, categories: {} }
      });
      datastoreMocks.deleteQuestion.mockRejectedValue(new Error('Delete Q failed'));
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));

      const questionsSection = screen.getByTestId('questions-content');
      const deleteBtn = questionsSection.querySelector('.cfg-btn--danger');
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(screen.getByText('Delete Q failed')).toBeInTheDocument();
      });

      confirmSpy.mockRestore();
    });

    it('should toggle requiresEvidence checkbox in question form', () => {
      datastoreMocks.getDomains.mockReturnValue({
        d1: { id: 'd1', title: 'Domain 1', description: '', weight: 1, categories: {} }
      });

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));

      const evidenceCheckbox = screen.getByLabelText('Requires Evidence');
      expect(evidenceCheckbox).not.toBeChecked();
      fireEvent.click(evidenceCheckbox);
      expect(evidenceCheckbox).toBeChecked();
    });

    it('should show evidence badge for questions that require evidence', () => {
      const questions = [
        { id: 'q1', text: 'Evidence Q', domainId: 'd1', categoryId: 'cat1', requiresEvidence: true }
      ];
      datastoreMocks.getQuestions.mockReturnValue(questions);
      datastoreMocks.getDomains.mockReturnValue({
        d1: { id: 'd1', title: 'Domain 1', description: '', weight: 1, categories: {} }
      });

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));

      expect(screen.getByText('Evidence')).toBeInTheDocument();
    });

    it('should filter questions by search term', () => {
      const questions = [
        { id: 'q1', text: 'Pipeline maturity', domainId: 'd1', categoryId: 'cat1', requiresEvidence: false },
        { id: 'q2', text: 'Security audit', domainId: 'd2', categoryId: 'cat2', requiresEvidence: false }
      ];
      datastoreMocks.getQuestions.mockReturnValue(questions);
      datastoreMocks.getDomains.mockReturnValue({
        d1: { id: 'd1', title: 'Domain 1', description: '', weight: 1, categories: {} }
      });

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));

      expect(screen.getByText('Pipeline maturity')).toBeInTheDocument();
      expect(screen.getByText('Security audit')).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText('Filter questions…');
      fireEvent.change(searchInput, { target: { value: 'pipeline' } });

      expect(screen.getByText('Pipeline maturity')).toBeInTheDocument();
      expect(screen.queryByText('Security audit')).not.toBeInTheDocument();
    });
  });

  describe('Framework CRUD Handlers', () => {
    it('should call addFramework and show success message', async () => {
      datastoreMocks.addFramework.mockResolvedValue(undefined);
      datastoreMocks.getFrameworks
        .mockReturnValueOnce([])
        .mockReturnValue([{ id: 'fw_new', name: 'New FW', description: 'Desc', threshold: 4, requirements: ['Req1'], mappedQuestions: [] }]);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('frameworks-sub-tab'));

      fireEvent.change(screen.getByPlaceholderText('e.g. nist'), { target: { value: 'fw_new' } });
      fireEvent.change(screen.getByPlaceholderText('NIST CSF'), { target: { value: 'New FW' } });
      fireEvent.change(screen.getByPlaceholderText('Brief description'), { target: { value: 'Desc' } });
      fireEvent.change(screen.getByPlaceholderText('3.5'), { target: { value: '4' } });
      fireEvent.change(screen.getByPlaceholderText(/Annual risk assessment/), { target: { value: 'Req1\nReq2' } });

      fireEvent.click(screen.getByText('Add Framework'));

      await waitFor(() => {
        expect(datastoreMocks.addFramework).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'fw_new',
            name: 'New FW',
            threshold: 4,
            requirements: ['Req1', 'Req2']
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Framework added successfully!')).toBeInTheDocument();
      });
    });

    it('should show error when addFramework fails', async () => {
      datastoreMocks.addFramework.mockRejectedValue(new Error('Framework ID exists'));

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('frameworks-sub-tab'));

      fireEvent.change(screen.getByPlaceholderText('e.g. nist'), { target: { value: 'fw1' } });
      fireEvent.change(screen.getByPlaceholderText('NIST CSF'), { target: { value: 'Dup FW' } });

      fireEvent.click(screen.getByText('Add Framework'));

      await waitFor(() => {
        expect(screen.getByText('Framework ID exists')).toBeInTheDocument();
      });
    });

    it('should enter edit mode, update framework, and show success', async () => {
      const fws = [
        { id: 'fw1', name: 'FW1', description: 'Old desc', threshold: 3.5, requirements: ['R1'], mappedQuestions: [] }
      ];
      datastoreMocks.getFrameworks.mockReturnValue(fws);
      datastoreMocks.updateFramework.mockResolvedValue(undefined);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('frameworks-sub-tab'));

      // Click Edit on framework
      const editBtn = screen.getByTestId('frameworks-content').querySelector('.cfg-btn--secondary');
      fireEvent.click(editBtn);

      expect(screen.getByText('Update Framework')).toBeInTheDocument();

      // Modify name
      const nameInput = screen.getByDisplayValue('FW1');
      fireEvent.change(nameInput, { target: { value: 'Updated FW' } });

      fireEvent.click(screen.getByText('Update Framework'));

      await waitFor(() => {
        expect(datastoreMocks.updateFramework).toHaveBeenCalledWith(
          'fw1',
          expect.objectContaining({ name: 'Updated FW' })
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Framework updated successfully!')).toBeInTheDocument();
      });
    });

    it('should show error when updateFramework fails', async () => {
      const fws = [
        { id: 'fw1', name: 'FW1', description: '', threshold: 3.5, requirements: [], mappedQuestions: [] }
      ];
      datastoreMocks.getFrameworks.mockReturnValue(fws);
      datastoreMocks.updateFramework.mockRejectedValue(new Error('Update FW error'));

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('frameworks-sub-tab'));

      const editBtn = screen.getByTestId('frameworks-content').querySelector('.cfg-btn--secondary');
      fireEvent.click(editBtn);

      fireEvent.click(screen.getByText('Update Framework'));

      await waitFor(() => {
        expect(screen.getByText('Update FW error')).toBeInTheDocument();
      });
    });

    it('should cancel framework editing and reset form', () => {
      const fws = [
        { id: 'fw1', name: 'FW1', description: 'Desc', threshold: 3.5, requirements: ['R1'], mappedQuestions: [] }
      ];
      datastoreMocks.getFrameworks.mockReturnValue(fws);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('frameworks-sub-tab'));

      const editBtn = screen.getByTestId('frameworks-content').querySelector('.cfg-btn--secondary');
      fireEvent.click(editBtn);

      expect(screen.getByText('Update Framework')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Cancel'));

      expect(screen.getByText('Add Framework')).toBeInTheDocument();
    });

    it('should call deleteFramework on confirm and show success', async () => {
      const fws = [
        { id: 'fw1', name: 'FW1', description: '', threshold: 3.5, requirements: [], mappedQuestions: [] }
      ];
      datastoreMocks.getFrameworks.mockReturnValue(fws);
      datastoreMocks.deleteFramework.mockResolvedValue(undefined);
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('frameworks-sub-tab'));

      const deleteBtn = screen.getByTestId('frameworks-content').querySelector('.cfg-btn--danger');
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(datastoreMocks.deleteFramework).toHaveBeenCalledWith('fw1');
      });

      await waitFor(() => {
        expect(screen.getByText('Framework deleted successfully!')).toBeInTheDocument();
      });

      confirmSpy.mockRestore();
    });

    it('should not delete framework when confirm is cancelled', () => {
      const fws = [
        { id: 'fw1', name: 'FW1', description: '', threshold: 3.5, requirements: [], mappedQuestions: [] }
      ];
      datastoreMocks.getFrameworks.mockReturnValue(fws);
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('frameworks-sub-tab'));

      const deleteBtn = screen.getByTestId('frameworks-content').querySelector('.cfg-btn--danger');
      fireEvent.click(deleteBtn);

      expect(datastoreMocks.deleteFramework).not.toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it('should show error when deleteFramework fails', async () => {
      const fws = [
        { id: 'fw1', name: 'FW1', description: '', threshold: 3.5, requirements: [], mappedQuestions: [] }
      ];
      datastoreMocks.getFrameworks.mockReturnValue(fws);
      datastoreMocks.deleteFramework.mockRejectedValue(new Error('Delete FW error'));
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('frameworks-sub-tab'));

      const deleteBtn = screen.getByTestId('frameworks-content').querySelector('.cfg-btn--danger');
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(screen.getByText('Delete FW error')).toBeInTheDocument();
      });

      confirmSpy.mockRestore();
    });

    it('should handle addFramework with empty requirements string', async () => {
      datastoreMocks.addFramework.mockResolvedValue(undefined);
      datastoreMocks.getFrameworks
        .mockReturnValueOnce([])
        .mockReturnValue([{ id: 'fw2', name: 'FW2', description: '', threshold: 60, requirements: [], mappedQuestions: [] }]);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('frameworks-sub-tab'));

      fireEvent.change(screen.getByPlaceholderText('e.g. nist'), { target: { value: 'fw2' } });
      fireEvent.change(screen.getByPlaceholderText('NIST CSF'), { target: { value: 'FW2' } });
      // Leave requirements empty

      fireEvent.click(screen.getByText('Add Framework'));

      await waitFor(() => {
        expect(datastoreMocks.addFramework).toHaveBeenCalledWith(
          expect.objectContaining({ requirements: [] })
        );
      });
    });

    it('should toggle framework selection checkbox', async () => {
      const fws = [
        { id: 'fw1', name: 'FW1', description: '', threshold: 3.5, requirements: [], mappedQuestions: [] }
      ];
      datastoreMocks.getFrameworks.mockReturnValue(fws);
      datastoreMocks.getSelectedFrameworks.mockReturnValue([]);
      datastoreMocks.setSelectedFrameworks.mockResolvedValue(undefined);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('frameworks-sub-tab'));

      // The Enabled/Disabled checkbox
      const toggleCheckbox = screen.getByRole('checkbox');
      fireEvent.click(toggleCheckbox);

      await waitFor(() => {
        expect(datastoreMocks.setSelectedFrameworks).toHaveBeenCalledWith(['fw1']);
      });

      await waitFor(() => {
        expect(screen.getByText('Framework selection updated!')).toBeInTheDocument();
      });
    });

    it('should show error when framework toggle fails', async () => {
      const fws = [
        { id: 'fw1', name: 'FW1', description: '', threshold: 3.5, requirements: [], mappedQuestions: [] }
      ];
      datastoreMocks.getFrameworks.mockReturnValue(fws);
      datastoreMocks.getSelectedFrameworks.mockReturnValue([]);
      datastoreMocks.setSelectedFrameworks.mockRejectedValue(new Error('Toggle fail'));

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('frameworks-sub-tab'));

      const toggleCheckbox = screen.getByRole('checkbox');
      fireEvent.click(toggleCheckbox);

      await waitFor(() => {
        expect(screen.getByText('Toggle fail')).toBeInTheDocument();
      });
    });

    it('should handle toggling question mapping and show success', async () => {
      const fws = [
        { id: 'fw1', name: 'FW1', description: '', threshold: 3.5, requirements: [], mappedQuestions: [] }
      ];
      const questions = [
        { id: 'q1', text: 'Question 1', domainId: 'd1', categoryId: 'cat1', requiresEvidence: false }
      ];
      datastoreMocks.getFrameworks.mockReturnValue(fws);
      datastoreMocks.getQuestions.mockReturnValue(questions);
      datastoreMocks.updateFramework.mockResolvedValue(undefined);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('frameworks-sub-tab'));

      // Open the mapping details
      fireEvent.click(screen.getByTestId('mapping-toggle-fw1'));

      // Check the question mapping checkbox
      const mapCheckbox = screen.getByTestId('map-question-fw1-q1');
      fireEvent.click(mapCheckbox);

      await waitFor(() => {
        expect(datastoreMocks.updateFramework).toHaveBeenCalledWith(
          'fw1',
          { mappedQuestions: ['q1'] }
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Framework mapping updated!')).toBeInTheDocument();
      });
    });

    it('should handle toggling question mapping error', async () => {
      const fws = [
        { id: 'fw1', name: 'FW1', description: '', threshold: 3.5, requirements: [], mappedQuestions: ['q1'] }
      ];
      const questions = [
        { id: 'q1', text: 'Question 1', domainId: 'd1', categoryId: 'cat1', requiresEvidence: false }
      ];
      datastoreMocks.getFrameworks.mockReturnValue(fws);
      datastoreMocks.getQuestions.mockReturnValue(questions);
      datastoreMocks.updateFramework.mockRejectedValue(new Error('Mapping error'));

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('frameworks-sub-tab'));

      fireEvent.click(screen.getByTestId('mapping-toggle-fw1'));

      // Uncheck the question mapping
      const mapCheckbox = screen.getByTestId('map-question-fw1-q1');
      fireEvent.click(mapCheckbox);

      await waitFor(() => {
        expect(screen.getByText('Mapping error')).toBeInTheDocument();
      });
    });
  });

  describe('Assignment Handlers', () => {
    it('should show error when assigning without user or questions', () => {
      datastoreMocks.getUsers.mockReturnValue([
        { id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'user' }
      ]);
      datastoreMocks.getQuestions.mockReturnValue([
        { id: 'q1', text: 'Q1', domainId: 'd1', categoryId: 'cat1', requiresEvidence: false }
      ]);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));

      // Select the user but no questions, then click Save Assignments
      const selectUser = screen.getByDisplayValue('— choose an assessor —');
      fireEvent.change(selectUser, { target: { value: 'u1' } });

      // Click Save without selecting questions
      fireEvent.click(screen.getByText('Save Assignments'));

      expect(screen.getByText('Please select a user and at least one question')).toBeInTheDocument();
    });

    it('should show error when no user selected', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));

      // No user selected and no Save Assignments visible (only shown when userId is selected)
      // Directly test: if selectedUserId is empty, form does not show questions section
      expect(screen.queryByText('Save Assignments')).not.toBeInTheDocument();
    });

    it('should assign questions to a user and show success', async () => {
      const users = [{ id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'user' }];
      const questions = [
        { id: 'q1', text: 'Q1', domainId: 'd1', categoryId: 'cat1', requiresEvidence: false },
        { id: 'q2', text: 'Q2', domainId: 'd1', categoryId: 'cat2', requiresEvidence: false }
      ];
      datastoreMocks.getUsers.mockReturnValue(users);
      datastoreMocks.getQuestions.mockReturnValue(questions);
      datastoreMocks.getUserAssignments.mockReturnValue([]);
      datastoreMocks.assignQuestionsToUser.mockResolvedValue(undefined);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));

      // Select user
      const selectUser = screen.getByDisplayValue('— choose an assessor —');
      fireEvent.change(selectUser, { target: { value: 'u1' } });

      // Select All questions
      fireEvent.click(screen.getByText('Select All'));

      // Save
      fireEvent.click(screen.getByText('Save Assignments'));

      await waitFor(() => {
        expect(datastoreMocks.assignQuestionsToUser).toHaveBeenCalledWith('u1', ['q1', 'q2']);
      });

      await waitFor(() => {
        expect(screen.getByText('Questions assigned successfully!')).toBeInTheDocument();
      });
    });

    it('should show error when assignQuestionsToUser fails', async () => {
      const users = [{ id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'user' }];
      const questions = [
        { id: 'q1', text: 'Q1', domainId: 'd1', categoryId: 'cat1', requiresEvidence: false }
      ];
      datastoreMocks.getUsers.mockReturnValue(users);
      datastoreMocks.getQuestions.mockReturnValue(questions);
      datastoreMocks.getUserAssignments.mockReturnValue([]);
      datastoreMocks.assignQuestionsToUser.mockRejectedValue(new Error('Assign failed'));

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));

      const selectUser = screen.getByDisplayValue('— choose an assessor —');
      fireEvent.change(selectUser, { target: { value: 'u1' } });

      fireEvent.click(screen.getByText('Select All'));
      fireEvent.click(screen.getByText('Save Assignments'));

      await waitFor(() => {
        expect(screen.getByText('Assign failed')).toBeInTheDocument();
      });
    });

    it('should clear selected questions when Clear All is clicked', () => {
      const users = [{ id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'user' }];
      const questions = [
        { id: 'q1', text: 'Q1', domainId: 'd1', categoryId: 'cat1', requiresEvidence: false }
      ];
      datastoreMocks.getUsers.mockReturnValue(users);
      datastoreMocks.getQuestions.mockReturnValue(questions);
      datastoreMocks.getUserAssignments.mockReturnValue(['q1']);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));

      const selectUser = screen.getByDisplayValue('— choose an assessor —');
      fireEvent.change(selectUser, { target: { value: 'u1' } });

      // Assignments should be pre-loaded
      const checkbox = screen.getByRole('checkbox', { checked: true });
      expect(checkbox).toBeChecked();

      fireEvent.click(screen.getByText('Clear All'));

      // All checkboxes should be unchecked
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(cb => expect(cb).not.toBeChecked());
    });

    it('should toggle individual question checkbox in assignments', () => {
      const users = [{ id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'user' }];
      const questions = [
        { id: 'q1', text: 'Q1', domainId: 'd1', categoryId: 'cat1', requiresEvidence: false },
        { id: 'q2', text: 'Q2', domainId: 'd1', categoryId: 'cat2', requiresEvidence: false }
      ];
      datastoreMocks.getUsers.mockReturnValue(users);
      datastoreMocks.getQuestions.mockReturnValue(questions);
      datastoreMocks.getUserAssignments.mockReturnValue([]);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));

      const selectUser = screen.getByDisplayValue('— choose an assessor —');
      fireEvent.change(selectUser, { target: { value: 'u1' } });

      // Check a specific question
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]); // check q1
      expect(checkboxes[0]).toBeChecked();

      // Uncheck it
      fireEvent.click(checkboxes[0]);
      expect(checkboxes[0]).not.toBeChecked();
    });

    it('should clear selection when user dropdown is reset to empty', () => {
      const users = [{ id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'user' }];
      const questions = [
        { id: 'q1', text: 'Q1', domainId: 'd1', categoryId: 'cat1', requiresEvidence: false }
      ];
      datastoreMocks.getUsers.mockReturnValue(users);
      datastoreMocks.getQuestions.mockReturnValue(questions);
      datastoreMocks.getUserAssignments.mockReturnValue([]);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));

      const selectUser = screen.getByDisplayValue('— choose an assessor —');
      fireEvent.change(selectUser, { target: { value: 'u1' } });

      // Verify questions section shows
      expect(screen.getByText('Save Assignments')).toBeInTheDocument();

      // Reset to empty
      fireEvent.change(selectUser, { target: { value: '' } });

      // Questions section should be hidden
      expect(screen.queryByText('Save Assignments')).not.toBeInTheDocument();
    });

    it('should show current assignment count for selected user', () => {
      const users = [{ id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'user' }];
      const questions = [
        { id: 'q1', text: 'Q1', domainId: 'd1', categoryId: 'cat1', requiresEvidence: false }
      ];
      datastoreMocks.getUsers.mockReturnValue(users);
      datastoreMocks.getQuestions.mockReturnValue(questions);
      datastoreMocks.getUserAssignments.mockReturnValue(['q1']);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));

      const selectUser = screen.getByDisplayValue('— choose an assessor —');
      fireEvent.change(selectUser, { target: { value: 'u1' } });

      expect(screen.getByText(/currently assigned/)).toBeInTheDocument();
    });
  });

  describe('Sorting (Participant Completion)', () => {
    it('should sort by name ascending then descending on repeated click', async () => {
      const { storageService } = await import('../services/storageService');
      storageService.loadUsersCompletionStatus.mockResolvedValue([
        { userId: 'u1', name: 'Charlie', total: 10, answered: 5, percentage: 50, lastActive: null },
        { userId: 'u2', name: 'Alice', total: 10, answered: 10, percentage: 100, lastActive: '2024-01-15T10:00:00.000Z' }
      ]);

      render(<FullScreenAdminView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('completion-table')).toBeInTheDocument();
      });

      // Default sort is name asc: Alice first
      const rows = screen.getAllByTestId(/^completion-row-/);
      expect(rows[0]).toHaveAttribute('data-testid', 'completion-row-u2');
      expect(rows[1]).toHaveAttribute('data-testid', 'completion-row-u1');

      // Click name header to toggle to desc
      const nameHeader = screen.getByText('Assessor');
      fireEvent.click(nameHeader);

      // Now desc: Charlie first
      const rowsAfter = screen.getAllByTestId(/^completion-row-/);
      expect(rowsAfter[0]).toHaveAttribute('data-testid', 'completion-row-u1');
      expect(rowsAfter[1]).toHaveAttribute('data-testid', 'completion-row-u2');
    });

    it('should sort by progress percentage', async () => {
      const { storageService } = await import('../services/storageService');
      storageService.loadUsersCompletionStatus.mockResolvedValue([
        { userId: 'u1', name: 'Alice', total: 10, answered: 5, percentage: 50, lastActive: null },
        { userId: 'u2', name: 'Bob', total: 10, answered: 10, percentage: 100, lastActive: null }
      ]);

      render(<FullScreenAdminView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('completion-table')).toBeInTheDocument();
      });

      // Click Progress header
      const progressHeader = screen.getByText('Progress');
      fireEvent.click(progressHeader);

      // Ascending: 50 first
      const rowsAsc = screen.getAllByTestId(/^completion-row-/);
      expect(rowsAsc[0]).toHaveAttribute('data-testid', 'completion-row-u1');

      // Click again for descending
      fireEvent.click(progressHeader);
      const rowsDesc = screen.getAllByTestId(/^completion-row-/);
      expect(rowsDesc[0]).toHaveAttribute('data-testid', 'completion-row-u2');
    });

    it('should sort by last active date', async () => {
      const { storageService } = await import('../services/storageService');
      storageService.loadUsersCompletionStatus.mockResolvedValue([
        { userId: 'u1', name: 'Alice', total: 10, answered: 5, percentage: 50, lastActive: '2024-01-20T10:00:00.000Z' },
        { userId: 'u2', name: 'Bob', total: 10, answered: 10, percentage: 100, lastActive: '2024-01-10T10:00:00.000Z' }
      ]);

      render(<FullScreenAdminView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('completion-table')).toBeInTheDocument();
      });

      // Click Last Active header
      const lastActiveHeader = screen.getByText('Last Active');
      fireEvent.click(lastActiveHeader);

      // Ascending: earlier date (Bob) first
      const rowsAsc = screen.getAllByTestId(/^completion-row-/);
      expect(rowsAsc[0]).toHaveAttribute('data-testid', 'completion-row-u2');
    });

    it('should show admin label and N/A progress for admin users', async () => {
      const { storageService } = await import('../services/storageService');
      datastoreMocks.getUsers.mockReturnValue([
        { id: 'u1', name: 'Admin User', email: 'admin@test.com', role: 'admin' }
      ]);
      storageService.loadUsersCompletionStatus.mockResolvedValue([
        { userId: 'u1', name: 'Admin User', total: 0, answered: 0, percentage: 0, lastActive: null }
      ]);

      render(<FullScreenAdminView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId('completion-row-u1')).toBeInTheDocument();
      });

      expect(screen.getByText('(Admin)')).toBeInTheDocument();
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should show "No users found." when completion status is empty', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      expect(screen.getByText('No users found.')).toBeInTheDocument();
    });
  });

  describe('Excel Export', () => {
    it('should call excelExportService on export button click', async () => {
      const { excelExportService } = await import('../services/excelExportService');
      vi.spyOn(excelExportService, 'generateReport').mockReturnValue({});
      vi.spyOn(excelExportService, 'downloadReport').mockImplementation(() => {});

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('data-tab'));
      fireEvent.click(screen.getByTestId('export-excel-button'));

      expect(excelExportService.generateReport).toHaveBeenCalledWith(
        defaultProps.domains,
        defaultProps.answers,
        defaultProps.evidence,
        defaultProps.frameworks
      );
      expect(excelExportService.downloadReport).toHaveBeenCalled();

      excelExportService.generateReport.mockRestore();
      excelExportService.downloadReport.mockRestore();
    });

    it('should show alert when excel export fails', async () => {
      const { excelExportService } = await import('../services/excelExportService');
      vi.spyOn(excelExportService, 'generateReport').mockImplementation(() => {
        throw new Error('Export error');
      });
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('data-tab'));
      fireEvent.click(screen.getByTestId('export-excel-button'));

      expect(alertSpy).toHaveBeenCalledWith('Failed to generate Excel report.');

      excelExportService.generateReport.mockRestore();
      alertSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('showMessage auto-clear', () => {
    it('should auto-clear success message after 3 seconds', async () => {
      vi.useFakeTimers();

      datastoreMocks.addDomain.mockResolvedValue(undefined);
      datastoreMocks.getDomains
        .mockReturnValueOnce({})
        .mockReturnValue({ d1: { id: 'd1', title: 'T', description: '', weight: 1, categories: {} } });

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('configure-tab'));
      fireEvent.click(screen.getByTestId('content-sub-tab'));

      fireEvent.change(screen.getByPlaceholderText('e.g. security'), { target: { value: 'd1' } });
      fireEvent.change(screen.getByPlaceholderText('Data Governance'), { target: { value: 'T' } });

      await act(async () => {
        fireEvent.click(screen.getByText('Add Domain'));
      });

      // Message should show
      expect(screen.getByText('Domain added successfully!')).toBeInTheDocument();

      // Advance past 3s timeout
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Message should be cleared
      expect(screen.queryByText('Domain added successfully!')).not.toBeInTheDocument();

      vi.useRealTimers();
    });
  });

  describe('handleExportPDFClick', () => {
    it('should call onExportPDF with chart snapshots', () => {
      render(<FullScreenAdminView {...defaultProps} />);

      // Click the PDF export button
      fireEvent.click(screen.getByTestId('export-pdf-button'));

      // onExportPDF should be called with an empty snapshots object (no chart refs set up)
      expect(mockOnExportPDF).toHaveBeenCalledWith({});
    });
  });

  describe('Data Tab System Information', () => {
    it('should show correct system information counts', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('data-tab'));

      expect(screen.getByText('Domains:')).toBeInTheDocument();
      expect(screen.getByText('Total Answers:')).toBeInTheDocument();
      expect(screen.getByText('Evidence Items:')).toBeInTheDocument();
      expect(screen.getByText('Frameworks:')).toBeInTheDocument();

      // domains has 1 key, answers has 1 key, evidence has 1 key, frameworks has 1 item
      expect(screen.getByText('Domains:').closest('.info-item').querySelector('.info-value').textContent).toBe('1');
      expect(screen.getByText('Total Answers:').closest('.info-item').querySelector('.info-value').textContent).toBe('1');
      expect(screen.getByText('Evidence Items:').closest('.info-item').querySelector('.info-value').textContent).toBe('1');
      expect(screen.getByText('Frameworks:').closest('.info-item').querySelector('.info-value').textContent).toBe('1');
    });
  });

  describe('File import handling', () => {
    it('should show importing state and reset after import completes', async () => {
      mockOnImportData.mockResolvedValue(undefined);

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('data-tab'));

      const file = new File(['{}'], 'data.json', { type: 'application/json' });
      const input = screen.getByTestId('file-input');

      await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      expect(mockOnImportData).toHaveBeenCalledWith(file);
    });

    it('should reset importing state even when import fails', async () => {
      // The component's handler has try/finally but no catch, so mock a resolved failure instead
      mockOnImportData.mockResolvedValue({ success: false, error: 'Import failed' });

      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('data-tab'));

      const file = new File(['bad'], 'bad.json', { type: 'application/json' });
      const input = screen.getByTestId('file-input');

      await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
      });

      // Input should be re-enabled after the handler completes
      expect(input).not.toBeDisabled();
    });

    it('should do nothing when no file is selected', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('data-tab'));

      const input = screen.getByTestId('file-input');
      fireEvent.change(input, { target: { files: [] } });

      expect(mockOnImportData).not.toHaveBeenCalled();
    });
  });
});
