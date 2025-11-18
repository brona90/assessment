import { useState, useEffect, useCallback } from 'react';
import { dataStore } from '../services/dataStore';

/**
 * Hook for managing data store operations
 * Provides CRUD operations for domains, frameworks, users, and questions
 */
export const useDataStore = () => {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize data store on mount
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await dataStore.initialize();
        setInitialized(true);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!dataStore.initialized) {
      init();
    } else {
      setInitialized(true);
      setLoading(false);
    }
  }, []);

  // Domain operations
  const getDomains = useCallback(() => {
    return dataStore.getDomains();
  }, []);

  const addDomain = useCallback((domain) => {
    try {
      const result = dataStore.addDomain(domain);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const updateDomain = useCallback((domainId, updates) => {
    try {
      const result = dataStore.updateDomain(domainId, updates);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const deleteDomain = useCallback((domainId) => {
    try {
      dataStore.deleteDomain(domainId);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Framework operations
  const getFrameworks = useCallback(() => {
    return dataStore.getFrameworks();
  }, []);

  const getSelectedFrameworks = useCallback(() => {
    return dataStore.getSelectedFrameworks();
  }, []);

  const addFramework = useCallback((framework) => {
    try {
      const result = dataStore.addFramework(framework);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const updateFramework = useCallback((frameworkId, updates) => {
    try {
      const result = dataStore.updateFramework(frameworkId, updates);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const deleteFramework = useCallback((frameworkId) => {
    try {
      dataStore.deleteFramework(frameworkId);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const setSelectedFrameworks = useCallback((frameworkIds) => {
    try {
      const result = dataStore.setSelectedFrameworks(frameworkIds);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // User operations
  const getUsers = useCallback(() => {
    return dataStore.getUsers();
  }, []);

  const addUser = useCallback((user) => {
    try {
      const result = dataStore.addUser(user);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const updateUser = useCallback((userId, updates) => {
    try {
      const result = dataStore.updateUser(userId, updates);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const deleteUser = useCallback((userId) => {
    try {
      dataStore.deleteUser(userId);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Question operations
  const getQuestions = useCallback(() => {
    return dataStore.getQuestions();
  }, []);

  const getQuestionsByDomain = useCallback((domainId) => {
    return dataStore.getQuestionsByDomain(domainId);
  }, []);

  const getQuestionsForUser = useCallback((userId) => {
    return dataStore.getQuestionsForUser(userId);
  }, []);

  const addQuestion = useCallback((question) => {
    try {
      const result = dataStore.addQuestion(question);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const updateQuestion = useCallback((questionId, updates) => {
    try {
      const result = dataStore.updateQuestion(questionId, updates);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const deleteQuestion = useCallback((questionId) => {
    try {
      dataStore.deleteQuestion(questionId);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Assignment operations
  const getUserAssignments = useCallback((userId) => {
    return dataStore.getUserAssignments(userId);
  }, []);

  const assignQuestionsToUser = useCallback((userId, questionIds) => {
    try {
      const result = dataStore.assignQuestionsToUser(userId, questionIds);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const addQuestionAssignments = useCallback((userId, questionIds) => {
    try {
      const result = dataStore.addQuestionAssignments(userId, questionIds);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const removeQuestionAssignments = useCallback((userId, questionIds) => {
    try {
      const result = dataStore.removeQuestionAssignments(userId, questionIds);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Export/Import operations
  const exportData = useCallback(() => {
    try {
      dataStore.downloadData();
      return { success: true };
    } catch (error) {
      console.error('Error exporting data:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const importData = useCallback((jsonData) => {
    try {
      dataStore.importData(jsonData);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const downloadData = useCallback((filename) => {
    try {
      dataStore.downloadData(filename);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const clearAllData = useCallback(async () => {
    try {
      const result = await dataStore.clearAllData();
      if (result.success) {
        setInitialized(false);
        setLoading(false);
        setError(null);
      }
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Answers operations
  const getAnswers = useCallback(() => {
    return dataStore.getAnswers();
  }, []);

  const setAnswers = useCallback((answers) => {
    try {
      const result = dataStore.setAnswers(answers);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const updateAnswer = useCallback((questionId, value) => {
    try {
      const result = dataStore.updateAnswer(questionId, value);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const clearAnswers = useCallback(() => {
    try {
      const result = dataStore.clearAnswers();
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Evidence operations
  const getEvidence = useCallback(() => {
    return dataStore.getEvidence();
  }, []);

  const setEvidence = useCallback((evidence) => {
    try {
      const result = dataStore.setEvidence(evidence);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const updateEvidence = useCallback((questionId, evidenceData) => {
    try {
      const result = dataStore.updateEvidence(questionId, evidenceData);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const clearEvidence = useCallback(() => {
    try {
      const result = dataStore.clearEvidence();
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  return {
    initialized,
    loading,
    error,
    // Domain operations
    getDomains,
    addDomain,
    updateDomain,
    deleteDomain,
    // Framework operations
    getFrameworks,
    getSelectedFrameworks,
    addFramework,
    updateFramework,
    deleteFramework,
    setSelectedFrameworks,
    // User operations
    getUsers,
    addUser,
    updateUser,
    deleteUser,
    // Question operations
    getQuestions,
    getQuestionsByDomain,
    getQuestionsForUser,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    // Assignment operations
    getUserAssignments,
    assignQuestionsToUser,
    addQuestionAssignments,
    removeQuestionAssignments,
    // Answers operations
    getAnswers,
    setAnswers,
    updateAnswer,
    clearAnswers,
    // Evidence operations
    getEvidence,
    setEvidence,
    updateEvidence,
    clearEvidence,
    // Export/Import
    exportData,
    importData,
    downloadData,
      clearAllData
  };
};