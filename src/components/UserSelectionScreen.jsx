import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { User, UserCog } from 'lucide-react';
import logoUrl from '../assets/ftc-logo-horizontal.svg';
import './UserSelectionScreen.css';

export const UserSelectionScreen = ({ users, onSelectUser }) => {
  const [selectedId, setSelectedId] = useState(null);

  const handleSelect = useCallback((user) => {
    setSelectedId(user.id);
    setTimeout(() => onSelectUser(user), 150);
  }, [onSelectUser]);

  return (
    <div className="user-selection-screen" data-testid="user-selection-screen">
      <div className="user-selection-container">
        <header className="user-selection-header">
          <img src={logoUrl} alt="fosterthecode" className="brand-logo" />
          <h1>Technology Assessment Framework</h1>
          <p>Select your role to start your assessment</p>
        </header>

        <main className="user-selection-main">
          <h2 className="sr-only">Available Profiles</h2>
          <ul className="user-grid" role="list">
            {users.map(user => (
              <li key={user.id} className="user-grid-item">
                <button
                  className={`user-card${user.role === 'admin' ? ' admin-card' : ''}${selectedId === user.id ? ' user-card--selected' : ''}`}
                  onClick={() => handleSelect(user)}
                  data-testid={`user-card-${user.id}`}
                  aria-label={`Select ${user.name} — ${user.role === 'admin' ? 'Administrator' : 'User'}`}
                >
                  <div className="user-avatar" aria-hidden="true">
                    {user.role === 'admin' ? <UserCog size={24} /> : <User size={24} />}
                  </div>
                  <div className="user-info">
                    <h3>{user.name}</h3>
                    {user.title && <p className="user-title">{user.title}</p>}
                    <span className={`user-role ${user.role === 'admin' ? 'admin-badge' : 'user-badge'}`}>
                      {user.role === 'admin' ? 'Administrator' : 'User'}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {users.length === 0 && (
            <div className="no-users-message">
              <p>No users available. Please contact your administrator.</p>
            </div>
          )}
        </main>
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

