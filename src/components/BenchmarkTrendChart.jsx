import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
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
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const BenchmarkTrendChart = ({
  benchmarks, userScore, showIndustryAvg, showTopQuartile, trendRange, onChartReady
}) => {
  if (!benchmarks || !benchmarks.history || benchmarks.history.length === 0) {
    return (
      <div className="chart-empty" data-testid="trend-chart-empty">
        No benchmark history available.
      </div>
    );
  }

  let sorted = [...benchmarks.history].sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );

  if (trendRange === 'recent' && sorted.length > 4) {
    sorted = sorted.slice(-4);
  }

  const labels = sorted.map(p => p.label || p.date);
  const industryAvg = sorted.map(p => p.overall);
  const topQ = sorted.map(p => p.topQuartileOverall ?? null);

  const datasets = [];

  if (showIndustryAvg !== false) {
    datasets.push({
      label: 'Industry Avg',
      data: industryAvg,
      borderColor: CHART_COLORS.industryAvg.border,
      backgroundColor: CHART_COLORS.industryAvg.fill,
      borderWidth: 2,
      pointBackgroundColor: CHART_COLORS.industryAvg.point,
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.35,
      fill: true
    });
  }

  if (showTopQuartile !== false && topQ.some(v => v !== null)) {
    datasets.push({
      label: 'Top Quartile',
      data: topQ,
      borderColor: CHART_COLORS.topQuartile.border,
      backgroundColor: CHART_COLORS.topQuartile.fill,
      borderWidth: 2,
      borderDash: [4, 4],
      pointBackgroundColor: CHART_COLORS.topQuartile.point,
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.35,
      fill: false
    });
  }

  if (userScore !== undefined && userScore !== null) {
    datasets.push({
      label: 'Your Score',
      data: Array(labels.length).fill(userScore),
      borderColor: CHART_COLORS.userScore.border,
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderDash: [6, 4],
      pointRadius: 0,
      pointHoverRadius: 0,
      tension: 0,
      fill: false
    });
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        ...darkScaleY(0, 5),
        title: { display: true, text: 'Maturity Score (1–5)', color: '#94a3b8', font: { size: 11 } }
      },
      x: {
        ...darkScaleX(),
        title: { display: true, text: 'Year', color: '#94a3b8', font: { size: 11 } }
      }
    },
    plugins: {
      legend: darkLegend,
      tooltip: darkTooltip
    }
  };

  return (
    <div
      className="chart-container"
      style={{ height: 'clamp(240px, 48vh, 560px)' }}
      data-testid="benchmark-trend-chart"
    >
      <Line ref={onChartReady ? (r) => onChartReady(r) : undefined} data={{ labels, datasets }} options={options} />
    </div>
  );
};

BenchmarkTrendChart.propTypes = {
  benchmarks: PropTypes.shape({
    current: PropTypes.object,
    history: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        overall: PropTypes.number.isRequired
      })
    )
  }),
  userScore: PropTypes.number,
  showIndustryAvg: PropTypes.bool,
  showTopQuartile: PropTypes.bool,
  trendRange: PropTypes.oneOf(['all', 'recent']),
  onChartReady: PropTypes.func
};
