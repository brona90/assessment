// Simplified PDF Export - More Reliable Version
// This version uses a simpler approach that's more likely to work

async function exportPDF() {
    try {
        showPDFLoadingIndicator();
        
        // Simple check for jsPDF
        if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
            hidePDFLoadingIndicator();
            alert('PDF library not loaded. Please refresh the page and try again.');
            return;
        }
        
        // Get jsPDF constructor
        const jsPDF = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
        
        if (!jsPDF) {
            hidePDFLoadingIndicator();
            alert('Could not initialize PDF library. Please try refreshing the page.');
            return;
        }
        
        // Create PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;
        let yPos = 20;
        
        // Title
        pdf.setFontSize(24);
        pdf.setTextColor(99, 102, 241);
        pdf.text('Technology Assessment Report', margin, yPos);
        yPos += 15;
        
        // Date
        pdf.setFontSize(10);
        pdf.setTextColor(107, 114, 128);
        const date = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        pdf.text(`Generated: ${date}`, margin, yPos);
        yPos += 20;
        
        // Calculate scores
        const domainScores = calculateDomainScores ? calculateDomainScores() : [0, 0, 0, 0];
        const weights = [0.30, 0.25, 0.25, 0.20];
        const overallScore = domainScores.reduce((sum, score, idx) => 
            sum + (parseFloat(score) * weights[idx]), 0
        ).toFixed(1);
        
        // Overall Score Box
        pdf.setFillColor(99, 102, 241);
        pdf.roundedRect(margin, yPos, pageWidth - (2 * margin), 30, 3, 3, 'F');
        
        pdf.setFontSize(14);
        pdf.setTextColor(255, 255, 255);
        pdf.text('Overall Maturity Score', margin + 10, yPos + 12);
        
        pdf.setFontSize(32);
        pdf.text(`${overallScore} / 5.0`, margin + 10, yPos + 25);
        yPos += 40;
        
        // Domain Scores
        pdf.setFontSize(16);
        pdf.setTextColor(31, 41, 55);
        pdf.text('Domain Scores', margin, yPos);
        yPos += 10;
        
        const domainNames = [
            'Data Orchestration & Platform Observability (30%)',
            'FinOps & Data Management (25%)',
            'Autonomous Capabilities (AI/ML) (25%)',
            'Operations & Platform Team Alignment (20%)'
        ];
        
        domainScores.forEach((score, idx) => {
            pdf.setFontSize(11);
            pdf.setTextColor(55, 65, 81);
            pdf.text(domainNames[idx], margin, yPos);
            
            // Score bar
            const barWidth = (parseFloat(score) / 5) * (pageWidth - (2 * margin) - 40);
            pdf.setFillColor(99, 102, 241);
            pdf.roundedRect(margin, yPos + 2, Math.max(barWidth, 1), 6, 2, 2, 'F');
            
            // Score text
            pdf.setFontSize(10);
            pdf.setTextColor(99, 102, 241);
            pdf.text(`${score}`, pageWidth - margin - 15, yPos + 5);
            
            yPos += 12;
        });
        
        yPos += 10;
        
        // Assessment Summary
        pdf.setFontSize(16);
        pdf.setTextColor(31, 41, 55);
        pdf.text('Assessment Summary', margin, yPos);
        yPos += 10;
        
        if (questionsData) {
            let totalQuestions = 0;
            let answeredQuestions = 0;
            
            Object.keys(questionsData).forEach(domainKey => {
                const domain = questionsData[domainKey];
                Object.keys(domain.categories).forEach(categoryKey => {
                    const category = domain.categories[categoryKey];
                    category.questions.forEach(question => {
                        totalQuestions++;
                        if (assessmentData && assessmentData[question.id] !== undefined) {
                            answeredQuestions++;
                        }
                    });
                });
            });
            
            pdf.setFontSize(11);
            pdf.setTextColor(55, 65, 81);
            pdf.text(`Total Questions: ${totalQuestions}`, margin, yPos);
            yPos += 7;
            pdf.text(`Answered Questions: ${answeredQuestions}`, margin, yPos);
            yPos += 7;
            pdf.text(`Completion: ${Math.round((answeredQuestions / totalQuestions) * 100)}%`, margin, yPos);
            yPos += 15;
        }
        
        // Interpretation
        pdf.setFontSize(14);
        pdf.setTextColor(31, 41, 55);
        pdf.text('Maturity Level Interpretation', margin, yPos);
        yPos += 10;
        
        pdf.setFontSize(10);
        pdf.setTextColor(55, 65, 81);
        
        let interpretation = '';
        const score = parseFloat(overallScore);
        if (score < 1.5) {
            interpretation = '1 - Not Implemented: Processes are ad-hoc or non-existent. No formal documentation or standards.';
        } else if (score < 2.5) {
            interpretation = '2 - Initial/Ad-hoc: Some processes exist but are not standardized. Success depends on individual effort.';
        } else if (score < 3.5) {
            interpretation = '3 - Defined/Repeatable: Processes are documented and standardized. Training is provided to ensure consistency.';
        } else if (score < 4.5) {
            interpretation = '4 - Managed/Measured: Processes are quantitatively managed. Metrics are collected and analyzed for improvement.';
        } else {
            interpretation = '5 - Optimized/Innovating: Continuous process improvement is enabled by quantitative feedback and piloting innovative ideas.';
        }
        
        const lines = pdf.splitTextToSize(interpretation, pageWidth - (2 * margin));
        lines.forEach(line => {
            if (yPos > pageHeight - 30) {
                pdf.addPage();
                yPos = 20;
            }
            pdf.text(line, margin, yPos);
            yPos += 5;
        });
        
        // Add detailed questions if space allows
        if (questionsData && yPos < pageHeight - 50) {
            pdf.addPage();
            yPos = 20;
            
            pdf.setFontSize(18);
            pdf.setTextColor(99, 102, 241);
            pdf.text('Detailed Assessment Results', margin, yPos);
            yPos += 15;
            
            Object.keys(questionsData).forEach((domainKey, domainIndex) => {
                const domain = questionsData[domainKey];
                
                if (yPos > pageHeight - 40) {
                    pdf.addPage();
                    yPos = 20;
                }
                
                pdf.setFontSize(14);
                pdf.setTextColor(99, 102, 241);
                pdf.text(`Domain ${domainIndex + 1}: ${domain.title}`, margin, yPos);
                yPos += 8;
                
                Object.keys(domain.categories).forEach(categoryKey => {
                    const category = domain.categories[categoryKey];
                    
                    pdf.setFontSize(11);
                    pdf.setTextColor(55, 65, 81);
                    pdf.text(category.title, margin + 5, yPos);
                    yPos += 6;
                    
                    category.questions.forEach(question => {
                        if (yPos > pageHeight - 25) {
                            pdf.addPage();
                            yPos = 20;
                        }
                        
                        const answer = assessmentData && assessmentData[question.id];
                        const answerText = answer ? `${answer}/5` : 'Not answered';
                        
                        pdf.setFontSize(9);
                        pdf.setTextColor(75, 85, 99);
                        
                        const questionText = `${question.id.toUpperCase()}: ${question.text}`;
                        const questionLines = pdf.splitTextToSize(questionText, pageWidth - (2 * margin) - 10);
                        
                        questionLines.forEach(line => {
                            pdf.text(line, margin + 10, yPos);
                            yPos += 4;
                        });
                        
                        pdf.setTextColor(99, 102, 241);
                        pdf.text(`Answer: ${answerText}`, margin + 10, yPos);
                        yPos += 6;
                    });
                    
                    yPos += 3;
                });
                
                yPos += 5;
            });
        }
        
        // Save PDF
        const timestamp = new Date().toISOString().split('T')[0];
        pdf.save(`Technology-Assessment-Report-${timestamp}.pdf`);
        
        hidePDFLoadingIndicator();
        showNotification('PDF exported successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        console.error('Error details:', error.message, error.stack);
        hidePDFLoadingIndicator();
        alert('Error generating PDF: ' + error.message + '\n\nPlease check the browser console for more details.');
    }
}

function showPDFLoadingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'pdf-loading-indicator';
    indicator.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px 50px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        text-align: center;
    `;
    indicator.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 15px;">📄</div>
        <div style="font-size: 16px; font-weight: 600; color: #6366f1;">Generating PDF Report...</div>
        <div style="font-size: 14px; color: #6b7280; margin-top: 8px;">This may take a few moments</div>
    `;
    document.body.appendChild(indicator);
}

function hidePDFLoadingIndicator() {
    const indicator = document.getElementById('pdf-loading-indicator');
    if (indicator) {
        indicator.remove();
    }
}