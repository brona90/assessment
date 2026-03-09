import PropTypes from 'prop-types';
import './BenchmarkSources.css';

export const BenchmarkSources = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="benchmark-sources" data-testid="benchmark-sources">
      <span className="benchmark-sources-label">Benchmark sources:</span>
      <div className="benchmark-sources-chips">
        {sources.map(s => (
          <a
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="benchmark-source-chip"
            title={s.description}
          >
            <span className="bsc-publisher">{s.publisher}</span>
            <span className="bsc-sep">·</span>
            <span className="bsc-report">{s.report}</span>
            <span className="bsc-year">({s.year})</span>
            <span className="bsc-arrow">↗</span>
          </a>
        ))}
      </div>
    </div>
  );
};

BenchmarkSources.propTypes = {
  sources: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      publisher: PropTypes.string.isRequired,
      report: PropTypes.string.isRequired,
      year: PropTypes.number.isRequired,
      url: PropTypes.string.isRequired,
      description: PropTypes.string
    })
  )
};
