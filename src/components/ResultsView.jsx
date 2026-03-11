import PropTypes from 'prop-types';
import { LogOut, ArrowLeft, BarChart2, AlertTriangle, AlertCircle, Check, FileText, ArrowRight } from 'lucide-react';
import { OverviewDashboard } from './OverviewDashboard';
import { scoreCalculator, NA_VALUE } from '../utils/scoreCalculator';
import './ResultsView.css';

export const ResultsView = ({
  user,
  questions,
  answers,
  progress,
  onBackToAssessment,
  onLogout,
  onExpandChart
}) => {
  // Build domain structure from the user's assigned questions only
  const filteredDomains = {};
  questions.forEach(q => {
    if (!filteredDomains[q.domainId]) {
      filteredDomains[q.domainId] = {
        title: q.domainTitle || q.domainId,
        weight: 1,
        categories: {}
      };
    }
    if (!filteredDomains[q.domainId].categories[q.categoryId]) {
      filteredDomains[q.domainId].categories[q.categoryId] = {
        title: q.categoryTitle || q.categoryId,
        questions: []
      };
    }
    filteredDomains[q.domainId].categories[q.categoryId].questions.push(q);
  });

  // Overall score: average of per-domain averages (only domains with answers)
  const domainAvgs = Object.values(filteredDomains).map(domain => {
    let total = 0, count = 0;
    Object.values(domain.categories || {}).forEach(cat => {
      (cat.questions || []).forEach(q => {
        const val = answers[q.id];
        if (val !== undefined && val !== NA_VALUE) { total += val; count++; }
      });
    });
    return count > 0 ? total / count : null;
  }).filter(s => s !== null);

  const overallScore = domainAvgs.length > 0
    ? domainAvgs.reduce((a, b) => a + b, 0) / domainAvgs.length
    : 0;

  return (
    <div className="results-view" data-testid="results-view">
      <header className="results-header">
        <div className="user-info-bar">
          <div className="user-profile">
            <span className="user-avatar"><BarChart2 size={20} /></span>
            <div>
              <h2>Assessment Results</h2>
              <p className="user-name">{user.name}</p>
            </div>
          </div>
          <div className="user-actions">
            <button
              className="back-btn"
              onClick={onBackToAssessment}
              data-testid="back-to-assessment"
            >
              <ArrowLeft size={16} /> Back to Assessment
            </button>
            <button
              className="logout-btn"
              onClick={onLogout}
              data-testid="logout-btn"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="results-main">
        {/* Score summary bar */}
        <div className="results-score-bar">
          <h2>Overall Maturity Score</h2>
          <div className="results-score-value-row">
            <span className="score-value" data-testid="overall-score-value">
              {overallScore.toFixed(2)}
            </span>
            <span className="score-max"> / 5.0</span>
            <span
              className="maturity-label"
              data-testid="overall-maturity-label"
              aria-label={`Maturity level: ${scoreCalculator.getMaturityLevel(overallScore)}`}
            >
              {scoreCalculator.getMaturityLevel(overallScore)}
            </span>
          </div>
          <div className="progress-info">
            <span>{progress.answered} of {progress.total} questions answered</span>
            <span className="progress-percentage">{progress.percentage}%</span>
          </div>
        </div>

        {/* Charts + Compliance — shared with admin overview */}
        <OverviewDashboard
          domains={filteredDomains}
          answers={answers}
          onExpandChart={onExpandChart}
        />

        {/* Gap Analysis — Fix These First */}
        {questions.length > 0 && (
          <div className="gap-analysis" data-testid="gap-analysis">
            <h3>Fix These First</h3>
            <p className="gap-analysis-subtitle">
              Ranked by priority score: gap × domain weight. Target = 4.0.
            </p>
            <div className="gap-list">
              {questions
                .filter(q => {
                  const val = answers[q.id];
                  return val !== undefined && val !== NA_VALUE;
                })
                .map(q => {
                  const score = answers[q.id];
                  const domainWeight = filteredDomains[q.domainId]?.weight || 1;
                  const priority = scoreCalculator.calculatePriorityScore(score, domainWeight);
                  return { ...q, score, priority };
                })
                .filter(q => q.priority > 0)
                .sort((a, b) => b.priority - a.priority)
                .slice(0, 10)
                .map(q => {
                  const priorityLabel = q.priority >= 2.0 ? 'High' : q.priority >= 1.0 ? 'Medium' : 'Low';
                  const PriorityIcon = q.priority >= 2.0 ? AlertTriangle : q.priority >= 1.0 ? AlertCircle : Check;
                  return (
                    <div key={q.id} className="gap-item" data-testid={`gap-item-${q.id}`}>
                      <div className="gap-item-text">{q.text}</div>
                      <div className="gap-item-meta">
                        <span className="gap-item-domain">{q.domainTitle || q.domainId}</span>
                        <span className="gap-item-score">
                          {q.score.toFixed(1)} / 4.0
                          <span className="gap-item-level">
                            {' '}({scoreCalculator.getMaturityLevel(q.score)})
                          </span>
                        </span>
                        <span
                          className={`priority-badge priority-${priorityLabel.toLowerCase()}`}
                          data-testid={`priority-${q.id}`}
                          data-priority={q.priority.toFixed(2)}
                          aria-label={`${priorityLabel} priority`}
                        >
                          <PriorityIcon size={12} /> {priorityLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              {questions.filter(q => {
                const val = answers[q.id];
                return val !== undefined && val !== NA_VALUE &&
                  scoreCalculator.calculatePriorityScore(val, filteredDomains[q.domainId]?.weight || 1) > 0;
              }).length === 0 && (
                <p className="gap-none" data-testid="gap-none">
                  All answered questions meet the target score. Well done!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {progress.percentage < 100 && (
          <div className="recommendations">
            <h3><FileText size={20} /> Next Steps</h3>
            <p>You have {progress.total - progress.answered} questions remaining.</p>
            <button
              className="continue-btn"
              onClick={onBackToAssessment}
              data-testid="continue-assessment"
            >
              Continue Assessment <ArrowRight size={16} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

ResultsView.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  questions: PropTypes.array.isRequired,
  answers: PropTypes.object.isRequired,
  progress: PropTypes.shape({
    answered: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    percentage: PropTypes.number.isRequired
  }).isRequired,
  onBackToAssessment: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onExpandChart: PropTypes.func
};

export default ResultsView;
