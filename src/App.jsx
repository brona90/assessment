import { useState, useEffect, useRef } from 'react';
import { useAssessment } from './hooks/useAssessment';
import { useUser } from './hooks/useUser';
import { useRouter } from './hooks/useRouter';
import { EvidenceModal } from './components/EvidenceModal';
import { UserSelectionScreen } from './components/UserSelectionScreen';
import { FullScreenAdminView } from './components/FullScreenAdminView';
import { UserView } from './components/UserView';
import { ResultsView } from './components/ResultsView';
import { ChartFullscreenView } from './components/ChartFullscreenView';
import { pdfService } from './services/pdfService';
import { useCompliance } from './hooks/useCompliance';
import { complianceService } from './services/complianceService';
import { userExportService } from './services/userExportService';
import { useDataStore } from './hooks/useDataStore';
import { scoreCalculator } from './utils/scoreCalculator';
import { storageService } from './services/storageService';

function App() {
  const {
    users,
    currentUser,
    loading: userLoading,
    selectUser,
    isAdmin
  } = useUser();

  const {
    domains,
    answers,
    evidence,
    comments,
    loading,
    error,
    saveAnswer,
    clearAnswer,
    saveComment,
    saveEvidenceForQuestion
  } = useAssessment(currentUser?.id);

  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [userQuestions, setUserQuestions] = useState([]);
  
  // Use the router hook for navigation
  const { currentRoute, currentSubRoute, navigate } = useRouter();
  const { frameworks } = useCompliance(answers);
  const {
    getQuestionsForUser,
    getUsers,
    initialized,
    importData,
    exportData,
    clearAllData
  } = useDataStore();

  const [adminAnswers, setAdminAnswers] = useState({});
  const [snapshots, setSnapshots] = useState([]);
  const snapshotSavedRef = useRef(false);

  // Load aggregated answers from all users for the admin dashboard
  useEffect(() => {
    if (isAdmin() && initialized) {
      const allUserIds = getUsers().map(u => u.id);
      storageService.loadAllUsersAnswers(allUserIds).then(setAdminAnswers);
    }
  }, [isAdmin, initialized, getUsers]);

  // Load snapshots for the current user
  useEffect(() => {
    if (currentUser && !isAdmin()) {
      setSnapshots(storageService.loadSnapshots(currentUser.id));
      snapshotSavedRef.current = false;
    }
  }, [currentUser, isAdmin]);

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

  // Auto-save snapshot when assessment reaches 100%
  useEffect(() => {
    if (!currentUser || isAdmin() || userQuestions.length === 0) return;
    const prog = scoreCalculator.calculateProgressFromQuestions(userQuestions, answers, evidence);
    if (prog.percentage === 100 && !snapshotSavedRef.current) {
      snapshotSavedRef.current = true;
      const builtDomains = scoreCalculator.buildDomainsFromQuestions(userQuestions);
      const overall = scoreCalculator.calculateOverallScore(builtDomains, answers);
      const domainScoreEntries = Object.entries(builtDomains).map(([id, domain]) => {
        const domainQuestions = scoreCalculator.getAllQuestionsFromDomain(domain);
        return [id, Math.round(scoreCalculator.calculateDomainScore(domainQuestions, answers) * 100) / 100];
      });
      const snapshot = {
        timestamp: new Date().toISOString(),
        overallScore: Math.round(overall * 100) / 100,
        domainScores: Object.fromEntries(domainScoreEntries),
        percentage: prog.percentage
      };
      storageService.saveSnapshot(currentUser.id, snapshot);
      setSnapshots(prev => [...prev, snapshot]);
    }
  }, [currentUser, isAdmin, userQuestions, answers, evidence]);

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

  const handleExportPDF = async (chartSnapshots = {}) => {
    try {
      // Admin report uses all users' merged answers; assessor report uses their own
      const reportAnswers = isAdmin() ? adminAnswers : answers;

      // Attach live-calculated compliance scores to each framework before passing to PDF
      const scoredFrameworks = Object.fromEntries(
        Object.entries(frameworks).map(([id, fw]) => [
          id,
          { ...fw, score: complianceService.calculateFrameworkScore(fw, reportAnswers) }
        ])
      );

      const pdf = await pdfService.generatePDF(
        domains, reportAnswers, evidence, scoredFrameworks, { chartSnapshots }, comments
      );
      await pdfService.downloadPDF(pdf);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleLogout = () => {
    selectUser(null);
    setUserQuestions([]);
    navigate('assessment');
  };

  const handleSwitchToResults = () => navigate('results');
  const handleBackToAssessment = () => navigate('assessment');
  const handleExpandChart = (chartType) => navigate('results', `chart/${chartType}`);
  const handleBackFromChart = () => navigate('results');


  const handleImportData = async (file) => {
    try {
      // Read the file content
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      // Import the data
      const result = await importData(jsonData);
      
      if (result.success) {
        alert('Data imported successfully!');
        // Reload the page to reflect changes
        window.location.reload();
      } else {
        throw new Error(result.error || 'Import failed');
      }
    } catch (error) {
      console.error('Error importing data:', error);
      alert(`Failed to import data: ${error.message}`);
    }
  };

  const handleExportData = async () => {
    try {
      const result = await exportData();
      if (result.success) {
        // Download will be triggered automatically
        // No need for alert as the download provides feedback
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleClearAllData = async () => {
    if (!window.confirm('This will delete ALL user data and admin customizations, then reload the app with default settings. Continue?')) return;
    try {
      const result = await clearAllData();
      if (result?.success === false) {
        alert('Failed to clear data. Please try again.');
      } else {
        window.location.reload();
      }
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
          `Export Failed\n\n` +
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

  const progress = scoreCalculator.calculateProgressFromQuestions(userQuestions, answers, evidence);

  // Route: chart fullscreen (non-admin only)
  if (!isAdmin() && currentRoute === 'results' && currentSubRoute?.startsWith('chart/')) {
    const chartType = currentSubRoute.slice('chart/'.length);
    return (
      <ChartFullscreenView
        chartType={chartType}
        questions={userQuestions}
        answers={answers}
        onBack={handleBackFromChart}
      />
    );
  }

  // Route: results view (non-admin only)
  if (!isAdmin() && currentRoute === 'results') {
    return (
      <ResultsView
        user={currentUser}
        questions={userQuestions}
        answers={answers}
        progress={progress}
        snapshots={snapshots}
        onBackToAssessment={handleBackToAssessment}
        onLogout={handleLogout}
        onExpandChart={handleExpandChart}
      />
    );
  }

  // Default: role-based main view
  return (
    <>
      {isAdmin() ? (
        <FullScreenAdminView
          domains={domains}
          answers={adminAnswers}
          evidence={evidence}
          frameworks={Object.values(frameworks)}
          onExportPDF={handleExportPDF}
          onLogout={handleLogout}
          onImportData={handleImportData}
          onExportData={handleExportData}
          onClearAllData={handleClearAllData}
        />
      ) : (
        <UserView
          user={currentUser}
          questions={userQuestions}
          answers={answers}
          evidence={evidence}
          comments={comments}
          frameworks={frameworks}
          progress={progress}
          onAnswerChange={saveAnswer}
          onClearAnswer={clearAnswer}
          onCommentChange={saveComment}
          onAddEvidence={handleOpenEvidence}
          onExportUserData={handleExportUserData}
          onSwitchToResults={handleSwitchToResults}
          onLogout={handleLogout}
        />
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
