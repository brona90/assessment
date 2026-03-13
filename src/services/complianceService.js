import { loadRawData } from './rawDataProvider';
import { scoreCalculator } from '../utils/scoreCalculator';

export const complianceService = {
  async loadCompliance() {
    try {
      const { compliance: data } = await loadRawData();
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
    return scoreCalculator.calculateComplianceScore(framework, answers);
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