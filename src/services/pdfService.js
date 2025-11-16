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

    Object.entries(domains).forEach(([, domain]) => {
      const score = this.calculateDomainScore(domain, answers);
      pdf.setFontSize(12);
      pdf.text(`${domain.title}: ${score.toFixed(2)}/5.0`, margin + 5, yPos);
      yPos += 8;
    });

    // Add charts if available
    await this.addChartsToPage(pdf, domains, answers);

    // Page 2: Detailed Results with Evidence
    pdf.addPage();
    yPos = margin;
    
    pdf.setFontSize(18);
    pdf.setTextColor(99, 102, 241);
    pdf.text('Detailed Assessment Results', margin, yPos);
    yPos += 15;

    Object.entries(domains).forEach(([, domain]) => {
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
              if (yPos > pageHeight - 40) {
                pdf.addPage();
                yPos = margin;
              }

              pdf.setFontSize(10);
              pdf.text(`${question.id.toUpperCase()}: ${answers[question.id]}/5`, margin + 5, yPos);
              yPos += 6;

              // Add evidence if available
              const questionEvidence = evidence[question.id];
              if (questionEvidence) {
                   
                   // Add text evidence
                   if (questionEvidence.text) {
                     pdf.setFontSize(9);
                     pdf.setTextColor(100, 100, 100);
                     const evidenceText = `Evidence: ${questionEvidence.text}`;
                     const lines = pdf.splitTextToSize(evidenceText, pageWidth - margin * 2 - 10);
                     
                     lines.forEach(line => {
                       if (yPos > pageHeight - 20) {
                         pdf.addPage();
                         yPos = margin;
                       }
                       pdf.text(line, margin + 10, yPos);
                       yPos += 5;
                     });
                     
                     pdf.setTextColor(0, 0, 0);
                     yPos += 3;
                   }
                   
                   // Add image evidence
                   if (questionEvidence.images && questionEvidence.images.length > 0) {
                     pdf.setFontSize(9);
                     pdf.setTextColor(100, 100, 100);
                     pdf.text('Image Evidence:', margin + 10, yPos);
                     yPos += 5;
                     
                     for (const imageUrl of questionEvidence.images) {
                       try {
                         if (yPos > pageHeight - 80) {
                           pdf.addPage();
                           yPos = margin;
                         }
                         
                         const imgWidth = 80;
                         const imgHeight = 60;
                         pdf.addImage(imageUrl, 'JPEG', margin + 10, yPos, imgWidth, imgHeight);
                         yPos += imgHeight + 5;
                       } catch (error) {
                         console.error('Error adding image to PDF:', error);
                         pdf.text('(Image could not be loaded)', margin + 10, yPos);
                         yPos += 5;
                       }
                     }
                     
                     pdf.setTextColor(0, 0, 0);
                     yPos += 3;
                   }
              }
            }
          });
        }
      });
      yPos += 5;
    });

    // Add compliance frameworks if available
    if (complianceFrameworks && Object.keys(complianceFrameworks).length > 0) {
      pdf.addPage();
      yPos = margin;
      
      pdf.setFontSize(18);
      pdf.setTextColor(99, 102, 241);
      pdf.text('Compliance Frameworks', margin, yPos);
      yPos += 15;

      Object.entries(complianceFrameworks).forEach(([key, framework]) => {
        if (framework.enabled) {
          if (yPos > pageHeight - 30) {
            pdf.addPage();
            yPos = margin;
          }

          pdf.setFontSize(14);
          pdf.setTextColor(0, 0, 0);
          pdf.text(framework.name || key, margin, yPos);
          yPos += 10;

          if (framework.score !== undefined) {
            pdf.setFontSize(12);
            pdf.text(`Compliance Score: ${framework.score.toFixed(2)}%`, margin + 5, yPos);
            yPos += 10;
          }
        }
      });
    }

    return pdf;
  },

  async addChartsToPage(pdf) {
    try {
      // Try to capture charts from the DOM if they exist
      const radarChartContainer = document.querySelector('[data-testid="radar-chart"]');
      const barChartContainer = document.querySelector('[data-testid="bar-chart"]');
      
      const radarChart = radarChartContainer?.querySelector('canvas');
      const barChart = barChartContainer?.querySelector('canvas');

      if (radarChart || barChart) {
        pdf.addPage();
        let yPos = 20;
        
        pdf.setFontSize(18);
        pdf.setTextColor(99, 102, 241);
        pdf.text('Visual Analysis', 20, yPos);
        yPos += 15;

        if (radarChart) {
          const radarCanvas = await html2canvas(radarChart, {
            scale: 2,
            backgroundColor: '#ffffff'
          });
          
          const radarImgData = radarCanvas.toDataURL('image/png');
          const aspectRatio = radarCanvas.width / radarCanvas.height;
          const imgWidth = 170;
          const imgHeight = imgWidth / aspectRatio;
          
          pdf.addImage(radarImgData, 'PNG', 20, yPos, imgWidth, imgHeight);
          yPos += imgHeight + 10;
        }

        if (barChart && yPos < 200) {
          const barCanvas = await html2canvas(barChart, {
            scale: 2,
            backgroundColor: '#ffffff'
          });
          
          const barImgData = barCanvas.toDataURL('image/png');
          const aspectRatio = barCanvas.width / barCanvas.height;
          const imgWidth = 170;
          const imgHeight = imgWidth / aspectRatio;
          
          if (yPos + imgHeight > 270) {
            pdf.addPage();
            yPos = 20;
          }
          
          pdf.addImage(barImgData, 'PNG', 20, yPos, imgWidth, imgHeight);
        }
      }
    } catch (error) {
      console.error('Error adding charts to PDF:', error);
      // Continue without charts if there's an error
    }
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