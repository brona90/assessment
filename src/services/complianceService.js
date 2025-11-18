export const complianceService = {
  async loadCompliance() {
    try {
      const response = await fetch('/assessment/data/compliance.json');
      if (!response.ok) throw new Error('Failed to load compliance');
      const data = await response.json();
      return data.frameworks || {};
    } catch (error) {
      console.error('Error loading compliance:', error);
      return {};
    }
  },

  getEnabledFrameworks(frameworks) {
    return Object.values(frameworks).filter(f => f.enabled);
  },

  calculateFrameworkScore(framework, answers) {
    if (!framework.mappedQuestions || framework.mappedQuestions.length === 0) {
      return 0;
    }

    let total = 0;
    let count = 0;

    framework.mappedQuestions.forEach(qId => {
      if (answers[qId] !== undefined) {
        total += (answers[qId] / 5) * 100;
        count++;
      }
    });

    return count > 0 ? (total / count) : 0;
  },

  getComplianceStatus(score, threshold) {
    const thresholdPercent = (threshold / 5) * 100;
    if (score >= 90) return { status: 'Excellent', color: '#10b981' };
    if (score >= thresholdPercent) return { status: 'Good', color: '#10b981' };
    if (score >= thresholdPercent - 10) return { status: 'Fair', color: '#f59e0b' };
    if (score >= thresholdPercent - 20) return { status: 'Needs Improvement', color: '#f59e0b' };
    return { status: 'Critical', color: '#ef4444' };
  },

  saveCompliance(frameworks) {
    try {
      localStorage.setItem('complianceFrameworks', JSON.stringify(frameworks));
      return true;
    } catch (error) {
      console.error('Error saving compliance:', error);
      return false;
    }
  },

  loadSavedCompliance() {
    try {
      const saved = localStorage.getItem('complianceFrameworks');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading saved compliance:', error);
      return null;
    }
  }
};