/* eslint-disable no-unused-vars */
import { useState } from 'react';
import PropTypes from 'prop-types';
import './AdminPanel.css';

export const AdminPanel = ({ 
  domains, 
  users, 
  onUpdateQuestion, 
  onAddQuestion, 
  onDeleteQuestion,
  onUpdateUserAssignments: _onUpdateUserAssignments,
  onAddUser: _onAddUser,
  onDeleteUser
}) => {
  const [activeTab, setActiveTab] = useState('questions');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    id: '',
    text: '',
    requiresEvidence: false
  });

  const handleAddQuestion = () => {
    if (newQuestion.id && newQuestion.text && selectedDomain && selectedCategory) {
      onAddQuestion(selectedDomain, selectedCategory, newQuestion);
      setNewQuestion({ id: '', text: '', requiresEvidence: false });
    }
  };

  const handleUpdateQuestion = () => {
    if (editingQuestion && selectedDomain && selectedCategory) {
      onUpdateQuestion(selectedDomain, selectedCategory, editingQuestion);
      setEditingQuestion(null);
    }
  };

  const handleDeleteQuestion = (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      onDeleteQuestion(selectedDomain, selectedCategory, questionId);
    }
  };

  const getQuestionsForCategory = () => {
    if (!selectedDomain || !selectedCategory || !domains[selectedDomain]) {
      return [];
    }
    const category = domains[selectedDomain].categories?.[selectedCategory];
    return category?.questions || [];
  };

  return (
    <div className="admin-panel" data-testid="admin-panel">
      <div className="admin-header">
        <h2>🔧 Admin Panel</h2>
        <p>Manage questions, users, and assignments</p>
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === 'questions' ? 'active' : ''}
          onClick={() => setActiveTab('questions')}
          data-testid="tab-questions"
        >
          📝 Questions
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
          data-testid="tab-users"
        >
          👥 Users
        </button>
        <button
          className={activeTab === 'assignments' ? 'active' : ''}
          onClick={() => setActiveTab('assignments')}
          data-testid="tab-assignments"
        >
          📋 Assignments
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'questions' && (
          <div className="questions-manager" data-testid="questions-manager">
            <h3>Manage Questions</h3>
            
            <div className="selector-group">
              <select
                value={selectedDomain}
                onChange={(e) => {
                  setSelectedDomain(e.target.value);
                  setSelectedCategory('');
                }}
                data-testid="domain-select"
              >
                <option value="">Select Domain</option>
                {Object.entries(domains).map(([key, domain]) => (
                  <option key={key} value={key}>{domain.title}</option>
                ))}
              </select>

              {selectedDomain && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  data-testid="category-select"
                >
                  <option value="">Select Category</option>
                  {Object.entries(domains[selectedDomain]?.categories || {}).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.title}</option>
                  ))}
                </select>
              )}
            </div>

            {selectedDomain && selectedCategory && (
              <>
                <div className="question-list">
                  <h4>Existing Questions</h4>
                  {getQuestionsForCategory().map(question => (
                    <div key={question.id} className="question-item" data-testid={`question-item-${question.id}`}>
                      <div className="question-info">
                        <strong>{question.id}</strong>: {question.text}
                      </div>
                      <div className="question-actions">
                        <button
                          onClick={() => setEditingQuestion(question)}
                          data-testid={`edit-${question.id}`}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          data-testid={`delete-${question.id}`}
                          className="danger"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="add-question-form">
                  <h4>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h4>
                  <input
                    type="text"
                    placeholder="Question ID (e.g., d1_q1)"
                    value={editingQuestion ? editingQuestion.id : newQuestion.id}
                    onChange={(e) => editingQuestion 
                      ? setEditingQuestion({...editingQuestion, id: e.target.value})
                      : setNewQuestion({...newQuestion, id: e.target.value})
                    }
                    data-testid="question-id-input"
                  />
                  <textarea
                    placeholder="Question text"
                    value={editingQuestion ? editingQuestion.text : newQuestion.text}
                    onChange={(e) => editingQuestion
                      ? setEditingQuestion({...editingQuestion, text: e.target.value})
                      : setNewQuestion({...newQuestion, text: e.target.value})
                    }
                    data-testid="question-text-input"
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={editingQuestion ? editingQuestion.requiresEvidence : newQuestion.requiresEvidence}
                      onChange={(e) => editingQuestion
                        ? setEditingQuestion({...editingQuestion, requiresEvidence: e.target.checked})
                        : setNewQuestion({...newQuestion, requiresEvidence: e.target.checked})
                      }
                      data-testid="requires-evidence-checkbox"
                    />
                    Requires Evidence
                  </label>
                  <div className="form-actions">
                    {editingQuestion ? (
                      <>
                        <button onClick={handleUpdateQuestion} data-testid="update-question-btn">
                          💾 Update Question
                        </button>
                        <button onClick={() => setEditingQuestion(null)} data-testid="cancel-edit-btn">
                          ❌ Cancel
                        </button>
                      </>
                    ) : (
                      <button onClick={handleAddQuestion} data-testid="add-question-btn">
                        ➕ Add Question
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-manager" data-testid="users-manager">
            <h3>Manage Users</h3>
            <div className="user-list">
              {users.map(user => (
                <div key={user.id} className="user-item" data-testid={`user-item-${user.id}`}>
                  <div className="user-info">
                    <strong>{user.name}</strong> ({user.email})
                    <span className="role-badge">{user.role}</span>
                  </div>
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => onDeleteUser(user.id)}
                      data-testid={`delete-user-${user.id}`}
                      className="danger"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="assignments-manager" data-testid="assignments-manager">
            <h3>Manage Question Assignments</h3>
            <p>Feature coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

AdminPanel.propTypes = {
  domains: PropTypes.object.isRequired,
  users: PropTypes.array.isRequired,
  onUpdateQuestion: PropTypes.func.isRequired,
  onAddQuestion: PropTypes.func.isRequired,
  onDeleteQuestion: PropTypes.func.isRequired,
  onUpdateUserAssignments: PropTypes.func.isRequired,
  onAddUser: PropTypes.func.isRequired,
  onDeleteUser: PropTypes.func.isRequired
};