import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import PropTypes from 'prop-types';
import { scoreCalculator } from '../utils/scoreCalculator';
import {
  CHART_COLORS,
  darkLegend,
  darkTooltip,
  darkScaleR
} from '../utils/chartTheme';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export const DomainRadarChart = ({
  domains = {}, answers = {}, benchmarks = null,
  showIndustryAvg, showTopQuartile, hiddenDomains, targetScore, onChartReady
}) => {
  if (!domains || Object.keys(domains).length === 0) {
    return <div className="chart-empty">No data available</div>;
  }

  const allDomainKeys = Object.keys(domains);
  const visibleKeys = hiddenDomains?.size
    ? allDomainKeys.filter(k => !hiddenDomains.has(k))
    : allDomainKeys;
  const visibleDomains = visibleKeys.reduce((acc, k) => { acc[k] = domains[k]; return acc; }, {});
  const domainNames = visibleKeys.map(k => domains[k].title);
  const domainScores = visibleKeys.map(key => {
    const questions = scoreCalculator.getAllQuestionsFromDomain(visibleDomains[key]);
    return scoreCalculator.calculateDomainScore(questions, answers);
  });

  const hasCurrent = showIndustryAvg !== false && benchmarks?.current;
  const hasTopQ = showTopQuartile !== false && benchmarks?.topQuartile;

  const datasets = [
    {
      label: 'Your Score',
      data: domainScores,
      backgroundColor: CHART_COLORS.userScore.fill,
      borderColor: CHART_COLORS.userScore.border,
      borderWidth: 2,
      pointBackgroundColor: CHART_COLORS.userScore.point,
      pointBorderColor: 'transparent',
      pointRadius: 4,
      pointHoverRadius: 6
    }
  ];

  if (hasCurrent) {
    datasets.push({
      label: `Industry Avg (${benchmarks.current.label || '2024'})`,
      data: visibleKeys.map(key => benchmarks.current[key] ?? null),
      backgroundColor: CHART_COLORS.industryAvg.fill,
      borderColor: CHART_COLORS.industryAvg.border,
      borderWidth: 2,
      borderDash: [4, 4],
      pointBackgroundColor: CHART_COLORS.industryAvg.point,
      pointBorderColor: 'transparent',
      pointRadius: 4
    });
  }

  if (hasTopQ) {
    datasets.push({
      label: `Top Quartile`,
      data: visibleKeys.map(key => benchmarks.topQuartile[key] ?? null),
      backgroundColor: CHART_COLORS.topQuartile.fill,
      borderColor: CHART_COLORS.topQuartile.border,
      borderWidth: 2,
      borderDash: [2, 4],
      pointBackgroundColor: CHART_COLORS.topQuartile.point,
      pointBorderColor: 'transparent',
      pointRadius: 4
    });
  }

  if (targetScore !== null && targetScore !== undefined) {
    datasets.push({
      label: `Target (${Number(targetScore).toFixed(1)})`,
      data: Array(visibleKeys.length).fill(targetScore),
      backgroundColor: CHART_COLORS.target.fill,
      borderColor: CHART_COLORS.target.border,
      borderWidth: 1,
      borderDash: [3, 3],
      pointBackgroundColor: CHART_COLORS.target.point,
      pointBorderColor: 'transparent',
      pointRadius: 2
    });
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { r: darkScaleR() },
    plugins: {
      legend: darkLegend,
      tooltip: {
        ...darkTooltip,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${Number(ctx.parsed.r).toFixed(2)}`
        }
      }
    }
  };

  return (
    <div className="chart-container" style={{ height: 'clamp(260px, 50vh, 600px)' }} data-testid="radar-chart">
      <Radar ref={onChartReady ? (r) => onChartReady(r) : undefined} data={{ labels: domainNames, datasets }} options={options} />
    </div>
  );
};

DomainRadarChart.propTypes = {
  domains: PropTypes.object,
  answers: PropTypes.object,
  benchmarks: PropTypes.object,
  showIndustryAvg: PropTypes.bool,
  showTopQuartile: PropTypes.bool,
  hiddenDomains: PropTypes.instanceOf(Set),
  targetScore: PropTypes.number,
  onChartReady: PropTypes.func
};

