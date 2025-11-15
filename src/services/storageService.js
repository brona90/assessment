import localforage from 'localforage';

const ASSESSMENT_KEY = 'assessmentData';
const EVIDENCE_STORE = 'evidence';

// Configure localforage for evidence storage
const createEvidenceDB = () => localforage.createInstance({
  name: 'assessmentApp',
  storeName: EVIDENCE_STORE
});

export const storageService = {
  evidenceDB: createEvidenceDB(),

  // Assessment data
  async saveAssessment(data) {
    try {
      localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving assessment:', error);
      return false;
    }
  },

  async loadAssessment() {
    try {
      const data = localStorage.getItem(ASSESSMENT_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading assessment:', error);
      return {};
    }
  },

  async clearAssessment() {
    try {
      localStorage.removeItem(ASSESSMENT_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing assessment:', error);
      return false;
    }
  },

  // Evidence storage
  async saveEvidence(questionId, evidence) {
    try {
      await this.evidenceDB.setItem(questionId, evidence);
      return true;
    } catch (error) {
      console.error('Error saving evidence:', error);
      return false;
    }
  },

  async loadEvidence(questionId) {
    try {
      return await this.evidenceDB.getItem(questionId);
    } catch (error) {
      console.error('Error loading evidence:', error);
      return null;
    }
  },

  async loadAllEvidence() {
    try {
      const keys = await this.evidenceDB.keys();
      const evidence = {};
      for (const key of keys) {
        evidence[key] = await this.evidenceDB.getItem(key);
      }
      return evidence;
    } catch (error) {
      console.error('Error loading all evidence:', error);
      return {};
    }
  },

  async clearAllEvidence() {
    try {
      await this.evidenceDB.clear();
      return true;
    } catch (error) {
      console.error('Error clearing evidence:', error);
      return false;
    }
  }
};