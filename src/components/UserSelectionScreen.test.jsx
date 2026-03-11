import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { UserSelectionScreen } from './UserSelectionScreen';

describe('UserSelectionScreen', () => {
  const mockUsers = [
    { id: 'user1', name: 'John Doe', role: 'user' },
    { id: 'admin1', name: 'Admin User', role: 'admin' },
    { id: 'user2', name: 'Jane Smith', role: 'user' }
  ];

  const mockOnSelectUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render user selection screen', () => {
    render(<UserSelectionScreen users={mockUsers} onSelectUser={mockOnSelectUser} />);

    expect(screen.getByTestId('user-selection-screen')).toBeInTheDocument();
    expect(screen.getByText('Technology Assessment Framework')).toBeInTheDocument();
    expect(screen.getByText('Select your role to start your assessment')).toBeInTheDocument();
  });

  it('should render all user cards', () => {
    render(<UserSelectionScreen users={mockUsers} onSelectUser={mockOnSelectUser} />);

    expect(screen.getByTestId('user-card-user1')).toBeInTheDocument();
    expect(screen.getByTestId('user-card-admin1')).toBeInTheDocument();
    expect(screen.getByTestId('user-card-user2')).toBeInTheDocument();
  });

  it('should display user names correctly', () => {
    render(<UserSelectionScreen users={mockUsers} onSelectUser={mockOnSelectUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should display role badges correctly', () => {
    render(<UserSelectionScreen users={mockUsers} onSelectUser={mockOnSelectUser} />);

    const adminBadges = screen.getAllByText('Administrator');
    const userBadges = screen.getAllByText('User');

    expect(adminBadges).toHaveLength(1);
    expect(userBadges).toHaveLength(2);
  });

  it('should call onSelectUser when user card is clicked (after 150ms delay)', async () => {
    vi.useFakeTimers();
    render(<UserSelectionScreen users={mockUsers} onSelectUser={mockOnSelectUser} />);

    const userCard = screen.getByTestId('user-card-user1');
    fireEvent.click(userCard);

    // Not called yet — 150ms debounce
    expect(mockOnSelectUser).not.toHaveBeenCalled();

    await act(async () => { vi.advanceTimersByTime(200); });

    expect(mockOnSelectUser).toHaveBeenCalledWith(mockUsers[0]);
    expect(mockOnSelectUser).toHaveBeenCalledTimes(1);
  });

  it('should call onSelectUser with admin user', async () => {
    vi.useFakeTimers();
    render(<UserSelectionScreen users={mockUsers} onSelectUser={mockOnSelectUser} />);

    const adminCard = screen.getByTestId('user-card-admin1');
    fireEvent.click(adminCard);

    await act(async () => { vi.advanceTimersByTime(200); });

    expect(mockOnSelectUser).toHaveBeenCalledWith(mockUsers[1]);
  });

  it('should show no users message when users array is empty', () => {
    render(<UserSelectionScreen users={[]} onSelectUser={mockOnSelectUser} />);

    expect(screen.getByText(/No users available/i)).toBeInTheDocument();
    expect(screen.getByText(/contact your administrator/i)).toBeInTheDocument();
  });

  it('should apply admin-card class to admin users', () => {
    render(<UserSelectionScreen users={mockUsers} onSelectUser={mockOnSelectUser} />);

    const adminCard = screen.getByTestId('user-card-admin1');
    expect(adminCard).toHaveClass('admin-card');
  });

  it('should apply user-card class to regular users', () => {
    render(<UserSelectionScreen users={mockUsers} onSelectUser={mockOnSelectUser} />);

    const userCard = screen.getByTestId('user-card-user1');
    expect(userCard).toHaveClass('user-card');
  });

  it('should add selected class when card is clicked', () => {
    vi.useFakeTimers();
    render(<UserSelectionScreen users={mockUsers} onSelectUser={mockOnSelectUser} />);

    const userCard = screen.getByTestId('user-card-user1');
    fireEvent.click(userCard);

    expect(userCard).toHaveClass('user-card--selected');
  });

  it('should have aria-label on user buttons', () => {
    render(<UserSelectionScreen users={mockUsers} onSelectUser={mockOnSelectUser} />);

    expect(screen.getByTestId('user-card-user1')).toHaveAttribute('aria-label', 'Select John Doe — User');
    expect(screen.getByTestId('user-card-admin1')).toHaveAttribute('aria-label', 'Select Admin User — Administrator');
  });
});
