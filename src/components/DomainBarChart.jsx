import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import PropTypes from 'prop-types';
import {
  CHART_COLORS,
  darkLegend,
  darkTooltip,
  darkScaleY,
  darkScaleX
} from '../utils/chartTheme';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function computeDomainScores(domains, answers) {
  return Object.keys(domains).map(domainKey => {
    const domain = domains[domainKey];
    const questions = [];
    Object.values(domain.categories || {}).forEach(cat => {
      if (cat.questions) questions.push(...cat.questions);
    });
    if (questions.length === 0) return 0;
    let total = 0;
    let count = 0;
    questions.forEach(q => {
      const val = answers[q.id];
      if (val !== undefined && val !== 0) { total += val; count++; }
    });
    return count > 0 ? total / count : 0;
  });
}

export const DomainBarChart = ({
  domains, answers, benchmarks,
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
  const domainScores = computeDomainScores(visibleDomains, answers);

  const hasCurrent = showIndustryAvg !== false && benchmarks?.current;
  const hasTopQ = showTopQuartile !== false && benchmarks?.topQuartile;

  const datasets = [
    {
      label: 'Your Score',
      data: domainScores,
      backgroundColor: CHART_COLORS.userScore.fill,
      borderColor: CHART_COLORS.userScore.border,
      borderWidth: 2,
      borderRadius: 4,
      borderSkipped: false
    }
  ];

  if (hasCurrent) {
    datasets.push({
      label: `Industry Avg`,
      data: visibleKeys.map(key => benchmarks.current[key] ?? null),
      backgroundColor: CHART_COLORS.industryAvg.fill,
      borderColor: CHART_COLORS.industryAvg.border,
      borderWidth: 2,
      borderRadius: 4,
      borderSkipped: false
    });
  }

  if (hasTopQ) {
    datasets.push({
      label: `Top Quartile`,
      data: visibleKeys.map(key => benchmarks.topQuartile[key] ?? null),
      backgroundColor: CHART_COLORS.topQuartile.fill,
      borderColor: CHART_COLORS.topQuartile.border,
      borderWidth: 2,
      borderRadius: 4,
      borderSkipped: false
    });
  }

  if (targetScore != null) {
    datasets.push({
      label: `Target (${Number(targetScore).toFixed(1)})`,
      data: Array(visibleKeys.length).fill(targetScore),
      backgroundColor: CHART_COLORS.target.fill,
      borderColor: CHART_COLORS.target.border,
      borderWidth: 1,
      borderRadius: 0,
      borderSkipped: false
    });
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        ...darkScaleY(0, 5),
        title: { display: true, text: 'Maturity Score', color: '#94a3b8', font: { size: 11 } }
      },
      x: darkScaleX()
    },
    plugins: {
      legend: darkLegend,
      tooltip: {
        ...darkTooltip,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${Number(ctx.parsed.y).toFixed(2)}`
        }
      }
    }
  };

  return (
    <div className="chart-container" style={{ height: '460px' }} data-testid="bar-chart">
      <Bar ref={onChartReady ? (r) => onChartReady(r) : undefined} data={{ labels: domainNames, datasets }} options={options} />
    </div>
  );
};

DomainBarChart.propTypes = {
  domains: PropTypes.object,
  answers: PropTypes.object,
  benchmarks: PropTypes.object,
  showIndustryAvg: PropTypes.bool,
  showTopQuartile: PropTypes.bool,
  hiddenDomains: PropTypes.instanceOf(Set),
  targetScore: PropTypes.number,
  onChartReady: PropTypes.func
};

DomainBarChart.defaultProps = {
  domains: {},
  answers: {},
  benchmarks: null
};
