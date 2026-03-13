import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CompareExports } from './CompareExports';

const makeExport = (userName, answers) => ({
  exportVersion: '1.0',
  exportDate: '2024-01-01T00:00:00.000Z',
  user: { id: 'u1', name: userName },
  questions: [
    { id: 'q1', text: 'Q1', domainId: 'domain1', domainTitle: 'Test Domain', categoryId: 'c1', answer: answers.q1 ?? null },
    { id: 'q2', text: 'Q2', domainId: 'domain1', domainTitle: 'Test Domain', categoryId: 'c1', answer: answers.q2 ?? null },
    { id: 'q3', text: 'Q3', domainId: 'domain2', domainTitle: 'Other Domain', categoryId: 'c2', answer: answers.q3 ?? null }
  ]
});

function mockFile(json) {
  const content = JSON.stringify(json);
  const file = new File([content], 'export.json', { type: 'application/json' });
  // jsdom may not implement Blob.text() — provide it explicitly
  file.text = () => Promise.resolve(content);
  return file;
}

describe('CompareExports', () => {
  it('should render the compare section', () => {
    render(<CompareExports />);
    expect(screen.getByTestId('compare-exports')).toBeInTheDocument();
  });

  it('should render both file inputs', () => {
    render(<CompareExports />);
    expect(screen.getByTestId('compare-file-a')).toBeInTheDocument();
    expect(screen.getByTestId('compare-file-b')).toBeInTheDocument();
  });

  it('should not show results when no files loaded', () => {
    render(<CompareExports />);
    expect(screen.queryByTestId('compare-results')).not.toBeInTheDocument();
  });

  it('should show hint when only one file is loaded', async () => {
    render(<CompareExports />);
    const fileA = mockFile(makeExport('Alice', { q1: 3, q2: 4 }));
    fireEvent.change(screen.getByTestId('compare-file-a'), {
      target: { files: [fileA] }
    });
    await waitFor(() => {
      expect(screen.getByTestId('compare-hint')).toBeInTheDocument();
    });
  });

  it('should show comparison table when both files are loaded', async () => {
    render(<CompareExports />);
    const fileA = mockFile(makeExport('Alice', { q1: 3, q2: 4, q3: 3 }));
    const fileB = mockFile(makeExport('Alice', { q1: 4, q2: 5, q3: 4 }));

    fireEvent.change(screen.getByTestId('compare-file-a'), {
      target: { files: [fileA] }
    });
    fireEvent.change(screen.getByTestId('compare-file-b'), {
      target: { files: [fileB] }
    });

    await waitFor(() => {
      expect(screen.getByTestId('compare-results')).toBeInTheDocument();
      expect(screen.getByTestId('compare-table')).toBeInTheDocument();
    });
  });

  it('should show a row for each domain plus overall', async () => {
    render(<CompareExports />);
    const fileA = mockFile(makeExport('Alice', { q1: 3, q2: 3, q3: 3 }));
    const fileB = mockFile(makeExport('Alice', { q1: 4, q2: 4, q3: 4 }));

    fireEvent.change(screen.getByTestId('compare-file-a'), { target: { files: [fileA] } });
    fireEvent.change(screen.getByTestId('compare-file-b'), { target: { files: [fileB] } });

    await waitFor(() => {
      expect(screen.getByTestId('compare-row-domain1')).toBeInTheDocument();
      expect(screen.getByTestId('compare-row-domain2')).toBeInTheDocument();
      expect(screen.getByTestId('compare-overall-row')).toBeInTheDocument();
    });
  });

  it('should show positive delta when scores improved', async () => {
    render(<CompareExports />);
    const fileA = mockFile(makeExport('Alice', { q1: 2, q2: 2 }));
    const fileB = mockFile(makeExport('Alice', { q1: 4, q2: 4 }));

    fireEvent.change(screen.getByTestId('compare-file-a'), { target: { files: [fileA] } });
    fireEvent.change(screen.getByTestId('compare-file-b'), { target: { files: [fileB] } });

    await waitFor(() => {
      const overallRow = screen.getByTestId('compare-overall-row');
      const deltaCell = overallRow.querySelector('[data-testid="delta-cell"]');
      expect(deltaCell.textContent).toContain('+');
    });
  });

  it('should show error for invalid JSON file', async () => {
    render(<CompareExports />);
    const blob = new Blob(['not json!'], { type: 'application/json' });
    const badFile = new File([blob], 'bad.json', { type: 'application/json' });

    fireEvent.change(screen.getByTestId('compare-file-a'), { target: { files: [badFile] } });

    await waitFor(() => {
      expect(screen.getByTestId('compare-error')).toBeInTheDocument();
    });
  });

  it('should show error for JSON without questions', async () => {
    render(<CompareExports />);
    const badExport = { user: { name: 'X' } }; // no questions
    const file = mockFile(badExport);

    fireEvent.change(screen.getByTestId('compare-file-a'), { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByTestId('compare-error')).toBeInTheDocument();
    });
  });

  it('should handle domain present only in "after" export (missing from before)', async () => {
    render(<CompareExports />);
    // exportA has only domain1, exportB has domain1 + domain2
    const fileA = mockFile(makeExport('Alice', { q1: 3, q2: 3 })); // q3 unanswered => no domain2 score
    const exportBData = {
      exportVersion: '1.0',
      exportDate: '2024-06-01T00:00:00.000Z',
      user: { id: 'u1', name: 'Alice' },
      questions: [
        { id: 'q1', text: 'Q1', domainId: 'domain1', domainTitle: 'Test Domain', categoryId: 'c1', answer: 4 },
        { id: 'q2', text: 'Q2', domainId: 'domain1', domainTitle: 'Test Domain', categoryId: 'c1', answer: 4 },
        { id: 'q3', text: 'Q3', domainId: 'domain2', domainTitle: 'Other Domain', categoryId: 'c2', answer: 5 },
        { id: 'q4', text: 'Q4', domainId: 'domain3', domainTitle: 'New Domain', categoryId: 'c3', answer: 4 }
      ]
    };
    const fileB = mockFile(exportBData);

    fireEvent.change(screen.getByTestId('compare-file-a'), { target: { files: [fileA] } });
    fireEvent.change(screen.getByTestId('compare-file-b'), { target: { files: [fileB] } });

    await waitFor(() => {
      expect(screen.getByTestId('compare-results')).toBeInTheDocument();
      // domain3 only exists in B, so scoreA defaults to 0
      expect(screen.getByTestId('compare-row-domain3')).toBeInTheDocument();
    });
  });

  it('should display "Loaded" when export has no user name', async () => {
    render(<CompareExports />);
    const exportNoName = {
      exportVersion: '1.0',
      exportDate: '2024-01-01T00:00:00.000Z',
      user: { id: 'u1' }, // no name property
      questions: [
        { id: 'q1', text: 'Q1', domainId: 'domain1', domainTitle: 'Test Domain', categoryId: 'c1', answer: 3 }
      ]
    };
    const file = mockFile(exportNoName);

    fireEvent.change(screen.getByTestId('compare-file-a'), { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByTestId('compare-hint')).toBeInTheDocument();
    });
  });

  it('should handle export without exportDate', async () => {
    render(<CompareExports />);
    const exportNoDate = {
      exportVersion: '1.0',
      user: { id: 'u1', name: 'Alice' },
      questions: [
        { id: 'q1', text: 'Q1', domainId: 'domain1', domainTitle: 'Test Domain', categoryId: 'c1', answer: 3 }
      ]
    };
    const fileA = mockFile(exportNoDate);
    const fileB = mockFile(makeExport('Alice', { q1: 4 }));

    fireEvent.change(screen.getByTestId('compare-file-a'), { target: { files: [fileA] } });
    fireEvent.change(screen.getByTestId('compare-file-b'), { target: { files: [fileB] } });

    await waitFor(() => {
      expect(screen.getByTestId('compare-results')).toBeInTheDocument();
    });
  });

  it('should show negative delta when scores regressed', async () => {
    render(<CompareExports />);
    const fileA = mockFile(makeExport('Alice', { q1: 5, q2: 5 }));
    const fileB = mockFile(makeExport('Alice', { q1: 2, q2: 2 }));

    fireEvent.change(screen.getByTestId('compare-file-a'), { target: { files: [fileA] } });
    fireEvent.change(screen.getByTestId('compare-file-b'), { target: { files: [fileB] } });

    await waitFor(() => {
      const deltaCells = screen.getAllByTestId('delta-cell');
      const negativeCell = deltaCells.find(cell => cell.classList.contains('delta-negative'));
      expect(negativeCell).not.toBeNull();
      expect(negativeCell.textContent).toMatch(/-/);
    });
  });

  it('should show neutral delta when scores are unchanged', async () => {
    render(<CompareExports />);
    const fileA = mockFile(makeExport('Alice', { q1: 3, q2: 3, q3: 3 }));
    const fileB = mockFile(makeExport('Alice', { q1: 3, q2: 3, q3: 3 }));

    fireEvent.change(screen.getByTestId('compare-file-a'), { target: { files: [fileA] } });
    fireEvent.change(screen.getByTestId('compare-file-b'), { target: { files: [fileB] } });

    await waitFor(() => {
      const deltaCells = screen.getAllByTestId('delta-cell');
      const neutralCell = deltaCells.find(cell => cell.classList.contains('delta-neutral'));
      expect(neutralCell).not.toBeNull();
      expect(neutralCell.textContent).toMatch(/0\.00/);
    });
  });

  it('should handle file input with no files selected', async () => {
    render(<CompareExports />);
    // Simulate change with no files
    fireEvent.change(screen.getByTestId('compare-file-a'), { target: { files: [] } });
    // No error, no changes
    expect(screen.queryByTestId('compare-error')).not.toBeInTheDocument();
    expect(screen.queryByTestId('compare-results')).not.toBeInTheDocument();
  });

  it('should use domainTitle from either export', async () => {
    render(<CompareExports />);
    const fileA = mockFile(makeExport('Alice', { q1: 3, q2: 3, q3: 3 }));
    const fileB = mockFile(makeExport('Alice', { q1: 4, q2: 4, q3: 4 }));

    fireEvent.change(screen.getByTestId('compare-file-a'), { target: { files: [fileA] } });
    fireEvent.change(screen.getByTestId('compare-file-b'), { target: { files: [fileB] } });

    await waitFor(() => {
      expect(screen.getByText('Test Domain')).toBeInTheDocument();
      expect(screen.getByText('Other Domain')).toBeInTheDocument();
    });
  });
});
