import * as XLSX from 'xlsx';
import { scoreCalculator, NA_VALUE } from '../utils/scoreCalculator';

/**
 * Generates and downloads a multi-sheet Excel workbook
 * containing the full assessment report.
 */
export const excelExportService = {
  generateReport(domains, answers, evidence, frameworks = []) {
    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Executive Summary ──
    this._addSummarySheet(wb, domains, answers);

    // ── Sheet 2: Domain Scores ──
    this._addDomainSheet(wb, domains, answers);

    // ── Sheet 3: All Answers ──
    this._addAnswersSheet(wb, domains, answers, evidence);

    // ── Sheet 4: Compliance Frameworks ──
    if (frameworks.length > 0) {
      this._addComplianceSheet(wb, frameworks);
    }

    return wb;
  },

  downloadReport(wb, filename) {
    const name = filename || `assessment-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, name);
  },

  // ── Internal sheet builders ──

  _addSummarySheet(wb, domains, answers) {
    const overall = scoreCalculator.calculateOverallScore(domains, answers);
    const maturity = scoreCalculator.getMaturityLevel(overall);
    const totalQuestions = Object.values(domains).reduce((acc, d) => {
      const qs = scoreCalculator.getAllQuestionsFromDomain(d);
      return acc + qs.length;
    }, 0);
    const answered = Object.keys(answers).filter(k => answers[k] !== undefined).length;

    const rows = [
      ['Assessment Report'],
      ['Generated', new Date().toLocaleDateString()],
      [],
      ['Overall Score', overall],
      ['Maturity Level', maturity],
      ['Questions Answered', `${answered} / ${totalQuestions}`],
      ['Completion', totalQuestions > 0 ? `${Math.round((answered / totalQuestions) * 100)}%` : '0%'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Column widths
    ws['!cols'] = [{ wch: 22 }, { wch: 30 }];

    XLSX.utils.book_append_sheet(wb, ws, 'Summary');
  },

  _addDomainSheet(wb, domains, answers) {
    const headers = ['Domain', 'Weight', 'Questions', 'Answered', 'Score', 'Maturity Level'];
    const rows = [headers];

    Object.entries(domains).forEach(([, domain]) => {
      const questions = scoreCalculator.getAllQuestionsFromDomain(domain);
      const score = scoreCalculator.calculateDomainScore(questions, answers);
      const answered = questions.filter(q => answers[q.id] !== undefined).length;

      rows.push([
        domain.title,
        domain.weight,
        questions.length,
        answered,
        Math.round(score * 100) / 100,
        scoreCalculator.getMaturityLevel(score)
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 35 }, { wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 18 }];

    XLSX.utils.book_append_sheet(wb, ws, 'Domain Scores');
  },

  _addAnswersSheet(wb, domains, answers, evidence) {
    const headers = ['Domain', 'Category', 'Question', 'Score', 'Maturity Level', 'Has Evidence'];
    const rows = [headers];

    Object.entries(domains).forEach(([, domain]) => {
      Object.entries(domain.categories || {}).forEach(([, category]) => {
        (category.questions || []).forEach(q => {
          const val = answers[q.id];
          const hasEvidence = evidence && evidence[q.id] ? 'Yes' : 'No';
          const displayScore = val === NA_VALUE ? 'N/A' : (val !== undefined ? val : '');
          const level = val !== undefined && val !== NA_VALUE
            ? scoreCalculator.getMaturityLevel(val)
            : (val === NA_VALUE ? 'N/A' : '');

          rows.push([
            domain.title,
            category.title,
            q.text,
            displayScore,
            level,
            hasEvidence
          ]);
        });
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 30 }, { wch: 25 }, { wch: 60 },
      { wch: 8 }, { wch: 18 }, { wch: 14 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'All Answers');
  },

  _addComplianceSheet(wb, frameworks) {
    const headers = ['Framework', 'Category', 'Score (%)', 'Status', 'Threshold (%)', 'Mapped Questions'];
    const rows = [headers];

    frameworks.forEach(fw => {
      rows.push([
        fw.name || fw.id,
        fw.category || '',
        fw.score !== undefined ? Math.round(fw.score) : '',
        fw.score >= (fw.threshold || 80) ? 'Compliant' : 'Non-Compliant',
        fw.threshold || 80,
        (fw.mappedQuestions || []).length
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 18 }];

    XLSX.utils.book_append_sheet(wb, ws, 'Compliance');
  }
};
