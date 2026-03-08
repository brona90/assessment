import { useState } from 'react';
import PropTypes from 'prop-types';
import { scoreCalculator } from '../utils/scoreCalculator';
import './CompareExports.css';

/**
 * Parses a user export JSON and computes per-domain scores.
 * Returns { user, exportDate, domains: { domainId: { score, answered, total, domainTitle } }, overall }
 */
function parseExport(json) {
  if (!json || !json.questions) return null;

  const domainMap = {};
  for (const q of json.questions) {
    if (!domainMap[q.domainId]) {
      domainMap[q.domainId] = {
        domainId: q.domainId,
        domainTitle: q.domainTitle || q.domainId,
        questions: []
      };
    }
    domainMap[q.domainId].questions.push(q);
  }

  // Build answers object for scoreCalculator
  const answers = {};
  json.questions.forEach(q => {
    if (q.answer !== null && q.answer !== undefined) {
      answers[q.id] = q.answer;
    }
  });

  const domains = {};
  for (const [domainId, d] of Object.entries(domainMap)) {
    const score = scoreCalculator.calculateDomainScore(d.questions, answers);
    const total = d.questions.length;
    const answered = d.questions.filter(q => answers[q.id] !== undefined && answers[q.id] !== 0).length;
    domains[domainId] = { score, total, answered, domainTitle: d.domainTitle };
  }

  const scoredDomains = Object.values(domains).filter(d => d.score > 0);
  const overall = scoredDomains.length > 0
    ? scoredDomains.reduce((sum, d) => sum + d.score, 0) / scoredDomains.length
    : 0;

  return {
    user: json.user,
    exportDate: json.exportDate,
    domains,
    overall
  };
}

async function readJsonFile(file) {
  const text = await file.text();
  return JSON.parse(text);
}

const DELTA_HIGH = 0.5;  // >= 0.5 improvement → green
const DELTA_LOW = -0.5;  // <= -0.5 regression → red

function DeltaCell({ delta }) {
  const formatted = delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2);
  const className = delta >= DELTA_HIGH
    ? 'delta-positive'
    : delta <= DELTA_LOW
      ? 'delta-negative'
      : 'delta-neutral';
  return (
    <td className={`compare-delta ${className}`} data-testid="delta-cell">
      {formatted}
    </td>
  );
}

DeltaCell.propTypes = { delta: PropTypes.number.isRequired };

export const CompareExports = () => {
  const [exportA, setExportA] = useState(null);
  const [exportB, setExportB] = useState(null);
  const [error, setError] = useState('');

  const handleFile = async (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const json = await readJsonFile(file);
      const parsed = parseExport(json);
      if (!parsed) {
        setError('Invalid export file — expected a user assessment JSON.');
        return;
      }
      setter(parsed);
      setError('');
    } catch {
      setError('Could not read file. Make sure it is a valid JSON export.');
    }
    e.target.value = '';
  };

  // Collect all domain IDs present in either export
  const allDomainIds = [...new Set([
    ...(exportA ? Object.keys(exportA.domains) : []),
    ...(exportB ? Object.keys(exportB.domains) : [])
  ])];

  const hasComparison = exportA && exportB && allDomainIds.length > 0;

  return (
    <section className="management-card compare-exports-card" data-testid="compare-exports">
      <h3>📊 Compare Two Exports</h3>
      <p className="help-text">
        Upload two assessment JSON exports to see a side-by-side score comparison and change delta.
      </p>

      <div className="compare-inputs">
        <div className="compare-file-group">
          <label className="compare-file-label">
            <span className="compare-file-badge before">Before</span>
            <span className="file-label">
              <span>{exportA ? `✓ ${exportA.user?.name || 'Loaded'}` : '📁 Select Before'}</span>
              <input
                type="file"
                accept=".json"
                onChange={e => handleFile(e, setExportA)}
                data-testid="compare-file-a"
              />
            </span>
          </label>
          {exportA && (
            <span className="compare-meta">
              {exportA.user?.name} · {exportA.exportDate ? new Date(exportA.exportDate).toLocaleDateString() : ''}
            </span>
          )}
        </div>

        <div className="compare-arrow">→</div>

        <div className="compare-file-group">
          <label className="compare-file-label">
            <span className="compare-file-badge after">After</span>
            <span className="file-label">
              <span>{exportB ? `✓ ${exportB.user?.name || 'Loaded'}` : '📁 Select After'}</span>
              <input
                type="file"
                accept=".json"
                onChange={e => handleFile(e, setExportB)}
                data-testid="compare-file-b"
              />
            </span>
          </label>
          {exportB && (
            <span className="compare-meta">
              {exportB.user?.name} · {exportB.exportDate ? new Date(exportB.exportDate).toLocaleDateString() : ''}
            </span>
          )}
        </div>
      </div>

      {error && <p className="compare-error" data-testid="compare-error">{error}</p>}

      {hasComparison && (
        <div className="compare-results" data-testid="compare-results">
          <table className="compare-table" data-testid="compare-table">
            <thead>
              <tr>
                <th>Domain</th>
                <th>Before</th>
                <th>After</th>
                <th>Delta</th>
              </tr>
            </thead>
            <tbody>
              {allDomainIds.map(domainId => {
                const a = exportA.domains[domainId];
                const b = exportB.domains[domainId];
                const scoreA = a?.score ?? 0;
                const scoreB = b?.score ?? 0;
                const delta = scoreB - scoreA;
                const title = b?.domainTitle || a?.domainTitle || domainId;
                return (
                  <tr key={domainId} data-testid={`compare-row-${domainId}`}>
                    <td className="compare-domain">{title}</td>
                    <td className="compare-score">{scoreA > 0 ? scoreA.toFixed(2) : '—'}</td>
                    <td className="compare-score">{scoreB > 0 ? scoreB.toFixed(2) : '—'}</td>
                    <DeltaCell delta={delta} />
                  </tr>
                );
              })}
              <tr className="compare-overall-row" data-testid="compare-overall-row">
                <td className="compare-domain"><strong>Overall</strong></td>
                <td className="compare-score"><strong>{exportA.overall.toFixed(2)}</strong></td>
                <td className="compare-score"><strong>{exportB.overall.toFixed(2)}</strong></td>
                <DeltaCell delta={exportB.overall - exportA.overall} />
              </tr>
            </tbody>
          </table>

          <p className="compare-legend">
            <span className="delta-positive">▲ Improved</span>
            <span className="delta-neutral">● Unchanged</span>
            <span className="delta-negative">▼ Regressed</span>
          </p>
        </div>
      )}

      {(exportA || exportB) && !hasComparison && (
        <p className="compare-hint" data-testid="compare-hint">
          Load both exports to see the comparison.
        </p>
      )}
    </section>
  );
};
