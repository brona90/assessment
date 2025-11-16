/**
 * User Export Service
 * 
 * Allows users to export their assigned questions with answers and evidence
 * for submission to the admin.
 */

export const userExportService = {
  /**
   * Export user's questions with answers and evidence
   * @param {string} userId - User ID
   * @param {string} userName - User name
   * @param {Array} questions - User's assigned questions
   * @param {Object} answers - User's answers
   * @param {Object} evidence - User's evidence
   * @returns {Object} Export data
   */
  exportUserData(userId, userName, questions, answers, evidence) {
    const exportData = {
      exportVersion: '1.0',
      exportDate: new Date().toISOString(),
      user: {
        id: userId,
        name: userName
      },
      questions: questions.map(question => ({
        id: question.id,
        text: question.text,
        domainId: question.domainId,
        categoryId: question.categoryId,
        answer: answers[question.id] !== undefined ? answers[question.id] : null,
        evidence: evidence[question.id] || null
      }))
    };

    return exportData;
  },

  /**
   * Download user export as JSON file
   * @param {string} userId - User ID
   * @param {string} userName - User name
   * @param {Array} questions - User's assigned questions
   * @param {Object} answers - User's answers
   * @param {Object} evidence - User's evidence
   */
  downloadUserExport(userId, userName, questions, answers, evidence) {
    const exportData = this.exportUserData(userId, userName, questions, answers, evidence);
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const filename = `assessment-export-${userId}-${Date.now()}.json`;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  },

  /**
   * Validate user export data
   * @param {Object} exportData - Export data to validate
   * @returns {Object} Validation result
   */
  validateExportData(exportData) {
    if (!exportData || typeof exportData !== 'object') {
      return { valid: false, error: 'Invalid export data format' };
    }

    if (!exportData.exportVersion) {
      return { valid: false, error: 'Missing export version' };
    }

    if (!exportData.user || !exportData.user.id || !exportData.user.name) {
      return { valid: false, error: 'Invalid user information' };
    }

    if (!Array.isArray(exportData.questions)) {
      return { valid: false, error: 'Invalid questions data' };
    }

    return { valid: true };
  },

  /**
   * Import user export data
   * @param {string} jsonData - JSON string or object
   * @returns {Object} Parsed export data or error
   */
  importUserExport(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      const validation = this.validateExportData(data);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to parse export data: ' + error.message };
    }
  },

  /**
   * Merge multiple user exports
   * @param {Array} exports - Array of user export data
   * @returns {Object} Merged data
   */
  mergeUserExports(exports) {
    const merged = {
      mergeDate: new Date().toISOString(),
      users: [],
      allQuestions: [],
      summary: {
        totalUsers: 0,
        totalQuestions: 0,
        answeredQuestions: 0,
        questionsWithEvidence: 0
      }
    };

    exports.forEach(exportData => {
      // Add user info
      merged.users.push({
        id: exportData.user.id,
        name: exportData.user.name,
        exportDate: exportData.exportDate,
        questionCount: exportData.questions.length
      });

      // Add questions
      exportData.questions.forEach(question => {
        merged.allQuestions.push({
          ...question,
          userId: exportData.user.id,
          userName: exportData.user.name
        });

        // Update summary
        if (question.answer !== null) {
          merged.summary.answeredQuestions++;
        }
        if (question.evidence) {
          merged.summary.questionsWithEvidence++;
        }
      });
    });

    merged.summary.totalUsers = merged.users.length;
    merged.summary.totalQuestions = merged.allQuestions.length;

    return merged;
  },

  /**
   * Generate summary report from merged exports
   * @param {Object} mergedData - Merged export data
   * @returns {Object} Summary report
   */
  generateSummaryReport(mergedData) {
    const report = {
      generatedDate: new Date().toISOString(),
      overview: {
        totalUsers: mergedData.summary.totalUsers,
        totalQuestions: mergedData.summary.totalQuestions,
        answeredQuestions: mergedData.summary.answeredQuestions,
        questionsWithEvidence: mergedData.summary.questionsWithEvidence,
        completionRate: mergedData.summary.totalQuestions > 0
          ? ((mergedData.summary.answeredQuestions / mergedData.summary.totalQuestions) * 100).toFixed(2)
          : 0,
        evidenceRate: mergedData.summary.totalQuestions > 0
          ? ((mergedData.summary.questionsWithEvidence / mergedData.summary.totalQuestions) * 100).toFixed(2)
          : 0
      },
      userSummaries: mergedData.users.map(user => {
        const userQuestions = mergedData.allQuestions.filter(q => q.userId === user.id);
        const answered = userQuestions.filter(q => q.answer !== null).length;
        const withEvidence = userQuestions.filter(q => q.evidence).length;

        return {
          userId: user.id,
          userName: user.name,
          totalQuestions: userQuestions.length,
          answeredQuestions: answered,
          questionsWithEvidence: withEvidence,
          completionRate: userQuestions.length > 0
            ? ((answered / userQuestions.length) * 100).toFixed(2)
            : 0
        };
      }),
      domainBreakdown: this.calculateDomainBreakdown(mergedData.allQuestions)
    };

    return report;
  },

  /**
   * Calculate domain breakdown from questions
   * @param {Array} questions - All questions
   * @returns {Object} Domain breakdown
   */
  calculateDomainBreakdown(questions) {
    const domains = {};

    questions.forEach(question => {
      if (!domains[question.domainId]) {
        domains[question.domainId] = {
          domainId: question.domainId,
          totalQuestions: 0,
          answeredQuestions: 0,
          questionsWithEvidence: 0,
          averageScore: 0,
          scores: []
        };
      }

      domains[question.domainId].totalQuestions++;

      if (question.answer !== null) {
        domains[question.domainId].answeredQuestions++;
        domains[question.domainId].scores.push(question.answer);
      }

      if (question.evidence) {
        domains[question.domainId].questionsWithEvidence++;
      }
    });

    // Calculate average scores
    Object.values(domains).forEach(domain => {
      if (domain.scores.length > 0) {
        const sum = domain.scores.reduce((a, b) => a + b, 0);
        domain.averageScore = (sum / domain.scores.length).toFixed(2);
      }
      delete domain.scores; // Remove raw scores from output
    });

    return domains;
  },

  /**
   * Download merged report
   * @param {Object} mergedData - Merged export data
   * @param {string} filename - Output filename
   */
  downloadMergedReport(mergedData, filename = 'merged-assessment-report.json') {
    const report = this.generateSummaryReport(mergedData);
    const fullReport = {
      ...report,
      detailedData: mergedData
    };

    const dataStr = JSON.stringify(fullReport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  }
};