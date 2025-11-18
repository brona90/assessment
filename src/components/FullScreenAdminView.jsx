import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ComplianceDashboard } from './ComplianceDashboard';
import { DomainRadarChart } from './DomainRadarChart';
import { DomainBarChart } from './DomainBarChart';
import { useDataStore } from '../hooks/useDataStore';
import './FullScreenAdminView.css';
import './AdminPanel.css';

export const FullScreenAdminView = ({
  domains,
  answers,
  evidence,
  frameworks,
  onExportPDF,
  onLogout,
  onImportData,
  onExportData,
  onClearAllData
}) => {
  const [activeTab, setActiveTab] = useState('domains');
  const [isImporting, setIsImporting] = useState(false);

  // Get dataStore hooks
  const {
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
    addQuestion,
    updateQuestion,
    deleteQuestion,
    getUserAssignments,
    assignQuestionsToUser
  } = useDataStore();

  // State for each management section
  const [managedDomains, setManagedDomains] = useState({});
  const [managedFrameworks, setManagedFrameworks] = useState([]);
  const [selectedFrameworkIds, setSelectedFrameworkIds] = useState([]);
  const [managedUsers, setManagedUsers] = useState([]);
  const [managedQuestions, setManagedQuestions] = useState([]);
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
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [userAssignments, setUserAssignments] = useState({});

  // Load data on mount
  useEffect(() => {
    setManagedDomains(getDomains());
    setManagedFrameworks(getFrameworks());
    setSelectedFrameworkIds(getSelectedFrameworks());
    setManagedUsers(getUsers());
    setManagedQuestions(getQuestions());
  }, [getDomains, getFrameworks, getSelectedFrameworks, getUsers, getQuestions]);

  // Load assignments when activeTab changes to assignments or when users/questions change
  useEffect(() => {
    if (activeTab === 'assignments') {
      const users = getUsers();
      const questions = getQuestions();
      const assignments = {};
      
      users.forEach(user => {
        const questionIds = getUserAssignments(user.id);
        // Convert question IDs to question objects
        assignments[user.id] = questionIds
          .map(qId => questions.find(q => q.id === qId))
          .filter(q => q !== undefined);
      });
      
      setUserAssignments(assignments);
    }
  }, [activeTab, getUserAssignments, getUsers, getQuestions]);

  // Domain handlers
  const handleAddDomain = async () => {
    try {
      await addDomain(domainForm);
      setDomainForm({ id: '', title: '', description: '', weight: 1 });
      setManagedDomains(getDomains());
      setMessage({ type: 'success', text: 'Domain added successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleUpdateDomain = async () => {
    try {
      await updateDomain(editingDomainId, domainForm);
      setEditingDomainId(null);
      setDomainForm({ id: '', title: '', description: '', weight: 1 });
      setManagedDomains(getDomains());
      setMessage({ type: 'success', text: 'Domain updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleDeleteDomain = async (domainId) => {
    if (window.confirm('Are you sure you want to delete this domain?')) {
      try {
        await deleteDomain(domainId);
        setManagedDomains(getDomains());
        setMessage({ type: 'success', text: 'Domain deleted successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: error.message });
      }
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

  // Framework handlers
  const handleAddFramework = async () => {
    try {
      await addFramework(frameworkForm);
      setFrameworkForm({ id: '', name: '', description: '' });
      setManagedFrameworks(getFrameworks());
      setMessage({ type: 'success', text: 'Framework added successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleUpdateFramework = async () => {
    try {
      await updateFramework(editingFrameworkId, frameworkForm);
      setEditingFrameworkId(null);
      setFrameworkForm({ id: '', name: '', description: '' });
      setManagedFrameworks(getFrameworks());
      setMessage({ type: 'success', text: 'Framework updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleDeleteFramework = async (frameworkId) => {
    if (window.confirm('Are you sure you want to delete this framework?')) {
      try {
        await deleteFramework(frameworkId);
        setManagedFrameworks(getFrameworks());
        setMessage({ type: 'success', text: 'Framework deleted successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: error.message });
      }
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

  const handleToggleFramework = async (frameworkId) => {
    try {
      const newSelection = selectedFrameworkIds.includes(frameworkId)
        ? selectedFrameworkIds.filter(id => id !== frameworkId)
        : [...selectedFrameworkIds, frameworkId];
      await setSelectedFrameworks(newSelection);
      setSelectedFrameworkIds(newSelection);
      setMessage({ type: 'success', text: 'Framework selection updated!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  // User handlers
  const handleAddUser = async () => {
    try {
      await addUser(userForm);
      setUserForm({ id: '', name: '', email: '', role: 'user' });
      setManagedUsers(getUsers());
      setMessage({ type: 'success', text: 'User added successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleUpdateUser = async () => {
    try {
      await updateUser(editingUserId, userForm);
      setEditingUserId(null);
      setUserForm({ id: '', name: '', email: '', role: 'user' });
      setManagedUsers(getUsers());
      setMessage({ type: 'success', text: 'User updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setManagedUsers(getUsers());
        setMessage({ type: 'success', text: 'User deleted successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: error.message });
      }
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

  // Question handlers
  const handleAddQuestion = async () => {
    try {
      await addQuestion(questionForm);
      setQuestionForm({ id: '', text: '', domainId: '', categoryId: '', requiresEvidence: false });
      setManagedQuestions(getQuestions());
      setMessage({ type: 'success', text: 'Question added successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleUpdateQuestion = async () => {
    try {
      await updateQuestion(editingQuestionId, questionForm);
      setEditingQuestionId(null);
      setQuestionForm({ id: '', text: '', domainId: '', categoryId: '', requiresEvidence: false });
      setManagedQuestions(getQuestions());
      setMessage({ type: 'success', text: 'Question updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion(questionId);
        setManagedQuestions(getQuestions());
        setMessage({ type: 'success', text: 'Question deleted successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: error.message });
      }
    }
  };

  const startEditQuestion = (question) => {
    setEditingQuestionId(question.id);
    setQuestionForm({
      id: question.id,
      text: question.text,
      domainId: question.domainId || '',
      categoryId: question.categoryId || '',
      requiresEvidence: question.requiresEvidence || false
    });
  };

  // Assignment handlers
  const handleAssignQuestions = async () => {
    if (!selectedUserId || selectedQuestions.length === 0) {
      setMessage({ type: 'error', text: 'Please select a user and at least one question' });
      return;
    }
    try {
      await assignQuestionsToUser(selectedUserId, selectedQuestions);
      
      // Refresh assignments for all users
      const users = getUsers();
      const questions = getQuestions();
      const assignments = {};
      
      users.forEach(user => {
        const questionIds = getUserAssignments(user.id);
        // Convert question IDs to question objects
        assignments[user.id] = questionIds
          .map(qId => questions.find(q => q.id === qId))
          .filter(q => q !== undefined);
      });
      
      setUserAssignments(assignments);
      
      setSelectedUserId('');
      setSelectedQuestions([]);
      setMessage({ type: 'success', text: 'Questions assigned successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    try {
      await onImportData(file);
    } finally {
      setIsImporting(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleExportData = () => {
    onExportData();
  };

  const handleClearAllData = () => {
    onClearAllData();
  };

  return (
    <div className="full-screen-admin-view" data-testid="full-screen-admin-view">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <h1>Administrator Dashboard</h1>
        </div>
        <div className="admin-header-right">
          <button
            className="export-pdf-btn"
            onClick={onExportPDF}
            data-testid="export-pdf-button"
            aria-label="Export PDF Report"
          >
            📄 Export PDF Report
          </button>
          <button
            className="logout-btn"
            onClick={onLogout}
            data-testid="logout-button"
            aria-label="Logout"
          >
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Unified Navigation Bar */}
      <nav className="admin-nav" role="tablist">
        <button
          className={`admin-nav-tab ${activeTab === 'domains' ? 'active' : ''}`}
          onClick={() => setActiveTab('domains')}
          data-testid="domains-tab"
          role="tab"
          aria-selected={activeTab === 'domains'}
          aria-controls="domains-content"
        >
          🏢 Domains
        </button>
        <button
          className={`admin-nav-tab ${activeTab === 'frameworks' ? 'active' : ''}`}
          onClick={() => setActiveTab('frameworks')}
          data-testid="frameworks-tab"
          role="tab"
          aria-selected={activeTab === 'frameworks'}
          aria-controls="frameworks-content"
        >
          📋 Frameworks
        </button>
        <button
          className={`admin-nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
          data-testid="users-tab"
          role="tab"
          aria-selected={activeTab === 'users'}
          aria-controls="users-content"
        >
          👥 Users
        </button>
        <button
          className={`admin-nav-tab ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
          data-testid="questions-tab"
          role="tab"
          aria-selected={activeTab === 'questions'}
          aria-controls="questions-content"
        >
          ❓ Questions
        </button>
        <button
          className={`admin-nav-tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
          data-testid="assignments-tab"
          role="tab"
          aria-selected={activeTab === 'assignments'}
          aria-controls="assignments-content"
        >
          📝 Assignments
        </button>
        <button
          className={`admin-nav-tab ${activeTab === 'data-management' ? 'active' : ''}`}
          onClick={() => setActiveTab('data-management')}
          data-testid="data-management-tab"
          role="tab"
          aria-selected={activeTab === 'data-management'}
          aria-controls="data-management-content"
        >
          📊 Data Management
        </button>
        <button
          className={`admin-nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
          data-testid="dashboard-tab"
          role="tab"
          aria-selected={activeTab === 'dashboard'}
          aria-controls="dashboard-content"
        >
          📈 Dashboard
        </button>
        <button
          className={`admin-nav-tab ${activeTab === 'compliance' ? 'active' : ''}`}
          onClick={() => setActiveTab('compliance')}
          data-testid="compliance-tab"
          role="tab"
          aria-selected={activeTab === 'compliance'}
          aria-controls="compliance-content"
        >
          ✅ Compliance
        </button>
      </nav>

      {/* Tab Content */}
      <main className="admin-content">
        {/* Domains Tab */}
        {activeTab === 'domains' && (
          <div
            className="tab-content"
            data-testid="domains-content"
            role="tabpanel"
            id="domains-content"
            aria-labelledby="domains-tab"
          >
            <div className="admin-section">
              <h2>Domains Management</h2>
              
              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}

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
                {Object.values(managedDomains).map(domain => (
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
          </div>
        )}

        {/* Frameworks Tab */}
        {activeTab === 'frameworks' && (
          <div
            className="tab-content"
            data-testid="frameworks-content"
            role="tabpanel"
            id="frameworks-content"
            aria-labelledby="frameworks-tab"
          >
            <div className="admin-section">
              <h2>Frameworks Management</h2>
              
              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <h3>{editingFrameworkId ? 'Edit Framework' : 'Add Framework'}</h3>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Framework ID (e.g., nist)"
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

              <h3>Existing Frameworks</h3>
              <div className="items-list">
                {managedFrameworks.map(framework => (
                  <div key={framework.id} className="item">
                    <div className="item-info">
                      <strong>{framework.name}</strong> ({framework.id})
                      {framework.description && <p>{framework.description}</p>}
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedFrameworkIds.includes(framework.id)}
                          onChange={() => handleToggleFramework(framework.id)}
                        />
                        {selectedFrameworkIds.includes(framework.id) ? ' Enabled' : ' Disabled'}
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
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div
            className="tab-content"
            data-testid="users-content"
            role="tabpanel"
            id="users-content"
            aria-labelledby="users-tab"
          >
            <div className="admin-section">
              <h2>Users Management</h2>
              
              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}

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
                {managedUsers.map(user => (
                  <div key={user.id} className="item">
                    <div className="item-info">
                      <strong>{user.name}</strong> ({user.id})
                      {user.email && <p>{user.email}</p>}
                      <span className={`badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="item-actions">
                      <button onClick={() => startEditUser(user)}>Edit</button>
                      <button onClick={() => handleDeleteUser(user.id)} className="danger">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div
            className="tab-content"
            data-testid="questions-content"
            role="tabpanel"
            id="questions-content"
            aria-labelledby="questions-tab"
          >
            <div className="admin-section">
              <h2>Questions Management</h2>
              
              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}

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
                  {Object.values(managedDomains).map(domain => (
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
                {managedQuestions.map(question => (
                  <div key={question.id} className="item">
                    <div className="item-info">
                      <strong>{question.text}</strong>
                      <p>Domain: {question.domainId} | Category: {question.categoryId}</p>
                      {question.requiresEvidence && <span className="badge">Requires Evidence</span>}
                    </div>
                    <div className="item-actions">
                      <button onClick={() => startEditQuestion(question)}>Edit</button>
                      <button onClick={() => handleDeleteQuestion(question.id)} className="danger">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div
            className="tab-content"
            data-testid="assignments-content"
            role="tabpanel"
            id="assignments-content"
            aria-labelledby="assignments-tab"
          >
            <div className="admin-section">
              <h2>Question Assignments</h2>
              
              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <h3>Assign Questions to User</h3>
              <div className="form-group">
                <select
                  value={selectedUserId}
                  onChange={(e) => {
                    const userId = e.target.value;
                    setSelectedUserId(userId);
                    // Pre-populate with current assignments
                    if (userId) {
                      const currentAssignments = getUserAssignments(userId);
                      setSelectedQuestions(currentAssignments);
                    } else {
                      setSelectedQuestions([]);
                    }
                  }}
                >
                  <option value="">Select User</option>
                  {managedUsers.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>

                {selectedUserId && (
                  <div className="current-assignments-info">
                    <p>
                      <strong>Current assignments:</strong> {userAssignments[selectedUserId]?.length || 0} questions
                      {userAssignments[selectedUserId]?.length > 0 && ' (pre-selected below)'}
                    </p>
                  </div>
                )}

                <div className="question-selection">
                  <h4>Select Questions:</h4>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <button 
                      type="button"
                      onClick={() => setSelectedQuestions(managedQuestions.map(q => q.id))}
                      style={{ marginRight: '0.5rem' }}
                    >
                      Select All
                    </button>
                    <button 
                      type="button"
                      onClick={() => setSelectedQuestions([])}
                    >
                      Clear All
                    </button>
                  </div>
                  {managedQuestions.map(question => (
                    <label key={question.id} className="question-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.includes(question.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedQuestions([...selectedQuestions, question.id]);
                          } else {
                            setSelectedQuestions(selectedQuestions.filter(id => id !== question.id));
                          }
                        }}
                      />
                      {question.text}
                    </label>
                  ))}
                </div>

                <button onClick={handleAssignQuestions}>Assign Questions</button>
              </div>

              <h3>Current Assignments</h3>
              <div className="items-list">
                {managedUsers.map(user => {
                  const assignments = userAssignments[user.id] || [];
                  return (
                    <div key={user.id} className="item">
                      <div className="item-info">
                        <strong>{user.name}</strong>
                        <p>{assignments.length} questions assigned</p>
                        {assignments.length > 0 && (
                          <ul className="assignment-list">
                            {assignments.slice(0, 5).map(q => (
                              <li key={q.id}>{q.text}</li>
                            ))}
                            {assignments.length > 5 && (
                              <li>... and {assignments.length - 5} more</li>
                            )}
                          </ul>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Data Management Tab */}
        {activeTab === 'data-management' && (
          <div
            className="tab-content"
            data-testid="data-management-content"
            role="tabpanel"
            id="data-management-content"
            aria-labelledby="data-management-tab"
          >
            <div className="data-management-section">
              <h2>Data Management</h2>

              {/* Import/Export Section */}
              <section className="management-card">
                <h3>Import & Export Data</h3>
                <div className="management-actions">
                  <div className="import-section">
                    <label htmlFor="file-input" className="file-label">
                      <span>📁 Select JSON File</span>
                      <input
                        id="file-input"
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        data-testid="file-input"
                        disabled={isImporting}
                      />
                    </label>
                    {isImporting && <span className="loading-text">Importing...</span>}
                  </div>
                  <button
                    className="export-btn"
                    onClick={handleExportData}
                    data-testid="export-data-button"
                  >
                    💾 Export All Data
                  </button>
                </div>
                <p className="help-text">
                  Import: Upload a JSON file containing configuration, answers, and evidence.
                  <br />
                  Export: Download all system data including configuration, answers, and evidence.
                </p>
              </section>

              {/* Clear All Data Section */}
              <section className="management-card danger-zone">
                <h3>⚠️ Danger Zone</h3>
                <div className="danger-content">
                  <div className="danger-description">
                    <h4>Clear All Data</h4>
                    <p>
                      Permanently delete all data including domains, users, frameworks, questions,
                      assignments, answers, and evidence. This action cannot be undone.
                    </p>
                  </div>
                  <button
                    className="danger-btn"
                    onClick={handleClearAllData}
                    data-testid="clear-all-data-button"
                  >
                    🗑️ Clear All Data
                  </button>
                </div>
              </section>

              {/* System Information */}
              <section className="management-card">
                <h3>System Information</h3>
                <div className="system-info">
                  <div className="info-item">
                    <span className="info-label">Domains:</span>
                    <span className="info-value">{Object.keys(domains).length}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Total Answers:</span>
                    <span className="info-value">{Object.keys(answers).length}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Evidence Items:</span>
                    <span className="info-value">{Object.keys(evidence).length}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Frameworks:</span>
                    <span className="info-value">{frameworks.length}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div
            className="tab-content"
            data-testid="dashboard-content"
            role="tabpanel"
            id="dashboard-content"
            aria-labelledby="dashboard-tab"
          >
            <div className="dashboard-section">
              <h2>Assessment Overview</h2>
              <div className="charts-grid">
                <div className="chart-container">
                  <h3>Domain Scores (Radar)</h3>
                  <DomainRadarChart domains={domains} answers={answers} />
                </div>
                <div className="chart-container">
                  <h3>Domain Scores (Bar)</h3>
                  <DomainBarChart domains={domains} answers={answers} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div
            className="tab-content"
            data-testid="compliance-content"
            role="tabpanel"
            id="compliance-content"
            aria-labelledby="compliance-tab"
          >
            <div className="compliance-section">
              <h2>Compliance Frameworks</h2>
              <ComplianceDashboard answers={answers} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

FullScreenAdminView.propTypes = {
  domains: PropTypes.object.isRequired,
  answers: PropTypes.object.isRequired,
  evidence: PropTypes.object.isRequired,
  frameworks: PropTypes.array.isRequired,
  onExportPDF: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onImportData: PropTypes.func.isRequired,
  onExportData: PropTypes.func.isRequired,
  onClearAllData: PropTypes.func.isRequired
};

export default FullScreenAdminView;
