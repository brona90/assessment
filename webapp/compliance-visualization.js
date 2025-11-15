// Compliance Framework Visualization for Full Assessment
// Dynamically renders compliance frameworks based on admin selections

class ComplianceVisualization {
    constructor() {
        this.complianceManager = null;
        this.charts = {};
    }

    async initialize() {
        // Initialize ComplianceManager
        this.complianceManager = new ComplianceManager();
        await this.complianceManager.initialize();
        
        // Render compliance frameworks
        this.renderComplianceFrameworks();
        
        // Hide compliance tab if no frameworks enabled
        this.updateComplianceTabVisibility();
    }

    updateComplianceTabVisibility() {
        const enabledFrameworks = this.complianceManager.getEnabledFrameworks();
        const complianceTab = document.querySelector('.nav-tab[onclick*="compliance"]');
        const complianceSection = document.getElementById('compliance');
        
        if (enabledFrameworks.length === 0) {
            // Hide compliance tab and section
            if (complianceTab) complianceTab.style.display = 'none';
            if (complianceSection) complianceSection.style.display = 'none';
        } else {
            // Show compliance tab and section
            if (complianceTab) complianceTab.style.display = 'inline-block';
            if (complianceSection) complianceSection.style.display = 'block';
        }
    }

    renderComplianceFrameworks() {
        const container = document.getElementById('compliance-frameworks-container');
        if (!container) return;

        const enabledFrameworks = this.complianceManager.getEnabledFrameworks();
        
        if (enabledFrameworks.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">No Compliance Frameworks Enabled</h2>
                        <p class="card-subtitle">Enable frameworks in the Admin Panel to see compliance status</p>
                    </div>
                </div>
            `;
            return;
        }

        let html = '';
        
        enabledFrameworks.forEach(framework => {
            const score = this.complianceManager.calculateFrameworkScore(framework.id);
            const status = this.getComplianceStatus(score);
            const statusClass = this.getStatusClass(score);
            
            html += `
                <div class="card">
                    <div class="card-header">
                        <div>
                            <h2 class="card-title">${framework.icon} ${framework.name}</h2>
                            <p class="card-subtitle">${framework.description}</p>
                        </div>
                    </div>
                    <div class="compliance-score-container">
                        <div class="compliance-score-large ${statusClass}">
                            ${score.toFixed(1)}%
                        </div>
                        <div class="compliance-status-badge ${statusClass}">
                            ${status}
                        </div>
                    </div>
                    <div class="chart-container" style="height: 300px;">
                        <canvas id="compliance-chart-${framework.id}"></canvas>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Render charts for each framework
        setTimeout(() => {
            enabledFrameworks.forEach(framework => {
                this.renderFrameworkChart(framework);
            });
        }, 100);
    }

    renderFrameworkChart(framework) {
        const canvasId = `compliance-chart-${framework.id}`;
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts[framework.id]) {
            this.charts[framework.id].destroy();
        }

        // Get mapped questions for this framework
        const mappedQuestions = this.complianceManager.getFrameworkQuestions(framework.id);
        
        // Calculate scores by domain
        const domainScores = this.calculateDomainScores(mappedQuestions);
        
        // Create chart
        this.charts[framework.id] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: domainScores.labels,
                datasets: [{
                    label: 'Compliance Score (%)',
                    data: domainScores.scores,
                    backgroundColor: domainScores.scores.map(score => 
                        score >= framework.threshold ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
                    ),
                    borderColor: domainScores.scores.map(score => 
                        score >= framework.threshold ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'
                    ),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: `Compliance by Domain (Threshold: ${framework.threshold}%)`,
                        font: { size: 14, weight: 'bold' }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Score: ${context.parsed.y.toFixed(1)}%`;
                            }
                        }
                    }
                },
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
                }
            }
        });
    }

    calculateDomainScores(mappedQuestions) {
        const domainScores = {};
        
        // Group questions by domain
        mappedQuestions.forEach(qId => {
            const domain = this.getDomainForQuestion(qId);
            if (!domainScores[domain]) {
                domainScores[domain] = { total: 0, count: 0 };
            }
            
            const answer = assessmentData[qId];
            if (answer !== undefined) {
                domainScores[domain].total += (answer / 5) * 100;
                domainScores[domain].count++;
            }
        });
        
        // Calculate averages
        const labels = [];
        const scores = [];
        
        Object.keys(domainScores).forEach(domain => {
            const data = domainScores[domain];
            if (data.count > 0) {
                labels.push(domain);
                scores.push(data.total / data.count);
            }
        });
        
        return { labels, scores };
    }

    getDomainForQuestion(questionId) {
        if (!questionsData) return 'Unknown';
        
        for (const domainKey in questionsData) {
            const domain = questionsData[domainKey];
            for (const categoryKey in domain.categories) {
                const category = domain.categories[categoryKey];
                const found = category.questions.find(q => q.id === questionId);
                if (found) {
                    return domain.title;
                }
            }
        }
        return 'Unknown';
    }

    getComplianceStatus(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Good';
        if (score >= 70) return 'Fair';
        if (score >= 60) return 'Needs Improvement';
        return 'Critical';
    }

    getStatusClass(score) {
        if (score >= 80) return 'status-good';
        if (score >= 60) return 'status-fair';
        return 'status-critical';
    }

    updateCharts() {
        const enabledFrameworks = this.complianceManager.getEnabledFrameworks();
        enabledFrameworks.forEach(framework => {
            this.renderFrameworkChart(framework);
        });
    }
}

// Global instance
let complianceVisualization = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    complianceVisualization = new ComplianceVisualization();
    await complianceVisualization.initialize();
});