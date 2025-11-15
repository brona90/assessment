import { useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storageService';
import { dataService } from '../services/dataService';
import { scoreCalculator } from '../utils/scoreCalculator';

export const useAssessment = () => {
  const [domains, setDomains] = useState(null);
  const [answers, setAnswers] = useState({});
  const [evidence, setEvidence] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [questionsData, savedAnswers, savedEvidence] = await Promise.all([
        dataService.loadQuestions(),
        storageService.loadAssessment(),
        storageService.loadAllEvidence()
      ]);

      if (!questionsData) {
        throw new Error('Failed to load questions');
      }

      setDomains(questionsData);
      setAnswers(savedAnswers);
      setEvidence(savedEvidence);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveAnswer = useCallback(async (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    await storageService.saveAssessment(newAnswers);
  }, [answers]);

  const clearAnswer = useCallback(async (questionId) => {
    const newAnswers = { ...answers };
    delete newAnswers[questionId];
    setAnswers(newAnswers);
    await storageService.saveAssessment(newAnswers);
  }, [answers]);

  const saveEvidenceForQuestion = useCallback(async (questionId, evidenceData) => {
    const newEvidence = { ...evidence, [questionId]: evidenceData };
    setEvidence(newEvidence);
    await storageService.saveEvidence(questionId, evidenceData);
  }, [evidence]);

  const clearAllData = useCallback(async () => {
    setAnswers({});
    setEvidence({});
    await Promise.all([
      storageService.clearAssessment(),
      storageService.clearAllEvidence()
    ]);
  }, []);

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
    loading,
    error,
    saveAnswer,
    clearAnswer,
    saveEvidenceForQuestion,
    clearAllData,
    getProgress,
    getDomainScore,
    getOverallScore,
    reload: loadData
  };
};