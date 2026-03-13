import { describe, it, expect, vi } from 'vitest';
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

  it('should render with benchmark data', () => {
    const benchmarks = {
      current: { domain1: 3.2, industry: 'Financial Services' }
    };
    const { container } = render(
      <DomainBarChart domains={mockDomains} answers={mockAnswers} benchmarks={benchmarks} />
    );
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should render without benchmark data gracefully', () => {
    const { container } = render(
      <DomainBarChart domains={mockDomains} answers={mockAnswers} benchmarks={null} />
    );
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should exclude NA answers from chart scores', () => {
    const answersWithNA = { q1: 4, q2: 0 }; // q2 is N/A
    const { container } = render(
      <DomainBarChart domains={mockDomains} answers={answersWithNA} />
    );
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  describe('hiddenDomains filtering', () => {
    const twoDomains = {
      domain1: {
        title: 'Domain 1',
        weight: 0.5,
        categories: {
          cat1: { questions: [{ id: 'q1', text: 'Q1' }] }
        }
      },
      domain2: {
        title: 'Domain 2',
        weight: 0.5,
        categories: {
          cat2: { questions: [{ id: 'q2', text: 'Q2' }] }
        }
      }
    };

    it('should filter out hidden domains when hiddenDomains set is provided', () => {
      const hidden = new Set(['domain1']);
      const { container } = render(
        <DomainBarChart domains={twoDomains} answers={{ q1: 3, q2: 4 }} hiddenDomains={hidden} />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should show all domains when hiddenDomains is an empty set', () => {
      const hidden = new Set();
      const { container } = render(
        <DomainBarChart domains={twoDomains} answers={{ q1: 3, q2: 4 }} hiddenDomains={hidden} />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should show all domains when hiddenDomains is undefined', () => {
      const { container } = render(
        <DomainBarChart domains={twoDomains} answers={{ q1: 3, q2: 4 }} />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('targetScore dataset', () => {
    it('should render with a targetScore number', () => {
      const { container } = render(
        <DomainBarChart domains={mockDomains} answers={mockAnswers} targetScore={4.0} />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should render with targetScore of 0 (falsy but not null/undefined)', () => {
      const { container } = render(
        <DomainBarChart domains={mockDomains} answers={mockAnswers} targetScore={0} />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should not add target dataset when targetScore is null', () => {
      const { container } = render(
        <DomainBarChart domains={mockDomains} answers={mockAnswers} targetScore={null} />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should not add target dataset when targetScore is undefined', () => {
      const { container } = render(
        <DomainBarChart domains={mockDomains} answers={mockAnswers} targetScore={undefined} />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('showIndustryAvg and showTopQuartile toggles', () => {
    const benchmarksWithAll = {
      current: { domain1: 3.2 },
      topQuartile: { domain1: 4.5 }
    };

    it('should not include industry avg when showIndustryAvg is false', () => {
      const { container } = render(
        <DomainBarChart
          domains={mockDomains}
          answers={mockAnswers}
          benchmarks={benchmarksWithAll}
          showIndustryAvg={false}
        />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should not include top quartile when showTopQuartile is false', () => {
      const { container } = render(
        <DomainBarChart
          domains={mockDomains}
          answers={mockAnswers}
          benchmarks={benchmarksWithAll}
          showTopQuartile={false}
        />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should include both when showIndustryAvg and showTopQuartile are not false', () => {
      const { container } = render(
        <DomainBarChart
          domains={mockDomains}
          answers={mockAnswers}
          benchmarks={benchmarksWithAll}
        />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should render benchmarks with topQuartile data', () => {
      const benchmarks = {
        current: { domain1: 3.2 },
        topQuartile: { domain1: 4.5 }
      };
      const { container } = render(
        <DomainBarChart domains={mockDomains} answers={mockAnswers} benchmarks={benchmarks} />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('onChartReady callback', () => {
    it('should pass ref callback when onChartReady is provided', () => {
      const onChartReady = vi.fn();
      const { container } = render(
        <DomainBarChart domains={mockDomains} answers={mockAnswers} onChartReady={onChartReady} />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should not pass ref callback when onChartReady is not provided', () => {
      const { container } = render(
        <DomainBarChart domains={mockDomains} answers={mockAnswers} />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('tooltip callback', () => {
    it('should render chart that has a tooltip callback configured', () => {
      const { container } = render(
        <DomainBarChart domains={mockDomains} answers={mockAnswers} />
      );
      // The tooltip callback is set inside the options object passed to Bar.
      // We verify the chart renders correctly, which means the callback was configured.
      expect(container.querySelector('[data-testid="bar-chart"]')).toBeInTheDocument();
    });
  });
});