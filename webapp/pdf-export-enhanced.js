// Enhanced PDF Export with Charts and Evidence
// Includes proper aspect ratio handling for images

async function exportPDF() {
    try {
        showPDFLoadingIndicator();
        
        // Check if jsPDF is loaded
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
        
        // Page 1: Executive Summary
        await addExecutiveSummaryPage(pdf, margin, pageWidth, pageHeight);
        
        // Page 2: Charts
        pdf.addPage();
        await addChartsPage(pdf, margin, pageWidth, pageHeight);
        
        // Page 3: Detailed Assessment
        pdf.addPage();
        await addDetailedAssessmentPage(pdf, margin, pageWidth, pageHeight);
        
        // Page 4+: Evidence
        const hasEvidence = await addEvidencePages(pdf, margin, pageWidth, pageHeight);
        
        // Save PDF
        const timestamp = new Date().toISOString().split('T')[0];
        pdf.save(`Technology-Assessment-Report-${timestamp}.pdf`);
        
        hidePDFLoadingIndicator();
        showNotification('PDF exported successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        console.error('Error details:', error.message, error.stack);
        hidePDFLoadingIndicator();
        alert('Error generating PDF: ' + error.message);
    }
}

// Page 1: Executive Summary
async function addExecutiveSummaryPage(pdf, margin, pageWidth, pageHeight) {
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
    
    const interpretation = getMaturityInterpretation(parseFloat(overallScore));
    const lines = pdf.splitTextToSize(interpretation, pageWidth - (2 * margin));
    lines.forEach(line => {
        if (yPos > pageHeight - 30) {
            pdf.addPage();
            yPos = 20;
        }
        pdf.text(line, margin, yPos);
        yPos += 5;
    });
}

// Page 2: Charts
async function addChartsPage(pdf, margin, pageWidth, pageHeight) {
    let yPos = 20;
    
    pdf.setFontSize(18);
    pdf.setTextColor(99, 102, 241);
    pdf.text('Visual Analysis', margin, yPos);
    yPos += 15;
    
    // Capture and add charts
    const chartIds = ['overviewChart', 'radarChart'];
    
    for (const chartId of chartIds) {
        const canvas = document.getElementById(chartId);
        if (canvas && yPos < pageHeight - 80) {
            try {
                // Get chart as image
                const imgData = canvas.toDataURL('image/png', 1.0);
                
                // Calculate dimensions maintaining aspect ratio
                const canvasAspectRatio = canvas.width / canvas.height;
                const maxWidth = pageWidth - (2 * margin);
                const maxHeight = 100;
                
                let imgWidth = maxWidth;
                let imgHeight = imgWidth / canvasAspectRatio;
                
                if (imgHeight > maxHeight) {
                    imgHeight = maxHeight;
                    imgWidth = imgHeight * canvasAspectRatio;
                }
                
                // Add image to PDF
                pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
                yPos += imgHeight + 15;
                
                // Add page if needed
                if (yPos > pageHeight - 100 && chartId !== chartIds[chartIds.length - 1]) {
                    pdf.addPage();
                    yPos = 20;
                }
            } catch (error) {
                console.error(`Error capturing ${chartId}:`, error);
            }
        }
    }
}

// Page 3: Detailed Assessment
async function addDetailedAssessmentPage(pdf, margin, pageWidth, pageHeight) {
    let yPos = 20;
    
    pdf.setFontSize(18);
    pdf.setTextColor(99, 102, 241);
    pdf.text('Detailed Assessment Results', margin, yPos);
    yPos += 15;
    
    if (!questionsData) return;
    
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

// Page 4+: Evidence
async function addEvidencePages(pdf, margin, pageWidth, pageHeight) {
    let yPos = 20;
    let hasEvidence = false;
    let firstPage = true;
    
    if (!questionsData || typeof evidenceManager === 'undefined') return false;
    
    // Collect all evidence
    const evidencePromises = [];
    Object.keys(questionsData).forEach(domainKey => {
        const domain = questionsData[domainKey];
        Object.keys(domain.categories).forEach(categoryKey => {
            const category = domain.categories[categoryKey];
            category.questions.forEach(question => {
                evidencePromises.push(
                    evidenceManager.getEvidence(question.id).then(evidence => {
                        if (evidence && (evidence.text || (evidence.images && evidence.images.length > 0))) {
                            return { questionId: question.id, question: question.text, evidence };
                        }
                        return null;
                    })
                );
            });
        });
    });
    
    const evidenceItems = (await Promise.all(evidencePromises)).filter(item => item !== null);
    
    if (evidenceItems.length === 0) return false;
    
    pdf.addPage();
    
    pdf.setFontSize(18);
    pdf.setTextColor(99, 102, 241);
    pdf.text('Evidence Documentation', margin, yPos);
    yPos += 15;
    
    for (const item of evidenceItems) {
        hasEvidence = true;
        
        if (yPos > pageHeight - 80) {
            pdf.addPage();
            yPos = 20;
        }
        
        // Question ID
        pdf.setFontSize(10);
        pdf.setTextColor(99, 102, 241);
        pdf.text(`${item.questionId.toUpperCase()}`, margin, yPos);
        yPos += 5;
        
        // Question text
        pdf.setFontSize(9);
        pdf.setTextColor(75, 85, 99);
        const questionLines = pdf.splitTextToSize(item.question, pageWidth - (2 * margin));
        questionLines.forEach(line => {
            pdf.text(line, margin + 5, yPos);
            yPos += 4;
        });
        
        // Evidence text
        if (item.evidence.text) {
            yPos += 2;
            pdf.setTextColor(55, 65, 81);
            const textLines = pdf.splitTextToSize(item.evidence.text, pageWidth - (2 * margin));
            textLines.slice(0, 5).forEach(line => {
                if (yPos > pageHeight - 30) {
                    pdf.addPage();
                    yPos = 20;
                }
                pdf.text(line, margin + 5, yPos);
                yPos += 4;
            });
        }
        
        // Evidence images with proper aspect ratio
        if (item.evidence.images && item.evidence.images.length > 0) {
            yPos += 5;
            
            for (const image of item.evidence.images.slice(0, 2)) { // Max 2 images per question
                if (yPos > pageHeight - 60) {
                    pdf.addPage();
                    yPos = 20;
                }
                
                try {
                    // Create temporary image to get dimensions
                    const img = new Image();
                    img.src = image.data;
                    await new Promise(resolve => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                    
                    // Calculate dimensions maintaining aspect ratio
                    const maxWidth = (pageWidth - (2 * margin)) / 2;
                    const maxHeight = 50;
                    
                    let width = img.width;
                    let height = img.height;
                    const aspectRatio = width / height;
                    
                    if (width > maxWidth) {
                        width = maxWidth;
                        height = width / aspectRatio;
                    }
                    if (height > maxHeight) {
                        height = maxHeight;
                        width = height * aspectRatio;
                    }
                    
                    // Add image to PDF
                    pdf.addImage(image.data, 'JPEG', margin + 5, yPos, width, height);
                    yPos += height + 5;
                } catch (error) {
                    console.error('Error adding image to PDF:', error);
                }
            }
            
            if (item.evidence.images.length > 2) {
                pdf.setFontSize(8);
                pdf.setTextColor(107, 114, 128);
                pdf.text(`+ ${item.evidence.images.length - 2} more image(s)`, margin + 5, yPos);
                yPos += 5;
            }
        }
        
        yPos += 8;
    }
    
    return hasEvidence;
}

function getMaturityInterpretation(score) {
    if (score < 1.5) {
        return '1 - Not Implemented: Processes are ad-hoc or non-existent. No formal documentation or standards.';
    } else if (score < 2.5) {
        return '2 - Initial/Ad-hoc: Some processes exist but are not standardized. Success depends on individual effort.';
    } else if (score < 3.5) {
        return '3 - Defined/Repeatable: Processes are documented and standardized. Training is provided to ensure consistency.';
    } else if (score < 4.5) {
        return '4 - Managed/Measured: Processes are quantitatively managed. Metrics are collected and analyzed for improvement.';
    } else {
        return '5 - Optimized/Innovating: Continuous process improvement is enabled by quantitative feedback and piloting innovative ideas.';
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
        <div style="font-size: 14px; color: #6b7280; margin-top: 8px;">Including charts and evidence</div>
        <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">This may take a few moments</div>
    `;
    document.body.appendChild(indicator);
}

function hidePDFLoadingIndicator() {
    const indicator = document.getElementById('pdf-loading-indicator');
    if (indicator) {
        indicator.remove();
    }
}