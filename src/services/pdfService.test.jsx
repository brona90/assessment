import { describe, it, expect, vi } from 'vitest';
import { pdfService } from './pdfService';

describe('PdfService', () => {
  const mockDomains = {
    domain1: {
      title: 'Domain 1',
      weight: 0.5,
      categories: {
        cat1: {
          questions: [
            { id: 'q1', text: 'Question 1' },
            { id: 'q2', text: 'Question 2' }
          ]
        }
      }
    },
    domain2: {
      title: 'Domain 2',
      weight: 0.5,
      categories: {
        cat1: {
          questions: [
            { id: 'q3', text: 'Question 3' }
          ]
        }
      }
    }
  };

  const mockAnswers = {
    q1: 3,
    q2: 4,
    q3: 5
  };

  describe('calculateDomainScore', () => {
    it('should calculate domain score correctly', () => {
      const score = pdfService.calculateDomainScore(mockDomains.domain1, mockAnswers);
      expect(score).toBe(3.5);
    });

    it('should return 0 for domain without categories', () => {
      const score = pdfService.calculateDomainScore({ categories: null }, mockAnswers);
      expect(score).toBe(0);
    });

    it('should return 0 for domain without questions', () => {
      const domain = { categories: { cat1: { questions: null } } };
      const score = pdfService.calculateDomainScore(domain, mockAnswers);
      expect(score).toBe(0);
    });

    it('should return 0 when no questions answered', () => {
      const score = pdfService.calculateDomainScore(mockDomains.domain1, {});
      expect(score).toBe(0);
    });
  });

  describe('calculateOverallScore', () => {
    it('should calculate weighted overall score', () => {
      const score = pdfService.calculateOverallScore(mockDomains, mockAnswers);
      expect(score).toBeCloseTo(4.25, 1);
    });

    it('should return 0 when no answers', () => {
      const score = pdfService.calculateOverallScore(mockDomains, {});
      expect(score).toBe(0);
    });

    it('should handle domains with 0 scores', () => {
      const answers = { q1: 0, q2: 0 };
      const score = pdfService.calculateOverallScore(mockDomains, answers);
      expect(score).toBe(0);
    });
  });

  describe('getMaturityLevel', () => {
    it('should return correct maturity levels', () => {
      expect(pdfService.getMaturityLevel(5)).toBe('Optimized');
      expect(pdfService.getMaturityLevel(4)).toBe('Managed');
      expect(pdfService.getMaturityLevel(3)).toBe('Defined');
      expect(pdfService.getMaturityLevel(2)).toBe('Initial');
      expect(pdfService.getMaturityLevel(1)).toBe('Not Implemented');
    });

    it('should handle edge cases', () => {
      expect(pdfService.getMaturityLevel(4.5)).toBe('Optimized');
      expect(pdfService.getMaturityLevel(3.5)).toBe('Managed');
      expect(pdfService.getMaturityLevel(2.5)).toBe('Defined');
      expect(pdfService.getMaturityLevel(1.5)).toBe('Initial');
      expect(pdfService.getMaturityLevel(0.5)).toBe('Not Implemented');
    });
  });

  describe('generatePDF', () => {
    it('should generate PDF with assessment data', async () => {
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, {}, {});
      expect(pdf).toBeDefined();
      expect(pdf.internal).toBeDefined();
    });

    it('should handle empty answers', async () => {
      const pdf = await pdfService.generatePDF(mockDomains, {}, {}, {});
      expect(pdf).toBeDefined();
    });

    it('should handle domains without categories', async () => {
      const domains = {
        domain1: { title: 'Domain 1', weight: 0.5, categories: null }
      };
      const pdf = await pdfService.generatePDF(domains, {}, {}, {});
      expect(pdf).toBeDefined();
    });
  });

  describe('downloadPDF', () => {
    it('should call pdf.save with filename', async () => {
      const mockPdf = { save: vi.fn() };
      await pdfService.downloadPDF(mockPdf, 'test.pdf');
      expect(mockPdf.save).toHaveBeenCalledWith('test.pdf');
    });

    it('should use default filename', async () => {
      const mockPdf = { save: vi.fn() };
      await pdfService.downloadPDF(mockPdf);
      expect(mockPdf.save).toHaveBeenCalledWith('assessment-report.pdf');
    });
  });
});