// Truist Technology Assessment - Interactive Application
// Main JavaScript for handling assessment logic and visualizations

// Global state
let assessmentData = {};
let charts = {};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    generateQuestions();
    initializeCharts();
    loadFromLocalStorage();
    updateScores();
});

// Generate all questions dynamically
function generateQuestions() {
    const container = document.getElementById('questionsContainer');
    let html = '';
    
    Object.keys(assessmentQuestions).forEach(domainKey => {
        const domain = assessmentQuestions[domainKey];
        const domainNumber = domainKey.replace('domain', '');
        
        html += `
            <div class="domain-section">
                <div class="domain-header">
                    <h2 class="domain-title">Domain ${domainNumber}: ${domain.title}</h2>
                    <span class="domain-weight">Weight: ${(domain.weight * 100).toFixed(0)}%</span>
                </div>
                <div class="domain-content">
        `;
        
        domain.sections.forEach(section => {
            html += `<h3 style="color: var(--truist-purple); margin: 20px 0 15px 0; font-size: 1.2rem;">${section.sectionTitle}</h3>`;
            
            section.questions.forEach(question => {
                html += `
                    <div class="question-group">
                        <label class="question-label">${question.title}</label>
                        <p class="question-description">${question.description}</p>
                        <div class="rating-scale">
                `;
                
                maturityLevels.forEach(level => {
                    html += `
                        <div class="rating-option">
                            <input type="radio" id="${question.id}_${level.value}" name="${question.id}" value="${level.value}" onchange="updateScores()">
                            <label for="${question.id}_${level.value}">
                                <span class="rating-value">${level.value}</span>
                                <span class="rating-text">${level.label}</span>
                            </label>
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
            });
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Section Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
    
    // Update charts when switching to visualization sections
    if (sectionId !== 'assessment') {
        updateAllCharts();
    }
}

// Calculate scores for each domain
function calculateDomainScore(domainKey) {
    const domain = assessmentQuestions[domainKey];
    let totalQuestions = 0;
    let totalScore = 0;
    
    domain.sections.forEach(section => {
        section.questions.forEach(question => {
            const selected = document.querySelector(`input[name="${question.id}"]:checked`);
            if (selected) {
                totalScore += parseInt(selected.value);
                totalQuestions++;
            }
        });
    });
    
    return totalQuestions > 0 ? (totalScore / totalQuestions).toFixed(1) : 0;
}

// Calculate overall weighted score
function calculateOverallScore() {
    const d1 = parseFloat(calculateDomainScore('domain1')) || 0;
    const d2 = parseFloat(calculateDomainScore('domain2')) || 0;
    const d3 = parseFloat(calculateDomainScore('domain3')) || 0;
    const d4 = parseFloat(calculateDomainScore('domain4')) || 0;
    
    const weighted = (d1 * assessmentQuestions.domain1.weight) + 
                    (d2 * assessmentQuestions.domain2.weight) + 
                    (d3 * assessmentQuestions.domain3.weight) + 
                    (d4 * assessmentQuestions.domain4.weight);
    
    return weighted.toFixed(1);
}

// Count total questions
function getTotalQuestions() {
    let total = 0;
    Object.keys(assessmentQuestions).forEach(domainKey => {
        assessmentQuestions[domainKey].sections.forEach(section => {
            total += section.questions.length;
        });
    });
    return total;
}

// Update all scores and progress
function updateScores() {
    // Calculate domain scores
    const d1Score = calculateDomainScore('domain1');
    const d2Score = calculateDomainScore('domain2');
    const d3Score = calculateDomainScore('domain3');
    const d4Score = calculateDomainScore('domain4');
    const overallScore = calculateOverallScore();
    
    // Update score displays
    document.getElementById('domain1Score').textContent = d1Score;
    document.getElementById('domain2Score').textContent = d2Score;
    document.getElementById('domain3Score').textContent = d3Score;
    document.getElementById('domain4Score').textContent = d4Score;
    document.getElementById('overallScore').textContent = overallScore;
    
    // Update progress bar
    const totalQuestions = getTotalQuestions();
    const answeredQuestions = document.querySelectorAll('input[type="radio"]:checked').length;
    const progressPercentage = Math.round((answeredQuestions / totalQuestions) * 100);
    
    document.getElementById('progressBar').style.width = progressPercentage + '%';
    document.getElementById('progressPercentage').textContent = progressPercentage + '%';
    document.getElementById('progressText').textContent = `${answeredQuestions}/${totalQuestions} Questions`;
    
    // Store data
    storeAssessmentData();
    
    // Update charts if not on assessment page
    const activeSection = document.querySelector('.content-section.active');
    if (activeSection && activeSection.id !== 'assessment') {
        updateAllCharts();
    }
}

// Store assessment data
function storeAssessmentData() {
    const data = {};
    
    // Collect all answers
    document.querySelectorAll('input[type="radio"]:checked').forEach(input => {
        data[input.name] = input.value;
    });
    
    assessmentData = data;
}

// Initialize all charts
function initializeCharts() {
    // Overview Chart
    const overviewCtx = document.getElementById('overviewChart');
    if (overviewCtx) {
        charts.overview = new Chart(overviewCtx, {
            type: 'bar',
            data: {
                labels: ['Domain 1: Data Orchestration', 'Domain 2: FinOps', 'Domain 3: AI/ML', 'Domain 4: Operations'],
                datasets: [{
                    label: 'Current Score',
                    data: [0, 0, 0, 0],
                    backgroundColor: 'rgba(75, 0, 130, 0.8)',
                    borderColor: 'rgba(75, 0, 130, 1)',
                    borderWidth: 2
                }, {
                    label: 'Target Score',
                    data: [4.0, 4.0, 4.0, 4.0],
                    backgroundColor: 'rgba(0, 102, 204, 0.5)',
                    borderColor: 'rgba(0, 102, 204, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Domain Maturity Overview',
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                    }
                }
            }
        });
    }
    
    // Radar Chart
    const radarCtx = document.getElementById('radarChart');
    if (radarCtx) {
        charts.radar = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['Data Orchestration', 'FinOps & Data Mgmt', 'AI/ML Capabilities', 'Operations Alignment'],
                datasets: [{
                    label: 'Current State',
                    data: [0, 0, 0, 0],
                    backgroundColor: 'rgba(75, 0, 130, 0.2)',
                    borderColor: 'rgba(75, 0, 130, 1)',
                    borderWidth: 3,
                    pointBackgroundColor: 'rgba(75, 0, 130, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(75, 0, 130, 1)'
                }, {
                    label: 'Target State',
                    data: [4.0, 4.0, 4.0, 4.0],
                    backgroundColor: 'rgba(0, 102, 204, 0.2)',
                    borderColor: 'rgba(0, 102, 204, 1)',
                    borderWidth: 3,
                    pointBackgroundColor: 'rgba(0, 102, 204, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(0, 102, 204, 1)'
                }, {
                    label: 'Industry Benchmark',
                    data: [3.2, 3.0, 2.8, 3.5],
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointBackgroundColor: 'rgba(40, 167, 69, 1)',
                    pointBorderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Technology Maturity Radar',
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                    }
                }
            }
        });
    }
    
    // Domain Breakdown Chart
    const domainCtx = document.getElementById('domainChart');
    if (domainCtx) {
        charts.domain = new Chart(domainCtx, {
            type: 'bar',
            data: {
                labels: ['Domain 1 (30%)', 'Domain 2 (25%)', 'Domain 3 (25%)', 'Domain 4 (20%)'],
                datasets: [{
                    label: 'Maturity Score',
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(75, 0, 130, 0.8)',
                        'rgba(0, 102, 204, 0.8)',
                        'rgba(40, 167, 69, 0.8)',
                        'rgba(255, 165, 0, 0.8)'
                    ],
                    borderColor: [
                        'rgba(75, 0, 130, 1)',
                        'rgba(0, 102, 204, 1)',
                        'rgba(40, 167, 69, 1)',
                        'rgba(255, 165, 0, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Domain Scores with Weights',
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                    }
                }
            }
        });
    }
    
    // SOX Compliance Chart
    const soxCtx = document.getElementById('soxChart');
    if (soxCtx) {
        charts.sox = new Chart(soxCtx, {
            type: 'doughnut',
            data: {
                labels: ['Access Controls', 'Change Management', 'Data Integrity', 'ITGC'],
                datasets: [{
                    data: [85, 78, 73, 88],
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.8)',
                        'rgba(255, 193, 7, 0.8)',
                        'rgba(220, 53, 69, 0.8)',
                        'rgba(0, 102, 204, 0.8)'
                    ],
                    borderColor: [
                        'rgba(40, 167, 69, 1)',
                        'rgba(255, 193, 7, 1)',
                        'rgba(220, 53, 69, 1)',
                        'rgba(0, 102, 204, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right'
                    },
                    title: {
                        display: true,
                        text: 'SOX Compliance Status (%)',
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                    }
                }
            }
        });
    }
    
    // PII Protection Chart
    const piiCtx = document.getElementById('piiChart');
    if (piiCtx) {
        charts.pii = new Chart(piiCtx, {
            type: 'bar',
            data: {
                labels: ['Financial Data', 'Personal Info', 'Health Data', 'Account Data'],
                datasets: [{
                    label: 'Protection Level (%)',
                    data: [92, 88, 76, 95],
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.8)',
                        'rgba(40, 167, 69, 0.8)',
                        'rgba(220, 53, 69, 0.8)',
                        'rgba(40, 167, 69, 0.8)'
                    ],
                    borderColor: [
                        'rgba(40, 167, 69, 1)',
                        'rgba(40, 167, 69, 1)',
                        'rgba(220, 53, 69, 1)',
                        'rgba(40, 167, 69, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'PII Protection by Data Category',
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                    }
                }
            }
        });
    }
    
    // Roadmap Chart
    const roadmapCtx = document.getElementById('roadmapChart');
    if (roadmapCtx) {
        charts.roadmap = new Chart(roadmapCtx, {
            type: 'bar',
            data: {
                labels: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026'],
                datasets: [{
                    label: 'Modernization',
                    data: [3, 2, 2, 1, 1, 0],
                    backgroundColor: 'rgba(75, 0, 130, 0.8)',
                    borderColor: 'rgba(75, 0, 130, 1)',
                    borderWidth: 2
                }, {
                    label: 'Agility',
                    data: [2, 3, 2, 2, 1, 1],
                    backgroundColor: 'rgba(0, 102, 204, 0.8)',
                    borderColor: 'rgba(0, 102, 204, 1)',
                    borderWidth: 2
                }, {
                    label: 'Platforms',
                    data: [2, 2, 3, 2, 2, 1],
                    backgroundColor: 'rgba(40, 167, 69, 0.8)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 2
                }, {
                    label: 'Security',
                    data: [3, 2, 1, 2, 1, 1],
                    backgroundColor: 'rgba(220, 53, 69, 0.8)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: '18-Month Implementation Roadmap (MAPS)',
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                    }
                }
            }
        });
    }
}

// Update all charts with current data
function updateAllCharts() {
    const d1 = parseFloat(calculateDomainScore('domain1')) || 0;
    const d2 = parseFloat(calculateDomainScore('domain2')) || 0;
    const d3 = parseFloat(calculateDomainScore('domain3')) || 0;
    const d4 = parseFloat(calculateDomainScore('domain4')) || 0;
    
    // Update overview chart
    if (charts.overview) {
        charts.overview.data.datasets[0].data = [d1, d2, d3, d4];
        charts.overview.update();
    }
    
    // Update radar chart
    if (charts.radar) {
        charts.radar.data.datasets[0].data = [d1, d2, d3, d4];
        charts.radar.update();
    }
    
    // Update domain chart
    if (charts.domain) {
        charts.domain.data.datasets[0].data = [d1, d2, d3, d4];
        charts.domain.update();
    }
    
    // Update recommendations
    updateRecommendations();
}

// Generate recommendations based on scores
function updateRecommendations() {
    const d1 = parseFloat(calculateDomainScore('domain1')) || 0;
    const d2 = parseFloat(calculateDomainScore('domain2')) || 0;
    const d3 = parseFloat(calculateDomainScore('domain3')) || 0;
    const d4 = parseFloat(calculateDomainScore('domain4')) || 0;
    
    const recommendations = [];
    
    // Generate recommendations based on scores
    if (d1 < 3.0) {
        recommendations.push({
            priority: 'High',
            domain: 'Data Orchestration & Observability',
            action: 'Implement automated data pipeline orchestration and comprehensive monitoring',
            timeline: 'Q1-Q2 2025',
            category: 'Platforms'
        });
    }
    
    if (d2 < 3.0) {
        recommendations.push({
            priority: 'High',
            domain: 'FinOps & Data Management',
            action: 'Establish cloud cost optimization framework and data governance controls',
            timeline: 'Q1-Q2 2025',
            category: 'Modernization'
        });
    }
    
    if (d3 < 3.0) {
        recommendations.push({
            priority: 'Critical',
            domain: 'AI/ML Capabilities',
            action: 'Develop MLOps platform and implement self-healing automation',
            timeline: 'Q2-Q4 2025',
            category: 'Agility'
        });
    }
    
    if (d4 < 3.0) {
        recommendations.push({
            priority: 'Medium',
            domain: 'Operations Alignment',
            action: 'Standardize tooling and improve cross-team collaboration',
            timeline: 'Q2-Q3 2025',
            category: 'Platforms'
        });
    }
    
    // Always add security recommendation
    recommendations.push({
        priority: 'High',
        domain: 'Security & Compliance',
        action: 'Address SOX compliance gaps and enhance PII protection for Health Data',
        timeline: 'Q1 2025',
        category: 'Security'
    });
    
    // Render recommendations
    const container = document.getElementById('recommendationsContent');
    if (container) {
        let html = '<div class="recommendations-list">';
        
        recommendations.forEach((rec, index) => {
            const priorityColor = rec.priority === 'Critical' ? '#DC3545' : 
                                 rec.priority === 'High' ? '#FFA500' : '#28A745';
            
            html += `
                <div class="question-group" style="border-left-color: ${priorityColor}">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div>
                            <span style="background: ${priorityColor}; color: white; padding: 4px 12px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">
                                ${rec.priority} Priority
                            </span>
                            <span style="background: var(--truist-light-blue); color: var(--truist-blue); padding: 4px 12px; border-radius: 4px; font-size: 0.85rem; font-weight: 600; margin-left: 10px;">
                                ${rec.category}
                            </span>
                        </div>
                        <span style="color: var(--truist-gray); font-size: 0.9rem;">
                            ${rec.timeline}
                        </span>
                    </div>
                    <h3 style="color: var(--truist-purple); margin: 10px 0; font-size: 1.1rem;">
                        ${rec.domain}
                    </h3>
                    <p style="color: var(--truist-dark); margin: 0; line-height: 1.6;">
                        ${rec.action}
                    </p>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
}

// Save assessment to localStorage
function saveAssessment() {
    try {
        localStorage.setItem('truistAssessment', JSON.stringify(assessmentData));
        alert('✅ Assessment saved successfully!');
    } catch (e) {
        alert('❌ Error saving assessment: ' + e.message);
    }
}

// Load assessment from localStorage
function loadAssessment() {
    try {
        const saved = localStorage.getItem('truistAssessment');
        if (saved) {
            const data = JSON.parse(saved);
            
            // Restore radio button selections
            Object.keys(data).forEach(questionName => {
                const radio = document.querySelector(`input[name="${questionName}"][value="${data[questionName]}"]`);
                if (radio) {
                    radio.checked = true;
                }
            });
            
            updateScores();
            alert('✅ Assessment loaded successfully!');
        } else {
            alert('ℹ️ No saved assessment found.');
        }
    } catch (e) {
        alert('❌ Error loading assessment: ' + e.message);
    }
}

// Load from localStorage on page load
function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('truistAssessment');
        if (saved) {
            const data = JSON.parse(saved);
            
            // Restore radio button selections
            Object.keys(data).forEach(questionName => {
                const radio = document.querySelector(`input[name="${questionName}"][value="${data[questionName]}"]`);
                if (radio) {
                    radio.checked = true;
                }
            });
        }
    } catch (e) {
        console.error('Error loading from localStorage:', e);
    }
}

// Export to PDF with comprehensive report including charts
async function exportPDF() {
    const answeredQuestions = document.querySelectorAll('input[type="radio"]:checked').length;
    const totalQuestions = getTotalQuestions();
    
    if (answeredQuestions < totalQuestions) {
        const proceed = confirm(`⚠️ You have only answered ${answeredQuestions} out of ${totalQuestions} questions.\n\nDo you want to generate a partial report?`);
        if (!proceed) return;
    }
    
    alert('📄 Generating comprehensive PDF report with charts... This may take a moment.');
    
    // First, ensure we're on a section with charts visible
    const currentSection = document.querySelector('.content-section.active');
    const currentSectionId = currentSection ? currentSection.id : 'assessment';
    
    // Temporarily switch to dashboard to ensure charts are rendered
    if (currentSectionId === 'assessment') {
        showSection('dashboard');
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for charts to render
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const d1 = parseFloat(calculateDomainScore('domain1')) || 0;
        const d2 = parseFloat(calculateDomainScore('domain2')) || 0;
        const d3 = parseFloat(calculateDomainScore('domain3')) || 0;
        const d4 = parseFloat(calculateDomainScore('domain4')) || 0;
        const overall = parseFloat(calculateOverallScore()) || 0;
        
        let yPos = 20;
        
        // ========== PAGE 1: TITLE & EXECUTIVE SUMMARY ==========
        pdf.setFillColor(75, 0, 130);
        pdf.rect(0, 0, 210, 50, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(28);
        pdf.setFont(undefined, 'bold');
        pdf.text('Truist Technology Assessment', 105, 25, { align: 'center' });
        
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'normal');
        pdf.text('Comprehensive Maturity Analysis Report', 105, 35, { align: 'center' });
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.text('Assessment Date: ' + new Date().toLocaleDateString(), 105, 60, { align: 'center' });
        pdf.text('Generated by: Cognizant Consulting', 105, 67, { align: 'center' });
        
        // Executive Summary Box
        yPos = 80;
        pdf.setFillColor(230, 242, 255);
        pdf.roundedRect(15, yPos, 180, 45, 3, 3, 'F');
        
        pdf.setFontSize(16);
        pdf.setTextColor(75, 0, 130);
        pdf.setFont(undefined, 'bold');
        pdf.text('Executive Summary', 20, yPos + 10);
        
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Overall Maturity Score: ${overall} / 5.0`, 20, yPos + 20);
        pdf.text(`Assessment Completion: ${Math.round((answeredQuestions/totalQuestions)*100)}%`, 20, yPos + 28);
        pdf.text(`Questions Answered: ${answeredQuestions} of ${totalQuestions}`, 20, yPos + 36);
        
        // Score interpretation
        yPos = 135;
        pdf.setFontSize(12);
        pdf.setTextColor(75, 0, 130);
        pdf.setFont(undefined, 'bold');
        pdf.text('Maturity Level Interpretation:', 20, yPos);
        
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont(undefined, 'normal');
        
        let interpretation = '';
        let color = [0, 0, 0];
        if (overall >= 4.1) {
            interpretation = 'Industry Leading - Best-in-class capabilities';
            color = [40, 167, 69];
        } else if (overall >= 3.1) {
            interpretation = 'Meeting Standards - Good progress, on track';
            color = [0, 102, 204];
        } else if (overall >= 2.1) {
            interpretation = 'Below Average - Significant improvement needed';
            color = [255, 165, 0];
        } else {
            interpretation = 'Critical Gaps - Immediate action required';
            color = [220, 53, 69];
        }
        
        pdf.setTextColor(color[0], color[1], color[2]);
        pdf.setFont(undefined, 'bold');
        pdf.text(`Status: ${interpretation}`, 20, yPos + 10);
        
        // Domain Scores Summary
        yPos = 155;
        pdf.setTextColor(0, 0, 0);
        pdf.setFont(undefined, 'bold');
        pdf.setFontSize(12);
        pdf.text('Domain Scores Summary:', 20, yPos);
        
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(10);
        
        const domains = [
            { name: 'Data Orchestration & Platform Observability', score: d1, weight: '30%' },
            { name: 'FinOps & Data Management', score: d2, weight: '25%' },
            { name: 'Autonomous Capabilities (AI/ML)', score: d3, weight: '25%' },
            { name: 'Operations & Platform Team Alignment', score: d4, weight: '20%' }
        ];
        
        yPos += 10;
        domains.forEach((domain, index) => {
            const scoreColor = domain.score >= 4 ? [40, 167, 69] : 
                             domain.score >= 3 ? [0, 102, 204] : 
                             domain.score >= 2 ? [255, 165, 0] : [220, 53, 69];
            
            pdf.setTextColor(0, 0, 0);
            pdf.text(`${index + 1}. ${domain.name}`, 25, yPos);
            pdf.text(`(Weight: ${domain.weight})`, 25, yPos + 5);
            
            pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
            pdf.setFont(undefined, 'bold');
            pdf.text(`${domain.score.toFixed(1)} / 5.0`, 170, yPos + 2.5);
            pdf.setFont(undefined, 'normal');
            
            yPos += 15;
        });
        
        // Footer
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text('Confidential - Truist Bank Technology Assessment', 105, 285, { align: 'center' });
        pdf.text('Page 1', 105, 290, { align: 'center' });
        
        // ========== PAGE 2: CHARTS &amp; VISUALIZATIONS ==========
        pdf.addPage();
        yPos = 20;
        
        pdf.setFontSize(18);
        pdf.setTextColor(75, 0, 130);
        pdf.setFont(undefined, 'bold');
        pdf.text('Visual Analysis', 20, yPos);
        
        yPos += 10;
        
        // Capture and add Overview Chart
        try {
            const overviewCanvas = document.getElementById('overviewChart');
            if (overviewCanvas) {
                const overviewImg = overviewCanvas.toDataURL('image/png');
                pdf.setFontSize(12);
                pdf.setTextColor(75, 0, 130);
                pdf.text('Domain Maturity Overview', 20, yPos);
                yPos += 5;
                pdf.addImage(overviewImg, 'PNG', 20, yPos, 170, 85);
                yPos += 90;
            }
        } catch (e) {
            console.error('Error adding overview chart:', e);
        }
        
        // Capture and add Radar Chart
        try {
            const radarCanvas = document.getElementById('radarChart');
            if (radarCanvas) {
                if (yPos > 200) {
                    pdf.addPage();
                    yPos = 20;
                }
                pdf.setFontSize(12);
                pdf.setTextColor(75, 0, 130);
                pdf.text('Maturity Radar Analysis', 20, yPos);
                yPos += 5;
                const radarImg = radarCanvas.toDataURL('image/png');
                pdf.addImage(radarImg, 'PNG', 20, yPos, 170, 85);
                yPos += 90;
            }
        } catch (e) {
            console.error('Error adding radar chart:', e);
        }
        
        // Footer
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text('Confidential - Truist Bank Technology Assessment', 105, 285, { align: 'center' });
        pdf.text('Page 2', 105, 290, { align: 'center' });
        
        // ========== PAGE 3: MORE CHARTS ==========
        pdf.addPage();
        yPos = 20;
        
        pdf.setFontSize(18);
        pdf.setTextColor(75, 0, 130);
        pdf.setFont(undefined, 'bold');
        pdf.text('Compliance &amp; Roadmap', 20, yPos);
        
        yPos += 10;
        
        // Capture and add SOX Compliance Chart
        try {
            const soxCanvas = document.getElementById('soxChart');
            if (soxCanvas) {
                pdf.setFontSize(12);
                pdf.setTextColor(75, 0, 130);
                pdf.text('SOX Compliance Status', 20, yPos);
                yPos += 5;
                const soxImg = soxCanvas.toDataURL('image/png');
                pdf.addImage(soxImg, 'PNG', 20, yPos, 170, 85);
                yPos += 90;
            }
        } catch (e) {
            console.error('Error adding SOX chart:', e);
        }
        
        // Capture and add PII Protection Chart
        try {
            const piiCanvas = document.getElementById('piiChart');
            if (piiCanvas) {
                if (yPos > 200) {
                    pdf.addPage();
                    yPos = 20;
                }
                pdf.setFontSize(12);
                pdf.setTextColor(75, 0, 130);
                pdf.text('PII Protection Status', 20, yPos);
                yPos += 5;
                const piiImg = piiCanvas.toDataURL('image/png');
                pdf.addImage(piiImg, 'PNG', 20, yPos, 170, 85);
                yPos += 90;
            }
        } catch (e) {
            console.error('Error adding PII chart:', e);
        }
        
        // Footer
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text('Confidential - Truist Bank Technology Assessment', 105, 285, { align: 'center' });
        pdf.text('Page 3', 105, 290, { align: 'center' });
        
        // ========== PAGE 4: DETAILED DOMAIN ANALYSIS ==========
        pdf.addPage();
        yPos = 20;
        
        pdf.setFontSize(18);
        pdf.setTextColor(75, 0, 130);
        pdf.setFont(undefined, 'bold');
        pdf.text('Detailed Domain Analysis', 20, yPos);
        
        yPos += 15;
        
        // Analyze each domain
        Object.keys(assessmentQuestions).forEach((domainKey, domainIndex) => {
            const domain = assessmentQuestions[domainKey];
            const domainScore = parseFloat(calculateDomainScore(domainKey)) || 0;
            const domainNumber = domainKey.replace('domain', '');
            
            if (yPos > 250) {
                pdf.addPage();
                yPos = 20;
            }
            
            // Domain header
            pdf.setFillColor(75, 0, 130);
            pdf.rect(15, yPos - 5, 180, 10, 'F');
            
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text(`Domain ${domainNumber}: ${domain.title}`, 20, yPos + 2);
            
            yPos += 12;
            
            // Domain score and weight
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(10);
            pdf.setFont(undefined, 'normal');
            pdf.text(`Score: ${domainScore.toFixed(1)} / 5.0`, 20, yPos);
            pdf.text(`Weight: ${(domain.weight * 100).toFixed(0)}%`, 80, yPos);
            
            yPos += 8;
            
            // Section breakdown
            domain.sections.forEach(section => {
                if (yPos > 260) {
                    pdf.addPage();
                    yPos = 20;
                }
                
                pdf.setFont(undefined, 'bold');
                pdf.setFontSize(10);
                pdf.text(`• ${section.sectionTitle}`, 25, yPos);
                yPos += 6;
                
                pdf.setFont(undefined, 'normal');
                pdf.setFontSize(9);
                
                section.questions.forEach(question => {
                    const selected = document.querySelector(`input[name="${question.id}"]:checked`);
                    const score = selected ? selected.value : 'N/A';
                    const scoreText = selected ? maturityLevels[parseInt(score) - 1].label : 'Not Answered';
                    
                    if (yPos > 270) {
                        pdf.addPage();
                        yPos = 20;
                    }
                    
                    pdf.text(`  - ${question.title}: ${score} (${scoreText})`, 30, yPos);
                    yPos += 5;
                });
                
                yPos += 3;
            });
            
            yPos += 5;
        });
        
        // Footer
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text('Confidential - Truist Bank Technology Assessment', 105, 285, { align: 'center' });
        pdf.text('Page 4', 105, 290, { align: 'center' });
        
        // ========== PAGE 5: GAP ANALYSIS & RECOMMENDATIONS ==========
        pdf.addPage();
        yPos = 20;
        
        pdf.setFontSize(18);
        pdf.setTextColor(75, 0, 130);
        pdf.setFont(undefined, 'bold');
        pdf.text('Gap Analysis & Recommendations', 20, yPos);
        
        yPos += 15;
        
        // Gap Analysis
        pdf.setFontSize(14);
        pdf.text('Maturity Gaps', 20, yPos);
        yPos += 10;
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        
        const gaps = [
            { domain: 'Domain 1', current: d1, target: 4.0, gap: (4.0 - d1).toFixed(1) },
            { domain: 'Domain 2', current: d2, target: 4.0, gap: (4.0 - d2).toFixed(1) },
            { domain: 'Domain 3', current: d3, target: 4.0, gap: (4.0 - d3).toFixed(1) },
            { domain: 'Domain 4', current: d4, target: 4.0, gap: (4.0 - d4).toFixed(1) }
        ];
        
        gaps.sort((a, b) => parseFloat(b.gap) - parseFloat(a.gap));
        
        pdf.text('Priority Areas (Largest Gaps):', 20, yPos);
        yPos += 8;
        
        gaps.forEach((gap, index) => {
            const gapColor = parseFloat(gap.gap) > 1.5 ? [220, 53, 69] : 
                           parseFloat(gap.gap) > 0.8 ? [255, 165, 0] : [40, 167, 69];
            
            pdf.setTextColor(0, 0, 0);
            pdf.text(`${index + 1}. ${gap.domain}:`, 25, yPos);
            pdf.text(`Current: ${gap.current.toFixed(1)}`, 80, yPos);
            pdf.text(`Target: ${gap.target.toFixed(1)}`, 120, yPos);
            
            pdf.setTextColor(gapColor[0], gapColor[1], gapColor[2]);
            pdf.setFont(undefined, 'bold');
            pdf.text(`Gap: ${gap.gap}`, 160, yPos);
            pdf.setFont(undefined, 'normal');
            
            yPos += 7;
        });
        
        yPos += 10;
        
        // Recommendations
        pdf.setTextColor(75, 0, 130);
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('Priority Recommendations', 20, yPos);
        
        yPos += 10;
        
        const recommendations = [];
        
        if (d1 < 3.0) {
            recommendations.push({
                priority: 'High',
                title: 'Data Orchestration & Observability',
                action: 'Implement automated data pipeline orchestration and comprehensive monitoring',
                timeline: 'Q1-Q2 2025'
            });
        }
        
        if (d2 < 3.0) {
            recommendations.push({
                priority: 'High',
                title: 'FinOps & Data Management',
                action: 'Establish cloud cost optimization framework and data governance controls',
                timeline: 'Q1-Q2 2025'
            });
        }
        
        if (d3 < 3.0) {
            recommendations.push({
                priority: 'Critical',
                title: 'AI/ML Capabilities',
                action: 'Develop MLOps platform and implement self-healing automation',
                timeline: 'Q2-Q4 2025'
            });
        }
        
        if (d4 < 3.0) {
            recommendations.push({
                priority: 'Medium',
                title: 'Operations Alignment',
                action: 'Standardize tooling and improve cross-team collaboration',
                timeline: 'Q2-Q3 2025'
            });
        }
        
        recommendations.push({
            priority: 'High',
            title: 'Security & Compliance',
            action: 'Address SOX compliance gaps and enhance PII protection',
            timeline: 'Q1 2025'
        });
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        
        recommendations.forEach((rec, index) => {
            if (yPos > 250) {
                pdf.addPage();
                yPos = 20;
            }
            
            const priorityColor = rec.priority === 'Critical' ? [220, 53, 69] : 
                                rec.priority === 'High' ? [255, 165, 0] : [40, 167, 69];
            
            pdf.setFillColor(245, 245, 245);
            pdf.roundedRect(20, yPos - 3, 170, 25, 2, 2, 'F');
            
            pdf.setTextColor(priorityColor[0], priorityColor[1], priorityColor[2]);
            pdf.setFont(undefined, 'bold');
            pdf.text(`${rec.priority} Priority`, 25, yPos + 3);
            
            pdf.setTextColor(0, 0, 0);
            pdf.text(`Timeline: ${rec.timeline}`, 150, yPos + 3);
            
            pdf.setFont(undefined, 'bold');
            pdf.text(rec.title, 25, yPos + 10);
            
            pdf.setFont(undefined, 'normal');
            pdf.setFontSize(9);
            const actionLines = pdf.splitTextToSize(rec.action, 160);
            pdf.text(actionLines, 25, yPos + 16);
            
            pdf.setFontSize(10);
            yPos += 30;
        });
        
        // Footer
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text('Confidential - Truist Bank Technology Assessment', 105, 285, { align: 'center' });
        pdf.text('Page 5', 105, 290, { align: 'center' });
        
        // ========== PAGE 6: BENCHMARKING & NEXT STEPS ==========
        pdf.addPage();
        yPos = 20;
        
        pdf.setFontSize(18);
        pdf.setTextColor(75, 0, 130);
        pdf.setFont(undefined, 'bold');
        pdf.text('Industry Benchmarking', 20, yPos);
        
        yPos += 15;
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(0, 0, 0);
        
        const benchmarks = [
            { domain: 'Data Orchestration', current: d1, industry: 3.2, target: 4.0 },
            { domain: 'FinOps & Data Mgmt', current: d2, industry: 3.0, target: 4.0 },
            { domain: 'AI/ML Capabilities', current: d3, industry: 2.8, target: 4.0 },
            { domain: 'Operations Alignment', current: d4, industry: 3.5, target: 4.0 }
        ];
        
        pdf.text('Comparison with Financial Services Industry:', 20, yPos);
        yPos += 10;
        
        benchmarks.forEach(bench => {
            pdf.text(`${bench.domain}:`, 25, yPos);
            pdf.text(`Your Score: ${bench.current.toFixed(1)}`, 80, yPos);
            pdf.text(`Industry Avg: ${bench.industry.toFixed(1)}`, 130, yPos);
            
            const diff = bench.current - bench.industry;
            const diffColor = diff >= 0 ? [40, 167, 69] : [220, 53, 69];
            pdf.setTextColor(diffColor[0], diffColor[1], diffColor[2]);
            pdf.text(`(${diff >= 0 ? '+' : ''}${diff.toFixed(1)})`, 175, yPos);
            pdf.setTextColor(0, 0, 0);
            
            yPos += 8;
        });
        
        yPos += 15;
        
        // Next Steps
        pdf.setFontSize(14);
        pdf.setTextColor(75, 0, 130);
        pdf.setFont(undefined, 'bold');
        pdf.text('Recommended Next Steps', 20, yPos);
        
        yPos += 10;
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(0, 0, 0);
        
        const nextSteps = [
            'Review this assessment with leadership and key stakeholders',
            'Prioritize initiatives based on gap analysis and business impact',
            'Develop detailed implementation roadmap with timelines and resources',
            'Establish governance framework for tracking progress',
            'Schedule quarterly reassessments to measure improvement',
            'Allocate budget and resources for priority initiatives',
            'Engage Cognizant Consulting for implementation support'
        ];
        
        nextSteps.forEach((step, index) => {
            pdf.text(`${index + 1}. ${step}`, 25, yPos);
            yPos += 8;
        });
        
        yPos += 15;
        
        // Contact Information
        pdf.setFillColor(230, 242, 255);
        pdf.roundedRect(15, yPos, 180, 35, 3, 3, 'F');
        
        pdf.setFontSize(12);
        pdf.setTextColor(75, 0, 130);
        pdf.setFont(undefined, 'bold');
        pdf.text('Contact Information', 20, yPos + 8);
        
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont(undefined, 'normal');
        pdf.text('For questions or support with this assessment:', 20, yPos + 16);
        pdf.text('Cognizant Consulting - Technology Assessment Team', 20, yPos + 23);
        pdf.text('Framework Lead: [Contact Information]', 20, yPos + 30);
        
        // Footer
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text('Confidential - Truist Bank Technology Assessment', 105, 285, { align: 'center' });
        pdf.text('Page 6', 105, 290, { align: 'center' });
        
        // Save PDF
        pdf.save(`Truist-Assessment-Report-${new Date().toISOString().split('T')[0]}.pdf`);
        
        // Return to original section
        if (currentSectionId === 'assessment') {
            showSection('assessment');
        }
        
        alert('✅ Comprehensive PDF report with charts generated successfully!');
        
    } catch (e) {
        console.error('PDF generation error:', e);
        alert('❌ Error generating PDF: ' + e.message);
        
        // Return to original section on error
        if (currentSectionId === 'assessment') {
            showSection('assessment');
        }
    }
}