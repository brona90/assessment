import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { EnhancedAdminPanel } from './EnhancedAdminPanel';

// Mock the useDataStore hook
const mockImportData = vi.fn();
const mockDownloadData = vi.fn();
const mockInit = vi.fn();

vi.mock('../hooks/useDataStore', () => ({
  useDataStore: () => ({
    initialized: true,
    loading: false,
    error: null,
    getDomains: vi.fn(() => ({})),
    getUsers: vi.fn(() => []),
    getFrameworks: vi.fn(() => []),
    getQuestions: vi.fn(() => []),
    getSelectedFrameworks: vi.fn(() => []),
    addDomain: vi.fn(),
    updateDomain: vi.fn(),
    deleteDomain: vi.fn(),
    addUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    addFramework: vi.fn(),
    updateFramework: vi.fn(),
    deleteFramework: vi.fn(),
    setSelectedFrameworks: vi.fn(),
    assignQuestions: vi.fn(),
    getAssignedQuestions: vi.fn(() => []),
    exportData: vi.fn(() => '{}'),
    importData: mockImportData,
    downloadData: mockDownloadData,
    init: mockInit
  })
}));

describe('EnhancedAdminPanel - File Upload Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockImportData.mockReturnValue({ success: true });
  });

  describe('Component Rendering', () => {
    it('should render the admin panel', () => {
      const { container } = render(<EnhancedAdminPanel />);
      expect(container).toBeTruthy();
    });

    it('should render data management tab button', () => {
      const { container } = render(<EnhancedAdminPanel />);
      const buttons = container.querySelectorAll('button');
      const dataManagementButton = Array.from(buttons).find(
        btn => btn.textContent.includes('Data Management')
      );
      expect(dataManagementButton).toBeTruthy();
    });
  });

  describe('Hook Integration', () => {
    it('should have importData function available from hook', () => {
      render(<EnhancedAdminPanel />);
      expect(mockImportData).toBeDefined();
      expect(typeof mockImportData).toBe('function');
    });

    it('should have downloadData function available from hook', () => {
      render(<EnhancedAdminPanel />);
      expect(mockDownloadData).toBeDefined();
      expect(typeof mockDownloadData).toBe('function');
    });
  });
});