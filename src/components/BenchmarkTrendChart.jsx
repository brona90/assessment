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

/**
 * Renders a quarterly trend line for the industry benchmark overall score.
 * Optionally overlays the user's current overall score as a horizontal reference line.
 *
 * Props:
 *   benchmarks  — the full benchmarks object ({ current, history })
 *   userScore   — optional number; user's current overall maturity score (0–5)
 */
export const BenchmarkTrendChart = ({ benchmarks, userScore }) => {
  if (!benchmarks || !benchmarks.history || benchmarks.history.length === 0) {
    return (
      <div className="chart-empty" data-testid="trend-chart-empty">
        No benchmark history available.
      </div>
    );
  }

  // Build chronological series: history (oldest first) + current
  const historicalPoints = [...benchmarks.history].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const labels = [
    ...historicalPoints.map(p => p.date),
    benchmarks.current?.source?.replace('Industry Average ', '') || '2024-Q4'
  ];

  const industryOverall = [
    ...historicalPoints.map(p => p.overall),
    benchmarks.current?.overall ?? null
  ];

  const datasets = [
    {
      label: `Industry Benchmark (${benchmarks.current?.industry || 'Overall'})`,
      data: industryOverall,
      borderColor: 'rgba(102, 126, 234, 1)',
      backgroundColor: 'rgba(102, 126, 234, 0.12)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(102, 126, 234, 1)',
      pointRadius: 5,
      tension: 0.3,
      fill: true
    }
  ];

  if (userScore !== undefined && userScore !== null) {
    datasets.push({
      label: 'Your Score',
      data: Array(labels.length).fill(userScore),
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 2,
      borderDash: [6, 4],
      pointRadius: 0,
      tension: 0,
      fill: false
    });
  }

  const data = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1 },
        title: {
          display: true,
          text: 'Maturity Score (1–5)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Quarter'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Industry Benchmark Trend',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.dataset.label}: ${Number(ctx.parsed.y).toFixed(2)}`
        }
      }
    }
  };

  return (
    <div
      className="chart-container"
      style={{ height: '350px' }}
      data-testid="benchmark-trend-chart"
    >
      <Line data={data} options={options} />
    </div>
  );
};

BenchmarkTrendChart.propTypes = {
  benchmarks: PropTypes.shape({
    current: PropTypes.object,
    history: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string.isRequired,
        overall: PropTypes.number.isRequired
      })
    )
  }),
  userScore: PropTypes.number
};
