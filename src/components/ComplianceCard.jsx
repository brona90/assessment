import PropTypes from 'prop-types';
import { complianceService } from '../services/complianceService';

export const ComplianceCard = ({ framework, score }) => {
  const { status, color } = complianceService.getComplianceStatus(
    score,
    framework.threshold
  );

  return (
    <div className="compliance-card" data-testid={`compliance-${framework.id}`}>
      <div className="compliance-header">
        <h3>
          <span className="compliance-icon">{framework.icon}</span>
          {framework.name}
        </h3>
        <span className="compliance-category">{framework.category}</span>
      </div>
      
      <p className="compliance-description">{framework.description}</p>
      
      <div className="compliance-score-section">
        <div className="compliance-score" style={{ color }}>
          {score.toFixed(1)}%
        </div>
        <div className="compliance-status" style={{ backgroundColor: color }}>
          {status}
        </div>
      </div>

      <div className="compliance-requirements">
        <h4>Requirements:</h4>
        <ul>
          {framework.requirements?.map((req, idx) => (
            <li key={idx}>{req}</li>
          ))}
        </ul>
      </div>

      <div className="compliance-threshold">
        Threshold: {((framework.threshold / 5) * 100).toFixed(0)}%
      </div>
    </div>
  );
};

ComplianceCard.propTypes = {
  framework: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    icon: PropTypes.string,
    category: PropTypes.string,
    description: PropTypes.string,
    threshold: PropTypes.number,
    requirements: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  score: PropTypes.number.isRequired,
  answers: PropTypes.object
};