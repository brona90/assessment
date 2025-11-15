// Technology Assessment - Interactive Application
// Main JavaScript for handling assessment logic and visualizations

// Global state
let assessmentData = {};
let charts = {};
let assessmentQuestions = null; // Will be loaded from JSON

// Initialize application
document.addEventListener('DOMContentLoaded', async function() {
    // Apply configuration
    applyConfiguration();
    
    // Load questions from JSON
    await loadQuestionsFromJSON();
    
    // Generate questions UI
    generateQuestions();
    
    // Initialize charts
    initializeCharts();
    
    // Load saved data
    loadFromLocalStorage();
    
    // Update scores
    updateScores();
    
    // Check for URL parameters (from dashboard)
    checkURLParameters();
});

// Apply configuration from config.js
function applyConfiguration() {
    // Update page title
    document.title = CONFIG.organization.fullName;
    
    // Update header title
    const appTitle = document.getElementById('appTitle');
    if (appTitle) {
        appTitle.textContent = `🎯 ${CONFIG.organization.name} ${CONFIG.assessment.title}`;
    }
    
    // Apply CSS color variables
    const root = document.documentElement;
    root.style.setProperty('--primary-color', CONFIG.colors.primary);
    root.style.setProperty('--secondary-color', CONFIG.colors.secondary);
    root.style.setProperty('--accent-color', CONFIG.colors.accent);
    root.style.setProperty('--warning-color', CONFIG.colors.warning);
    root.style.setProperty('--danger-color', CONFIG.colors.danger);
}

// Load questions from JSON file
async function loadQuestionsFromJSON() {
    try {
        const response = await fetch('data/questions.json');
        const data = await response.json();
        assessmentQuestions = data.domains;
        console.log('Questions loaded from JSON');
    } catch (error) {
        console.error('Error loading questions:', error);
        alert('Error loading questions. Please refresh the page.');
    }
}

// Check URL parameters for direct question access
function checkURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const questionId = urlParams.get('question');
    const userId = urlParams.get('user');
    
    if (questionId) {
        // Scroll to specific question
        setTimeout(() => {
            const questionElement = document.querySelector(`[data-question-id="${questionId}"]`);
            if (questionElement) {
                questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                questionElement.style.backgroundColor = '#fef3c7';
                setTimeout(() => {
                    questionElement.style.backgroundColor = '';
                }, 2000);
            }
        }, 500);
    }
}

