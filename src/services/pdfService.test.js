import { describe, it, expect } from 'vitest';
import { pdfService } from './pdfService';

describe('pdfService', () => {
  describe('calculateDomainScore', () => {
    const domain = {
      categories: {
        cat1: {
          questions: [
            { id: 'q1' },
            { id: 'q2' },
            { id: 'q3' }
          ]
        }
      }
    };

    it('should calculate average score for domain', () => {
      const answers = { q1: 4, q2: 3, q3: 5 };
      const score = pdfService.calculateDomainScore(domain, answers);
      
      expect(score).toBe(4);
    });

    it('should handle partial answers', () => {
      const answers = { q1: 4, q2: 3 };
      const score = pdfService.calculateDomainScore(domain, answers);
      
      expect(score).toBe(3.5);
    });

    it('should return 0 for no answers', () => {
      const answers = {};
      const score = pdfService.calculateDomainScore(domain, answers);
      
      expect(score).toBe(0);
    });

    it('should handle domain with no questions', () => {
      const emptyDomain = { categories: {} };
      const score = pdfService.calculateDomainScore(emptyDomain, {});
      
      expect(score).toBe(0);
    });

    it('should handle domain with null categories', () => {
      const nullDomain = { categories: null };
      const score = pdfService.calculateDomainScore(nullDomain, {});
      
      expect(score).toBe(0);
    });

    it('should handle category with no questions', () => {
      const domainNoQuestions = {
        categories: {
          cat1: { questions: [] }
        }
      };
      const score = pdfService.calculateDomainScore(domainNoQuestions, {});
      
      expect(score).toBe(0);
    });
  });

  describe('calculateOverallScore', () => {
    const domains = {
      domain1: {
        weight: 1,
        categories: {
          cat1: {
            questions: [{ id: 'q1' }, { id: 'q2' }]
          }
        }
      },
      domain2: {
        weight: 2,
        categories: {
          cat1: {
            questions: [{ id: 'q3' }, { id: 'q4' }]
          }
        }
      }
    };

    it('should calculate weighted average score', () => {
      const answers = { q1: 4, q2: 4, q3: 2, q4: 2 };
      const score = pdfService.calculateOverallScore(domains, answers);
      
      // (4*1 + 2*2) / (1+2) = 8/3 = 2.67
      expect(score).toBeCloseTo(2.67, 1);
    });

    it('should handle no answers', () => {
      const score = pdfService.calculateOverallScore(domains, {});
      
      expect(score).toBe(0);
    });

    it('should handle partial answers', () => {
      const answers = { q1: 5, q2: 5 };
      const score = pdfService.calculateOverallScore(domains, answers);
      
      // Only domain1 has answers: (5*1) / 1 = 5
      expect(score).toBe(5);
    });

    it('should handle empty domains', () => {
      const score = pdfService.calculateOverallScore({}, {});
      
      expect(score).toBe(0);
    });

    it('should handle domains with different weights', () => {
      const weightedDomains = {
        d1: {
          weight: 3,
          categories: {
            c1: { questions: [{ id: 'q1' }] }
          }
        },
        d2: {
          weight: 1,
          categories: {
            c1: { questions: [{ id: 'q2' }] }
          }
        }
      };
      const answers = { q1: 4, q2: 2 };
      const score = pdfService.calculateOverallScore(weightedDomains, answers);
      
      // (4*3 + 2*1) / (3+1) = 14/4 = 3.5
      expect(score).toBe(3.5);
    });
  });

  describe('getMaturityLevel', () => {
    it('should return Optimized for score >= 4.5', () => {
      expect(pdfService.getMaturityLevel(4.5)).toBe('Optimized');
      expect(pdfService.getMaturityLevel(5.0)).toBe('Optimized');
    });

    it('should return Managed for score >= 3.5', () => {
      expect(pdfService.getMaturityLevel(3.5)).toBe('Managed');
      expect(pdfService.getMaturityLevel(4.0)).toBe('Managed');
      expect(pdfService.getMaturityLevel(4.4)).toBe('Managed');
    });

    it('should return Defined for score >= 2.5', () => {
      expect(pdfService.getMaturityLevel(2.5)).toBe('Defined');
      expect(pdfService.getMaturityLevel(3.0)).toBe('Defined');
      expect(pdfService.getMaturityLevel(3.4)).toBe('Defined');
    });

    it('should return Initial for score >= 1.5', () => {
      expect(pdfService.getMaturityLevel(1.5)).toBe('Initial');
      expect(pdfService.getMaturityLevel(2.0)).toBe('Initial');
      expect(pdfService.getMaturityLevel(2.4)).toBe('Initial');
    });

    it('should return Not Implemented for score < 1.5', () => {
      expect(pdfService.getMaturityLevel(0)).toBe('Not Implemented');
      expect(pdfService.getMaturityLevel(1.0)).toBe('Not Implemented');
      expect(pdfService.getMaturityLevel(1.4)).toBe('Not Implemented');
    });

    it('should handle edge cases', () => {
      expect(pdfService.getMaturityLevel(4.49)).toBe('Managed');
      expect(pdfService.getMaturityLevel(3.49)).toBe('Defined');
      expect(pdfService.getMaturityLevel(2.49)).toBe('Initial');
      expect(pdfService.getMaturityLevel(1.49)).toBe('Not Implemented');
    });
  });
});