import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DomainBarChart } from './DomainBarChart';

let lastBarProps = null;
vi.mock('react-chartjs-2', () => ({
  Bar: (props) => {
    lastBarProps = props;
    return <canvas data-testid="bar-canvas" />;
  }
}));

describe('DomainBarChart', () => {
  beforeEach(() => {
    lastBarProps = null;
  });

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

  it('should render chart with correct labels and scores', () => {
    render(<DomainBarChart domains={mockDomains} answers={mockAnswers} />);
    expect(lastBarProps).not.toBeNull();
    expect(lastBarProps.data.labels).toEqual(['Domain 1']);
    // (3 + 4) / 2 = 3.5
    expect(lastBarProps.data.datasets[0].data).toEqual([3.5]);
    expect(lastBarProps.data.datasets[0].label).toBe('Your Score');
    expect(lastBarProps.data.datasets).toHaveLength(1);
  });

  it('should show empty state when no domains', () => {
    render(<DomainBarChart domains={{}} answers={{}} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(lastBarProps).toBeNull();
  });

  it('should handle null domains', () => {
    render(<DomainBarChart domains={null} answers={{}} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(lastBarProps).toBeNull();
  });

  it('should handle undefined props', () => {
    render(<DomainBarChart />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(lastBarProps).toBeNull();
  });

  it('should handle empty answers with zero scores', () => {
    render(<DomainBarChart domains={mockDomains} answers={{}} />);
    expect(lastBarProps).not.toBeNull();
    expect(lastBarProps.data.labels).toEqual(['Domain 1']);
    // No answers => score = 0
    expect(lastBarProps.data.datasets[0].data).toEqual([0]);
  });

  it('should handle domains without categories', () => {
    const domainsNoCategories = {
      domain1: { title: 'Domain 1', categories: null }
    };
    render(<DomainBarChart domains={domainsNoCategories} answers={{}} />);
    expect(lastBarProps).not.toBeNull();
    expect(lastBarProps.data.labels).toEqual(['Domain 1']);
    // No questions => score = 0
    expect(lastBarProps.data.datasets[0].data).toEqual([0]);
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
    render(<DomainBarChart domains={domainsNoQuestions} answers={{}} />);
    expect(lastBarProps).not.toBeNull();
    expect(lastBarProps.data.labels).toEqual(['Domain 1']);
    expect(lastBarProps.data.datasets[0].data).toEqual([0]);
  });

  it('should render with benchmark data including industry avg dataset', () => {
    const benchmarks = {
      current: { domain1: 3.2, industry: 'Financial Services' }
    };
    render(<DomainBarChart domains={mockDomains} answers={mockAnswers} benchmarks={benchmarks} />);
    expect(lastBarProps).not.toBeNull();
    // Should have Your Score + Industry Avg = 2 datasets
    expect(lastBarProps.data.datasets).toHaveLength(2);
    expect(lastBarProps.data.datasets[1].label).toBe('Industry Avg');
    expect(lastBarProps.data.datasets[1].data).toEqual([3.2]);
  });

  it('should render without benchmark data gracefully', () => {
    render(<DomainBarChart domains={mockDomains} answers={mockAnswers} benchmarks={null} />);
    expect(lastBarProps).not.toBeNull();
    // No benchmarks => only Your Score dataset
    expect(lastBarProps.data.datasets).toHaveLength(1);
    expect(lastBarProps.data.datasets[0].label).toBe('Your Score');
  });

  it('should exclude NA answers from chart scores', () => {
    const answersWithNA = { q1: 4, q2: 0 }; // q2 is N/A (NA_VALUE = 0)
    render(<DomainBarChart domains={mockDomains} answers={answersWithNA} />);
    expect(lastBarProps).not.toBeNull();
    // Only q1=4 counted, q2=0 excluded => score = 4/1 = 4
    expect(lastBarProps.data.datasets[0].data).toEqual([4]);
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
      render(<DomainBarChart domains={twoDomains} answers={{ q1: 3, q2: 4 }} hiddenDomains={hidden} />);
      expect(lastBarProps).not.toBeNull();
      // domain1 hidden, only Domain 2 shown
      expect(lastBarProps.data.labels).toEqual(['Domain 2']);
      expect(lastBarProps.data.datasets[0].data).toEqual([4]);
    });

    it('should show all domains when hiddenDomains is an empty set', () => {
      const hidden = new Set();
      render(<DomainBarChart domains={twoDomains} answers={{ q1: 3, q2: 4 }} hiddenDomains={hidden} />);
      expect(lastBarProps).not.toBeNull();
      expect(lastBarProps.data.labels).toEqual(['Domain 1', 'Domain 2']);
      expect(lastBarProps.data.datasets[0].data).toEqual([3, 4]);
    });

    it('should show all domains when hiddenDomains is undefined', () => {
      render(<DomainBarChart domains={twoDomains} answers={{ q1: 3, q2: 4 }} />);
      expect(lastBarProps).not.toBeNull();
      expect(lastBarProps.data.labels).toEqual(['Domain 1', 'Domain 2']);
      expect(lastBarProps.data.datasets[0].data).toEqual([3, 4]);
    });
  });

  describe('targetScore dataset', () => {
    it('should add target dataset with the correct value when targetScore is provided', () => {
      render(<DomainBarChart domains={mockDomains} answers={mockAnswers} targetScore={4.0} />);
      expect(lastBarProps).not.toBeNull();
      const targetDataset = lastBarProps.data.datasets.find(ds => ds.label.includes('Target'));
      expect(targetDataset).toBeDefined();
      expect(targetDataset.label).toBe('Target (4.0)');
      expect(targetDataset.data).toEqual([4.0]);
    });

    it('should add target dataset with targetScore of 0 (falsy but not null/undefined)', () => {
      render(<DomainBarChart domains={mockDomains} answers={mockAnswers} targetScore={0} />);
      expect(lastBarProps).not.toBeNull();
      const targetDataset = lastBarProps.data.datasets.find(ds => ds.label.includes('Target'));
      expect(targetDataset).toBeDefined();
      expect(targetDataset.label).toBe('Target (0.0)');
      expect(targetDataset.data).toEqual([0]);
    });

    it('should not add target dataset when targetScore is null', () => {
      render(<DomainBarChart domains={mockDomains} answers={mockAnswers} targetScore={null} />);
      expect(lastBarProps).not.toBeNull();
      const targetDataset = lastBarProps.data.datasets.find(ds => ds.label?.includes('Target'));
      expect(targetDataset).toBeUndefined();
    });

    it('should not add target dataset when targetScore is undefined', () => {
      render(<DomainBarChart domains={mockDomains} answers={mockAnswers} targetScore={undefined} />);
      expect(lastBarProps).not.toBeNull();
      const targetDataset = lastBarProps.data.datasets.find(ds => ds.label?.includes('Target'));
      expect(targetDataset).toBeUndefined();
    });
  });

  describe('showIndustryAvg and showTopQuartile toggles', () => {
    const benchmarksWithAll = {
      current: { domain1: 3.2 },
      topQuartile: { domain1: 4.5 }
    };

    it('should not include industry avg when showIndustryAvg is false', () => {
      render(
        <DomainBarChart
          domains={mockDomains}
          answers={mockAnswers}
          benchmarks={benchmarksWithAll}
          showIndustryAvg={false}
        />
      );
      expect(lastBarProps).not.toBeNull();
      const industryDataset = lastBarProps.data.datasets.find(ds => ds.label.includes('Industry'));
      expect(industryDataset).toBeUndefined();
      // Should still have Top Quartile
      const topQDataset = lastBarProps.data.datasets.find(ds => ds.label.includes('Top Quartile'));
      expect(topQDataset).toBeDefined();
      expect(topQDataset.data).toEqual([4.5]);
    });

    it('should not include top quartile when showTopQuartile is false', () => {
      render(
        <DomainBarChart
          domains={mockDomains}
          answers={mockAnswers}
          benchmarks={benchmarksWithAll}
          showTopQuartile={false}
        />
      );
      expect(lastBarProps).not.toBeNull();
      const topQDataset = lastBarProps.data.datasets.find(ds => ds.label.includes('Top Quartile'));
      expect(topQDataset).toBeUndefined();
      // Should still have Industry Avg
      const industryDataset = lastBarProps.data.datasets.find(ds => ds.label.includes('Industry'));
      expect(industryDataset).toBeDefined();
      expect(industryDataset.data).toEqual([3.2]);
    });

    it('should include both when showIndustryAvg and showTopQuartile are not false', () => {
      render(
        <DomainBarChart
          domains={mockDomains}
          answers={mockAnswers}
          benchmarks={benchmarksWithAll}
        />
      );
      expect(lastBarProps).not.toBeNull();
      // Your Score + Industry Avg + Top Quartile = 3
      expect(lastBarProps.data.datasets).toHaveLength(3);
      expect(lastBarProps.data.datasets[0].label).toBe('Your Score');
      expect(lastBarProps.data.datasets[1].label).toBe('Industry Avg');
      expect(lastBarProps.data.datasets[1].data).toEqual([3.2]);
      expect(lastBarProps.data.datasets[2].label).toBe('Top Quartile');
      expect(lastBarProps.data.datasets[2].data).toEqual([4.5]);
    });

    it('should render benchmarks with topQuartile data', () => {
      const benchmarks = {
        current: { domain1: 3.2 },
        topQuartile: { domain1: 4.5 }
      };
      render(<DomainBarChart domains={mockDomains} answers={mockAnswers} benchmarks={benchmarks} />);
      expect(lastBarProps).not.toBeNull();
      expect(lastBarProps.data.datasets).toHaveLength(3);
      const topQDataset = lastBarProps.data.datasets.find(ds => ds.label === 'Top Quartile');
      expect(topQDataset).toBeDefined();
      expect(topQDataset.data).toEqual([4.5]);
    });
  });

  describe('onChartReady callback', () => {
    it('should pass ref callback when onChartReady is provided', () => {
      const onChartReady = vi.fn();
      render(<DomainBarChart domains={mockDomains} answers={mockAnswers} onChartReady={onChartReady} />);
      expect(lastBarProps).not.toBeNull();
      // The component passes a ref function when onChartReady is provided
      expect(lastBarProps.ref).toBeDefined();
    });

    it('should not pass ref callback when onChartReady is not provided', () => {
      render(<DomainBarChart domains={mockDomains} answers={mockAnswers} />);
      expect(lastBarProps).not.toBeNull();
      expect(lastBarProps.ref).toBeUndefined();
    });
  });

  describe('tooltip callback', () => {
    it('should configure a tooltip label callback in options', () => {
      render(<DomainBarChart domains={mockDomains} answers={mockAnswers} />);
      expect(lastBarProps).not.toBeNull();
      expect(lastBarProps.options.plugins.tooltip.callbacks.label).toBeTypeOf('function');
      // Invoke the callback with a mock context to verify formatting
      const mockCtx = { dataset: { label: 'Your Score' }, parsed: { y: 3.5 } };
      const result = lastBarProps.options.plugins.tooltip.callbacks.label(mockCtx);
      expect(result).toBe(' Your Score: 3.50');
    });
  });
});
