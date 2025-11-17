import PropTypes from 'prop-types';
import { QuestionCard } from './QuestionCard';
import { ProgressBar } from './ProgressBar';
import './UserView.css';

export const UserView = ({ 
  user,
  questions,
  answers,
  evidence,
  progress,
  onAnswerChange,
  onClearAnswer,
  onAddEvidence,
  onExportUserData,
  onLogout
}) => {
  // Group questions by domain and category
  const groupedQuestions = questions.reduce((acc, question) => {
    const domainId = question.domainId;
    const categoryId = question.categoryId;
    
    if (!acc[domainId]) {
      acc[domainId] = {
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
  }, {});

  return (
    <div className="user-view" data-testid="user-view">
      <header className="user-view-header">
        <div className="user-info-bar">
          <div className="user-profile">
            <span className="user-avatar">👤</span>
            <div>
              <h2>{user.name}</h2>
              <p className="user-role">Assessment User</p>
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
          <div className="questions-container">
            {Object.entries(groupedQuestions).map(([domainId, domain]) => (
              <div key={domainId} className="domain-section">
                <h3 className="domain-title">{domain.title}</h3>
                {Object.entries(domain.categories).map(([categoryId, category]) => (
                  <div key={categoryId} className="category-section">
                    <h4 className="category-title">{category.title}</h4>
                    <div className="questions-list">
                      {category.questions.map(question => (
                        <QuestionCard
                          key={question.id}
                          question={question}
                          answer={answers[question.id]}
                          onAnswerChange={(value) => onAnswerChange(question.id, value)}
                          onClearAnswer={() => onClearAnswer(question.id)}
                          onAddEvidence={() => onAddEvidence(question.id)}
                          hasEvidence={!!evidence[question.id]}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
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
  progress: PropTypes.shape({
    totalQuestions: PropTypes.number.isRequired,
    answeredQuestions: PropTypes.number.isRequired,
    percentage: PropTypes.number.isRequired
  }).isRequired,
  onAnswerChange: PropTypes.func.isRequired,
  onClearAnswer: PropTypes.func.isRequired,
  onAddEvidence: PropTypes.func.isRequired,
  onExportUserData: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired
};

export default UserView;