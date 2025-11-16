import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDataStore } from '../hooks/useDataStore';
import './AdminPanel.css';

export const EnhancedAdminPanel = () => {
  const {
    initialized,
    loading,
    error,
    getDomains,
    addDomain,
    updateDomain,
    deleteDomain,
    getFrameworks,
    getSelectedFrameworks,
    addFramework,
    updateFramework,
    deleteFramework,
    setSelectedFrameworks,
    getUsers,
    addUser,
    updateUser,
    deleteUser,
    getQuestions,
    // getQuestionsByDomain,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    getUserAssignments,
    assignQuestionsToUser,
    // exportData,
    importData,
    downloadData
  } = useDataStore();

  const [activeTab, setActiveTab] = useState('domains');
  const [domains, setDomains] = useState({});
  const [frameworks, setFrameworks] = useState([]);
  const [selectedFrameworkIds, setSelectedFrameworkIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Domain form state
  const [domainForm, setDomainForm] = useState({
    id: '',
    title: '',
    description: '',
    weight: 1
  });
  const [editingDomainId, setEditingDomainId] = useState(null);

  // Framework form state
  const [frameworkForm, setFrameworkForm] = useState({
    id: '',
    name: '',
    description: ''
  });
  const [editingFrameworkId, setEditingFrameworkId] = useState(null);

  // User form state
  const [userForm, setUserForm] = useState({
    id: '',
    name: '',
    email: '',
    role: 'user'
  });
  const [editingUserId, setEditingUserId] = useState(null);

  // Question form state
  const [questionForm, setQuestionForm] = useState({
    id: '',
    text: '',
    domainId: '',
    categoryId: '',
    requiresEvidence: false
  });
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  // Assignment state
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

  // Load data when initialized
  useEffect(() => {
    if (initialized) {
      setDomains(getDomains());
      setFrameworks(getFrameworks());
      setSelectedFrameworkIds(getSelectedFrameworks().map(f => f.id));
      setUsers(getUsers());
      setQuestions(getQuestions());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  const refreshData = () => {
    setDomains(getDomains());
    setFrameworks(getFrameworks());
    setSelectedFrameworkIds(getSelectedFrameworks().map(f => f.id));
    setUsers(getUsers());
    setQuestions(getQuestions());
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // Domain operations
  const handleAddDomain = () => {
    if (!domainForm.id || !domainForm.title) {
      showMessage('error', 'Domain ID and title are required');
      return;
    }

    const result = addDomain({
      ...domainForm,
      categories: {}
    });

    if (result.success) {
      showMessage('success', 'Domain added successfully');
      setDomainForm({ id: '', title: '', description: '', weight: 1 });
      refreshData();
    } else {
      showMessage('error', result.error);
    }
  };

  const handleUpdateDomain = () => {
    if (!editingDomainId) return;

    const result = updateDomain(editingDomainId, domainForm);

    if (result.success) {
      showMessage('success', 'Domain updated successfully');
      setEditingDomainId(null);
      setDomainForm({ id: '', title: '', description: '', weight: 1 });
      refreshData();
    } else {
      showMessage('error', result.error);
    }
  };

  const handleDeleteDomain = (domainId) => {
    if (!window.confirm('Are you sure? This will delete all questions in this domain.')) {
      return;
    }

    const result = deleteDomain(domainId);

    if (result.success) {
      showMessage('success', 'Domain deleted successfully');
      refreshData();
    } else {
      showMessage('error', result.error);
    }
  };

  const startEditDomain = (domain) => {
    setEditingDomainId(domain.id);
    setDomainForm({
      id: domain.id,
      title: domain.title,
      description: domain.description || '',
      weight: domain.weight || 1
    });
  };

  // Framework operations
  const handleAddFramework = () => {
    if (!frameworkForm.id || !frameworkForm.name) {
      showMessage('error', 'Framework ID and name are required');
      return;
    }

    const result = addFramework(frameworkForm);

    if (result.success) {
      showMessage('success', 'Framework added successfully');
      setFrameworkForm({ id: '', name: '', description: '' });
      refreshData();
    } else {
      showMessage('error', result.error);
    }
  };

  const handleUpdateFramework = () => {
    if (!editingFrameworkId) return;

    const result = updateFramework(editingFrameworkId, frameworkForm);

    if (result.success) {
      showMessage('success', 'Framework updated successfully');
      setEditingFrameworkId(null);
      setFrameworkForm({ id: '', name: '', description: '' });
      refreshData();
    } else {
      showMessage('error', result.error);
    }
  };

  const handleDeleteFramework = (frameworkId) => {
    if (!window.confirm('Are you sure you want to delete this framework?')) {
      return;
    }

    const result = deleteFramework(frameworkId);

    if (result.success) {
      showMessage('success', 'Framework deleted successfully');
      refreshData();
    } else {
      showMessage('error', result.error);
    }
  };

  const startEditFramework = (framework) => {
    setEditingFrameworkId(framework.id);
    setFrameworkForm({
      id: framework.id,
      name: framework.name,
      description: framework.description || ''
    });
  };

  const handleToggleFrameworkSelection = (frameworkId) => {
    const newSelection = selectedFrameworkIds.includes(frameworkId)
      ? selectedFrameworkIds.filter(id => id !== frameworkId)
      : [...selectedFrameworkIds, frameworkId];

    const result = setSelectedFrameworks(newSelection);

    if (result.success) {
      setSelectedFrameworkIds(newSelection);
      showMessage('success', 'Framework visibility updated');
    } else {
      showMessage('error', result.error);
    }
  };

  // User operations
  const handleAddUser = () => {
    if (!userForm.id || !userForm.name) {
      showMessage('error', 'User ID and name are required');
      return;
    }

    const result = addUser(userForm);

    if (result.success) {
      showMessage('success', 'User added successfully');
      setUserForm({ id: '', name: '', email: '', role: 'user' });
      refreshData();
    } else {
      showMessage('error', result.error);
    }
  };

  const handleUpdateUser = () => {
    if (!editingUserId) return;

    const result = updateUser(editingUserId, userForm);

    if (result.success) {
      showMessage('success', 'User updated successfully');
      setEditingUserId(null);
      setUserForm({ id: '', name: '', email: '', role: 'user' });
      refreshData();
    } else {
      showMessage('error', result.error);
    }
  };

  const handleDeleteUser = (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    const result = deleteUser(userId);

    if (result.success) {
      showMessage('success', 'User deleted successfully');
      refreshData();
    } else {
      showMessage('error', result.error);
    }
  };

  const startEditUser = (user) => {
    setEditingUserId(user.id);
    setUserForm({
      id: user.id,
      name: user.name,
      email: user.email || '',
      role: user.role || 'user'
    });
  };

  // Question operations
  const handleAddQuestion = () => {
    if (!questionForm.id || !questionForm.text || !questionForm.domainId || !questionForm.categoryId) {
      showMessage('error', 'All fields are required');
      return;
    }

    const result = addQuestion(questionForm);

    if (result.success) {
      showMessage('success', 'Question added successfully');
      setQuestionForm({ id: '', text: '', domainId: '', categoryId: '', requiresEvidence: false });
      refreshData();
    } else {
      showMessage('error', result.error);
    }
  };

  const handleUpdateQuestion = () => {
    if (!editingQuestionId) return;

    const result = updateQuestion(editingQuestionId, questionForm);

    if (result.success) {
      showMessage('success', 'Question updated successfully');
      setEditingQuestionId(null);
      setQuestionForm({ id: '', text: '', domainId: '', categoryId: '', requiresEvidence: false });
      refreshData();
    } else {
      showMessage('error', result.error);
    }
  };

  const handleDeleteQuestion = (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    const result = deleteQuestion(questionId);

    if (result.success) {
      showMessage('success', 'Question deleted successfully');
      refreshData();
    } else {
      showMessage('error', result.error);
    }
  };

  const startEditQuestion = (question) => {
    setEditingQuestionId(question.id);
    setQuestionForm({
      id: question.id,
      text: question.text,
      domainId: question.domainId,
      categoryId: question.categoryId,
      requiresEvidence: question.requiresEvidence || false
    });
  };

  // Assignment operations
  const handleAssignQuestions = () => {
    if (!selectedUserId || selectedQuestionIds.length === 0) {
      showMessage('error', 'Please select a user and at least one question');
      return;
    }

    const result = assignQuestionsToUser(selectedUserId, selectedQuestionIds);

    if (result.success) {
      showMessage('success', 'Questions assigned successfully');
      setSelectedQuestionIds([]);
    } else {
      showMessage('error', result.error);
    }
  };

  const handleToggleQuestionSelection = (questionId) => {
    setSelectedQuestionIds(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  // Export/Import operations
  const handleExport = () => {
    downloadData('assessment-data.json');
    showMessage('success', 'Data exported successfully');
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = importData(e.target.result);
      if (result.success) {
        showMessage('success', 'Data imported successfully');
        refreshData();
      } else {
        showMessage('error', result.error);
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return <div className="admin-panel"><p>Loading admin panel...</p></div>;
  }

  if (error) {
    return <div className="admin-panel"><p className="error">Error: {error}</p></div>;
  }

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={activeTab === 'domains' ? 'active' : ''}
          onClick={() => setActiveTab('domains')}
        >
          Domains
        </button>
        <button
          className={activeTab === 'frameworks' ? 'active' : ''}
          onClick={() => setActiveTab('frameworks')}
        >
          Frameworks
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={activeTab === 'questions' ? 'active' : ''}
          onClick={() => setActiveTab('questions')}
        >
          Questions
        </button>
        <button
          className={activeTab === 'assignments' ? 'active' : ''}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments
        </button>
        <button
          className={activeTab === 'data' ? 'active' : ''}
          onClick={() => setActiveTab('data')}
        >
          Data Management
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'domains' && (
          <div className="admin-section">
            <h3>{editingDomainId ? 'Edit Domain' : 'Add Domain'}</h3>
            <div className="form-group">
              <input
                type="text"
                placeholder="Domain ID (e.g., security)"
                value={domainForm.id}
                onChange={(e) => setDomainForm({ ...domainForm, id: e.target.value })}
                disabled={editingDomainId !== null}
              />
              <input
                type="text"
                placeholder="Title"
                value={domainForm.title}
                onChange={(e) => setDomainForm({ ...domainForm, title: e.target.value })}
              />
              <input
                type="text"
                placeholder="Description"
                value={domainForm.description}
                onChange={(e) => setDomainForm({ ...domainForm, description: e.target.value })}
              />
              <input
                type="number"
                placeholder="Weight"
                value={domainForm.weight}
                onChange={(e) => setDomainForm({ ...domainForm, weight: parseFloat(e.target.value) })}
                min="0"
                step="0.1"
              />
              {editingDomainId ? (
                <>
                  <button onClick={handleUpdateDomain}>Update Domain</button>
                  <button onClick={() => {
                    setEditingDomainId(null);
                    setDomainForm({ id: '', title: '', description: '', weight: 1 });
                  }}>Cancel</button>
                </>
              ) : (
                <button onClick={handleAddDomain}>Add Domain</button>
              )}
            </div>

            <h3>Existing Domains</h3>
            <div className="items-list">
              {Object.values(domains).map(domain => (
                <div key={domain.id} className="item">
                  <div className="item-info">
                    <strong>{domain.title}</strong> ({domain.id})
                    {domain.description && <p>{domain.description}</p>}
                    <small>Weight: {domain.weight}</small>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => startEditDomain(domain)}>Edit</button>
                    <button onClick={() => handleDeleteDomain(domain.id)} className="danger">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'frameworks' && (
          <div className="admin-section">
            <h3>{editingFrameworkId ? 'Edit Framework' : 'Add Framework'}</h3>
            <div className="form-group">
              <input
                type="text"
                placeholder="Framework ID (e.g., iso27001)"
                value={frameworkForm.id}
                onChange={(e) => setFrameworkForm({ ...frameworkForm, id: e.target.value })}
                disabled={editingFrameworkId !== null}
              />
              <input
                type="text"
                placeholder="Name"
                value={frameworkForm.name}
                onChange={(e) => setFrameworkForm({ ...frameworkForm, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Description"
                value={frameworkForm.description}
                onChange={(e) => setFrameworkForm({ ...frameworkForm, description: e.target.value })}
              />
              {editingFrameworkId ? (
                <>
                  <button onClick={handleUpdateFramework}>Update Framework</button>
                  <button onClick={() => {
                    setEditingFrameworkId(null);
                    setFrameworkForm({ id: '', name: '', description: '' });
                  }}>Cancel</button>
                </>
              ) : (
                <button onClick={handleAddFramework}>Add Framework</button>
              )}
            </div>

            <h3>Framework Visibility (User Access)</h3>
            <p>Select which frameworks are visible to non-admin users:</p>
            <div className="items-list">
              {frameworks.map(framework => (
                <div key={framework.id} className="item">
                  <div className="item-info">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedFrameworkIds.includes(framework.id)}
                        onChange={() => handleToggleFrameworkSelection(framework.id)}
                      />
                      <strong>{framework.name}</strong> ({framework.id})
                      {framework.description && <p>{framework.description}</p>}
                    </label>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => startEditFramework(framework)}>Edit</button>
                    <button onClick={() => handleDeleteFramework(framework.id)} className="danger">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-section">
            <h3>{editingUserId ? 'Edit User' : 'Add User'}</h3>
            <div className="form-group">
              <input
                type="text"
                placeholder="User ID"
                value={userForm.id}
                onChange={(e) => setUserForm({ ...userForm, id: e.target.value })}
                disabled={editingUserId !== null}
              />
              <input
                type="text"
                placeholder="Name"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              />
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              {editingUserId ? (
                <>
                  <button onClick={handleUpdateUser}>Update User</button>
                  <button onClick={() => {
                    setEditingUserId(null);
                    setUserForm({ id: '', name: '', email: '', role: 'user' });
                  }}>Cancel</button>
                </>
              ) : (
                <button onClick={handleAddUser}>Add User</button>
              )}
            </div>

            <h3>Existing Users</h3>
            <div className="items-list">
              {users.map(user => (
                <div key={user.id} className="item">
                  <div className="item-info">
                    <strong>{user.name}</strong> ({user.id})
                    {user.email && <p>{user.email}</p>}
                    <small>Role: {user.role}</small>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => startEditUser(user)}>Edit</button>
                    <button onClick={() => handleDeleteUser(user.id)} className="danger">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="admin-section">
            <h3>{editingQuestionId ? 'Edit Question' : 'Add Question'}</h3>
            <div className="form-group">
              <input
                type="text"
                placeholder="Question ID"
                value={questionForm.id}
                onChange={(e) => setQuestionForm({ ...questionForm, id: e.target.value })}
                disabled={editingQuestionId !== null}
              />
              <textarea
                placeholder="Question Text"
                value={questionForm.text}
                onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                rows="3"
              />
              <select
                value={questionForm.domainId}
                onChange={(e) => setQuestionForm({ ...questionForm, domainId: e.target.value })}
              >
                <option value="">Select Domain</option>
                {Object.values(domains).map(domain => (
                  <option key={domain.id} value={domain.id}>{domain.title}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Category ID"
                value={questionForm.categoryId}
                onChange={(e) => setQuestionForm({ ...questionForm, categoryId: e.target.value })}
              />
              <label>
                <input
                  type="checkbox"
                  checked={questionForm.requiresEvidence}
                  onChange={(e) => setQuestionForm({ ...questionForm, requiresEvidence: e.target.checked })}
                />
                Requires Evidence
              </label>
              {editingQuestionId ? (
                <>
                  <button onClick={handleUpdateQuestion}>Update Question</button>
                  <button onClick={() => {
                    setEditingQuestionId(null);
                    setQuestionForm({ id: '', text: '', domainId: '', categoryId: '', requiresEvidence: false });
                  }}>Cancel</button>
                </>
              ) : (
                <button onClick={handleAddQuestion}>Add Question</button>
              )}
            </div>

            <h3>Existing Questions</h3>
            <div className="items-list">
              {questions.map(question => (
                <div key={question.id} className="item">
                  <div className="item-info">
                    <strong>{question.id}</strong>
                    <p>{question.text}</p>
                    <small>Domain: {question.domainId} | Category: {question.categoryId}</small>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => startEditQuestion(question)}>Edit</button>
                    <button onClick={() => handleDeleteQuestion(question.id)} className="danger">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="admin-section">
            <h3>Assign Questions to Users</h3>
            <div className="form-group">
              <select
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  if (e.target.value) {
                    setSelectedQuestionIds(getUserAssignments(e.target.value));
                  }
                }}
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
              <button onClick={handleAssignQuestions} disabled={!selectedUserId || selectedQuestionIds.length === 0}>
                Assign Selected Questions
              </button>
            </div>

            {selectedUserId && (
              <>
                <h4>Select Questions for {users.find(u => u.id === selectedUserId)?.name}</h4>
                <div className="items-list">
                  {questions.map(question => (
                    <div key={question.id} className="item">
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedQuestionIds.includes(question.id)}
                          onChange={() => handleToggleQuestionSelection(question.id)}
                        />
                        <strong>{question.id}</strong>: {question.text}
                        <br />
                        <small>Domain: {question.domainId}</small>
                      </label>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'data' && (
          <div className="admin-section">
            <h3>Data Management</h3>
            <p>Export and import all assessment data for backup and persistence.</p>
            
            <div className="form-group">
              <button onClick={handleExport}>Export Data</button>
              <label className="file-input-label">
                Import Data
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div className="data-stats">
              <h4>Current Data Statistics</h4>
              <ul>
                <li>Domains: {Object.keys(domains).length}</li>
                <li>Frameworks: {frameworks.length}</li>
                <li>Users: {users.length}</li>
                <li>Questions: {questions.length}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

EnhancedAdminPanel.propTypes = {};

export default EnhancedAdminPanel;