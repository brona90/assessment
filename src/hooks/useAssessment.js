import { useState, useEffect, useCallback, useRef } from 'react';
import { storageService } from '../services/storageService';
import { dataService } from '../services/dataService';
import { scoreCalculator } from '../utils/scoreCalculator';

export const useAssessment = (userId) => {
  const [domains, setDomains] = useState(null);
  const [answers, setAnswers] = useState({});
  const answersRef = useRef({});
  const [evidence, setEvidence] = useState({});
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [questionsData, savedAnswers, savedEvidence] = await Promise.all([
        dataService.loadQuestions(),
        storageService.loadAssessment(userId),
        storageService.loadAllEvidence()
      ]);

      if (!questionsData) {
        throw new Error('Failed to load questions');
      }

      setDomains(questionsData);
      answersRef.current = savedAnswers;
      setAnswers(savedAnswers);
      setEvidence(savedEvidence);
      setComments(storageService.loadComments(userId));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveAnswer = useCallback(async (questionId, value) => {
    const newAnswers = { ...answersRef.current, [questionId]: value };
    answersRef.current = newAnswers;
    setAnswers(newAnswers);
    await storageService.saveAssessment(userId, newAnswers);
    storageService.saveLastActive(userId);
  }, [userId]);

  const clearAnswer = useCallback(async (questionId) => {
    const newAnswers = { ...answersRef.current };
    delete newAnswers[questionId];
    answersRef.current = newAnswers;
    setAnswers(newAnswers);
    await storageService.saveAssessment(userId, newAnswers);
  }, [userId]);

  const saveEvidenceForQuestion = useCallback(async (questionId, evidenceData) => {
    setEvidence(prev => ({ ...prev, [questionId]: evidenceData }));
    await storageService.saveEvidence(questionId, evidenceData);
  }, []);

  const saveComment = useCallback((questionId, text) => {
    setComments(prev => {
      const updated = { ...prev, [questionId]: text };
      storageService.saveComments(userId, updated);
      return updated;
    });
  }, [userId]);

  const clearAllData = useCallback(async () => {
    setAnswers({});
    setEvidence({});
    setComments({});
    await Promise.all([
      storageService.clearAssessment(userId),
      storageService.clearAllEvidence()
    ]);
    storageService.saveComments(userId, {});
  }, [userId]);

  const getProgress = useCallback(() => {
    if (!domains) return { answered: 0, total: 0, percentage: 0 };
    return scoreCalculator.calculateProgress(domains, answers);
  }, [domains, answers]);

  const getDomainScore = useCallback((domainKey) => {
    if (!domains || !domains[domainKey]) return 0;
    const questions = scoreCalculator.getAllQuestionsFromDomain(domains[domainKey]);
    return scoreCalculator.calculateDomainScore(questions, answers);
  }, [domains, answers]);

  const getOverallScore = useCallback(() => {
    if (!domains) return 0;
    return scoreCalculator.calculateOverallScore(domains, answers);
  }, [domains, answers]);

  return {
    domains,
    answers,
    evidence,
    comments,
    loading,
    error,
    saveAnswer,
    clearAnswer,
    saveComment,
    saveEvidenceForQuestion,
    clearAllData,
    getProgress,
    getDomainScore,
    getOverallScore,
    reload: loadData
  };
};