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

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export const DomainRadarChart = ({ domains, answers, benchmarks }) => {
  if (!domains || Object.keys(domains).length === 0) {
    return <div className="chart-empty">No data available</div>;
  }

  const domainKeys = Object.keys(domains);
  const domainNames = Object.values(domains).map(d => d.title);
  const domainScores = domainKeys.map(domainKey => {
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
      if (val !== undefined && val !== 0) {
        total += val;
        count++;
      }
    });

    return count > 0 ? total / count : 0;
  });

  const hasBenchmarks = benchmarks && benchmarks.current;
  const industryScores = hasBenchmarks
    ? domainKeys.map(key => benchmarks.current[key] ?? null)
    : null;

  const datasets = [
    {
      label: 'Current Score',
      data: domainScores,
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderColor: 'rgba(99, 102, 241, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(99, 102, 241, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(99, 102, 241, 1)'
    },
    {
      label: 'Target (4.0)',
      data: domainNames.map(() => 4.0),
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderColor: 'rgba(34, 197, 94, 1)',
      borderWidth: 2,
      borderDash: [5, 5],
      pointBackgroundColor: 'rgba(34, 197, 94, 1)',
      pointBorderColor: '#fff'
    }
  ];

  if (industryScores) {
    datasets.push({
      label: `Industry Avg (${benchmarks.current.industry || 'Benchmark'})`,
      data: industryScores,
      backgroundColor: 'rgba(251, 146, 60, 0.1)',
      borderColor: 'rgba(251, 146, 60, 1)',
      borderWidth: 2,
      borderDash: [3, 3],
      pointBackgroundColor: 'rgba(251, 146, 60, 1)',
      pointBorderColor: '#fff'
    });
  }

  const data = {
    labels: domainNames,
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.r.toFixed(2)}`;
          }
        }
      }
    }
  };

  return (
    <div className="chart-container" style={{ height: '400px' }} data-testid="radar-chart">
      <Radar data={data} options={options} />
    </div>
  );
};

DomainRadarChart.propTypes = {
  domains: PropTypes.object,
  answers: PropTypes.object,
  benchmarks: PropTypes.object
};

DomainRadarChart.defaultProps = {
  domains: {},
  answers: {},
  benchmarks: {}
};