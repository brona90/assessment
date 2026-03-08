import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';

export const useUser = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const loadedUsers = await userService.loadUsers();
      setUsers(loadedUsers);

      // Always start with no user selected - user must choose from selection screen
      setCurrentUser(null);

      setLoading(false);
    };

    loadData();
  }, []);

  const selectUser = (user) => {
    setCurrentUser(user);
    userService.setCurrentUser(user);
  };

  // Stable references — only change when currentUser changes
  const isAdmin = useCallback(() => {
    return userService.isAdmin(currentUser);
  }, [currentUser]);

  const canAccessQuestion = useCallback((questionId) => {
    return userService.canAccessQuestion(currentUser, questionId);
  }, [currentUser]);

  const getAssignedQuestions = useCallback(() => {
    return userService.getUserAssignedQuestions(currentUser);
  }, [currentUser]);

  return {
    users,
    currentUser,
    loading,
    selectUser,
    isAdmin,
    canAccessQuestion,
    getAssignedQuestions
  };
};