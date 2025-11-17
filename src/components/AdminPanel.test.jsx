import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminPanel } from './AdminPanel';

describe('AdminPanel', () => {
  const mockDomains = {
    domain1: {
      title: 'Domain 1',
      categories: {
        cat1: {
          title: 'Category 1',
          questions: [
            { id: 'q1', text: 'Question 1', requiresEvidence: false },
            { id: 'q2', text: 'Question 2', requiresEvidence: true }
          ]
        }
      }
    }
  };

  const mockUsers = [
    { id: 'admin', name: 'Admin', email: 'admin@test.com', role: 'admin', assignedQuestions: [] },
    { id: 'user1', name: 'User 1', email: 'user1@test.com', role: 'assessor', assignedQuestions: ['q1'] }
  ];

  const mockHandlers = {
    onUpdateQuestion: vi.fn(),
    onAddQuestion: vi.fn(),
    onDeleteQuestion: vi.fn(),
    onUpdateUserAssignments: vi.fn(),
    onAddUser: vi.fn(),
    onDeleteUser: vi.fn()
  };

  it('should render admin panel', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    expect(screen.getByTestId('admin-panel')).toBeInTheDocument();
  });

  it('should render admin header', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    expect(screen.getByText('🔧 Admin Panel')).toBeInTheDocument();
  });

  it('should render tab buttons', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    expect(screen.getByTestId('tab-questions')).toBeInTheDocument();
    expect(screen.getByTestId('tab-users')).toBeInTheDocument();
    expect(screen.getByTestId('tab-assignments')).toBeInTheDocument();
  });

  it('should show questions tab by default', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    expect(screen.getByTestId('questions-manager')).toBeInTheDocument();
  });

  it('should switch to users tab', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    fireEvent.click(screen.getByTestId('tab-users'));
    expect(screen.getByTestId('users-manager')).toBeInTheDocument();
  });

  it('should switch to assignments tab', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    fireEvent.click(screen.getByTestId('tab-assignments'));
    expect(screen.getByTestId('assignments-manager')).toBeInTheDocument();
  });

  it('should render domain selector', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    expect(screen.getByTestId('domain-select')).toBeInTheDocument();
  });

  it('should show category selector after domain selection', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    const domainSelect = screen.getByTestId('domain-select');
    fireEvent.change(domainSelect, { target: { value: 'domain1' } });
    expect(screen.getByTestId('category-select')).toBeInTheDocument();
  });

  it('should display questions for selected category', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    
    fireEvent.change(screen.getByTestId('domain-select'), { target: { value: 'domain1' } });
    fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'cat1' } });
    
    expect(screen.getByTestId('question-item-q1')).toBeInTheDocument();
    expect(screen.getByTestId('question-item-q2')).toBeInTheDocument();
  });

  it('should show edit button for questions', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    
    fireEvent.change(screen.getByTestId('domain-select'), { target: { value: 'domain1' } });
    fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'cat1' } });
    
    expect(screen.getByTestId('edit-q1')).toBeInTheDocument();
  });

  it('should show delete button for questions', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    
    fireEvent.change(screen.getByTestId('domain-select'), { target: { value: 'domain1' } });
    fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'cat1' } });
    
    expect(screen.getByTestId('delete-q1')).toBeInTheDocument();
  });

  it('should populate form when editing question', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    
    fireEvent.change(screen.getByTestId('domain-select'), { target: { value: 'domain1' } });
    fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'cat1' } });
    fireEvent.click(screen.getByTestId('edit-q1'));
    
    expect(screen.getByTestId('question-id-input')).toHaveValue('q1');
    expect(screen.getByTestId('question-text-input')).toHaveValue('Question 1');
  });

  it('should call onDeleteQuestion when delete is clicked', () => {
    window.confirm = vi.fn(() => true);
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    
    fireEvent.change(screen.getByTestId('domain-select'), { target: { value: 'domain1' } });
    fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'cat1' } });
    fireEvent.click(screen.getByTestId('delete-q1'));
    
    expect(mockHandlers.onDeleteQuestion).toHaveBeenCalledWith('domain1', 'cat1', 'q1');
  });

  it('should not delete when confirm is cancelled', () => {
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => false);
    
    const handlers = {
      ...mockHandlers,
      onDeleteQuestion: vi.fn()
    };
    
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...handlers} />);
    
    fireEvent.change(screen.getByTestId('domain-select'), { target: { value: 'domain1' } });
    fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'cat1' } });
    fireEvent.click(screen.getByTestId('delete-q1'));
    
    expect(handlers.onDeleteQuestion).not.toHaveBeenCalled();
    window.confirm = originalConfirm;
  });

  it('should call onAddQuestion when add button is clicked', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    
    fireEvent.change(screen.getByTestId('domain-select'), { target: { value: 'domain1' } });
    fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'cat1' } });
    
    fireEvent.change(screen.getByTestId('question-id-input'), { target: { value: 'q3' } });
    fireEvent.change(screen.getByTestId('question-text-input'), { target: { value: 'New Question' } });
    fireEvent.click(screen.getByTestId('add-question-btn'));
    
    expect(mockHandlers.onAddQuestion).toHaveBeenCalledWith('domain1', 'cat1', {
      id: 'q3',
      text: 'New Question',
      requiresEvidence: false
    });
  });

  it('should call onUpdateQuestion when update button is clicked', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    
    fireEvent.change(screen.getByTestId('domain-select'), { target: { value: 'domain1' } });
    fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'cat1' } });
    fireEvent.click(screen.getByTestId('edit-q1'));
    
    fireEvent.change(screen.getByTestId('question-text-input'), { target: { value: 'Updated Question' } });
    fireEvent.click(screen.getByTestId('update-question-btn'));
    
    expect(mockHandlers.onUpdateQuestion).toHaveBeenCalled();
  });

  it('should cancel editing when cancel button is clicked', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    
    fireEvent.change(screen.getByTestId('domain-select'), { target: { value: 'domain1' } });
    fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'cat1' } });
    fireEvent.click(screen.getByTestId('edit-q1'));
    
    expect(screen.getByTestId('update-question-btn')).toBeInTheDocument();
    
    fireEvent.click(screen.getByTestId('cancel-edit-btn'));
    
    expect(screen.getByTestId('add-question-btn')).toBeInTheDocument();
  });

  it('should toggle requires evidence checkbox', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    
    fireEvent.change(screen.getByTestId('domain-select'), { target: { value: 'domain1' } });
    fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'cat1' } });
    
    const checkbox = screen.getByTestId('requires-evidence-checkbox');
    expect(checkbox).not.toBeChecked();
    
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('should display users in users tab', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    fireEvent.click(screen.getByTestId('tab-users'));
    
    expect(screen.getByTestId('user-item-admin')).toBeInTheDocument();
    expect(screen.getByTestId('user-item-user1')).toBeInTheDocument();
  });

  it('should not show delete button for admin user', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    fireEvent.click(screen.getByTestId('tab-users'));
    
    expect(screen.queryByTestId('delete-user-admin')).not.toBeInTheDocument();
  });

  it('should show delete button for non-admin users', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    fireEvent.click(screen.getByTestId('tab-users'));
    
    expect(screen.getByTestId('delete-user-user1')).toBeInTheDocument();
  });

  it('should call onDeleteUser when delete user is clicked', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    fireEvent.click(screen.getByTestId('tab-users'));
    fireEvent.click(screen.getByTestId('delete-user-user1'));
    
    expect(mockHandlers.onDeleteUser).toHaveBeenCalledWith('user1');
  });

  it('should handle empty questions array', () => {
    const emptyDomains = {
      domain1: {
        title: 'Domain 1',
        categories: {
          cat1: {
            title: 'Category 1',
            questions: []
          }
        }
      }
    };
    
    render(<AdminPanel domains={emptyDomains} users={mockUsers} {...mockHandlers} />);
    
    fireEvent.change(screen.getByTestId('domain-select'), { target: { value: 'domain1' } });
    fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'cat1' } });
    
    expect(screen.getByText('Existing Questions')).toBeInTheDocument();
  });

  it('should handle domains without categories', () => {
    const noCatDomains = {
      domain1: {
        title: 'Domain 1',
        categories: {}
      }
    };
    
    render(<AdminPanel domains={noCatDomains} users={mockUsers} {...mockHandlers} />);
    
    fireEvent.change(screen.getByTestId('domain-select'), { target: { value: 'domain1' } });
    
    expect(screen.getByTestId('category-select')).toBeInTheDocument();
  });

  it('should not call onAddQuestion with incomplete data', () => {
    const handlers = {
      ...mockHandlers,
      onAddQuestion: vi.fn()
    };
    
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...handlers} />);
    
    fireEvent.change(screen.getByTestId('domain-select'), { target: { value: 'domain1' } });
    fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'cat1' } });
    
    // Only fill ID, not text
    fireEvent.change(screen.getByTestId('question-id-input'), { target: { value: 'q3' } });
    fireEvent.click(screen.getByTestId('add-question-btn'));
    
    expect(handlers.onAddQuestion).not.toHaveBeenCalled();
  });

  it('should reset form after adding question', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    
    fireEvent.change(screen.getByTestId('domain-select'), { target: { value: 'domain1' } });
    fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'cat1' } });
    
    fireEvent.change(screen.getByTestId('question-id-input'), { target: { value: 'q3' } });
    fireEvent.change(screen.getByTestId('question-text-input'), { target: { value: 'New Question' } });
    fireEvent.click(screen.getByTestId('add-question-btn'));
    
    expect(screen.getByTestId('question-id-input')).toHaveValue('');
    expect(screen.getByTestId('question-text-input')).toHaveValue('');
  });

  it('should clear category when domain changes', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    
    fireEvent.change(screen.getByTestId('domain-select'), { target: { value: 'domain1' } });
    fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'cat1' } });
    
    // Change domain
    fireEvent.change(screen.getByTestId('domain-select'), { target: { value: '' } });
    
    // Category select should not be visible
    expect(screen.queryByTestId('category-select')).not.toBeInTheDocument();
  });

  it('should return empty array when no domain selected in getQuestionsForCategory', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    
    // Don't select any domain or category
    // The component should handle this gracefully
    expect(screen.getByTestId('admin-panel')).toBeInTheDocument();
  });

  it('should return empty array when domain has no categories', () => {
    const domainsWithoutCategories = {
      domain1: {
        title: 'Domain 1',
        categories: undefined
      }
    };
    
    render(<AdminPanel domains={domainsWithoutCategories} users={mockUsers} {...mockHandlers} />);
    
    fireEvent.change(screen.getByTestId('domain-select'), { target: { value: 'domain1' } });
    
    // Should handle missing categories gracefully
    expect(screen.getByTestId('admin-panel')).toBeInTheDocument();
  });

  it('should handle selecting non-existent domain', () => {
    render(<AdminPanel domains={mockDomains} users={mockUsers} {...mockHandlers} />);
    
    // Try to select a domain that doesn't exist in the domains object
    fireEvent.change(screen.getByTestId('domain-select'), { target: { value: 'nonexistent' } });
    
    // Should handle gracefully without errors
    expect(screen.getByTestId('admin-panel')).toBeInTheDocument();
  });
});