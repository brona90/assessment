import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Helper function to load image and convert to base64
const loadImageAsBase64 = (url) => {
  return new Promise((resolve, reject) => {
    // If it's already a data URL, return it directly
    if (url.startsWith('data:')) {
      resolve(url);
      return;
    }
    
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Handle CORS
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        // Use higher quality for better image reproduction
        const dataURL = canvas.toDataURL('image/jpeg', 0.95);
        resolve(dataURL);
      } catch (error) {
        console.error('Error converting image to base64:', error);
        reject(error);
      }
    };
    
    img.onerror = (error) => {
      console.error('Error loading image:', error, url);
      reject(new Error('Failed to load image'));
    };
    
    // Handle blob URLs and regular URLs
    img.src = url;
  });
};

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

    for (const [, domain] of Object.entries(domains)) {
      const score = this.calculateDomainScore(domain, answers);
      pdf.setFontSize(12);
      pdf.text(`${domain.title}: ${score.toFixed(2)}/5.0`, margin + 5, yPos);
      yPos += 8;
    }

    // Add charts if available
    await this.addChartsToPage(pdf, domains, answers);

    // Page 2: Detailed Results with Evidence
    pdf.addPage();
    yPos = margin;
    
    pdf.setFontSize(18);
    pdf.setTextColor(99, 102, 241);
    pdf.text('Detailed Assessment Results', margin, yPos);
    yPos += 15;

    for (const [, domain] of Object.entries(domains)) {
      if (yPos > pageHeight - 40) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text(domain.title, margin, yPos);
      yPos += 10;

      for (const category of Object.values(domain.categories || {})) {
        if (category.questions) {
          for (const question of category.questions) {
            if (answers[question.id] !== undefined) {
              if (yPos > pageHeight - 40) {
                pdf.addPage();
                yPos = margin;
              }

              pdf.setFontSize(10);
              pdf.text(`${question.id.toUpperCase()}: ${answers[question.id]}/5`, margin + 5, yPos);
              yPos += 6;

              // Add evidence if available
              const questionEvidence = evidence?.[question.id];
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
                   
                   // Add image evidence - ENHANCED VERSION
                   if (questionEvidence.images && questionEvidence.images.length > 0) {
                     pdf.setFontSize(9);
                     pdf.setTextColor(100, 100, 100);
                     pdf.text(`Image Evidence (${questionEvidence.images.length} image${questionEvidence.images.length > 1 ? 's' : ''}):`, margin + 10, yPos);
                     yPos += 5;
                     
                        for (let i = 0; i < questionEvidence.images.length; i++) {
                          const imageData = questionEvidence.images[i];
                          // Handle both string URLs and image objects with data property
                          const imageUrl = typeof imageData === 'string' ? imageData : imageData.data;
                          
                          try {
                            if (yPos > pageHeight - 80) {
                              pdf.addPage();
                              yPos = margin;
                            }
                            
                            // Load and convert image to base64
                            const base64Image = await loadImageAsBase64(imageUrl);
                            
                            // Calculate image dimensions to maintain aspect ratio
                            const maxWidth = 80;
                            const maxHeight = 60;
                            
                            // Get actual image dimensions using a promise with timeout
                            const { width: imgWidth, height: imgHeight } = await Promise.race([
                              new Promise((resolve) => {
                                const img = new Image();
                                img.onload = () => {
                                  const aspectRatio = img.width / img.height;
                                  let width = maxWidth;
                                  let height = maxWidth / aspectRatio;
                                  
                                  // If height exceeds max, scale by height instead
                                  if (height > maxHeight) {
                                    height = maxHeight;
                                    width = maxHeight * aspectRatio;
                                  }
                                  
                                  resolve({ width, height });
                                };
                                img.onerror = () => {
                                  // If image fails to load, use default dimensions
                                  resolve({ width: maxWidth, height: maxHeight });
                                };
                                img.src = base64Image;
                              }),
                              // Timeout after 100ms and use default dimensions
                              new Promise((resolve) => setTimeout(() => resolve({ width: maxWidth, height: maxHeight }), 100))
                            ]);
                            
                            pdf.addImage(base64Image, 'JPEG', margin + 10, yPos, imgWidth, imgHeight);
                            
                            // Add image caption if available
                            if (imageData.name) {
                              pdf.setFontSize(7);
                              pdf.setTextColor(120, 120, 120);
                              pdf.text(`Image ${i + 1}: ${imageData.name}`, margin + 10, yPos + imgHeight + 3);
                              yPos += imgHeight + 8;
                            } else {
                              yPos += imgHeight + 5;
                            }
                            
                            pdf.setFontSize(9);
                            pdf.setTextColor(100, 100, 100);
                          } catch (error) {
                            console.error('Error adding image to PDF:', error, imageUrl);
                            pdf.setFontSize(8);
                            pdf.setTextColor(200, 0, 0);
                            pdf.text(`(Image ${i + 1} could not be loaded)`, margin + 10, yPos);
                            pdf.setFontSize(9);
                            pdf.setTextColor(100, 100, 100);
                            yPos += 5;
                          }
                        }
                         
                     }
                     
                     pdf.setTextColor(0, 0, 0);
                     yPos += 3;
              }
            }
          }
        }
      }
      yPos += 5;
    }

    // Add compliance frameworks if available and enabled
    if (complianceFrameworks && Object.keys(complianceFrameworks).length > 0) {
      // Check if any frameworks are actually enabled
      const enabledFrameworks = Object.entries(complianceFrameworks).filter(([, framework]) => framework.enabled);
      
      if (enabledFrameworks.length > 0) {
        pdf.addPage();
        yPos = margin;
        
        pdf.setFontSize(18);
        pdf.setTextColor(99, 102, 241);
        pdf.text('Compliance Frameworks', margin, yPos);
        yPos += 15;

        enabledFrameworks.forEach(([key, framework]) => {
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
        });
      }
    }

    return pdf;
  },

  async addChartsToPage(pdf) {
    try {
      // Try to capture charts from the DOM if they exist
      const heatmapContainer = document.querySelector('[data-testid="domain-heatmap"]');
      const radarChartContainer = document.querySelector('[data-testid="radar-chart"]');
      const barChartContainer = document.querySelector('[data-testid="bar-chart"]');
      
      const heatmapCanvas = heatmapContainer?.querySelector('canvas');
      const radarChart = radarChartContainer?.querySelector('canvas');
      const barChart = barChartContainer?.querySelector('canvas');

      if (heatmapCanvas || radarChart || barChart) {
        pdf.addPage();
        let yPos = 20;
        
        pdf.setFontSize(18);
        pdf.setTextColor(99, 102, 241);
        pdf.text('Visual Analysis', 20, yPos);
        yPos += 15;

        // Add heatmap first if available
        if (heatmapCanvas) {
          pdf.setFontSize(14);
          pdf.setTextColor(0, 0, 0);
          pdf.text('Assessment Heatmap', 20, yPos);
          yPos += 8;

          const heatmapCanvasElement = await html2canvas(heatmapCanvas, {
            scale: 2,
            backgroundColor: '#ffffff'
          });
          
          const heatmapImgData = heatmapCanvasElement.toDataURL('image/png');
          const aspectRatio = heatmapCanvasElement.width / heatmapCanvasElement.height;
          const imgWidth = 170;
          const imgHeight = imgWidth / aspectRatio;
          
          // Check if we need a new page for the heatmap
          if (yPos + imgHeight > 270) {
            pdf.addPage();
            yPos = 20;
          }
          
          pdf.addImage(heatmapImgData, 'PNG', 20, yPos, imgWidth, imgHeight);
          yPos += imgHeight + 15;
        }

        // Add radar chart
        if (radarChart) {
          // Check if we need a new page
          if (yPos > 200) {
            pdf.addPage();
            yPos = 20;
          }

          pdf.setFontSize(14);
          pdf.setTextColor(0, 0, 0);
          pdf.text('Domain Radar Chart', 20, yPos);
          yPos += 8;

          const radarCanvas = await html2canvas(radarChart, {
            scale: 2,
            backgroundColor: '#ffffff'
          });
          
          const radarImgData = radarCanvas.toDataURL('image/png');
          const aspectRatio = radarCanvas.width / radarCanvas.height;
          const imgWidth = 170;
          const imgHeight = imgWidth / aspectRatio;
          
          pdf.addImage(radarImgData, 'PNG', 20, yPos, imgWidth, imgHeight);
          yPos += imgHeight + 15;
        }

        // Add bar chart
        if (barChart) {
          // Check if we need a new page
          if (yPos > 200) {
            pdf.addPage();
            yPos = 20;
          }

          pdf.setFontSize(14);
          pdf.setTextColor(0, 0, 0);
          pdf.text('Domain Bar Chart', 20, yPos);
          yPos += 8;

          const barCanvas = await html2canvas(barChart, {
            scale: 2,
            backgroundColor: '#ffffff'
          });
          
          const barImgData = barCanvas.toDataURL('image/png');
          const aspectRatio = barCanvas.width / barCanvas.height;
          const imgWidth = 170;
          const imgHeight = imgWidth / aspectRatio;
          
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

  async downloadPDF(pdf, filename = 'compliance-report.pdf') {
    pdf.save(filename);
  }
};