import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DomainHeatmap } from './DomainHeatmap';
import { getCellStyle } from './DomainHeatmap';

// The global ResizeObserver mock from setup.js uses an arrow-function factory,
// which cannot be invoked with `new`.  Replace it with a class-based mock so the
// component's `useEffect` can construct one without throwing.
beforeEach(() => {
  global.ResizeObserver = vi.fn().mockImplementation(function () {
    this.observe = vi.fn();
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();
  });
});

const makeDomains = () => ({
  domain1: {
    title: 'Data Governance',
    categories: {
      cat1: {
        title: 'Policy Management',
        questions: [
          { id: 'q1', text: 'Question 1' },
          { id: 'q2', text: 'Question 2' },
        ],
      },
      cat2: {
        title: 'Data Quality',
        questions: [
          { id: 'q3', text: 'Question 3' },
        ],
      },
    },
  },
  domain2: {
    title: 'Data Architecture',
    categories: {
      cat3: {
        title: 'Modeling',
        questions: [
          { id: 'q4', text: 'Question 4' },
        ],
      },
    },
  },
});

describe('getCellStyle', () => {
  it('returns red for score < 1.5', () => {
    const style = getCellStyle(1.0);
    expect(style.bg).toBe('rgb(153, 27, 27)');
    expect(style.text).toBe('#fca5a5');
  });

  it('returns red at boundary score 0', () => {
    const style = getCellStyle(0);
    expect(style.bg).toBe('rgb(153, 27, 27)');
  });

  it('returns orange for score >= 1.5 and < 2.5', () => {
    const style = getCellStyle(1.5);
    expect(style.bg).toBe('rgb(146, 64, 14)');
    expect(style.text).toBe('#fed7aa');
  });

  it('returns orange for score 2.4', () => {
    const style = getCellStyle(2.4);
    expect(style.bg).toBe('rgb(146, 64, 14)');
  });

  it('returns amber for score >= 2.5 and < 3.0', () => {
    const style = getCellStyle(2.5);
    expect(style.bg).toBe('rgb(113, 63, 18)');
    expect(style.text).toBe('#fde68a');
  });

  it('returns amber for score 2.9', () => {
    const style = getCellStyle(2.9);
    expect(style.bg).toBe('rgb(113, 63, 18)');
  });

  it('returns green for score >= 3.0 and < 3.5', () => {
    const style = getCellStyle(3.0);
    expect(style.bg).toBe('rgb(20,  83,  45)');
    expect(style.text).toBe('#86efac');
  });

  it('returns teal for score >= 3.5 and < 4.5', () => {
    const style = getCellStyle(3.5);
    expect(style.bg).toBe('rgb(6,   78,  59)');
    expect(style.text).toBe('#6ee7b7');
  });

  it('returns teal for score 4.4', () => {
    const style = getCellStyle(4.4);
    expect(style.bg).toBe('rgb(6,   78,  59)');
  });

  it('returns deep green for score >= 4.5', () => {
    const style = getCellStyle(4.5);
    expect(style.bg).toBe('rgb(5,   46,  22)');
    expect(style.text).toBe('#86efac');
  });

  it('returns deep green for score 5', () => {
    const style = getCellStyle(5);
    expect(style.bg).toBe('rgb(5,   46,  22)');
  });
});

describe('DomainHeatmap', () => {
  it('renders "No domain data available" when domains is empty object', () => {
    render(<DomainHeatmap domains={{}} answers={{}} />);
    expect(screen.getByText(/No domain data available/i)).toBeInTheDocument();
    expect(screen.getByTestId('heatmap-empty')).toBeInTheDocument();
  });

  it('renders "No domain data available" when domains is null', () => {
    // Suppress PropTypes console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<DomainHeatmap domains={null} answers={{}} />);
    expect(screen.getByText(/No domain data available/i)).toBeInTheDocument();
    expect(screen.getByTestId('heatmap-empty')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('renders heatmap-container with data-testid="domain-heatmap" when valid domains provided', () => {
    render(<DomainHeatmap domains={makeDomains()} answers={{ q1: 3 }} />);
    expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
    expect(screen.getByTestId('domain-heatmap')).toHaveClass('heatmap-container');
  });

  it('canvas has role="img" and aria-label', () => {
    render(<DomainHeatmap domains={makeDomains()} answers={{ q1: 3 }} />);
    const canvas = screen.getByRole('img');
    expect(canvas.tagName).toBe('CANVAS');
    expect(canvas).toHaveAttribute('aria-label', expect.stringContaining('heatmap'));
  });

  it('renders heatmap-header with title and description', () => {
    render(<DomainHeatmap domains={makeDomains()} answers={{ q1: 3 }} />);
    expect(screen.getByText('Assessment Heatmap')).toBeInTheDocument();
    expect(screen.getByText(/Average maturity score per domain/)).toBeInTheDocument();
  });

  it('renders legend section', () => {
    render(<DomainHeatmap domains={makeDomains()} answers={{ q1: 3 }} />);
    expect(screen.getByText('Score:')).toBeInTheDocument();
    expect(screen.getByText('1 Low')).toBeInTheDocument();
    expect(screen.getByText('5 High')).toBeInTheDocument();
  });

  it('calls onCanvasReady with canvas element when provided', () => {
    const onCanvasReady = vi.fn();
    render(<DomainHeatmap domains={makeDomains()} answers={{ q1: 3 }} onCanvasReady={onCanvasReady} />);
    expect(onCanvasReady).toHaveBeenCalledTimes(1);
    expect(onCanvasReady).toHaveBeenCalledWith(expect.any(HTMLCanvasElement));
  });

  it('does not crash when answers is empty', () => {
    render(<DomainHeatmap domains={makeDomains()} answers={{}} />);
    expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
    // Canvas should still be rendered even though no data to draw
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
