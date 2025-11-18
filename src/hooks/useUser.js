import { useState, useEffect } from 'react';
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

  const isAdmin = () => {
    return userService.isAdmin(currentUser);
  };

  const canAccessQuestion = (questionId) => {
    return userService.canAccessQuestion(currentUser, questionId);
  };

  const getAssignedQuestions = () => {
    return userService.getUserAssignedQuestions(currentUser);
  };

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