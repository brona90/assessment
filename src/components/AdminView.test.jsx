import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminView } from './AdminView';

// Mock the child components
vi.mock('./EnhancedAdminPanel', () => ({
  EnhancedAdminPanel: () => <div data-testid="enhanced-admin-panel">Enhanced Admin Panel</div>
}));

vi.mock('./DomainRadarChart', () => ({
  DomainRadarChart: () => (
    <div data-testid="domain-radar-chart">Radar Chart</div>
  )
}));

vi.mock('./DomainBarChart', () => ({
  DomainBarChart: () => (
    <div data-testid="domain-bar-chart">Bar Chart</div>
  )
}));

vi.mock('./ComplianceDashboard', () => ({
  ComplianceDashboard: () => (
    <div data-testid="compliance-dashboard">Compliance Dashboard</div>
  )
}));

describe('AdminView', () => {
  const mockDomains = {
    domain1: {
      title: 'Test Domain',
      categories: {
        cat1: {
          title: 'Test Category',
          questions: [
            { id: 'q1', text: 'Question 1' }
          ]
        }
      }
    }
  };

  const mockAnswers = {
    q1: 3
  };

  const mockEvidence = {
    q1: { photos: ['photo1.jpg'] }
  };

  const mockFrameworks = [
    { id: 'fw1', name: 'Framework 1' }
  ];

  const mockOnExportPDF = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render admin view with header', () => {
    render(
      <AdminView
        domains={mockDomains}
        answers={mockAnswers}
        evidence={mockEvidence}
        frameworks={mockFrameworks}
        onExportPDF={mockOnExportPDF}
      />
    );

    expect(screen.getByText('Administrator Dashboard')).toBeInTheDocument();
  });

  it('should render all three tabs', () => {
    render(
      <AdminView
        domains={mockDomains}
        answers={mockAnswers}
        evidence={mockEvidence}
        frameworks={mockFrameworks}
        onExportPDF={mockOnExportPDF}
      />
    );

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Compliance')).toBeInTheDocument();
  });

  it('should show admin panel by default', () => {
    render(
      <AdminView
        domains={mockDomains}
        answers={mockAnswers}
        evidence={mockEvidence}
        frameworks={mockFrameworks}
        onExportPDF={mockOnExportPDF}
      />
    );

    expect(screen.getByTestId('enhanced-admin-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('compliance-section')).not.toBeInTheDocument();
  });

  it('should switch to dashboard tab when clicked', () => {
    render(
      <AdminView
        domains={mockDomains}
        answers={mockAnswers}
        evidence={mockEvidence}
        frameworks={mockFrameworks}
        onExportPDF={mockOnExportPDF}
      />
    );

    const dashboardTab = screen.getByTestId('dashboard-tab');
    fireEvent.click(dashboardTab);

    expect(screen.getByTestId('dashboard-section')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-panel-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('compliance-section')).not.toBeInTheDocument();
  });

  it('should switch to compliance tab when clicked', () => {
    render(
      <AdminView
        domains={mockDomains}
        answers={mockAnswers}
        evidence={mockEvidence}
        frameworks={mockFrameworks}
        onExportPDF={mockOnExportPDF}
      />
    );

    const complianceTab = screen.getByTestId('compliance-tab');
    fireEvent.click(complianceTab);

    expect(screen.getByTestId('compliance-section')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-panel-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-section')).not.toBeInTheDocument();
  });

  it('should highlight active tab', () => {
    render(
      <AdminView
        domains={mockDomains}
        answers={mockAnswers}
        evidence={mockEvidence}
        frameworks={mockFrameworks}
        onExportPDF={mockOnExportPDF}
      />
    );

    const adminPanelTab = screen.getByTestId('admin-panel-tab');
    expect(adminPanelTab.className).toContain('active');

    const dashboardTab = screen.getByTestId('dashboard-tab');
    fireEvent.click(dashboardTab);

    expect(dashboardTab.className).toContain('active');
    expect(adminPanelTab.className).not.toContain('active');
  });

  it('should render export PDF button', () => {
    render(
      <AdminView
        domains={mockDomains}
        answers={mockAnswers}
        evidence={mockEvidence}
        frameworks={mockFrameworks}
        onExportPDF={mockOnExportPDF}
      />
    );

    expect(screen.getByText(/Export PDF Report/)).toBeInTheDocument();
  });

  it('should call onExportPDF when export button is clicked', () => {
    render(
      <AdminView
        domains={mockDomains}
        answers={mockAnswers}
        evidence={mockEvidence}
        frameworks={mockFrameworks}
        onExportPDF={mockOnExportPDF}
      />
    );

    const exportButton = screen.getByTestId('admin-export-pdf');
    fireEvent.click(exportButton);

    expect(mockOnExportPDF).toHaveBeenCalledTimes(1);
  });

  it('should render charts in dashboard tab', () => {
    render(
      <AdminView
        domains={mockDomains}
        answers={mockAnswers}
        evidence={mockEvidence}
        frameworks={mockFrameworks}
        onExportPDF={mockOnExportPDF}
      />
    );

    const dashboardTab = screen.getByTestId('dashboard-tab');
    fireEvent.click(dashboardTab);

    expect(screen.getByTestId('domain-radar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('domain-bar-chart')).toBeInTheDocument();
  });

  it('should render compliance dashboard in compliance tab', () => {
    render(
      <AdminView
        domains={mockDomains}
        answers={mockAnswers}
        evidence={mockEvidence}
        frameworks={mockFrameworks}
        onExportPDF={mockOnExportPDF}
      />
    );

    const complianceTab = screen.getByTestId('compliance-tab');
    fireEvent.click(complianceTab);

    expect(screen.getByTestId('compliance-dashboard')).toBeInTheDocument();
  });

  it('should maintain tab state when switching between tabs', () => {
    render(
      <AdminView
        domains={mockDomains}
        answers={mockAnswers}
        evidence={mockEvidence}
        frameworks={mockFrameworks}
        onExportPDF={mockOnExportPDF}
      />
    );

    // Start on admin panel
    expect(screen.getByTestId('enhanced-admin-panel')).toBeInTheDocument();

    // Switch to dashboard
    fireEvent.click(screen.getByTestId('dashboard-tab'));
    expect(screen.getByTestId('dashboard-section')).toBeInTheDocument();

    // Switch to compliance
    fireEvent.click(screen.getByTestId('compliance-tab'));
    expect(screen.getByTestId('compliance-section')).toBeInTheDocument();

    // Switch back to admin panel
    fireEvent.click(screen.getByTestId('admin-panel-tab'));
    expect(screen.getByTestId('enhanced-admin-panel')).toBeInTheDocument();
  });

  it('should handle empty domains', () => {
    render(
      <AdminView
        domains={{}}
        answers={mockAnswers}
        evidence={mockEvidence}
        frameworks={mockFrameworks}
        onExportPDF={mockOnExportPDF}
      />
    );

    const dashboardTab = screen.getByTestId('dashboard-tab');
    fireEvent.click(dashboardTab);

    // Charts should still render even with empty domains
    expect(screen.getByTestId('domain-radar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('domain-bar-chart')).toBeInTheDocument();
  });

  it('should handle empty frameworks', () => {
    render(
      <AdminView
        domains={mockDomains}
        answers={mockAnswers}
        evidence={mockEvidence}
        frameworks={[]}
        onExportPDF={mockOnExportPDF}
      />
    );

    const complianceTab = screen.getByTestId('compliance-tab');
    fireEvent.click(complianceTab);

    // Compliance dashboard should still render
    expect(screen.getByTestId('compliance-dashboard')).toBeInTheDocument();
  });
});