import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { DomainHeatmap } from './DomainHeatmap';
import { getCellStyle } from './DomainHeatmap';

// The global ResizeObserver mock from setup.js uses an arrow-function factory,
// which cannot be invoked with `new`.  Replace it with a class-based mock so the
// component's `useEffect` can construct one without throwing.
beforeEach(() => {
  globalThis.ResizeObserver = vi.fn().mockImplementation(function () {
    this.observe = vi.fn();
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();
  });
});

const makeDomains = () => ({
  domain1: {
    title: 'Data Governance',
    categories: {
      cat1: {
        title: 'Policy Management',
        questions: [
          { id: 'q1', text: 'Question 1' },
          { id: 'q2', text: 'Question 2' },
        ],
      },
      cat2: {
        title: 'Data Quality',
        questions: [
          { id: 'q3', text: 'Question 3' },
        ],
      },
    },
  },
  domain2: {
    title: 'Data Architecture',
    categories: {
      cat3: {
        title: 'Modeling',
        questions: [
          { id: 'q4', text: 'Question 4' },
        ],
      },
    },
  },
});

describe('getCellStyle', () => {
  it('returns red for score < 1.5', () => {
    const style = getCellStyle(1.0);
    expect(style.bg).toBe('rgb(153, 27, 27)');
    expect(style.text).toBe('#fca5a5');
  });

  it('returns red at boundary score 0', () => {
    const style = getCellStyle(0);
    expect(style.bg).toBe('rgb(153, 27, 27)');
  });

  it('returns orange for score >= 1.5 and < 2.5', () => {
    const style = getCellStyle(1.5);
    expect(style.bg).toBe('rgb(146, 64, 14)');
    expect(style.text).toBe('#fed7aa');
  });

  it('returns orange for score 2.4', () => {
    const style = getCellStyle(2.4);
    expect(style.bg).toBe('rgb(146, 64, 14)');
  });

  it('returns amber for score >= 2.5 and < 3.0', () => {
    const style = getCellStyle(2.5);
    expect(style.bg).toBe('rgb(113, 63, 18)');
    expect(style.text).toBe('#fde68a');
  });

  it('returns amber for score 2.9', () => {
    const style = getCellStyle(2.9);
    expect(style.bg).toBe('rgb(113, 63, 18)');
  });

  it('returns green for score >= 3.0 and < 3.5', () => {
    const style = getCellStyle(3.0);
    expect(style.bg).toBe('rgb(20,  83,  45)');
    expect(style.text).toBe('#86efac');
  });

  it('returns teal for score >= 3.5 and < 4.5', () => {
    const style = getCellStyle(3.5);
    expect(style.bg).toBe('rgb(6,   78,  59)');
    expect(style.text).toBe('#6ee7b7');
  });

  it('returns teal for score 4.4', () => {
    const style = getCellStyle(4.4);
    expect(style.bg).toBe('rgb(6,   78,  59)');
  });

  it('returns deep green for score >= 4.5', () => {
    const style = getCellStyle(4.5);
    expect(style.bg).toBe('rgb(5,   46,  22)');
    expect(style.text).toBe('#86efac');
  });

  it('returns deep green for score 5', () => {
    const style = getCellStyle(5);
    expect(style.bg).toBe('rgb(5,   46,  22)');
  });
});

