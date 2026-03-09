import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

    it('should render clear all data section', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('data-tab'));
      expect(screen.getByTestId('clear-all-data-button')).toBeInTheDocument();
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

    it('should call onClearAllData when clear button is clicked', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      fireEvent.click(screen.getByTestId('data-tab'));
      fireEvent.click(screen.getByTestId('clear-all-data-button'));
      expect(mockOnClearAllData).toHaveBeenCalledTimes(1);
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
      expect(dataTab).toHaveAttribute('aria-selected');
    });

    it('should have proper ARIA label on export PDF button', () => {
      render(<FullScreenAdminView {...defaultProps} />);
      expect(screen.getByTestId('export-pdf-button')).toHaveAttribute('aria-label');
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
});
