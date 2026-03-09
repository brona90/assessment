import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { QuestionCard } from './QuestionCard';
import { ProgressBar } from './ProgressBar';
import { scoreCalculator } from '../utils/scoreCalculator';
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
  const [activeTab, setActiveTab] = useState(() => domains[0]?.id || null);

  // Set active tab once questions load (domains[0] may not exist on first render)
  useEffect(() => {
    if (domains.length > 0 && !activeTab) {
      setActiveTab(domains[0].id);
    }
  }, [domains, activeTab]);

  const activeDomain = groupedQuestions[activeTab];

  return (
    <div className="user-view" data-testid="user-view">
      <header className="user-view-header">
        <div className="user-info-bar">
          <div className="user-profile">
            <span className="user-avatar">👤</span>
            <div>
              <h2>{user.name}</h2>
              <p className="user-role">{user.title || 'Assessment User'}</p>
            </div>
          </div>
          <div className="user-actions">
            <button
              className="export-btn" 
              onClick={onExportUserData}
              data-testid="export-user-data"
            >
              💾 Export My Data
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
              <span className="empty-icon">📋</span>
              <h4>No Questions Assigned</h4>
              <p>You don't have any questions assigned yet. Please contact your administrator.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Domain Tabs */}
            {domains.length > 1 && (
              <div className="domain-tabs" role="tablist">
                {domains.map((domain) => (
                  <button
                    key={domain.id}
                    role="tab"
                    aria-selected={activeTab === domain.id}
                    className={`domain-tab ${activeTab === domain.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(domain.id)}
                    data-testid={`domain-tab-${domain.id}`}
                  >
                    {domain.title}
                  </button>
                ))}
              </div>
            )}

            {/* Questions Container */}
            <div className="questions-container">
              {activeDomain && (
                <div key={activeTab} className="domain-section">
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
                            onAnswerChange={(value) => onAnswerChange(question.id, value)}
                            onClearAnswer={() => onClearAnswer(question.id)}
                            onCommentChange={(text) => onCommentChange(question.id, text)}
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
  onLogout: PropTypes.func.isRequired
};

export default UserView;
