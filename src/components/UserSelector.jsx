import PropTypes from 'prop-types';
import './UserSelector.css';

export const UserSelector = ({ users, currentUser, onSelectUser }) => {
  const handleChange = (e) => {
    const userId = e.target.value;
    if (userId === '') {
      onSelectUser(null);
    } else {
      const user = users.find(u => u.id === userId);
      onSelectUser(user);
    }
  };

  return (
    <div className="user-selector" data-testid="user-selector">
      <label htmlFor="user-select">
        <span className="user-icon">👤</span>
        Current User:
      </label>
      <select
        id="user-select"
        value={currentUser?.id || ''}
        onChange={handleChange}
        data-testid="user-select"
      >
        <option value="">All Questions (Admin View)</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>
            {user.name} {user.role === 'admin' ? '(Admin)' : ''}
          </option>
        ))}
      </select>
      {currentUser && (
        <span className="user-info" data-testid="user-info">
          {currentUser.role === 'admin' ? '🔑 Admin' : '📋 Assessor'}
        </span>
      )}
    </div>
  );
};

UserSelector.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    assignedQuestions: PropTypes.arrayOf(PropTypes.string)
  })).isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    assignedQuestions: PropTypes.arrayOf(PropTypes.string)
  }),
  onSelectUser: PropTypes.func.isRequired
};