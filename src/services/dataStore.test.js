import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dataStore } from './dataStore';

describe('DataStore', async () => {
  beforeEach(() => {
    dataStore.reset();
  });

  describe('initialization', async () => {
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
  });

  describe('domain operations', async () => {
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

    it('should throw error when adding domain without id', async () => {
      expect(async () => {
        dataStore.addDomain({ title: 'No ID' });
      }).rejects.toThrow('Domain must have an id');
    });

    it('should throw error when adding duplicate domain', async () => {
      expect(async () => {
        dataStore.addDomain({ id: 'domain1', title: 'Duplicate' });
      }).rejects.toThrow('already exists');
    });

    it('should update an existing domain', async () => {
      const updated = dataStore.updateDomain('domain1', { title: 'Updated Domain' });
      expect(updated.title).toBe('Updated Domain');
      expect(updated.id).toBe('domain1');
    });

    it('should throw error when updating non-existent domain', async () => {
      expect(async () => {
        dataStore.updateDomain('nonexistent', { title: 'Test' });
      }).rejects.toThrow('not found');
    });

    it('should delete a domain', async () => {
      const result = dataStore.deleteDomain('domain1');
      expect(result).toBe(true);
      expect(dataStore.data.domains.domain1).toBeUndefined();
    });

    it('should throw error when deleting non-existent domain', async () => {
      expect(async () => {
        dataStore.deleteDomain('nonexistent');
      }).rejects.toThrow('not found');
    });
  });

  describe('framework operations', async () => {
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

    it('should throw error when adding framework without id', async () => {
      expect(async () => {
        dataStore.addFramework({ name: 'No ID' });
      }).rejects.toThrow('Framework must have an id');
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

    it('should throw error when setting invalid framework IDs', async () => {
      expect(async () => {
        dataStore.setSelectedFrameworks(['nonexistent']);
      }).rejects.toThrow('not found');
    });
  });

  describe('user operations', async () => {
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

    it('should throw error when adding user without id', async () => {
      expect(async () => {
        dataStore.addUser({ name: 'No ID' });
      }).rejects.toThrow('User must have an id');
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

  describe('question operations', async () => {
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

    it('should throw error when adding question without required fields', async () => {
      expect(async () => {
        dataStore.addQuestion({ text: 'No ID' });
      }).rejects.toThrow('Question must have an id');

      expect(async () => {
        dataStore.addQuestion({ id: 'q2', text: 'No domain' });
      }).rejects.toThrow('Question must have a domainId');

      expect(async () => {
        dataStore.addQuestion({ id: 'q2', text: 'No category', domainId: 'domain1' });
      }).rejects.toThrow('Question must have a categoryId');
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

  describe('assignment operations', async () => {
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

    it('should throw error when assigning to non-existent user', async () => {
      expect(async () => {
        dataStore.assignQuestionsToUser('nonexistent', ['q1']);
      }).rejects.toThrow('not found');
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
  });

  describe('export/import operations', async () => {
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
      expect(async () => {
        await dataStore.importData('invalid json');
      }).rejects.toThrow();

      expect(async () => {
        await dataStore.importData({ invalid: 'structure' });
      }).rejects.toThrow('Invalid data structure');
    });
  });

  describe('extractQuestionsFromDomains', async () => {
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

  describe('Domain Management', async () => {
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

  describe('User Assignment Validation', async () => {
    it('should throw error when assigning to non-existent user', async () => {
      dataStore.data.users = [{ id: 'user1', name: 'User 1' }];
      
      expect(async () => {
        dataStore.assignQuestionsToUser('nonexistent', ['q1']);
      }).rejects.toThrow('User with id nonexistent not found');
    });
  });

  describe('Data Download', async () => {
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

  describe('Question Error Handling', async () => {
    it('should throw error when deleting non-existent question', async () => {
      dataStore.data.questions = [{ id: 'q1', text: 'Question 1' }];
      
      expect(async () => {
        dataStore.deleteQuestion('nonexistent');
      }).rejects.toThrow('Question with id nonexistent not found');
    });

    it('should throw error when assigning non-existent question to user', async () => {
      dataStore.data.users = [{ id: 'user1', name: 'User 1' }];
      dataStore.data.questions = [{ id: 'q1', text: 'Question 1' }];
      
      expect(async () => {
        dataStore.assignQuestionsToUser('user1', ['nonexistent']);
      }).rejects.toThrow('Question with id nonexistent not found');
    });
  });

  describe('User Assignment Error Handling', async () => {
    it('should throw error when adding assignments to non-existent user', async () => {
      dataStore.data.users = [{ id: 'user1', name: 'User 1' }];
      
      expect(async () => {
        dataStore.addQuestionAssignments('nonexistent', ['q1']);
      }).rejects.toThrow('User with id nonexistent not found');
    });

    it('should throw error when removing assignments from non-existent user', async () => {
      dataStore.data.users = [{ id: 'user1', name: 'User 1' }];
      
      expect(async () => {
        dataStore.removeQuestionAssignments('nonexistent', ['q1']);
      }).rejects.toThrow('User with id nonexistent not found');
    });
  });

  describe('Question Addition Edge Cases', async () => {
    it('should throw error when adding duplicate question', async () => {
      dataStore.data.questions = [{ id: 'q1', text: 'Question 1', domainId: 'd1', categoryId: 'c1' }];
      
      expect(async () => {
        dataStore.addQuestion({ id: 'q1', text: 'Duplicate', domainId: 'd1', categoryId: 'c1' });
      }).rejects.toThrow('Question with id q1 already exists');
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

    it('should throw error when updating non-existent question', async () => {
      dataStore.data.questions = [{ id: 'q1', text: 'Question 1' }];
      
      expect(async () => {
        dataStore.updateQuestion('nonexistent', { text: 'Updated' });
      }).rejects.toThrow('Question with id nonexistent not found');
    });
  });

  describe('Framework Management Error Handling', async () => {
    it('should throw error when deleting non-existent framework', async () => {
      dataStore.data.frameworks = [{ id: 'f1', name: 'Framework 1' }];
      
      expect(async () => {
        dataStore.deleteFramework('nonexistent');
      }).rejects.toThrow('Framework with id nonexistent not found');
    });

    it('should throw error when adding duplicate framework', async () => {
      dataStore.data.frameworks = [{ id: 'f1', name: 'Framework 1' }];
      
      expect(async () => {
        dataStore.addFramework({ id: 'f1', name: 'Duplicate' });
      }).rejects.toThrow('Framework with id f1 already exists');
    });

    it('should throw error when updating non-existent framework', async () => {
      dataStore.data.frameworks = [{ id: 'f1', name: 'Framework 1' }];
      
      expect(async () => {
        dataStore.updateFramework('nonexistent', { name: 'Updated' });
      }).rejects.toThrow('Framework with id nonexistent not found');
    });
  });

  describe('User Management Error Handling', async () => {
    it('should throw error when adding duplicate user', async () => {
      dataStore.data.users = [{ id: 'user1', name: 'User 1', email: 'user1@test.com' }];
      
      expect(async () => {
        dataStore.addUser({ id: 'user1', name: 'Duplicate', email: 'dup@test.com' });
      }).rejects.toThrow('User with id user1 already exists');
    });

    it('should throw error when updating non-existent user', async () => {
      dataStore.data.users = [{ id: 'user1', name: 'User 1' }];
      
      expect(async () => {
        dataStore.updateUser('nonexistent', { name: 'Updated' });
      }).rejects.toThrow('User with id nonexistent not found');
    });

    it('should throw error when deleting non-existent user', async () => {
      dataStore.data.users = [{ id: 'user1', name: 'User 1' }];
      
      expect(async () => {
        dataStore.deleteUser('nonexistent');
      }).rejects.toThrow('User with id nonexistent not found');
    });
  });

  describe('Enhanced Import Validation', async () => {
    it('should provide detailed error for missing domains', async () => {
      const invalidData = {
        users: [],
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: []
      };

      expect(async () => {
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

      expect(async () => {
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

      expect(async () => {
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

      expect(async () => {
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

      expect(async () => {
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

      expect(async () => {
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

      expect(async () => {
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

      expect(async () => {
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

      expect(async () => {
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

      expect(async () => {
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

      expect(async () => {
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

      expect(async () => {
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

      expect(async () => {
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

      expect(async () => {
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

      expect(async () => {
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

  describe('Answers Operations', async () => {
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

    it('should throw error when setting invalid answers type', async () => {
      expect(async () => {
        dataStore.setAnswers([]);
      }).rejects.toThrow('Answers must be an object');
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

  describe('Evidence Operations', async () => {
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

    it('should throw error when setting invalid evidence type', async () => {
      expect(async () => {
        dataStore.setEvidence([]);
      }).rejects.toThrow('Evidence must be an object');
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
  });
});