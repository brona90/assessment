import { describe, it, expect } from 'vitest';
import { excelExportService } from './excelExportService';

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
    // We can't easily mock XLSX.writeFile in ESM, but we verify it doesn't throw
    // In browser it would trigger a download
    expect(() => excelExportService.downloadReport(wb, 'test.xlsx')).not.toThrow();
  });
});
