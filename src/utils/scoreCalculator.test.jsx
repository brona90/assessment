import { describe, it, expect } from 'vitest';
import { scoreCalculator, NA_VALUE } from './scoreCalculator';

describe('ScoreCalculator', () => {
  const mockQuestions = [
    { id: 'q1', text: 'Question 1' },
    { id: 'q2', text: 'Question 2' },
    { id: 'q3', text: 'Question 3' }
  ];

  const mockAnswers = {
    q1: 3,
    q2: 4,
    q3: 5
  };

  describe('calculateDomainScore', () => {
    it('should calculate average score for answered questions', () => {
      const score = scoreCalculator.calculateDomainScore(mockQuestions, mockAnswers);
      expect(score).toBe(4); // (3+4+5)/3 = 4
    });

    it('should return 0 for empty questions', () => {
      const score = scoreCalculator.calculateDomainScore([], mockAnswers);
      expect(score).toBe(0);
    });

    it('should ignore unanswered questions', () => {
      const partialAnswers = { q1: 3, q2: 4 };
      const score = scoreCalculator.calculateDomainScore(mockQuestions, partialAnswers);
      expect(score).toBe(3.5); // (3+4)/2 = 3.5
    });

    it('should return 0 when no questions are answered', () => {
      const score = scoreCalculator.calculateDomainScore(mockQuestions, {});
      expect(score).toBe(0);
    });
  });

  describe('calculateOverallScore', () => {
    const mockDomains = {
      domain1: {
        weight: 0.3,
        categories: {
          cat1: { questions: [{ id: 'q1' }, { id: 'q2' }] }
        }
      },
      domain2: {
        weight: 0.7,
        categories: {
          cat1: { questions: [{ id: 'q3' }] }
        }
      }
    };

    it('should calculate weighted overall score', () => {
      const answers = { q1: 3, q2: 3, q3: 5 };
      const score = scoreCalculator.calculateOverallScore(mockDomains, answers);
      expect(score).toBeCloseTo(4.4, 1); // (3*0.3 + 5*0.7) = 4.4
    });

    it('should return 0 when no answers provided', () => {
      const score = scoreCalculator.calculateOverallScore(mockDomains, {});
      expect(score).toBe(0);
    });
  });

  describe('getAllQuestionsFromDomain', () => {
    it('should extract all questions from domain categories', () => {
      const domain = {
        categories: {
          cat1: { questions: [{ id: 'q1' }, { id: 'q2' }] },
          cat2: { questions: [{ id: 'q3' }] }
        }
      };
      
      const questions = scoreCalculator.getAllQuestionsFromDomain(domain);
      expect(questions).toHaveLength(3);
      expect(questions.map(q => q.id)).toEqual(['q1', 'q2', 'q3']);
    });

    it('should return empty array for domain without categories', () => {
      const questions = scoreCalculator.getAllQuestionsFromDomain({});
      expect(questions).toEqual([]);
    });
  });

  describe('calculateProgress', () => {
    const mockDomains = {
      domain1: {
        categories: {
          cat1: { questions: [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }] }
        }
      }
    };

    it('should calculate progress correctly', () => {
      const answers = { q1: 3, q2: 4 };
      const progress = scoreCalculator.calculateProgress(mockDomains, answers);
      
      expect(progress.answered).toBe(2);
      expect(progress.total).toBe(3);
      expect(progress.percentage).toBe(67);
    });

    it('should return 0% for no answers', () => {
      const progress = scoreCalculator.calculateProgress(mockDomains, {});
      expect(progress.percentage).toBe(0);
    });

    it('should return 100% when all answered', () => {
      const answers = { q1: 3, q2: 4, q3: 5 };
      const progress = scoreCalculator.calculateProgress(mockDomains, answers);
      expect(progress.percentage).toBe(100);
    });

    it('should handle empty domains', () => {
      const progress = scoreCalculator.calculateProgress({}, {});
      expect(progress.answered).toBe(0);
      expect(progress.total).toBe(0);
      expect(progress.percentage).toBe(0);
    });
  });

  describe('calculateComplianceScore', () => {
    const mockFramework = {
      mappedQuestions: ['q1', 'q2', 'q3']
    };

    it('should calculate compliance score as percentage', () => {
      const answers = { q1: 4, q2: 5, q3: 3 };
      const score = scoreCalculator.calculateComplianceScore(mockFramework, null, answers);
      expect(score).toBe(80);
    });

    it('should return 0 for framework without mapped questions', () => {
      const score = scoreCalculator.calculateComplianceScore({}, null, mockAnswers);
      expect(score).toBe(0);
    });

    it('should return 0 when no questions are answered', () => {
      const score = scoreCalculator.calculateComplianceScore(mockFramework, null, {});
      expect(score).toBe(0);
    });

    it('should handle partial answers', () => {
      const answers = { q1: 5 };
      const score = scoreCalculator.calculateComplianceScore(mockFramework, null, answers);
      expect(score).toBe(100);
    });

    it('should return 0 for null mappedQuestions', () => {
      const framework = { mappedQuestions: null };
      const score = scoreCalculator.calculateComplianceScore(framework, null, mockAnswers);
      expect(score).toBe(0);
    });

    it('should return 0 for empty mappedQuestions array', () => {
      const framework = { mappedQuestions: [] };
      const score = scoreCalculator.calculateComplianceScore(framework, null, mockAnswers);
      expect(score).toBe(0);
    });
  });

  describe('getMaturityLevel', () => {
    it('should return correct maturity levels', () => {
      expect(scoreCalculator.getMaturityLevel(5)).toBe('Optimized');
      expect(scoreCalculator.getMaturityLevel(4)).toBe('Managed');
      expect(scoreCalculator.getMaturityLevel(3)).toBe('Defined');
      expect(scoreCalculator.getMaturityLevel(2)).toBe('Initial');
      expect(scoreCalculator.getMaturityLevel(1)).toBe('Not Implemented');
    });
  });

  describe('getComplianceStatus', () => {
    it('should return correct compliance status', () => {
      expect(scoreCalculator.getComplianceStatus(95, 80)).toBe('Excellent');
      expect(scoreCalculator.getComplianceStatus(85, 80)).toBe('Good');
      expect(scoreCalculator.getComplianceStatus(75, 80)).toBe('Fair');
      expect(scoreCalculator.getComplianceStatus(65, 80)).toBe('Needs Improvement');
      expect(scoreCalculator.getComplianceStatus(50, 80)).toBe('Critical');
    });

    it('should handle edge cases for compliance status', () => {
      expect(scoreCalculator.getComplianceStatus(90, 80)).toBe('Excellent');
      expect(scoreCalculator.getComplianceStatus(80, 80)).toBe('Good');
      expect(scoreCalculator.getComplianceStatus(70, 80)).toBe('Fair');
      expect(scoreCalculator.getComplianceStatus(60, 80)).toBe('Needs Improvement');
      expect(scoreCalculator.getComplianceStatus(59, 80)).toBe('Critical');
    });
  });

  describe('calculateProgressFromQuestions', () => {
    const questions = [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }];

    it('should calculate progress from a flat question list', () => {
      const answers = { q1: 3, q2: 4 };
      const progress = scoreCalculator.calculateProgressFromQuestions(questions, answers);
      expect(progress.answered).toBe(2);
      expect(progress.total).toBe(3);
      expect(progress.percentage).toBe(67);
    });

    it('should return 0% for no answers', () => {
      const progress = scoreCalculator.calculateProgressFromQuestions(questions, {});
      expect(progress.answered).toBe(0);
      expect(progress.total).toBe(3);
      expect(progress.percentage).toBe(0);
    });

    it('should return 100% when all answered', () => {
      const answers = { q1: 1, q2: 2, q3: 3 };
      const progress = scoreCalculator.calculateProgressFromQuestions(questions, answers);
      expect(progress.answered).toBe(3);
      expect(progress.total).toBe(3);
      expect(progress.percentage).toBe(100);
    });

    it('should return 0% for empty question list', () => {
      const progress = scoreCalculator.calculateProgressFromQuestions([], { q1: 3 });
      expect(progress.answered).toBe(0);
      expect(progress.total).toBe(0);
      expect(progress.percentage).toBe(0);
    });

    it('should count withEvidence for answered questions that have evidence', () => {
      const answers = { q1: 3, q2: 4 };
      const evidence = { q1: { text: 'some evidence' } };
      const progress = scoreCalculator.calculateProgressFromQuestions(questions, answers, evidence);
      expect(progress.withEvidence).toBe(1);
    });

    it('should return withEvidence=0 when no evidence provided', () => {
      const answers = { q1: 3, q2: 4 };
      const progress = scoreCalculator.calculateProgressFromQuestions(questions, answers);
      expect(progress.withEvidence).toBe(0);
    });

    it('should not count evidence for unanswered questions', () => {
      const answers = { q1: 3 };
      const evidence = { q1: { text: 'e1' }, q2: { text: 'e2' } };
      const progress = scoreCalculator.calculateProgressFromQuestions(questions, answers, evidence);
      expect(progress.withEvidence).toBe(1); // only q1 answered
    });
  });

  describe('calculatePriorityScore', () => {
    it('should return gap × weight for a scored question', () => {
      expect(scoreCalculator.calculatePriorityScore(2, 1)).toBe(2);
    });

    it('should return 0 for a question that meets target', () => {
      expect(scoreCalculator.calculatePriorityScore(4, 1)).toBe(0);
    });

    it('should return 0 for a question that exceeds target', () => {
      expect(scoreCalculator.calculatePriorityScore(5, 1)).toBe(0);
    });

    it('should scale by domain weight', () => {
      expect(scoreCalculator.calculatePriorityScore(2, 2)).toBe(4); // gap=2, weight=2
    });

    it('should return 0 for NA_VALUE', () => {
      expect(scoreCalculator.calculatePriorityScore(NA_VALUE, 1)).toBe(0);
    });

    it('should default weight to 1 when not provided', () => {
      expect(scoreCalculator.calculatePriorityScore(3)).toBe(1); // gap=1, weight defaults to 1
    });
  });

  describe('N/A (NA_VALUE) handling', () => {
    it('NA_VALUE should be exported as a number', () => {
      expect(typeof NA_VALUE).toBe('number');
    });

    it('calculateDomainScore should exclude NA_VALUE answers from average', () => {
      const answers = { q1: 4, q2: NA_VALUE, q3: 2 };
      const score = scoreCalculator.calculateDomainScore(mockQuestions, answers);
      expect(score).toBe(3); // (4+2)/2 — q2 excluded
    });

    it('calculateProgressFromQuestions should count NA_VALUE as answered', () => {
      const questions = [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }];
      const answers = { q1: 3, q2: NA_VALUE };
      const progress = scoreCalculator.calculateProgressFromQuestions(questions, answers);
      expect(progress.answered).toBe(2);
      expect(progress.total).toBe(3);
    });

    it('calculateComplianceScore should exclude NA_VALUE from compliance average', () => {
      const framework = { mappedQuestions: ['q1', 'q2', 'q3'] };
      const answers = { q1: 5, q2: NA_VALUE, q3: 5 };
      const score = scoreCalculator.calculateComplianceScore(framework, null, answers);
      expect(score).toBe(100); // only q1 and q3 counted
    });
  });

  describe('getAllQuestionsFromDomain edge cases', () => {
    it('should handle domain with null categories', () => {
      const domain = { categories: null };
      const questions = scoreCalculator.getAllQuestionsFromDomain(domain);
      expect(questions).toEqual([]);
    });

    it('should handle category without questions', () => {
      const domain = {
        categories: {
          cat1: {}
        }
      };
      const questions = scoreCalculator.getAllQuestionsFromDomain(domain);
      expect(questions).toEqual([]);
    });
  });
});