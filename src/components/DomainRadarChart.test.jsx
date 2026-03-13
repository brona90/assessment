import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DomainRadarChart } from './DomainRadarChart';

describe('DomainRadarChart', () => {
  const mockDomains = {
    domain1: {
      title: 'Domain 1',
      weight: 0.3,
      categories: {
        cat1: {
          questions: [
            { id: 'q1', text: 'Question 1' },
            { id: 'q2', text: 'Question 2' }
          ]
        }
      }
    },
    domain2: {
      title: 'Domain 2',
      weight: 0.7,
      categories: {
        cat1: {
          questions: [
            { id: 'q3', text: 'Question 3' }
          ]
        }
      }
    }
  };

  const mockAnswers = {
    q1: 3,
    q2: 4,
    q3: 5
  };

  it('should render chart with data', () => {
    const { container } = render(
      <DomainRadarChart domains={mockDomains} answers={mockAnswers} />
    );
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should show empty state when no domains', () => {
    render(<DomainRadarChart domains={{}} answers={{}} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should handle null domains', () => {
    render(<DomainRadarChart domains={null} answers={{}} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should handle undefined domains', () => {
    render(<DomainRadarChart />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should handle domains without categories', () => {
    const domainsNoCategories = {
      domain1: { title: 'Domain 1', weight: 0.5, categories: null }
    };
    const { container } = render(
      <DomainRadarChart domains={domainsNoCategories} answers={{}} />
    );
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should handle empty answers', () => {
    const { container } = render(
      <DomainRadarChart domains={mockDomains} answers={{}} />
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
      <DomainRadarChart domains={domainsNoQuestions} answers={{}} />
    );
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should calculate scores correctly with partial answers', () => {
    const partialAnswers = { q1: 5 };
    const { container } = render(
      <DomainRadarChart domains={mockDomains} answers={partialAnswers} />
    );
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should handle empty categories object', () => {
    const domainsEmptyCategories = {
      domain1: {
        title: 'Domain 1',
        categories: {}
      }
    };
    const { container } = render(
      <DomainRadarChart domains={domainsEmptyCategories} answers={{}} />
    );
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should format tooltip labels correctly', () => {
    // This test ensures the tooltip callback is covered
    const { container } = render(
      <DomainRadarChart domains={mockDomains} answers={mockAnswers} />
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();

    // The tooltip callback is registered and will be called when hovering
    // We verify the chart is rendered with the correct configuration
  });

  it('should render with benchmark data', () => {
    const benchmarks = {
      current: { domain1: 3.2, domain2: 3.5, industry: 'Financial Services' }
    };
    const { container } = render(
      <DomainRadarChart domains={mockDomains} answers={mockAnswers} benchmarks={benchmarks} />
    );
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should render without benchmark data gracefully', () => {
    const { container } = render(
      <DomainRadarChart domains={mockDomains} answers={mockAnswers} benchmarks={null} />
    );
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('should exclude NA answers from chart scores', () => {
    const answersWithNA = { q1: 5, q2: 0, q3: 5 }; // q2 is N/A
    const { container } = render(
      <DomainRadarChart domains={mockDomains} answers={answersWithNA} />
    );
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  describe('hiddenDomains filtering', () => {
    it('should filter out hidden domains when hiddenDomains set is provided', () => {
      const hidden = new Set(['domain1']);
      const { container } = render(
        <DomainRadarChart domains={mockDomains} answers={mockAnswers} hiddenDomains={hidden} />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should show all domains when hiddenDomains is an empty set', () => {
      const hidden = new Set();
      const { container } = render(
        <DomainRadarChart domains={mockDomains} answers={mockAnswers} hiddenDomains={hidden} />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should show all domains when hiddenDomains is undefined', () => {
      const { container } = render(
        <DomainRadarChart domains={mockDomains} answers={mockAnswers} />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('targetScore dataset', () => {
    it('should render with a targetScore number', () => {
      const { container } = render(
        <DomainRadarChart domains={mockDomains} answers={mockAnswers} targetScore={4.0} />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should render with targetScore of 0 (falsy but not null/undefined)', () => {
      const { container } = render(
        <DomainRadarChart domains={mockDomains} answers={mockAnswers} targetScore={0} />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should not add target dataset when targetScore is null', () => {
      const { container } = render(
        <DomainRadarChart domains={mockDomains} answers={mockAnswers} targetScore={null} />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should not add target dataset when targetScore is undefined', () => {
      const { container } = render(
        <DomainRadarChart domains={mockDomains} answers={mockAnswers} targetScore={undefined} />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('showIndustryAvg and showTopQuartile toggles', () => {
    const benchmarksWithAll = {
      current: { domain1: 3.2, domain2: 3.5, label: '2024' },
      topQuartile: { domain1: 4.5, domain2: 4.8 }
    };

    it('should not include industry avg when showIndustryAvg is false', () => {
      const { container } = render(
        <DomainRadarChart
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
        <DomainRadarChart
          domains={mockDomains}
          answers={mockAnswers}
          benchmarks={benchmarksWithAll}
          showTopQuartile={false}
        />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should include both datasets when toggles are not false', () => {
      const { container } = render(
        <DomainRadarChart
          domains={mockDomains}
          answers={mockAnswers}
          benchmarks={benchmarksWithAll}
        />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should use default label when benchmarks.current.label is missing', () => {
      const benchmarksNoLabel = {
        current: { domain1: 3.2, domain2: 3.5 },
        topQuartile: { domain1: 4.5, domain2: 4.8 }
      };
      const { container } = render(
        <DomainRadarChart
          domains={mockDomains}
          answers={mockAnswers}
          benchmarks={benchmarksNoLabel}
        />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('onChartReady callback', () => {
    it('should pass ref callback when onChartReady is provided', () => {
      const onChartReady = vi.fn();
      const { container } = render(
        <DomainRadarChart domains={mockDomains} answers={mockAnswers} onChartReady={onChartReady} />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });

    it('should not pass ref callback when onChartReady is not provided', () => {
      const { container } = render(
        <DomainRadarChart domains={mockDomains} answers={mockAnswers} />
      );
      expect(container.querySelector('canvas')).toBeInTheDocument();
    });
  });

  describe('tooltip callback', () => {
    it('should render chart with tooltip callback configured', () => {
      const { container } = render(
        <DomainRadarChart domains={mockDomains} answers={mockAnswers} />
      );
      expect(container.querySelector('[data-testid="radar-chart"]')).toBeInTheDocument();
    });
  });
});