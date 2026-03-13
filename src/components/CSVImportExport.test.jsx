import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CSVImportExport } from './CSVImportExport';

// ─── Stable mock references (hoisted to prevent infinite loops) ───────────────
const datastoreMocks = vi.hoisted(() => ({
  getDomains: vi.fn(() => ({})),
  getUsers: vi.fn(() => []),
  getFrameworks: vi.fn(() => []),
  addQuestion: vi.fn(),
  addUser: vi.fn(),
  addDomain: vi.fn(),
  addFramework: vi.fn(),
}));

vi.mock('../hooks/useDataStore', () => ({
  useDataStore: () => datastoreMocks,
}));

// ─── Mock csvUtils ────────────────────────────────────────────────────────────
const csvMocks = vi.hoisted(() => ({
  downloadCsv: vi.fn(),
  parseCsv: vi.fn(() => []),
  questionsToRows: vi.fn(() => []),
  rowsToQuestions: vi.fn(() => ({})),
  usersToRows: vi.fn(() => []),
  rowsToUsers: vi.fn(() => []),
  domainsToRows: vi.fn(() => []),
  rowsToDomains: vi.fn(() => ({})),
  frameworksToRows: vi.fn(() => []),
  rowsToFrameworks: vi.fn(() => []),
  QUESTIONS_COLUMNS: ['domain_id', 'domain_title', 'domain_weight', 'category_id', 'category_title', 'question_id', 'question_text', 'requires_evidence'],
  USERS_COLUMNS: ['id', 'name', 'email', 'role', 'title', 'assigned_question_ids'],
  DOMAINS_COLUMNS: ['id', 'title', 'weight'],
  FRAMEWORKS_COLUMNS: ['id', 'name', 'enabled', 'category', 'threshold', 'color', 'icon', 'description', 'mapped_question_ids'],
  TEMPLATE_ROWS: {
    questions: [{ domain_id: 'd1', question_id: 'q1', question_text: 'Example?' }],
    users: [{ id: 'u1', name: 'Alice' }],
    domains: [{ id: 'd1', title: 'Domain 1', weight: '0.3' }],
    frameworks: [{ id: 'fw1', name: 'Framework 1' }],
  },
}));

vi.mock('../utils/csvUtils', () => csvMocks);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Create a File object with text content, and polyfill .text() for jsdom.
 */
function makeCsvFile(content, name = 'data.csv') {
  const file = new File([content], name, { type: 'text/csv' });
  file.text = () => Promise.resolve(content);
  return file;
}

/**
 * Upload a file to one of the import inputs.
 */
