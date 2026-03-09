import { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { DomainRadarChart } from './DomainRadarChart';
import { DomainBarChart } from './DomainBarChart';
import { DomainHeatmap } from './DomainHeatmap';
import { BenchmarkTrendChart } from './BenchmarkTrendChart';
import { BenchmarkSources } from './BenchmarkSources';
import { scoreCalculator, NA_VALUE } from '../utils/scoreCalculator';
import { dataService } from '../services/dataService';
import './ChartFullscreenView.css';

const CHART_LABELS = {
  heatmap: '🔥 Heatmap',
  radar: '📡 Radar Chart',
  bar: '📊 Bar Chart',
  trend: '📈 Trend'
};

export const ChartFullscreenView = ({ chartType, questions, answers, onBack }) => {
  const [benchmarks, setBenchmarks] = useState(null);

  // Interactive toolbar state
  const [showIndustryAvg, setShowIndustryAvg] = useState(true);
  const [showTopQuartile, setShowTopQuartile] = useState(true);
  const [hiddenDomains, setHiddenDomains] = useState(new Set());
  const [showTarget, setShowTarget] = useState(false);
  const [targetValue, setTargetValue] = useState(4.0);
  const [trendRange, setTrendRange] = useState('all');
  const [chartInstance, setChartInstance] = useState(null);
  const [heatmapCanvas, setHeatmapCanvas] = useState(null);

  useEffect(() => {
    dataService.loadBenchmarks().then(data => {
      if (data?.current) setBenchmarks(data);
    });
  }, []);

  // Build domain structure from assigned questions (same logic as ResultsView)
  const filteredDomains = useMemo(() => {
    const domains = {};
    questions.forEach(q => {
      if (!domains[q.domainId]) {
        domains[q.domainId] = {
          title: q.domainTitle || q.domainId,
          weight: 1,
          categories: {}
        };
      }
      if (!domains[q.domainId].categories[q.categoryId]) {
        domains[q.domainId].categories[q.categoryId] = {
          title: q.categoryTitle || q.categoryId,
          questions: []
        };
      }
      domains[q.domainId].categories[q.categoryId].questions.push(q);
    });
    return domains;
  }, [questions]);

  // Overall score for trend chart
  const overallScore = useMemo(() => {
    const scored = Object.values(filteredDomains).map(domain => {
      let total = 0, count = 0;
      Object.values(domain.categories || {}).forEach(cat => {
        (cat.questions || []).forEach(q => {
          const val = answers[q.id];
          if (val !== undefined && val !== NA_VALUE) { total += val; count++; }
        });
      });
      return count > 0 ? total / count : null;
    }).filter(s => s !== null);
    return scored.length > 0 ? scored.reduce((a, b) => a + b, 0) / scored.length : 0;
  }, [filteredDomains, answers]);

  const domainKeys = Object.keys(filteredDomains);
  const label = CHART_LABELS[chartType] || 'Chart';

  function toggleDomain(key) {
    setHiddenDomains(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  const effectiveTarget = showTarget ? targetValue : null;

  const handleChartReady = useCallback((ref) => {
    setChartInstance(ref);
  }, []);

  const handleCanvasReady = useCallback((canvas) => {
    setHeatmapCanvas(canvas);
  }, []);

  function exportPng() {
    let dataUrl = null;
    if (chartType === 'heatmap' && heatmapCanvas) {
      dataUrl = heatmapCanvas.toDataURL('image/png');
    } else if (chartInstance) {
      dataUrl = chartInstance.toBase64Image?.();
    }
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `chart-${chartType}.png`;
    a.click();
  }

  const showsDomains = ['radar', 'bar', 'heatmap'].includes(chartType);
  const showsBenchmarks = ['radar', 'bar', 'trend'].includes(chartType);
  const showsTarget = ['radar', 'bar'].includes(chartType);
  const showsTrend = chartType === 'trend';

  return (
    <div className="chart-fullscreen-view" data-testid="chart-fullscreen-view">
      <header className="chart-fullscreen-header">
        <button
          className="chart-fullscreen-back-btn"
          onClick={onBack}
          data-testid="chart-fullscreen-back"
        >
          ← Back to Results
        </button>
        <h2 className="chart-fullscreen-title">{label}</h2>
        <div className="chart-fullscreen-score">
          <span className="cfs-score-value">{overallScore.toFixed(2)}</span>
          <span className="cfs-score-label">/ 5.0 — {scoreCalculator.getMaturityLevel(overallScore)}</span>
        </div>
        {benchmarks?.sources && <BenchmarkSources sources={benchmarks.sources} />}
      </header>

      {/* ── Toolbar ── */}
      <div className="cfs-toolbar" data-testid="cfs-toolbar">
        {showsBenchmarks && (
          <div className="cfs-toolbar-group">
            <button
              className={`cfs-toggle-btn${showIndustryAvg ? ' active' : ''}`}
              onClick={() => setShowIndustryAvg(v => !v)}
              data-testid="cfs-toggle-industry-avg"
            >
              <span className="cfs-toggle-dot" style={{ background: '#f59e0b' }} />
              Industry Avg
            </button>
            <button
              className={`cfs-toggle-btn${showTopQuartile ? ' active' : ''}`}
              onClick={() => setShowTopQuartile(v => !v)}
              data-testid="cfs-toggle-top-quartile"
            >
              <span className="cfs-toggle-dot" style={{ background: '#10b981' }} />
              Top Quartile
            </button>
          </div>
        )}

        {showsDomains && domainKeys.length > 0 && (
          <div className="cfs-toolbar-group">
            <span className="cfs-toolbar-label">Domains:</span>
            {domainKeys.map(key => (
              <button
                key={key}
                className={`cfs-domain-chip${hiddenDomains.has(key) ? ' hidden' : ''}`}
                onClick={() => toggleDomain(key)}
                data-testid={`cfs-domain-chip-${key}`}
                title={hiddenDomains.has(key) ? 'Click to show' : 'Click to hide'}
              >
                {filteredDomains[key].title}
              </button>
            ))}
          </div>
        )}

        {showsTarget && (
          <div className="cfs-toolbar-group">
            <button
              className={`cfs-toggle-btn${showTarget ? ' active' : ''}`}
              onClick={() => setShowTarget(v => !v)}
              data-testid="cfs-toggle-target"
            >
              <span className="cfs-toggle-dot" style={{ background: '#a855f7' }} />
              Target
            </button>
            {showTarget && (
              <label className="cfs-slider-label">
                <span>{targetValue.toFixed(1)}</span>
                <input
                  type="range"
                  min="3"
                  max="5"
                  step="0.1"
                  value={targetValue}
                  onChange={e => setTargetValue(parseFloat(e.target.value))}
                  className="cfs-slider"
                  data-testid="cfs-target-slider"
                />
              </label>
            )}
          </div>
        )}

        {showsTrend && (
          <div className="cfs-toolbar-group">
            <span className="cfs-toolbar-label">Range:</span>
            <button
              className={`cfs-toggle-btn${trendRange === 'all' ? ' active' : ''}`}
              onClick={() => setTrendRange('all')}
              data-testid="cfs-trend-all"
            >
              All years
            </button>
            <button
              className={`cfs-toggle-btn${trendRange === 'recent' ? ' active' : ''}`}
              onClick={() => setTrendRange('recent')}
              data-testid="cfs-trend-recent"
            >
              Last 4 years
            </button>
          </div>
        )}

        <div className="cfs-toolbar-spacer" />

        <button
          className="cfs-export-btn"
          onClick={exportPng}
          data-testid="cfs-export-png"
          title="Export chart as PNG"
        >
          ⬇ PNG
        </button>
      </div>

      <main className="chart-fullscreen-main" data-testid="chart-fullscreen-main">
        {chartType === 'heatmap' && (
          <DomainHeatmap
            domains={filteredDomains}
            answers={answers}
            hiddenDomains={hiddenDomains}
            onCanvasReady={handleCanvasReady}
          />
        )}
        {chartType === 'radar' && (
          <DomainRadarChart
            domains={filteredDomains}
            answers={answers}
            benchmarks={benchmarks}
            showIndustryAvg={showIndustryAvg}
            showTopQuartile={showTopQuartile}
            hiddenDomains={hiddenDomains}
            targetScore={effectiveTarget}
            onChartReady={handleChartReady}
          />
        )}
        {chartType === 'bar' && (
          <DomainBarChart
            domains={filteredDomains}
            answers={answers}
            benchmarks={benchmarks}
            showIndustryAvg={showIndustryAvg}
            showTopQuartile={showTopQuartile}
            hiddenDomains={hiddenDomains}
            targetScore={effectiveTarget}
            onChartReady={handleChartReady}
          />
        )}
        {chartType === 'trend' && (
          <BenchmarkTrendChart
            benchmarks={benchmarks}
            userScore={overallScore}
            showIndustryAvg={showIndustryAvg}
            showTopQuartile={showTopQuartile}
            trendRange={trendRange}
            onChartReady={handleChartReady}
          />
        )}
        {!['heatmap', 'radar', 'bar', 'trend'].includes(chartType) && (
          <p className="chart-fullscreen-unknown">Unknown chart type: {chartType}</p>
        )}
      </main>
    </div>
  );
};

ChartFullscreenView.propTypes = {
  chartType: PropTypes.string.isRequired,
  questions: PropTypes.array.isRequired,
  answers: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired
};
