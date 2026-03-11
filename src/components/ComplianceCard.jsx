import { useState } from 'react';
import PropTypes from 'prop-types';
import { complianceService } from '../services/complianceService';
import { useDataStore } from '../hooks/useDataStore';

const SCORE_LABELS = ['', 'Not Implemented', 'Initial', 'Defined', 'Managed', 'Optimized'];

const STATUS_ICON = {
  'Excellent': '✓',
  'Good': '✓',
  'Fair': '~',
  'Needs Improvement': '⚠',
  'Critical': '✕'
};

function questionScoreColor(score, threshold) {
  if (score === undefined) return 'var(--text-muted)';
  const pct = (score / 5) * 100;
  const tPct = (threshold / 5) * 100;
  if (pct >= tPct) return '#10b981';
  if (pct >= tPct - 20) return '#f59e0b';
  return '#ef4444';
}

export const ComplianceCard = ({ framework, score, answers }) => {
  const [expanded, setExpanded] = useState(false);
  const { getQuestions } = useDataStore();

  const { status, color } = complianceService.getComplianceStatus(score, framework.threshold);

  const mappedQIds = framework.mappedQuestions || [];
  const allQuestions = getQuestions();
  const questionData = mappedQIds.map(qId => {
    const q = allQuestions.find(q => q.id === qId);
    return { id: qId, text: q?.text || qId, score: answers?.[qId] };
  }).sort((a, b) => {
    if (a.score === undefined && b.score !== undefined) return -1;
    if (a.score !== undefined && b.score === undefined) return 1;
    if (a.score === undefined || b.score === undefined) return 0;
    return a.score - b.score;
  });

  const answeredCount = questionData.filter(q => q.score !== undefined).length;
  const totalCount = questionData.length;
  const thresholdPct = framework.threshold ? (framework.threshold / 5) * 100 : 0;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setExpanded(x => !x);
    }
  };

  return (
    <div
      className={`compliance-card${expanded ? ' compliance-card--expanded' : ''}`}
      data-testid={`compliance-${framework.id}`}
      onClick={() => setExpanded(x => !x)}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-expanded={expanded}
    >
      {/* ── Header (always visible) ────────────────────────────────────────── */}
      <div className="compliance-header">
        <div className="compliance-header-left">
          <span className="compliance-icon">{framework.icon}</span>
          <div>
            <h3>{framework.name}</h3>
            <span className="compliance-category">{framework.category}</span>
          </div>
        </div>
        <div className="compliance-header-right">
          <div className="compliance-score" style={{ color }}>{score.toFixed(1)}%</div>
          <div className="compliance-status" style={{ backgroundColor: color }}>
            <span className="compliance-status-icon" aria-hidden="true">{STATUS_ICON[status] || '·'}</span>
            {status}
          </div>
          <span className="compliance-expand-caret" aria-hidden="true">
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* ── Score bar (always visible) ─────────────────────────────────────── */}
      <div className="compliance-score-bar">
        <div className="compliance-score-track">
          <div
            className="compliance-score-fill"
            style={{ width: `${Math.min(score, 100)}%`, backgroundColor: color }}
          />
          <div
            className="compliance-threshold-marker"
            style={{ left: `${thresholdPct}%` }}
            title={`Threshold: ${thresholdPct.toFixed(0)}%`}
          />
        </div>
        <span className="compliance-bar-label">
          {answeredCount}/{totalCount} answered · threshold {framework.threshold?.toFixed(1)} (score {thresholdPct.toFixed(0)}%)
        </span>
      </div>

      {/* ── Expanded detail ────────────────────────────────────────────────── */}
      {expanded && (
        <div
          className="compliance-detail"
          onClick={e => e.stopPropagation()}
          data-testid={`compliance-detail-${framework.id}`}
        >
          <p className="compliance-description">{framework.description}</p>

          {/* Per-question breakdown */}
          {questionData.length > 0 && (
            <div className="compliance-question-breakdown">
              <div className="compliance-breakdown-label">Question Coverage</div>
              {questionData.map(q => {
                const qColor = questionScoreColor(q.score, framework.threshold);
                return (
                  <div
                    key={q.id}
                    className="compliance-question-row"
                    data-testid={`cq-row-${q.id}`}
                  >
                    <div className="compliance-question-text">{q.text}</div>
                    <div className="compliance-question-meta">
                      <span className="compliance-question-score" style={{ color: qColor }}>
                        {q.score !== undefined ? `${q.score}/5` : '—'}
                      </span>
                      {q.score !== undefined && (
                        <span className="compliance-question-label" style={{ color: qColor }}>
                          {SCORE_LABELS[q.score]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Requirements */}
          {framework.requirements?.length > 0 && (
            <div className="compliance-requirements">
              <div className="compliance-breakdown-label">Requirements</div>
              <ul>
                {framework.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="compliance-threshold">
            Threshold: {thresholdPct.toFixed(0)}%
          </div>
        </div>
      )}
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
    requirements: PropTypes.arrayOf(PropTypes.string),
    mappedQuestions: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  score: PropTypes.number.isRequired,
  answers: PropTypes.object
};
