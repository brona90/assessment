import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './DomainHeatmap.css';

export const DomainHeatmap = ({ domains, answers }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !domains || Object.keys(domains).length === 0) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Prepare data structure
    const heatmapData = [];
    const domainList = Object.values(domains);
    
    domainList.forEach(domain => {
      const categories = Object.values(domain.categories || {});
      categories.forEach(category => {
        const questions = category.questions || [];
        if (questions.length > 0) {
          // Calculate average score for this category
          let totalScore = 0;
          let answeredCount = 0;
          
          questions.forEach(q => {
            if (answers[q.id] !== undefined) {
              totalScore += answers[q.id];
              answeredCount++;
            }
          });
          
          // Only include categories with at least one answer
          if (answeredCount > 0) {
            const avgScore = totalScore / answeredCount;
            
            heatmapData.push({
              domain: domain.title,
              category: category.title,
              score: avgScore,
              answered: answeredCount,
              total: questions.length
            });
          }
        }
      });
    });

    if (heatmapData.length === 0) {
      // Draw empty state
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#666';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
      return;
    }

    // Get unique domains and categories (SWAPPED: categories on X-axis, domains on Y-axis)
    const uniqueCategories = [...new Set(heatmapData.map(d => d.category))];
    const uniqueDomains = [...new Set(heatmapData.map(d => d.domain))];
    
    // Calculate responsive cell sizes
    const labelWidth = 200; // Increased for domain names on left
    const headerHeight = 120; // Increased for rotated category names
    const padding = 10;
    
    // Get container width (or use a reasonable default)
    const containerWidth = canvas.parentElement?.clientWidth || 1000;
    const availableWidth = containerWidth - labelWidth - (padding * 2);
    
    // Calculate cell dimensions to fit container (categories on X-axis now)
    const maxCellWidth = 100;
    const minCellWidth = 50;
    const calculatedCellWidth = Math.max(minCellWidth, Math.min(maxCellWidth, availableWidth / uniqueCategories.length));
    
    const maxCellHeight = 45;
    const minCellHeight = 30;
    const calculatedCellHeight = Math.max(minCellHeight, Math.min(maxCellHeight, 500 / uniqueDomains.length));
    
    const cellWidth = calculatedCellWidth;
    const cellHeight = calculatedCellHeight;
    
    canvas.width = labelWidth + (uniqueCategories.length * cellWidth) + padding * 2;
    canvas.height = headerHeight + (uniqueDomains.length * cellHeight) + padding * 2;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Color scale function (0-5 scale)
    const getColor = (score) => {
      // Color gradient from red (0) to yellow (2.5) to green (5)
      if (score <= 2.5) {
        // Red to Yellow
        const ratio = score / 2.5;
        const r = 220;
        const g = Math.round(100 + (155 * ratio)); // 100 to 255
        const b = 100;
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        // Yellow to Green
        const ratio = (score - 2.5) / 2.5;
        const r = Math.round(220 - (120 * ratio)); // 220 to 100
        const g = 220;
        const b = 100;
        return `rgb(${r}, ${g}, ${b})`;
      }
    };
    
    // Draw column headers (categories on X-axis)
    ctx.save();
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    uniqueCategories.forEach((category, i) => {
      const x = labelWidth + (i * cellWidth) + padding;
      const y = headerHeight - 10; // Position near bottom of header area
      
      ctx.save();
      ctx.translate(x + cellWidth / 2, y);
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = '#333';
      // Truncate long category names
      const displayText = category.length > 30 ? category.substring(0, 27) + '...' : category;
      ctx.fillText(displayText, 0, 0);
      ctx.restore();
    });
    ctx.restore();
    
    // Draw row headers (domains on Y-axis) and cells
    ctx.font = '11px sans-serif';
    uniqueDomains.forEach((domain, rowIndex) => {
      const y = headerHeight + (rowIndex * cellHeight) + padding;
      
      // Draw domain label
      ctx.fillStyle = '#333';
      ctx.textAlign = 'right';
      ctx.font = 'bold 11px sans-serif';
      const displayDomain = domain.length > 28 ? domain.substring(0, 25) + '...' : domain;
      ctx.fillText(
        displayDomain,
        labelWidth - 5,
        y + cellHeight / 2 + 4
      );
      
      // Draw cells for this domain
      ctx.font = '11px sans-serif';
      uniqueCategories.forEach((category, colIndex) => {
        const x = labelWidth + (colIndex * cellWidth) + padding;
        
        // Find data for this domain-category combination
        const dataPoint = heatmapData.find(
          d => d.domain === domain && d.category === category
        );
        
        if (dataPoint) {
          // Draw cell background
          ctx.fillStyle = getColor(dataPoint.score);
          ctx.fillRect(x, y, cellWidth - 2, cellHeight - 2);
          
          // Draw cell border
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, cellWidth - 2, cellHeight - 2);
          
          // Draw score text
          ctx.fillStyle = '#000';
          ctx.textAlign = 'center';
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText(
            dataPoint.score.toFixed(1),
            x + cellWidth / 2,
            y + cellHeight / 2 - 2
          );
          
          // Draw completion text
          ctx.font = '9px sans-serif';
          ctx.fillStyle = '#333';
          ctx.fillText(
            `${dataPoint.answered}/${dataPoint.total}`,
            x + cellWidth / 2,
            y + cellHeight / 2 + 11
          );
        }
      });
    });
    
  }, [domains, answers]);

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
        <p>Average maturity scores by domain and category</p>
      </div>
      <div className="heatmap-canvas-wrapper">
        <canvas ref={canvasRef} />
      </div>
      <div className="heatmap-legend">
        <span className="legend-label">Score:</span>
        <div className="legend-gradient">
          <span className="legend-min">0 (Low)</span>
          <div className="gradient-bar"></div>
          <span className="legend-max">5 (High)</span>
        </div>
      </div>
    </div>
  );
};

DomainHeatmap.propTypes = {
  domains: PropTypes.object.isRequired,
  answers: PropTypes.object.isRequired
};

export default DomainHeatmap;