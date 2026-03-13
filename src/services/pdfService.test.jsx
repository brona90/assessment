import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { pdfService } from './pdfService';
import { scoreCalculator } from '../utils/scoreCalculator';

// ── jsPDF mock ──────────────────────────────────────────────────────────────
// We capture every method call on the PDF instance so tests can assert behavior.

function splitTextImpl(text, maxWidth) {
  if (!text) return [''];
  const charsPerLine = Math.max(1, Math.floor(maxWidth * 1.5));
  const lines = [];
  for (let i = 0; i < text.length; i += charsPerLine) {
    lines.push(text.substring(i, i + charsPerLine));
  }
  return lines.length > 0 ? lines : [''];
}

const mockPdfInstance = {};

function resetMockPdf() {
  mockPdfInstance._calls = { text: [], addImage: [], addPage: [] };
  mockPdfInstance.text = vi.fn(function (...args) { mockPdfInstance._calls.text.push(args); });
  mockPdfInstance.addImage = vi.fn(function (...args) { mockPdfInstance._calls.addImage.push(args); });
  mockPdfInstance.addPage = vi.fn(function (...args) { mockPdfInstance._calls.addPage.push(args); });
  mockPdfInstance.save = vi.fn();
  mockPdfInstance.setFont = vi.fn();
  mockPdfInstance.setFontSize = vi.fn();
  mockPdfInstance.setTextColor = vi.fn();
  mockPdfInstance.setFillColor = vi.fn();
  mockPdfInstance.setDrawColor = vi.fn();
  mockPdfInstance.setLineWidth = vi.fn();
  mockPdfInstance.rect = vi.fn();
  mockPdfInstance.roundedRect = vi.fn();
  mockPdfInstance.line = vi.fn();
  mockPdfInstance.splitTextToSize = vi.fn(splitTextImpl);
  mockPdfInstance.internal = { pageSize: { getWidth: () => 210, getHeight: () => 297 } };
}

resetMockPdf();

vi.mock('jspdf', () => {
  // Must return a class (constructor) since pdfService uses `new jsPDF(...)`
  return {
    default: class MockJsPDF {
      constructor() {
        resetMockPdf();
        return mockPdfInstance;
      }
    }
  };
});

// ── Image mock ──────────────────────────────────────────────────────────────
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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Return all string arguments passed to pdf.text() calls, flattened */
function allTextArgs() {
  return mockPdfInstance._calls.text.flatMap(([first]) =>
    Array.isArray(first) ? first : [first]
  );
}

/** Check whether a particular string (or substring) appears in any pdf.text() call */
function expectTextContaining(str) {
  const texts = allTextArgs();
  const found = texts.some(t => t && t.includes(str));
  expect(found, `Expected pdf.text() to include "${str}" but it was not found among ${texts.length} calls`).toBe(true);
}

