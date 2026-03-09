import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DomainRadarChart } from './DomainRadarChart';
import { DomainBarChart } from './DomainBarChart';
import { DomainHeatmap } from './DomainHeatmap';
import { BenchmarkTrendChart } from './BenchmarkTrendChart';
import { BenchmarkSources } from './BenchmarkSources';
import { scoreCalculator, NA_VALUE } from '../utils/scoreCalculator';
import { dataService } from '../services/dataService';
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
  const [activeChart, setActiveChart] = useState('heatmap');
  const [benchmarks, setBenchmarks] = useState(null);

  useEffect(() => {
    dataService.loadBenchmarks().then(data => {
      if (data && data.current) setBenchmarks(data);
    });
  }, []);

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

  // Calculate domain scores
  const domainScores = Object.keys(filteredDomains).reduce((acc, domainId) => {
    const domain = filteredDomains[domainId];
    const domainQuestions = [];

    Object.values(domain.categories || {}).forEach(cat => {
      if (cat.questions) domainQuestions.push(...cat.questions);
    });

    if (domainQuestions.length === 0) {
      acc[domainId] = { score: 0, total: 0, answered: 0, percentage: 0 };
      return acc;
    }

    let total = 0;
    let count = 0;
    domainQuestions.forEach(q => {
      const val = answers[q.id];
      if (val !== undefined && val !== NA_VALUE) {
        total += val;
        count++;
      }
    });

    acc[domainId] = {
      score: count > 0 ? (total / count).toFixed(2) : 0,
      total: domainQuestions.length,
      answered: count,
      percentage: count > 0 ? ((count / domainQuestions.length) * 100).toFixed(0) : 0
    };

    return acc;
  }, {});

  // Overall score: average of domains that have at least one answer
  const scoredDomains = Object.values(domainScores).filter(d => parseFloat(d.score) > 0);
  const overallScore = scoredDomains.length > 0
    ? scoredDomains.reduce((sum, d) => sum + parseFloat(d.score), 0) / scoredDomains.length
    : 0;

  return (
    <div className="results-view" data-testid="results-view">
      <header className="results-header">
        <div className="user-info-bar">
          <div className="user-profile">
            <span className="user-avatar">📊</span>
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
              ← Back to Assessment
            </button>
            <button
              className="logout-btn"
              onClick={onLogout}
              data-testid="logout-btn"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <main className="results-main">
        {/* Overall Score Card */}
        <div className="score-summary">
          <div className="overall-score-card">
            <h3>Overall Maturity Score</h3>
            <div className="score-display">
              <span className="score-value">{overallScore.toFixed(2)}</span>
              <span className="score-max">/ 5.0</span>
            </div>
            <span
              className="maturity-label"
              data-testid="overall-maturity-label"
              aria-label={`Maturity level: ${scoreCalculator.getMaturityLevel(overallScore)}`}
            >
              {scoreCalculator.getMaturityLevel(overallScore)}
            </span>
            <div className="progress-info">
              <span>{progress.answered} of {progress.total} questions answered</span>
              <span className="progress-percentage">{progress.percentage}%</span>
            </div>
          </div>
        </div>

        {/* Domain Scores */}
        <div className="domain-scores">
          <h3>Domain Breakdown</h3>
          <div className="domain-cards">
            {Object.entries(filteredDomains).map(([domainId, domain]) => {
              const score = domainScores[domainId];
              return (
                <div key={domainId} className="domain-score-card">
                  <h4>{domain.title}</h4>
                  <div className="domain-score">
                    <span className="score">{score.score}</span>
                    <span className="max">/ 5.0</span>
                  </div>
                  <span
                    className="maturity-label"
                    data-testid={`maturity-${domainId}`}
                    aria-label={`Maturity level: ${scoreCalculator.getMaturityLevel(parseFloat(score.score))}`}
                  >
                    {scoreCalculator.getMaturityLevel(parseFloat(score.score))}
                  </span>
                  <div className="domain-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${score.percentage}%` }}
                      />
                    </div>
                    <span className="progress-text">
                      {score.answered} / {score.total} questions
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart Tabs */}
        <div className="chart-section">
          <div className="chart-section-header">
            <div className="chart-tabs" role="tablist" aria-label="Chart views">
            <button
              role="tab"
              aria-selected={activeChart === 'heatmap'}
              aria-controls="chart-panel"
              className={`chart-tab ${activeChart === 'heatmap' ? 'active' : ''}`}
              onClick={() => setActiveChart('heatmap')}
              data-testid="heatmap-chart-tab"
            >
              🔥 Heatmap
            </button>
            <button
              role="tab"
              aria-selected={activeChart === 'radar'}
              aria-controls="chart-panel"
              className={`chart-tab ${activeChart === 'radar' ? 'active' : ''}`}
              onClick={() => setActiveChart('radar')}
              data-testid="radar-chart-tab"
            >
              📡 Radar Chart
            </button>
            <button
              role="tab"
              aria-selected={activeChart === 'bar'}
              aria-controls="chart-panel"
              className={`chart-tab ${activeChart === 'bar' ? 'active' : ''}`}
              onClick={() => setActiveChart('bar')}
              data-testid="bar-chart-tab"
            >
              📊 Bar Chart
            </button>
            <button
              role="tab"
              aria-selected={activeChart === 'trend'}
              aria-controls="chart-panel"
              className={`chart-tab ${activeChart === 'trend' ? 'active' : ''}`}
              onClick={() => setActiveChart('trend')}
              data-testid="trend-chart-tab"
            >
              📈 Trend
            </button>
          </div>
          <div className="chart-header-right">
            {benchmarks?.sources && <BenchmarkSources sources={benchmarks.sources} />}
            {onExpandChart && (
              <button
                className="chart-expand-btn"
                onClick={() => onExpandChart(activeChart)}
                data-testid="chart-expand-btn"
                title="Open full-screen chart"
                aria-label="Open full-screen chart"
              >
                ⤢ Full Screen
              </button>
            )}
          </div>
          </div>

          <div
            className={`chart-display${onExpandChart ? ' chart-display--clickable' : ''}`}
            role="tabpanel"
            id="chart-panel"
            onClick={onExpandChart ? () => onExpandChart(activeChart) : undefined}
          >
            {onExpandChart && <span className="chart-expand-hint">⤢ Click to expand</span>}
            {activeChart === 'heatmap' ? (
              <DomainHeatmap domains={filteredDomains} answers={answers} />
            ) : activeChart === 'radar' ? (
              <DomainRadarChart domains={filteredDomains} answers={answers} benchmarks={benchmarks} />
            ) : activeChart === 'bar' ? (
              <DomainBarChart domains={filteredDomains} answers={answers} benchmarks={benchmarks} />
            ) : (
              <BenchmarkTrendChart benchmarks={benchmarks} userScore={overallScore} />
            )}
          </div>
        </div>

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
                  const priorityIcon = q.priority >= 2.0 ? '⚠' : q.priority >= 1.0 ? '◎' : '✓';
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
                          {priorityIcon} {priorityLabel}
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

        {/* Recommendations */}
        {progress.percentage < 100 && (
          <div className="recommendations">
            <h3>📝 Next Steps</h3>
            <p>You have {progress.total - progress.answered} questions remaining.</p>
            <button
              className="continue-btn"
              onClick={onBackToAssessment}
              data-testid="continue-assessment"
            >
              Continue Assessment →
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
