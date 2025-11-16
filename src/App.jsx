import { useState } from 'react';
import { useAssessment } from './hooks/useAssessment';
import { useUser } from './hooks/useUser';
import { QuestionCard } from './components/QuestionCard';
import { ProgressBar } from './components/ProgressBar';
import { ComplianceDashboard } from './components/ComplianceDashboard';
import { DomainRadarChart } from './components/DomainRadarChart';
import { DomainBarChart } from './components/DomainBarChart';
import { EvidenceModal } from './components/EvidenceModal';
import { UserSelector } from './components/UserSelector';
import { AdminPanel } from './components/AdminPanel';
import { pdfService } from './services/pdfService';
import { useCompliance } from './hooks/useCompliance';

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

  const {
    users,
    currentUser,
    loading: userLoading,
    selectUser,
    canAccessQuestion
  } = useUser();

  const [activeSection, setActiveSection] = useState('assessment');
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const { frameworks } = useCompliance(answers);

  const handleOpenEvidence = (questionId) => {
    setCurrentQuestionId(questionId);
    setEvidenceModalOpen(true);
  };

  const handleCloseEvidence = () => {
    setEvidenceModalOpen(false);
    setCurrentQuestionId(null);
  };

  const handleSaveEvidence = async (evidenceData) => {
    if (currentQuestionId) {
      await saveEvidenceForQuestion(currentQuestionId, evidenceData);
      handleCloseEvidence();
    }
  };

  const handleExportPDF = async () => {
    try {
      const pdf = await pdfService.generatePDF(domains, answers, evidence, frameworks);
      await pdfService.downloadPDF(pdf);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (loading || userLoading) {
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

  // Filter questions based on user access
  const filterQuestionsByUser = (questions) => {
    if (!questions) return [];
    return questions.filter(q => canAccessQuestion(q.id));
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>Technology Assessment Framework</h1>
          <button 
            className="export-btn" 
            onClick={handleExportPDF}
            data-testid="export-pdf"
          >
            📄 Export PDF
          </button>
        </div>
        <UserSelector 
          users={users}
          currentUser={currentUser}
          onSelectUser={selectUser}
        />
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
          className={activeSection === 'compliance' ? 'active' : ''}
          onClick={() => setActiveSection('compliance')}
        >
          Compliance
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
                  {Object.entries(domain.categories || {}).map(([catKey, category]) => {
                    const filteredQuestions = filterQuestionsByUser(category.questions || []);
                    
                    return (
                      <div key={catKey} className="category-section">
                        <h3>{category.title}</h3>
                        {filteredQuestions.length === 0 ? (
                          <p className="no-questions">No questions assigned or available.</p>
                        ) : (
                          filteredQuestions.map(question => (
                            <QuestionCard
                              key={question.id}
                              question={question}
                              answer={answers[question.id]}
                              onAnswerChange={(value) => saveAnswer(question.id, value)}
                              onClearAnswer={() => clearAnswer(question.id)}
                              onAddEvidence={() => handleOpenEvidence(question.id)}
                              hasEvidence={!!evidence[question.id]}
                            />
                          ))
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        {activeSection === 'compliance' && (
          <div className="compliance-section" data-testid="compliance-section">
            <ComplianceDashboard answers={answers} />
          </div>
        )}

        {activeSection === 'dashboard' && (
          <div className="dashboard-section" data-testid="dashboard-section">
            <h2>Assessment Dashboard</h2>
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Domain Maturity Overview</h3>
                <DomainBarChart domains={domains} answers={answers} />
              </div>
              <div className="chart-card">
                <h3>Maturity Radar Analysis</h3>
                <DomainRadarChart domains={domains} answers={answers} />
              </div>
            </div>
          </div>
        )}
      </main>

      {evidenceModalOpen && (
        <EvidenceModal
          questionId={currentQuestionId}
          existingEvidence={evidence[currentQuestionId]}
          onSave={handleSaveEvidence}
          onClose={handleCloseEvidence}
        />
      )}
    </div>
  );
}

export default App;