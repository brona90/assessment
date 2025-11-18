import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserSelector } from './UserSelector';

describe('UserSelector', () => {
  const mockUsers = [
    { id: 'admin', name: 'Admin User', role: 'admin', assignedQuestions: [] },
    { id: 'user1', name: 'User 1', role: 'assessor', assignedQuestions: ['q1'] },
    { id: 'user2', name: 'User 2', role: 'assessor', assignedQuestions: ['q2'] }
  ];

  it('should render user selector', () => {
    const onSelectUser = vi.fn();
    render(<UserSelector users={mockUsers} currentUser={null} onSelectUser={onSelectUser} />);
    
    expect(screen.getByTestId('user-selector')).toBeInTheDocument();
    expect(screen.getByTestId('user-select')).toBeInTheDocument();
  });

  it('should display all users in dropdown', () => {
    const onSelectUser = vi.fn();
    render(<UserSelector users={mockUsers} currentUser={null} onSelectUser={onSelectUser} />);
    
    const select = screen.getByTestId('user-select');
    expect(select).toHaveLength(4); // 1 default + 3 users
  });

  it('should show current user when selected', () => {
    const onSelectUser = vi.fn();
    const currentUser = mockUsers[0];
    render(<UserSelector users={mockUsers} currentUser={currentUser} onSelectUser={onSelectUser} />);
    
    const select = screen.getByTestId('user-select');
    expect(select.value).toBe('admin');
  });

  it('should call onSelectUser when user is selected', () => {
    const onSelectUser = vi.fn();
    render(<UserSelector users={mockUsers} currentUser={null} onSelectUser={onSelectUser} />);
    
    const select = screen.getByTestId('user-select');
    fireEvent.change(select, { target: { value: 'user1' } });
    
    expect(onSelectUser).toHaveBeenCalledWith(mockUsers[1]);
  });

  it('should call onSelectUser with null when "All Questions" is selected', () => {
    const onSelectUser = vi.fn();
    const currentUser = mockUsers[1];
    render(<UserSelector users={mockUsers} currentUser={currentUser} onSelectUser={onSelectUser} />);
    
    const select = screen.getByTestId('user-select');
    fireEvent.change(select, { target: { value: '' } });
    
    expect(onSelectUser).toHaveBeenCalledWith(null);
  });

  it('should show admin badge for admin user', () => {
    const onSelectUser = vi.fn();
    const currentUser = mockUsers[0];
    render(<UserSelector users={mockUsers} currentUser={currentUser} onSelectUser={onSelectUser} />);
    
    expect(screen.getByTestId('user-info')).toHaveTextContent('Admin');
  });

  it('should show assessor badge for regular user', () => {
    const onSelectUser = vi.fn();
    const currentUser = mockUsers[1];
    render(<UserSelector users={mockUsers} currentUser={currentUser} onSelectUser={onSelectUser} />);
    
    expect(screen.getByTestId('user-info')).toHaveTextContent('Assessor');
  });

  it('should not show user info when no user is selected', () => {
    const onSelectUser = vi.fn();
    render(<UserSelector users={mockUsers} currentUser={null} onSelectUser={onSelectUser} />);
    
    expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
  });

  it('should handle empty users array', () => {
    const onSelectUser = vi.fn();
    render(<UserSelector users={[]} currentUser={null} onSelectUser={onSelectUser} />);
    
    const select = screen.getByTestId('user-select');
    expect(select).toHaveLength(1); // Only default option
  });

  it('should display admin label in dropdown for admin users', () => {
    const onSelectUser = vi.fn();
    render(<UserSelector users={mockUsers} currentUser={null} onSelectUser={onSelectUser} />);
    
    const options = screen.getAllByRole('option');
    const adminOption = options.find(opt => opt.value === 'admin');
    expect(adminOption).toHaveTextContent('(Admin)');
  });

  it('should not display admin label for non-admin users', () => {
    const onSelectUser = vi.fn();
    render(<UserSelector users={mockUsers} currentUser={null} onSelectUser={onSelectUser} />);
    
    const options = screen.getAllByRole('option');
    const userOption = options.find(opt => opt.value === 'user1');
    expect(userOption).not.toHaveTextContent('(Admin)');
  });
});