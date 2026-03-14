import { scoreCalculator, NA_VALUE } from '../utils/scoreCalculator';

let _ExcelJS;
async function getExcelJS() {
  if (!_ExcelJS) {
    _ExcelJS = (await import('exceljs')).default;
  }
  return _ExcelJS;
}

/**
 * Generates and downloads a multi-sheet Excel workbook
 * containing the full assessment report.
 */
export const excelExportService = {
  async generateReport(domains, answers, evidence, frameworks = []) {
    const ExcelJS = await getExcelJS();
    const wb = new ExcelJS.Workbook();

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

  async downloadReport(wb, filename) {
    const name = filename || `assessment-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
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

    const ws = wb.addWorksheet('Summary');

    ws.addRow(['Assessment Report']);
    ws.addRow(['Generated', new Date().toLocaleDateString()]);
    ws.addRow([]);
    ws.addRow(['Overall Score', overall]);
    ws.addRow(['Maturity Level', maturity]);
    ws.addRow(['Questions Answered', `${answered} / ${totalQuestions}`]);
    ws.addRow(['Completion', totalQuestions > 0 ? `${Math.round((answered / totalQuestions) * 100)}%` : '0%']);

    ws.getColumn(1).width = 22;
    ws.getColumn(2).width = 30;
  },

  _addDomainSheet(wb, domains, answers) {
    const ws = wb.addWorksheet('Domain Scores');
    ws.addRow(['Domain', 'Weight', 'Questions', 'Answered', 'Score', 'Maturity Level']);

    Object.entries(domains).forEach(([, domain]) => {
      const questions = scoreCalculator.getAllQuestionsFromDomain(domain);
      const score = scoreCalculator.calculateDomainScore(questions, answers);
      const answeredCount = questions.filter(q => answers[q.id] !== undefined).length;

      ws.addRow([
        domain.title,
        domain.weight,
        questions.length,
        answeredCount,
        Math.round(score * 100) / 100,
        scoreCalculator.getMaturityLevel(score)
      ]);
    });

    const widths = [35, 8, 12, 10, 8, 18];
    widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
  },

  _addAnswersSheet(wb, domains, answers, evidence) {
    const ws = wb.addWorksheet('All Answers');
    ws.addRow(['Domain', 'Category', 'Question', 'Score', 'Maturity Level', 'Has Evidence']);

    Object.entries(domains).forEach(([, domain]) => {
      Object.entries(domain.categories || {}).forEach(([, category]) => {
        (category.questions || []).forEach(q => {
          const val = answers[q.id];
          const hasEvidence = evidence && evidence[q.id] ? 'Yes' : 'No';
          const displayScore = val === NA_VALUE ? 'N/A' : (val !== undefined ? val : '');
          const level = val !== undefined && val !== NA_VALUE
            ? scoreCalculator.getMaturityLevel(val)
            : (val === NA_VALUE ? 'N/A' : '');

          ws.addRow([
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

    const widths = [30, 25, 60, 8, 18, 14];
    widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
  },

  _addComplianceSheet(wb, frameworks) {
    const ws = wb.addWorksheet('Compliance');
    ws.addRow(['Framework', 'Category', 'Score (%)', 'Status', 'Threshold (%)', 'Mapped Questions']);

    frameworks.forEach(fw => {
      ws.addRow([
        fw.name || fw.id,
        fw.category || '',
        fw.score !== undefined ? Math.round(fw.score) : '',
        fw.score >= (fw.threshold || 80) ? 'Compliant' : 'Non-Compliant',
        fw.threshold || 80,
        (fw.mappedQuestions || []).length
      ]);
    });

    const widths = [30, 18, 12, 16, 14, 18];
    widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
  }
};
