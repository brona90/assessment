import { useCompliance } from '../hooks/useCompliance';
import { ComplianceCard } from './ComplianceCard';
import PropTypes from 'prop-types';

export const ComplianceDashboard = ({ answers }) => {
  const { frameworks, loading, error, getEnabledFrameworks, getFrameworkScore } = useCompliance(answers);

  if (loading) {
    return (
      <div className="compliance-loading" data-testid="compliance-loading">
        Loading compliance frameworks...
      </div>
    );
  }

  if (error) {
    return (
      <div className="compliance-error" data-testid="compliance-error">
        Error loading compliance: {error}
      </div>
    );
  }

  const enabledFrameworks = getEnabledFrameworks();

  if (enabledFrameworks.length === 0) {
    return (
      <div className="compliance-empty" data-testid="compliance-empty">
        <h3>No Compliance Frameworks Enabled</h3>
        <p>Enable frameworks in the Admin Panel to track compliance.</p>
      </div>
    );
  }

  return (
    <div className="compliance-dashboard" data-testid="compliance-dashboard">
      <h2>Compliance Framework Status</h2>
      <div className="compliance-grid">
        {enabledFrameworks.map(framework => (
          <ComplianceCard
            key={framework.id}
            framework={framework}
            score={getFrameworkScore(framework.id)}
            answers={answers}
          />
        ))}
      </div>
    </div>
  );
};

ComplianceDashboard.propTypes = {
  answers: PropTypes.object
};

ComplianceDashboard.defaultProps = {
  answers: {}
};