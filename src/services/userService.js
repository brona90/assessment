export const userService = {
  async loadUsers() {
    try {
      const response = await fetch('/assessment/data/users.json');
      if (!response.ok) throw new Error('Failed to load users');
      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  },

  getCurrentUser() {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  },

  isAdmin(user) {
    if (!user) return false;
    return user.role === 'admin';
  },

  canAccessQuestion(user, questionId) {
    if (!user) return true; // No user selected = see all
    if (this.isAdmin(user)) return true; // Admin sees all
    if (!user.assignedQuestions) return false; // No assigned questions
    return user.assignedQuestions.includes(questionId);
  },

  getUserAssignedQuestions(user) {
    if (!user) return [];
    if (this.isAdmin(user)) return [];
    return user.assignedQuestions || [];
  }
};