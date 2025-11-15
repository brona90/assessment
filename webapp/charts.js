// Chart Management for Technology Assessment
// Handles initialization and updates of all visualization charts

let chartInstances = {};

// Chart color scheme
const chartColors = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    gray: '#6b7280'
};

// Initialize all charts
function initializeCharts() {
    initOverviewChart();
    initRadarChart();
    initDomainBreakdownChart();
    initSOXComplianceChart();
    initPIIProtectionChart();
    initRoadmapChart();
}

// 1. Domain Overview Chart (Bar Chart)
function initOverviewChart() {
    const ctx = document.getElementById('overviewChart');
    if (!ctx) return;

    if (chartInstances.overview) {
        chartInstances.overview.destroy();
    }

    chartInstances.overview = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Domain 1', 'Domain 2', 'Domain 3', 'Domain 4'],
            datasets: [{
                label: 'Current Maturity',
                data: [0, 0, 0, 0],
                backgroundColor: chartColors.primary,
                borderColor: chartColors.primary,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
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
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

// 2. Maturity Radar Chart
function initRadarChart() {
    const ctx = document.getElementById('radarChart');
    if (!ctx) return;

    if (chartInstances.radar) {
        chartInstances.radar.destroy();
    }

    chartInstances.radar = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Domain 1', 'Domain 2', 'Domain 3', 'Domain 4'],
            datasets: [
                {
                    label: 'Current',
                    data: [0, 0, 0, 0],
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderColor: chartColors.primary,
                    borderWidth: 2,
                    pointBackgroundColor: chartColors.primary,
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: chartColors.primary
                },
                {
                    label: 'Target',
                    data: [4, 4, 4, 4],
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: chartColors.success,
                    borderWidth: 2,
                    pointBackgroundColor: chartColors.success,
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: chartColors.success
                },
                {
                    label: 'Industry Benchmark',
                    data: [3.2, 3.2, 3.2, 3.2],
                    backgroundColor: 'rgba(107, 114, 128, 0.2)',
                    borderColor: chartColors.gray,
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointBackgroundColor: chartColors.gray,
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: chartColors.gray
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
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
                    text: 'Maturity Radar Analysis',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

// 3. Domain Breakdown Chart (Horizontal Bar)
function initDomainBreakdownChart() {
    const ctx = document.getElementById('breakdownChart');
    if (!ctx) return;

    if (chartInstances.breakdown) {
        chartInstances.breakdown.destroy();
    }

    chartInstances.breakdown = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [
                'Domain 1: Data Orchestration (30%)',
                'Domain 2: FinOps (25%)',
                'Domain 3: AI/ML (25%)',
                'Domain 4: Operations (20%)'
            ],
            datasets: [{
                label: 'Weighted Score',
                data: [0, 0, 0, 0],
                backgroundColor: [
                    chartColors.primary,
                    chartColors.secondary,
                    chartColors.info,
                    chartColors.success
                ],
                borderWidth: 0
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
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
                    text: 'Domain Breakdown with Weights',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

// 4. SOX Compliance Chart (Doughnut)
function initSOXComplianceChart() {
    const ctx = document.getElementById('soxChart');
    if (!ctx) return;

    if (chartInstances.sox) {
        chartInstances.sox.destroy();
    }

    chartInstances.sox = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Compliant', 'Needs Improvement'],
            datasets: [{
                data: [85, 15],
                backgroundColor: [
                    chartColors.success,
                    chartColors.warning
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'SOX Compliance Status',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

// 5. PII Protection Chart (Bar)
function initPIIProtectionChart() {
    const ctx = document.getElementById('piiChart');
    if (!ctx) return;

    if (chartInstances.pii) {
        chartInstances.pii.destroy();
    }

    chartInstances.pii = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Customer Data', 'Employee Data', 'Financial Data', 'Health Data'],
            datasets: [{
                label: 'Protection Level (%)',
                data: [95, 92, 88, 76],
                backgroundColor: [
                    chartColors.success,
                    chartColors.success,
                    chartColors.warning,
                    chartColors.danger
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
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
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

// 6. Implementation Roadmap Chart (Stacked Bar)
function initRoadmapChart() {
    const ctx = document.getElementById('roadmapChart');
    if (!ctx) return;

    if (chartInstances.roadmap) {
        chartInstances.roadmap.destroy();
    }

    chartInstances.roadmap = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025', 'Q2 2025'],
            datasets: [
                {
                    label: 'Modernization',
                    data: [3, 5, 4, 3, 2, 1],
                    backgroundColor: chartColors.primary
                },
                {
                    label: 'Agility',
                    data: [2, 3, 4, 5, 3, 2],
                    backgroundColor: chartColors.secondary
                },
                {
                    label: 'Platforms',
                    data: [4, 3, 3, 4, 5, 4],
                    backgroundColor: chartColors.info
                },
                {
                    label: 'Security',
                    data: [2, 2, 3, 3, 4, 5],
                    backgroundColor: chartColors.success
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    beginAtZero: true
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
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

// Update all charts with current assessment data
function updateCharts() {
    if (!questionsData || !assessmentData) return;

    // Calculate domain scores
    const domainScores = calculateDomainScores();
    
    // Update Overview Chart
    if (chartInstances.overview) {
        chartInstances.overview.data.datasets[0].data = domainScores;
        chartInstances.overview.update();
    }

    // Update Radar Chart
    if (chartInstances.radar) {
        chartInstances.radar.data.datasets[0].data = domainScores;
        chartInstances.radar.update();
    }

    // Update Breakdown Chart (show actual scores, not weighted)
    if (chartInstances.breakdown) {
        chartInstances.breakdown.data.datasets[0].data = domainScores.map(s => parseFloat(s));
        chartInstances.breakdown.update();
    }

    // Update score displays
    updateScoreDisplays(domainScores);
}

// Calculate domain scores from assessment data
function calculateDomainScores() {
    const scores = [0, 0, 0, 0];
    const counts = [0, 0, 0, 0];

    if (!questionsData) return scores;

    Object.keys(questionsData).forEach((domainKey, domainIndex) => {
        const domain = questionsData[domainKey];
        
        Object.keys(domain.categories).forEach(categoryKey => {
            const category = domain.categories[categoryKey];
            
            category.questions.forEach(question => {
                if (assessmentData[question.id] !== undefined) {
                    scores[domainIndex] += assessmentData[question.id];
                    counts[domainIndex]++;
                }
            });
        });
    });

    // Calculate averages
    return scores.map((score, idx) => 
        counts[idx] > 0 ? (score / counts[idx]).toFixed(1) : 0
    );
}

// Update score displays in the UI
function updateScoreDisplays(domainScores) {
    // Calculate overall score (weighted average)
    const weights = [0.30, 0.25, 0.25, 0.20];
    const overallScore = domainScores.reduce((sum, score, idx) => 
        sum + (parseFloat(score) * weights[idx]), 0
    ).toFixed(1);

    // Update overall score
    const overallEl = document.getElementById('overallScore');
    if (overallEl) overallEl.textContent = overallScore;

    // Update individual domain scores
    domainScores.forEach((score, idx) => {
        const el = document.getElementById(`domain${idx + 1}Score`);
        if (el) el.textContent = score;
    });
}

// Destroy all charts (cleanup)
function destroyAllCharts() {
    Object.values(chartInstances).forEach(chart => {
        if (chart) chart.destroy();
    });
    chartInstances = {};
}