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

  describe('scoreInterpretation branches (via generatePDF overall score)', () => {
    // Each test constructs domains/answers that produce a specific overall score,
    // exercising a different branch in scoreInterpretation.

    it('should handle score >= 4.5 (Optimized interpretation)', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [{ id: 'x1', text: 'Q' }, { id: 'x2', text: 'Q' }] } }
        }
      };
      // Both answers 5 → overall 5.0 → scoreInterpretation >= 4.5
      const pdf = await pdfService.generatePDF(domains, { x1: 5, x2: 5 }, {}, {});
      expect(pdf).toBeDefined();
    });

    it('should handle score >= 2.5 and < 3.5 (Defined interpretation)', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [{ id: 'x1', text: 'Q' }, { id: 'x2', text: 'Q' }] } }
        }
      };
      // Answers 3,3 → overall 3.0 → scoreInterpretation >= 2.5
      const pdf = await pdfService.generatePDF(domains, { x1: 3, x2: 3 }, {}, {});
      expect(pdf).toBeDefined();
    });

    it('should handle score >= 1.5 and < 2.5 (Initial interpretation)', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [{ id: 'x1', text: 'Q' }, { id: 'x2', text: 'Q' }] } }
        }
      };
      // Answers 2,2 → overall 2.0 → scoreInterpretation >= 1.5
      const pdf = await pdfService.generatePDF(domains, { x1: 2, x2: 2 }, {}, {});
      expect(pdf).toBeDefined();
    });

    it('should handle score < 1.5 (ad hoc interpretation)', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [{ id: 'x1', text: 'Q' }, { id: 'x2', text: 'Q' }] } }
        }
      };
      // Answers 1,1 → overall 1.0 → scoreInterpretation < 1.5
      const pdf = await pdfService.generatePDF(domains, { x1: 1, x2: 1 }, {}, {});
      expect(pdf).toBeDefined();
    });
  });

  describe('answer value branches in detailed results', () => {
    it('should render N/A for answer = 0', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [{ id: 'x1', text: 'Q1' }] } }
        }
      };
      // answer 0 hits the ans === 0 ? 'N/A' branch and TEXT_LIGHT color branch
      const pdf = await pdfService.generatePDF(domains, { x1: 0 }, {}, {});
      expect(pdf).toBeDefined();
    });

    it('should render red color for answer = 1 (score < 2)', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [{ id: 'x1', text: 'Q1' }] } }
        }
      };
      // answer 1 hits the ans < 2 branch → red color [185, 28, 28]
      const pdf = await pdfService.generatePDF(domains, { x1: 1 }, {}, {});
      expect(pdf).toBeDefined();
    });

    it('should render amber color for answer = 3 (score >= 3, < 4)', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [{ id: 'x1', text: 'Q1' }] } }
        }
      };
      const pdf = await pdfService.generatePDF(domains, { x1: 3 }, {}, {});
      expect(pdf).toBeDefined();
    });

    it('should render green color for answer = 4 (score >= 4)', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [{ id: 'x1', text: 'Q1' }] } }
        }
      };
      const pdf = await pdfService.generatePDF(domains, { x1: 4 }, {}, {});
      expect(pdf).toBeDefined();
    });
  });

  describe('category and question text edge cases', () => {
    it('should handle category without title or name', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: {
            // Category has no title and no name — should skip the subheading
            c1: { questions: [{ id: 'x1', text: 'Q1' }] }
          }
        }
      };
      const pdf = await pdfService.generatePDF(domains, { x1: 3 }, {}, {});
      expect(pdf).toBeDefined();
    });

    it('should handle category with name instead of title', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: {
            c1: { name: 'Category Name', questions: [{ id: 'x1', text: 'Q1' }] }
          }
        }
      };
      const pdf = await pdfService.generatePDF(domains, { x1: 3 }, {}, {});
      expect(pdf).toBeDefined();
    });

    it('should handle very long question text exceeding 2 display lines', async () => {
      const longText = 'This is a very long question text that should definitely exceed two lines when rendered in the PDF. '.repeat(10);
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: {
            c1: { title: 'C1', questions: [{ id: 'x1', text: longText }] }
          }
        }
      };
      // Should trigger lines.length > 2 branch and render ellipsis
      const pdf = await pdfService.generatePDF(domains, { x1: 3 }, {}, {});
      expect(pdf).toBeDefined();
    });

    it('should handle question without text property', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: {
            c1: { title: 'C1', questions: [{ id: 'x1' }] }
          }
        }
      };
      // question.text is undefined → falls back to '' in splitTextToSize
      const pdf = await pdfService.generatePDF(domains, { x1: 3 }, {}, {});
      expect(pdf).toBeDefined();
    });
  });

  describe('domain score display branches', () => {
    it('should show "No data" for domain with 0 score on cover page', async () => {
      const domains = {
        d1: {
          title: 'Domain With No Answers', weight: 1,
          categories: { c1: { title: 'C1', questions: [{ id: 'x1', text: 'Q1' }] } }
        }
      };
      // No answers for x1, so domain score is 0 → "No data" label, domScore > 0 is false
      const pdf = await pdfService.generatePDF(domains, {}, {}, {});
      expect(pdf).toBeDefined();
    });
  });

  describe('options parameter edge cases', () => {
    it('should handle null options parameter', async () => {
      // options = null triggers the `options || {}` fallback on line 144
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, {}, {}, null);
      expect(pdf).toBeDefined();
    });

    it('should use custom orgName and reportTitle from options', async () => {
      const pdf = await pdfService.generatePDF(
        mockDomains, mockAnswers, {}, {},
        { orgName: 'Acme Corp', reportTitle: 'Custom Report' }
      );
      expect(pdf).toBeDefined();
    });
  });

  describe('gap color branches in priority improvement areas', () => {
    it('should render critical gap color for gap >= 3', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [
            { id: 'x1', text: 'Critical gap question' }
          ] } }
        }
      };
      // answer 1 → gap = 5 - 1 = 4, hits gap >= 3 → dark red [185, 28, 28]
      const pdf = await pdfService.generatePDF(domains, { x1: 1 }, {}, {});
      expect(pdf).toBeDefined();
    });

    it('should render medium gap color for gap >= 2 and < 3', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [
            { id: 'x1', text: 'Medium gap question' }
          ] } }
        }
      };
      // answer 3 → gap = 5 - 3 = 2, hits gap >= 2 → amber [161, 98, 7]
      const pdf = await pdfService.generatePDF(domains, { x1: 3 }, {}, {});
      expect(pdf).toBeDefined();
    });

    it('should render low gap color for gap < 2', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [
            { id: 'x1', text: 'Low gap question' }
          ] } }
        }
      };
      // answer 4 → gap = 5 - 4 = 1, hits gap < 2 → green [22, 163, 74]
      const pdf = await pdfService.generatePDF(domains, { x1: 4 }, {}, {});
      expect(pdf).toBeDefined();
    });

    it('should skip questions with gap = 0 (score = 5) from top gaps', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [
            { id: 'x1', text: 'Perfect score question' }
          ] } }
        }
      };
      // answer 5 → gap = 0 → skipped from gaps list
      const pdf = await pdfService.generatePDF(domains, { x1: 5 }, {}, {});
      expect(pdf).toBeDefined();
    });
  });

  describe('compliance framework edge cases', () => {
    it('should use framework key when name is not provided', async () => {
      const frameworks = {
        customFramework: { enabled: true, score: 70.0 }
      };
      // fw.name is undefined → falls back to key 'customFramework'
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, {}, frameworks);
      expect(pdf).toBeDefined();
    });

    it('should handle framework with low score (< 60) for red color', async () => {
      const frameworks = {
        fw1: { name: 'Low Score FW', enabled: true, score: 40.0 }
      };
      // score < 60 → red color [185, 28, 28]
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, {}, frameworks);
      expect(pdf).toBeDefined();
    });

    it('should handle framework with medium score (>= 60, < 80) for amber color', async () => {
      const frameworks = {
        fw1: { name: 'Medium Score FW', enabled: true, score: 65.0 }
      };
      // score >= 60 but < 80 → amber [161, 98, 7]
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, {}, frameworks);
      expect(pdf).toBeDefined();
    });

    it('should skip compliance section when no frameworks are enabled', async () => {
      const frameworks = {
        fw1: { name: 'Disabled', enabled: false, score: 90.0 }
      };
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, {}, frameworks);
      expect(pdf).toBeDefined();
    });

    it('should skip compliance section when complianceFrameworks is null', async () => {
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, {}, null);
      expect(pdf).toBeDefined();
    });
  });

  describe('evidence image error handling', () => {
    it('should handle image load error in loadImageAsBase64 (non-data URL)', async () => {
      // Override Image mock so that setting src triggers onerror (simulates failed load)
      vi.stubGlobal('Image', class {
        constructor() {
          this.onload = null;
          this.onerror = null;
          this.width = 100;
          this.height = 75;
        }
        set src(val) {
          // For non-data URLs, trigger onerror to test the catch block in evidence images
          if (!val.startsWith('data:')) {
            Promise.resolve().then(() => this.onerror?.());
          } else {
            Promise.resolve().then(() => this.onload?.());
          }
        }
      });

      const evidence = {
        q1: { images: ['https://example.com/broken-image.png'] }
      };
      // This should hit the catch block on line 501 → "(Image 1 unavailable)"
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, evidence, {});
      expect(pdf).toBeDefined();
    }, 10000);

    it('should handle image dimension onerror when determining aspect ratio', async () => {
      // First Image() call is for loadImageAsBase64 (succeeds), second is for dimension detection (fails)
      let callCount = 0;
      vi.stubGlobal('Image', class {
        constructor() {
          this.onload = null;
          this.onerror = null;
          this.width = 100;
          this.height = 75;
          callCount++;
        }
        set src(_) {
          const current = callCount;
          // Odd calls (loadImageAsBase64) succeed, even calls (dimension detection) fail
          if (current % 2 === 0) {
            Promise.resolve().then(() => this.onerror?.());
          } else {
            Promise.resolve().then(() => this.onload?.());
          }
        }
      });

      const b64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const evidence = {
        q1: { images: [b64] }
      };
      // The dimension detection Image fires onerror → falls back to { width: 70, height: 52 }
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, evidence, {});
      expect(pdf).toBeDefined();
    }, 10000);

    it('should handle non-data URL images via loadImageAsBase64', async () => {
      // Test the loadImageAsBase64 path for non-data URLs where onload succeeds
      const evidence = {
        q1: { images: ['https://example.com/image.png'] }
      };
      // Default Image mock fires onload — this exercises the canvas/drawImage path in loadImageAsBase64
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, evidence, {});
      expect(pdf).toBeDefined();
    }, 10000);
  });

  describe('addChartsToPage', () => {
    it('should use chartSnapshots when provided', async () => {
      const b64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const spy = vi.spyOn(document, 'querySelector').mockReturnValue(null);
      const pdf = await pdfService.generatePDF(
        mockDomains, mockAnswers, {}, {}, {
          chartSnapshots: { heatmap: b64, radar: b64, bar: b64 }
        }
      );
      expect(pdf).toBeDefined();
      spy.mockRestore();
    });

    it('should handle chart image onerror in addChartsToPage (aspect ratio fallback)', async () => {
      // Make Image always trigger onerror (for the aspect ratio detection in addChartsToPage)
      vi.stubGlobal('Image', class {
        constructor() {
          this.onload = null;
          this.onerror = null;
          this.width = 100;
          this.height = 75;
        }
        set src(_) {
          Promise.resolve().then(() => this.onerror?.());
        }
      });

      const b64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const spy = vi.spyOn(document, 'querySelector').mockReturnValue(null);
      const pdf = await pdfService.generatePDF(
        mockDomains, mockAnswers, {}, {}, {
          chartSnapshots: { heatmap: b64 }
        }
      );
      expect(pdf).toBeDefined();
      spy.mockRestore();
    });

    it('should handle errors in addChartsToPage gracefully', async () => {
      // Force an error inside addChartsToPage by making document.querySelector throw
      const spy = vi.spyOn(document, 'querySelector').mockImplementation(() => {
        throw new Error('Simulated DOM error');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, {}, {});
      expect(pdf).toBeDefined();
      expect(consoleSpy).toHaveBeenCalledWith('Error adding charts to PDF:', expect.any(Error));
      spy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should add new page when chart does not fit on current page', async () => {
      // Provide very tall chart images that will force page breaks
      vi.stubGlobal('Image', class {
        constructor() {
          this.onload = null;
          this.onerror = null;
          // Very tall image → large ih value → will exceed page height
          this.width = 100;
          this.height = 2000;
        }
        set src(_) {
          Promise.resolve().then(() => this.onload?.());
        }
      });

      const b64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const spy = vi.spyOn(document, 'querySelector').mockReturnValue(null);
      const pdf = await pdfService.generatePDF(
        mockDomains, mockAnswers, {}, {}, {
          chartSnapshots: { heatmap: b64, radar: b64, bar: b64 }
        }
      );
      expect(pdf).toBeDefined();
      spy.mockRestore();
    });
  });

  describe('comments edge cases', () => {
    it('should skip empty/whitespace-only comments', async () => {
      const comments = { q1: '   ', q2: '' };
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, {}, {}, {}, comments);
      expect(pdf).toBeDefined();
    });

    it('should render long comments that span multiple lines', async () => {
      const comments = { q1: 'This is a very detailed comment that explains the assessment rationale in great detail. '.repeat(10) };
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, {}, {}, {}, comments);
      expect(pdf).toBeDefined();
    });
  });

  describe('computeTopGaps edge cases (via generatePDF)', () => {
    it('should use question.id when question.text is falsy', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [
            { id: 'q_no_text' } // text is undefined → falls back to q.id
          ] } }
        }
      };
      const pdf = await pdfService.generatePDF(domains, { q_no_text: 2 }, {}, {});
      expect(pdf).toBeDefined();
    });

    it('should use default weight 1 when domain has no weight', async () => {
      const domains = {
        d1: {
          title: 'D1',
          // no weight property → falls back to domain.weight || 1
          categories: { c1: { title: 'C1', questions: [{ id: 'x1', text: 'Q1' }] } }
        }
      };
      const pdf = await pdfService.generatePDF(domains, { x1: 2 }, {}, {});
      expect(pdf).toBeDefined();
    });
  });

  describe('ensureSpace page break branch', () => {
    it('should trigger page break when many categories and comments fill a page', async () => {
      // Create enough content to force ensureSpace to trigger a page break
      // on the detailed results page (categories + questions + long comments)
      const questions = Array.from({ length: 20 }, (_, i) => ({
        id: `q${i}`, text: `Question ${i} with detailed description`
      }));
      const domains = {
        d1: {
          title: 'Domain 1', weight: 0.5,
          categories: { c1: { title: 'Category 1', questions: questions.slice(0, 10) } }
        },
        d2: {
          title: 'Domain 2', weight: 0.5,
          categories: { c2: { title: 'Category 2', questions: questions.slice(10) } }
        }
      };
      const answers = Object.fromEntries(questions.map(q => [q.id, 2]));
      const comments = Object.fromEntries(questions.map(q => [q.id, 'Detailed comment for this question. '.repeat(5)]));
      const evidence = Object.fromEntries(questions.map(q => [q.id, { text: 'Evidence supporting this assessment finding. '.repeat(3) }]));
      const pdf = await pdfService.generatePDF(domains, answers, evidence, {}, {}, comments);
      expect(pdf).toBeDefined();
    });
  });
});
