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
              className={`user-card ${user.isAdmin ? 'admin-card' : 'user-card'}`}
              onClick={() => onSelectUser(user)}
              data-testid={`user-card-${user.id}`}
            >
              <div className="user-avatar">
                {user.isAdmin ? '👨‍💼' : '👤'}
              </div>
              <div className="user-info">
                <h3>{user.name}</h3>
                <span className={`user-role ${user.isAdmin ? 'admin-badge' : 'user-badge'}`}>
                  {user.isAdmin ? 'Administrator' : 'User'}
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
      isAdmin: PropTypes.bool
    })
  ).isRequired,
  onSelectUser: PropTypes.func.isRequired
};

export default UserSelectionScreen;