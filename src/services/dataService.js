export const dataService = {
  async loadQuestions() {
    try {
      const response = await fetch('/assessment/data/questions.json');
      if (!response.ok) throw new Error('Failed to load questions');
      const data = await response.json();
      return data.domains;
    } catch (error) {
      console.error('Error loading questions:', error);
      return null;
    }
  },

  async loadUsers() {
    try {
      const response = await fetch('/assessment/data/users.json');
      if (!response.ok) throw new Error('Failed to load users');
      return await response.json();
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  },

  async loadCompliance() {
    try {
      const response = await fetch('/assessment/data/compliance.json');
      if (!response.ok) throw new Error('Failed to load compliance');
      return await response.json();
    } catch (error) {
      console.error('Error loading compliance:', error);
      return { frameworks: [] };
    }
  },

  async loadServices() {
    try {
      const response = await fetch('/assessment/data/services.json');
      if (!response.ok) throw new Error('Failed to load services');
      return await response.json();
    } catch (error) {
      console.error('Error loading services:', error);
      return [];
    }
  },

  async loadBenchmarks() {
    try {
      const response = await fetch('/assessment/data/benchmarks.json');
      if (!response.ok) throw new Error('Failed to load benchmarks');
      return await response.json();
    } catch (error) {
      console.error('Error loading benchmarks:', error);
      return {};
    }
  }
};