function uploadFile(entityKey, file) {
  const input = screen.getByTestId(`csv-import-${entityKey}`);
  fireEvent.change(input, { target: { files: [file] } });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CSVImportExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    datastoreMocks.getDomains.mockReturnValue({});
    datastoreMocks.getUsers.mockReturnValue([]);
    datastoreMocks.getFrameworks.mockReturnValue([]);
  });

  // ─── Rendering ────────────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('should render the CSV import/export section', () => {
      render(<CSVImportExport />);
      expect(screen.getByTestId('csv-import-export')).toBeInTheDocument();
    });

    it('should render the section heading', () => {
      render(<CSVImportExport />);
      expect(screen.getByText('CSV Import / Export')).toBeInTheDocument();
    });

    it('should render help text', () => {
      render(<CSVImportExport />);
      expect(screen.getByText(/Download current data as CSV/)).toBeInTheDocument();
    });

    it('should render all 4 entity cards', () => {
      render(<CSVImportExport />);
      expect(screen.getByTestId('csv-entity-questions')).toBeInTheDocument();
      expect(screen.getByTestId('csv-entity-users')).toBeInTheDocument();
      expect(screen.getByTestId('csv-entity-domains')).toBeInTheDocument();
      expect(screen.getByTestId('csv-entity-frameworks')).toBeInTheDocument();
    });

    it('should render entity labels', () => {
      render(<CSVImportExport />);
      expect(screen.getByText('Questions')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Domains')).toBeInTheDocument();
      expect(screen.getByText('Frameworks')).toBeInTheDocument();
    });

    it.each(['questions', 'users', 'domains', 'frameworks'])(
      'should render export, template, and import buttons for %s',
      (key) => {
        render(<CSVImportExport />);
        expect(screen.getByTestId(`csv-export-${key}`)).toBeInTheDocument();
        expect(screen.getByTestId(`csv-template-${key}`)).toBeInTheDocument();
        expect(screen.getByTestId(`csv-import-label-${key}`)).toBeInTheDocument();
        expect(screen.getByTestId(`csv-import-${key}`)).toBeInTheDocument();
      }
    );

    it('should render file inputs with accept=".csv"', () => {
      render(<CSVImportExport />);
      const inputs = ['questions', 'users', 'domains', 'frameworks'].map(
        k => screen.getByTestId(`csv-import-${k}`)
      );
      inputs.forEach(input => {
        expect(input).toHaveAttribute('accept', '.csv');
      });
    });

    it('should not show any status messages initially', () => {
      render(<CSVImportExport />);
      expect(screen.queryByTestId('csv-status-questions')).not.toBeInTheDocument();
      expect(screen.queryByTestId('csv-status-users')).not.toBeInTheDocument();
      expect(screen.queryByTestId('csv-status-domains')).not.toBeInTheDocument();
      expect(screen.queryByTestId('csv-status-frameworks')).not.toBeInTheDocument();
    });
  });

  // ─── Export ───────────────────────────────────────────────────────────────

  describe('Export', () => {
    it('should export questions — calls getDomains, questionsToRows, downloadCsv', () => {
      const mockDomains = { d1: { title: 'Domain 1', categories: {} } };
      datastoreMocks.getDomains.mockReturnValue(mockDomains);
      const fakeRows = [{ domain_id: 'd1', question_id: 'q1' }];
      csvMocks.questionsToRows.mockReturnValue(fakeRows);

      render(<CSVImportExport />);
      fireEvent.click(screen.getByTestId('csv-export-questions'));

      expect(datastoreMocks.getDomains).toHaveBeenCalled();
      expect(csvMocks.questionsToRows).toHaveBeenCalledWith(mockDomains);
      expect(csvMocks.downloadCsv).toHaveBeenCalledWith(
        'questions.csv', fakeRows, csvMocks.QUESTIONS_COLUMNS
      );
    });

    it('should export users — calls getUsers, usersToRows, downloadCsv', () => {
      const mockUsers = [{ id: 'u1', name: 'Alice' }];
      datastoreMocks.getUsers.mockReturnValue(mockUsers);
      const fakeRows = [{ id: 'u1', name: 'Alice' }];
      csvMocks.usersToRows.mockReturnValue(fakeRows);

      render(<CSVImportExport />);
      fireEvent.click(screen.getByTestId('csv-export-users'));

      expect(datastoreMocks.getUsers).toHaveBeenCalled();
      expect(csvMocks.usersToRows).toHaveBeenCalledWith(mockUsers);
      expect(csvMocks.downloadCsv).toHaveBeenCalledWith(
        'users.csv', fakeRows, csvMocks.USERS_COLUMNS
      );
    });

    it('should export domains — calls getDomains, domainsToRows, downloadCsv', () => {
      const mockDomains = { d1: { title: 'D1', weight: 0.5 } };
      datastoreMocks.getDomains.mockReturnValue(mockDomains);
      const fakeRows = [{ id: 'd1', title: 'D1', weight: '0.5' }];
      csvMocks.domainsToRows.mockReturnValue(fakeRows);

      render(<CSVImportExport />);
      fireEvent.click(screen.getByTestId('csv-export-domains'));

      expect(datastoreMocks.getDomains).toHaveBeenCalled();
      expect(csvMocks.domainsToRows).toHaveBeenCalledWith(mockDomains);
      expect(csvMocks.downloadCsv).toHaveBeenCalledWith(
        'domains.csv', fakeRows, csvMocks.DOMAINS_COLUMNS
      );
    });

    it('should export frameworks — calls getFrameworks, frameworksToRows, downloadCsv', () => {
      const mockFrameworks = [{ id: 'fw1', name: 'FW1' }];
      datastoreMocks.getFrameworks.mockReturnValue(mockFrameworks);
      const fakeRows = [{ id: 'fw1', name: 'FW1' }];
      csvMocks.frameworksToRows.mockReturnValue(fakeRows);

      render(<CSVImportExport />);
      fireEvent.click(screen.getByTestId('csv-export-frameworks'));

      expect(datastoreMocks.getFrameworks).toHaveBeenCalled();
      expect(csvMocks.frameworksToRows).toHaveBeenCalledWith(mockFrameworks);
      expect(csvMocks.downloadCsv).toHaveBeenCalledWith(
        'frameworks.csv', fakeRows, csvMocks.FRAMEWORKS_COLUMNS
      );
    });
  });

  // ─── Template ─────────────────────────────────────────────────────────────

  describe('Template download', () => {
    it.each([
      ['questions', csvMocks.QUESTIONS_COLUMNS],
      ['users', csvMocks.USERS_COLUMNS],
      ['domains', csvMocks.DOMAINS_COLUMNS],
      ['frameworks', csvMocks.FRAMEWORKS_COLUMNS],
    ])('should download %s template with TEMPLATE_ROWS and correct columns', (key, columns) => {
      render(<CSVImportExport />);
      fireEvent.click(screen.getByTestId(`csv-template-${key}`));

      expect(csvMocks.downloadCsv).toHaveBeenCalledWith(
        `${key}-template.csv`,
        csvMocks.TEMPLATE_ROWS[key],
        columns
      );
    });
  });

  // ─── Import: Questions ────────────────────────────────────────────────────

  describe('Import questions', () => {
    it('should import questions and show success status', async () => {
      const parsedRows = [
        { domain_id: 'd1', domain_title: 'D1', domain_weight: '0.3', category_id: 'c1', category_title: 'C1', question_id: 'q1', question_text: 'Q?', requires_evidence: 'false' },
        { domain_id: 'd1', domain_title: 'D1', domain_weight: '0.3', category_id: 'c1', category_title: 'C1', question_id: 'q2', question_text: 'Q2?', requires_evidence: 'true' },
      ];
      csvMocks.parseCsv.mockReturnValue(parsedRows);

      const domainsObj = {
        d1: {
          title: 'D1', weight: 0.3,
          categories: {
            c1: { title: 'C1', questions: [
              { id: 'q1', text: 'Q?', requiresEvidence: false },
              { id: 'q2', text: 'Q2?', requiresEvidence: true },
            ] }
          }
        }
      };
      csvMocks.rowsToQuestions.mockReturnValue(domainsObj);

      render(<CSVImportExport />);
      const file = makeCsvFile('domain_id,question_id\nd1,q1\nd1,q2');
      uploadFile('questions', file);

      await waitFor(() => {
        const status = screen.getByTestId('csv-status-questions');
        expect(status).toHaveTextContent('Imported 2 questions across 1 domains.');
        expect(status).toHaveClass('csv-status--success');
      });

      expect(datastoreMocks.addQuestion).toHaveBeenCalledTimes(2);
      expect(datastoreMocks.addQuestion).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'q1', domainId: 'd1', categoryId: 'c1' })
      );
      expect(datastoreMocks.addQuestion).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'q2', domainId: 'd1', categoryId: 'c1' })
      );
    });

    it('should count questions across multiple domains and categories', async () => {
      const parsedRows = [
        { domain_id: 'd1', domain_title: 'D1', domain_weight: '0.5', category_id: 'c1', category_title: 'C1', question_id: 'q1', question_text: 'Q1', requires_evidence: 'false' },
        { domain_id: 'd2', domain_title: 'D2', domain_weight: '0.5', category_id: 'c2', category_title: 'C2', question_id: 'q2', question_text: 'Q2', requires_evidence: 'false' },
        { domain_id: 'd2', domain_title: 'D2', domain_weight: '0.5', category_id: 'c3', category_title: 'C3', question_id: 'q3', question_text: 'Q3', requires_evidence: 'false' },
      ];
      csvMocks.parseCsv.mockReturnValue(parsedRows);

      csvMocks.rowsToQuestions.mockReturnValue({
        d1: { title: 'D1', categories: { c1: { title: 'C1', questions: [{ id: 'q1', text: 'Q1' }] } } },
        d2: { title: 'D2', categories: {
          c2: { title: 'C2', questions: [{ id: 'q2', text: 'Q2' }] },
          c3: { title: 'C3', questions: [{ id: 'q3', text: 'Q3' }] },
        } },
      });

      render(<CSVImportExport />);
      uploadFile('questions', makeCsvFile('header\nrow'));

      await waitFor(() => {
        expect(screen.getByTestId('csv-status-questions')).toHaveTextContent(
          'Imported 3 questions across 2 domains.'
        );
      });

      expect(datastoreMocks.addQuestion).toHaveBeenCalledTimes(3);
    });
  });

  // ─── Import: Users ────────────────────────────────────────────────────────

  describe('Import users', () => {
    it('should import users and show success status', async () => {
      const parsedRows = [
        { id: 'u1', name: 'Alice', email: 'a@b.com', role: 'user', title: 'Eng', assigned_question_ids: 'q1|q2' },
        { id: 'u2', name: 'Bob', email: 'b@b.com', role: 'admin', title: 'Mgr', assigned_question_ids: '' },
      ];
      csvMocks.parseCsv.mockReturnValue(parsedRows);

      const convertedUsers = [
        { id: 'u1', name: 'Alice', email: 'a@b.com', role: 'user', title: 'Eng', assignedQuestions: ['q1', 'q2'] },
        { id: 'u2', name: 'Bob', email: 'b@b.com', role: 'admin', title: 'Mgr', assignedQuestions: [] },
      ];
      csvMocks.rowsToUsers.mockReturnValue(convertedUsers);

      render(<CSVImportExport />);
      uploadFile('users', makeCsvFile('id,name\nu1,Alice\nu2,Bob'));

      await waitFor(() => {
        const status = screen.getByTestId('csv-status-users');
        expect(status).toHaveTextContent('Imported 2 users.');
        expect(status).toHaveClass('csv-status--success');
      });

      expect(datastoreMocks.addUser).toHaveBeenCalledTimes(2);
      expect(datastoreMocks.addUser).toHaveBeenCalledWith(convertedUsers[0]);
      expect(datastoreMocks.addUser).toHaveBeenCalledWith(convertedUsers[1]);
    });
  });

  // ─── Import: Domains ──────────────────────────────────────────────────────

  describe('Import domains', () => {
    it('should import domains and show success status', async () => {
      const parsedRows = [
        { id: 'd1', title: 'D1', weight: '0.4' },
        { id: 'd2', title: 'D2', weight: '0.6' },
      ];
      csvMocks.parseCsv.mockReturnValue(parsedRows);

      const domainsObj = {
        d1: { title: 'D1', weight: 0.4, categories: {} },
        d2: { title: 'D2', weight: 0.6, categories: {} },
      };
      csvMocks.rowsToDomains.mockReturnValue(domainsObj);

      render(<CSVImportExport />);
      uploadFile('domains', makeCsvFile('id,title,weight\nd1,D1,0.4\nd2,D2,0.6'));

      await waitFor(() => {
        const status = screen.getByTestId('csv-status-domains');
        expect(status).toHaveTextContent('Imported 2 domains.');
        expect(status).toHaveClass('csv-status--success');
      });

      expect(datastoreMocks.addDomain).toHaveBeenCalledTimes(2);
      expect(datastoreMocks.addDomain).toHaveBeenCalledWith({ id: 'd1', title: 'D1', weight: 0.4, categories: {} });
      expect(datastoreMocks.addDomain).toHaveBeenCalledWith({ id: 'd2', title: 'D2', weight: 0.6, categories: {} });
    });
  });

  // ─── Import: Frameworks ───────────────────────────────────────────────────

  describe('Import frameworks', () => {
    it('should import frameworks and show success status', async () => {
      const parsedRows = [
        { id: 'fw1', name: 'FW1', enabled: 'true', category: 'sec', threshold: '3.5', color: '#fff', icon: '🔒', description: 'Desc', mapped_question_ids: 'q1' },
      ];
      csvMocks.parseCsv.mockReturnValue(parsedRows);

      const convertedFrameworks = [
        { id: 'fw1', name: 'FW1', enabled: true, category: '', threshold: undefined, color: '', icon: '', description: '', mappedQuestions: [] },
      ];
      csvMocks.rowsToFrameworks.mockReturnValue(convertedFrameworks);

      render(<CSVImportExport />);
      uploadFile('frameworks', makeCsvFile('id,name,enabled\nfw1,FW1,true'));

      await waitFor(() => {
        const status = screen.getByTestId('csv-status-frameworks');
        expect(status).toHaveTextContent('Imported 1 frameworks.');
        expect(status).toHaveClass('csv-status--success');
      });

      expect(datastoreMocks.addFramework).toHaveBeenCalledTimes(1);
      expect(datastoreMocks.addFramework).toHaveBeenCalledWith(convertedFrameworks[0]);
    });
  });

  // ─── Import: Validation errors ────────────────────────────────────────────

  describe('Import validation errors', () => {
    it('should show error when CSV has no data rows', async () => {
      csvMocks.parseCsv.mockReturnValue([]);

      render(<CSVImportExport />);
      uploadFile('questions', makeCsvFile('domain_id,question_id'));

      await waitFor(() => {
        const status = screen.getByTestId('csv-status-questions');
        expect(status).toHaveTextContent('CSV has no data rows.');
        expect(status).toHaveClass('csv-status--error');
      });
    });

    it('should show error when CSV is missing required columns', async () => {
      // Return rows that are missing most required question columns
      csvMocks.parseCsv.mockReturnValue([
        { domain_id: 'd1', question_id: 'q1' }
      ]);

      render(<CSVImportExport />);
      uploadFile('questions', makeCsvFile('domain_id,question_id\nd1,q1'));

      await waitFor(() => {
        const status = screen.getByTestId('csv-status-questions');
        expect(status).toHaveTextContent('Missing columns:');
        expect(status).toHaveClass('csv-status--error');
      });
    });

    it('should show error for missing user columns', async () => {
      csvMocks.parseCsv.mockReturnValue([{ id: 'u1' }]);

      render(<CSVImportExport />);
      uploadFile('users', makeCsvFile('id\nu1'));

      await waitFor(() => {
        const status = screen.getByTestId('csv-status-users');
        expect(status).toHaveTextContent('Missing columns:');
        expect(status).toHaveClass('csv-status--error');
      });
    });

    it('should show error for missing domain columns', async () => {
      csvMocks.parseCsv.mockReturnValue([{ id: 'd1' }]);

      render(<CSVImportExport />);
      uploadFile('domains', makeCsvFile('id\nd1'));

      await waitFor(() => {
        const status = screen.getByTestId('csv-status-domains');
        expect(status).toHaveTextContent('Missing columns:');
        expect(status).toHaveClass('csv-status--error');
      });
    });

    it('should show error for missing framework columns', async () => {
      csvMocks.parseCsv.mockReturnValue([{ id: 'fw1' }]);

      render(<CSVImportExport />);
      uploadFile('frameworks', makeCsvFile('id\nfw1'));

      await waitFor(() => {
        const status = screen.getByTestId('csv-status-frameworks');
        expect(status).toHaveTextContent('Missing columns:');
        expect(status).toHaveClass('csv-status--error');
      });
    });

    it('should validate all required columns for questions', async () => {
      // Only provide a subset of columns
      csvMocks.parseCsv.mockReturnValue([{ domain_id: 'd1', question_id: 'q1' }]);

      render(<CSVImportExport />);
      uploadFile('questions', makeCsvFile('domain_id,question_id\nd1,q1'));

      await waitFor(() => {
        const status = screen.getByTestId('csv-status-questions');
        // Should report domain_title, domain_weight, category_id, etc.
        expect(status).toHaveTextContent('domain_title');
        expect(status).toHaveTextContent('domain_weight');
        expect(status).toHaveTextContent('category_id');
      });
    });
  });

  // ─── Import: File read failure ────────────────────────────────────────────

  describe('Import file read failure', () => {
    it('should show error when file cannot be read', async () => {
      // Override FileReader so readAsText triggers onerror
      const OriginalFileReader = window.FileReader;
      window.FileReader = class {
        readAsText() {
          // Trigger onerror asynchronously like real FileReader
          setTimeout(() => this.onerror?.(), 0);
        }
      };

      render(<CSVImportExport />);
      uploadFile('questions', makeCsvFile('data'));

      await waitFor(() => {
        const status = screen.getByTestId('csv-status-questions');
        expect(status).toHaveTextContent('Could not read file.');
        expect(status).toHaveClass('csv-status--error');
      });

      window.FileReader = OriginalFileReader;
    });
  });

  // ─── Import: Converter exception ──────────────────────────────────────────

  describe('Import converter exception', () => {
    it('should show error when rowsToQuestions throws', async () => {
      // parseCsv returns rows with all required columns to pass validation
      csvMocks.parseCsv.mockReturnValue([
        { domain_id: 'd1', domain_title: 'D1', domain_weight: '0.3', category_id: 'c1', category_title: 'C1', question_id: 'q1', question_text: 'Q?', requires_evidence: 'false' }
      ]);
      csvMocks.rowsToQuestions.mockImplementation(() => {
        throw new Error('Parse error in questions');
      });

      render(<CSVImportExport />);
      uploadFile('questions', makeCsvFile('csv data'));

      await waitFor(() => {
        const status = screen.getByTestId('csv-status-questions');
        expect(status).toHaveTextContent('Import failed: Parse error in questions');
        expect(status).toHaveClass('csv-status--error');
      });
    });

    it('should show error when rowsToUsers throws', async () => {
      csvMocks.parseCsv.mockReturnValue([
        { id: 'u1', name: 'A', email: 'a@b', role: 'user', title: 'E', assigned_question_ids: '' }
      ]);
      csvMocks.rowsToUsers.mockImplementation(() => {
        throw new Error('User parse error');
      });

      render(<CSVImportExport />);
      uploadFile('users', makeCsvFile('csv'));

      await waitFor(() => {
        const status = screen.getByTestId('csv-status-users');
        expect(status).toHaveTextContent('Import failed: User parse error');
        expect(status).toHaveClass('csv-status--error');
      });
    });

    it('should show error when rowsToDomains throws', async () => {
      csvMocks.parseCsv.mockReturnValue([
        { id: 'd1', title: 'D', weight: '0.3' }
      ]);
      csvMocks.rowsToDomains.mockImplementation(() => {
        throw new Error('Domain parse error');
      });

      render(<CSVImportExport />);
      uploadFile('domains', makeCsvFile('csv'));

      await waitFor(() => {
        const status = screen.getByTestId('csv-status-domains');
        expect(status).toHaveTextContent('Import failed: Domain parse error');
        expect(status).toHaveClass('csv-status--error');
      });
    });

    it('should show error when rowsToFrameworks throws', async () => {
      csvMocks.parseCsv.mockReturnValue([
        { id: 'f1', name: 'F', enabled: 'true', category: '', threshold: '', color: '', icon: '', description: '', mapped_question_ids: '' }
      ]);
      csvMocks.rowsToFrameworks.mockImplementation(() => {
        throw new Error('Framework parse error');
      });

      render(<CSVImportExport />);
      uploadFile('frameworks', makeCsvFile('csv'));

      await waitFor(() => {
        const status = screen.getByTestId('csv-status-frameworks');
        expect(status).toHaveTextContent('Import failed: Framework parse error');
        expect(status).toHaveClass('csv-status--error');
      });
    });

    it('should show error when addQuestion throws', async () => {
      csvMocks.parseCsv.mockReturnValue([
        { domain_id: 'd1', domain_title: 'D1', domain_weight: '0.3', category_id: 'c1', category_title: 'C1', question_id: 'q1', question_text: 'Q?', requires_evidence: 'false' }
      ]);
      csvMocks.rowsToQuestions.mockReturnValue({
        d1: { title: 'D1', categories: { c1: { title: 'C1', questions: [{ id: 'q1', text: 'Q?' }] } } }
      });
      datastoreMocks.addQuestion.mockImplementation(() => {
        throw new Error('Storage full');
      });

      render(<CSVImportExport />);
      uploadFile('questions', makeCsvFile('csv'));

      await waitFor(() => {
        const status = screen.getByTestId('csv-status-questions');
        expect(status).toHaveTextContent('Import failed: Storage full');
        expect(status).toHaveClass('csv-status--error');
      });
    });
  });

  // ─── Status display ───────────────────────────────────────────────────────

  describe('Status display', () => {
    it('should show reading status initially when importing', async () => {
      csvMocks.parseCsv.mockReturnValue([]);

      render(<CSVImportExport />);
      uploadFile('questions', makeCsvFile('data'));

      // After the file is read, parseCsv returns empty rows → "no data rows" error
      await waitFor(() => {
        expect(screen.getByTestId('csv-status-questions')).toBeInTheDocument();
      });
    });

    it('should show status with role="status" attribute', async () => {
      csvMocks.parseCsv.mockReturnValue([]);

      render(<CSVImportExport />);
      uploadFile('questions', makeCsvFile('data'));

      await waitFor(() => {
        const status = screen.getByTestId('csv-status-questions');
        expect(status).toHaveAttribute('role', 'status');
      });
    });

    it('should support multiple entity statuses simultaneously', async () => {
      csvMocks.parseCsv.mockReturnValue([]);

      render(<CSVImportExport />);
      uploadFile('questions', makeCsvFile('data'));
      uploadFile('users', makeCsvFile('data'));

      await waitFor(() => {
        expect(screen.getByTestId('csv-status-questions')).toBeInTheDocument();
        expect(screen.getByTestId('csv-status-users')).toBeInTheDocument();
      });
    });
  });

  // ─── File input reset ─────────────────────────────────────────────────────

  describe('File input reset', () => {
    it('should clear the file input value after import completes', async () => {
      csvMocks.parseCsv.mockReturnValue([]);

      render(<CSVImportExport />);
      const input = screen.getByTestId('csv-import-questions');

      // Upload a file
      uploadFile('questions', makeCsvFile('data'));

      await waitFor(() => {
        expect(screen.getByTestId('csv-status-questions')).toBeInTheDocument();
      });

      // The value should be cleared so the same file can be re-imported
      expect(input.value).toBe('');
    });
  });

  // ─── No file selected ────────────────────────────────────────────────────

  describe('No file selected', () => {
    it('should not call handleImport when no file is selected', () => {
      render(<CSVImportExport />);
      const input = screen.getByTestId('csv-import-questions');

      // Fire change with empty files array
      fireEvent.change(input, { target: { files: [] } });

      // No status should appear — handleImport was not called
      expect(screen.queryByTestId('csv-status-questions')).not.toBeInTheDocument();
    });
  });

  // ─── Export button titles ─────────────────────────────────────────────────

  describe('Button titles', () => {
    it.each([
      ['questions', 'Questions'],
      ['users', 'Users'],
      ['domains', 'Domains'],
      ['frameworks', 'Frameworks'],
    ])('should have correct title attributes for %s buttons', (key, label) => {
      render(<CSVImportExport />);
      expect(screen.getByTestId(`csv-export-${key}`)).toHaveAttribute('title', `Download current ${label} as CSV`);
      expect(screen.getByTestId(`csv-template-${key}`)).toHaveAttribute('title', `Download example ${label} template`);
      expect(screen.getByTestId(`csv-import-label-${key}`)).toHaveAttribute('title', `Import ${label} from CSV`);
    });
  });

  // ─── Import success resets previous error ─────────────────────────────────

  describe('Status overwrite', () => {
    it('should replace error status with success on subsequent import', async () => {
      // First import: validation error (empty CSV)
      csvMocks.parseCsv.mockReturnValue([]);

      render(<CSVImportExport />);
      uploadFile('users', makeCsvFile('data'));

      await waitFor(() => {
        expect(screen.getByTestId('csv-status-users')).toHaveClass('csv-status--error');
      });

      // Second import: success
      csvMocks.parseCsv.mockReturnValue([
        { id: 'u1', name: 'A', email: 'a@b', role: 'user', title: 'E', assigned_question_ids: '' }
      ]);
      csvMocks.rowsToUsers.mockReturnValue([{ id: 'u1', name: 'A' }]);

      uploadFile('users', makeCsvFile('id,name\nu1,A'));

      await waitFor(() => {
        const status = screen.getByTestId('csv-status-users');
        expect(status).toHaveTextContent('Imported 1 users.');
        expect(status).toHaveClass('csv-status--success');
      });
    });
  });
});
