// PDF Export Functionality for Technology Assessment
// Generates comprehensive PDF reports with charts and evidence

async function exportPDF() {
    try {
        // Show loading indicator
        showPDFLoadingIndicator();
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        let yPosition = 20;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (2 * margin);
        
        // Page 1: Executive Summary
        await addExecutiveSummary(pdf, yPosition, margin, contentWidth);
        
        // Page 2: Domain Overview Charts
        pdf.addPage();
        await addDomainCharts(pdf, margin, contentWidth);
        
        // Page 3: Compliance Charts
        pdf.addPage();
        await addComplianceCharts(pdf, margin, contentWidth);
        
        // Page 4: Detailed Assessment
        pdf.addPage();
        await addDetailedAssessment(pdf, margin, contentWidth, pageHeight);
        
        // Page 5: Evidence Summary
        pdf.addPage();
        await addEvidenceSummary(pdf, margin, contentWidth, pageHeight);
        
        // Save PDF
        const timestamp = new Date().toISOString().split('T')[0];
        pdf.save(`Technology-Assessment-Report-${timestamp}.pdf`);
        
        hidePDFLoadingIndicator();
        showNotification('PDF exported successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        hidePDFLoadingIndicator();
        showNotification('Error generating PDF. Please try again.', 'error');
    }
}

// Page 1: Executive Summary
async function addExecutiveSummary(pdf, yPos, margin, contentWidth) {
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
    
    yPos += 15;
    
    // Calculate scores
    const domainScores = calculateDomainScores();
    const weights = [0.30, 0.25, 0.25, 0.20];
    const overallScore = domainScores.reduce((sum, score, idx) => 
        sum + (parseFloat(score) * weights[idx]), 0
    ).toFixed(1);
    
    // Overall Score Box
    pdf.setFillColor(99, 102, 241);
    pdf.roundedRect(margin, yPos, contentWidth, 30, 3, 3, 'F');
    
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
        const barWidth = (parseFloat(score) / 5) * (contentWidth - 40);
        pdf.setFillColor(99, 102, 241);
        pdf.roundedRect(margin, yPos + 2, barWidth, 6, 2, 2, 'F');
        
        // Score text
        pdf.setFontSize(10);
        pdf.setTextColor(99, 102, 241);
        pdf.text(`${score}`, margin + contentWidth - 20, yPos + 5);
        
        yPos += 12;
    });
    
    yPos += 10;
    
    // Key Findings
    pdf.setFontSize(16);
    pdf.setTextColor(31, 41, 55);
    pdf.text('Key Findings', margin, yPos);
    
    yPos += 10;
    
    pdf.setFontSize(10);
    pdf.setTextColor(55, 65, 81);
    
    const findings = generateKeyFindings(domainScores, overallScore);
    findings.forEach(finding => {
        const lines = pdf.splitTextToSize(`• ${finding}`, contentWidth - 10);
        lines.forEach(line => {
            pdf.text(line, margin + 5, yPos);
            yPos += 5;
        });
        yPos += 2;
    });
    
    // Maturity Level Interpretation
    yPos += 10;
    pdf.setFontSize(16);
    pdf.setTextColor(31, 41, 55);
    pdf.text('Maturity Level Interpretation', margin, yPos);
    
    yPos += 10;
    pdf.setFontSize(9);
    pdf.setTextColor(55, 65, 81);
    
    const interpretation = getMaturityInterpretation(parseFloat(overallScore));
    const interpretationLines = pdf.splitTextToSize(interpretation, contentWidth);
    interpretationLines.forEach(line => {
        pdf.text(line, margin, yPos);
        yPos += 5;
    });
}

