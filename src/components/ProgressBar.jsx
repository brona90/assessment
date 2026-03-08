import PropTypes from 'prop-types';

export const ProgressBar = ({ answered, total, percentage, withEvidence }) => {
  return (
    <div
      className="progress-container"
      data-testid="progress-bar"
      role="region"
      aria-label={`Assessment progress: ${answered} of ${total} questions answered`}
    >
      <div className="progress-info">
        <span className="progress-text">
          {answered}/{total} Questions
        </span>
        {withEvidence !== undefined && answered > 0 && (
          <span
            className="evidence-count"
            data-testid="evidence-count"
            aria-live="polite"
            aria-label={`${withEvidence} of ${answered} answered questions have evidence`}
          >
            {withEvidence}/{answered} with evidence
          </span>
        )}
        <span className="progress-percentage">{percentage}%</span>
      </div>
      <div
        className="progress-bar-wrapper"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Assessment completion"
      >
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
