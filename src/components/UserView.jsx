import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { User, Check, BarChart2, Download, LogOut, ClipboardList, PartyPopper, ArrowRight } from 'lucide-react';
import { QuestionCard } from './QuestionCard';
import { ProgressBar } from './ProgressBar';
import { scoreCalculator } from '../utils/scoreCalculator';
import logoUrl from '../assets/ftc-icon.svg';
import './UserView.css';

export const UserView = ({
  user,
  questions,
  answers,
  evidence,
  comments,
  frameworks,
  progress,
  onAnswerChange,
  onClearAnswer,
  onCommentChange,
  onAddEvidence,
  onExportUserData,
  onSwitchToResults,
  onLogout
}) => {
  // Reverse-map frameworks → per-question compliance tags
  const questionFrameworkMap = useMemo(
    () => scoreCalculator.buildQuestionFrameworkMap(frameworks),
    [frameworks]
  );

  // Group questions by domain and category
  const groupedQuestions = useMemo(() => questions.reduce((acc, question) => {
    const domainId = question.domainId;
    const categoryId = question.categoryId;

    if (!acc[domainId]) {
      acc[domainId] = {
        id: domainId,
        title: question.domainTitle || domainId,
        categories: {}
      };
    }

    if (!acc[domainId].categories[categoryId]) {
      acc[domainId].categories[categoryId] = {
        title: question.categoryTitle || categoryId,
        questions: []
      };
    }

    acc[domainId].categories[categoryId].questions.push(question);

    return acc;
  }, {}), [questions]);

  const domains = useMemo(() => Object.values(groupedQuestions), [groupedQuestions]);
  const [activeTab, setActiveTab] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  // Derive effective tab: use activeTab if valid, otherwise first domain
  const effectiveTab = (activeTab && groupedQuestions[activeTab]) ? activeTab : (domains[0]?.id || null);

  const handleAnswerChange = useCallback((qId, value) => {
    onAnswerChange(qId, value);
    setLastSaved(new Date());
  }, [onAnswerChange]);

  const handleCommentChange = useCallback((qId, text) => {
    onCommentChange(qId, text);
    if (text) setLastSaved(new Date());
  }, [onCommentChange]);

  const activeDomain = groupedQuestions[effectiveTab];

  return (
    <div className="user-view" data-testid="user-view">
      <header className="user-view-header">
        <div className="user-info-bar">
          <img src={logoUrl} alt="fosterthecode" className="header-brand-logo" />
          <div className="user-profile">
            <span className="user-avatar"><User size={20} /></span>
            <div>
              <h2>{user.name}</h2>
              <p className="user-role">{user.title || 'Assessment User'}</p>
            </div>
          </div>
          <div className="user-actions">
            {lastSaved && (
              <span className="autosave-indicator" aria-live="polite">
                <Check size={12} /> Saved {lastSaved.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {onSwitchToResults && (
              <button
                className="results-btn"
                onClick={onSwitchToResults}
                data-testid="view-results-btn"
              >
                <BarChart2 size={16} /> View Results
              </button>
            )}
            <button
              className="export-btn"
              onClick={onExportUserData}
              data-testid="export-user-data"
            >
              <Download size={16} /> Export My Data
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
        <ProgressBar {...progress} />
      </header>

      <main className="user-view-main">
        <div className="questions-intro">
          <h3>Your Assigned Questions</h3>
          <p>Complete all questions and provide evidence where required.</p>
        </div>

        {questions.length === 0 ? (
          <div className="no-questions-message" data-testid="no-questions">
            <div className="empty-state">
              <span className="empty-icon"><ClipboardList size={48} /></span>
              <h4>No Questions Assigned</h4>
              <p>You don't have any questions assigned yet. Please contact your administrator.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Domain Tabs — desktop; dropdown — mobile */}
            {domains.length > 1 && (
              <>
                <div className="domain-tabs" role="tablist">
                  {domains.map((domain) => (
                    <button
                      key={domain.id}
                      role="tab"
                      aria-selected={effectiveTab === domain.id}
                      aria-controls={`domain-panel-${domain.id}`}
                      className={`domain-tab ${effectiveTab === domain.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(domain.id)}
                      data-testid={`domain-tab-${domain.id}`}
                    >
                      {domain.title}
                    </button>
                  ))}
                </div>
                <select
                  className="domain-tab-select"
                  value={effectiveTab || ''}
                  onChange={e => setActiveTab(e.target.value)}
                  data-testid="domain-tab-select"
                  aria-label="Select domain"
                >
                  {domains.map((domain) => (
                    <option key={domain.id} value={domain.id}>{domain.title}</option>
                  ))}
                </select>
              </>
            )}

            {/* Questions Container */}
            <div className="questions-container" role="tabpanel" id={`domain-panel-${effectiveTab}`}>
              {activeDomain && (
                <div key={effectiveTab} className="domain-section">
                  {domains.length === 1 && <h3 className="domain-title">{activeDomain.title}</h3>}
                  {Object.entries(activeDomain.categories).map(([categoryId, category]) => (
                    <div key={categoryId} className="category-section">
                      <h4 className="category-title">{category.title}</h4>
                      <div className="questions-list">
                        {category.questions.map(question => (
                          <QuestionCard
                            key={question.id}
                            question={question}
                            answer={answers[question.id]}
                            comment={comments?.[question.id] || ''}
                            complianceTags={questionFrameworkMap[question.id] || []}
                            onAnswerChange={(value) => handleAnswerChange(question.id, value)}
                            onClearAnswer={() => onClearAnswer(question.id)}
                            onCommentChange={(text) => handleCommentChange(question.id, text)}
                            onAddEvidence={() => onAddEvidence(question.id)}
                            hasEvidence={!!evidence[question.id]}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completion Banner */}
            {progress.percentage === 100 && (
              <div className="assessment-complete-banner" data-testid="assessment-complete">
                <span className="complete-banner-icon" aria-hidden="true"><PartyPopper size={40} /></span>
                <div className="complete-banner-text">
                  <h4>Assessment Complete!</h4>
                  <p>You&apos;ve answered all {progress.total} questions.</p>
                </div>
                {onSwitchToResults && (
                  <button className="complete-banner-btn" onClick={onSwitchToResults}>
                    View Your Results <ArrowRight size={16} />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

UserView.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  questions: PropTypes.array.isRequired,
  answers: PropTypes.object.isRequired,
  evidence: PropTypes.object.isRequired,
  comments: PropTypes.object,
  frameworks: PropTypes.object,
  progress: PropTypes.shape({
    answered: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    percentage: PropTypes.number.isRequired,
    withEvidence: PropTypes.number
  }).isRequired,
  onAnswerChange: PropTypes.func.isRequired,
  onClearAnswer: PropTypes.func.isRequired,
  onCommentChange: PropTypes.func.isRequired,
  onAddEvidence: PropTypes.func.isRequired,
  onExportUserData: PropTypes.func.isRequired,
  onSwitchToResults: PropTypes.func,
  onLogout: PropTypes.func.isRequired
};