// Page 2: Domain Charts
async function addDomainCharts(pdf, margin, contentWidth) {
    let yPos = 20;
    
    pdf.setFontSize(18);
    pdf.setTextColor(99, 102, 241);
    pdf.text('Visual Analysis', margin, yPos);
    
    yPos += 15;
    
    // Capture Overview Chart
    const overviewCanvas = document.getElementById('overviewChart');
    if (overviewCanvas) {
        const overviewImg = await captureChartAsImage(overviewCanvas);
        if (overviewImg) {
            const imgWidth = contentWidth;
            const imgHeight = (imgWidth * overviewCanvas.height) / overviewCanvas.width;
            pdf.addImage(overviewImg, 'PNG', margin, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 15;
        }
    }
    
    // Capture Radar Chart
    const radarCanvas = document.getElementById('radarChart');
    if (radarCanvas && yPos + 80 < pdf.internal.pageSize.getHeight()) {
        const radarImg = await captureChartAsImage(radarCanvas);
        if (radarImg) {
            const imgWidth = contentWidth;
            const imgHeight = (imgWidth * radarCanvas.height) / radarCanvas.width;
            pdf.addImage(radarImg, 'PNG', margin, yPos, imgWidth, imgHeight);
        }
    }
}

// Page 3: Compliance Charts
async function addComplianceCharts(pdf, margin, contentWidth) {
    let yPos = 20;
    
    pdf.setFontSize(18);
    pdf.setTextColor(99, 102, 241);
    pdf.text('Compliance & Protection Analysis', margin, yPos);
    
    yPos += 15;
    
    // SOX Compliance Chart
    const soxCanvas = document.getElementById('soxChart');
    if (soxCanvas) {
        const soxImg = await captureChartAsImage(soxCanvas);
        if (soxImg) {
            const imgWidth = contentWidth / 2 - 5;
            const imgHeight = (imgWidth * soxCanvas.height) / soxCanvas.width;
            pdf.addImage(soxImg, 'PNG', margin, yPos, imgWidth, imgHeight);
        }
    }
    
    // PII Protection Chart
    const piiCanvas = document.getElementById('piiChart');
    if (piiCanvas) {
        const piiImg = await captureChartAsImage(piiCanvas);
        if (piiImg) {
            const imgWidth = contentWidth / 2 - 5;
            const imgHeight = (imgWidth * piiCanvas.height) / piiCanvas.width;
            pdf.addImage(piiImg, 'PNG', margin + contentWidth / 2 + 5, yPos, imgWidth, imgHeight);
        }
    }
}

// Page 4: Detailed Assessment
async function addDetailedAssessment(pdf, margin, contentWidth, pageHeight) {
    let yPos = 20;
    
    pdf.setFontSize(18);
    pdf.setTextColor(99, 102, 241);
    pdf.text('Detailed Assessment Results', margin, yPos);
    
    yPos += 15;
    
    if (!questionsData) return;
    
    Object.keys(questionsData).forEach((domainKey, domainIndex) => {
        const domain = questionsData[domainKey];
        
        // Check if we need a new page
        if (yPos > pageHeight - 40) {
            pdf.addPage();
            yPos = 20;
        }
        
        // Domain header
        pdf.setFontSize(14);
        pdf.setTextColor(99, 102, 241);
        pdf.text(`Domain ${domainIndex + 1}: ${domain.title}`, margin, yPos);
        yPos += 8;
        
        Object.keys(domain.categories).forEach(categoryKey => {
            const category = domain.categories[categoryKey];
            
            // Category header
            pdf.setFontSize(11);
            pdf.setTextColor(55, 65, 81);
            pdf.text(category.title, margin + 5, yPos);
            yPos += 6;
            
            category.questions.forEach(question => {
                // Check if we need a new page
                if (yPos > pageHeight - 30) {
                    pdf.addPage();
                    yPos = 20;
                }
                
                const answer = assessmentData[question.id];
                const answerText = answer ? `${answer}/5` : 'Not answered';
                
                pdf.setFontSize(9);
                pdf.setTextColor(75, 85, 99);
                
                const questionText = `${question.id.toUpperCase()}: ${question.text}`;
                const lines = pdf.splitTextToSize(questionText, contentWidth - 30);
                
                lines.forEach(line => {
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

// Page 5: Evidence Summary
async function addEvidenceSummary(pdf, margin, contentWidth, pageHeight) {
    let yPos = 20;
    
    pdf.setFontSize(18);
    pdf.setTextColor(99, 102, 241);
    pdf.text('Evidence Summary', margin, yPos);
    
    yPos += 15;
    
    // Count questions with evidence
    let evidenceCount = 0;
    const evidencePromises = [];
    
    if (questionsData) {
        Object.keys(questionsData).forEach(domainKey => {
            const domain = questionsData[domainKey];
            Object.keys(domain.categories).forEach(categoryKey => {
                const category = domain.categories[categoryKey];
                category.questions.forEach(question => {
                    evidencePromises.push(
                        evidenceManager.getEvidence(question.id).then(evidence => {
                            if (evidence && (evidence.text || (evidence.images && evidence.images.length > 0))) {
                                evidenceCount++;
                                return { questionId: question.id, question: question.text, evidence };
                            }
                            return null;
                        })
                    );
                });
            });
        });
    }
    
    const evidenceItems = (await Promise.all(evidencePromises)).filter(item => item !== null);
    
    pdf.setFontSize(12);
    pdf.setTextColor(55, 65, 81);
    pdf.text(`Total Questions with Evidence: ${evidenceCount}`, margin, yPos);
    yPos += 10;
    
    // List evidence items
    for (const item of evidenceItems) {
        if (yPos > pageHeight - 60) {
            pdf.addPage();
            yPos = 20;
        }
        
        pdf.setFontSize(10);
        pdf.setTextColor(99, 102, 241);
        pdf.text(`${item.questionId.toUpperCase()}`, margin, yPos);
        yPos += 5;
        
        pdf.setFontSize(9);
        pdf.setTextColor(75, 85, 99);
        const questionLines = pdf.splitTextToSize(item.question, contentWidth - 10);
        questionLines.forEach(line => {
            pdf.text(line, margin + 5, yPos);
            yPos += 4;
        });
        
        if (item.evidence.text) {
            yPos += 2;
            pdf.setTextColor(55, 65, 81);
            const textLines = pdf.splitTextToSize(item.evidence.text, contentWidth - 10);
            textLines.slice(0, 3).forEach(line => {
                pdf.text(line, margin + 5, yPos);
                yPos += 4;
            });
        }
        
        if (item.evidence.images && item.evidence.images.length > 0) {
            yPos += 3;
            pdf.setFontSize(8);
            pdf.setTextColor(107, 114, 128);
            pdf.text(`📎 ${item.evidence.images.length} image(s) attached`, margin + 5, yPos);
            yPos += 5;
            
            // Add first image thumbnail (maintaining aspect ratio)
            const firstImage = item.evidence.images[0];
            if (firstImage && firstImage.data) {
                try {
                    const maxWidth = 40;
                    const maxHeight = 40;
                    
                    // Create temporary image to get dimensions
                    const img = new Image();
                    img.src = firstImage.data;
                    await new Promise(resolve => {
                        img.onload = resolve;
                    });
                    
                    // Calculate dimensions maintaining aspect ratio
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
                    
                    pdf.addImage(firstImage.data, 'JPEG', margin + 5, yPos, width, height);
                    yPos += height + 5;
                } catch (error) {
                    console.error('Error adding image to PDF:', error);
                }
            }
        }
        
        yPos += 8;
    }
}

// Helper Functions

async function captureChartAsImage(canvas) {
    try {
        return await html2canvas(canvas, {
            backgroundColor: '#ffffff',
            scale: 2
        }).then(canvas => canvas.toDataURL('image/png'));
    } catch (error) {
        console.error('Error capturing chart:', error);
        return null;
    }
}

function generateKeyFindings(domainScores, overallScore) {
    const findings = [];
    
    const score = parseFloat(overallScore);
    if (score < 2.0) {
        findings.push('Overall maturity is at initial stage. Significant improvements needed across all domains.');
    } else if (score < 3.0) {
        findings.push('Organization is in early development stage. Focus on establishing repeatable processes.');
    } else if (score < 4.0) {
        findings.push('Good progress with defined processes. Continue optimizing and measuring outcomes.');
    } else {
        findings.push('Excellent maturity level achieved. Focus on innovation and continuous improvement.');
    }
    
    // Find strongest and weakest domains
    const maxScore = Math.max(...domainScores.map(s => parseFloat(s)));
    const minScore = Math.min(...domainScores.map(s => parseFloat(s)));
    const maxIndex = domainScores.findIndex(s => parseFloat(s) === maxScore);
    const minIndex = domainScores.findIndex(s => parseFloat(s) === minScore);
    
    const domainNames = ['Data Orchestration', 'FinOps', 'AI/ML', 'Operations'];
    
    findings.push(`Strongest area: ${domainNames[maxIndex]} (${maxScore}/5.0)`);
    findings.push(`Area needing attention: ${domainNames[minIndex]} (${minScore}/5.0)`);
    
    return findings;
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