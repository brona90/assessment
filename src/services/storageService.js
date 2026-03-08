import localforage from 'localforage';

const ASSESSMENT_KEY = 'assessmentData';
const EVIDENCE_STORE = 'evidence';

const getAssessmentKey = (userId) => userId ? `assessmentData_${userId}` : ASSESSMENT_KEY;

// Configure localforage for evidence storage
const createEvidenceDB = () => localforage.createInstance({
  name: 'assessmentApp',
  storeName: EVIDENCE_STORE
});

export const storageService = {
  evidenceDB: createEvidenceDB(),

  // Assessment data
  async saveAssessment(userId, data) {
    try {
      const key = getAssessmentKey(userId);
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving assessment:', error);
      return false;
    }
  },

  async loadAssessment(userId) {
    try {
      const key = getAssessmentKey(userId);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading assessment:', error);
      return {};
    }
  },

  async clearAssessment(userId) {
    try {
      const key = getAssessmentKey(userId);
      localStorage.removeItem(key);
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

  saveAssignments(assignments) {
    try {
      localStorage.setItem('adminAssignments', JSON.stringify(assignments));
      return true;
    } catch (error) {
      console.error('Error saving assignments:', error);
      return false;
    }
  },

  loadAssignments() {
    try {
      const data = localStorage.getItem('adminAssignments');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading assignments:', error);
      return null;
    }
  },

  saveFrameworkMappings(mappings) {
    try {
      localStorage.setItem('frameworkMappings', JSON.stringify(mappings));
      return true;
    } catch (error) {
      console.error('Error saving framework mappings:', error);
      return false;
    }
  },

  loadFrameworkMappings() {
    try {
      const data = localStorage.getItem('frameworkMappings');
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading framework mappings:', error);
      return {};
    }
  },

  async loadAllUsersAnswers(userIds) {
    const merged = {};
    for (const id of userIds) {
      const answers = await this.loadAssessment(id);
      Object.assign(merged, answers);
    }
    return merged;
  },

  saveLastActive(userId) {
    if (!userId) return;
    try {
      localStorage.setItem(`lastActive_${userId}`, new Date().toISOString());
    } catch {
      // Non-critical — ignore storage errors for activity tracking
    }
  },

  loadLastActive(userId) {
    if (!userId) return null;
    try {
      return localStorage.getItem(`lastActive_${userId}`);
    } catch {
      return null;
    }
  },

  async loadUsersCompletionStatus(users, questionsPerUser) {
    const statuses = [];
    for (const user of users) {
      const answers = await this.loadAssessment(user.id);
      const assignedQuestions = questionsPerUser[user.id] || [];
      const total = assignedQuestions.length;
      const answered = assignedQuestions.filter(
        q => answers[q.id] !== undefined
      ).length;
      statuses.push({
        userId: user.id,
        name: user.name,
        total,
        answered,
        percentage: total > 0 ? Math.round((answered / total) * 100) : 0,
        lastActive: this.loadLastActive(user.id)
      });
    }
    return statuses;
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