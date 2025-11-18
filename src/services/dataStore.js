/**
 * In-Memory Data Store
 * 
 * This service provides CRUD operations for all application data.
 * Data is stored in memory and can be exported/imported for persistence.
 * Designed for GitHub Pages deployment without a backend.
 */

import { storageService } from './storageService';

class DataStore {
  constructor() {
    this.data = {
      domains: {},
      users: [],
      frameworks: [],
      questions: [],
      assignments: {}, // { userId: [questionIds] }
      selectedFrameworks: [], // Framework IDs selected by admin
      answers: {}, // User answers to questions
      evidence: {} // Evidence/proof attached to answers
    };
    this.initialized = false;
  }

  /**
   * Initialize the data store with data from JSON files
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Load initial data from JSON files
      const [questionsData, usersData, complianceData] = await Promise.all([
        fetch('/assessment/data/questions.json').then(r => r.json()),
        fetch('/assessment/data/users.json').then(r => r.json()),
        fetch('/assessment/data/compliance.json').then(r => r.json())
      ]);

      // Store domains from questions
      this.data.domains = questionsData.domains || {};

      // Extract all questions from domains
      this.data.questions = this.extractQuestionsFromDomains(this.data.domains);

      // Store users - extract users array from the data
      this.data.users = usersData.users || [];

      // Store frameworks - convert object to array if needed
      if (complianceData.frameworks) {
        this.data.frameworks = Array.isArray(complianceData.frameworks) 
          ? complianceData.frameworks 
          : Object.values(complianceData.frameworks);
      } else {
        this.data.frameworks = [];
      }

      // Initialize all frameworks as selected by default
      this.data.selectedFrameworks = this.data.frameworks.map(f => f.id);

      // Initialize assignments from user data
      this.data.assignments = {};
      this.data.users.forEach(user => {
        this.data.assignments[user.id] = user.assignedQuestions || [];
      });

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing data store:', error);
      throw error;
    }
  }

  /**
   * Extract all questions from domains structure
   */
  extractQuestionsFromDomains(domains) {
    const questions = [];
    Object.entries(domains).forEach(([domainId, domain]) => {
      Object.entries(domain.categories || {}).forEach(([categoryId, category]) => {
        if (category.questions) {
          category.questions.forEach(question => {
            questions.push({
              ...question,
              domainId,
              categoryId
            });
          });
        }
      });
    });
    return questions;
  }

  // ==================== DOMAIN OPERATIONS ====================

  /**
   * Get all domains
   */
  getDomains() {
    return this.data.domains;
  }

  /**
   * Get a single domain by ID
   */
  getDomain(domainId) {
    return this.data.domains[domainId];
  }

  /**
   * Add a new domain
   */
  addDomain(domain) {
    if (!domain.id) {
      throw new Error('Domain must have an id');
    }
    if (this.data.domains[domain.id]) {
      throw new Error(`Domain with id ${domain.id} already exists`);
    }
    this.data.domains[domain.id] = {
      ...domain,
      categories: domain.categories || {}
    };
    return this.data.domains[domain.id];
  }

  /**
   * Update an existing domain
   */
  updateDomain(domainId, updates) {
    if (!this.data.domains[domainId]) {
      throw new Error(`Domain with id ${domainId} not found`);
    }
    this.data.domains[domainId] = {
      ...this.data.domains[domainId],
      ...updates,
      id: domainId // Preserve the ID
    };
    return this.data.domains[domainId];
  }

  /**
   * Delete a domain
   */
  deleteDomain(domainId) {
    if (!this.data.domains[domainId]) {
      throw new Error(`Domain with id ${domainId} not found`);
    }
    delete this.data.domains[domainId];
    
    // Remove questions from this domain
    this.data.questions = this.data.questions.filter(q => q.domainId !== domainId);
    
    return true;
  }

  // ==================== FRAMEWORK OPERATIONS ====================

  /**
   * Get all frameworks
   */
  getFrameworks() {
    return this.data.frameworks;
  }

  /**
   * Get selected frameworks (visible to non-admin users)
   */
  getSelectedFrameworks() {
    return this.data.frameworks.filter(f => 
      this.data.selectedFrameworks.includes(f.id)
    );
  }

  /**
   * Add a new framework
   */
  addFramework(framework) {
    if (!framework.id) {
      throw new Error('Framework must have an id');
    }
    if (this.data.frameworks.find(f => f.id === framework.id)) {
      throw new Error(`Framework with id ${framework.id} already exists`);
    }
    this.data.frameworks.push(framework);
    return framework;
  }

