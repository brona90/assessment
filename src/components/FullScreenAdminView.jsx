import { useState } from 'react';
import PropTypes from 'prop-types';
import { ComplianceDashboard } from './ComplianceDashboard';
import { DomainRadarChart } from './DomainRadarChart';
import { DomainBarChart } from './DomainBarChart';
import './FullScreenAdminView.css';

export const FullScreenAdminView = ({
  domains,
  answers,
  evidence,
  frameworks,
  onExportPDF,
  onLogout,
  onImportData,
  onExportData,
  onClearAllData
}) => {
  const [activeTab, setActiveTab] = useState('data-management');
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    try {
      await onImportData(file);
    } finally {
      setIsImporting(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleExportData = () => {
    onExportData();
  };

  const handleClearAllData = () => {
    onClearAllData();
  };

  return (
    <div className="full-screen-admin-view" data-testid="full-screen-admin-view">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <h1>Administrator Dashboard</h1>
        </div>
        <div className="admin-header-right">
          <button
            className="export-pdf-btn"
            onClick={onExportPDF}
            data-testid="export-pdf-button"
            aria-label="Export PDF Report"
          >
            📄 Export PDF Report
          </button>
          <button
            className="logout-btn"
            onClick={onLogout}
            data-testid="logout-button"
            aria-label="Logout"
          >
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Unified Navigation Bar */}
      <nav className="admin-nav" role="tablist">
        <button
          className={`admin-nav-tab ${activeTab === 'data-management' ? 'active' : ''}`}
          onClick={() => setActiveTab('data-management')}
          data-testid="data-management-tab"
          role="tab"
          aria-selected={activeTab === 'data-management'}
          aria-controls="data-management-content"
        >
          📊 Data Management
        </button>
        <button
          className={`admin-nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
          data-testid="dashboard-tab"
          role="tab"
          aria-selected={activeTab === 'dashboard'}
          aria-controls="dashboard-content"
        >
          📈 Dashboard
        </button>
        <button
          className={`admin-nav-tab ${activeTab === 'compliance' ? 'active' : ''}`}
          onClick={() => setActiveTab('compliance')}
          data-testid="compliance-tab"
          role="tab"
          aria-selected={activeTab === 'compliance'}
          aria-controls="compliance-content"
        >
          ✅ Compliance
        </button>
      </nav>

      {/* Tab Content */}
      <main className="admin-content">
        {/* Data Management Tab */}
        {activeTab === 'data-management' && (
          <div
            className="tab-content"
            data-testid="data-management-content"
            role="tabpanel"
            id="data-management-content"
            aria-labelledby="data-management-tab"
          >
            <div className="data-management-section">
              <h2>Data Management</h2>

              {/* Import/Export Section */}
              <section className="management-card">
                <h3>Import & Export Data</h3>
                <div className="management-actions">
                  <div className="import-section">
                    <label htmlFor="file-input" className="file-label">
                      <span>📁 Select JSON File</span>
                      <input
                        id="file-input"
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        data-testid="file-input"
                        disabled={isImporting}
                      />
                    </label>
                    {isImporting && <span className="loading-text">Importing...</span>}
                  </div>
                  <button
                    className="export-btn"
                    onClick={handleExportData}
                    data-testid="export-data-button"
                  >
                    💾 Export All Data
                  </button>
                </div>
                <p className="help-text">
                  Import: Upload a JSON file containing configuration, answers, and evidence.
                  <br />
                  Export: Download all system data including configuration, answers, and evidence.
                </p>
              </section>

              {/* Clear All Data Section */}
              <section className="management-card danger-zone">
                <h3>⚠️ Danger Zone</h3>
                <div className="danger-content">
                  <div className="danger-description">
                    <h4>Clear All Data</h4>
                    <p>
                      Permanently delete all data including domains, users, frameworks, questions,
                      assignments, answers, and evidence. This action cannot be undone.
                    </p>
                  </div>
                  <button
                    className="danger-btn"
                    onClick={handleClearAllData}
                    data-testid="clear-all-data-button"
                  >
                    🗑️ Clear All Data
                  </button>
                </div>
              </section>

              {/* System Information */}
              <section className="management-card">
                <h3>System Information</h3>
                <div className="system-info">
                  <div className="info-item">
                    <span className="info-label">Domains:</span>
                    <span className="info-value">{Object.keys(domains).length}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Total Answers:</span>
                    <span className="info-value">{Object.keys(answers).length}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Evidence Items:</span>
                    <span className="info-value">{Object.keys(evidence).length}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Frameworks:</span>
                    <span className="info-value">{frameworks.length}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div
            className="tab-content"
            data-testid="dashboard-content"
            role="tabpanel"
            id="dashboard-content"
            aria-labelledby="dashboard-tab"
          >
            <div className="dashboard-section">
              <h2>Assessment Overview</h2>
              <div className="charts-grid">
                <div className="chart-container">
                  <h3>Domain Scores (Radar)</h3>
                  <DomainRadarChart domains={domains} answers={answers} />
                </div>
                <div className="chart-container">
                  <h3>Domain Scores (Bar)</h3>
                  <DomainBarChart domains={domains} answers={answers} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div
            className="tab-content"
            data-testid="compliance-content"
            role="tabpanel"
            id="compliance-content"
            aria-labelledby="compliance-tab"
          >
            <div className="compliance-section">
              <h2>Compliance Frameworks</h2>
              <ComplianceDashboard answers={answers} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

FullScreenAdminView.propTypes = {
  domains: PropTypes.object.isRequired,
  answers: PropTypes.object.isRequired,
  evidence: PropTypes.object.isRequired,
  frameworks: PropTypes.array.isRequired,
  onExportPDF: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onImportData: PropTypes.func.isRequired,
  onExportData: PropTypes.func.isRequired,
  onClearAllData: PropTypes.func.isRequired
};

export default FullScreenAdminView;
