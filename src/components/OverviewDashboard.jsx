import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Maximize2 } from 'lucide-react';
import { DomainHeatmap } from './DomainHeatmap';
import { DomainRadarChart } from './DomainRadarChart';
import { DomainBarChart } from './DomainBarChart';
import { BenchmarkTrendChart } from './BenchmarkTrendChart';
import { BenchmarkSources } from './BenchmarkSources';
import { ComplianceDashboard } from './ComplianceDashboard';
import { dataService } from '../services/dataService';
import { scoreCalculator } from '../utils/scoreCalculator';

/**
 * Shared dashboard used by both ResultsView (user) and FullScreenAdminView (admin overview tab).
 * Renders: heatmap, radar + bar + trend grid, benchmark sources, compliance section.
 * Admin callers omit onExpandChart to disable click-to-fullscreen.
 */
export const OverviewDashboard = ({ domains, answers, onExpandChart, onChartReady }) => {
  const [benchmarks, setBenchmarks] = useState(null);

  useEffect(() => {
    dataService.loadBenchmarks().then(data => {
      if (data?.current) setBenchmarks(data);
    });
  }, []);

  // Overall score (domain-average of domain-averages) for the trend chart user-score line
  const overallScore = useMemo(() => scoreCalculator.calculateOverallScore(domains, answers), [domains, answers]);

  const canExpand = !!onExpandChart;
  const chartClickProps = (type) => canExpand ? {
    onClick: () => onExpandChart(type),
    onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onExpandChart(type); } },
    role: 'button',
    tabIndex: 0,
    'aria-label': `Expand ${type} chart to fullscreen`
  } : {};

  return (
    <>
      {/* Heatmap — full width */}
      <div
        className={`chart-display${canExpand ? ' chart-display--clickable' : ''}`}
        {...chartClickProps('heatmap')}
        data-testid="overview-heatmap"
      >
        {canExpand && <span className="chart-expand-hint"><Maximize2 size={12} /> Click to expand</span>}
        <DomainHeatmap
          domains={domains}
          answers={answers}
          onCanvasReady={onChartReady ? (c) => onChartReady('heatmap', c) : undefined}
        />
      </div>

      {/* Charts grid: radar + bar + trend */}
      <div className="charts-grid">
        <div
          className={`chart-container${canExpand ? ' chart-display--clickable' : ''}`}
          {...chartClickProps('radar')}
          data-testid="overview-radar"
        >
          {canExpand && <span className="chart-expand-hint"><Maximize2 size={12} /> Click to expand</span>}
          <h3>Domain Scores (Radar)</h3>
          <DomainRadarChart
            domains={domains}
            answers={answers}
            benchmarks={benchmarks}
            onChartReady={onChartReady ? (r) => onChartReady('radar', r) : undefined}
          />
        </div>
        <div
          className={`chart-container${canExpand ? ' chart-display--clickable' : ''}`}
          {...chartClickProps('bar')}
          data-testid="overview-bar"
        >
          {canExpand && <span className="chart-expand-hint"><Maximize2 size={12} /> Click to expand</span>}
          <h3>Domain Scores (Bar)</h3>
          <DomainBarChart
            domains={domains}
            answers={answers}
            benchmarks={benchmarks}
            onChartReady={onChartReady ? (r) => onChartReady('bar', r) : undefined}
          />
        </div>
        {benchmarks && (
          <div
            className={`chart-container${canExpand ? ' chart-display--clickable' : ''}`}
            {...chartClickProps('trend')}
            data-testid="overview-trend"
          >
            {canExpand && <span className="chart-expand-hint"><Maximize2 size={12} /> Click to expand</span>}
            <h3>Industry Benchmark Trend</h3>
            <BenchmarkTrendChart
              benchmarks={benchmarks}
              userScore={overallScore > 0 ? overallScore : undefined}
            />
          </div>
        )}
      </div>

      {benchmarks?.sources && <BenchmarkSources sources={benchmarks.sources} />}

      <div className="compliance-section">
        <h2>Compliance Frameworks</h2>
        <ComplianceDashboard answers={answers} />
      </div>
    </>
  );
};

OverviewDashboard.propTypes = {
  domains: PropTypes.object.isRequired,
  answers: PropTypes.object.isRequired,
  onExpandChart: PropTypes.func,
  onChartReady: PropTypes.func
};
