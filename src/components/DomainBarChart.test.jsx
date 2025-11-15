import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DomainBarChart } from './DomainBarChart';

describe('DomainBarChart', () => {
  const mockDomains = {
    domain1: {
      title: 'Domain 1',
      weight: 0.5,
      categories: {
        cat1: {
          questions: [
            { id: 'q1', text: 'Question 1' },
            { id: 'q2', text: 'Question 2' }
          ]
        }
      }
    }
  };

  const mockAnswers = {
    q1: 3,
    q2: 4
  };

  it('should render chart with data', () => {
    const { container } = render(
      <DomainBarChart domains={mockDomains} answers={mockAnswers} />
    );
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should show empty state when no domains', () => {
    render(<DomainBarChart domains={{}} answers={{}} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should handle null domains', () => {
    render(<DomainBarChart domains={null} answers={{}} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should handle undefined props', () => {
    render(<DomainBarChart />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should handle empty answers', () => {
    const { container } = render(
      <DomainBarChart domains={mockDomains} answers={{}} />
    );
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should handle domains without categories', () => {
    const domainsNoCategories = {
      domain1: { title: 'Domain 1', categories: null }
    };
    const { container } = render(
      <DomainBarChart domains={domainsNoCategories} answers={{}} />
    );
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should handle categories without questions', () => {
    const domainsNoQuestions = {
      domain1: {
        title: 'Domain 1',
        categories: {
          cat1: { questions: null }
        }
      }
    };
    const { container } = render(
      <DomainBarChart domains={domainsNoQuestions} answers={{}} />
    );
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });
});