import { describe, it, expect, vi } from 'vitest';
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
});
