import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DomainRadarChart } from './DomainRadarChart';

let lastRadarProps = null;
vi.mock('react-chartjs-2', () => ({
  Radar: (props) => {
    lastRadarProps = props;
    return <canvas data-testid="radar-canvas" />;
  }
}));

describe('DomainRadarChart', () => {
  beforeEach(() => {
    lastRadarProps = null;
  });

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

  it('should render chart with correct labels and scores', () => {
    render(<DomainRadarChart domains={mockDomains} answers={mockAnswers} />);
    expect(lastRadarProps).not.toBeNull();
    expect(lastRadarProps.data.labels).toEqual(['Domain 1', 'Domain 2']);
    // domain1: (3+4)/2 = 3.5, domain2: 5/1 = 5
    expect(lastRadarProps.data.datasets[0].data).toEqual([3.5, 5]);
    expect(lastRadarProps.data.datasets[0].label).toBe('Your Score');
    expect(lastRadarProps.data.datasets).toHaveLength(1);
  });

  it('should show empty state when no domains', () => {
    render(<DomainRadarChart domains={{}} answers={{}} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(lastRadarProps).toBeNull();
  });

  it('should handle null domains', () => {
    render(<DomainRadarChart domains={null} answers={{}} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(lastRadarProps).toBeNull();
  });

  it('should handle undefined domains', () => {
    render(<DomainRadarChart />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(lastRadarProps).toBeNull();
  });

  it('should handle domains without categories', () => {
    const domainsNoCategories = {
      domain1: { title: 'Domain 1', weight: 0.5, categories: null }
    };
    render(<DomainRadarChart domains={domainsNoCategories} answers={{}} />);
    expect(lastRadarProps).not.toBeNull();
    expect(lastRadarProps.data.labels).toEqual(['Domain 1']);
    expect(lastRadarProps.data.datasets[0].data).toEqual([0]);
  });

  it('should handle empty answers with zero scores', () => {
    render(<DomainRadarChart domains={mockDomains} answers={{}} />);
    expect(lastRadarProps).not.toBeNull();
    expect(lastRadarProps.data.labels).toEqual(['Domain 1', 'Domain 2']);
    expect(lastRadarProps.data.datasets[0].data).toEqual([0, 0]);
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
    render(<DomainRadarChart domains={domainsNoQuestions} answers={{}} />);
    expect(lastRadarProps).not.toBeNull();
    expect(lastRadarProps.data.labels).toEqual(['Domain 1']);
    expect(lastRadarProps.data.datasets[0].data).toEqual([0]);
  });

  it('should calculate scores correctly with partial answers', () => {
    const partialAnswers = { q1: 5 };
    render(<DomainRadarChart domains={mockDomains} answers={partialAnswers} />);
    expect(lastRadarProps).not.toBeNull();
    // domain1: only q1=5 answered => 5/1 = 5, domain2: no answers => 0
    expect(lastRadarProps.data.datasets[0].data).toEqual([5, 0]);
  });

  it('should handle empty categories object', () => {
    const domainsEmptyCategories = {
      domain1: {
        title: 'Domain 1',
        categories: {}
      }
    };
    render(<DomainRadarChart domains={domainsEmptyCategories} answers={{}} />);
    expect(lastRadarProps).not.toBeNull();
    expect(lastRadarProps.data.labels).toEqual(['Domain 1']);
    // No questions => score = 0
    expect(lastRadarProps.data.datasets[0].data).toEqual([0]);
  });

  it('should configure a tooltip label callback in options', () => {
    render(<DomainRadarChart domains={mockDomains} answers={mockAnswers} />);
    expect(lastRadarProps).not.toBeNull();
    expect(lastRadarProps.options.plugins.tooltip.callbacks.label).toBeTypeOf('function');
    // Invoke the callback with a mock context to verify formatting
    const mockCtx = { dataset: { label: 'Your Score' }, parsed: { r: 3.5 } };
    const result = lastRadarProps.options.plugins.tooltip.callbacks.label(mockCtx);
    expect(result).toBe(' Your Score: 3.50');
  });

  it('should render with benchmark data including industry avg dataset', () => {
    const benchmarks = {
      current: { domain1: 3.2, domain2: 3.5, industry: 'Financial Services' }
    };
    render(<DomainRadarChart domains={mockDomains} answers={mockAnswers} benchmarks={benchmarks} />);
    expect(lastRadarProps).not.toBeNull();
    // Your Score + Industry Avg = 2 datasets
    expect(lastRadarProps.data.datasets).toHaveLength(2);
    expect(lastRadarProps.data.datasets[1].label).toBe('Industry Avg (2024)');
    expect(lastRadarProps.data.datasets[1].data).toEqual([3.2, 3.5]);
  });

  it('should render without benchmark data gracefully', () => {
    render(<DomainRadarChart domains={mockDomains} answers={mockAnswers} benchmarks={null} />);
    expect(lastRadarProps).not.toBeNull();
    expect(lastRadarProps.data.datasets).toHaveLength(1);
    expect(lastRadarProps.data.datasets[0].label).toBe('Your Score');
  });

  it('should exclude NA answers from chart scores', () => {
    const answersWithNA = { q1: 5, q2: 0, q3: 5 }; // q2 is N/A (NA_VALUE = 0)
    render(<DomainRadarChart domains={mockDomains} answers={answersWithNA} />);
    expect(lastRadarProps).not.toBeNull();
    // domain1: only q1=5 counted (q2=0 excluded) => 5/1 = 5
    // domain2: q3=5 => 5/1 = 5
    expect(lastRadarProps.data.datasets[0].data).toEqual([5, 5]);
  });

  describe('hiddenDomains filtering', () => {
    it('should filter out hidden domains when hiddenDomains set is provided', () => {
      const hidden = new Set(['domain1']);
      render(<DomainRadarChart domains={mockDomains} answers={mockAnswers} hiddenDomains={hidden} />);
      expect(lastRadarProps).not.toBeNull();
      // domain1 hidden, only Domain 2 shown
      expect(lastRadarProps.data.labels).toEqual(['Domain 2']);
      expect(lastRadarProps.data.datasets[0].data).toEqual([5]);
    });

    it('should show all domains when hiddenDomains is an empty set', () => {
      const hidden = new Set();
      render(<DomainRadarChart domains={mockDomains} answers={mockAnswers} hiddenDomains={hidden} />);
      expect(lastRadarProps).not.toBeNull();
      expect(lastRadarProps.data.labels).toEqual(['Domain 1', 'Domain 2']);
      expect(lastRadarProps.data.datasets[0].data).toEqual([3.5, 5]);
    });

    it('should show all domains when hiddenDomains is undefined', () => {
      render(<DomainRadarChart domains={mockDomains} answers={mockAnswers} />);
      expect(lastRadarProps).not.toBeNull();
      expect(lastRadarProps.data.labels).toEqual(['Domain 1', 'Domain 2']);
      expect(lastRadarProps.data.datasets[0].data).toEqual([3.5, 5]);
    });
  });

  describe('targetScore dataset', () => {
    it('should add target dataset with the correct value when targetScore is provided', () => {
      render(<DomainRadarChart domains={mockDomains} answers={mockAnswers} targetScore={4.0} />);
      expect(lastRadarProps).not.toBeNull();
      const targetDataset = lastRadarProps.data.datasets.find(ds => ds.label.includes('Target'));
      expect(targetDataset).toBeDefined();
      expect(targetDataset.label).toBe('Target (4.0)');
      // Should fill for each visible domain
      expect(targetDataset.data).toEqual([4.0, 4.0]);
    });

    it('should add target dataset with targetScore of 0 (falsy but not null/undefined)', () => {
      render(<DomainRadarChart domains={mockDomains} answers={mockAnswers} targetScore={0} />);
      expect(lastRadarProps).not.toBeNull();
      const targetDataset = lastRadarProps.data.datasets.find(ds => ds.label.includes('Target'));
      expect(targetDataset).toBeDefined();
      expect(targetDataset.label).toBe('Target (0.0)');
      expect(targetDataset.data).toEqual([0, 0]);
    });

    it('should not add target dataset when targetScore is null', () => {
      render(<DomainRadarChart domains={mockDomains} answers={mockAnswers} targetScore={null} />);
      expect(lastRadarProps).not.toBeNull();
      const targetDataset = lastRadarProps.data.datasets.find(ds => ds.label?.includes('Target'));
      expect(targetDataset).toBeUndefined();
    });

    it('should not add target dataset when targetScore is undefined', () => {
      render(<DomainRadarChart domains={mockDomains} answers={mockAnswers} targetScore={undefined} />);
      expect(lastRadarProps).not.toBeNull();
      const targetDataset = lastRadarProps.data.datasets.find(ds => ds.label?.includes('Target'));
      expect(targetDataset).toBeUndefined();
    });
  });

  describe('showIndustryAvg and showTopQuartile toggles', () => {
    const benchmarksWithAll = {
      current: { domain1: 3.2, domain2: 3.5, label: '2024' },
      topQuartile: { domain1: 4.5, domain2: 4.8 }
    };

    it('should not include industry avg when showIndustryAvg is false', () => {
      render(
        <DomainRadarChart
          domains={mockDomains}
          answers={mockAnswers}
          benchmarks={benchmarksWithAll}
          showIndustryAvg={false}
        />
      );
      expect(lastRadarProps).not.toBeNull();
      const industryDataset = lastRadarProps.data.datasets.find(ds => ds.label.includes('Industry'));
      expect(industryDataset).toBeUndefined();
      // Should still have Top Quartile
      const topQDataset = lastRadarProps.data.datasets.find(ds => ds.label.includes('Top Quartile'));
      expect(topQDataset).toBeDefined();
      expect(topQDataset.data).toEqual([4.5, 4.8]);
    });

    it('should not include top quartile when showTopQuartile is false', () => {
      render(
        <DomainRadarChart
          domains={mockDomains}
          answers={mockAnswers}
          benchmarks={benchmarksWithAll}
          showTopQuartile={false}
        />
      );
      expect(lastRadarProps).not.toBeNull();
      const topQDataset = lastRadarProps.data.datasets.find(ds => ds.label.includes('Top Quartile'));
      expect(topQDataset).toBeUndefined();
      // Should still have Industry Avg
      const industryDataset = lastRadarProps.data.datasets.find(ds => ds.label.includes('Industry'));
      expect(industryDataset).toBeDefined();
      expect(industryDataset.data).toEqual([3.2, 3.5]);
    });

    it('should include both datasets when toggles are not false', () => {
      render(
        <DomainRadarChart
          domains={mockDomains}
          answers={mockAnswers}
          benchmarks={benchmarksWithAll}
        />
      );
      expect(lastRadarProps).not.toBeNull();
      // Your Score + Industry Avg + Top Quartile = 3
      expect(lastRadarProps.data.datasets).toHaveLength(3);
      expect(lastRadarProps.data.datasets[0].label).toBe('Your Score');
      expect(lastRadarProps.data.datasets[1].label).toBe('Industry Avg (2024)');
      expect(lastRadarProps.data.datasets[1].data).toEqual([3.2, 3.5]);
      expect(lastRadarProps.data.datasets[2].label).toBe('Top Quartile');
      expect(lastRadarProps.data.datasets[2].data).toEqual([4.5, 4.8]);
    });

    it('should use default label when benchmarks.current.label is missing', () => {
      const benchmarksNoLabel = {
        current: { domain1: 3.2, domain2: 3.5 },
        topQuartile: { domain1: 4.5, domain2: 4.8 }
      };
      render(
        <DomainRadarChart
          domains={mockDomains}
          answers={mockAnswers}
          benchmarks={benchmarksNoLabel}
        />
      );
      expect(lastRadarProps).not.toBeNull();
      const industryDataset = lastRadarProps.data.datasets.find(ds => ds.label.includes('Industry'));
      expect(industryDataset).toBeDefined();
      // Default label is '2024' when benchmarks.current.label is missing
      expect(industryDataset.label).toBe('Industry Avg (2024)');
    });
  });

  describe('onChartReady callback', () => {
    it('should pass ref callback when onChartReady is provided', () => {
      const onChartReady = vi.fn();
      render(<DomainRadarChart domains={mockDomains} answers={mockAnswers} onChartReady={onChartReady} />);
      expect(lastRadarProps).not.toBeNull();
      expect(lastRadarProps.ref).toBeDefined();
    });

    it('should not pass ref callback when onChartReady is not provided', () => {
      render(<DomainRadarChart domains={mockDomains} answers={mockAnswers} />);
      expect(lastRadarProps).not.toBeNull();
      expect(lastRadarProps.ref).toBeUndefined();
    });
  });

  describe('tooltip callback', () => {
    it('should render chart with tooltip callback configured', () => {
      render(<DomainRadarChart domains={mockDomains} answers={mockAnswers} />);
      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
      expect(lastRadarProps.options.plugins.tooltip.callbacks.label).toBeTypeOf('function');
    });
  });
});
