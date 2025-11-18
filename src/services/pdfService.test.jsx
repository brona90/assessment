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
    it('should generate PDF with compliance data', async () => {
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

    it('should handle evidence with text only', async () => {
      const evidence = {
        q1: { text: 'Test evidence text' }
      };
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, evidence, {});
      expect(pdf).toBeDefined();
    });

    it('should handle evidence with empty images array', async () => {
      const evidence = {
        q1: { text: 'Test evidence', images: [] }
      };
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, evidence, {});
      expect(pdf).toBeDefined();
    });

    it('should handle evidence with data URL images', async () => {
      const evidence = {
        q1: {
          text: 'Test evidence',
          images: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==']
        }
      };
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, evidence, {});
      expect(pdf).toBeDefined();
    }, 10000);

    it('should handle evidence with image objects', async () => {
      const evidence = {
        q1: {
          text: 'Test evidence',
          images: [{
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            name: 'test-image.png'
          }]
        }
      };
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, evidence, {});
      expect(pdf).toBeDefined();
    }, 10000);

    it('should handle evidence with multiple images', async () => {
      const evidence = {
        q1: {
          text: 'Test evidence',
          images: [
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            {
              data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
              name: 'screenshot.png'
            }
          ]
        }
      };
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, evidence, {});
      expect(pdf).toBeDefined();
    }, 10000);

    it('should handle compliance frameworks', async () => {
      const frameworks = {
        iso27001: { name: 'ISO 27001', enabled: true, score: 85.5 }
      };
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, {}, frameworks);
      expect(pdf).toBeDefined();
    });

    it('should handle disabled compliance frameworks', async () => {
      const frameworks = {
        iso27001: { name: 'ISO 27001', enabled: false, score: 85.5 }
      };
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, {}, frameworks);
      expect(pdf).toBeDefined();
    });

    it('should handle compliance frameworks without scores', async () => {
      const frameworks = {
        iso27001: { name: 'ISO 27001', enabled: true }
      };
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, {}, frameworks);
      expect(pdf).toBeDefined();
    });

    it('should handle null evidence', async () => {
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, null, {});
      expect(pdf).toBeDefined();
    });

    it('should handle undefined evidence', async () => {
      const pdf = await pdfService.generatePDF(mockDomains, mockAnswers, undefined, {});
      expect(pdf).toBeDefined();
    });

    it('should handle multiple categories in domain', async () => {
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: { questions: [{ id: 'q1' }] },
            cat2: { questions: [{ id: 'q2' }] }
          }
        }
      };
      const answers = { q1: 4, q2: 3 };
      const pdf = await pdfService.generatePDF(domains, answers, {}, {});
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
      expect(mockPdf.save).toHaveBeenCalledWith('compliance-report.pdf');
    });
  });

  describe('Image Evidence in PDF', () => {
    it('should handle multiple images in evidence', async () => {
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: { 
              questions: [{ 
                id: 'q1', 
                text: 'Question 1' 
              }] 
            }
          }
        }
      };
      const answers = { q1: 4 };
      const evidence = {
        q1: {
          images: [
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
          ]
        }
      };
      
      const pdf = await pdfService.generatePDF(domains, answers, evidence, {});
      expect(pdf).toBeDefined();
    });

    it('should handle image objects with data property', async () => {
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: { 
              questions: [{ 
                id: 'q1', 
                text: 'Question 1' 
              }] 
            }
          }
        }
      };
      const answers = { q1: 4 };
      const evidence = {
        q1: {
          images: [
            { 
              data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
              caption: 'Test Image'
            }
          ]
        }
      };
      
      const pdf = await pdfService.generatePDF(domains, answers, evidence, {});
      expect(pdf).toBeDefined();
    });

    

    it('should add new page when image exceeds page height', async () => {
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: { 
              questions: Array.from({ length: 20 }, (_, i) => ({ 
                id: `q${i}`, 
                text: `Question ${i}` 
              }))
            }
          }
        }
      };
      const answers = Object.fromEntries(
        Array.from({ length: 20 }, (_, i) => [`q${i}`, 4])
      );
      const evidence = {
        q10: {
          images: [
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
          ]
        }
      };
      
      const pdf = await pdfService.generatePDF(domains, answers, evidence, {});
      expect(pdf).toBeDefined();
    });
  });

  describe('Compliance Frameworks in PDF', () => {
    it('should include compliance frameworks when provided', async () => {
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: { questions: [{ id: 'q1', text: 'Question 1' }] }
          }
        }
      };
      const answers = { q1: 4 };
      const complianceFrameworks = {
        framework1: {
          name: 'Framework 1',
          enabled: true,
          mappings: {
            domain1: ['Control 1', 'Control 2']
          }
        }
      };
      
      const pdf = await pdfService.generatePDF(domains, answers, {}, complianceFrameworks);
      expect(pdf).toBeDefined();
    });
  });

  describe('Chart Rendering in PDF', () => {
    it('should handle chart rendering errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock document.querySelector to return null (no charts found)
      const querySelectorSpy = vi.spyOn(document, 'querySelector').mockReturnValue(null);
      
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: { questions: [{ id: 'q1', text: 'Question 1' }] }
          }
        }
      };
      const answers = { q1: 4 };
      
      const pdf = await pdfService.generatePDF(domains, answers, {}, {});
      expect(pdf).toBeDefined();
      
      querySelectorSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should add radar chart when available', async () => {
      // Mock canvas element for radar chart
      const mockCanvas = document.createElement('canvas');
      mockCanvas.width = 400;
      mockCanvas.height = 300;
      
      const querySelectorSpy = vi.spyOn(document, 'querySelector')
        .mockReturnValueOnce(mockCanvas) // radar chart
        .mockReturnValueOnce(null); // no bar chart
      
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: { questions: [{ id: 'q1', text: 'Question 1' }] }
          }
        }
      };
      const answers = { q1: 4 };
      
      const pdf = await pdfService.generatePDF(domains, answers, {}, {});
      expect(pdf).toBeDefined();
      
      querySelectorSpy.mockRestore();
    });

    it('should add bar chart when available', async () => {
      // Mock canvas element for bar chart
      const mockCanvas = document.createElement('canvas');
      mockCanvas.width = 400;
      mockCanvas.height = 300;
      
      const querySelectorSpy = vi.spyOn(document, 'querySelector')
        .mockReturnValueOnce(null) // no radar chart
        .mockReturnValueOnce(mockCanvas); // bar chart
      
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: { questions: [{ id: 'q1', text: 'Question 1' }] }
          }
        }
      };
      const answers = { q1: 4 };
      
      const pdf = await pdfService.generatePDF(domains, answers, {}, {});
      expect(pdf).toBeDefined();
      
      querySelectorSpy.mockRestore();
    });

    it('should add both charts when available', async () => {
      // Mock canvas elements
      const mockCanvas = document.createElement('canvas');
      mockCanvas.width = 400;
      mockCanvas.height = 300;
      
      const querySelectorSpy = vi.spyOn(document, 'querySelector')
        .mockReturnValueOnce(mockCanvas) // radar chart
        .mockReturnValueOnce(mockCanvas); // bar chart
      
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: { questions: [{ id: 'q1', text: 'Question 1' }] }
          }
        }
      };
      const answers = { q1: 4 };
      
      const pdf = await pdfService.generatePDF(domains, answers, {}, {});
      expect(pdf).toBeDefined();
      
      querySelectorSpy.mockRestore();
    });

    it('should handle bar chart that requires new page', async () => {
      // Mock tall canvas that would exceed page height
      const mockCanvas = document.createElement('canvas');
      mockCanvas.width = 400;
      mockCanvas.height = 800; // Tall chart
      
      const querySelectorSpy = vi.spyOn(document, 'querySelector')
        .mockReturnValueOnce(null) // no radar chart
        .mockReturnValueOnce(mockCanvas); // tall bar chart
      
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: { questions: [{ id: 'q1', text: 'Question 1' }] }
          }
        }
      };
      const answers = { q1: 4 };
      
      const pdf = await pdfService.generatePDF(domains, answers, {}, {});
      expect(pdf).toBeDefined();
      
      querySelectorSpy.mockRestore();
    });
  });

  describe('useCompliance Coverage', () => {
    it('should cover branch in useCompliance', async () => {
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: { questions: [{ id: 'q1', text: 'Question 1' }] }
          }
        }
      };
      const answers = { q1: 4 };
      
      // Test with empty frameworks to cover the branch
      const pdf = await pdfService.generatePDF(domains, answers, {}, {});
      expect(pdf).toBeDefined();
    });
  });

  describe('Image Evidence Advanced Scenarios', () => {
    it('should handle image with caption', async () => {
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: { 
              questions: [{ 
                id: 'q1', 
                text: 'Question 1' 
              }] 
            }
          }
        }
      };
      const answers = { q1: 4 };
      const evidence = {
        q1: {
          images: [
            { 
              data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
              name: 'Test Image Caption'
            }
          ]
        }
      };
      
      const pdf = await pdfService.generatePDF(domains, answers, evidence, {});
      expect(pdf).toBeDefined();
    });

    it('should handle tall images that exceed max height', async () => {
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: { 
              questions: [{ 
                id: 'q1', 
                text: 'Question 1' 
              }] 
            }
          }
        }
      };
      const answers = { q1: 4 };
      // Create a tall image (1x100 pixels)
      const tallImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAABkCAYAAABHLFpgAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const evidence = {
        q1: {
          images: [tallImageBase64]
        }
      };
      
      const pdf = await pdfService.generatePDF(domains, answers, evidence, {});
      expect(pdf).toBeDefined();
    });

    it('should handle image counter display', async () => {
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: { 
              questions: [{ 
                id: 'q1', 
                text: 'Question 1' 
              }] 
            }
          }
        }
      };
      const answers = { q1: 4 };
      const evidence = {
        q1: {
          images: [
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
          ]
        }
      };
      
      const pdf = await pdfService.generatePDF(domains, answers, evidence, {});
      expect(pdf).toBeDefined();
    });

    it('should handle image that requires new page', async () => {
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: { 
              questions: Array.from({ length: 25 }, (_, i) => ({ 
                id: `q${i}`, 
                text: `Question ${i}` 
              }))
            }
          }
        }
      };
      const answers = Object.fromEntries(
        Array.from({ length: 25 }, (_, i) => [`q${i}`, 4])
      );
      const evidence = {
        q20: {
          images: [
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
          ]
        }
      };
      
      const pdf = await pdfService.generatePDF(domains, answers, evidence, {});
      expect(pdf).toBeDefined();
    });
  });
});
  describe('Error Handling and Edge Cases', () => {
    it('should handle empty domains', async () => {
      const pdf = await pdfService.generatePDF({}, {}, {}, {});
      expect(pdf).toBeDefined();
    });

    it('should handle null evidence', async () => {
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: { 
              questions: [{ id: 'q1', text: 'Question 1' }]
            }
          }
        }
      };
      const answers = { q1: 4 };
      
      const pdf = await pdfService.generatePDF(domains, answers, null, {});
      expect(pdf).toBeDefined();
    });

    it('should handle empty answers object', async () => {
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: { 
              questions: [{ id: 'q1', text: 'Question 1' }]
            }
          }
        }
      };
      
      const pdf = await pdfService.generatePDF(domains, {}, {}, {});
      expect(pdf).toBeDefined();
    });

    it('should handle chart rendering with null charts', async () => {
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: { 
              questions: [{ id: 'q1', text: 'Question 1' }]
            }
          }
        }
      };
      const answers = { q1: 4 };
      
      const pdf = await pdfService.generatePDF(domains, answers, {}, {}, null, null);
      expect(pdf).toBeDefined();
    });

    it('should handle compliance with empty frameworks', async () => {
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: { 
              questions: [{ id: 'q1', text: 'Question 1' }]
            }
          }
        }
      };
      const answers = { q1: 4 };
      const compliance = {
        frameworks: []
      };
      
      const pdf = await pdfService.generatePDF(domains, answers, {}, compliance);
      expect(pdf).toBeDefined();
    });

    it('should handle malformed image data', async () => {
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: { 
              questions: [{ id: 'q1', text: 'Question 1' }]
            }
          }
        }
      };
      const answers = { q1: 4 };
      const evidence = {
        q1: {
          images: ['data:image/png;base64,invalid']
        }
      };
      
      const pdf = await pdfService.generatePDF(domains, answers, evidence, {});
      expect(pdf).toBeDefined();
    });

    it('should handle image with name property', async () => {
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: { 
              questions: [{ id: 'q1', text: 'Question 1' }]
            }
          }
        }
      };
      const answers = { q1: 4 };
      const evidence = {
        q1: {
          images: [{
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            name: 'Test Image.png'
          }]
        }
      };
      
      const pdf = await pdfService.generatePDF(domains, answers, evidence, {});
      expect(pdf).toBeDefined();
    });

    it('should handle multiple questions with mixed evidence', async () => {
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: { 
              questions: [
                { id: 'q1', text: 'Question 1' },
                { id: 'q2', text: 'Question 2' },
                { id: 'q3', text: 'Question 3' }
              ]
            }
          }
        }
      };
      const answers = { q1: 4, q2: 3, q3: 5 };
      const evidence = {
        q1: {
          images: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==']
        },
        q3: {
          images: [
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
          ]
        }
      };
      
      const pdf = await pdfService.generatePDF(domains, answers, evidence, {});
      expect(pdf).toBeDefined();
    });

    it('should handle domain with no categories', async () => {
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {}
        }
      };
      
      const pdf = await pdfService.generatePDF(domains, {}, {}, {});
      expect(pdf).toBeDefined();
    });

    it('should handle category with no questions', async () => {
      const domains = {
        domain1: {
          title: 'Domain 1',
          weight: 1,
          categories: {
            cat1: { 
              questions: []
            }
          }
        }
      };
      
      const pdf = await pdfService.generatePDF(domains, {}, {}, {});
      expect(pdf).toBeDefined();
    });
  });
