import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('should render progress information', () => {
    render(<ProgressBar answered={5} total={10} percentage={50} />);
    expect(screen.getByText('5/10 Questions')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should set correct width for progress bar', () => {
    render(<ProgressBar answered={7} total={10} percentage={70} />);
    const progressFill = screen.getByTestId('progress-fill');
    expect(progressFill).toHaveStyle({ width: '70%' });
  });

  it('should handle 0% progress', () => {
    render(<ProgressBar answered={0} total={10} percentage={0} />);
    const progressFill = screen.getByTestId('progress-fill');
    expect(progressFill).toHaveStyle({ width: '0%' });
  });

  it('should handle 100% progress', () => {
    render(<ProgressBar answered={10} total={10} percentage={100} />);
    const progressFill = screen.getByTestId('progress-fill');
    expect(progressFill).toHaveStyle({ width: '100%' });
  });

  it('should show evidence count when provided and answered > 0', () => {
    render(<ProgressBar answered={8} total={10} percentage={80} withEvidence={5} />);
    expect(screen.getByTestId('evidence-count')).toBeInTheDocument();
    expect(screen.getByText('5/8 with evidence')).toBeInTheDocument();
  });

  it('should not show evidence count when withEvidence is not provided', () => {
    render(<ProgressBar answered={5} total={10} percentage={50} />);
    expect(screen.queryByTestId('evidence-count')).not.toBeInTheDocument();
  });

  it('should not show evidence count when answered is 0', () => {
    render(<ProgressBar answered={0} total={10} percentage={0} withEvidence={0} />);
    expect(screen.queryByTestId('evidence-count')).not.toBeInTheDocument();
  });
});