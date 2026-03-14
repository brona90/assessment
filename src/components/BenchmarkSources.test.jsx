import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BenchmarkSources } from './BenchmarkSources';

describe('BenchmarkSources', () => {
  const mockSources = [
    {
      id: 's1',
      publisher: 'FinOps Foundation',
      report: 'State of FinOps',
      year: 2024,
      url: 'https://example.com/finops',
      description: 'Annual FinOps survey'
    },
    {
      id: 's2',
      publisher: 'McKinsey',
      report: 'Digital Survey',
      year: 2023,
      url: 'https://example.com/mckinsey',
      description: 'Digital transformation report'
    }
  ];

  it('should return null when sources is undefined', () => {
    const { container } = render(<BenchmarkSources />);
    expect(container.innerHTML).toBe('');
  });

  it('should return null when sources is null', () => {
    const { container } = render(<BenchmarkSources sources={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('should return null when sources is an empty array', () => {
    const { container } = render(<BenchmarkSources sources={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('should render sources when provided', () => {
    render(<BenchmarkSources sources={mockSources} />);
    expect(screen.getByTestId('benchmark-sources')).toBeInTheDocument();
    expect(screen.getByTestId('benchmark-sources-toggle')).toBeInTheDocument();
  });

  it('should render a chip for each source', () => {
    render(<BenchmarkSources sources={mockSources} />);
    expect(screen.getByText('FinOps Foundation')).toBeInTheDocument();
    expect(screen.getByText('McKinsey')).toBeInTheDocument();
    expect(screen.getByText('State of FinOps')).toBeInTheDocument();
    expect(screen.getByText('Digital Survey')).toBeInTheDocument();
  });

  it('should render source links with correct href and target', () => {
    render(<BenchmarkSources sources={mockSources} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', 'https://example.com/finops');
    expect(links[0]).toHaveAttribute('target', '_blank');
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render the year for each source', () => {
    render(<BenchmarkSources sources={mockSources} />);
    expect(screen.getByText('(2024)')).toBeInTheDocument();
    expect(screen.getByText('(2023)')).toBeInTheDocument();
  });

  it('should toggle chips visibility on button click', () => {
    render(<BenchmarkSources sources={mockSources} />);
    const toggle = screen.getByTestId('benchmark-sources-toggle');
    const chips = screen.getByTestId('benchmark-sources').querySelector('.benchmark-sources-chips');

    expect(chips.classList.contains('bsc-open')).toBe(false);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);
    expect(chips.classList.contains('bsc-open')).toBe(true);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(toggle);
    expect(chips.classList.contains('bsc-open')).toBe(false);
  });

  it('should show source count in toggle button', () => {
    render(<BenchmarkSources sources={mockSources} />);
    expect(screen.getByTestId('benchmark-sources-toggle').textContent).toContain('(2)');
  });
});
