import { openDB } from 'idb';

const ASSESSMENT_KEY = 'assessmentData';
const DB_NAME = 'assessmentApp';
const EVIDENCE_STORE = 'evidence';
const DB_VERSION = 1;

const getAssessmentKey = (userId) => userId ? `assessmentData_${userId}` : ASSESSMENT_KEY;

// Lazily open the IndexedDB database
let dbPromise;
function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(EVIDENCE_STORE)) {
          db.createObjectStore(EVIDENCE_STORE);
        }
      }
    });
  }
  return dbPromise;
}

export const storageService = {
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

  // Evidence storage (IndexedDB via idb)
  async saveEvidence(questionId, evidence) {
    try {
      const db = await getDB();
      await db.put(EVIDENCE_STORE, evidence, questionId);
      return true;
    } catch (error) {
      console.error('Error saving evidence:', error);
      return false;
    }
  },

  async loadEvidence(questionId) {
    try {
      const db = await getDB();
      return await db.get(EVIDENCE_STORE, questionId);
    } catch (error) {
      console.error('Error loading evidence:', error);
      return null;
    }
  },

  async loadAllEvidence() {
    try {
      const db = await getDB();
      const keys = await db.getAllKeys(EVIDENCE_STORE);
      const values = await db.getAll(EVIDENCE_STORE);
      const evidence = {};
      keys.forEach((key, i) => { evidence[key] = values[i]; });
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

  saveComments(userId, comments) {
    if (!userId) return;
    try {
      localStorage.setItem(`comments_${userId}`, JSON.stringify(comments));
    } catch {
      // Non-critical
    }
  },

  loadComments(userId) {
    if (!userId) return {};
    try {
      const data = localStorage.getItem(`comments_${userId}`);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
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
      const db = await getDB();
      await db.clear(EVIDENCE_STORE);
      return true;
    } catch (error) {
      console.error('Error clearing evidence:', error);
      return false;
    }
  },

  // ── Assessment Snapshots ──────────────────────────────────────────────────

  saveSnapshot(userId, snapshot) {
    try {
      const key = `snapshots_${userId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push(snapshot);
      // Keep only the last 20 snapshots
      while (existing.length > 20) {
        existing.shift();
      }
      localStorage.setItem(key, JSON.stringify(existing));
      return true;
    } catch (error) {
      console.error('Error saving snapshot:', error);
      return false;
    }
  },

  loadSnapshots(userId) {
    try {
      return JSON.parse(localStorage.getItem(`snapshots_${userId}`) || '[]');
    } catch {
      return [];
    }
  },

  clearSnapshots(userId) {
    try {
      localStorage.removeItem(`snapshots_${userId}`);
      return true;
    } catch {
      return false;
    }
  },

  // Exposed for testing — resets the cached DB promise
  _resetDB() {
    dbPromise = null;
  }
};
