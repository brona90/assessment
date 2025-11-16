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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const DomainBarChart = ({ domains, answers }) => {
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
        label: 'Domain Score',
        data: domainScores,
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Domain Maturity Scores',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    }
  };

  return (
    <div className="chart-container" style={{ height: '400px' }} data-testid="bar-chart">
      <Bar data={data} options={options} />
    </div>
  );
};

DomainBarChart.propTypes = {
  domains: PropTypes.object,
  answers: PropTypes.object
};

DomainBarChart.defaultProps = {
  domains: {},
  answers: {}
};