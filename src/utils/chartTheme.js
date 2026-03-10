/**
 * Shared Chart.js dark-theme configuration used across all chart components.
 */

export const CHART_COLORS = {
  userScore: {
    border: '#22c55e',
    fill: 'rgba(34, 197, 94, 0.25)',
    point: '#86efac',
    pointHover: '#bbf7d0'
  },
  industryAvg: {
    border: '#f59e0b',
    fill: 'rgba(245, 158, 11, 0.12)',
    point: '#fcd34d',
    pointHover: '#fde68a'
  },
  topQuartile: {
    border: '#10b981',
    fill: 'rgba(16, 185, 129, 0.10)',
    point: '#6ee7b7',
    pointHover: '#a7f3d0'
  },
  target: {
    border: 'rgba(168, 85, 247, 0.65)',
    fill: 'rgba(168, 85, 247, 0.05)',
    point: 'rgba(168, 85, 247, 0.65)',
    pointHover: 'rgba(216, 180, 254, 0.8)'
  }
};

export const darkGridColor = 'rgba(148, 163, 184, 0.12)';
export const darkTickColor = '#64748b';
export const darkTitleColor = '#94a3b8';
export const darkLegendColor = '#94a3b8';

export const darkTooltip = {
  backgroundColor: '#132218',
  titleColor: '#f1f5f9',
  bodyColor: '#94a3b8',
  borderColor: 'rgba(148, 163, 184, 0.25)',
  borderWidth: 1,
  padding: 10,
  cornerRadius: 6,
  callbacks: {
    label: (ctx) => ` ${ctx.dataset.label}: ${Number(ctx.parsed?.y ?? ctx.parsed?.r ?? 0).toFixed(2)}`
  }
};

export const darkLegend = {
  position: 'bottom',
  labels: {
    color: darkLegendColor,
    padding: 10,
    usePointStyle: true,
    pointStyleWidth: 8,
    font: { size: 11 }
  }
};

export function darkScaleY(min = 0, max = 5) {
  return {
    min,
    max,
    grid: { color: darkGridColor },
    border: { color: darkGridColor },
    ticks: { color: darkTickColor, stepSize: 1 },
    title: { color: darkTitleColor, font: { size: 11 } }
  };
}

export function darkScaleX() {
  return {
    grid: { color: darkGridColor },
    border: { color: darkGridColor },
    ticks: { color: darkTickColor, font: { size: 11 } }
  };
}

export function darkScaleR() {
  return {
    beginAtZero: true,
    max: 5,
    grid: { color: darkGridColor },
    angleLines: { color: darkGridColor },
    pointLabels: { color: '#94a3b8', font: { size: 11 } },
    ticks: {
      color: darkTickColor,
      stepSize: 1,
      backdropColor: 'transparent'
    }
  };
}
