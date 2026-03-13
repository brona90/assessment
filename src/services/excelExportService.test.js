import { describe, it, expect, vi, beforeEach } from 'vitest';
import { excelExportService } from './excelExportService';
import { NA_VALUE } from '../utils/scoreCalculator';

const writeFileMock = vi.hoisted(() => vi.fn());

vi.mock('xlsx', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    writeFile: writeFileMock
  };
});

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
    const names = wb.SheetNames;
    expect(names).toContain('Summary');
    expect(names).toContain('Domain Scores');
    expect(names).toContain('All Answers');
  });

  it('does not add Compliance sheet when no frameworks provided', () => {
    const wb = excelExportService.generateReport(mockDomains, mockAnswers, mockEvidence);
    expect(wb.SheetNames).not.toContain('Compliance');
  });

  it('adds Compliance sheet when frameworks provided', () => {
    const frameworks = [
      { id: 'fw1', name: 'GDPR', category: 'Privacy', score: 85, threshold: 80, mappedQuestions: ['q1'] }
    ];
    const wb = excelExportService.generateReport(mockDomains, mockAnswers, mockEvidence, frameworks);
    expect(wb.SheetNames).toContain('Compliance');
  });

  it('Summary sheet contains overall score and completion info', () => {
    const wb = excelExportService.generateReport(mockDomains, mockAnswers, mockEvidence);
    const ws = wb.Sheets['Summary'];
    // Row 4 (0-indexed row 3): Overall Score
    expect(ws['A4']?.v).toBe('Overall Score');
    expect(typeof ws['B4']?.v).toBe('number');
    // Row 6: Questions Answered
    expect(ws['A6']?.v).toBe('Questions Answered');
    expect(ws['B6']?.v).toBe('3 / 3');
  });

  it('Domain Scores sheet has correct domain rows', () => {
    const wb = excelExportService.generateReport(mockDomains, mockAnswers, mockEvidence);
    const ws = wb.Sheets['Domain Scores'];
    // Header row
    expect(ws['A1']?.v).toBe('Domain');
    // First domain
    expect(ws['A2']?.v).toBe('Data Governance');
    expect(ws['E2']?.v).toBe(3.5); // (4+3)/2
    // Second domain
    expect(ws['A3']?.v).toBe('Analytics');
    expect(ws['E3']?.v).toBe(5);
  });

  it('All Answers sheet lists every question with score and evidence flag', () => {
    const wb = excelExportService.generateReport(mockDomains, mockAnswers, mockEvidence);
    const ws = wb.Sheets['All Answers'];
    // Header
    expect(ws['A1']?.v).toBe('Domain');
    expect(ws['F1']?.v).toBe('Has Evidence');
    // q1 has evidence
    expect(ws['F2']?.v).toBe('Yes');
    // q2 doesn't
    expect(ws['F3']?.v).toBe('No');
  });

  it('handles empty answers gracefully', () => {
    const wb = excelExportService.generateReport(mockDomains, {}, {});
    expect(wb.SheetNames.length).toBe(3);
    const ws = wb.Sheets['Summary'];
    expect(ws['B6']?.v).toBe('0 / 3');
  });

  it('downloadReport calls XLSX.writeFile', () => {
    const wb = excelExportService.generateReport(mockDomains, mockAnswers, mockEvidence);
    excelExportService.downloadReport(wb, 'test.xlsx');
    expect(writeFileMock).toHaveBeenCalledWith(wb, 'test.xlsx');
  });

  // ── Branch coverage: downloadReport default filename ──

  describe('downloadReport', () => {
    beforeEach(() => {
      writeFileMock.mockClear();
    });

    it('uses a default date-based filename when none is provided', () => {
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, mockEvidence);
      excelExportService.downloadReport(wb);
      expect(writeFileMock).toHaveBeenCalledTimes(1);
      const calledFilename = writeFileMock.mock.calls[0][1];
      expect(calledFilename).toMatch(/^assessment-report-\d{4}-\d{2}-\d{2}\.xlsx$/);
    });

    it('uses a default filename when filename is empty string', () => {
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, mockEvidence);
      excelExportService.downloadReport(wb, '');
      expect(writeFileMock).toHaveBeenCalledTimes(1);
      const calledFilename = writeFileMock.mock.calls[0][1];
      expect(calledFilename).toMatch(/^assessment-report-\d{4}-\d{2}-\d{2}\.xlsx$/);
    });
  });

  // ── Branch coverage: Summary sheet with zero total questions ──

  describe('_addSummarySheet', () => {
    it('shows 0% completion when there are no questions (empty domains)', () => {
      const emptyDomains = {
        d1: { title: 'Empty Domain', weight: 1.0, categories: {} }
      };
      const wb = excelExportService.generateReport(emptyDomains, {}, {});
      const ws = wb.Sheets['Summary'];
      // Completion row (row 7)
      expect(ws['A7']?.v).toBe('Completion');
      expect(ws['B7']?.v).toBe('0%');
      // Questions Answered should be 0 / 0
      expect(ws['B6']?.v).toBe('0 / 0');
    });

    it('shows percentage completion when some questions are answered', () => {
      const wb = excelExportService.generateReport(mockDomains, { q1: 4 }, {});
      const ws = wb.Sheets['Summary'];
      expect(ws['B7']?.v).toBe('33%'); // 1/3 = 33%
    });
  });

  // ── Branch coverage: Domain Scores with various answer states ──

  describe('_addDomainSheet', () => {
    it('handles domains with no answered questions', () => {
      const wb = excelExportService.generateReport(mockDomains, {}, {});
      const ws = wb.Sheets['Domain Scores'];
      // Answered column (D) should be 0
      expect(ws['D2']?.v).toBe(0);
      expect(ws['D3']?.v).toBe(0);
      // Score column (E) should be 0
      expect(ws['E2']?.v).toBe(0);
      expect(ws['E3']?.v).toBe(0);
    });

    it('handles domains with empty categories', () => {
      const domainsEmptyCats = {
        d1: { title: 'Empty', weight: 1.0, categories: {} }
      };
      const wb = excelExportService.generateReport(domainsEmptyCats, {}, {});
      const ws = wb.Sheets['Domain Scores'];
      expect(ws['A2']?.v).toBe('Empty');
      expect(ws['C2']?.v).toBe(0); // Questions count
      expect(ws['D2']?.v).toBe(0); // Answered count
    });

    it('rounds domain scores to two decimal places', () => {
      // q1=4, q2=3 => average 3.5; already clean, so use 1 and 2 to get a repeating decimal
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
      const ws = wb.Sheets['Domain Scores'];
      expect(ws['E2']?.v).toBe(2); // (1+2+3)/3 = 2.0
    });
  });

  // ── Branch coverage: All Answers sheet with NA_VALUE, undefined, and normal values ──

  describe('_addAnswersSheet', () => {
    it('displays N/A for score and maturity when answer is NA_VALUE', () => {
      const answers = { q1: NA_VALUE, q2: 4, q3: 5 };
      const wb = excelExportService.generateReport(mockDomains, answers, {});
      const ws = wb.Sheets['All Answers'];
      // q1 is NA_VALUE (row 2)
      expect(ws['D2']?.v).toBe('N/A');
      expect(ws['E2']?.v).toBe('N/A');
    });

    it('displays empty string for score and maturity when answer is undefined', () => {
      const answers = { q2: 3 }; // q1 and q3 are unanswered
      const wb = excelExportService.generateReport(mockDomains, answers, {});
      const ws = wb.Sheets['All Answers'];
      // q1 is undefined (row 2)
      expect(ws['D2']?.v).toBe('');
      expect(ws['E2']?.v).toBe('');
      // q2 is answered (row 3)
      expect(ws['D3']?.v).toBe(3);
      expect(ws['E3']?.v).toBe('Defined'); // 2.5-3.5
    });

    it('displays numeric score and maturity level for normal answered questions', () => {
      const answers = { q1: 5, q2: 2, q3: 1 };
      const wb = excelExportService.generateReport(mockDomains, answers, {});
      const ws = wb.Sheets['All Answers'];
      // q1 scored 5 -> Optimized
      expect(ws['D2']?.v).toBe(5);
      expect(ws['E2']?.v).toBe('Optimized');
      // q2 scored 2 -> Defined (>= 1.5, < 2.5 is Initial)
      expect(ws['D3']?.v).toBe(2);
      expect(ws['E3']?.v).toBe('Initial');
      // q3 scored 1 -> Not Implemented
      expect(ws['D4']?.v).toBe(1);
      expect(ws['E4']?.v).toBe('Not Implemented');
    });

    it('shows evidence flag correctly when evidence exists for some questions', () => {
      const evidence = { q1: { text: 'proof' }, q3: { images: ['img.png'] } };
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, evidence);
      const ws = wb.Sheets['All Answers'];
      expect(ws['F2']?.v).toBe('Yes'); // q1 has evidence
      expect(ws['F3']?.v).toBe('No');  // q2 has no evidence
      expect(ws['F4']?.v).toBe('Yes'); // q3 has evidence
    });

    it('shows No for evidence when evidence parameter is null', () => {
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, null);
      const ws = wb.Sheets['All Answers'];
      expect(ws['F2']?.v).toBe('No');
      expect(ws['F3']?.v).toBe('No');
      expect(ws['F4']?.v).toBe('No');
    });

    it('handles domains with missing categories gracefully', () => {
      const domainsNoCats = {
        d1: { title: 'No Cats', weight: 1.0 }
      };
      const wb = excelExportService.generateReport(domainsNoCats, {}, {});
      const ws = wb.Sheets['All Answers'];
      // Only the header row should exist
      expect(ws['A1']?.v).toBe('Domain');
      expect(ws['A2']).toBeUndefined();
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
      const ws = wb.Sheets['All Answers'];
      // Only the header row should exist
      expect(ws['A1']?.v).toBe('Domain');
      expect(ws['A2']).toBeUndefined();
    });
  });

  // ── Branch coverage: Compliance sheet with various framework data shapes ──

  describe('_addComplianceSheet', () => {
    it('uses fw.id when fw.name is missing', () => {
      const frameworks = [
        { id: 'SOC2', score: 90, threshold: 80, mappedQuestions: ['q1'] }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.Sheets['Compliance'];
      expect(ws['A2']?.v).toBe('SOC2');
    });

    it('uses empty string when fw.category is missing', () => {
      const frameworks = [
        { id: 'fw1', name: 'GDPR', score: 85, threshold: 80, mappedQuestions: ['q1'] }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.Sheets['Compliance'];
      expect(ws['B2']?.v).toBe('');
    });

    it('shows empty string for score when fw.score is undefined', () => {
      const frameworks = [
        { id: 'fw1', name: 'Pending', category: 'Security', mappedQuestions: [] }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.Sheets['Compliance'];
      expect(ws['C2']?.v).toBe('');
    });

    it('shows rounded score when fw.score is defined', () => {
      const frameworks = [
        { id: 'fw1', name: 'SOC2', category: 'Security', score: 87.6, threshold: 80, mappedQuestions: ['q1'] }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.Sheets['Compliance'];
      expect(ws['C2']?.v).toBe(88);
    });

    it('shows Compliant when score meets threshold', () => {
      const frameworks = [
        { id: 'fw1', name: 'GDPR', score: 80, threshold: 80, mappedQuestions: ['q1'] }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.Sheets['Compliance'];
      expect(ws['D2']?.v).toBe('Compliant');
    });

    it('shows Non-Compliant when score is below threshold', () => {
      const frameworks = [
        { id: 'fw1', name: 'GDPR', score: 79, threshold: 80, mappedQuestions: ['q1'] }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.Sheets['Compliance'];
      expect(ws['D2']?.v).toBe('Non-Compliant');
    });

    it('uses default threshold of 80 when fw.threshold is missing', () => {
      const frameworks = [
        { id: 'fw1', name: 'Custom', score: 80, mappedQuestions: ['q1'] }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.Sheets['Compliance'];
      // score 80 >= default threshold 80 -> Compliant
      expect(ws['D2']?.v).toBe('Compliant');
      expect(ws['E2']?.v).toBe(80); // Default threshold
    });

    it('uses default threshold of 80 and shows Non-Compliant when score below', () => {
      const frameworks = [
        { id: 'fw1', name: 'Custom', score: 79, mappedQuestions: ['q1'] }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.Sheets['Compliance'];
      expect(ws['D2']?.v).toBe('Non-Compliant');
      expect(ws['E2']?.v).toBe(80);
    });

    it('handles missing mappedQuestions gracefully', () => {
      const frameworks = [
        { id: 'fw1', name: 'NoMappings', score: 50, threshold: 80 }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.Sheets['Compliance'];
      expect(ws['F2']?.v).toBe(0); // (undefined || []).length = 0
    });

    it('reports correct count of mapped questions', () => {
      const frameworks = [
        { id: 'fw1', name: 'GDPR', category: 'Privacy', score: 85, threshold: 80, mappedQuestions: ['q1', 'q2', 'q3'] }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.Sheets['Compliance'];
      expect(ws['F2']?.v).toBe(3);
    });

    it('handles multiple frameworks with mixed data', () => {
      const frameworks = [
        { id: 'fw1', name: 'GDPR', category: 'Privacy', score: 90, threshold: 85, mappedQuestions: ['q1'] },
        { id: 'fw2', score: 50, mappedQuestions: [] },
        { id: 'fw3', name: 'ISO', category: 'Quality', score: 75, threshold: 70, mappedQuestions: ['q1', 'q2'] }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.Sheets['Compliance'];
      // fw1: name=GDPR, category=Privacy, score=90, Compliant
      expect(ws['A2']?.v).toBe('GDPR');
      expect(ws['D2']?.v).toBe('Compliant');
      // fw2: no name -> use id, no category -> ''
      expect(ws['A3']?.v).toBe('fw2');
      expect(ws['B3']?.v).toBe('');
      expect(ws['D3']?.v).toBe('Non-Compliant'); // 50 < 80 (default)
      // fw3: name=ISO, Compliant (75 >= 70)
      expect(ws['A4']?.v).toBe('ISO');
      expect(ws['D4']?.v).toBe('Compliant');
    });

    it('handles Non-Compliant when score is undefined (NaN >= threshold is false)', () => {
      const frameworks = [
        { id: 'fw1', name: 'Pending', threshold: 80 }
      ];
      const wb = excelExportService.generateReport(mockDomains, mockAnswers, {}, frameworks);
      const ws = wb.Sheets['Compliance'];
      // undefined >= 80 is false -> Non-Compliant
      expect(ws['D2']?.v).toBe('Non-Compliant');
    });
  });
});
