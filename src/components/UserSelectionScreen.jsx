import PropTypes from 'prop-types';
import './UserSelectionScreen.css';

export const UserSelectionScreen = ({ users, onSelectUser }) => {
  return (
    <div className="user-selection-screen" data-testid="user-selection-screen">
      <div className="user-selection-container">
        <div className="user-selection-header">
          <h1>Technology Assessment Framework</h1>
          <p>Select your profile to begin</p>
        </div>
        
        <div className="user-grid">
          {users.map(user => (
            <button
              key={user.id}
              className={`user-card ${user.role === 'admin' ? 'admin-card' : 'user-card'}`}
              onClick={() => onSelectUser(user)}
              data-testid={`user-card-${user.id}`}
            >
              <div className="user-avatar">
                {user.role === 'admin' ? '👨‍💼' : '👤'}
              </div>
              <div className="user-info">
                <h3>{user.name}</h3>
                {user.title && <p className="user-title">{user.title}</p>}
                <span className={`user-role ${user.role === 'admin' ? 'admin-badge' : 'user-badge'}`}>
                  {user.role === 'admin' ? 'Administrator' : 'User'}
                </span>
              </div>
            </button>
          ))}
        </div>
        
        {users.length === 0 && (
          <div className="no-users-message">
            <p>No users available. Please contact your administrator.</p>
          </div>
        )}
      </div>
    </div>
  );
};

UserSelectionScreen.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      role: PropTypes.string
    })
  ).isRequired,
  onSelectUser: PropTypes.func.isRequired
};

export default UserSelectionScreen;