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
});