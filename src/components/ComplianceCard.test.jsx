import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComplianceCard } from './ComplianceCard';

describe('ComplianceCard', () => {
  const mockFramework = {
    id: 'sox',
    name: 'SOX Compliance',
    icon: '✓',
    category: 'Financial',
    description: 'Financial controls and IT governance',
    threshold: 4.0,
    requirements: [
      'Access controls',
      'Change management',
      'Data integrity'
    ]
  };

  it('should render framework name and icon', () => {
    render(<ComplianceCard framework={mockFramework} score={85} answers={{}} />);
    expect(screen.getByText('SOX Compliance')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should render category', () => {
    render(<ComplianceCard framework={mockFramework} score={85} answers={{}} />);
    expect(screen.getByText('Financial')).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<ComplianceCard framework={mockFramework} score={85} answers={{}} />);
    expect(screen.getByText('Financial controls and IT governance')).toBeInTheDocument();
  });

  it('should render score', () => {
    render(<ComplianceCard framework={mockFramework} score={85.5} answers={{}} />);
    expect(screen.getByText('85.5%')).toBeInTheDocument();
  });

  it('should render status', () => {
    render(<ComplianceCard framework={mockFramework} score={85} answers={{}} />);
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  it('should render requirements', () => {
    render(<ComplianceCard framework={mockFramework} score={85} answers={{}} />);
    expect(screen.getByText('Access controls')).toBeInTheDocument();
    expect(screen.getByText('Change management')).toBeInTheDocument();
    expect(screen.getByText('Data integrity')).toBeInTheDocument();
  });

  it('should render threshold', () => {
    render(<ComplianceCard framework={mockFramework} score={85} answers={{}} />);
    expect(screen.getByText(/Threshold: 80%/)).toBeInTheDocument();
  });

  it('should handle framework without requirements', () => {
    const frameworkNoReqs = { ...mockFramework, requirements: undefined };
    render(<ComplianceCard framework={frameworkNoReqs} score={85} answers={{}} />);
    expect(screen.getByText('SOX Compliance')).toBeInTheDocument();
  });

  it('should show different status for different scores', () => {
    const { rerender } = render(
      <ComplianceCard framework={mockFramework} score={95} answers={{}} />
    );
    expect(screen.getByText('Excellent')).toBeInTheDocument();

    rerender(<ComplianceCard framework={mockFramework} score={50} answers={{}} />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });
});