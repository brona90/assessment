import { useState } from 'react';
import PropTypes from 'prop-types';
import { ComplianceDashboard } from './ComplianceDashboard';
import { DomainRadarChart } from './DomainRadarChart';
import { DomainBarChart } from './DomainBarChart';
import { EnhancedAdminPanel } from './EnhancedAdminPanel';
import './AdminView.css';

export const AdminView = ({ domains, answers, onExportPDF }) => {
  const [activeTab, setActiveTab] = useState('admin');

  return (
    <div className="admin-view" data-testid="admin-view">
      <div className="admin-view-header">
        <h2>Administrator Dashboard</h2>
        <button 
          className="export-btn" 
          onClick={onExportPDF}
          data-testid="admin-export-pdf"
        >
          📄 Export PDF Report
        </button>
      </div>

      <nav className="admin-nav">
        <button
          className={activeTab === 'admin' ? 'active' : ''}
          onClick={() => setActiveTab('admin')}
          data-testid="admin-panel-tab"
        >
          Admin Panel
        </button>
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
          data-testid="dashboard-tab"
        >
          Dashboard
        </button>
        <button
          className={activeTab === 'compliance' ? 'active' : ''}
          onClick={() => setActiveTab('compliance')}
          data-testid="compliance-tab"
        >
          Compliance
        </button>
      </nav>

      <div className="admin-content">
        {activeTab === 'admin' && (
          <div data-testid="admin-panel-section">
            <EnhancedAdminPanel />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="dashboard-section" data-testid="dashboard-section">
            <h3>Assessment Overview</h3>
            <div className="charts-grid">
              <div className="chart-container">
                <h4>Domain Scores (Radar)</h4>
                <DomainRadarChart domains={domains} answers={answers} />
              </div>
              <div className="chart-container">
                <h4>Domain Scores (Bar)</h4>
                <DomainBarChart domains={domains} answers={answers} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="compliance-section" data-testid="compliance-section">
            <ComplianceDashboard answers={answers} />
          </div>
        )}
      </div>
    </div>
  );
};

AdminView.propTypes = {
  domains: PropTypes.object.isRequired,
  answers: PropTypes.object.isRequired,
  onExportPDF: PropTypes.func.isRequired
};

export default AdminView;