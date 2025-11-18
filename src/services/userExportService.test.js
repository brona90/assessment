import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userExportService } from './userExportService';

describe('userExportService', () => {
  const mockUserId = 'user1';
  const mockUserName = 'Test User';
  const mockQuestions = [
    { id: 'q1', text: 'Question 1', domainId: 'domain1', categoryId: 'cat1' },
    { id: 'q2', text: 'Question 2', domainId: 'domain1', categoryId: 'cat1' },
    { id: 'q3', text: 'Question 3', domainId: 'domain2', categoryId: 'cat2' }
  ];
  const mockAnswers = { q1: 4, q2: 3 };
  const mockEvidence = {
    q1: { text: 'Evidence 1', images: [] },
    q2: { text: 'Evidence 2', images: ['image1.jpg'] }
  };

  describe('exportUserData', () => {
    it('should export user data with answers and evidence', () => {
      const result = userExportService.exportUserData(
        mockUserId,
        mockUserName,
        mockQuestions,
        mockAnswers,
        mockEvidence
      );

      expect(result.exportVersion).toBe('1.0');
      expect(result.exportDate).toBeDefined();
      expect(result.user.id).toBe(mockUserId);
      expect(result.user.name).toBe(mockUserName);
      expect(result.questions).toHaveLength(3);
    });

    it('should include question details', () => {
      const result = userExportService.exportUserData(
        mockUserId,
        mockUserName,
        mockQuestions,
        mockAnswers,
        mockEvidence
      );

      const question1 = result.questions.find(q => q.id === 'q1');
      expect(question1.text).toBe('Question 1');
      expect(question1.domainId).toBe('domain1');
      expect(question1.answer).toBe(4);
      expect(question1.evidence).toEqual(mockEvidence.q1);
    });

    it('should handle questions without answers', () => {
      const result = userExportService.exportUserData(
        mockUserId,
        mockUserName,
        mockQuestions,
        mockAnswers,
        mockEvidence
      );

      const question3 = result.questions.find(q => q.id === 'q3');
      expect(question3.answer).toBeNull();
      expect(question3.evidence).toBeNull();
    });

    it('should handle empty answers and evidence', () => {
      const result = userExportService.exportUserData(
        mockUserId,
        mockUserName,
        mockQuestions,
        {},
        {}
      );

      expect(result.questions).toHaveLength(3);
      result.questions.forEach(q => {
        expect(q.answer).toBeNull();
        expect(q.evidence).toBeNull();
      });
    });
  });

  describe('validateExportData', () => {
    it('should validate correct export data', () => {
      const validData = {
        exportVersion: '1.0',
        exportDate: new Date().toISOString(),
        user: { id: 'user1', name: 'Test User' },
        questions: []
      };

      const result = userExportService.validateExportData(validData);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid data format', () => {
      const result = userExportService.validateExportData(null);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid export data format');
    });

    it('should reject data without version', () => {
      const invalidData = {
        user: { id: 'user1', name: 'Test User' },
        questions: []
      };

      const result = userExportService.validateExportData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Missing export version');
    });

    it('should reject data without user info', () => {
      const invalidData = {
        exportVersion: '1.0',
        questions: []
      };

      const result = userExportService.validateExportData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid user information');
    });

    it('should reject data without questions array', () => {
      const invalidData = {
        exportVersion: '1.0',
        user: { id: 'user1', name: 'Test User' }
      };

      const result = userExportService.validateExportData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid questions data');
    });
  });

  describe('importUserExport', () => {
    it('should import valid JSON string', () => {
      const validData = {
        exportVersion: '1.0',
        exportDate: new Date().toISOString(),
        user: { id: 'user1', name: 'Test User' },
        questions: []
      };

      const result = userExportService.importUserExport(JSON.stringify(validData));
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
    });

    it('should import valid object', () => {
      const validData = {
        exportVersion: '1.0',
        exportDate: new Date().toISOString(),
        user: { id: 'user1', name: 'Test User' },
        questions: []
      };

      const result = userExportService.importUserExport(validData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
    });

    it('should reject invalid JSON', () => {
      const result = userExportService.importUserExport('invalid json');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to parse');
    });

    it('should reject invalid data structure', () => {
      const invalidData = { invalid: 'data' };
      const result = userExportService.importUserExport(invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('mergeUserExports', () => {
    const export1 = {
      exportVersion: '1.0',
      exportDate: '2024-01-01T00:00:00.000Z',
      user: { id: 'user1', name: 'User 1' },
      questions: [
        { id: 'q1', text: 'Q1', domainId: 'd1', answer: 4, evidence: { text: 'E1' } },
        { id: 'q2', text: 'Q2', domainId: 'd1', answer: 3, evidence: null }
      ]
    };

    const export2 = {
      exportVersion: '1.0',
      exportDate: '2024-01-02T00:00:00.000Z',
      user: { id: 'user2', name: 'User 2' },
      questions: [
        { id: 'q3', text: 'Q3', domainId: 'd2', answer: 5, evidence: { text: 'E3' } }
      ]
    };

    it('should merge multiple user exports', () => {
      const result = userExportService.mergeUserExports([export1, export2]);

      expect(result.users).toHaveLength(2);
      expect(result.allQuestions).toHaveLength(3);
      expect(result.summary.totalUsers).toBe(2);
      expect(result.summary.totalQuestions).toBe(3);
    });

    it('should calculate summary statistics', () => {
      const result = userExportService.mergeUserExports([export1, export2]);

      expect(result.summary.answeredQuestions).toBe(3);
      expect(result.summary.questionsWithEvidence).toBe(2);
    });

    it('should include user information in merged questions', () => {
      const result = userExportService.mergeUserExports([export1, export2]);

      const q1 = result.allQuestions.find(q => q.id === 'q1');
      expect(q1.userId).toBe('user1');
      expect(q1.userName).toBe('User 1');
    });

    it('should handle empty exports array', () => {
      const result = userExportService.mergeUserExports([]);

      expect(result.users).toHaveLength(0);
      expect(result.allQuestions).toHaveLength(0);
      expect(result.summary.totalUsers).toBe(0);
    });
  });

  describe('generateSummaryReport', () => {
    const mergedData = {
      mergeDate: '2024-01-01T00:00:00.000Z',
      users: [
        { id: 'user1', name: 'User 1', exportDate: '2024-01-01', questionCount: 2 },
        { id: 'user2', name: 'User 2', exportDate: '2024-01-02', questionCount: 1 }
      ],
      allQuestions: [
        { id: 'q1', domainId: 'd1', userId: 'user1', answer: 4, evidence: { text: 'E1' } },
        { id: 'q2', domainId: 'd1', userId: 'user1', answer: 3, evidence: null },
        { id: 'q3', domainId: 'd2', userId: 'user2', answer: 5, evidence: { text: 'E3' } }
      ],
      summary: {
        totalUsers: 2,
        totalQuestions: 3,
        answeredQuestions: 3,
        questionsWithEvidence: 2
      }
    };

    it('should generate summary report', () => {
      const report = userExportService.generateSummaryReport(mergedData);

      expect(report.overview.totalUsers).toBe(2);
      expect(report.overview.totalQuestions).toBe(3);
      expect(report.overview.completionRate).toBe('100.00');
      expect(report.overview.evidenceRate).toBe('66.67');
    });

    it('should include user summaries', () => {
      const report = userExportService.generateSummaryReport(mergedData);

      expect(report.userSummaries).toHaveLength(2);
      
      const user1Summary = report.userSummaries.find(u => u.userId === 'user1');
      expect(user1Summary.totalQuestions).toBe(2);
      expect(user1Summary.answeredQuestions).toBe(2);
      expect(user1Summary.completionRate).toBe('100.00');
    });

    it('should include domain breakdown', () => {
      const report = userExportService.generateSummaryReport(mergedData);

      expect(report.domainBreakdown).toBeDefined();
      expect(report.domainBreakdown.d1).toBeDefined();
      expect(report.domainBreakdown.d1.totalQuestions).toBe(2);
      expect(report.domainBreakdown.d1.averageScore).toBe('3.50');
    });

    it('should handle zero questions', () => {
      const emptyData = {
        users: [],
        allQuestions: [],
        summary: { totalUsers: 0, totalQuestions: 0, answeredQuestions: 0, questionsWithEvidence: 0 }
      };

      const report = userExportService.generateSummaryReport(emptyData);
      expect(report.overview.completionRate).toBe(0);
      expect(report.overview.evidenceRate).toBe(0);
    });
  });

  describe('calculateDomainBreakdown', () => {
    const questions = [
      { id: 'q1', domainId: 'd1', answer: 4, evidence: { text: 'E1' } },
      { id: 'q2', domainId: 'd1', answer: 3, evidence: null },
      { id: 'q3', domainId: 'd2', answer: 5, evidence: { text: 'E3' } },
      { id: 'q4', domainId: 'd2', answer: null, evidence: null }
    ];

    it('should calculate domain statistics', () => {
      const breakdown = userExportService.calculateDomainBreakdown(questions);

      expect(breakdown.d1.totalQuestions).toBe(2);
      expect(breakdown.d1.answeredQuestions).toBe(2);
      expect(breakdown.d1.questionsWithEvidence).toBe(1);
      expect(breakdown.d1.averageScore).toBe('3.50');
    });

    it('should handle domains with unanswered questions', () => {
      const breakdown = userExportService.calculateDomainBreakdown(questions);

      expect(breakdown.d2.totalQuestions).toBe(2);
      expect(breakdown.d2.answeredQuestions).toBe(1);
      expect(breakdown.d2.averageScore).toBe('5.00');
    });

    it('should handle empty questions array', () => {
      const breakdown = userExportService.calculateDomainBreakdown([]);
      expect(Object.keys(breakdown)).toHaveLength(0);
    });
  });

  describe('downloadUserExport', () => {
    beforeEach(() => {
      /* eslint-disable no-undef */
      // Mock DOM APIs
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = vi.fn();
      global.Blob = class MockBlob {
        constructor(content, options) {
          this.content = content;
          this.options = options;
        }
      };
      
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };
      global.document.createElement = vi.fn(() => mockLink);
    });


    it('should trigger download', () => {
      userExportService.downloadUserExport(
        mockUserId,
        mockUserName,
        mockQuestions,
        mockAnswers,
        mockEvidence
      );

      expect(global.document.createElement).toHaveBeenCalledWith('a');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      /* eslint-enable no-undef */
    });
  });

  describe('downloadMergedReport', () => {
    beforeEach(() => {
      /* eslint-disable no-undef */
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = vi.fn();
      global.Blob = class MockBlob { constructor(content, options) { this.content = content; this.options = options; } };
      
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };
      global.document.createElement = vi.fn(() => mockLink);
    });


    it('should download merged report', () => {
      const mergedData = {
        users: [],
        allQuestions: [],
        summary: { totalUsers: 0, totalQuestions: 0, answeredQuestions: 0, questionsWithEvidence: 0 }
      };

      userExportService.downloadMergedReport(mergedData);

      expect(global.document.createElement).toHaveBeenCalledWith('a');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      /* eslint-enable no-undef */
    });
  });
});