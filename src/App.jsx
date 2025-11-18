import { useState, useEffect } from 'react';
import { useAssessment } from './hooks/useAssessment';
import { useUser } from './hooks/useUser';
import { EvidenceModal } from './components/EvidenceModal';
import { UserSelectionScreen } from './components/UserSelectionScreen';
import { FullScreenAdminView } from './components/FullScreenAdminView';
import { UserView } from './components/UserView';
import ResultsView from './components/ResultsView';
import { pdfService } from './services/pdfService';
import { useCompliance } from './hooks/useCompliance';
import { userExportService } from './services/userExportService';
import { useDataStore } from './hooks/useDataStore';

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
    isAdmin
  } = useUser();

  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [userQuestions, setUserQuestions] = useState([]);
  
  // Initialize view from URL hash
  const getViewFromHash = () => {
    const hash = window.location.hash.slice(1); // Remove '#'
    if (hash === 'results') return 'results';
    if (hash === 'admin') return 'admin';
    return 'assessment';
  };
  
  const [currentView, setCurrentView] = useState(getViewFromHash());
  const { frameworks } = useCompliance(answers);
  const { 
    getQuestionsForUser, 
    initialized,
    importData,
    exportData,
    clearAllData
  } = useDataStore();

  // Hydrate user questions when user changes or data is updated
  useEffect(() => {
    const loadUserQuestions = () => {
      if (currentUser && initialized) {
        const questions = getQuestionsForUser(currentUser.id);
        setUserQuestions(questions);
      } else {
        setUserQuestions([]);
      }
    };
    
    loadUserQuestions();
  }, [currentUser, initialized, getQuestionsForUser]);

  // Sync view with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const newView = getViewFromHash();
      setCurrentView(newView);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update URL hash when view changes
  useEffect(() => {
    const hash = currentView === 'assessment' ? '' : currentView;
    if (window.location.hash.slice(1) !== hash) {
      window.location.hash = hash;
    }
  }, [currentView]);

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
      // Generate PDF
      const pdf = await pdfService.generatePDF(domains, answers, evidence, frameworks);
      await pdfService.downloadPDF(pdf);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleLogout = () => {
    selectUser(null);
    setUserQuestions([]);
    setCurrentView('assessment'); // Reset view on logout
  };

  const handleSwitchToResults = () => {
    setCurrentView('results');
  };

  const handleBackToAssessment = () => {
    setCurrentView('assessment');
  };

  const handleImportData = async (file) => {
    try {
      await importData(file);
    } catch (error) {
      console.error('Error importing data:', error);
      alert(`Failed to import data: ${error.message}`);
    }
  };

  const handleExportData = () => {
    try {
      exportData();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleClearAllData = () => {
    try {
      clearAllData();
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Failed to clear data. Please try again.');
    }
  };

  const handleExportUserData = () => {
    try {
      if (!currentUser) {
        alert('Please select a user first');
        return;
      }

      // Get user's assigned questions
      const userQuestions = getQuestionsForUser(currentUser.id);
      
      // Export user data with evidence validation
      const result = userExportService.downloadUserExport(
        currentUser.id,
        currentUser.name,
        userQuestions,
        answers,
        evidence,
        true // Require evidence for all answered questions
      );

      // Handle validation errors
      if (!result.success) {
        const validation = result.validation;
        alert(
          `❌ Export Failed\n\n` +
          `${result.error}\n\n` +
          `You have answered ${validation.totalAnswered} question(s), but ${validation.missingEvidence} of them are missing evidence.\n\n` +
          `Please add evidence (photos/documents) to all answered questions before exporting.`
        );
      }
    } catch (error) {
      console.error('Error exporting user data:', error);
      alert('Failed to export user data. Please try again.');
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

  // Show user selection screen if no user is selected
  if (!currentUser) {
    return (
      <UserSelectionScreen 
        users={users}
        onSelectUser={selectUser}
      />
    );
  }

const progress = getProgress();
  
    // Render role-based view
    return (
      <>
        {isAdmin() ? (
          <FullScreenAdminView
            domains={domains}
            answers={answers}
            evidence={evidence}
            frameworks={frameworks}
            onExportPDF={handleExportPDF}
              onLogout={handleLogout}
              onImportData={handleImportData}
              onExportData={handleExportData}
              onClearAllData={handleClearAllData}
          />
        ) : (
          <>
            {currentView === 'assessment' ? (
              <UserView
                user={currentUser}
                questions={userQuestions}
                answers={answers}
                evidence={evidence}
                progress={progress}
                onAnswerChange={saveAnswer}
                onClearAnswer={clearAnswer}
                onAddEvidence={handleOpenEvidence}
                onExportUserData={handleExportUserData}
                onSwitchToResults={handleSwitchToResults}
                onLogout={handleLogout}
              />
            ) : (
              <ResultsView
                user={currentUser}
                domains={domains}
                answers={answers}
                progress={progress}
                onBackToAssessment={handleBackToAssessment}
                onLogout={handleLogout}
              />
            )}
          </>
        )}
  
        {evidenceModalOpen && (
          <EvidenceModal
            questionId={currentQuestionId}
            existingEvidence={evidence[currentQuestionId]}
            onSave={handleSaveEvidence}
            onClose={handleCloseEvidence}
          />
        )}
      </>
    );
  }
export default App;
