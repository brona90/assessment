import { describe, it, expect } from 'vitest';
import {
  CHART_COLORS,
  darkGridColor,
  darkTickColor,
  darkTitleColor,
  darkLegendColor,
  darkTooltip,
  darkLegend,
  darkScaleY,
  darkScaleX,
  darkScaleR
} from './chartTheme';

describe('chartTheme', () => {
  it('should export CHART_COLORS with correct color values', () => {
    expect(CHART_COLORS.userScore.border).toBe('#22c55e');
    expect(CHART_COLORS.userScore.fill).toBe('rgba(34, 197, 94, 0.25)');
    expect(CHART_COLORS.industryAvg.border).toBe('#f59e0b');
    expect(CHART_COLORS.topQuartile.border).toBe('#10b981');
    expect(CHART_COLORS.target.border).toBe('rgba(168, 85, 247, 0.65)');
  });

  it('should export color constants as strings', () => {
    expect(typeof darkGridColor).toBe('string');
    expect(typeof darkTickColor).toBe('string');
    expect(typeof darkTitleColor).toBe('string');
    expect(typeof darkLegendColor).toBe('string');
  });

  it('should export darkLegend with bottom position', () => {
    expect(darkLegend.position).toBe('bottom');
    expect(darkLegend.labels.color).toBe(darkLegendColor);
  });

  describe('darkTooltip callback', () => {
    it('should format label with y value when parsed.y is available', () => {
      const ctx = {
        dataset: { label: 'Industry Avg' },
        parsed: { y: 3.456 }
      };
      const result = darkTooltip.callbacks.label(ctx);
      expect(result).toBe(' Industry Avg: 3.46');
    });

    it('should format label with r value when parsed.y is missing (radar chart)', () => {
      const ctx = {
        dataset: { label: 'Your Score' },
        parsed: { r: 4.123 }
      };
      const result = darkTooltip.callbacks.label(ctx);
      expect(result).toBe(' Your Score: 4.12');
    });

    it('should default to 0 when neither parsed.y nor parsed.r is available', () => {
      const ctx = {
        dataset: { label: 'Test' },
        parsed: {}
      };
      const result = darkTooltip.callbacks.label(ctx);
      expect(result).toBe(' Test: 0.00');
    });

    it('should handle undefined parsed gracefully', () => {
      const ctx = {
        dataset: { label: 'Test' },
        parsed: undefined
      };
      const result = darkTooltip.callbacks.label(ctx);
      expect(result).toBe(' Test: 0.00');
    });
  });

  describe('darkScaleY', () => {
    it('should return scale config with default min/max', () => {
      const scale = darkScaleY();
      expect(scale.min).toBe(0);
      expect(scale.max).toBe(5);
      expect(scale.grid.color).toBe(darkGridColor);
    });

    it('should accept custom min/max', () => {
      const scale = darkScaleY(1, 10);
      expect(scale.min).toBe(1);
      expect(scale.max).toBe(10);
    });
  });

  describe('darkScaleX', () => {
    it('should return scale config with grid colors', () => {
      const scale = darkScaleX();
      expect(scale.grid.color).toBe(darkGridColor);
      expect(scale.ticks.color).toBe(darkTickColor);
    });
  });

  describe('darkScaleR', () => {
    it('should return radar scale config with beginAtZero', () => {
      const scale = darkScaleR();
      expect(scale.beginAtZero).toBe(true);
      expect(scale.max).toBe(5);
      expect(scale.ticks.backdropColor).toBe('transparent');
    });
  });
});