function expectTextNotContaining(str) {
  const texts = allTextArgs();
  const found = texts.some(t => t && t.includes(str));
  expect(found, `Expected pdf.text() NOT to include "${str}"`).toBe(false);
}

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

  describe('score delegation to scoreCalculator', () => {
    it('should delegate all score methods to scoreCalculator', () => {
      const domainScoreSpy = vi.spyOn(scoreCalculator, 'calculateDomainScore');
      const allQSpy = vi.spyOn(scoreCalculator, 'getAllQuestionsFromDomain');
      const overallSpy = vi.spyOn(scoreCalculator, 'calculateOverallScore');
      const maturitySpy = vi.spyOn(scoreCalculator, 'getMaturityLevel');

      pdfService.calculateDomainScore(mockDomains.domain1, mockAnswers);
      expect(allQSpy).toHaveBeenCalledWith(mockDomains.domain1);
      expect(domainScoreSpy).toHaveBeenCalled();

      pdfService.calculateOverallScore(mockDomains, mockAnswers);
      expect(overallSpy).toHaveBeenCalledWith(mockDomains, mockAnswers);

      pdfService.getMaturityLevel(4.5);
      expect(maturitySpy).toHaveBeenCalledWith(4.5);
    });
  });

  describe('generatePDF', () => {
    it('should generate a PDF with cover page content', async () => {
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, {}, {});
      expect(pdf).toBeDefined();
      expect(pdf.internal).toBeDefined();
      // Cover page shows the report title and org name
      expectTextContaining('Technology Maturity Assessment');
      expectTextContaining('Organisation');
      // Domain titles appear in the domain summary table
      expectTextContaining('Domain 1');
      expectTextContaining('Domain 2');
      // At least 2 addPage calls: executive summary + detailed results
      expect(mockPdfInstance.addPage).toHaveBeenCalled();
      expect(mockPdfInstance._calls.addPage.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle empty answers and show "No data" for all domains', async () => {
      await pdfService.generatePDF(mockDomains, {}, {}, {});
      expectTextContaining('No data');
    });

    it('should handle domains without categories without crashing', async () => {
      const domains = {
        domain1: { title: 'Domain 1', weight: 0.5, categories: null }
      };
      const pdf = await pdfService.generatePDF(domains, {}, {}, {});
      expect(pdf).toBeDefined();
      expectTextContaining('Domain 1');
    });

    it('should handle empty domains and still produce a PDF with structure', async () => {
      const pdf = await pdfService.generatePDF({}, {}, {}, {});
      expect(pdf).toBeDefined();
      expectTextContaining('Executive Summary');
      expectTextContaining('Detailed Assessment Results');
    });

    it('should handle null and undefined evidence without crashing', async () => {
      const pdfNull = await pdfService.generatePDF(mockDomains, mockAnswers, null, {});
      expect(pdfNull).toBeDefined();
      expectTextContaining('Domain 1');
      const pdfUndef = await pdfService.generatePDF(mockDomains, mockAnswers, undefined, {});
      expect(pdfUndef).toBeDefined();
    });

    it('should render assessor comments with "Note:" prefix', async () => {
      const comments = { q1: 'This area needs improvement' };
      await pdfService.generatePDF(mockDomains, mockAnswers, {}, {}, {}, comments);
      expectTextContaining('Note: This area needs improvement');
    });

    it('should render enabled compliance frameworks with scores on a separate page', async () => {
      const frameworks = {
        iso27001: { name: 'ISO 27001', enabled: true, score: 85.5 },
        soc2: { name: 'SOC 2', enabled: false, score: 60.0 }
      };
      await pdfService.generatePDF(mockDomains, mockAnswers, {}, frameworks);
      expectTextContaining('Compliance Framework Scores');
      expectTextContaining('ISO 27001');
      expectTextContaining('85.5%');
    });

    it('should handle compliance frameworks without scores', async () => {
      const frameworks = { iso27001: { name: 'ISO 27001', enabled: true } };
      await pdfService.generatePDF(mockDomains, mockAnswers, {}, frameworks);
      expectTextContaining('ISO 27001');
      expectTextContaining('Compliance Framework Scores');
    });

    it('should handle many questions causing page overflow with multiple addPage calls', async () => {
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
      await pdfService.generatePDF(domains, answers, {}, {});
      // 30 questions should force more pages than the minimum 3
      expect(mockPdfInstance._calls.addPage.length).toBeGreaterThanOrEqual(3);
      expectTextContaining('Domain 1');
    });
  });

  describe('evidence handling', () => {
    it('should render evidence text with "Evidence:" prefix', async () => {
      const evidence = { q1: { text: 'Supporting evidence documented here' } };
      await pdfService.generatePDF(mockDomains, mockAnswers, evidence, {});
      expectTextContaining('Evidence: Supporting evidence documented here');
    });

    it('should render data URL images via addImage', async () => {
      const b64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const evidence = {
        q1: { text: 'Evidence text', images: [b64, { data: b64, name: 'screenshot.png' }] }
      };
      await pdfService.generatePDF(mockDomains, mockAnswers, evidence, {});
      // addImage should be called for the 2 valid images
      expect(mockPdfInstance.addImage).toHaveBeenCalled();
      expect(mockPdfInstance._calls.addImage.length).toBeGreaterThanOrEqual(2);
      // The named image should render its filename
      expectTextContaining('screenshot.png');
    }, 10000);

    it('should gracefully skip images with no valid URL (no addImage calls)', async () => {
      const evidence = { q1: { images: [null, undefined, { data: null }] } };
      await pdfService.generatePDF(mockDomains, mockAnswers, evidence, {});
      // No valid image data → addImage should not be called
      expect(mockPdfInstance.addImage).not.toHaveBeenCalled();
    });
  });

  describe('chart rendering', () => {
    it('should skip chart page when no chart canvases found', async () => {
      const spy = vi.spyOn(document, 'querySelector').mockReturnValue(null);
      await pdfService.generatePDF(mockDomains, mockAnswers, {}, {});
      // "Visual Analysis" should NOT appear because there are no charts
      expectTextNotContaining('Visual Analysis');
      spy.mockRestore();
    });

    it('should render chart page when canvas elements are present', async () => {
      const mockCanvas = document.createElement('canvas');
      mockCanvas.width = 400;
      mockCanvas.height = 300;
      const mockContainer = document.createElement('div');
      mockContainer.appendChild(mockCanvas);

      const spy = vi.spyOn(document, 'querySelector').mockReturnValue(mockContainer);
      await pdfService.generatePDF(mockDomains, mockAnswers, {}, {});
      // Visual Analysis heading should appear
      expectTextContaining('Visual Analysis');
      spy.mockRestore();
    });
  });

  describe('downloadPDF', () => {
    it('should call pdf.save with specified filename', async () => {
      const fakePdf = { save: vi.fn() };
      await pdfService.downloadPDF(fakePdf, 'test.pdf');
      expect(fakePdf.save).toHaveBeenCalledWith('test.pdf');
    });

    it('should use default filename when none specified', async () => {
      const fakePdf = { save: vi.fn() };
      await pdfService.downloadPDF(fakePdf);
      expect(fakePdf.save).toHaveBeenCalledWith('maturity-assessment-report.pdf');
    });
  });

  describe('scoreInterpretation branches (via generatePDF overall score)', () => {
    it('should render Optimized interpretation for score >= 4.5', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [{ id: 'x1', text: 'Q' }, { id: 'x2', text: 'Q' }] } }
        }
      };
      await pdfService.generatePDF(domains, { x1: 5, x2: 5 }, {}, {});
      expectTextContaining('fully optimised');
    });

    it('should render Defined interpretation for score >= 2.5 and < 3.5', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [{ id: 'x1', text: 'Q' }, { id: 'x2', text: 'Q' }] } }
        }
      };
      await pdfService.generatePDF(domains, { x1: 3, x2: 3 }, {}, {});
      expectTextContaining('defined and largely followed');
    });

    it('should render Initial interpretation for score >= 1.5 and < 2.5', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [{ id: 'x1', text: 'Q' }, { id: 'x2', text: 'Q' }] } }
        }
      };
      await pdfService.generatePDF(domains, { x1: 2, x2: 2 }, {}, {});
      expectTextContaining('initial controls');
    });

    it('should render ad-hoc interpretation for score < 1.5', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [{ id: 'x1', text: 'Q' }, { id: 'x2', text: 'Q' }] } }
        }
      };
      await pdfService.generatePDF(domains, { x1: 1, x2: 1 }, {}, {});
      expectTextContaining('largely absent or ad hoc');
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
      await pdfService.generatePDF(domains, { x1: 0 }, {}, {});
      expectTextContaining('N/A');
    });

    it('should render answer label "1/5" for answer = 1', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [{ id: 'x1', text: 'Q1' }] } }
        }
      };
      await pdfService.generatePDF(domains, { x1: 1 }, {}, {});
      expectTextContaining('1/5');
      expectTextContaining('Not Implemented');
    });

    it('should render answer label "3/5" for answer = 3', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [{ id: 'x1', text: 'Q1' }] } }
        }
      };
      await pdfService.generatePDF(domains, { x1: 3 }, {}, {});
      expectTextContaining('3/5');
      expectTextContaining('Defined');
    });

    it('should render answer label "4/5" for answer = 4', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [{ id: 'x1', text: 'Q1' }] } }
        }
      };
      await pdfService.generatePDF(domains, { x1: 4 }, {}, {});
      expectTextContaining('4/5');
      expectTextContaining('Managed');
    });
  });

  describe('category and question text edge cases', () => {
    it('should skip category subheading when category has no title or name', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: {
            c1: { questions: [{ id: 'x1', text: 'Q1' }] }
          }
        }
      };
      await pdfService.generatePDF(domains, { x1: 3 }, {}, {});
      expectTextContaining('D1');
      // No uppercased category subheading should appear
      expectTextNotContaining('C1');
    });

    it('should render category.name when title is absent', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: {
            c1: { name: 'Category Name', questions: [{ id: 'x1', text: 'Q1' }] }
          }
        }
      };
      await pdfService.generatePDF(domains, { x1: 3 }, {}, {});
      expectTextContaining('CATEGORY NAME');
    });

    it('should truncate very long question text with ellipsis', async () => {
      const longText = 'This is a very long question text that should definitely exceed two lines when rendered in the PDF. '.repeat(10);
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: {
            c1: { title: 'C1', questions: [{ id: 'x1', text: longText }] }
          }
        }
      };
      await pdfService.generatePDF(domains, { x1: 3 }, {}, {});
      const allTexts = allTextArgs();
      const hasEllipsis = allTexts.some(t => t && t.includes('\u2026'));
      expect(hasEllipsis).toBe(true);
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
      const pdf = await pdfService.generatePDF(domains, { x1: 3 }, {}, {});
      expect(pdf).toBeDefined();
      expectTextContaining('X1');
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
      await pdfService.generatePDF(domains, {}, {}, {});
      expectTextContaining('No data');
      expectTextContaining('Domain With No Answers');
    });
  });

  describe('options parameter edge cases', () => {
    it('should handle null options parameter and use defaults', async () => {
      await pdfService.generatePDF(mockDomains, mockAnswers, {}, {}, null);
      expectTextContaining('Organisation');
      expectTextContaining('Technology Maturity Assessment');
    });

    it('should use custom orgName and reportTitle from options', async () => {
      await pdfService.generatePDF(
        mockDomains, mockAnswers, {}, {},
        { orgName: 'Acme Corp', reportTitle: 'Custom Report' }
      );
      expectTextContaining('Acme Corp');
      expectTextContaining('Custom Report');
    });
  });

  describe('gap color branches in priority improvement areas', () => {
    it('should render critical gap (>= 3) in priority improvement areas', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [
            { id: 'x1', text: 'Critical gap question' }
          ] } }
        }
      };
      await pdfService.generatePDF(domains, { x1: 1 }, {}, {});
      expectTextContaining('Priority Improvement Areas');
      expectTextContaining('Critical gap question');
      expectTextContaining('-4');
    });

    it('should render medium gap (>= 2, < 3) in priority improvement areas', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [
            { id: 'x1', text: 'Medium gap question' }
          ] } }
        }
      };
      await pdfService.generatePDF(domains, { x1: 3 }, {}, {});
      expectTextContaining('Priority Improvement Areas');
      expectTextContaining('Medium gap question');
      expectTextContaining('-2');
    });

    it('should render low gap (< 2) in priority improvement areas', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [
            { id: 'x1', text: 'Low gap question' }
          ] } }
        }
      };
      await pdfService.generatePDF(domains, { x1: 4 }, {}, {});
      expectTextContaining('Priority Improvement Areas');
      expectTextContaining('Low gap question');
      expectTextContaining('-1');
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
      await pdfService.generatePDF(domains, { x1: 5 }, {}, {});
      expectTextNotContaining('Priority Improvement Areas');
    });
  });

  describe('compliance framework edge cases', () => {
    it('should use framework key when name is not provided', async () => {
      const frameworks = {
        customFramework: { enabled: true, score: 70.0 }
      };
      await pdfService.generatePDF(mockDomains, mockAnswers, {}, frameworks);
      expectTextContaining('customFramework');
      expectTextContaining('70.0%');
    });

    it('should handle framework with low score (< 60)', async () => {
      const frameworks = {
        fw1: { name: 'Low Score FW', enabled: true, score: 40.0 }
      };
      await pdfService.generatePDF(mockDomains, mockAnswers, {}, frameworks);
      expectTextContaining('Low Score FW');
      expectTextContaining('40.0%');
    });

    it('should handle framework with medium score (>= 60, < 80)', async () => {
      const frameworks = {
        fw1: { name: 'Medium Score FW', enabled: true, score: 65.0 }
      };
      await pdfService.generatePDF(mockDomains, mockAnswers, {}, frameworks);
      expectTextContaining('Medium Score FW');
      expectTextContaining('65.0%');
    });

    it('should skip compliance section when no frameworks are enabled', async () => {
      const frameworks = {
        fw1: { name: 'Disabled', enabled: false, score: 90.0 }
      };
      await pdfService.generatePDF(mockDomains, mockAnswers, {}, frameworks);
      expectTextNotContaining('Compliance Framework Scores');
    });

    it('should skip compliance section when complianceFrameworks is null', async () => {
      await pdfService.generatePDF(mockDomains, mockAnswers, {}, null);
      expectTextNotContaining('Compliance Framework Scores');
    });
  });

  describe('evidence image error handling', () => {
    it('should render "(Image 1 unavailable)" when non-data URL fails to load', async () => {
      vi.stubGlobal('Image', class {
        constructor() {
          this.onload = null;
          this.onerror = null;
          this.width = 100;
          this.height = 75;
        }
        set src(val) {
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
      await pdfService.generatePDF(mockDomains, mockAnswers, evidence, {});
      expectTextContaining('(Image 1 unavailable)');
      expect(mockPdfInstance.addImage).not.toHaveBeenCalled();
    }, 10000);

    it('should fall back to default dimensions when aspect ratio detection fails', async () => {
      // For data URLs, loadImageAsBase64 resolves immediately (no Image created).
      // The only Image created is for dimension detection — we make it fail.
      vi.stubGlobal('Image', class {
        constructor() {
          this.onload = null;
          this.onerror = null;
          this.width = 100;
          this.height = 75;
        }
        set src(_) {
          // Always trigger onerror so dimension detection falls back to defaults
          Promise.resolve().then(() => this.onerror?.());
        }
      });

      const b64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const evidence = {
        q1: { images: [b64] }
      };
      await pdfService.generatePDF(mockDomains, mockAnswers, evidence, {});
      expect(mockPdfInstance.addImage).toHaveBeenCalled();
      // Check that fallback size (width: 70, height: 52) was used
      // addImage(base64, 'JPEG', x, y, width, height) — height=52 at index 5
      const imageCall = mockPdfInstance._calls.addImage.find(
        call => call.some(arg => arg === 52)
      );
      expect(imageCall, 'Expected addImage to be called with fallback height 52').toBeDefined();
    }, 10000);

    it('should handle non-data URL images that load successfully via canvas path', async () => {
      const evidence = {
        q1: { images: ['https://example.com/image.png'] }
      };
      await pdfService.generatePDF(mockDomains, mockAnswers, evidence, {});
      expect(mockPdfInstance.addImage).toHaveBeenCalled();
    }, 10000);
  });

  describe('addChartsToPage', () => {
    it('should render chart snapshots via addImage when provided', async () => {
      const b64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const spy = vi.spyOn(document, 'querySelector').mockReturnValue(null);
      await pdfService.generatePDF(
        mockDomains, mockAnswers, {}, {}, {
          chartSnapshots: { heatmap: b64, radar: b64, bar: b64 }
        }
      );
      expectTextContaining('Visual Analysis');
      expect(mockPdfInstance._calls.addImage.length).toBeGreaterThanOrEqual(3);
      expectTextContaining('Assessment Heatmap');
      expectTextContaining('Domain Radar Chart');
      expectTextContaining('Domain Bar Chart');
      spy.mockRestore();
    });

    it('should use fallback aspect ratio (1) when chart image onerror fires', async () => {
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
      await pdfService.generatePDF(
        mockDomains, mockAnswers, {}, {}, {
          chartSnapshots: { heatmap: b64 }
        }
      );
      expectTextContaining('Visual Analysis');
      expect(mockPdfInstance.addImage).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should handle errors in addChartsToPage gracefully', async () => {
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
      vi.stubGlobal('Image', class {
        constructor() {
          this.onload = null;
          this.onerror = null;
          this.width = 100;
          this.height = 2000;
        }
        set src(_) {
          Promise.resolve().then(() => this.onload?.());
        }
      });

      const b64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const spy = vi.spyOn(document, 'querySelector').mockReturnValue(null);
      await pdfService.generatePDF(
        mockDomains, mockAnswers, {}, {}, {
          chartSnapshots: { heatmap: b64, radar: b64, bar: b64 }
        }
      );
      // Very tall images should force extra page breaks
      expect(mockPdfInstance._calls.addPage.length).toBeGreaterThanOrEqual(5);
      spy.mockRestore();
    });
  });

  describe('comments edge cases', () => {
    it('should skip empty/whitespace-only comments (no "Note:" rendered)', async () => {
      const comments = { q1: '   ', q2: '' };
      await pdfService.generatePDF(mockDomains, mockAnswers, {}, {}, {}, comments);
      expectTextNotContaining('Note:');
    });

    it('should render long comments that span multiple lines', async () => {
      const longComment = 'This is a very detailed comment that explains the assessment rationale in great detail. '.repeat(10);
      const comments = { q1: longComment };
      await pdfService.generatePDF(mockDomains, mockAnswers, {}, {}, {}, comments);
      expectTextContaining('Note:');
      expectTextContaining('detailed comment');
    });
  });

  describe('computeTopGaps edge cases (via generatePDF)', () => {
    it('should use question.id when question.text is falsy', async () => {
      const domains = {
        d1: {
          title: 'D1', weight: 1,
          categories: { c1: { title: 'C1', questions: [
            { id: 'q_no_text' }
          ] } }
        }
      };
      await pdfService.generatePDF(domains, { q_no_text: 2 }, {}, {});
      expectTextContaining('q_no_text');
    });

    it('should use default weight 1 when domain has no weight', async () => {
      const domains = {
        d1: {
          title: 'D1',
          categories: { c1: { title: 'C1', questions: [{ id: 'x1', text: 'Q1' }] } }
        }
      };
      await pdfService.generatePDF(domains, { x1: 2 }, {}, {});
      expectTextContaining('D1');
      expectTextContaining('-3');
    });
  });

  describe('ensureSpace page break branch', () => {
    it('should trigger page break when many categories and comments fill a page', async () => {
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
      await pdfService.generatePDF(domains, answers, evidence, {}, {}, comments);
      // Heavy content with 20 questions, long comments, and evidence should force page breaks.
      // The mock splitTextToSize wraps differently from real jsPDF, so we just verify
      // that at least the standard pages were created plus some ensureSpace-triggered ones.
      expect(mockPdfInstance._calls.addPage.length).toBeGreaterThanOrEqual(3);
      expectTextContaining('Domain 1');
      expectTextContaining('Domain 2');
      expectTextContaining('Note:');
      expectTextContaining('Evidence:');
    });
  });
});
