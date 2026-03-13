export const dataService = {
  async loadQuestions() {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}data/questions.json`);
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
      const response = await fetch(`${import.meta.env.BASE_URL}data/users.json`);
      if (!response.ok) throw new Error('Failed to load users');
      return await response.json();
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  },

  async loadCompliance() {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}data/compliance.json`);
      if (!response.ok) throw new Error('Failed to load compliance');
      return await response.json();
    } catch (error) {
      console.error('Error loading compliance:', error);
      return { frameworks: [] };
    }
  },

  async loadBenchmarks() {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}data/benchmarks.json`);
      if (!response.ok) throw new Error('Failed to load benchmarks');
      return await response.json();
    } catch (error) {
      console.error('Error loading benchmarks:', error);
      return {};
    }
  }
};
