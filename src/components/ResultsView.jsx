import { useState } from 'react';
import PropTypes from 'prop-types';
import { DomainRadarChart } from './DomainRadarChart';
import { DomainBarChart } from './DomainBarChart';
import { DomainHeatmap } from './DomainHeatmap';
import { scoreCalculator } from '../utils/scoreCalculator';
import './ResultsView.css';

export const ResultsView = ({
  user,
  questions,
  answers,
  progress,
  onBackToAssessment,
  onLogout
}) => {
  const [activeChart, setActiveChart] = useState('heatmap');

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
      if (answers[q.id] !== undefined) {
        total += answers[q.id];
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
            <span className="maturity-label" data-testid="overall-maturity-label">
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
                  <span className="maturity-label" data-testid={`maturity-${domainId}`}>
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
          <div className="chart-tabs">
            <button
              className={`chart-tab ${activeChart === 'heatmap' ? 'active' : ''}`}
              onClick={() => setActiveChart('heatmap')}
              data-testid="heatmap-chart-tab"
            >
              🔥 Heatmap
            </button>
            <button
              className={`chart-tab ${activeChart === 'radar' ? 'active' : ''}`}
              onClick={() => setActiveChart('radar')}
              data-testid="radar-chart-tab"
            >
              📡 Radar Chart
            </button>
            <button
              className={`chart-tab ${activeChart === 'bar' ? 'active' : ''}`}
              onClick={() => setActiveChart('bar')}
              data-testid="bar-chart-tab"
            >
              📊 Bar Chart
            </button>
          </div>

          <div className="chart-display">
            {activeChart === 'heatmap' ? (
              <DomainHeatmap domains={filteredDomains} answers={answers} />
            ) : activeChart === 'radar' ? (
              <DomainRadarChart domains={filteredDomains} answers={answers} />
            ) : (
              <DomainBarChart domains={filteredDomains} answers={answers} />
            )}
          </div>
        </div>

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
  onLogout: PropTypes.func.isRequired
};
