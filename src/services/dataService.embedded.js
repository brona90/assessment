// Embedded data service for the single-file build.
// Imports JSON directly so no fetch() calls are needed when the app runs
// as a standalone HTML file (e.g. opened from disk or emailed).
import questionsData from '../../public/data/questions.json';
import usersData from '../../public/data/users.json';
import complianceData from '../../public/data/compliance.json';
import benchmarksData from '../../public/data/benchmarks.json';

export const dataService = {
  async loadQuestions() {
    return questionsData.domains;
  },

  async loadUsers() {
    return usersData;
  },

  async loadCompliance() {
    return complianceData;
  },

  async loadBenchmarks() {
    return benchmarksData;
  },

  async loadServices() {
    return [];
  }
};
