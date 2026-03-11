import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { OverviewDashboard } from './OverviewDashboard';
import { useDataStore } from '../hooks/useDataStore';
import { useRouter } from '../hooks/useRouter';
import { storageService } from '../services/storageService';
import { CompareExports } from './CompareExports';
import { CSVImportExport } from './CSVImportExport';
import { ChartFullscreenView } from './ChartFullscreenView';
import logoUrl from '../assets/ftc-icon.svg';
import './FullScreenAdminView.css';

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
  const { currentSubRoute, navigate } = useRouter();
  const activeTab = currentSubRoute || 'overview';

  const setActiveTab = (tab) => {
    navigate('admin', tab);
  };

  // Local sub-tab for Configure section (not URL-routed)
  const [configureSubTab, setConfigureSubTab] = useState('people');
  const [isImporting, setIsImporting] = useState(false);

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

  const [managedDomains, setManagedDomains] = useState({});
  const [managedFrameworks, setManagedFrameworks] = useState([]);
  const [selectedFrameworkIds, setSelectedFrameworkIds] = useState([]);
  const [managedUsers, setManagedUsers] = useState([]);
  const [managedQuestions, setManagedQuestions] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [domainForm, setDomainForm] = useState({ id: '', title: '', description: '', weight: 1 });
  const [editingDomainId, setEditingDomainId] = useState(null);

  const [frameworkForm, setFrameworkForm] = useState({ id: '', name: '', description: '', threshold: 3.5, requirements: '' });
  const [editingFrameworkId, setEditingFrameworkId] = useState(null);

  const [userForm, setUserForm] = useState({ id: '', name: '', email: '', role: 'user' });
  const [editingUserId, setEditingUserId] = useState(null);

  const [questionForm, setQuestionForm] = useState({ id: '', text: '', domainId: '', categoryId: '', requiresEvidence: false });
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [userAssignments, setUserAssignments] = useState({});

  const [completionStatus, setCompletionStatus] = useState([]);
  const [expandedChart, setExpandedChart] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [questionSearch, setQuestionSearch] = useState('');

  // Chart instance refs for PDF capture (populated via onChartReady/onCanvasReady)
  const chartRefs = useRef({});

  const handleExportPDFClick = () => {
    const snapshots = {};
    if (chartRefs.current.radar?.toBase64Image) {
      snapshots.radar = chartRefs.current.radar.toBase64Image();
    }
    if (chartRefs.current.bar?.toBase64Image) {
      snapshots.bar = chartRefs.current.bar.toBase64Image();
    }
    if (chartRefs.current.heatmap) {
      snapshots.heatmap = chartRefs.current.heatmap.toDataURL('image/png');
    }
    onExportPDF(snapshots);
  };

  // Load management data on mount
  useEffect(() => {
    setManagedDomains(getDomains());
    setManagedFrameworks(getFrameworks());
    setSelectedFrameworkIds(getSelectedFrameworks().map(f => f.id));
    setManagedUsers(getUsers());
    setManagedQuestions(getQuestions());
  }, [getDomains, getFrameworks, getSelectedFrameworks, getUsers, getQuestions]);

  // Load completion status when Overview tab is active
  useEffect(() => {
    if (activeTab === 'overview') {
      const users = getUsers();
      const questions = getQuestions();
      const questionsPerUser = {};
      users.forEach(user => {
        const qIds = getUserAssignments(user.id);
        questionsPerUser[user.id] = qIds
          .map(id => questions.find(q => q.id === id))
          .filter(Boolean);
      });
      storageService.loadUsersCompletionStatus(users, questionsPerUser)
        .then(setCompletionStatus);
    }
  }, [activeTab, getUsers, getQuestions, getUserAssignments]);

  // Load assignments when Configure tab is active
  useEffect(() => {
    if (activeTab === 'configure') {
      const users = getUsers();
      const questions = getQuestions();
      const assignments = {};
      users.forEach(user => {
        const questionIds = getUserAssignments(user.id);
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
    setDomainForm({ id: domain.id, title: domain.title, description: domain.description || '', weight: domain.weight || 1 });
  };

  // Framework handlers
  const handleAddFramework = async () => {
    try {
      await addFramework({
        ...frameworkForm,
        threshold: Number(frameworkForm.threshold) || 60,
        requirements: frameworkForm.requirements
          ? frameworkForm.requirements.split('\n').map(s => s.trim()).filter(Boolean)
          : []
      });
      setFrameworkForm({ id: '', name: '', description: '', threshold: 3.5, requirements: '' });
      setManagedFrameworks(getFrameworks());
      setMessage({ type: 'success', text: 'Framework added successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleUpdateFramework = async () => {
    try {
      await updateFramework(editingFrameworkId, {
        ...frameworkForm,
        threshold: Number(frameworkForm.threshold) || 60,
        requirements: frameworkForm.requirements
          ? frameworkForm.requirements.split('\n').map(s => s.trim()).filter(Boolean)
          : []
      });
      setEditingFrameworkId(null);
      setFrameworkForm({ id: '', name: '', description: '', threshold: 3.5, requirements: '' });
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
      description: framework.description || '',
      threshold: framework.threshold ?? 60,
      requirements: (framework.requirements || []).join('\n')
    });
  };

  const handleToggleQuestionMapping = async (frameworkId, questionId, checked) => {
    const framework = managedFrameworks.find(f => f.id === frameworkId);
    const currentMappings = framework?.mappedQuestions || [];
    const newMappings = checked
      ? [...currentMappings, questionId]
      : currentMappings.filter(id => id !== questionId);
    try {
      await updateFramework(frameworkId, { mappedQuestions: newMappings });
      setManagedFrameworks(getFrameworks());
      setMessage({ type: 'success', text: 'Framework mapping updated!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
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
    setUserForm({ id: user.id, name: user.name, email: user.email || '', role: user.role || 'user' });
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
      const users = getUsers();
      const questions = getQuestions();
      const assignments = {};
      users.forEach(user => {
        const questionIds = getUserAssignments(user.id);
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
      event.target.value = '';
    }
  };

  // Fullscreen chart overlay
  if (expandedChart) {
    return (
      <ChartFullscreenView
        chartType={expandedChart}
        questions={managedQuestions}
        answers={answers}
        onBack={() => setExpandedChart(null)}
      />
    );
  }

  return (
    <div className="full-screen-admin-view" data-testid="full-screen-admin-view">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <img src={logoUrl} alt="fosterthecode" className="header-brand-logo" />
          <h1>Administrator Dashboard</h1>
        </div>
        <div className="admin-header-right">
          <button
            className="export-pdf-btn"
            onClick={handleExportPDFClick}
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

      {/* Primary Navigation — 3 tabs */}
      <nav className="admin-nav" role="tablist">
        <button
          className={`admin-nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
          data-testid="overview-tab"
          role="tab"
          aria-selected={activeTab === 'overview'}
          aria-controls="overview-content"
        >
          📊 Overview
        </button>
        <button
          className={`admin-nav-tab ${activeTab === 'configure' ? 'active' : ''}`}
          onClick={() => setActiveTab('configure')}
          data-testid="configure-tab"
          role="tab"
          aria-selected={activeTab === 'configure'}
          aria-controls="configure-content"
        >
          ⚙️ Configure
        </button>
        <button
          className={`admin-nav-tab ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
          data-testid="data-tab"
          role="tab"
          aria-selected={activeTab === 'data'}
          aria-controls="data-management-content"
        >
          🗄️ Data
        </button>
      </nav>

      <main className="admin-content">

        {/* ─── Overview Tab ─── */}
        {activeTab === 'overview' && (
          <div
            className="tab-content"
            data-testid="overview-content"
            role="tabpanel"
            id="overview-content"
            aria-labelledby="overview-tab"
          >
            <div className="dashboard-section">
              <h2>Assessment Overview</h2>

              {/* Participant Completion */}
              <div className="completion-section" data-testid="completion-section">
                <h3>Participant Completion</h3>
                {completionStatus.length === 0 ? (
                  <p className="completion-empty">No users found.</p>
                ) : (() => {
                  const handleSort = (key) => {
                    setSortConfig(prev => ({
                      key,
                      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
                    }));
                  };
                  const sortedStatus = [...completionStatus].sort((a, b) => {
                    const dir = sortConfig.direction === 'asc' ? 1 : -1;
                    if (sortConfig.key === 'name') return a.name.localeCompare(b.name) * dir;
                    if (sortConfig.key === 'percentage') return (a.percentage - b.percentage) * dir;
                    if (sortConfig.key === 'lastActive') {
                      const ta = a.lastActive ? new Date(a.lastActive).getTime() : 0;
                      const tb = b.lastActive ? new Date(b.lastActive).getTime() : 0;
                      return (ta - tb) * dir;
                    }
                    return 0;
                  });
                  const SortTh = ({ col, label }) => {
                    const active = sortConfig.key === col;
                    return (
                      <th>
                        <button
                          className={`sort-th-btn${active ? ' sort-th-btn--active' : ''}`}
                          onClick={() => handleSort(col)}
                          aria-sort={active ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                        >
                          {label}
                          <span aria-hidden="true" className="sort-indicator">
                            {active ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}
                          </span>
                        </button>
                      </th>
                    );
                  };
                  return (
                    <div className="completion-table-wrap">
                    <table className="completion-table" data-testid="completion-table">
                      <thead>
                        <tr>
                          <SortTh col="name" label="Assessor" />
                          <th>Assigned</th>
                          <th>Answered</th>
                          <SortTh col="percentage" label="Progress" />
                          <SortTh col="lastActive" label="Last Active" />
                        </tr>
                      </thead>
                      <tbody>
                        {sortedStatus.map(s => {
                          const userRole = managedUsers.find(u => u.id === s.userId)?.role;
                          const isAdminUser = userRole === 'admin';
                          return (
                            <tr key={s.userId} data-testid={`completion-row-${s.userId}`}>
                              <td>
                                {s.name}
                                {isAdminUser && (
                                  <span className="completion-admin-label"> (Admin)</span>
                                )}
                              </td>
                              <td>{s.total}</td>
                              <td>{s.answered}</td>
                              <td>
                                {isAdminUser ? (
                                  <span className="completion-admin-label">N/A</span>
                                ) : (
                                  <div className="completion-bar-wrap">
                                    <div
                                      className="completion-bar-fill"
                                      style={{ width: `${s.percentage}%` }}
                                    />
                                    <span className="completion-pct">{s.percentage}%</span>
                                  </div>
                                )}
                              </td>
                              <td className="completion-last-active">
                                {s.lastActive
                                  ? new Date(s.lastActive).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                  : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    </div>
                  );
                })()}
              </div>

              <OverviewDashboard
                domains={domains}
                answers={answers}
                onExpandChart={setExpandedChart}
                onChartReady={(type, ref) => { chartRefs.current[type] = ref; }}
              />
            </div>
          </div>
        )}

        {/* ─── Configure Tab ─── */}
        {activeTab === 'configure' && (
          <div
            className="tab-content"
            data-testid="configure-content"
            role="tabpanel"
            id="configure-content"
            aria-labelledby="configure-tab"
          >
            {/* Configure sub-navigation */}
            <div className="configure-sub-nav" role="tablist">
              <button
                className={`configure-sub-tab ${configureSubTab === 'people' ? 'active' : ''}`}
                onClick={() => setConfigureSubTab('people')}
                data-testid="people-sub-tab"
                role="tab"
                aria-selected={configureSubTab === 'people'}
              >
                👥 People
              </button>
              <button
                className={`configure-sub-tab ${configureSubTab === 'content' ? 'active' : ''}`}
                onClick={() => setConfigureSubTab('content')}
                data-testid="content-sub-tab"
                role="tab"
                aria-selected={configureSubTab === 'content'}
              >
                📋 Content
              </button>
              <button
                className={`configure-sub-tab ${configureSubTab === 'frameworks' ? 'active' : ''}`}
                onClick={() => setConfigureSubTab('frameworks')}
                data-testid="frameworks-sub-tab"
                role="tab"
                aria-selected={configureSubTab === 'frameworks'}
              >
                ✅ Frameworks
              </button>
            </div>

            {/* People: Users + Assignments */}
            {configureSubTab === 'people' && (
              <div data-testid="people-content">
                {/* Users */}
                <div className="cfg-section" data-testid="users-content">
                  <div className="cfg-section-header">
                    <h3 className="cfg-section-title">👥 {editingUserId ? 'Edit User' : 'Add User'}</h3>
                  </div>
                  {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
                  <div className="cfg-form">
                    <div className="cfg-form-row">
                      <div className="cfg-field">
                        <label>User ID</label>
                        <input
                          type="text"
                          placeholder="e.g. alice"
                          value={userForm.id}
                          onChange={(e) => setUserForm({ ...userForm, id: e.target.value })}
                          disabled={editingUserId !== null}
                        />
                      </div>
                      <div className="cfg-field">
                        <label>Full Name</label>
                        <input
                          type="text"
                          placeholder="Alice Smith"
                          value={userForm.name}
                          onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="cfg-form-row">
                      <div className="cfg-field">
                        <label>Email</label>
                        <input
                          type="email"
                          placeholder="alice@example.com"
                          value={userForm.email}
                          onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        />
                      </div>
                      <div className="cfg-field">
                        <label>Role</label>
                        <select
                          value={userForm.role}
                          onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    <div className="cfg-form-actions">
                      {editingUserId ? (
                        <>
                          <button className="cfg-btn cfg-btn--primary" onClick={handleUpdateUser}>Update User</button>
                          <button className="cfg-btn cfg-btn--secondary" onClick={() => { setEditingUserId(null); setUserForm({ id: '', name: '', email: '', role: 'user' }); }}>Cancel</button>
                        </>
                      ) : (
                        <button className="cfg-btn cfg-btn--primary" onClick={handleAddUser}>Add User</button>
                      )}
                    </div>
                  </div>

                  <div className="cfg-list-header">Existing Users</div>
                  <div className="cfg-list">
                    {managedUsers.map(user => (
                      <div key={user.id} className="cfg-item">
                        <div className="cfg-item-body">
                          <span className="cfg-item-title">{user.name}</span>
                          <span className="cfg-item-sub">{user.email || 'No email'} · {user.id}</span>
                        </div>
                        <span className={`cfg-item-badge cfg-item-badge--${user.role}`}>{user.role}</span>
                        <div className="cfg-item-actions">
                          <button className="cfg-btn cfg-btn--secondary" onClick={() => startEditUser(user)}>Edit</button>
                          <button className="cfg-btn cfg-btn--danger" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assignments */}
                <div className="cfg-section" data-testid="assignments-content">
                  <div className="cfg-section-header">
                    <h3 className="cfg-section-title">📋 Assign Questions</h3>
                  </div>
                  <div className="cfg-form">
                    <div className="cfg-form-row">
                      <div className="cfg-field cfg-field--full">
                        <label>Select Assessor</label>
                        <div className="cfg-assign-select-header">
                          <select
                            value={selectedUserId}
                            onChange={(e) => {
                              const userId = e.target.value;
                              setSelectedUserId(userId);
                              if (userId) {
                                setSelectedQuestions(getUserAssignments(userId));
                              } else {
                                setSelectedQuestions([]);
                              }
                            }}
                          >
                            <option value="">— choose an assessor —</option>
                            {managedUsers.map(user => (
                              <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                          </select>
                          {selectedUserId && (
                            <span className="cfg-current-assign">
                              {userAssignments[selectedUserId]?.length || 0} currently assigned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {selectedUserId && (
                      <>
                        <div className="cfg-form-row">
                          <div className="cfg-field cfg-field--full">
                            <label>Questions</label>
                            <div className="cfg-form-actions" style={{ marginBottom: '0.5rem' }}>
                              <button type="button" className="cfg-btn cfg-btn--secondary" onClick={() => setSelectedQuestions(managedQuestions.map(q => q.id))}>Select All</button>
                              <button type="button" className="cfg-btn cfg-btn--secondary" onClick={() => setSelectedQuestions([])}>Clear All</button>
                            </div>
                            <div className="cfg-question-list">
                              {managedQuestions.map(question => (
                                <label key={question.id} className="cfg-question-check">
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
                                  <span>{question.text}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="cfg-form-actions">
                          <button className="cfg-btn cfg-btn--primary" onClick={handleAssignQuestions}>Save Assignments</button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="cfg-list-header">Current Assignments</div>
                  <div className="cfg-list">
                    {managedUsers.map(user => {
                      const assignments = userAssignments[user.id] || [];
                      return (
                        <div key={user.id} className="cfg-item">
                          <div className="cfg-item-body">
                            <span className="cfg-item-title">{user.name}</span>
                            <span className="cfg-item-sub">{assignments.length} question{assignments.length !== 1 ? 's' : ''} assigned</span>
                          </div>
                          <span className={`cfg-item-badge cfg-item-badge--${user.role}`}>{assignments.length}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Content: Domains + Questions */}
            {configureSubTab === 'content' && (
              <div data-testid="content-content">
                {/* Domains */}
                <div className="cfg-section" data-testid="domains-content">
                  <div className="cfg-section-header">
                    <h3 className="cfg-section-title">🗂️ {editingDomainId ? 'Edit Domain' : 'Add Domain'}</h3>
                  </div>
                  {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
                  <div className="cfg-form">
                    <div className="cfg-form-row">
                      <div className="cfg-field">
                        <label>Domain ID</label>
                        <input
                          type="text"
                          placeholder="e.g. security"
                          value={domainForm.id}
                          onChange={(e) => setDomainForm({ ...domainForm, id: e.target.value })}
                          disabled={editingDomainId !== null}
                        />
                      </div>
                      <div className="cfg-field">
                        <label>Title</label>
                        <input
                          type="text"
                          placeholder="Data Governance"
                          value={domainForm.title}
                          onChange={(e) => setDomainForm({ ...domainForm, title: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="cfg-form-row">
                      <div className="cfg-field">
                        <label>Description</label>
                        <input
                          type="text"
                          placeholder="Optional description"
                          value={domainForm.description}
                          onChange={(e) => setDomainForm({ ...domainForm, description: e.target.value })}
                        />
                      </div>
                      <div className="cfg-field">
                        <label>Weight</label>
                        <input
                          type="number"
                          placeholder="1.0"
                          value={domainForm.weight}
                          onChange={(e) => setDomainForm({ ...domainForm, weight: parseFloat(e.target.value) })}
                          min="0"
                          step="0.1"
                        />
                        <p className="cfg-field-help">Between 0 and 1 — all domain weights should sum to 1.0.</p>
                      </div>
                    </div>
                    <div className="cfg-form-actions">
                      {editingDomainId ? (
                        <>
                          <button className="cfg-btn cfg-btn--primary" onClick={handleUpdateDomain}>Update Domain</button>
                          <button className="cfg-btn cfg-btn--secondary" onClick={() => { setEditingDomainId(null); setDomainForm({ id: '', title: '', description: '', weight: 1 }); }}>Cancel</button>
                        </>
                      ) : (
                        <button className="cfg-btn cfg-btn--primary" onClick={handleAddDomain}>Add Domain</button>
                      )}
                    </div>
                  </div>

                  <div className="cfg-list-header">Existing Domains</div>
                  <div className="cfg-list">
                    {Object.values(managedDomains).map(domain => (
                      <div key={domain.id} className="cfg-item">
                        <div className="cfg-item-body">
                          <span className="cfg-item-title">{domain.title}</span>
                          <span className="cfg-item-sub">{domain.id} · weight {domain.weight}{domain.description ? ` · ${domain.description}` : ''}</span>
                        </div>
                        <div className="cfg-item-actions">
                          <button className="cfg-btn cfg-btn--secondary" onClick={() => startEditDomain(domain)}>Edit</button>
                          <button className="cfg-btn cfg-btn--danger" onClick={() => handleDeleteDomain(domain.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Questions */}
                <div className="cfg-section" data-testid="questions-content">
                  <div className="cfg-section-header">
                    <h3 className="cfg-section-title">❓ {editingQuestionId ? 'Edit Question' : 'Add Question'}</h3>
                  </div>
                  <div className="cfg-form">
                    <div className="cfg-form-row">
                      <div className="cfg-field">
                        <label>Question ID</label>
                        <input
                          type="text"
                          placeholder="q-001"
                          value={questionForm.id}
                          onChange={(e) => setQuestionForm({ ...questionForm, id: e.target.value })}
                          disabled={editingQuestionId !== null}
                        />
                      </div>
                      <div className="cfg-field">
                        <label>Domain</label>
                        <select
                          value={questionForm.domainId}
                          onChange={(e) => setQuestionForm({ ...questionForm, domainId: e.target.value })}
                        >
                          <option value="">— select domain —</option>
                          {Object.values(managedDomains).map(domain => (
                            <option key={domain.id} value={domain.id}>{domain.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="cfg-form-row">
                      <div className="cfg-field cfg-field--full">
                        <label>Question Text</label>
                        <textarea
                          placeholder="How mature is your data pipeline automation?"
                          value={questionForm.text}
                          onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                          rows="3"
                        />
                      </div>
                    </div>
                    <div className="cfg-form-row">
                      <div className="cfg-field">
                        <label>Category ID</label>
                        <input
                          type="text"
                          placeholder="e.g. pipelines"
                          value={questionForm.categoryId}
                          onChange={(e) => setQuestionForm({ ...questionForm, categoryId: e.target.value })}
                        />
                      </div>
                      <div className="cfg-field">
                        <label>&nbsp;</label>
                        <div className="cfg-checkbox-row">
                          <input
                            id="requires-evidence"
                            type="checkbox"
                            checked={questionForm.requiresEvidence}
                            onChange={(e) => setQuestionForm({ ...questionForm, requiresEvidence: e.target.checked })}
                          />
                          <label htmlFor="requires-evidence">Requires Evidence</label>
                        </div>
                      </div>
                    </div>
                    <div className="cfg-form-actions">
                      {editingQuestionId ? (
                        <>
                          <button className="cfg-btn cfg-btn--primary" onClick={handleUpdateQuestion}>Update Question</button>
                          <button className="cfg-btn cfg-btn--secondary" onClick={() => { setEditingQuestionId(null); setQuestionForm({ id: '', text: '', domainId: '', categoryId: '', requiresEvidence: false }); }}>Cancel</button>
                        </>
                      ) : (
                        <button className="cfg-btn cfg-btn--primary" onClick={handleAddQuestion}>Add Question</button>
                      )}
                    </div>
                  </div>

                  <div className="cfg-list-header">
                    <span>Existing Questions ({managedQuestions.length})</span>
                    <input
                      type="search"
                      className="cfg-search-input"
                      placeholder="Filter questions…"
                      value={questionSearch}
                      onChange={e => setQuestionSearch(e.target.value)}
                      aria-label="Filter questions"
                    />
                  </div>
                  <div className="cfg-list">
                    {managedQuestions
                      .filter(q => !questionSearch || q.text.toLowerCase().includes(questionSearch.toLowerCase()) || q.domainId.toLowerCase().includes(questionSearch.toLowerCase()) || q.categoryId.toLowerCase().includes(questionSearch.toLowerCase()))
                      .map(question => (
                      <div key={question.id} className="cfg-item">
                        <div className="cfg-item-body">
                          <span className="cfg-item-title">{question.text}</span>
                          <span className="cfg-item-sub">{question.domainId} / {question.categoryId}</span>
                        </div>
                        {question.requiresEvidence && (
                          <span className="cfg-item-badge cfg-item-badge--evidence">Evidence</span>
                        )}
                        <div className="cfg-item-actions">
                          <button className="cfg-btn cfg-btn--secondary" onClick={() => startEditQuestion(question)}>Edit</button>
                          <button className="cfg-btn cfg-btn--danger" onClick={() => handleDeleteQuestion(question.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Frameworks */}
            {configureSubTab === 'frameworks' && (
              <div className="cfg-section" data-testid="frameworks-content">
                <div className="cfg-section-header">
                  <h3 className="cfg-section-title">✅ {editingFrameworkId ? 'Edit Framework' : 'Add Framework'}</h3>
                </div>
                {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
                <div className="cfg-form">
                  <div className="cfg-form-row">
                    <div className="cfg-field">
                      <label>Framework ID</label>
                      <input
                        type="text"
                        placeholder="e.g. nist"
                        value={frameworkForm.id}
                        onChange={(e) => setFrameworkForm({ ...frameworkForm, id: e.target.value })}
                        disabled={editingFrameworkId !== null}
                      />
                    </div>
                    <div className="cfg-field">
                      <label>Name</label>
                      <input
                        type="text"
                        placeholder="NIST CSF"
                        value={frameworkForm.name}
                        onChange={(e) => setFrameworkForm({ ...frameworkForm, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="cfg-form-row">
                    <div className="cfg-field cfg-field--full">
                      <label>Description</label>
                      <input
                        type="text"
                        placeholder="Brief description"
                        value={frameworkForm.description}
                        onChange={(e) => setFrameworkForm({ ...frameworkForm, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="cfg-form-row">
                    <div className="cfg-field">
                      <label>Pass Threshold <span style={{ fontWeight: 400, opacity: 0.7 }}>(1–5 maturity score)</span></label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.5"
                        placeholder="3.5"
                        value={frameworkForm.threshold}
                        onChange={(e) => setFrameworkForm({ ...frameworkForm, threshold: e.target.value })}
                      />
                    </div>
                    <div className="cfg-field">
                      <label>Requirements <span style={{ fontWeight: 400, opacity: 0.7 }}>(one per line)</span></label>
                      <textarea
                        rows={4}
                        placeholder="e.g. Annual risk assessment&#10;Access control review"
                        value={frameworkForm.requirements}
                        onChange={(e) => setFrameworkForm({ ...frameworkForm, requirements: e.target.value })}
                        style={{ resize: 'vertical' }}
                      />
                    </div>
                  </div>
                  <div className="cfg-form-actions">
                    {editingFrameworkId ? (
                      <>
                        <button className="cfg-btn cfg-btn--primary" onClick={handleUpdateFramework}>Update Framework</button>
                        <button className="cfg-btn cfg-btn--secondary" onClick={() => { setEditingFrameworkId(null); setFrameworkForm({ id: '', name: '', description: '' }); }}>Cancel</button>
                      </>
                    ) : (
                      <button className="cfg-btn cfg-btn--primary" onClick={handleAddFramework}>Add Framework</button>
                    )}
                  </div>
                </div>

                <div className="cfg-list-header">Existing Frameworks</div>
                <div className="cfg-list">
                  {managedFrameworks.map(framework => (
                    <div key={framework.id} className="cfg-item">
                      <div className="cfg-item-body">
                        <span className="cfg-item-title">{framework.name}</span>
                        <span className="cfg-item-sub">{framework.id}{framework.description ? ` · ${framework.description}` : ''}</span>
                      </div>
                      <label className="cfg-checkbox-row" style={{ cursor: 'pointer', marginBottom: 0 }}>
                        <input
                          type="checkbox"
                          checked={selectedFrameworkIds.includes(framework.id)}
                          onChange={() => handleToggleFramework(framework.id)}
                        />
                        <span>{selectedFrameworkIds.includes(framework.id) ? 'Enabled' : 'Disabled'}</span>
                      </label>
                      <details className="cfg-mapping-details">
                        <summary data-testid={`mapping-toggle-${framework.id}`}>
                          Map Questions ({framework.mappedQuestions?.length || 0} mapped)
                        </summary>
                        <div className="cfg-mapping-questions">
                          {managedQuestions.map(q => (
                            <label key={q.id} className="cfg-mapping-check">
                              <input
                                type="checkbox"
                                checked={framework.mappedQuestions?.includes(q.id) || false}
                                onChange={(e) => handleToggleQuestionMapping(framework.id, q.id, e.target.checked)}
                                data-testid={`map-question-${framework.id}-${q.id}`}
                              />
                              <span>{q.text}</span>
                            </label>
                          ))}
                          {managedQuestions.length === 0 && (
                            <p className="no-questions-hint">No questions available. Add questions first.</p>
                          )}
                        </div>
                      </details>
                      <div className="cfg-item-actions">
                        <button className="cfg-btn cfg-btn--secondary" onClick={() => startEditFramework(framework)}>Edit</button>
                        <button className="cfg-btn cfg-btn--danger" onClick={() => handleDeleteFramework(framework.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Data Tab ─── */}
        {activeTab === 'data' && (
          <div
            className="tab-content"
            data-testid="data-management-content"
            role="tabpanel"
            id="data-management-content"
            aria-labelledby="data-tab"
          >
            <div className="data-management-section">
              <h2>Data Management</h2>

              <section className="management-card">
                <h3>Import &amp; Export Data</h3>
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
                    onClick={onExportData}
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

              <CompareExports />

              <CSVImportExport />

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
                    onClick={onClearAllData}
                    data-testid="clear-all-data-button"
                  >
                    🗑️ Clear All Data
                  </button>
                </div>
              </section>

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