  /**
   * Update an existing framework
   */
  updateFramework(frameworkId, updates) {
    const index = this.data.frameworks.findIndex(f => f.id === frameworkId);
    if (index === -1) {
      throw new Error(`Framework with id ${frameworkId} not found`);
    }
    this.data.frameworks[index] = {
      ...this.data.frameworks[index],
      ...updates,
      id: frameworkId // Preserve the ID
    };
    return this.data.frameworks[index];
  }

  /**
   * Delete a framework
   */
  deleteFramework(frameworkId) {
    const index = this.data.frameworks.findIndex(f => f.id === frameworkId);
    if (index === -1) {
      throw new Error(`Framework with id ${frameworkId} not found`);
    }
    this.data.frameworks.splice(index, 1);
    
    // Remove from selected frameworks
    this.data.selectedFrameworks = this.data.selectedFrameworks.filter(
      id => id !== frameworkId
    );
    
    return true;
  }

  /**
   * Set which frameworks are selected (visible to users)
   */
  setSelectedFrameworks(frameworkIds) {
    // Validate all IDs exist
    frameworkIds.forEach(id => {
      if (!this.data.frameworks.find(f => f.id === id)) {
        throw new Error(`Framework with id ${id} not found`);
      }
    });
    this.data.selectedFrameworks = [...frameworkIds];
    return this.data.selectedFrameworks;
  }

  // ==================== USER OPERATIONS ====================

  /**
   * Get all users
   */
  getUsers() {
    return this.data.users;
  }

  /**
   * Get a single user by ID
   */
  getUser(userId) {
    return this.data.users.find(u => u.id === userId);
  }

  /**
   * Add a new user
   */
  addUser(user) {
    if (!user.id) {
      throw new Error('User must have an id');
    }
    if (this.data.users.find(u => u.id === user.id)) {
      throw new Error(`User with id ${user.id} already exists`);
    }
    this.data.users.push(user);
    this.data.assignments[user.id] = [];
    return user;
  }

