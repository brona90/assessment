// Compliance Management System
// Handles compliance framework configuration and calculations

class ComplianceManager {
    constructor() {
        this.frameworks = {};
        this.loaded = false;
    }

    // Load compliance configuration
    async loadCompliance() {
        try {
            const response = await fetch('data/compliance.json');
            const data = await response.json();
            this.frameworks = data.frameworks;
            this.loaded = true;
            return this.frameworks;
        } catch (error) {
            console.error('Error loading compliance data:', error);
            return {};
        }
    }

    // Get all frameworks
    getFrameworks() {
        return this.frameworks;
    }

    // Get enabled frameworks only
    getEnabledFrameworks() {
        return Object.values(this.frameworks).filter(fw => fw.enabled);
    }

    // Get framework by ID
    getFramework(id) {
        return this.frameworks[id];
    }

    // Enable/disable framework
    toggleFramework(id, enabled) {
        if (this.frameworks[id]) {
            this.frameworks[id].enabled = enabled;
            this.saveCompliance();
        }
    }

    // Add question to framework
    addQuestionToFramework(frameworkId, questionId) {
        if (this.frameworks[frameworkId]) {
            if (!this.frameworks[frameworkId].mappedQuestions.includes(questionId)) {
                this.frameworks[frameworkId].mappedQuestions.push(questionId);
                this.saveCompliance();
            }
        }
    }

    // Remove question from framework
    removeQuestionFromFramework(frameworkId, questionId) {
        if (this.frameworks[frameworkId]) {
            const index = this.frameworks[frameworkId].mappedQuestions.indexOf(questionId);
            if (index > -1) {
                this.frameworks[frameworkId].mappedQuestions.splice(index, 1);
                this.saveCompliance();
            }
        }
    }

    // Update framework threshold
    updateThreshold(frameworkId, threshold) {
        if (this.frameworks[frameworkId]) {
            this.frameworks[frameworkId].threshold = parseFloat(threshold);
            this.saveCompliance();
        }
    }

    // Calculate compliance score for a framework
    calculateComplianceScore(frameworkId, assessmentData) {
        const framework = this.frameworks[frameworkId];
        if (!framework || !framework.enabled || framework.mappedQuestions.length === 0) {
            return null;
        }

        let totalScore = 0;
        let answeredCount = 0;

        framework.mappedQuestions.forEach(questionId => {
            if (assessmentData[questionId] !== undefined) {
                totalScore += assessmentData[questionId];
                answeredCount++;
            }
        });

        if (answeredCount === 0) return null;

        const averageScore = totalScore / answeredCount;
        const percentage = (averageScore / 5) * 100;
        const isCompliant = averageScore >= framework.threshold;

        return {
            score: averageScore.toFixed(2),
            percentage: percentage.toFixed(1),
            isCompliant: isCompliant,
            answeredQuestions: answeredCount,
            totalQuestions: framework.mappedQuestions.length,
            threshold: framework.threshold,
            gap: Math.max(0, framework.threshold - averageScore).toFixed(2)
        };
    }

    // Calculate all compliance scores
    calculateAllCompliance(assessmentData) {
        const results = {};
        
        Object.keys(this.frameworks).forEach(frameworkId => {
            const score = this.calculateComplianceScore(frameworkId, assessmentData);
            if (score !== null) {
                results[frameworkId] = {
                    ...this.frameworks[frameworkId],
                    ...score
                };
            }
        });

        return results;
    }

    // Get compliance status summary
    getComplianceSummary(assessmentData) {
        const enabledFrameworks = this.getEnabledFrameworks();
        const results = this.calculateAllCompliance(assessmentData);
        
        let compliantCount = 0;
        let nonCompliantCount = 0;
        let totalFrameworks = 0;

        Object.values(results).forEach(result => {
            totalFrameworks++;
            if (result.isCompliant) {
                compliantCount++;
            } else {
                nonCompliantCount++;
            }
        });

        return {
            total: totalFrameworks,
            compliant: compliantCount,
            nonCompliant: nonCompliantCount,
            complianceRate: totalFrameworks > 0 ? ((compliantCount / totalFrameworks) * 100).toFixed(1) : 0,
            results: results
        };
    }

    // Save compliance configuration to localStorage
    saveCompliance() {
        try {
            const data = {
                frameworks: this.frameworks,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('complianceConfig', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving compliance config:', error);
        }
    }

    // Load compliance configuration from localStorage
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('complianceConfig');
            if (saved) {
                const data = JSON.parse(saved);
                // Merge with default frameworks
                Object.keys(data.frameworks).forEach(key => {
                    if (this.frameworks[key]) {
                        this.frameworks[key] = {
                            ...this.frameworks[key],
                            ...data.frameworks[key]
                        };
                    }
                });
            }
        } catch (error) {
            console.error('Error loading compliance config from localStorage:', error);
        }
    }

    // Export compliance configuration
    exportConfiguration() {
        const data = {
            frameworks: this.frameworks,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        return JSON.stringify(data, null, 2);
    }

    // Import compliance configuration
    importConfiguration(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.frameworks) {
                this.frameworks = data.frameworks;
                this.saveCompliance();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing compliance config:', error);
            return false;
        }
    }

    // Get questions mapped to a framework
    getFrameworkQuestions(frameworkId) {
        const framework = this.frameworks[frameworkId];
        return framework ? framework.mappedQuestions : [];
    }

    // Get frameworks for a question
    getQuestionFrameworks(questionId) {
        const frameworks = [];
        Object.values(this.frameworks).forEach(framework => {
            if (framework.mappedQuestions.includes(questionId)) {
                frameworks.push(framework);
            }
        });
        return frameworks;
    }

    // Update framework details
    updateFramework(frameworkId, updates) {
        if (this.frameworks[frameworkId]) {
            this.frameworks[frameworkId] = {
                ...this.frameworks[frameworkId],
                ...updates
            };
            this.saveCompliance();
        }
    }

    // Create custom framework
    createCustomFramework(id, name, description, category) {
        this.frameworks[id] = {
            id: id,
            name: name,
            enabled: true,
            description: description,
            category: category || 'Custom',
            mappedQuestions: [],
            threshold: 3.0,
            color: '#6b7280',
            icon: '⚙️',
            requirements: []
        };
        this.saveCompliance();
    }

    // Delete custom framework
    deleteFramework(frameworkId) {
        if (this.frameworks[frameworkId] && this.frameworks[frameworkId].category === 'Custom') {
            delete this.frameworks[frameworkId];
            this.saveCompliance();
            return true;
        }
        return false;
    }
}

// Global compliance manager instance
const complianceManager = new ComplianceManager();

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await complianceManager.loadCompliance();
    complianceManager.loadFromLocalStorage();
    console.log('Compliance manager initialized');
});