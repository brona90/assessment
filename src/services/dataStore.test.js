import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dataStore } from './dataStore';

describe('DataStore', () => {
  beforeEach(() => {
    dataStore.reset();
  });

  describe('initialization', () => {
    it('should initialize with empty data', async () => {
      expect(dataStore.data.domains).toEqual({});
      expect(dataStore.data.users).toEqual([]);
      expect(dataStore.data.frameworks).toEqual([]);
      expect(dataStore.data.questions).toEqual([]);
      expect(dataStore.initialized).toBe(false);
    });

    it('should initialize from JSON files', async () => {
      // eslint-disable-next-line no-undef
    global.fetch = vi.fn()
        .mockResolvedValueOnce({
          json: async () => ({
            domains: {
              domain1: {
                id: 'domain1',
                title: 'Test Domain',
                categories: {
                  cat1: {
                    questions: [
                      { id: 'q1', text: 'Question 1' }
                    ]
                  }
                }
              }
            }
          })
        })
        .mockResolvedValueOnce({
          json: async () => ({
            users: [
              { id: 'user1', name: 'Test User' }
            ]
          })
        })
        .mockResolvedValueOnce({
          json: async () => ({
            frameworks: [
              { id: 'fw1', name: 'Framework 1' }
            ]
          })
        });

      await dataStore.initialize();

      expect(dataStore.initialized).toBe(true);
      expect(Object.keys(dataStore.data.domains)).toHaveLength(1);
      expect(dataStore.data.users).toHaveLength(1);
      expect(dataStore.data.frameworks).toHaveLength(1);
      expect(dataStore.data.questions).toHaveLength(1);
    });

    it('should add domainTitle and categoryTitle to extracted questions', async () => {
      // eslint-disable-next-line no-undef
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          json: async () => ({
            domains: {
              domain1: {
                id: 'domain1',
                title: 'My Domain Title',
                categories: {
                  cat1: {
                    title: 'My Category Title',
                    questions: [{ id: 'q1', text: 'Question 1' }]
                  }
                }
              }
            }
          })
        })
        .mockResolvedValueOnce({ json: async () => ({ users: [] }) })
        .mockResolvedValueOnce({ json: async () => ({ frameworks: [] }) });

      await dataStore.initialize();

      const q = dataStore.data.questions[0];
      expect(q.domainTitle).toBe('My Domain Title');
      expect(q.categoryTitle).toBe('My Category Title');
      expect(q.domainId).toBe('domain1');
      expect(q.categoryId).toBe('cat1');
    });
  });

  describe('domain operations', () => {
    beforeEach(() => {
      dataStore.data.domains = {
        domain1: { id: 'domain1', title: 'Domain 1', categories: {} }
      };
      dataStore.initialized = true;
    });

    it('should get all domains', async () => {
      const domains = dataStore.getDomains();
      expect(Object.keys(domains)).toHaveLength(1);
      expect(domains.domain1.title).toBe('Domain 1');
    });

    it('should get a single domain', async () => {
      const domain = dataStore.getDomain('domain1');
      expect(domain.title).toBe('Domain 1');
    });

    it('should add a new domain', async () => {
      const newDomain = {
        id: 'domain2',
        title: 'Domain 2',
        weight: 1
      };
      
      const added = dataStore.addDomain(newDomain);
      expect(added.id).toBe('domain2');
      expect(added.categories).toEqual({});
      expect(Object.keys(dataStore.data.domains)).toHaveLength(2);
    });

    it('should throw error when adding domain without id', () => {
      expect(() => {
        dataStore.addDomain({ title: 'No ID' });
      }).toThrow('Domain must have an id');
    });

    it('should throw error when adding duplicate domain', () => {
      expect(() => {
        dataStore.addDomain({ id: 'domain1', title: 'Duplicate' });
      }).toThrow('already exists');
    });

    it('should update an existing domain', async () => {
      const updated = dataStore.updateDomain('domain1', { title: 'Updated Domain' });
      expect(updated.title).toBe('Updated Domain');
      expect(updated.id).toBe('domain1');
    });

    it('should throw error when updating non-existent domain', () => {
      expect(() => {
        dataStore.updateDomain('nonexistent', { title: 'Test' });
      }).toThrow('not found');
    });

    it('should delete a domain', async () => {
      const result = dataStore.deleteDomain('domain1');
      expect(result).toBe(true);
      expect(dataStore.data.domains.domain1).toBeUndefined();
    });

    it('should throw error when deleting non-existent domain', () => {
      expect(() => {
        dataStore.deleteDomain('nonexistent');
      }).toThrow('not found');
    });
  });

  describe('framework operations', () => {
    beforeEach(() => {
      dataStore.data.frameworks = [
        { id: 'fw1', name: 'Framework 1' },
        { id: 'fw2', name: 'Framework 2' }
      ];
      dataStore.data.selectedFrameworks = ['fw1'];
      dataStore.initialized = true;
    });

    it('should get all frameworks', async () => {
      const frameworks = dataStore.getFrameworks();
      expect(frameworks).toHaveLength(2);
    });

    it('should get selected frameworks only', async () => {
      const selected = dataStore.getSelectedFrameworks();
      expect(selected).toHaveLength(1);
      expect(selected[0].id).toBe('fw1');
    });

    it('should add a new framework', async () => {
      const newFramework = { id: 'fw3', name: 'Framework 3' };
      const added = dataStore.addFramework(newFramework);
      
      expect(added.id).toBe('fw3');
      expect(dataStore.data.frameworks).toHaveLength(3);
    });

    it('should throw error when adding framework without id', () => {
      expect(() => {
        dataStore.addFramework({ name: 'No ID' });
      }).toThrow('Framework must have an id');
    });

    it('should update an existing framework', async () => {
      const updated = dataStore.updateFramework('fw1', { name: 'Updated Framework' });
      expect(updated.name).toBe('Updated Framework');
      expect(updated.id).toBe('fw1');
    });

    it('should delete a framework', async () => {
      const result = dataStore.deleteFramework('fw2');
      expect(result).toBe(true);
      expect(dataStore.data.frameworks).toHaveLength(1);
    });

    it('should set selected frameworks', async () => {
      const selected = dataStore.setSelectedFrameworks(['fw1', 'fw2']);
      expect(selected).toHaveLength(2);
      expect(dataStore.data.selectedFrameworks).toEqual(['fw1', 'fw2']);
    });

    it('should throw error when setting invalid framework IDs', () => {
      expect(() => {
        dataStore.setSelectedFrameworks(['nonexistent']);
      }).toThrow('not found');
    });
  });

  describe('user operations', () => {
    beforeEach(() => {
      dataStore.data.users = [
        { id: 'user1', name: 'User 1', role: 'user' }
      ];
      dataStore.data.assignments = { user1: [] };
      dataStore.initialized = true;
    });

    it('should get all users', async () => {
      const users = dataStore.getUsers();
      expect(users).toHaveLength(1);
    });

    it('should get a single user', async () => {
      const user = dataStore.getUser('user1');
      expect(user.name).toBe('User 1');
    });

    it('should add a new user', async () => {
      const newUser = { id: 'user2', name: 'User 2', role: 'user' };
      const added = dataStore.addUser(newUser);
      
      expect(added.id).toBe('user2');
      expect(dataStore.data.users).toHaveLength(2);
      expect(dataStore.data.assignments.user2).toEqual([]);
    });

    it('should throw error when adding user without id', () => {
      expect(() => {
        dataStore.addUser({ name: 'No ID' });
      }).toThrow('User must have an id');
    });

    it('should update an existing user', async () => {
      const updated = dataStore.updateUser('user1', { name: 'Updated User' });
      expect(updated.name).toBe('Updated User');
      expect(updated.id).toBe('user1');
    });

    it('should delete a user', async () => {
      const result = dataStore.deleteUser('user1');
      expect(result).toBe(true);
      expect(dataStore.data.users).toHaveLength(0);
      expect(dataStore.data.assignments.user1).toBeUndefined();
    });
  });

  describe('question operations', () => {
    beforeEach(() => {
      dataStore.data.domains = {
        domain1: {
          id: 'domain1',
          categories: {
            cat1: {
              questions: [
                { id: 'q1', text: 'Question 1', domainId: 'domain1', categoryId: 'cat1' }
              ]
            }
          }
        }
      };
      dataStore.data.questions = [
        { id: 'q1', text: 'Question 1', domainId: 'domain1', categoryId: 'cat1' }
      ];
      dataStore.data.assignments = { user1: ['q1'] };
      dataStore.initialized = true;
    });

    it('should get all questions', async () => {
      const questions = dataStore.getQuestions();
      expect(questions).toHaveLength(1);
    });

    it('should get questions by domain', async () => {
      const questions = dataStore.getQuestionsByDomain('domain1');
      expect(questions).toHaveLength(1);
      expect(questions[0].domainId).toBe('domain1');
    });

    it('should get questions for a user', async () => {
      const questions = dataStore.getQuestionsForUser('user1');
      expect(questions).toHaveLength(1);
      expect(questions[0].id).toBe('q1');
    });

    it('should add a new question', async () => {
      const newQuestion = {
        id: 'q2',
        text: 'Question 2',
        domainId: 'domain1',
        categoryId: 'cat1'
      };
      
      const added = dataStore.addQuestion(newQuestion);
      expect(added.id).toBe('q2');
      expect(dataStore.data.questions).toHaveLength(2);
    });

    it('should throw error when adding question without required fields', () => {
      expect(() => {
        dataStore.addQuestion({ text: 'No ID' });
      }).toThrow('Question must have an id');

      expect(() => {
        dataStore.addQuestion({ id: 'q2', text: 'No domain' });
      }).toThrow('Question must have a domainId');

      expect(() => {
        dataStore.addQuestion({ id: 'q2', text: 'No category', domainId: 'domain1' });
      }).toThrow('Question must have a categoryId');
    });

    it('should update an existing question', async () => {
      const updated = dataStore.updateQuestion('q1', { text: 'Updated Question' });
      expect(updated.text).toBe('Updated Question');
      expect(updated.id).toBe('q1');
    });

    it('should delete a question', async () => {
      const result = dataStore.deleteQuestion('q1');
      expect(result).toBe(true);
      expect(dataStore.data.questions).toHaveLength(0);
      expect(dataStore.data.assignments.user1).toHaveLength(0);
    });
  });

  describe('assignment operations', () => {
    beforeEach(() => {
      dataStore.data.users = [
        { id: 'user1', name: 'User 1' }
      ];
      dataStore.data.questions = [
        { id: 'q1', text: 'Question 1' },
        { id: 'q2', text: 'Question 2' }
      ];
      dataStore.data.assignments = { user1: [] };
      dataStore.initialized = true;
    });

    it('should get user assignments', async () => {
      const assignments = dataStore.getUserAssignments('user1');
      expect(assignments).toEqual([]);
    });

    it('should assign questions to user', async () => {
      const assigned = dataStore.assignQuestionsToUser('user1', ['q1', 'q2']);
      expect(assigned).toHaveLength(2);
      expect(assigned).toContain('q1');
      expect(assigned).toContain('q2');
    });

    it('should throw error when assigning to non-existent user', () => {
      expect(() => {
        dataStore.assignQuestionsToUser('nonexistent', ['q1']);
      }).toThrow('not found');
    });

    it('should add question assignments', async () => {
      dataStore.data.assignments.user1 = ['q1'];
      const assigned = dataStore.addQuestionAssignments('user1', ['q2']);
      
      expect(assigned).toHaveLength(2);
      expect(assigned).toContain('q1');
      expect(assigned).toContain('q2');
    });

    it('should remove question assignments', async () => {
      dataStore.data.assignments.user1 = ['q1', 'q2'];
      const remaining = dataStore.removeQuestionAssignments('user1', ['q1']);

      expect(remaining).toHaveLength(1);
      expect(remaining).toContain('q2');
    });

    it('should persist assignments to localStorage when assigning questions', async () => {
      dataStore.assignQuestionsToUser('user1', ['q1', 'q2']);
      const stored = localStorage.getItem('adminAssignments');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored);
      expect(parsed.user1).toEqual(['q1', 'q2']);
    });
  });

  describe('export/import operations', () => {
    beforeEach(() => {
      dataStore.data = {
        domains: { domain1: { id: 'domain1', title: 'Domain 1' } },
        users: [{ id: 'user1', name: 'User 1' }],
        frameworks: [{ id: 'fw1', name: 'Framework 1' }],
        questions: [{ id: 'q1', text: 'Question 1' }],
        assignments: { user1: ['q1'] },
        selectedFrameworks: ['fw1']
      };
      dataStore.initialized = true;
    });

    it('should export data as JSON string', async () => {
      const exported = await dataStore.exportData();
      expect(typeof exported).toBe('string');
      
      const parsed = JSON.parse(exported);
      expect(parsed.domains).toBeDefined();
      expect(parsed.users).toBeDefined();
      expect(parsed.frameworks).toBeDefined();
    });

    it('should import data from JSON string', async () => {
      const jsonData = JSON.stringify({
        domains: {},
        users: [],
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: []
      });

      const result = await dataStore.importData(jsonData);
      expect(result).toBe(true);
      expect(dataStore.initialized).toBe(true);
    });

    it('should import data from object', async () => {
      const data = {
        domains: {},
        users: [],
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: []
      };

      const result = await dataStore.importData(data);
      expect(result).toBe(true);
    });

    it('should throw error when importing invalid data', async () => {
      await expect(async () => {
        await dataStore.importData('invalid json');
      }).rejects.toThrow();

      await expect(async () => {
        await dataStore.importData({ invalid: 'structure' });
      }).rejects.toThrow('Invalid data structure');
    });
  });

  describe('extractQuestionsFromDomains', () => {
    it('should extract all questions from domains', async () => {
      const domains = {
        domain1: {
          categories: {
            cat1: {
              questions: [
                { id: 'q1', text: 'Question 1' },
                { id: 'q2', text: 'Question 2' }
              ]
            },
            cat2: {
              questions: [
                { id: 'q3', text: 'Question 3' }
              ]
            }
          }
        },
        domain2: {
          categories: {
            cat3: {
              questions: [
                { id: 'q4', text: 'Question 4' }
              ]
            }
          }
        }
      };

      const questions = dataStore.extractQuestionsFromDomains(domains);
      expect(questions).toHaveLength(4);
      expect(questions[0].domainId).toBe('domain1');
      expect(questions[0].categoryId).toBe('cat1');
    });

    it('should handle domains with no categories', async () => {
      const domains = {
        domain1: { categories: {} }
      };

      const questions = dataStore.extractQuestionsFromDomains(domains);
      expect(questions).toHaveLength(0);
    });
  });

  describe('Domain Management', () => {
    it('should delete domain and its questions', async () => {
      dataStore.data.domains = {
        domain1: { title: 'Domain 1', categories: {} },
        domain2: { title: 'Domain 2', categories: {} }
      };

      dataStore.deleteDomain('domain1');
      
      expect(dataStore.data.domains.domain1).toBeUndefined();
      expect(dataStore.data.domains.domain2).toBeDefined();
    });
  });

  describe('User Assignment Validation', () => {
    it('should throw error when assigning to non-existent user', () => {
      dataStore.data.users = [{ id: 'user1', name: 'User 1' }];

      expect(() => {
        dataStore.assignQuestionsToUser('nonexistent', ['q1']);
      }).toThrow('User with id nonexistent not found');
    });
  });

  describe('Data Download', () => {
    it('should download data as JSON file', async () => {
      // Mock DOM APIs
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      await dataStore.downloadData('test-data.json');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.download).toBe('test-data.json');
      expect(mockLink.click).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');

      createElementSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it('should use default filename when not provided', async () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      await dataStore.downloadData();

      expect(mockLink.download).toBe('assessment-data.json');
    });
  });

  describe('Question Error Handling', () => {
    it('should throw error when deleting non-existent question', () => {
      dataStore.data.questions = [{ id: 'q1', text: 'Question 1' }];

      expect(() => {
        dataStore.deleteQuestion('nonexistent');
      }).toThrow('Question with id nonexistent not found');
    });

    it('should throw error when assigning non-existent question to user', () => {
      dataStore.data.users = [{ id: 'user1', name: 'User 1' }];
      dataStore.data.questions = [{ id: 'q1', text: 'Question 1' }];

      expect(() => {
        dataStore.assignQuestionsToUser('user1', ['nonexistent']);
      }).toThrow('Question with id nonexistent not found');
    });
  });

  describe('User Assignment Error Handling', () => {
    it('should throw error when adding assignments to non-existent user', () => {
      dataStore.data.users = [{ id: 'user1', name: 'User 1' }];

      expect(() => {
        dataStore.addQuestionAssignments('nonexistent', ['q1']);
      }).toThrow('User with id nonexistent not found');
    });

    it('should throw error when removing assignments from non-existent user', () => {
      dataStore.data.users = [{ id: 'user1', name: 'User 1' }];

      expect(() => {
        dataStore.removeQuestionAssignments('nonexistent', ['q1']);
      }).toThrow('User with id nonexistent not found');
    });
  });

  describe('Question Addition Edge Cases', () => {
    it('should throw error when adding duplicate question', () => {
      dataStore.data.questions = [{ id: 'q1', text: 'Question 1', domainId: 'd1', categoryId: 'c1' }];

      expect(() => {
        dataStore.addQuestion({ id: 'q1', text: 'Duplicate', domainId: 'd1', categoryId: 'c1' });
      }).toThrow('Question with id q1 already exists');
    });

    it('should create category if it does not exist when adding question', async () => {
      dataStore.data.domains = {
        domain1: {
          title: 'Domain 1',
          categories: {}
        }
      };
      dataStore.data.questions = [];
      
      const question = {
        id: 'q1',
        text: 'Question 1',
        domainId: 'domain1',
        categoryId: 'newCategory'
      };
      
      dataStore.addQuestion(question);
      
      expect(dataStore.data.domains.domain1.categories.newCategory).toBeDefined();
      expect(dataStore.data.domains.domain1.categories.newCategory.questions).toContain(question);
    });

    it('should initialize questions array if category exists but has no questions', async () => {
      dataStore.data.domains = {
        domain1: {
          title: 'Domain 1',
          categories: {
            cat1: { title: 'Category 1' }
          }
        }
      };
      dataStore.data.questions = [];
      
      const question = {
        id: 'q1',
        text: 'Question 1',
        domainId: 'domain1',
        categoryId: 'cat1'
      };
      
      dataStore.addQuestion(question);
      
      expect(dataStore.data.domains.domain1.categories.cat1.questions).toBeDefined();
      expect(dataStore.data.domains.domain1.categories.cat1.questions).toContain(question);
    });

    it('should throw error when updating non-existent question', () => {
      dataStore.data.questions = [{ id: 'q1', text: 'Question 1' }];

      expect(() => {
        dataStore.updateQuestion('nonexistent', { text: 'Updated' });
      }).toThrow('Question with id nonexistent not found');
    });
  });

  describe('Framework Management Error Handling', () => {
    it('should throw error when deleting non-existent framework', () => {
      dataStore.data.frameworks = [{ id: 'f1', name: 'Framework 1' }];

      expect(() => {
        dataStore.deleteFramework('nonexistent');
      }).toThrow('Framework with id nonexistent not found');
    });

    it('should throw error when adding duplicate framework', () => {
      dataStore.data.frameworks = [{ id: 'f1', name: 'Framework 1' }];

      expect(() => {
        dataStore.addFramework({ id: 'f1', name: 'Duplicate' });
      }).toThrow('Framework with id f1 already exists');
    });

    it('should throw error when updating non-existent framework', () => {
      dataStore.data.frameworks = [{ id: 'f1', name: 'Framework 1' }];

      expect(() => {
        dataStore.updateFramework('nonexistent', { name: 'Updated' });
      }).toThrow('Framework with id nonexistent not found');
    });
  });

  describe('User Management Error Handling', () => {
    it('should throw error when adding duplicate user', () => {
      dataStore.data.users = [{ id: 'user1', name: 'User 1', email: 'user1@test.com' }];

      expect(() => {
        dataStore.addUser({ id: 'user1', name: 'Duplicate', email: 'dup@test.com' });
      }).toThrow('User with id user1 already exists');
    });

    it('should throw error when updating non-existent user', () => {
      dataStore.data.users = [{ id: 'user1', name: 'User 1' }];

      expect(() => {
        dataStore.updateUser('nonexistent', { name: 'Updated' });
      }).toThrow('User with id nonexistent not found');
    });

    it('should throw error when deleting non-existent user', () => {
      dataStore.data.users = [{ id: 'user1', name: 'User 1' }];

      expect(() => {
        dataStore.deleteUser('nonexistent');
      }).toThrow('User with id nonexistent not found');
    });
  });

  describe('Enhanced Import Validation', () => {
    it('should provide detailed error for missing domains', async () => {
      const invalidData = {
        users: [],
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: []
      };

      await expect(async () => {
        await dataStore.importData(invalidData);
      }).rejects.toThrow('Missing required field: domains');
    });

    it('should provide detailed error for invalid domains type', async () => {
      const invalidData = {
        domains: [],
        users: [],
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: []
      };

      await expect(async () => {
        await dataStore.importData(invalidData);
      }).rejects.toThrow('Invalid domains: must be an object');
    });

    it('should provide detailed error for missing users', async () => {
      const invalidData = {
        domains: {},
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: []
      };

      await expect(async () => {
        await dataStore.importData(invalidData);
      }).rejects.toThrow('Missing required field: users');
    });

    it('should provide detailed error for invalid users type', async () => {
      const invalidData = {
        domains: {},
        users: {},
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: []
      };

      await expect(async () => {
        await dataStore.importData(invalidData);
      }).rejects.toThrow('Invalid users: must be an array');
    });

    it('should provide detailed error for missing frameworks', async () => {
      const invalidData = {
        domains: {},
        users: [],
        questions: [],
        assignments: {},
        selectedFrameworks: []
      };

      await expect(async () => {
        await dataStore.importData(invalidData);
      }).rejects.toThrow('Missing required field: frameworks');
    });

    it('should provide detailed error for invalid frameworks type', async () => {
      const invalidData = {
        domains: {},
        users: [],
        frameworks: {},
        questions: [],
        assignments: {},
        selectedFrameworks: []
      };

      await expect(async () => {
        await dataStore.importData(invalidData);
      }).rejects.toThrow('Invalid frameworks: must be an array');
    });

    it('should provide detailed error for missing questions', async () => {
      const invalidData = {
        domains: {},
        users: [],
        frameworks: [],
        assignments: {},
        selectedFrameworks: []
      };

      await expect(async () => {
        await dataStore.importData(invalidData);
      }).rejects.toThrow('Missing required field: questions');
    });

    it('should provide detailed error for invalid questions type', async () => {
      const invalidData = {
        domains: {},
        users: [],
        frameworks: [],
        questions: {},
        assignments: {},
        selectedFrameworks: []
      };

      await expect(async () => {
        await dataStore.importData(invalidData);
      }).rejects.toThrow('Invalid questions: must be an array');
    });

    it('should provide detailed error for missing assignments', async () => {
      const invalidData = {
        domains: {},
        users: [],
        frameworks: [],
        questions: [],
        selectedFrameworks: []
      };

      await expect(async () => {
        await dataStore.importData(invalidData);
      }).rejects.toThrow('Missing required field: assignments');
    });

    it('should provide detailed error for invalid assignments type', async () => {
      const invalidData = {
        domains: {},
        users: [],
        frameworks: [],
        questions: [],
        assignments: [],
        selectedFrameworks: []
      };

      await expect(async () => {
        await dataStore.importData(invalidData);
      }).rejects.toThrow('Invalid assignments: must be an object');
    });

    it('should provide detailed error for missing selectedFrameworks', async () => {
      const invalidData = {
        domains: {},
        users: [],
        frameworks: [],
        questions: [],
        assignments: {}
      };

      await expect(async () => {
        await dataStore.importData(invalidData);
      }).rejects.toThrow('Missing required field: selectedFrameworks');
    });

    it('should provide detailed error for invalid selectedFrameworks type', async () => {
      const invalidData = {
        domains: {},
        users: [],
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: {}
      };

      await expect(async () => {
        await dataStore.importData(invalidData);
      }).rejects.toThrow('Invalid selectedFrameworks: must be an array');
    });

    it('should provide multiple validation errors', async () => {
      const invalidData = {
        domains: [],
        users: {},
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: []
      };

      await expect(async () => {
        await dataStore.importData(invalidData);
      }).rejects.toThrow(/Invalid domains.*Invalid users/);
    });

    it('should accept valid data with all required fields', async () => {
      const validData = {
        domains: { domain1: { title: 'Domain 1', categories: {} } },
        users: [{ id: 'user1', name: 'User 1' }],
        frameworks: [{ id: 'fw1', name: 'Framework 1' }],
        questions: [{ id: 'q1', text: 'Question 1' }],
        assignments: { user1: ['q1'] },
        selectedFrameworks: ['fw1']
      };

      const result = await dataStore.importData(validData);
      expect(result).toBe(true);
      expect(dataStore.initialized).toBe(true);
    });

    it('should accept valid data with optional answers field', async () => {
      const validData = {
        domains: {},
        users: [],
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: [],
        answers: { q1: 4, q2: 3 }
      };

      const result = await dataStore.importData(validData);
      expect(result).toBe(true);
      expect(dataStore.data.answers).toEqual({ q1: 4, q2: 3 });
    });

    it('should accept valid data with optional evidence field', async () => {
      const validData = {
        domains: {},
        users: [],
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: [],
        evidence: { q1: { text: 'Evidence text', images: [] } }
      };

      const result = await dataStore.importData(validData);
      expect(result).toBe(true);
      expect(dataStore.data.evidence).toEqual({ q1: { text: 'Evidence text', images: [] } });
    });

    it('should provide error for invalid answers type', async () => {
      const invalidData = {
        domains: {},
        users: [],
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: [],
        answers: []
      };

      await expect(async () => {
        await dataStore.importData(invalidData);
      }).rejects.toThrow('Invalid answers: must be an object');
    });

    it('should provide error for invalid evidence type', async () => {
      const invalidData = {
        domains: {},
        users: [],
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: [],
        evidence: []
      };

      await expect(async () => {
        await dataStore.importData(invalidData);
      }).rejects.toThrow('Invalid evidence: must be an object');
    });

    it('should default answers and evidence to empty objects if not provided', async () => {
      const validData = {
        domains: {},
        users: [],
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: []
      };

      const result = await dataStore.importData(validData);
      expect(result).toBe(true);
      expect(dataStore.data.answers).toEqual({});
      expect(dataStore.data.evidence).toEqual({});
    });
  });

  describe('Answers Operations', () => {
    beforeEach(() => {
      dataStore.data.answers = {};
    });

    it('should get all answers', async () => {
      dataStore.data.answers = { q1: 4, q2: 3 };
      const answers = dataStore.getAnswers();
      expect(answers).toEqual({ q1: 4, q2: 3 });
    });

    it('should set answers', async () => {
      const newAnswers = { q1: 5, q2: 4 };
      const result = dataStore.setAnswers(newAnswers);
      expect(result).toEqual(newAnswers);
      expect(dataStore.data.answers).toEqual(newAnswers);
    });

    it('should throw error when setting invalid answers type', () => {
      expect(() => {
        dataStore.setAnswers([]);
      }).toThrow('Answers must be an object');
    });

    it('should update a single answer', async () => {
      dataStore.data.answers = { q1: 3 };
      const result = dataStore.updateAnswer('q2', 4);
      expect(result).toEqual({ q1: 3, q2: 4 });
    });

    it('should clear all answers', async () => {
      dataStore.data.answers = { q1: 4, q2: 3 };
      const result = dataStore.clearAnswers();
      expect(result).toEqual({});
      expect(dataStore.data.answers).toEqual({});
    });
  });

  describe('Evidence Operations', () => {
    beforeEach(() => {
      dataStore.data.evidence = {};
    });

    it('should get all evidence', async () => {
      dataStore.data.evidence = { q1: { text: 'Evidence' } };
      const evidence = dataStore.getEvidence();
      expect(evidence).toEqual({ q1: { text: 'Evidence' } });
    });

    it('should set evidence', async () => {
      const newEvidence = { q1: { text: 'New evidence' } };
      const result = dataStore.setEvidence(newEvidence);
      expect(result).toEqual(newEvidence);
      expect(dataStore.data.evidence).toEqual(newEvidence);
    });

    it('should throw error when setting invalid evidence type', () => {
      expect(() => {
        dataStore.setEvidence([]);
      }).toThrow('Evidence must be an object');
    });

    it('should update evidence for a question', async () => {
      dataStore.data.evidence = { q1: { text: 'Old' } };
      const result = dataStore.updateEvidence('q2', { text: 'New' });
      expect(result).toEqual({ q1: { text: 'Old' }, q2: { text: 'New' } });
    });

    it('should clear all evidence', async () => {
      dataStore.data.evidence = { q1: { text: 'Evidence' } };
      const result = dataStore.clearEvidence();
      expect(result).toEqual({});
      expect(dataStore.data.evidence).toEqual({});
    });

    it('should throw when setting evidence to a string', () => {
      expect(() => dataStore.setEvidence('invalid')).toThrow('Evidence must be an object');
    });

    it('should throw when setting evidence to a number', () => {
      expect(() => dataStore.setEvidence(42)).toThrow('Evidence must be an object');
    });

    it('accepts null as evidence (null passes typeof object check)', () => {
      // typeof null === 'object' and !Array.isArray(null), so no throw
      expect(() => dataStore.setEvidence(null)).not.toThrow();
    });
  });

  describe('importUserExport', () => {
    it('merges answers from user export into data', async () => {
      dataStore.data.answers = { q0: 5 };
      const userExport = {
        exportVersion: '1',
        user: { id: 'u1' },
        questions: [
          { id: 'q1', answer: 3, evidence: null },
          { id: 'q2', answer: 4, evidence: null }
        ]
      };
      const result = await dataStore.importUserExport(userExport);
      expect(result).toBe(true);
      expect(dataStore.data.answers).toMatchObject({ q0: 5, q1: 3, q2: 4 });
    });

    it('merges evidence from user export into data', async () => {
      dataStore.data.evidence = {};
      const userExport = {
        exportVersion: '1',
        user: { id: 'u1' },
        questions: [
          { id: 'q1', answer: 3, evidence: { text: 'proof', photos: [] } }
        ]
      };
      await dataStore.importUserExport(userExport);
      expect(dataStore.data.evidence).toHaveProperty('q1');
      expect(dataStore.data.evidence.q1.text).toBe('proof');
    });

    it('skips questions with null answers', async () => {
      const userExport = {
        exportVersion: '1',
        user: { id: 'u1' },
        questions: [{ id: 'qNull', answer: null, evidence: null }]
      };
      await dataStore.importUserExport(userExport);
      expect(dataStore.data.answers).not.toHaveProperty('qNull');
    });

    it('throws prefixed error when questions property is missing', async () => {
      const badExport = { exportVersion: '1', user: { id: 'u1' } }; // no .questions
      await expect(dataStore.importUserExport(badExport))
        .rejects.toThrow('Failed to import user export:');
    });
  });

  describe('downloadData error re-throw', () => {
    it('re-throws when URL.createObjectURL throws', async () => {
      vi.spyOn(URL, 'createObjectURL').mockImplementation(() => {
        throw new Error('Blob URL failed');
      });

      await expect(dataStore.downloadData()).rejects.toThrow('Blob URL failed');

      vi.restoreAllMocks();
    });
  });

  describe('import with answer validation (lines 718-721)', () => {
    it('should reject answers with non-number values', async () => {
      const data = {
        domains: {},
        users: [],
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: [],
        answers: { q1: 'invalid' }
      };
      await expect(dataStore.importData(data)).rejects.toThrow('Invalid answer value');
    });

    it('should reject answers with values below 0', async () => {
      const data = {
        domains: {},
        users: [],
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: [],
        answers: { q1: -1 }
      };
      await expect(dataStore.importData(data)).rejects.toThrow('Invalid answer value');
    });

    it('should reject answers with values above 5', async () => {
      const data = {
        domains: {},
        users: [],
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: [],
        answers: { q1: 6 }
      };
      await expect(dataStore.importData(data)).rejects.toThrow('Invalid answer value');
    });

    it('should accept answers with valid number values between 0 and 5', async () => {
      const data = {
        domains: {},
        users: [],
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: [],
        answers: { q1: 0, q2: 2.5, q3: 5 }
      };
      const result = await dataStore.importData(data);
      expect(result).toBe(true);
      expect(dataStore.data.answers).toEqual({ q1: 0, q2: 2.5, q3: 5 });
    });
  });

  describe('import with answers saved to per-user storage (lines 744-754)', () => {
    it('should save imported answers to per-user storage keys', async () => {
      const data = {
        domains: {},
        users: [{ id: 'u1', name: 'User 1' }, { id: 'u2', name: 'User 2' }],
        frameworks: [],
        questions: [{ id: 'q1', text: 'Q1' }, { id: 'q2', text: 'Q2' }],
        assignments: { u1: ['q1'], u2: ['q2'] },
        selectedFrameworks: [],
        answers: { q1: 3, q2: 4 }
      };
      const result = await dataStore.importData(data);
      expect(result).toBe(true);

      // Verify per-user answers were saved to localStorage
      const u1Data = JSON.parse(localStorage.getItem('assessmentData_u1'));
      expect(u1Data).toEqual({ q1: 3 });
      const u2Data = JSON.parse(localStorage.getItem('assessmentData_u2'));
      expect(u2Data).toEqual({ q2: 4 });
    });

    it('should skip users with no matching answers in assignments', async () => {
      const data = {
        domains: {},
        users: [{ id: 'u1', name: 'User 1' }],
        frameworks: [],
        questions: [{ id: 'q1', text: 'Q1' }],
        assignments: { u1: ['q1'] },
        selectedFrameworks: [],
        answers: { q2: 3 } // q2 is not assigned to u1
      };
      const result = await dataStore.importData(data);
      expect(result).toBe(true);

      // u1 should NOT have data saved since q2 is not in their assignments
      const u1Data = localStorage.getItem('assessmentData_u1');
      expect(u1Data).toBeNull();
    });

    it('should handle import with empty answers object', async () => {
      const data = {
        domains: {},
        users: [{ id: 'u1', name: 'User 1' }],
        frameworks: [],
        questions: [],
        assignments: { u1: [] },
        selectedFrameworks: [],
        answers: {}
      };
      const result = await dataStore.importData(data);
      expect(result).toBe(true);
    });
  });

  describe('clearAllData', () => {
    it('should clear all in-memory data and localStorage app keys', async () => {
      // Set up some data
      dataStore.data.domains = { d1: { title: 'Test' } };
      dataStore.data.users = [{ id: 'u1' }];
      dataStore.initialized = true;

      // Set up some localStorage keys
      localStorage.setItem('assessmentData_u1', '{"q1":3}');
      localStorage.setItem('adminAssignments', '{"u1":["q1"]}');
      localStorage.setItem('frameworkMappings', '{"f1":["q1"]}');
      localStorage.setItem('comments_u1', '{"q1":"note"}');
      localStorage.setItem('lastActive_u1', '2025-01-01');
      localStorage.setItem('snapshots_u1', '[]');
      localStorage.setItem('unrelatedKey', 'should-remain');

      const result = await dataStore.clearAllData();
      expect(result).toEqual({ success: true });
      expect(dataStore.initialized).toBe(false);
      expect(dataStore._initPromise).toBeNull();
      expect(dataStore.data.domains).toEqual({});
      expect(dataStore.data.users).toEqual([]);

      // App keys should be removed
      expect(localStorage.getItem('assessmentData_u1')).toBeNull();
      expect(localStorage.getItem('adminAssignments')).toBeNull();
      expect(localStorage.getItem('frameworkMappings')).toBeNull();
      expect(localStorage.getItem('comments_u1')).toBeNull();
      expect(localStorage.getItem('lastActive_u1')).toBeNull();
      expect(localStorage.getItem('snapshots_u1')).toBeNull();

      // Unrelated key should remain
      expect(localStorage.getItem('unrelatedKey')).toBe('should-remain');
    });
  });

  describe('framework updateFramework persists mappedQuestions', () => {
    it('should persist framework mappings to localStorage when mappedQuestions is updated', () => {
      dataStore.data.frameworks = [
        { id: 'f1', name: 'Framework 1', mappedQuestions: [] },
        { id: 'f2', name: 'Framework 2', mappedQuestions: ['q1'] }
      ];

      dataStore.updateFramework('f1', { mappedQuestions: ['q1', 'q2'] });

      const stored = JSON.parse(localStorage.getItem('frameworkMappings'));
      expect(stored).toEqual({
        f1: ['q1', 'q2'],
        f2: ['q1']
      });
    });
  });

  describe('clearAllData error branch', () => {
    it('should return failure when clearAllEvidence throws', async () => {
      dataStore.initialized = true;
      dataStore.data.domains = { d1: { title: 'Test' } };

      // We need to import storageService to mock it
      const { storageService } = await import('./storageService');
      const origClear = storageService.clearAllEvidence;
      storageService.clearAllEvidence = vi.fn().mockRejectedValue(new Error('IndexedDB error'));

      const result = await dataStore.clearAllData();
      expect(result.success).toBe(false);
      expect(result.error).toBe('IndexedDB error');

      storageService.clearAllEvidence = origClear;
    });
  });

  describe('exportData fallback branch', () => {
    it('should fall back to exporting config data when loadAllUsersAnswers throws', async () => {
      dataStore.data = {
        domains: { d1: { title: 'Test' } },
        users: [{ id: 'u1', name: 'User 1' }],
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: [],
        answers: {},
        evidence: {}
      };
      dataStore.initialized = true;

      const { storageService } = await import('./storageService');
      const origLoad = storageService.loadAllUsersAnswers;
      storageService.loadAllUsersAnswers = vi.fn().mockRejectedValue(new Error('Storage read failed'));

      const result = await dataStore.exportData();
      const parsed = JSON.parse(result);
      // Falls back to this.data which has the config but not merged answers
      expect(parsed.domains).toEqual({ d1: { title: 'Test' } });

      storageService.loadAllUsersAnswers = origLoad;
    });
  });

  describe('importData detects user export format', () => {
    it('should route to importUserExport when data has exportVersion and user and questions', async () => {
      dataStore.data.answers = {};
      dataStore.data.evidence = {};

      const userExportJson = {
        exportVersion: '1.0',
        user: { id: 'u1', name: 'Test User' },
        questions: [
          { id: 'q1', answer: 4, evidence: null },
          { id: 'q2', answer: 3, evidence: { text: 'proof' } }
        ]
      };

      const result = await dataStore.importData(userExportJson);
      expect(result).toBe(true);
      expect(dataStore.data.answers.q1).toBe(4);
      expect(dataStore.data.answers.q2).toBe(3);
      expect(dataStore.data.evidence.q2.text).toBe('proof');
    });

    it('should also accept a JSON string for importData', async () => {
      dataStore.data.answers = {};
      dataStore.data.evidence = {};

      const validData = {
        domains: {},
        users: [],
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: []
      };

      const result = await dataStore.importData(JSON.stringify(validData));
      expect(result).toBe(true);
    });
  });
});