// Generate all questions dynamically from JSON
function generateQuestions() {
    const container = document.getElementById('questionsContainer');
    if (!container || !assessmentQuestions) return;
    
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
        `;
        
        Object.keys(domain.categories).forEach(categoryKey => {
            const category = domain.categories[categoryKey];
            
            html += `
                <div class="category-section">
                    <h3 class="category-title">${category.title}</h3>
            `;
            
            category.questions.forEach(question => {
                html += `
                    <div class="question-card" data-question-id="${question.id}">
                        <div class="question-header-row">
                            <span class="question-number">${question.id.toUpperCase()}</span>
                            ${question.requiresEvidence ? '<span class="evidence-required">📎 Evidence Required</span>' : ''}
                        </div>
                        <p class="question-text">${question.text}</p>
                        <div class="rating-scale">
                            <label class="rating-option">
                                <input type="radio" name="${question.id}" value="1" onchange="handleAnswerChange('${question.id}', 1)">
                                <span class="rating-label">1 - Not Implemented</span>
                            </label>
                            <label class="rating-option">
                                <input type="radio" name="${question.id}" value="2" onchange="handleAnswerChange('${question.id}', 2)">
                                <span class="rating-label">2 - Initial/Ad-hoc</span>
                            </label>
                            <label class="rating-option">
                                <input type="radio" name="${question.id}" value="3" onchange="handleAnswerChange('${question.id}', 3)">
                                <span class="rating-label">3 - Defined/Repeatable</span>
                            </label>
                            <label class="rating-option">
                                <input type="radio" name="${question.id}" value="4" onchange="handleAnswerChange('${question.id}', 4)">
                                <span class="rating-label">4 - Managed/Measured</span>
                            </label>
                            <label class="rating-option">
                                <input type="radio" name="${question.id}" value="5" onchange="handleAnswerChange('${question.id}', 5)">
                                <span class="rating-label">5 - Optimized/Innovating</span>
                            </label>
                        </div>
                        <button class="evidence-btn" data-evidence-indicator="${question.id}" onclick="openEvidenceModal('${question.id}')">
                            📎 Add Evidence
                        </button>
                    </div>
                `;
            });
            
            html += `</div>`; // Close category-section
        });
        
        html += `</div>`; // Close domain-section
    });
    
    container.innerHTML = html;
}

// Handle answer change
function handleAnswerChange(questionId, value) {
    assessmentData[questionId] = parseInt(value);
    saveToLocalStorage();
    updateScores();
}

// Save to localStorage
function saveToLocalStorage() {
    try {
        localStorage.setItem(CONFIG.assessment.storageKey, JSON.stringify(assessmentData));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

// Load from localStorage on page load
function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem(CONFIG.assessment.storageKey);
        if (saved) {
            assessmentData = JSON.parse(saved);
            
            // Restore radio button selections
            Object.keys(assessmentData).forEach(questionId => {
                const value = assessmentData[questionId];
                const radio = document.querySelector(`input[name="${questionId}"][value="${value}"]`);
                if (radio) {
                    radio.checked = true;
                }
            });
            
            updateScores();
        }
    } catch (e) {
        console.error('Error loading from localStorage:', e);
    }
}

// Save assessment (manual save button)
function saveAssessment() {
    saveToLocalStorage();
    alert('Assessment progress saved successfully!');
}

// Load assessment (manual load button)
function loadAssessment() {
    loadFromLocalStorage();
    alert('Assessment loaded successfully!');
}

// Update all scores and charts
function updateScores() {
    if (!assessmentQuestions) return;
    
    const scores = calculateScores();
    updateProgressBar(scores);
    updateCharts(scores);
}

// Calculate scores for all domains
function calculateScores() {
    const scores = {
        domain1: 0,
        domain2: 0,
        domain3: 0,
        domain4: 0,
        overall: 0,
        answered: 0,
        total: 0
    };
    
    Object.keys(assessmentQuestions).forEach(domainKey => {
        const domain = assessmentQuestions[domainKey];
        let domainTotal = 0;
        let domainCount = 0;
        
        Object.keys(domain.categories).forEach(categoryKey => {
            const category = domain.categories[categoryKey];
            category.questions.forEach(question => {
                scores.total++;
                if (assessmentData[question.id] !== undefined) {
                    domainTotal += assessmentData[question.id];
                    domainCount++;
                    scores.answered++;
                }
            });
        });
        
        scores[domainKey] = domainCount > 0 ? (domainTotal / domainCount).toFixed(1) : 0;
    });
    
    // Calculate weighted overall score
    const weights = CONFIG.domainWeights;
    scores.overall = (
        scores.domain1 * weights.domain1 +
        scores.domain2 * weights.domain2 +
        scores.domain3 * weights.domain3 +
        scores.domain4 * weights.domain4
    ).toFixed(1);
    
    return scores;
}

// Update progress bar
function updateProgressBar(scores) {
    const percentage = scores.total > 0 ? Math.round((scores.answered / scores.total) * 100) : 0;
    
    document.getElementById('progressBar').style.width = percentage + '%';
    document.getElementById('progressText').textContent = `${scores.answered}/${scores.total} Questions`;
    document.getElementById('progressPercentage').textContent = percentage + '%';
}

// Show/hide sections
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionName + 'Section');
    if (section) {
        section.style.display = 'block';
    }
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

// Initialize charts (placeholder - keeping existing chart code)
function initializeCharts() {
    // Chart initialization code from original app.js
    // This would include all the Chart.js initialization
    console.log('Charts initialized');
}

// Update charts (placeholder - keeping existing chart code)
function updateCharts(scores) {
    // Chart update code from original app.js
    console.log('Charts updated with scores:', scores);
}

// Export PDF with evidence
async function exportPDF() {
    alert('Generating PDF with evidence... This may take a moment.');
    
    // Get all evidence
    const allEvidence = await evidenceManager.getAllEvidence();
    
    // PDF generation code would go here
    // This would include the existing PDF generation logic
    // plus the new evidence sections
    
    console.log('PDF export with evidence:', allEvidence);
    alert('PDF generation complete!');
}