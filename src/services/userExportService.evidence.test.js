import { describe, it, expect } from 'vitest';
import { userExportService } from './userExportService';

describe('UserExportService - Evidence Validation', () => {
  const mockQuestions = [
    { id: 'q1', text: 'Question 1', domainId: 'd1', categoryId: 'c1' },
    { id: 'q2', text: 'Question 2', domainId: 'd1', categoryId: 'c1' },
    { id: 'q3', text: 'Question 3', domainId: 'd2', categoryId: 'c2' }
  ];

  describe('validateEvidenceRequirement', () => {
    it('should pass validation when all answered questions have evidence', () => {
      const answers = { q1: 3, q2: 4 };
      const evidence = { 
        q1: [{ url: 'photo1.jpg' }], 
        q2: [{ url: 'photo2.jpg' }] 
      };

      const result = userExportService.validateEvidenceRequirement(
        mockQuestions,
        answers,
        evidence
      );

      expect(result.isValid).toBe(true);
      expect(result.totalAnswered).toBe(2);
      expect(result.missingEvidence).toBe(0);
      expect(result.questionsWithoutEvidence).toHaveLength(0);
    });

    it('should fail validation when answered questions are missing evidence', () => {
      const answers = { q1: 3, q2: 4 };
      const evidence = { q1: [{ url: 'photo1.jpg' }] }; // q2 missing evidence

      const result = userExportService.validateEvidenceRequirement(
        mockQuestions,
        answers,
        evidence
      );

      expect(result.isValid).toBe(false);
      expect(result.totalAnswered).toBe(2);
      expect(result.missingEvidence).toBe(1);
      expect(result.questionsWithoutEvidence).toHaveLength(1);
      expect(result.questionsWithoutEvidence[0].id).toBe('q2');
    });

    it('should fail validation when evidence array is empty', () => {
      const answers = { q1: 3 };
      const evidence = { q1: [] }; // Empty array

      const result = userExportService.validateEvidenceRequirement(
        mockQuestions,
        answers,
        evidence
      );

      expect(result.isValid).toBe(false);
      expect(result.missingEvidence).toBe(1);
    });

    it('should pass validation when no questions are answered', () => {
      const answers = {};
      const evidence = {};

      const result = userExportService.validateEvidenceRequirement(
        mockQuestions,
        answers,
        evidence
      );

      expect(result.isValid).toBe(true);
      expect(result.totalAnswered).toBe(0);
      expect(result.missingEvidence).toBe(0);
    });

    it('should ignore unanswered questions', () => {
      const answers = { q1: 3 }; // Only q1 answered
      const evidence = { q1: [{ url: 'photo1.jpg' }] };

      const result = userExportService.validateEvidenceRequirement(
        mockQuestions,
        answers,
        evidence
      );

      expect(result.isValid).toBe(true);
      expect(result.totalAnswered).toBe(1);
    });
  });

  describe('downloadUserExport with evidence validation', () => {
    it('should fail export when evidence is required but missing', () => {
      const answers = { q1: 3, q2: 4 };
      const evidence = { q1: [{ url: 'photo1.jpg' }] }; // q2 missing

      const result = userExportService.downloadUserExport(
        'user1',
        'Test User',
        mockQuestions,
        answers,
        evidence,
        true // Require evidence
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('missing evidence');
      expect(result.validation).toBeDefined();
      expect(result.validation.missingEvidence).toBe(1);
    });

    it('should succeed when evidence validation is disabled', () => {
      const answers = { q1: 3, q2: 4 };
      const evidence = { q1: [{ url: 'photo1.jpg' }] }; // q2 missing

      const result = userExportService.downloadUserExport(
        'user1',
        'Test User',
        mockQuestions,
        answers,
        evidence,
        false // Don't require evidence
      );

      expect(result.success).toBe(true);
    });

    it('should succeed when all evidence is provided', () => {
      const answers = { q1: 3, q2: 4 };
      const evidence = { 
        q1: [{ url: 'photo1.jpg' }],
        q2: [{ url: 'photo2.jpg' }]
      };

      const result = userExportService.downloadUserExport(
        'user1',
        'Test User',
        mockQuestions,
        answers,
        evidence,
        true // Require evidence
      );

      expect(result.success).toBe(true);
    });
  });
});