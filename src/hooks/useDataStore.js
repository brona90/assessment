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
    return dataStore.exportData();
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
    dataStore.downloadData(filename);
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
    // Export/Import
    exportData,
    importData,
    downloadData
  };
};