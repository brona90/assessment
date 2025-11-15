import { useState } from 'react';
import { useAssessment } from './hooks/useAssessment';
import { QuestionCard } from './components/QuestionCard';
import { ProgressBar } from './components/ProgressBar';

function App() {
  const {
    domains,
    answers,
    evidence,
    loading,
    error,
    saveAnswer,
    clearAnswer,
    saveEvidenceForQuestion,
    getProgress
  } = useAssessment();

  const [activeSection, setActiveSection] = useState('assessment');

  if (loading) {
    return (
      <div className="loading-container" data-testid="loading">
        <div className="spinner"></div>
        <p>Loading assessment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container" data-testid="error">
        <h2>Error Loading Assessment</h2>
        <p>{error}</p>
      </div>
    );
  }

  const progress = getProgress();

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Technology Assessment Framework</h1>
        <ProgressBar {...progress} />
      </header>

      <nav className="app-nav">
        <button
          className={activeSection === 'assessment' ? 'active' : ''}
          onClick={() => setActiveSection('assessment')}
        >
          Assessment
        </button>
        <button
          className={activeSection === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveSection('dashboard')}
        >
          Dashboard
        </button>
      </nav>

      <main className="app-main">
        {activeSection === 'assessment' && domains && (
          <div className="assessment-section" data-testid="assessment-section">
            {Object.entries(domains).map(([domainKey, domain]) => (
              <div key={domainKey} className="domain-section">
                <h2>{domain.title}</h2>
                {Object.entries(domain.categories || {}).map(([catKey, category]) => (
                  <div key={catKey} className="category-section">
                    <h3>{category.title}</h3>
                    {category.questions?.map(question => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        answer={answers[question.id]}
                        onAnswerChange={(value) => saveAnswer(question.id, value)}
                        onClearAnswer={() => clearAnswer(question.id)}
                        onAddEvidence={() => {}}
                        hasEvidence={!!evidence[question.id]}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeSection === 'dashboard' && (
          <div className="dashboard-section" data-testid="dashboard-section">
            <h2>Assessment Dashboard</h2>
            <p>Dashboard content coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;