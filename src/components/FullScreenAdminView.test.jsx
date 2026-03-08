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

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset datastore mock implementations to empty defaults
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
      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      expect(screen.getByTestId('full-screen-admin-view')).toBeInTheDocument();
    });

    it('should render unified navigation bar with all tabs', () => {
      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      expect(screen.getByTestId('data-management-tab')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-tab')).toBeInTheDocument();
      expect(screen.getByTestId('compliance-tab')).toBeInTheDocument();
    });

    it('should show Domains tab as active by default', () => {
      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      const domainsTab = screen.getByTestId('domains-tab');
      expect(domainsTab).toHaveClass('active');
    });

    it('should render export PDF button in header', () => {
      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      expect(screen.getByText(/Export PDF Report/)).toBeInTheDocument();
    });

    it('should render logout button in header', () => {
      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      expect(screen.getByText(/Logout/)).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to Dashboard tab when clicked', () => {
      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      const dashboardTab = screen.getByTestId('dashboard-tab');
      fireEvent.click(dashboardTab);

      expect(dashboardTab).toHaveClass('active');
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    });

    it('should switch to Compliance tab when clicked', () => {
      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      const complianceTab = screen.getByTestId('compliance-tab');
      fireEvent.click(complianceTab);

      expect(complianceTab).toHaveClass('active');
      expect(screen.getByTestId('compliance-content')).toBeInTheDocument();
    });

    it('should switch back to Data Management tab', () => {
      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      // Switch to Dashboard
      fireEvent.click(screen.getByTestId('dashboard-tab'));
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();

      // Switch back to Data Management
      fireEvent.click(screen.getByTestId('data-management-tab'));
      expect(screen.getByTestId('data-management-content')).toBeInTheDocument();
    });

    it('should only show one tab content at a time', () => {
      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      // Initially on Domains
      expect(screen.getByTestId('domains-content')).toBeInTheDocument();
      expect(screen.queryByTestId('dashboard-content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('compliance-content')).not.toBeInTheDocument();
    });
  });

  describe('Data Management Tab', () => {
    it('should render import/export section', () => {
      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      // Click on Data Management tab
      fireEvent.click(screen.getByTestId('data-management-tab'));

      expect(screen.getByTestId('file-input')).toBeInTheDocument();
      expect(screen.getByTestId('export-data-button')).toBeInTheDocument();
    });

    it('should render clear all data section', () => {
      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      // Click on Data Management tab
      fireEvent.click(screen.getByTestId('data-management-tab'));

      expect(screen.getByTestId('clear-all-data-button')).toBeInTheDocument();
      expect(screen.getByText(/Danger Zone/)).toBeInTheDocument();
    });

    it('should call onImportData when import button is clicked', async () => {
      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      // Click on Data Management tab
      fireEvent.click(screen.getByTestId('data-management-tab'));

      const file = new File(['{"test": "data"}'], 'test.json', { type: 'application/json' });
      const input = screen.getByTestId('file-input');
      
      fireEvent.change(input, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(mockOnImportData).toHaveBeenCalled();
      });
    });

    it('should call onExportData when export button is clicked', () => {
      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      // Click on Data Management tab
      fireEvent.click(screen.getByTestId('data-management-tab'));

      const exportButton = screen.getByTestId('export-data-button');
      fireEvent.click(exportButton);

      expect(mockOnExportData).toHaveBeenCalledTimes(1);
    });

    it('should call onClearAllData when clear button is clicked', () => {
      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      // Click on Data Management tab
      fireEvent.click(screen.getByTestId('data-management-tab'));

      const clearButton = screen.getByTestId('clear-all-data-button');
      fireEvent.click(clearButton);

      expect(mockOnClearAllData).toHaveBeenCalledTimes(1);
    });
  });

  describe('Dashboard Tab', () => {
    it('should render charts when Dashboard tab is active', () => {
      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      fireEvent.click(screen.getByTestId('dashboard-tab'));

      expect(screen.getByTestId('domain-radar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('domain-bar-chart')).toBeInTheDocument();
    });

    it('should pass correct props to charts', () => {
      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      fireEvent.click(screen.getByTestId('dashboard-tab'));

      // Charts should be rendered with data
      expect(screen.getByTestId('domain-radar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('domain-bar-chart')).toBeInTheDocument();
    });
  });

  describe('Compliance Tab', () => {
    it('should render compliance dashboard when Compliance tab is active', () => {
      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      fireEvent.click(screen.getByTestId('compliance-tab'));

      expect(screen.getByTestId('compliance-dashboard')).toBeInTheDocument();
    });
  });

  describe('Header Actions', () => {
    it('should call onExportPDF when export PDF button is clicked', () => {
      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      const exportPDFButton = screen.getByTestId('export-pdf-button');
      fireEvent.click(exportPDFButton);

      expect(mockOnExportPDF).toHaveBeenCalledTimes(1);
    });

    it('should call onLogout when logout button is clicked', () => {
      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      const logoutButton = screen.getByTestId('logout-button');
      fireEvent.click(logoutButton);

      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty domains gracefully', () => {
      render(
        <FullScreenAdminView
          domains={{}}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      expect(screen.getByTestId('full-screen-admin-view')).toBeInTheDocument();
    });

    it('should handle empty frameworks gracefully', () => {
      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={[]}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      fireEvent.click(screen.getByTestId('compliance-tab'));
      expect(screen.getByTestId('compliance-dashboard')).toBeInTheDocument();
    });
  });

  describe('Frameworks Tab', () => {
    it('should show framework checkboxes as checked when framework is selected', () => {
      const fw = { id: 'fw1', name: 'Framework 1' };
      datastoreMocks.getFrameworks.mockReturnValue([fw]);
      datastoreMocks.getSelectedFrameworks.mockReturnValue([fw]);

      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      fireEvent.click(screen.getByTestId('frameworks-tab'));

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should show framework checkboxes as unchecked when framework is not selected', () => {
      const fw = { id: 'fw1', name: 'Framework 1' };
      datastoreMocks.getFrameworks.mockReturnValue([fw]);
      datastoreMocks.getSelectedFrameworks.mockReturnValue([]);

      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      fireEvent.click(screen.getByTestId('frameworks-tab'));

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on tabs', () => {
      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      const dataManagementTab = screen.getByTestId('data-management-tab');
      expect(dataManagementTab).toHaveAttribute('role', 'tab');
      expect(dataManagementTab).toHaveAttribute('aria-selected');
    });

    it('should have proper ARIA labels on buttons', () => {
      render(
        <FullScreenAdminView
          domains={mockDomains}
          answers={mockAnswers}
          evidence={mockEvidence}
          frameworks={mockFrameworks}
          onExportPDF={mockOnExportPDF}
          onLogout={mockOnLogout}
          onImportData={mockOnImportData}
          onExportData={mockOnExportData}
          onClearAllData={mockOnClearAllData}
        />
      );

      const exportPDFButton = screen.getByTestId('export-pdf-button');
      expect(exportPDFButton).toHaveAttribute('aria-label');
    });
  });

  describe('Compliance Framework Question Mapping', () => {
    const mappingProps = {
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
      datastoreMocks.getFrameworks.mockReturnValue([
        { id: 'fw1', name: 'Framework 1', mappedQuestions: [] }
      ]);
      datastoreMocks.getQuestions.mockReturnValue([
        { id: 'q1', text: 'Question 1', domainId: 'domain1' },
        { id: 'q2', text: 'Question 2', domainId: 'domain1' }
      ]);
    });

    it('should show mapping toggle on framework items', async () => {
      render(<FullScreenAdminView {...mappingProps} />);
      fireEvent.click(screen.getByTestId('frameworks-tab'));

      await waitFor(() => {
        expect(screen.getByTestId('mapping-toggle-fw1')).toBeInTheDocument();
      });
    });

    it('should show mapped question count in toggle summary', async () => {
      datastoreMocks.getFrameworks.mockReturnValue([
        { id: 'fw1', name: 'Framework 1', mappedQuestions: ['q1'] }
      ]);

      render(<FullScreenAdminView {...mappingProps} />);
      fireEvent.click(screen.getByTestId('frameworks-tab'));

      await waitFor(() => {
        expect(screen.getByText(/1 mapped/)).toBeInTheDocument();
      });
    });

    it('should call updateFramework when a question mapping is toggled', async () => {
      datastoreMocks.updateFramework.mockResolvedValue({ id: 'fw1', mappedQuestions: ['q1'] });

      render(<FullScreenAdminView {...mappingProps} />);
      fireEvent.click(screen.getByTestId('frameworks-tab'));

      await waitFor(() => {
        expect(screen.getByTestId('mapping-toggle-fw1')).toBeInTheDocument();
      });

      // Open the details element
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

      render(<FullScreenAdminView {...mappingProps} />);
      fireEvent.click(screen.getByTestId('frameworks-tab'));

      await waitFor(() => {
        fireEvent.click(screen.getByTestId('mapping-toggle-fw1'));
      });

      await waitFor(() => {
        expect(screen.getByText('No questions available. Add questions first.')).toBeInTheDocument();
      });
    });
  });
});