  /**
   * Update an existing user
   */
  updateUser(userId, updates) {
    const index = this.data.users.findIndex(u => u.id === userId);
    if (index === -1) {
      throw new Error(`User with id ${userId} not found`);
    }
    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      id: userId // Preserve the ID
    };
    return this.data.users[index];
  }

  /**
   * Delete a user
   */
  deleteUser(userId) {
    const index = this.data.users.findIndex(u => u.id === userId);
    if (index === -1) {
      throw new Error(`User with id ${userId} not found`);
    }
    this.data.users.splice(index, 1);
    delete this.data.assignments[userId];
    return true;
  }

  // ==================== QUESTION OPERATIONS ====================

  /**
   * Get all questions
   */
  getQuestions() {
    return this.data.questions;
  }

  /**
   * Get questions for a specific domain
   */
  getQuestionsByDomain(domainId) {
    return this.data.questions.filter(q => q.domainId === domainId);
  }

  /**
   * Get questions assigned to a user
   */
  getQuestionsForUser(userId) {
    const assignedIds = this.data.assignments[userId] || [];
    return this.data.questions.filter(q => assignedIds.includes(q.id));
  }

  /**
   * Add a new question
   */
  addQuestion(question) {
    if (!question.id) {
      throw new Error('Question must have an id');
    }
    if (!question.domainId) {
      throw new Error('Question must have a domainId');
    }
    if (!question.categoryId) {
      throw new Error('Question must have a categoryId');
    }
    if (this.data.questions.find(q => q.id === question.id)) {
      throw new Error(`Question with id ${question.id} already exists`);
    }

    // Add to questions array
    this.data.questions.push(question);

    // Add to domain structure
    const domain = this.data.domains[question.domainId];
    if (domain) {
      if (!domain.categories[question.categoryId]) {
        domain.categories[question.categoryId] = { questions: [] };
      }
      if (!domain.categories[question.categoryId].questions) {
        domain.categories[question.categoryId].questions = [];
      }
      domain.categories[question.categoryId].questions.push(question);
    }

    return question;
  }

  /**
   * Update an existing question
   */
  updateQuestion(questionId, updates) {
    const index = this.data.questions.findIndex(q => q.id === questionId);
    if (index === -1) {
      throw new Error(`Question with id ${questionId} not found`);
    }

    const oldQuestion = this.data.questions[index];
    this.data.questions[index] = {
      ...oldQuestion,
      ...updates,
      id: questionId // Preserve the ID
    };

    // Update in domain structure
    const domain = this.data.domains[oldQuestion.domainId];
    if (domain && domain.categories[oldQuestion.categoryId]) {
      const questions = domain.categories[oldQuestion.categoryId].questions;
      const qIndex = questions.findIndex(q => q.id === questionId);
      if (qIndex !== -1) {
        questions[qIndex] = this.data.questions[index];
      }
    }

    return this.data.questions[index];
  }

  /**
   * Delete a question
   */
  deleteQuestion(questionId) {
    const index = this.data.questions.findIndex(q => q.id === questionId);
    if (index === -1) {
      throw new Error(`Question with id ${questionId} not found`);
    }

    const question = this.data.questions[index];
    this.data.questions.splice(index, 1);

    // Remove from domain structure
    const domain = this.data.domains[question.domainId];
    if (domain && domain.categories[question.categoryId]) {
      const questions = domain.categories[question.categoryId].questions;
      const qIndex = questions.findIndex(q => q.id === questionId);
      if (qIndex !== -1) {
        questions.splice(qIndex, 1);
      }
    }

    // Remove from all user assignments
    Object.keys(this.data.assignments).forEach(userId => {
      this.data.assignments[userId] = this.data.assignments[userId].filter(
        id => id !== questionId
      );
    });

    return true;
  }

  // ==================== ASSIGNMENT OPERATIONS ====================

  /**
   * Get question assignments for a user
   */
  getUserAssignments(userId) {
    return this.data.assignments[userId] || [];
  }

  /**
   * Assign questions to a user
   */
  assignQuestionsToUser(userId, questionIds) {
    if (!this.data.users.find(u => u.id === userId)) {
      throw new Error(`User with id ${userId} not found`);
    }

    // Validate all question IDs exist
    questionIds.forEach(qId => {
      if (!this.data.questions.find(q => q.id === qId)) {
        throw new Error(`Question with id ${qId} not found`);
      }
    });

    this.data.assignments[userId] = [...questionIds];
    return this.data.assignments[userId];
  }

  /**
   * Add questions to user's existing assignments
   */
  addQuestionAssignments(userId, questionIds) {
    if (!this.data.users.find(u => u.id === userId)) {
      throw new Error(`User with id ${userId} not found`);
    }

    const currentAssignments = this.data.assignments[userId] || [];
    const newAssignments = [...new Set([...currentAssignments, ...questionIds])];
    
    this.data.assignments[userId] = newAssignments;
    return this.data.assignments[userId];
  }

  /**
   * Remove question assignments from a user
   */
  removeQuestionAssignments(userId, questionIds) {
    if (!this.data.users.find(u => u.id === userId)) {
      throw new Error(`User with id ${userId} not found`);
    }

    this.data.assignments[userId] = (this.data.assignments[userId] || []).filter(
      id => !questionIds.includes(id)
    );
    
    return this.data.assignments[userId];
  }

  // ==================== ANSWERS OPERATIONS ====================

  /**
   * Get all answers
   */
  getAnswers() {
    return this.data.answers;
  }

  /**
   * Set answers
   */
  setAnswers(answers) {
    if (typeof answers !== 'object' || Array.isArray(answers)) {
      throw new Error('Answers must be an object');
    }
    this.data.answers = answers;
    return this.data.answers;
  }

  /**
   * Update a single answer
   */
  updateAnswer(questionId, value) {
    this.data.answers[questionId] = value;
    return this.data.answers;
  }

  /**
   * Clear all answers
   */
  clearAnswers() {
    this.data.answers = {};
    return this.data.answers;
  }

  // ==================== EVIDENCE OPERATIONS ====================

  /**
   * Get all evidence
   */
  getEvidence() {
    return this.data.evidence;
  }

  /**
   * Set evidence
   */
  setEvidence(evidence) {
    if (typeof evidence !== 'object' || Array.isArray(evidence)) {
      throw new Error('Evidence must be an object');
    }
    this.data.evidence = evidence;
    return this.data.evidence;
  }

  /**
   * Update evidence for a question
   */
  updateEvidence(questionId, evidenceData) {
    this.data.evidence[questionId] = evidenceData;
    return this.data.evidence;
  }

  /**
   * Clear all evidence
   */
  clearEvidence() {
    this.data.evidence = {};
    return this.data.evidence;
  }

  /**
   * Clear all data (admin only)
   * Resets all data to initial state and clears localStorage and IndexedDB
   */
  async clearAllData() {
    try {
      // Clear in-memory data
      this.data = {
        domains: {},
        users: [],
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: [],
        answers: {},
        evidence: {}
      };

      // Clear localStorage
      localStorage.clear();

      // Clear IndexedDB
      if (window.indexedDB) {
        const databases = await window.indexedDB.databases();
        for (const db of databases) {
          window.indexedDB.deleteDatabase(db.name);
        }
      }

      this.initialized = false;
      return { success: true };
    } catch (error) {
      console.error('Error clearing all data:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== EXPORT/IMPORT OPERATIONS ====================

  /**
   * Export all data as JSON (including answers and evidence from storage)
   */
  async exportData() {
    try {
      // Load answers and evidence from storage
      const [answers, evidence] = await Promise.all([
        storageService.loadAssessment(),
        storageService.loadAllEvidence()
      ]);
      
      // Create export data with current config + runtime data
      const exportData = {
        ...this.data,
        answers: answers || {},
        evidence: evidence || {}
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      // Fallback to exporting just the config data
      return JSON.stringify(this.data, null, 2);
    }
  }

  /**
   * Import data from JSON
   */
  async importData(jsonData) {
    try {
      const imported = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      // Detailed validation with specific error messages
      const validationErrors = [];

      // Check required top-level properties
      if (!imported.domains) {
        validationErrors.push('Missing required field: domains');
      } else if (typeof imported.domains !== 'object' || Array.isArray(imported.domains)) {
        validationErrors.push('Invalid domains: must be an object');
      }

      if (!imported.users) {
        validationErrors.push('Missing required field: users');
      } else if (!Array.isArray(imported.users)) {
        validationErrors.push('Invalid users: must be an array');
      }

      if (!imported.frameworks) {
        validationErrors.push('Missing required field: frameworks');
      } else if (!Array.isArray(imported.frameworks)) {
        validationErrors.push('Invalid frameworks: must be an array');
      }

      if (!imported.questions) {
        validationErrors.push('Missing required field: questions');
      } else if (!Array.isArray(imported.questions)) {
        validationErrors.push('Invalid questions: must be an array');
      }

      if (!imported.assignments) {
        validationErrors.push('Missing required field: assignments');
      } else if (typeof imported.assignments !== 'object' || Array.isArray(imported.assignments)) {
        validationErrors.push('Invalid assignments: must be an object');
      }

      if (!imported.selectedFrameworks) {
        validationErrors.push('Missing required field: selectedFrameworks');
      } else if (!Array.isArray(imported.selectedFrameworks)) {
        validationErrors.push('Invalid selectedFrameworks: must be an array');
      }

      // Validate answers (optional field, but must be object if present)
      if (imported.answers !== undefined) {
        if (typeof imported.answers !== 'object' || Array.isArray(imported.answers)) {
          validationErrors.push('Invalid answers: must be an object');
        }
      }

      // Validate evidence (optional field, but must be object if present)
      if (imported.evidence !== undefined) {
        if (typeof imported.evidence !== 'object' || Array.isArray(imported.evidence)) {
          validationErrors.push('Invalid evidence: must be an object');
        }
      }

      // If there are validation errors, throw with detailed message
      if (validationErrors.length > 0) {
        throw new Error(`Invalid data structure: ${validationErrors.join(', ')}`);
      }

      // Merge imported data with defaults for optional fields
      this.data = {
        ...imported,
        answers: imported.answers || {},
        evidence: imported.evidence || {}
      };
      this.initialized = true;
      
      // Save answers and evidence to storage
      if (imported.answers && Object.keys(imported.answers).length > 0) {
        await storageService.saveAssessment(imported.answers);
      }
      
      if (imported.evidence && Object.keys(imported.evidence).length > 0) {
        // Save each evidence item individually
        for (const [questionId, evidenceData] of Object.entries(imported.evidence)) {
          await storageService.saveEvidence(questionId, evidenceData);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  /**
   * Download data as a JSON file
   */
  async downloadData(filename = 'assessment-data.json') {
    try {
      const dataStr = await this.exportData();
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error downloading data:', error);
      throw error;
    }
  }

  /**
   * Reset data store to initial state
   */
  reset() {
    this.data = {
      domains: {},
      users: [],
      frameworks: [],
      questions: [],
      assignments: {},
      selectedFrameworks: [],
      answers: {},
      evidence: {}
    };
    this.initialized = false;
  }
}

// Create and export singleton instance
export const dataStore = new DataStore();