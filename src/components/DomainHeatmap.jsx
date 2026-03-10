import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './DomainHeatmap.css';

/** Returns cell background color and readable text color for a 0–5 maturity score on dark canvas. */
function getCellStyle(score) {
  if (score < 1.5) return { bg: 'rgb(153, 27, 27)',  text: '#fca5a5' };  // dark red
  if (score < 2.5) return { bg: 'rgb(146, 64, 14)',  text: '#fed7aa' };  // dark orange
  if (score < 3.0) return { bg: 'rgb(113, 63, 18)',  text: '#fde68a' };  // dark amber
  if (score < 3.5) return { bg: 'rgb(20,  83,  45)', text: '#86efac' };  // dark green (approaching target)
  if (score < 4.5) return { bg: 'rgb(6,   78,  59)', text: '#6ee7b7' };  // dark green
  return                  { bg: 'rgb(5,   46,  22)', text: '#86efac' };  // deep green
}

export const DomainHeatmap = ({ domains, answers, hiddenDomains, onCanvasReady }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (onCanvasReady && canvasRef.current) onCanvasReady(canvasRef.current);
  }, [onCanvasReady]);

  useEffect(() => {
    if (!canvasRef.current || !domains || Object.keys(domains).length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const heatmapData = [];
    const domainEntries = hiddenDomains?.size
      ? Object.entries(domains).filter(([k]) => !hiddenDomains.has(k)).map(([, v]) => v)
      : Object.values(domains);
    domainEntries.forEach(domain => {
      Object.values(domain.categories || {}).forEach(category => {
        const questions = category.questions || [];
        if (questions.length === 0) return;
        let total = 0;
        let answered = 0;
        questions.forEach(q => {
          if (answers[q.id] !== undefined) { total += answers[q.id]; answered++; }
        });
        if (answered > 0) {
          heatmapData.push({
            domain: domain.title,
            category: category.title,
            score: total / answered,
            answered,
            total: questions.length
          });
        }
      });
    });

    const CANVAS_BG   = '#0f172a';
    const LABEL_BG    = '#1e293b';
    const LABEL_COLOR = '#94a3b8';
    const HEADER_COLOR = '#64748b';

    const labelWidth   = 200;
    const headerHeight = 140;
    const padding      = 12;
    const containerW   = canvas.parentElement?.clientWidth || 900;

    const uniqueCategories = [...new Set(heatmapData.map(d => d.category))];
    const uniqueDomains    = [...new Set(heatmapData.map(d => d.domain))];

    if (heatmapData.length === 0) {
      canvas.width  = containerW;
      canvas.height = 120;
      ctx.fillStyle = CANVAS_BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#64748b';
      ctx.font = '14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No answers yet — complete the assessment to see the heatmap.', canvas.width / 2, 60);
      return;
    }

    const availW       = containerW - labelWidth - padding * 2;
    const cellWidth    = Math.max(50, Math.min(110, availW / uniqueCategories.length));
    const cellHeight   = Math.max(32, Math.min(48, 400 / uniqueDomains.length));

    canvas.width  = labelWidth + uniqueCategories.length * cellWidth + padding * 2;
    canvas.height = headerHeight + uniqueDomains.length * cellHeight + padding * 2;

    // Background
    ctx.fillStyle = CANVAS_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Domain label column background
    ctx.fillStyle = LABEL_BG;
    ctx.fillRect(0, 0, labelWidth, canvas.height);

    // Column headers (categories — rotated)
    ctx.save();
    uniqueCategories.forEach((cat, i) => {
      const x = labelWidth + i * cellWidth + padding + cellWidth / 2;
      const y = headerHeight - 10;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = HEADER_COLOR;
      ctx.font = '10px system-ui, sans-serif';
      ctx.textAlign = 'left';
      let text = cat;
      if (ctx.measureText(text).width > cellWidth * 2) {
        while (ctx.measureText(text + '…').width > cellWidth * 2 && text.length > 2) {
          text = text.slice(0, -1);
        }
        text += '…';
      }
      ctx.fillText(text, 0, 0);
      ctx.restore();
    });
    ctx.restore();

    // Row labels + cells
    uniqueDomains.forEach((domain, row) => {
      const y = headerHeight + row * cellHeight + padding;

      // Domain label
      ctx.fillStyle = LABEL_COLOR;
      ctx.textAlign = 'right';
      ctx.font = 'bold 11px system-ui, sans-serif';
      let domText = domain;
      if (ctx.measureText(domText).width > labelWidth - 12) {
        while (ctx.measureText(domText + '…').width > labelWidth - 12 && domText.length > 2) {
          domText = domText.slice(0, -1);
        }
        domText += '…';
      }
      ctx.fillText(domText, labelWidth - 8, y + cellHeight / 2 + 4);

      // Cells
      uniqueCategories.forEach((cat, col) => {
        const x = labelWidth + col * cellWidth + padding;
        const dp = heatmapData.find(d => d.domain === domain && d.category === cat);

        if (dp) {
          const { bg, text } = getCellStyle(dp.score);

          // Cell bg
          ctx.fillStyle = bg;
          ctx.beginPath();
          ctx.roundRect?.(x + 1, y + 1, cellWidth - 3, cellHeight - 3, 4);
          ctx.fill();

          // Score value
          ctx.fillStyle = text;
          ctx.textAlign = 'center';
          ctx.font = `bold ${cellHeight > 36 ? 13 : 11}px system-ui, sans-serif`;
          ctx.fillText(dp.score.toFixed(1), x + cellWidth / 2, y + cellHeight / 2 - 1);

          // Completion sub-label
          if (cellHeight >= 36) {
            ctx.font = '9px system-ui, sans-serif';
            ctx.fillStyle = text.replace(')', ', 0.65)').replace('rgb', 'rgba');
            ctx.fillText(`${dp.answered}/${dp.total}`, x + cellWidth / 2, y + cellHeight / 2 + 10);
          }
        } else {
          // Empty cell indicator
          ctx.fillStyle = 'rgba(148, 163, 184, 0.06)';
          ctx.fillRect(x + 1, y + 1, cellWidth - 3, cellHeight - 3);
        }
      });
    });

  }, [domains, answers, hiddenDomains]);

  if (!domains || Object.keys(domains).length === 0) {
    return (
      <div className="heatmap-empty" data-testid="heatmap-empty">
        <p>No domain data available for heatmap</p>
      </div>
    );
  }

  return (
    <div className="heatmap-container" data-testid="domain-heatmap">
      <div className="heatmap-header">
        <h3>Assessment Heatmap</h3>
        <p>Average maturity score per domain &amp; category</p>
      </div>
      <div className="heatmap-canvas-wrapper">
        <canvas ref={canvasRef} />
      </div>
      <div className="heatmap-legend">
        <span className="legend-label">Score:</span>
        <div className="legend-gradient">
          <span className="legend-min">1 Low</span>
          <div className="gradient-bar"></div>
          <span className="legend-max">5 High</span>
        </div>
      </div>
    </div>
  );
};

DomainHeatmap.propTypes = {
  domains: PropTypes.object.isRequired,
  answers: PropTypes.object.isRequired,
  hiddenDomains: PropTypes.instanceOf(Set),
  onCanvasReady: PropTypes.func
};

export default DomainHeatmap;
