import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComplianceCard } from './ComplianceCard';

const mockGetQuestions = vi.fn(() => [
  { id: 'd2_q5', text: 'How effectively do you maintain access controls?' },
  { id: 'd2_q6', text: 'How mature is your change management process?' },
  { id: 'd4_q9', text: 'How effectively do you manage identity and access?' }
]);

vi.mock('../hooks/useDataStore', () => ({
  useDataStore: () => ({ getQuestions: mockGetQuestions })
}));

describe('ComplianceCard', () => {
  const mockFramework = {
    id: 'sox',
    name: 'SOX Compliance',
    icon: 'SOX',
    category: 'Financial',
    description: 'Financial controls and IT governance',
    threshold: 4.0,
    mappedQuestions: ['d2_q5', 'd2_q6', 'd4_q9'],
    requirements: [
      'Access controls',
      'Change management',
      'Data integrity'
    ]
  };

  beforeEach(() => {
    mockGetQuestions.mockReturnValue([
      { id: 'd2_q5', text: 'How effectively do you maintain access controls?' },
      { id: 'd2_q6', text: 'How mature is your change management process?' },
      { id: 'd4_q9', text: 'How effectively do you manage identity and access?' }
    ]);
  });

  it('should render framework name and icon', () => {
    render(<ComplianceCard framework={mockFramework} score={85} answers={{}} />);
    expect(screen.getByText('SOX Compliance')).toBeInTheDocument();
    expect(screen.getByText('SOX')).toBeInTheDocument();
  });

  it('should render category', () => {
    render(<ComplianceCard framework={mockFramework} score={85} answers={{}} />);
    expect(screen.getByText('Financial')).toBeInTheDocument();
  });

  it('should render score', () => {
    render(<ComplianceCard framework={mockFramework} score={85.5} answers={{}} />);
    expect(screen.getByText('85.5%')).toBeInTheDocument();
  });

  it('should render status badge', () => {
    render(<ComplianceCard framework={mockFramework} score={85} answers={{}} />);
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  it('should show coverage count in bar label', () => {
    const answers = { 'd2_q5': 4, 'd2_q6': 3 };
    render(<ComplianceCard framework={mockFramework} score={70} answers={answers} />);
    expect(screen.getByText(/2\/3 answered/)).toBeInTheDocument();
  });

  it('should show threshold in bar label', () => {
    render(<ComplianceCard framework={mockFramework} score={85} answers={{}} />);
    expect(screen.getByText(/threshold 4\.0 \(score 80%\)/)).toBeInTheDocument();
  });

  it('should start collapsed (description not visible)', () => {
    render(<ComplianceCard framework={mockFramework} score={85} answers={{}} />);
    expect(screen.queryByText('Financial controls and IT governance')).not.toBeInTheDocument();
  });

  it('should expand when clicked', () => {
    render(<ComplianceCard framework={mockFramework} score={85} answers={{}} />);
    fireEvent.click(screen.getByTestId('compliance-sox'));
    expect(screen.getByText('Financial controls and IT governance')).toBeInTheDocument();
  });

  it('should collapse again when clicked twice', () => {
    render(<ComplianceCard framework={mockFramework} score={85} answers={{}} />);
    const card = screen.getByTestId('compliance-sox');
    fireEvent.click(card);
    fireEvent.click(card);
    expect(screen.queryByText('Financial controls and IT governance')).not.toBeInTheDocument();
  });

  it('should show question breakdown when expanded', () => {
    const answers = { 'd2_q5': 4 };
    render(<ComplianceCard framework={mockFramework} score={85} answers={answers} />);
    fireEvent.click(screen.getByTestId('compliance-sox'));
    expect(screen.getByTestId('cq-row-d2_q5')).toBeInTheDocument();
    expect(screen.getByTestId('cq-row-d2_q6')).toBeInTheDocument();
  });

  it('should show score for answered questions in breakdown', () => {
    const answers = { 'd2_q5': 4 };
    render(<ComplianceCard framework={mockFramework} score={85} answers={answers} />);
    fireEvent.click(screen.getByTestId('compliance-sox'));
    expect(screen.getByText('4/5')).toBeInTheDocument();
  });

  it('should show dash for unanswered questions', () => {
    render(<ComplianceCard framework={mockFramework} score={0} answers={{}} />);
    fireEvent.click(screen.getByTestId('compliance-sox'));
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBe(3); // all 3 questions unanswered
  });

  it('should show requirements when expanded', () => {
    render(<ComplianceCard framework={mockFramework} score={85} answers={{}} />);
    fireEvent.click(screen.getByTestId('compliance-sox'));
    expect(screen.getByText('Access controls')).toBeInTheDocument();
    expect(screen.getByText('Change management')).toBeInTheDocument();
  });

  it('should show threshold in expanded section', () => {
    render(<ComplianceCard framework={mockFramework} score={85} answers={{}} />);
    fireEvent.click(screen.getByTestId('compliance-sox'));
    expect(screen.getByText(/Threshold: 80%/)).toBeInTheDocument();
  });

  it('should handle framework without requirements', () => {
    const frameworkNoReqs = { ...mockFramework, requirements: undefined };
    render(<ComplianceCard framework={frameworkNoReqs} score={85} answers={{}} />);
    fireEvent.click(screen.getByTestId('compliance-sox'));
    expect(screen.getByText('SOX Compliance')).toBeInTheDocument();
  });

  it('should handle framework without mappedQuestions', () => {
    const fw = { ...mockFramework, mappedQuestions: undefined };
    render(<ComplianceCard framework={fw} score={85} answers={{}} />);
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

  it('should have accessible role and aria-expanded', () => {
    render(<ComplianceCard framework={mockFramework} score={85} answers={{}} />);
    const card = screen.getByTestId('compliance-sox');
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(card);
    expect(card).toHaveAttribute('aria-expanded', 'true');
  });

  it('should expand on Enter key', () => {
    render(<ComplianceCard framework={mockFramework} score={85} answers={{}} />);
    const card = screen.getByTestId('compliance-sox');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(screen.getByText('Financial controls and IT governance')).toBeInTheDocument();
  });

  it('should expand on Space key', () => {
    render(<ComplianceCard framework={mockFramework} score={85} answers={{}} />);
    const card = screen.getByTestId('compliance-sox');
    fireEvent.keyDown(card, { key: ' ' });
    expect(screen.getByText('Financial controls and IT governance')).toBeInTheDocument();
  });

  it('should sort unanswered questions before answered ones in breakdown', () => {
    const answers = { 'd4_q9': 5 }; // only last question answered
    render(<ComplianceCard framework={mockFramework} score={33} answers={answers} />);
    fireEvent.click(screen.getByTestId('compliance-sox'));
    const rows = screen.getAllByTestId(/^cq-row-/);
    // The two unanswered questions should appear before the answered one
    expect(rows[0]).toHaveAttribute('data-testid', 'cq-row-d2_q5');
    expect(rows[1]).toHaveAttribute('data-testid', 'cq-row-d2_q6');
    expect(rows[2]).toHaveAttribute('data-testid', 'cq-row-d4_q9');
  });
});
