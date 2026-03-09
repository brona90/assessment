import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { pdfService } from './pdfService';

// Mock Image constructor so onload fires in jsdom (jsdom doesn't load images)
beforeEach(() => {
  vi.stubGlobal('Image', class {
    constructor() {
      this.onload = null;
      this.onerror = null;
      this.width = 100;
      this.height = 75;
    }
    set src(_) {
      Promise.resolve().then(() => this.onload?.());
    }
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

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

    it('should handle boundary scores', () => {
      expect(pdfService.getMaturityLevel(4.5)).toBe('Optimized');
      expect(pdfService.getMaturityLevel(3.5)).toBe('Managed');
      expect(pdfService.getMaturityLevel(2.5)).toBe('Defined');
      expect(pdfService.getMaturityLevel(1.5)).toBe('Initial');
      expect(pdfService.getMaturityLevel(0.5)).toBe('Not Implemented');
    });
  });

  describe('generatePDF', () => {
    it('should generate a valid PDF object', async () => {
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

    it('should handle empty domains', async () => {
      const pdf = await pdfService.generatePDF({}, {}, {}, {});
      expect(pdf).toBeDefined();
    });

    it('should handle null and undefined evidence', async () => {
      const pdfNull = await pdfService.generatePDF(mockDomains, mockAnswers, null, {});
      const pdfUndef = await pdfService.generatePDF(mockDomains, mockAnswers, undefined, {});
      expect(pdfNull).toBeDefined();
      expect(pdfUndef).toBeDefined();
    });

    it('should handle comments/assessor notes', async () => {
      const comments = { q1: 'This area needs improvement' };
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, {}, {}, {}, comments);
      expect(pdf).toBeDefined();
    });

    it('should handle enabled compliance frameworks with scores', async () => {
      const frameworks = {
        iso27001: { name: 'ISO 27001', enabled: true, score: 85.5 },
        soc2: { name: 'SOC 2', enabled: false, score: 60.0 }
      };
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, {}, frameworks);
      expect(pdf).toBeDefined();
    });

    it('should handle compliance frameworks without scores', async () => {
      const frameworks = { iso27001: { name: 'ISO 27001', enabled: true } };
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, {}, frameworks);
      expect(pdf).toBeDefined();
    });

    it('should handle many questions causing page overflow', async () => {
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: {
              questions: Array.from({ length: 30 }, (_, i) => ({
                id: `q${i}`, text: `Question ${i} with some longer text to test wrapping behaviour`
              }))
            }
          }
        }
      };
      const answers = Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`q${i}`, (i % 5) + 1]));
      const pdf = await pdfService.generatePDF(domains, answers, {}, {});
      expect(pdf).toBeDefined();
    });
  });

  describe('evidence handling', () => {
    it('should render evidence text', async () => {
      const evidence = { q1: { text: 'Supporting evidence documented here' } };
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, evidence, {});
      expect(pdf).toBeDefined();
    });

    it('should render data URL images', async () => {
      const b64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const evidence = {
        q1: { text: 'Evidence text', images: [b64, { data: b64, name: 'screenshot.png' }] }
      };
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, evidence, {});
      expect(pdf).toBeDefined();
    }, 10000);

    it('should gracefully skip images with no valid URL', async () => {
      const evidence = { q1: { images: [null, undefined, { data: null }] } };
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, evidence, {});
      expect(pdf).toBeDefined();
    });
  });

  describe('chart rendering', () => {
    it('should skip chart page when no chart canvases found', async () => {
      const spy = vi.spyOn(document, 'querySelector').mockReturnValue(null);
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, {}, {});
      expect(pdf).toBeDefined();
      spy.mockRestore();
    });

    it('should render chart page when canvas elements are present', async () => {
      const mockCanvas = document.createElement('canvas');
      mockCanvas.width = 400;
      mockCanvas.height = 300;
      const mockContainer = document.createElement('div');
      mockContainer.appendChild(mockCanvas);

      const spy = vi.spyOn(document, 'querySelector').mockReturnValue(mockContainer);
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, {}, {});
      expect(pdf).toBeDefined();
      spy.mockRestore();
    });
  });

  describe('downloadPDF', () => {
    it('should call pdf.save with specified filename', async () => {
      const mockPdf = { save: vi.fn() };
      await pdfService.downloadPDF(mockPdf, 'test.pdf');
      expect(mockPdf.save).toHaveBeenCalledWith('test.pdf');
    });

    it('should use default filename when none specified', async () => {
      const mockPdf = { save: vi.fn() };
      await pdfService.downloadPDF(mockPdf);
      expect(mockPdf.save).toHaveBeenCalledWith('maturity-assessment-report.pdf');
    });
  });
});
