import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const pdfService = {
  async generatePDF(domains, answers, evidence, complianceFrameworks) {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Page 1: Executive Summary
    pdf.setFontSize(24);
    pdf.setTextColor(99, 102, 241);
    pdf.text('Technology Assessment Report', margin, yPos);
    yPos += 15;

    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPos);
    yPos += 15;

    // Calculate overall score
    const overallScore = this.calculateOverallScore(domains, answers);
    pdf.setFontSize(16);
    pdf.text(`Overall Maturity Score: ${overallScore.toFixed(2)}/5.0`, margin, yPos);
    yPos += 10;

    const maturityLevel = this.getMaturityLevel(overallScore);
    pdf.text(`Maturity Level: ${maturityLevel}`, margin, yPos);
    yPos += 20;

    // Domain scores
    pdf.setFontSize(14);
    pdf.text('Domain Scores:', margin, yPos);
    yPos += 10;

    Object.entries(domains).forEach(([key, domain]) => {
      const score = this.calculateDomainScore(domain, answers);
      pdf.setFontSize(12);
      pdf.text(`${domain.title}: ${score.toFixed(2)}/5.0`, margin + 5, yPos);
      yPos += 8;
    });

    // Page 2: Detailed Results
    pdf.addPage();
    yPos = margin;
    
    pdf.setFontSize(18);
    pdf.setTextColor(99, 102, 241);
    pdf.text('Detailed Assessment Results', margin, yPos);
    yPos += 15;

    Object.entries(domains).forEach(([key, domain]) => {
      if (yPos > pageHeight - 40) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text(domain.title, margin, yPos);
      yPos += 10;

      Object.values(domain.categories || {}).forEach(category => {
        if (category.questions) {
          category.questions.forEach(question => {
            if (answers[question.id] !== undefined) {
              if (yPos > pageHeight - 30) {
                pdf.addPage();
                yPos = margin;
              }

              pdf.setFontSize(10);
              pdf.text(`${question.id.toUpperCase()}: ${answers[question.id]}/5`, margin + 5, yPos);
              yPos += 6;
            }
          });
        }
      });
      yPos += 5;
    });

    return pdf;
  },

  calculateDomainScore(domain, answers) {
    const questions = [];
    Object.values(domain.categories || {}).forEach(cat => {
      if (cat.questions) questions.push(...cat.questions);
    });

    if (questions.length === 0) return 0;

    let total = 0;
    let count = 0;
    questions.forEach(q => {
      if (answers[q.id] !== undefined) {
        total += answers[q.id];
        count++;
      }
    });

    return count > 0 ? total / count : 0;
  },

  calculateOverallScore(domains, answers) {
    let weightedSum = 0;
    let totalWeight = 0;

    Object.values(domains).forEach(domain => {
      const score = this.calculateDomainScore(domain, answers);
      if (score > 0) {
        weightedSum += score * domain.weight;
        totalWeight += domain.weight;
      }
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  },

  getMaturityLevel(score) {
    if (score >= 4.5) return 'Optimized';
    if (score >= 3.5) return 'Managed';
    if (score >= 2.5) return 'Defined';
    if (score >= 1.5) return 'Initial';
    return 'Not Implemented';
  },

  async downloadPDF(pdf, filename = 'assessment-report.pdf') {
    pdf.save(filename);
  }
};