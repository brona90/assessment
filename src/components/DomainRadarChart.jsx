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

  const domainNames = Object.values(domains).map(d => d.title);
  const domainScores = Object.keys(domains).map(domainKey => {
    const domain = domains[domainKey];
    const questions = [];
    Object.values(domain.categories || {}).forEach(cat => {
      if (cat.questions) questions.push(...cat.questions);
    });
    
    if (questions.length === 0) return 0;
    
    let total = 0;
    let count = 0;
    questions.forEach(q => {
      if (answers[q.id] !== undefined) {
        total += answers[q.id];
        count++;
      }
    });
    
    return count > 0 ? total / count : 0;
  });

  const data = {
    labels: domainNames,
    datasets: [
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
    ]
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