describe('DomainHeatmap', () => {
  it('renders "No domain data available" when domains is empty object', () => {
    render(<DomainHeatmap domains={{}} answers={{}} />);
    expect(screen.getByText(/No domain data available/i)).toBeInTheDocument();
    expect(screen.getByTestId('heatmap-empty')).toBeInTheDocument();
  });

  it('renders "No domain data available" when domains is null', () => {
    // Suppress PropTypes console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<DomainHeatmap domains={null} answers={{}} />);
    expect(screen.getByText(/No domain data available/i)).toBeInTheDocument();
    expect(screen.getByTestId('heatmap-empty')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('renders heatmap-container with data-testid="domain-heatmap" when valid domains provided', () => {
    render(<DomainHeatmap domains={makeDomains()} answers={{ q1: 3 }} />);
    expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
    expect(screen.getByTestId('domain-heatmap')).toHaveClass('heatmap-container');
  });

  it('canvas has role="img" and aria-label', () => {
    render(<DomainHeatmap domains={makeDomains()} answers={{ q1: 3 }} />);
    const canvas = screen.getByRole('img');
    expect(canvas.tagName).toBe('CANVAS');
    expect(canvas).toHaveAttribute('aria-label', expect.stringContaining('heatmap'));
  });

  it('renders heatmap-header with title and description', () => {
    render(<DomainHeatmap domains={makeDomains()} answers={{ q1: 3 }} />);
    expect(screen.getByText('Assessment Heatmap')).toBeInTheDocument();
    expect(screen.getByText(/Average maturity score per domain/)).toBeInTheDocument();
  });

  it('renders legend section', () => {
    render(<DomainHeatmap domains={makeDomains()} answers={{ q1: 3 }} />);
    expect(screen.getByText('Score:')).toBeInTheDocument();
    expect(screen.getByText('1 Low')).toBeInTheDocument();
    expect(screen.getByText('5 High')).toBeInTheDocument();
  });

  it('calls onCanvasReady with canvas element when provided', () => {
    const onCanvasReady = vi.fn();
    render(<DomainHeatmap domains={makeDomains()} answers={{ q1: 3 }} onCanvasReady={onCanvasReady} />);
    expect(onCanvasReady).toHaveBeenCalledTimes(1);
    expect(onCanvasReady).toHaveBeenCalledWith(expect.any(HTMLCanvasElement));
  });

  it('does not crash when answers is empty', () => {
    render(<DomainHeatmap domains={makeDomains()} answers={{}} />);
    expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
    // Canvas should still be rendered even though no data to draw
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  describe('hiddenDomains filtering', () => {
    function renderHeatmapWithFillText(domains, answers, extras = {}) {
      const fillTextCalls = [];
      const mockCtx = {
        fillRect: vi.fn(), clearRect: vi.fn(), save: vi.fn(), restore: vi.fn(),
        beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), closePath: vi.fn(),
        stroke: vi.fn(), fill: vi.fn(),
        fillText: vi.fn((...args) => fillTextCalls.push(args)),
        measureText: vi.fn(() => ({ width: 50 })),
        roundRect: vi.fn(), textAlign: '', fillStyle: '', font: '',
      };
      const origGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx);
      try {
        render(<DomainHeatmap domains={domains} answers={answers} {...extras} />);
      } finally {
        HTMLCanvasElement.prototype.getContext = origGetContext;
      }
      return fillTextCalls;
    }

    it('should not render hidden domain labels on canvas', () => {
      const hidden = new Set(['domain1']);
      const fillTextCalls = renderHeatmapWithFillText(
        makeDomains(),
        { q1: 3, q2: 4, q3: 2, q4: 5 },
        { hiddenDomains: hidden }
      );
      const texts = fillTextCalls.map(([text]) => text);
      expect(texts).not.toContain('Data Governance');
      expect(texts.some(t => typeof t === 'string' && t.includes('Architecture'))).toBe(true);
    });

    it('should render all domain labels when hiddenDomains is an empty set', () => {
      const hidden = new Set();
      const fillTextCalls = renderHeatmapWithFillText(
        makeDomains(),
        { q1: 3, q2: 4, q3: 2, q4: 5 },
        { hiddenDomains: hidden }
      );
      const texts = fillTextCalls.map(([text]) => text);
      expect(texts.some(t => typeof t === 'string' && t.includes('Governance'))).toBe(true);
      expect(texts.some(t => typeof t === 'string' && t.includes('Architecture'))).toBe(true);
    });
  });

  describe('canvas drawing edge cases', () => {
    it('renders with long domain names that need truncation (lines 161-165)', () => {
      const longNameDomains = {
        domain1: {
          title: 'A Very Very Very Very Very Very Long Domain Name That Should Be Truncated In The Canvas Drawing',
          categories: {
            cat1: {
              title: 'Category',
              questions: [{ id: 'q1', text: 'Q1' }]
            }
          }
        }
      };
      render(<DomainHeatmap domains={longNameDomains} answers={{ q1: 3 }} />);
      expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
    });

    it('renders empty cells when a domain-category combination has no answers (lines 200-207)', () => {
      // domain1 has two categories but only one is answered,
      // domain2 has a category with answers. This creates empty cells.
      const domains = makeDomains();
      // q1 answered, q3 not answered -> cat2 row exists for domain1 but no cell for cat3
      // domain2/cat3 answered, but domain2 has no cat1/cat2 -> empty cells
      render(
        <DomainHeatmap
          domains={domains}
          answers={{ q1: 3, q4: 5 }}
        />
      );
      expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
    });

    it('renders with all answers provided (ensures cells with completion sub-labels)', () => {
      render(
        <DomainHeatmap
          domains={makeDomains()}
          answers={{ q1: 4.5, q2: 1.0, q3: 2.8, q4: 3.5 }}
        />
      );
      expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
    });

    it('renders categories with empty questions array', () => {
      const domainsWithEmpty = {
        domain1: {
          title: 'Domain',
          categories: {
            cat1: {
              title: 'Cat 1',
              questions: []
            },
            cat2: {
              title: 'Cat 2',
              questions: [{ id: 'q1', text: 'Q1' }]
            }
          }
        }
      };
      render(<DomainHeatmap domains={domainsWithEmpty} answers={{ q1: 3 }} />);
      expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
    });
  });

  describe('ResizeObserver callback (line 25)', () => {
    it('triggers wrapperWidth state update when ResizeObserver fires', () => {
      let observerCallback;
      globalThis.ResizeObserver = vi.fn().mockImplementation(function (cb) {
        observerCallback = cb;
        this.observe = vi.fn();
        this.unobserve = vi.fn();
        this.disconnect = vi.fn();
      });

      render(
        <DomainHeatmap
          domains={makeDomains()}
          answers={{ q1: 3, q2: 4, q3: 2, q4: 5 }}
        />
      );
      expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();

      // Fire the ResizeObserver callback to trigger setWrapperWidth (line 25)
      expect(observerCallback).toBeDefined();
      act(() => {
        observerCallback([{ contentRect: { width: 800 } }]);
      });

      // The component should still render correctly after resize
      expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
    });
  });

  describe('canvas text truncation branches', () => {
    /**
     * Helper: Override getContext to return a ctx whose measureText
     * returns a configurable width, allowing us to trigger truncation branches.
     */
    function renderWithMeasureText(domains, answers, measureWidth, extras = {}) {
      const fillTextCalls = [];
      const mockCtx = {
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        fillText: vi.fn((...args) => fillTextCalls.push(args)),
        measureText: typeof measureWidth === 'function'
          ? vi.fn(measureWidth)
          : vi.fn(() => ({ width: measureWidth })),
        roundRect: vi.fn(),
        textAlign: '',
        fillStyle: '',
        font: '',
      };

      const origGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx);

      try {
        render(
          <DomainHeatmap
            domains={domains}
            answers={answers}
            {...extras}
          />
        );
      } finally {
        HTMLCanvasElement.prototype.getContext = origGetContext;
      }

      return { mockCtx, fillTextCalls };
    }

    it('truncates single-line category header when text is too wide (lines 143-146)', () => {
      // A single word category name — stays on one line. measureText returns
      // a width that exceeds cellWidth so the while-loop truncation fires.
      const domains = {
        d1: {
          title: 'Dom',
          categories: {
            c1: {
              title: 'Supercalifragilisticexpialidocious',
              questions: [{ id: 'q1', text: 'Q' }]
            }
          }
        }
      };
      // measureText always returns 9999 → every text is "too wide"
      const { fillTextCalls } = renderWithMeasureText(domains, { q1: 3 }, 9999);
      expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
      // Should have a truncated header ending with '…'
      const truncated = fillTextCalls.find(([text]) => typeof text === 'string' && text.endsWith('…'));
      expect(truncated).toBeDefined();
    });

    it('splits category header into two lines when words overflow (lines 125, 137-138)', () => {
      // Category title with multiple words — first word fits, second overflows
      // to line2. measureText returns width proportional to text length so
      // the first word fits but 'first second' does not.
      const domains = {
        d1: {
          title: 'D',
          categories: {
            c1: {
              title: 'First Second',
              questions: [{ id: 'q1', text: 'Q' }]
            }
          }
        }
      };

      // When measuring: short text fits, long text doesn't.
      // cellWidth defaults to around 110 max → maxW = cellWidth - 6 ≈ 104
      // We make measureText return text.length * 15 so 'First' (5*15=75) fits
      // but 'First Second' (12*15=180) does not.
      const { fillTextCalls } = renderWithMeasureText(
        domains,
        { q1: 3 },
        (text) => ({ width: text.length * 15 })
      );
      expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
      // Should have fillText calls for both line1='First' and line2='Second'
      const firstLine = fillTextCalls.find(([text]) => text === 'First');
      const secondLine = fillTextCalls.find(([text]) => text === 'Second');
      expect(firstLine).toBeDefined();
      expect(secondLine).toBeDefined();
    });

    it('truncates line2 when it is too wide (lines 130-133)', () => {
      // Category with 3+ words where line2 accumulates multiple words and
      // exceeds maxW, triggering the line2 truncation while-loop.
      const domains = {
        d1: {
          title: 'D',
          categories: {
            c1: {
              title: 'A Longcategorysecondword Longcategorythirdword',
              questions: [{ id: 'q1', text: 'Q' }]
            }
          }
        }
      };

      // measureText: anything over 8 chars is too wide
      // 'A' (1 char) fits as line1
      // 'A Longcategorysecondword' (24 chars * 15 = 360) > maxW → 'Longcategorysecondword' goes to line2
      // then 'Longcategorythirdword' also goes to line2 → line2 = 'Longcategorysecondword Longcategorythirdword'
      // That line2 is measured as too wide → truncation loop
      const { fillTextCalls } = renderWithMeasureText(
        domains,
        { q1: 3 },
        (text) => ({ width: text.length * 15 })
      );
      expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
      // line2 should be truncated (ends with '…')
      const truncatedLine2 = fillTextCalls.find(
        ([text]) => typeof text === 'string' && text.endsWith('…') && text !== 'A'
      );
      expect(truncatedLine2).toBeDefined();
    });

    it('truncates domain label when text exceeds labelWidth (lines 162-165)', () => {
      const domains = {
        d1: {
          title: 'Very Long Domain Name That Should Be Truncated',
          categories: {
            c1: {
              title: 'Cat',
              questions: [{ id: 'q1', text: 'Q' }]
            }
          }
        }
      };
      // measureText returns large width so domain label exceeds labelWidth - 12
      const { fillTextCalls } = renderWithMeasureText(domains, { q1: 3 }, 9999);
      expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
      // Domain label should be truncated (ends with '…')
      const truncatedDomain = fillTextCalls.find(
        ([text]) => typeof text === 'string' && text.endsWith('…')
      );
      expect(truncatedDomain).toBeDefined();
    });

    it('handles line2 already populated when third+ word overflows (line 125 else-branch)', () => {
      // Need: line1 = first word, line2 = second word (overflows from line1),
      // then third word also overflows → line2 = 'second third' (line2 already truthy)
      const domains = {
        d1: {
          title: 'D',
          categories: {
            c1: {
              // 4 words: 'W' fits line1, 'XX' overflows to line2, 'YY' appends to line2, 'ZZ' also appends
              title: 'W XX YY ZZ',
              questions: [{ id: 'q1', text: 'Q' }]
            }
          }
        }
      };

      // 'W' = 1 char → width 15, fits
      // 'W XX' = 4 chars → width 60, might still fit depending on maxW
      // We need 'W XX' to exceed maxW. With cellWidth ~110, maxW=104.
      // text.length * 20: 'W'=20 fits, 'W XX'=80 fits... let's use * 30
      // 'W'=30 fits, 'W XX'=120 > 104 → 'XX' goes to line2
      // line2='XX', next word 'YY' → line2='XX YY', next word 'ZZ' → line2='XX YY ZZ'
      // line2 width = 'XX YY ZZ'.length * 30 = 240 > 104 → truncation
      const { fillTextCalls } = renderWithMeasureText(
        domains,
        { q1: 3 },
        (text) => ({ width: text.length * 30 })
      );
      expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
      // line1 should be 'W', and line2 should be truncated version of 'XX YY ZZ'
      const line1Call = fillTextCalls.find(([text]) => text === 'W');
      expect(line1Call).toBeDefined();
      // truncated line2
      const truncatedLine2 = fillTextCalls.find(
        ([text]) => typeof text === 'string' && text.endsWith('…') && text !== 'W'
      );
      expect(truncatedLine2).toBeDefined();
    });
  });

  describe('domain with missing categories/questions (lines 46-47)', () => {
    it('handles domain with no categories property (line 46 fallback)', () => {
      const domains = {
        d1: {
          title: 'Domain Without Categories'
          // categories is undefined → || {} fallback
        },
        d2: {
          title: 'Normal Domain',
          categories: {
            c1: {
              title: 'Cat',
              questions: [{ id: 'q1', text: 'Q' }]
            }
          }
        }
      };
      render(<DomainHeatmap domains={domains} answers={{ q1: 3 }} />);
      expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
    });

    it('handles category with no questions property (line 47 fallback)', () => {
      const domains = {
        d1: {
          title: 'Domain',
          categories: {
            c1: {
              title: 'Category Without Questions'
              // questions is undefined → || [] fallback
            },
            c2: {
              title: 'Normal Category',
              questions: [{ id: 'q1', text: 'Q' }]
            }
          }
        }
      };
      render(<DomainHeatmap domains={domains} answers={{ q1: 3 }} />);
      expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
    });
  });

  describe('cell sizing branches (lines 159, 186-205)', () => {
    it('uses labelWidth >= 120 font size (11px) when container is wide (line 159)', () => {
      // labelWidth = min(200, max(80, floor(containerW * 0.3)))
      // For labelWidth >= 120: containerW * 0.3 >= 120 → containerW >= 400
      // Set clientWidth = 600 → labelWidth = min(200, max(80, 180)) = 180 >= 120
      const domains = {
        d1: {
          title: 'Domain',
          categories: {
            c1: {
              title: 'Cat',
              questions: [{ id: 'q1', text: 'Q' }]
            }
          }
        }
      };

      const fillTextCalls = [];
      const fontSettings = [];
      const mockCtx = {
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        fillText: vi.fn((...args) => fillTextCalls.push(args)),
        measureText: vi.fn(() => ({ width: 0 })),
        roundRect: vi.fn(),
        textAlign: '',
        fillStyle: '',
        _font: '',
        get font() { return this._font; },
        set font(v) { this._font = v; fontSettings.push(v); },
      };

      const origGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx);

      try {
        render(<DomainHeatmap domains={domains} answers={{ q1: 3 }} />);
        // The canvas parentElement clientWidth is 0 in jsdom by default,
        // so containerW falls back to 900, labelWidth = min(200, max(80, 270)) = 200.
        // 200 >= 120 → should use 11px.
        // Check the font was set with 11px for domain labels
        const boldFonts = fontSettings.filter(f => f.includes('bold') && f.includes('system-ui'));
        const has11px = boldFonts.some(f => f.includes('11px'));
        expect(has11px).toBe(true);
      } finally {
        HTMLCanvasElement.prototype.getContext = origGetContext;
      }
    });

    it('uses labelWidth < 120 font size (9px) when container is narrow (line 159)', () => {
      const domains = {
        d1: {
          title: 'Domain',
          categories: {
            c1: {
              title: 'Cat',
              questions: [{ id: 'q1', text: 'Q' }]
            }
          }
        }
      };

      const fontSettings = [];
      const mockCtx = {
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn(() => ({ width: 0 })),
        roundRect: vi.fn(),
        textAlign: '',
        fillStyle: '',
        _font: '',
        get font() { return this._font; },
        set font(v) { this._font = v; fontSettings.push(v); },
      };

      const origGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx);

      // Temporarily override clientWidth on HTMLElement.prototype to return 300.
      // containerW = 300 → labelWidth = min(200, max(80, floor(90))) = 90 < 120 → 9px font
      const clientWidthDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        get: () => 300,
        configurable: true,
      });

      try {
        render(<DomainHeatmap domains={domains} answers={{ q1: 3 }} />);
        expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
        // labelWidth = 90 < 120 → should use 9px bold font for domain labels
        const has9pxBold = fontSettings.some(f => f.includes('bold 9px'));
        expect(has9pxBold).toBe(true);
      } finally {
        HTMLCanvasElement.prototype.getContext = origGetContext;
        if (clientWidthDesc) {
          Object.defineProperty(HTMLElement.prototype, 'clientWidth', clientWidthDesc);
        }
      }
    });

    it('renders narrow cells (cellWidth < 45) with many categories (lines 186, 189)', () => {
      // cellWidth = max(32, min(110, floor(availW / numCats)))
      // availW = containerW - labelWidth - padding * 2 = 900 - 200 - 24 = 676
      // For cellWidth < 45: floor(676 / numCats) < 45 → numCats > 15
      // With 16+ categories, cellWidth = max(32, floor(676/16)) = max(32, 42) = 42 < 45
      const cats = {};
      const answers = {};
      for (let i = 0; i < 16; i++) {
        cats[`c${i}`] = {
          title: `C${i}`,
          questions: [{ id: `q${i}`, text: `Q${i}` }]
        };
        answers[`q${i}`] = 3;
      }
      const domains = {
        d1: {
          title: 'Domain',
          categories: cats
        }
      };

      const fillTextCalls = [];
      const mockCtx = {
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        fillText: vi.fn((...args) => fillTextCalls.push(args)),
        measureText: vi.fn(() => ({ width: 0 })),
        roundRect: vi.fn(),
        textAlign: '',
        fillStyle: '',
        font: '',
      };

      const origGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx);

      try {
        render(<DomainHeatmap domains={domains} answers={answers} />);
        expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
        // With cellWidth < 45, score should be displayed as integer (Math.round)
        // Score is 3 for all, so we expect '3' (integer) not '3.0'
        const scoreCalls = fillTextCalls.filter(([text]) => text === '3');
        expect(scoreCalls.length).toBeGreaterThan(0);
      } finally {
        HTMLCanvasElement.prototype.getContext = origGetContext;
      }
    });

    it('renders short cells (cellHeight < 36) with many domains (line 205)', () => {
      // cellHeight = max(32, min(48, floor(400 / numDomains)))
      // For cellHeight < 36: floor(400 / numDomains) < 36 → numDomains > 11
      // With 12+ domains, cellHeight = max(32, floor(400/12)) = max(32, 33) = 33 < 36
      const domains = {};
      const answers = {};
      // Create 13 domains, each with 2 categories. Only answer one cat per domain
      // to create empty cells (for the line 205 branch).
      for (let i = 0; i < 13; i++) {
        domains[`d${i}`] = {
          title: `Domain ${i}`,
          categories: {
            cA: {
              title: 'Cat A',
              questions: [{ id: `q${i}a`, text: `Q${i}a` }]
            },
            cB: {
              title: 'Cat B',
              questions: [{ id: `q${i}b`, text: `Q${i}b` }]
            }
          }
        };
        // Only answer cat A questions, so cat B cells are empty for some domains
        answers[`q${i}a`] = 3;
      }
      // But to create empty cells (dp not found), we need a domain/category combo
      // that appears in uniqueCategories but doesn't have data for that domain.
      // All domains have both Cat A and Cat B, but only Cat A is answered.
      // So Cat B will have empty cells for all domains.

      // Actually wait - if q{i}b is not answered, then that domain-category combo
      // won't appear in heatmapData, but Cat B won't appear in uniqueCategories either
      // unless at least one domain has Cat B answered.
      // Let's answer one Cat B:
      answers['q0b'] = 4;

      const fontSettings = [];
      const mockCtx = {
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn(() => ({ width: 0 })),
        roundRect: vi.fn(),
        textAlign: '',
        fillStyle: '',
        _font: '',
        get font() { return this._font; },
        set font(v) { this._font = v; fontSettings.push(v); },
      };

      const origGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx);

      try {
        render(<DomainHeatmap domains={domains} answers={answers} />);
        expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
        // cellHeight < 36 → empty cell font should use 10px (not 12px)
        const smallFonts = fontSettings.filter(f => f === '10px system-ui, sans-serif');
        expect(smallFonts.length).toBeGreaterThan(0);
      } finally {
        HTMLCanvasElement.prototype.getContext = origGetContext;
      }
    });

    it('renders cells with cellHeight > 36 triggering 13px score font (line 186)', () => {
      // cellHeight = max(32, min(48, floor(400 / numDomains)))
      // For cellHeight > 36: floor(400/numDomains) > 36 → numDomains < 11
      // With 2 domains: cellHeight = min(48, 200) = 48 > 36
      // Also need cellWidth >= 45 (default with few categories is 110)
      // This exercises: scoreFontSize = cellHeight > 36 ? 13 : 11
      const domains = {
        d1: {
          title: 'Domain One',
          categories: {
            c1: {
              title: 'Cat',
              questions: [{ id: 'q1', text: 'Q' }]
            }
          }
        },
        d2: {
          title: 'Domain Two',
          categories: {
            c1: {
              title: 'Cat',
              questions: [{ id: 'q2', text: 'Q' }]
            }
          }
        }
      };

      const fontSettings = [];
      const fillTextCalls = [];
      const mockCtx = {
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        fillText: vi.fn((...args) => fillTextCalls.push(args)),
        measureText: vi.fn(() => ({ width: 0 })),
        roundRect: vi.fn(),
        textAlign: '',
        fillStyle: '',
        _font: '',
        get font() { return this._font; },
        set font(v) { this._font = v; fontSettings.push(v); },
      };

      const origGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx);

      try {
        render(<DomainHeatmap domains={domains} answers={{ q1: 3, q2: 4 }} />);
        expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
        // Should have 13px bold font for score (cellHeight=48>36, cellWidth=110>=45)
        const has13px = fontSettings.some(f => f.includes('bold 13px'));
        expect(has13px).toBe(true);
        // Should also have completion sub-label ('9px system-ui')
        const has9px = fontSettings.some(f => f === '9px system-ui, sans-serif');
        expect(has9px).toBe(true);
      } finally {
        HTMLCanvasElement.prototype.getContext = origGetContext;
      }
    });

    it('renders narrow cells without sub-label (cellWidth < 45, lines 190, 193)', () => {
      // When cellWidth < 45, no sub-label is shown (line 193 condition is false)
      // and line 190 uses 0 offset instead of 1
      const cats = {};
      const answers = {};
      for (let i = 0; i < 20; i++) {
        cats[`c${i}`] = {
          title: `C${i}`,
          questions: [{ id: `q${i}`, text: `Q${i}` }]
        };
        answers[`q${i}`] = 2.7;
      }
      const domains = {
        d1: {
          title: 'Domain',
          categories: cats
        }
      };

      const fontSettings = [];
      const mockCtx = {
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn(() => ({ width: 0 })),
        roundRect: vi.fn(),
        textAlign: '',
        fillStyle: '',
        _font: '',
        get font() { return this._font; },
        set font(v) { this._font = v; fontSettings.push(v); },
      };

      const origGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx);

      try {
        render(<DomainHeatmap domains={domains} answers={answers} />);
        expect(screen.getByTestId('domain-heatmap')).toBeInTheDocument();
        // cellWidth < 45 → scoreFontSize = 10, no 9px sub-label
        const has10pxBold = fontSettings.some(f => f.includes('bold 10px'));
        expect(has10pxBold).toBe(true);
        // Should NOT have 9px sub-label font since cellWidth < 45
        // (The 9px would only appear for completion sub-labels, not header 10px)
        const sub9px = fontSettings.filter(f => f === '9px system-ui, sans-serif');
        expect(sub9px.length).toBe(0);
      } finally {
        HTMLCanvasElement.prototype.getContext = origGetContext;
      }
    });
  });
});
