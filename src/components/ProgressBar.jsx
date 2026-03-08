import PropTypes from 'prop-types';

export const ProgressBar = ({ answered, total, percentage, withEvidence }) => {
  return (
    <div className="progress-container" data-testid="progress-bar">
      <div className="progress-info">
        <span className="progress-text">
          {answered}/{total} Questions
        </span>
        {withEvidence !== undefined && answered > 0 && (
          <span className="evidence-count" data-testid="evidence-count">
            {withEvidence}/{answered} with evidence
          </span>
        )}
        <span className="progress-percentage">{percentage}%</span>
      </div>
      <div className="progress-bar-wrapper">
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage}%` }}
          data-testid="progress-fill"
        />
      </div>
    </div>
  );
};

ProgressBar.propTypes = {
  answered: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  percentage: PropTypes.number.isRequired,
  withEvidence: PropTypes.number
};
