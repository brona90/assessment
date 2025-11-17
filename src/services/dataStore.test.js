import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dataStore } from './dataStore';

describe('DataStore', () => {
  beforeEach(() => {
    dataStore.reset();
  });

  describe('initialization', () => {
    it('should initialize with empty data', () => {
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

  describe('domain operations', () => {
    beforeEach(() => {
      dataStore.data.domains = {
        domain1: { id: 'domain1', title: 'Domain 1', categories: {} }
      };
      dataStore.initialized = true;
    });

    it('should get all domains', () => {
      const domains = dataStore.getDomains();
      expect(Object.keys(domains)).toHaveLength(1);
      expect(domains.domain1.title).toBe('Domain 1');
    });

    it('should get a single domain', () => {
      const domain = dataStore.getDomain('domain1');
      expect(domain.title).toBe('Domain 1');
    });

    it('should add a new domain', () => {
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

    it('should update an existing domain', () => {
      const updated = dataStore.updateDomain('domain1', { title: 'Updated Domain' });
      expect(updated.title).toBe('Updated Domain');
      expect(updated.id).toBe('domain1');
    });

    it('should throw error when updating non-existent domain', () => {
      expect(() => {
        dataStore.updateDomain('nonexistent', { title: 'Test' });
      }).toThrow('not found');
    });

    it('should delete a domain', () => {
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

    it('should get all frameworks', () => {
      const frameworks = dataStore.getFrameworks();
      expect(frameworks).toHaveLength(2);
    });

    it('should get selected frameworks only', () => {
      const selected = dataStore.getSelectedFrameworks();
      expect(selected).toHaveLength(1);
      expect(selected[0].id).toBe('fw1');
    });

    it('should add a new framework', () => {
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

    it('should update an existing framework', () => {
      const updated = dataStore.updateFramework('fw1', { name: 'Updated Framework' });
      expect(updated.name).toBe('Updated Framework');
      expect(updated.id).toBe('fw1');
    });

    it('should delete a framework', () => {
      const result = dataStore.deleteFramework('fw2');
      expect(result).toBe(true);
      expect(dataStore.data.frameworks).toHaveLength(1);
    });

    it('should set selected frameworks', () => {
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

    it('should get all users', () => {
      const users = dataStore.getUsers();
      expect(users).toHaveLength(1);
    });

    it('should get a single user', () => {
      const user = dataStore.getUser('user1');
      expect(user.name).toBe('User 1');
    });

    it('should add a new user', () => {
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

    it('should update an existing user', () => {
      const updated = dataStore.updateUser('user1', { name: 'Updated User' });
      expect(updated.name).toBe('Updated User');
      expect(updated.id).toBe('user1');
    });

    it('should delete a user', () => {
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

    it('should get all questions', () => {
      const questions = dataStore.getQuestions();
      expect(questions).toHaveLength(1);
    });

    it('should get questions by domain', () => {
      const questions = dataStore.getQuestionsByDomain('domain1');
      expect(questions).toHaveLength(1);
      expect(questions[0].domainId).toBe('domain1');
    });

    it('should get questions for a user', () => {
      const questions = dataStore.getQuestionsForUser('user1');
      expect(questions).toHaveLength(1);
      expect(questions[0].id).toBe('q1');
    });

    it('should add a new question', () => {
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

    it('should update an existing question', () => {
      const updated = dataStore.updateQuestion('q1', { text: 'Updated Question' });
      expect(updated.text).toBe('Updated Question');
      expect(updated.id).toBe('q1');
    });

    it('should delete a question', () => {
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

    it('should get user assignments', () => {
      const assignments = dataStore.getUserAssignments('user1');
      expect(assignments).toEqual([]);
    });

    it('should assign questions to user', () => {
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

    it('should add question assignments', () => {
      dataStore.data.assignments.user1 = ['q1'];
      const assigned = dataStore.addQuestionAssignments('user1', ['q2']);
      
      expect(assigned).toHaveLength(2);
      expect(assigned).toContain('q1');
      expect(assigned).toContain('q2');
    });

    it('should remove question assignments', () => {
      dataStore.data.assignments.user1 = ['q1', 'q2'];
      const remaining = dataStore.removeQuestionAssignments('user1', ['q1']);
      
      expect(remaining).toHaveLength(1);
      expect(remaining).toContain('q2');
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

    it('should export data as JSON string', () => {
      const exported = dataStore.exportData();
      expect(typeof exported).toBe('string');
      
      const parsed = JSON.parse(exported);
      expect(parsed.domains).toBeDefined();
      expect(parsed.users).toBeDefined();
      expect(parsed.frameworks).toBeDefined();
    });

    it('should import data from JSON string', () => {
      const jsonData = JSON.stringify({
        domains: {},
        users: [],
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: []
      });

      const result = dataStore.importData(jsonData);
      expect(result).toBe(true);
      expect(dataStore.initialized).toBe(true);
    });

    it('should import data from object', () => {
      const data = {
        domains: {},
        users: [],
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: []
      };

      const result = dataStore.importData(data);
      expect(result).toBe(true);
    });

    it('should throw error when importing invalid data', () => {
      expect(() => {
        dataStore.importData('invalid json');
      }).toThrow();

      expect(() => {
        dataStore.importData({ invalid: 'structure' });
      }).toThrow('Invalid data structure');
    });
  });

  describe('extractQuestionsFromDomains', () => {
    it('should extract all questions from domains', () => {
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

    it('should handle domains with no categories', () => {
      const domains = {
        domain1: { categories: {} }
      };

      const questions = dataStore.extractQuestionsFromDomains(domains);
      expect(questions).toHaveLength(0);
    });
  });

  describe('Domain Management', () => {
    it('should delete domain and its questions', () => {
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
    it('should download data as JSON file', () => {
      // Mock DOM APIs
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      dataStore.downloadData('test-data.json');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.download).toBe('test-data.json');
      expect(mockLink.click).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');

      createElementSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it('should use default filename when not provided', () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      dataStore.downloadData();

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

    it('should create category if it does not exist when adding question', () => {
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

    it('should initialize questions array if category exists but has no questions', () => {
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
    it('should provide detailed error for missing domains', () => {
      const invalidData = {
        users: [],
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: []
      };

      expect(() => {
        dataStore.importData(invalidData);
      }).toThrow('Missing required field: domains');
    });

    it('should provide detailed error for invalid domains type', () => {
      const invalidData = {
        domains: [],
        users: [],
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: []
      };

      expect(() => {
        dataStore.importData(invalidData);
      }).toThrow('Invalid domains: must be an object');
    });

    it('should provide detailed error for missing users', () => {
      const invalidData = {
        domains: {},
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: []
      };

      expect(() => {
        dataStore.importData(invalidData);
      }).toThrow('Missing required field: users');
    });

    it('should provide detailed error for invalid users type', () => {
      const invalidData = {
        domains: {},
        users: {},
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: []
      };

      expect(() => {
        dataStore.importData(invalidData);
      }).toThrow('Invalid users: must be an array');
    });

    it('should provide detailed error for missing frameworks', () => {
      const invalidData = {
        domains: {},
        users: [],
        questions: [],
        assignments: {},
        selectedFrameworks: []
      };

      expect(() => {
        dataStore.importData(invalidData);
      }).toThrow('Missing required field: frameworks');
    });

    it('should provide detailed error for invalid frameworks type', () => {
      const invalidData = {
        domains: {},
        users: [],
        frameworks: {},
        questions: [],
        assignments: {},
        selectedFrameworks: []
      };

      expect(() => {
        dataStore.importData(invalidData);
      }).toThrow('Invalid frameworks: must be an array');
    });

    it('should provide detailed error for missing questions', () => {
      const invalidData = {
        domains: {},
        users: [],
        frameworks: [],
        assignments: {},
        selectedFrameworks: []
      };

      expect(() => {
        dataStore.importData(invalidData);
      }).toThrow('Missing required field: questions');
    });

    it('should provide detailed error for invalid questions type', () => {
      const invalidData = {
        domains: {},
        users: [],
        frameworks: [],
        questions: {},
        assignments: {},
        selectedFrameworks: []
      };

      expect(() => {
        dataStore.importData(invalidData);
      }).toThrow('Invalid questions: must be an array');
    });

    it('should provide detailed error for missing assignments', () => {
      const invalidData = {
        domains: {},
        users: [],
        frameworks: [],
        questions: [],
        selectedFrameworks: []
      };

      expect(() => {
        dataStore.importData(invalidData);
      }).toThrow('Missing required field: assignments');
    });

    it('should provide detailed error for invalid assignments type', () => {
      const invalidData = {
        domains: {},
        users: [],
        frameworks: [],
        questions: [],
        assignments: [],
        selectedFrameworks: []
      };

      expect(() => {
        dataStore.importData(invalidData);
      }).toThrow('Invalid assignments: must be an object');
    });

    it('should provide detailed error for missing selectedFrameworks', () => {
      const invalidData = {
        domains: {},
        users: [],
        frameworks: [],
        questions: [],
        assignments: {}
      };

      expect(() => {
        dataStore.importData(invalidData);
      }).toThrow('Missing required field: selectedFrameworks');
    });

    it('should provide detailed error for invalid selectedFrameworks type', () => {
      const invalidData = {
        domains: {},
        users: [],
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: {}
      };

      expect(() => {
        dataStore.importData(invalidData);
      }).toThrow('Invalid selectedFrameworks: must be an array');
    });

    it('should provide multiple validation errors', () => {
      const invalidData = {
        domains: [],
        users: {},
        frameworks: [],
        questions: [],
        assignments: {},
        selectedFrameworks: []
      };

      expect(() => {
        dataStore.importData(invalidData);
      }).toThrow(/Invalid domains.*Invalid users/);
    });

    it('should accept valid data with all required fields', () => {
      const validData = {
        domains: { domain1: { title: 'Domain 1', categories: {} } },
        users: [{ id: 'user1', name: 'User 1' }],
        frameworks: [{ id: 'fw1', name: 'Framework 1' }],
        questions: [{ id: 'q1', text: 'Question 1' }],
        assignments: { user1: ['q1'] },
        selectedFrameworks: ['fw1']
      };

      const result = dataStore.importData(validData);
      expect(result).toBe(true);
      expect(dataStore.initialized).toBe(true);
    });
  });
});