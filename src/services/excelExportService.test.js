import { describe, it, expect, vi, beforeEach } from 'vitest';
import { excelExportService } from './excelExportService';
import { NA_VALUE } from '../utils/scoreCalculator';

/** Helper: get cell value from ExcelJS worksheet using A1-style address */
function cell(ws, addr) {
  return ws.getCell(addr).value;
}

/** Helper: get sheet names from ExcelJS workbook */
function sheetNames(wb) {
  return wb.worksheets.map(ws => ws.name);
}

const mockDomains = {
  d1: {
    title: 'Data Governance',
    weight: 0.5,
    categories: {
      c1: {
        title: 'Data Quality',
        questions: [
          { id: 'q1', text: 'How mature is your data quality?' },
          { id: 'q2', text: 'Do you have data stewards?' }
        ]
      }
    }
  },
  d2: {
    title: 'Analytics',
    weight: 0.5,
    categories: {
      c2: {
        title: 'BI Tools',
        questions: [
          { id: 'q3', text: 'How mature is your BI tooling?' }
        ]
      }
    }
  }
};

const mockAnswers = { q1: 4, q2: 3, q3: 5 };
const mockEvidence = { q1: { text: 'We have policies' } };

describe('excelExportService', () => {
  it('generates a workbook with Summary, Domain Scores, and All Answers sheets', () => {
    const wb = excelExportService.generateReport(mockDomains, mockAnswers, mockEvidence);
    const names = sheetNames(wb);
    expect(names).toContain('Summary');
    expect(names).toContain('Domain Scores');
    expect(names).toContain('All Answers');
  });

  it('does not add Compliance sheet when no frameworks provided', () => {
    const wb = excelExportService.generateReport(mockDomains, mockAnswers, mockEvidence);
    expect(sheetNames(wb)).not.toContain('Compliance');
  });

  it('adds Compliance sheet when frameworks provided', () => {
    const frameworks = [
      { id: 'fw1', name: 'GDPR', category: 'Privacy', score: 85, threshold: 80, mappedQuestions: ['q1'] }
    ];
    const wb = excelExportService.generateReport(mockDomains, mockAnswers, mockEvidence, frameworks);
    expect(sheetNames(wb)).toContain('Compliance');
  });

  it('Summary sheet contains overall score and completion info', () => {
    const wb = excelExportService.generateReport(mockDomains, mockAnswers, mockEvidence);
    const ws = wb.getWorksheet('Summary');
    // Row 4: Overall Score
    expect(cell(ws, 'A4')).toBe('Overall Score');
    expect(typeof cell(ws, 'B4')).toBe('number');
    // Row 6: Questions Answered
    expect(cell(ws, 'A6')).toBe('Questions Answered');
    expect(cell(ws, 'B6')).toBe('3 / 3');
  });

  it('Domain Scores sheet has correct domain rows', () => {
    const wb = excelExportService.generateReport(mockDomains, mockAnswers, mockEvidence);
    const ws = wb.getWorksheet('Domain Scores');
    // Header row
    expect(cell(ws, 'A1')).toBe('Domain');
    // First domain
    expect(cell(ws, 'A2')).toBe('Data Governance');
    expect(cell(ws, 'E2')).toBe(3.5); // (4+3)/2
    // Second domain
    expect(cell(ws, 'A3')).toBe('Analytics');
    expect(cell(ws, 'E3')).toBe(5);
  });

  it('All Answers sheet lists every question with score and evidence flag', () => {
    const wb = excelExportService.generateReport(mockDomains, mockAnswers, mockEvidence);
    const ws = wb.getWorksheet('All Answers');
    // Header
    expect(cell(ws, 'A1')).toBe('Domain');
    expect(cell(ws, 'F1')).toBe('Has Evidence');
    // q1 has evidence
    expect(cell(ws, 'F2')).toBe('Yes');
    // q2 doesn't
    expect(cell(ws, 'F3')).toBe('No');
  });

  it('handles empty answers gracefully', () => {
    const wb = excelExportService.generateReport(mockDomains, {}, {});
    expect(sheetNames(wb).length).toBe(3);
    const ws = wb.getWorksheet('Summary');
    expect(cell(ws, 'B6')).toBe('0 / 3');
  });

  it('downloadReport creates a download link', async () => {
    const wb = excelExportService.generateReport(mockDomains, mockAnswers, mockEvidence);
    const mockUrl = 'blob:test';
    const mockAnchor = { click: vi.fn(), href: '', download: '' };
    vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockUrl);
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);

    await excelExportService.downloadReport(wb, 'test.xlsx');

    expect(mockAnchor.download).toBe('test.xlsx');
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);

    vi.restoreAllMocks();
  });

  // ── Branch coverage: downloadReport default filename ──

  describe('downloadReport', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('uses a default date-based filename when none is provided', async () => {
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, mockEvidence);
      const mockAnchor = { click: vi.fn(), href: '', download: '' };
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);

      await excelExportService.downloadReport(wb);

      expect(mockAnchor.download).toMatch(/^assessment-report-\d{4}-\d{2}-\d{2}\.xlsx$/);
      vi.restoreAllMocks();
    });

    it('uses a default filename when filename is empty string', async () => {
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, mockEvidence);
      const mockAnchor = { click: vi.fn(), href: '', download: '' };
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);

      await excelExportService.downloadReport(wb, '');

      expect(mockAnchor.download).toMatch(/^assessment-report-\d{4}-\d{2}-\d{2}\.xlsx$/);
      vi.restoreAllMocks();
    });
  });

  // ── Branch coverage: Summary sheet with zero total questions ──

  describe('_addSummarySheet', () => {
    it('shows 0% completion when there are no questions (empty domains)', () => {
      const emptyDomains = {
        d1: { title: 'Empty Domain', weight: 1.0, categories: {} }
      };
      const wb = excelExportService.generateReport(emptyDomains, {}, {});
      const ws = wb.getWorksheet('Summary');
      // Completion row (row 7)
      expect(cell(ws, 'A7')).toBe('Completion');
      expect(cell(ws, 'B7')).toBe('0%');
      // Questions Answered should be 0 / 0
      expect(cell(ws, 'B6')).toBe('0 / 0');
    });

    it('shows percentage completion when some questions are answered', () => {
      const wb = excelExportService.generateReport(mockDomains, { q1: 4 }, {});
      const ws = wb.getWorksheet('Summary');
      expect(cell(ws, 'B7')).toBe('33%'); // 1/3 = 33%
    });
  });

  // ── Branch coverage: Domain Scores with various answer states ──

  describe('_addDomainSheet', () => {
    it('handles domains with no answered questions', () => {
      const wb = excelExportService.generateReport(mockDomains, {}, {});
      const ws = wb.getWorksheet('Domain Scores');
      // Answered column (D) should be 0
      expect(cell(ws, 'D2')).toBe(0);
      expect(cell(ws, 'D3')).toBe(0);
      // Score column (E) should be 0
      expect(cell(ws, 'E2')).toBe(0);
      expect(cell(ws, 'E3')).toBe(0);
    });

    it('handles domains with empty categories', () => {
      const domainsEmptyCats = {
        d1: { title: 'Empty', weight: 1.0, categories: {} }
      };
      const wb = excelExportService.generateReport(domainsEmptyCats, {}, {});
      const ws = wb.getWorksheet('Domain Scores');
      expect(cell(ws, 'A2')).toBe('Empty');
      expect(cell(ws, 'C2')).toBe(0); // Questions count
      expect(cell(ws, 'D2')).toBe(0); // Answered count
    });

    it('rounds domain scores to two decimal places', () => {
      const domains = {
        d1: {
          title: 'Test',
          weight: 1.0,
          categories: {
            c1: {
              title: 'Cat',
              questions: [
                { id: 'q1', text: 'Q1' },
                { id: 'q2', text: 'Q2' },
                { id: 'q3', text: 'Q3' }
              ]
            }
          }
        }
      };
      const answers = { q1: 1, q2: 2, q3: 3 };
      const wb = excelExportService.generateReport(domains, answers, {});
      const ws = wb.getWorksheet('Domain Scores');
      expect(cell(ws, 'E2')).toBe(2); // (1+2+3)/3 = 2.0
    });
  });

  // ── Branch coverage: All Answers sheet with NA_VALUE, undefined, and normal values ──

  describe('_addAnswersSheet', () => {
    it('displays N/A for score and maturity when answer is NA_VALUE', () => {
      const answers = { q1: NA_VALUE, q2: 4, q3: 5 };
      const wb = excelExportService.generateReport(mockDomains, answers, {});
      const ws = wb.getWorksheet('All Answers');
      // q1 is NA_VALUE (row 2)
      expect(cell(ws, 'D2')).toBe('N/A');
      expect(cell(ws, 'E2')).toBe('N/A');
    });

    it('displays empty string for score and maturity when answer is undefined', () => {
      const answers = { q2: 3 }; // q1 and q3 are unanswered
      const wb = excelExportService.generateReport(mockDomains, answers, {});
      const ws = wb.getWorksheet('All Answers');
      // q1 is undefined (row 2)
      expect(cell(ws, 'D2')).toBe('');
      expect(cell(ws, 'E2')).toBe('');
      // q2 is answered (row 3)
      expect(cell(ws, 'D3')).toBe(3);
      expect(cell(ws, 'E3')).toBe('Defined'); // 2.5-3.5
    });

    it('displays numeric score and maturity level for normal answered questions', () => {
      const answers = { q1: 5, q2: 2, q3: 1 };
      const wb = excelExportService.generateReport(mockDomains, answers, {});
      const ws = wb.getWorksheet('All Answers');
      // q1 scored 5 -> Optimized
      expect(cell(ws, 'D2')).toBe(5);
      expect(cell(ws, 'E2')).toBe('Optimized');
      // q2 scored 2 -> Initial (>= 1.5, < 2.5)
      expect(cell(ws, 'D3')).toBe(2);
      expect(cell(ws, 'E3')).toBe('Initial');
      // q3 scored 1 -> Not Implemented
      expect(cell(ws, 'D4')).toBe(1);
      expect(cell(ws, 'E4')).toBe('Not Implemented');
    });

    it('shows evidence flag correctly when evidence exists for some questions', () => {
      const evidence = { q1: { text: 'proof' }, q3: { images: ['img.png'] } };
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, evidence);
      const ws = wb.getWorksheet('All Answers');
      expect(cell(ws, 'F2')).toBe('Yes'); // q1 has evidence
      expect(cell(ws, 'F3')).toBe('No');  // q2 has no evidence
      expect(cell(ws, 'F4')).toBe('Yes'); // q3 has evidence
    });

    it('shows No for evidence when evidence parameter is null', () => {
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, null);
      const ws = wb.getWorksheet('All Answers');
      expect(cell(ws, 'F2')).toBe('No');
      expect(cell(ws, 'F3')).toBe('No');
      expect(cell(ws, 'F4')).toBe('No');
    });

    it('handles domains with missing categories gracefully', () => {
      const domainsNoCats = {
        d1: { title: 'No Cats', weight: 1.0 }
      };
      const wb = excelExportService.generateReport(domainsNoCats, {}, {});
      const ws = wb.getWorksheet('All Answers');
      // Only the header row should exist
      expect(cell(ws, 'A1')).toBe('Domain');
      expect(cell(ws, 'A2')).toBeNull();
    });

    it('handles categories with missing questions array gracefully', () => {
      const domainsNoQs = {
        d1: {
          title: 'Has Category',
          weight: 1.0,
          categories: {
            c1: { title: 'Empty Category' }
            // no questions property
          }
        }
      };
      const wb = excelExportService.generateReport(domainsNoQs, {}, {});
      const ws = wb.getWorksheet('All Answers');
      // Only the header row should exist
      expect(cell(ws, 'A1')).toBe('Domain');
      expect(cell(ws, 'A2')).toBeNull();
    });
  });

  // ── Branch coverage: Compliance sheet with various framework data shapes ──

  describe('_addComplianceSheet', () => {
    it('uses fw.id when fw.name is missing', () => {
      const frameworks = [
        { id: 'SOC2', score: 90, threshold: 80, mappedQuestions: ['q1'] }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.getWorksheet('Compliance');
      expect(cell(ws, 'A2')).toBe('SOC2');
    });

    it('uses empty string when fw.category is missing', () => {
      const frameworks = [
        { id: 'fw1', name: 'GDPR', score: 85, threshold: 80, mappedQuestions: ['q1'] }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.getWorksheet('Compliance');
      expect(cell(ws, 'B2')).toBe('');
    });

    it('shows empty string for score when fw.score is undefined', () => {
      const frameworks = [
        { id: 'fw1', name: 'Pending', category: 'Security', mappedQuestions: [] }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.getWorksheet('Compliance');
      expect(cell(ws, 'C2')).toBe('');
    });

    it('shows rounded score when fw.score is defined', () => {
      const frameworks = [
        { id: 'fw1', name: 'SOC2', category: 'Security', score: 87.6, threshold: 80, mappedQuestions: ['q1'] }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.getWorksheet('Compliance');
      expect(cell(ws, 'C2')).toBe(88);
    });

    it('shows Compliant when score meets threshold', () => {
      const frameworks = [
        { id: 'fw1', name: 'GDPR', score: 80, threshold: 80, mappedQuestions: ['q1'] }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.getWorksheet('Compliance');
      expect(cell(ws, 'D2')).toBe('Compliant');
    });

    it('shows Non-Compliant when score is below threshold', () => {
      const frameworks = [
        { id: 'fw1', name: 'GDPR', score: 79, threshold: 80, mappedQuestions: ['q1'] }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.getWorksheet('Compliance');
      expect(cell(ws, 'D2')).toBe('Non-Compliant');
    });

    it('uses default threshold of 80 when fw.threshold is missing', () => {
      const frameworks = [
        { id: 'fw1', name: 'Custom', score: 80, mappedQuestions: ['q1'] }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.getWorksheet('Compliance');
      // score 80 >= default threshold 80 -> Compliant
      expect(cell(ws, 'D2')).toBe('Compliant');
      expect(cell(ws, 'E2')).toBe(80); // Default threshold
    });

    it('uses default threshold of 80 and shows Non-Compliant when score below', () => {
      const frameworks = [
        { id: 'fw1', name: 'Custom', score: 79, mappedQuestions: ['q1'] }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.getWorksheet('Compliance');
      expect(cell(ws, 'D2')).toBe('Non-Compliant');
      expect(cell(ws, 'E2')).toBe(80);
    });

    it('handles missing mappedQuestions gracefully', () => {
      const frameworks = [
        { id: 'fw1', name: 'NoMappings', score: 50, threshold: 80 }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.getWorksheet('Compliance');
      expect(cell(ws, 'F2')).toBe(0); // (undefined || []).length = 0
    });

    it('reports correct count of mapped questions', () => {
      const frameworks = [
        { id: 'fw1', name: 'GDPR', category: 'Privacy', score: 85, threshold: 80, mappedQuestions: ['q1', 'q2', 'q3'] }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.getWorksheet('Compliance');
      expect(cell(ws, 'F2')).toBe(3);
    });

    it('handles multiple frameworks with mixed data', () => {
      const frameworks = [
        { id: 'fw1', name: 'GDPR', category: 'Privacy', score: 90, threshold: 85, mappedQuestions: ['q1'] },
        { id: 'fw2', score: 50, mappedQuestions: [] },
        { id: 'fw3', name: 'ISO', category: 'Quality', score: 75, threshold: 70, mappedQuestions: ['q1', 'q2'] }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.getWorksheet('Compliance');
      // fw1: name=GDPR, category=Privacy, score=90, Compliant
      expect(cell(ws, 'A2')).toBe('GDPR');
      expect(cell(ws, 'D2')).toBe('Compliant');
      // fw2: no name -> use id, no category -> ''
      expect(cell(ws, 'A3')).toBe('fw2');
      expect(cell(ws, 'B3')).toBe('');
      expect(cell(ws, 'D3')).toBe('Non-Compliant'); // 50 < 80 (default)
      // fw3: name=ISO, Compliant (75 >= 70)
      expect(cell(ws, 'A4')).toBe('ISO');
      expect(cell(ws, 'D4')).toBe('Compliant');
    });

    it('handles Non-Compliant when score is undefined (NaN >= threshold is false)', () => {
      const frameworks = [
        { id: 'fw1', name: 'Pending', threshold: 80 }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.getWorksheet('Compliance');
      // undefined >= 80 is false -> Non-Compliant
      expect(cell(ws, 'D2')).toBe('Non-Compliant');
    });
  });
});
