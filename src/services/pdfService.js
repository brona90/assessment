import { scoreCalculator } from '../utils/scoreCalculator';

// ─── Design tokens ────────────────────────────────────────────────────────────
const BRAND_BLUE   = [ 37,  99, 235];   // primary blue
const BRAND_NAVY   = [ 15,  23,  42];   // cover header bg
const BRAND_LIGHT  = [ 96, 165, 250];   // accent on dark
const TEXT_DARK    = [ 31,  41,  55];   // body text on white pages
const TEXT_MID     = [107, 114, 128];
const TEXT_LIGHT   = [156, 163, 175];
const SURFACE      = [248, 250, 252];   // card bg
const BORDER       = [226, 232, 240];

const PAGE_W  = 210; // A4 mm
const PAGE_H  = 297;
const MARGIN  = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;

// Maturity level colors (R,G,B)
const MATURITY_COLORS = {
  'Not Implemented': [239,  68,  68],
  'Initial':         [249, 115,  22],
  'Defined':         [234, 179,   8],
  'Managed':         [ 34, 197,  94],
  'Optimized':       [ 16, 185, 129]
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function setColor(pdf, rgb, type = 'text') {
  if (type === 'text')        pdf.setTextColor(...rgb);
  else if (type === 'draw')   pdf.setDrawColor(...rgb);
  else if (type === 'fill')   pdf.setFillColor(...rgb);
}

function hRule(pdf, y, { color = BORDER, width = 0.3 } = {}) {
  setColor(pdf, color, 'draw');
  pdf.setLineWidth(width);
  pdf.line(MARGIN, y, PAGE_W - MARGIN, y);
}

function fillRect(pdf, x, y, w, h, color) {
  setColor(pdf, color, 'fill');
  pdf.rect(x, y, w, h, 'F');
}

function scoreBar(pdf, x, y, score, { barH = 3, barW = 40, max = 5 } = {}) {
  const pct = Math.min(score / max, 1);
  const color = score >= 4 ? [34, 197, 94]
              : score >= 3 ? [234, 179, 8]
              : score >= 2 ? [249, 115, 22]
              : [239, 68, 68];

  fillRect(pdf, x, y, barW, barH, BORDER);
  fillRect(pdf, x, y, barW * pct, barH, color);
}

function sectionHeader(pdf, y, number, title) {
  fillRect(pdf, MARGIN, y - 5, CONTENT_W, 12, BRAND_BLUE);
  setColor(pdf, [255, 255, 255], 'text');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text(`${number}.  ${title}`, MARGIN + 4, y + 3);
  return y + 18;
}

function ensureSpace(pdf, y, needed, pageNum, totalPages) {
  if (y + needed > PAGE_H - MARGIN) {
    pageNum++;
    pdf.addPage();
    addPageFooter(pdf, pageNum, totalPages);
    return { y: MARGIN + 10, pageNum };
  }
  return { y, pageNum };
}

function addPageFooter(pdf, pageNum, totalPages) {
  setColor(pdf, TEXT_LIGHT, 'text');
  pdf.setFontSize(8);
  pdf.text('Technology Maturity Assessment Report', MARGIN, PAGE_H - 10);
  pdf.text(`Page ${pageNum} of ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 10, { align: 'right' });
  hRule(pdf, PAGE_H - 14, { color: BORDER, width: 0.2 });
}

function loadImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    if (url.startsWith('data:')) { resolve(url); return; }
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

/** Compute top N gaps sorted by priority (gap × domain weight) */
function computeTopGaps(domains, answers, limit = 10) {
  const gaps = [];
  for (const [, domain] of Object.entries(domains)) {
    for (const category of Object.values(domain.categories || {})) {
      for (const q of (category.questions || [])) {
        const ans = answers[q.id];
        if (ans === undefined || ans === 0) continue;
        const gap = 5 - ans;
        if (gap > 0) {
          gaps.push({
            text: q.text || q.id,
            domain: domain.title,
            ans,
            gap,
            priority: gap * (domain.weight || 1)
          });
        }
      }
    }
  }
  return gaps.sort((a, b) => b.priority - a.priority).slice(0, limit);
}

/** Auto-generated score interpretation paragraph */
function scoreInterpretation(score) {
  if (score >= 4.5) return 'The organisation demonstrates exemplary cybersecurity maturity. Processes are fully optimised, continuously monitored, and benchmarked against industry best practice.';
  if (score >= 3.5) return 'The organisation has well-managed security controls with consistent process execution. Minor enhancements in documentation and metrics would advance to the Optimized level.';
  if (score >= 2.5) return 'Security processes are defined and largely followed. Focus should be placed on consistent implementation, metrics collection, and closing the identified gaps below.';
  if (score >= 1.5) return 'Some initial controls are in place but implementation is inconsistent. A structured improvement programme is recommended, prioritising the critical gaps identified below.';
  return 'Security controls are largely absent or ad hoc. Immediate action is required to establish foundational controls across all domains.';
}

// ─── Main service ─────────────────────────────────────────────────────────────

export const pdfService = {
  getMaturityLevel(score) {
    return scoreCalculator.getMaturityLevel(score);
  },

  calculateDomainScore(domain, answers) {
    return scoreCalculator.calculateDomainScore(
      scoreCalculator.getAllQuestionsFromDomain(domain), answers
    );
  },

  calculateOverallScore(domains, answers) {
    return scoreCalculator.calculateOverallScore(domains, answers);
  },

  async generatePDF(domains, answers, evidence, complianceFrameworks, options = {}, comments = {}) {
    const { default: jsPDF } = await import('jspdf');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const { orgName = 'Organisation', reportTitle = 'Technology Maturity Assessment' } = options || {};

    // ── Pre-calculate data ──────────────────────────────────────────────────
    const overallScore = this.calculateOverallScore(domains, answers);
    const maturityLabel = this.getMaturityLevel(overallScore);
    const maturityColor = MATURITY_COLORS[maturityLabel] || BRAND_BLUE;

    const domainRows = Object.entries(domains).map(([key, domain]) => ({
      key, title: domain.title,
      score: this.calculateDomainScore(domain, answers),
      weight: domain.weight || 1
    }));

    const topGaps = computeTopGaps(domains, answers, 5);

    const totalPages = 3 + Math.ceil(domainRows.length / 3);

    // ────────────────────────────────────────────────────────────────────────
    // PAGE 1: Cover
    // ────────────────────────────────────────────────────────────────────────
    // Dark navy header band
    fillRect(pdf, 0, 0, PAGE_W, 65, BRAND_NAVY);
    // Blue accent strip
    fillRect(pdf, 0, 63, PAGE_W, 4, BRAND_BLUE);

    setColor(pdf, [255, 255, 255], 'text');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.text(reportTitle, MARGIN, 26);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(orgName, MARGIN, 40);

    pdf.setFontSize(10);
    setColor(pdf, BRAND_LIGHT, 'text');
    pdf.text(
      `Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      MARGIN, 54
    );

    // Score spotlight box
    let y = 82;
    fillRect(pdf, MARGIN, y, CONTENT_W, 52, SURFACE);
    setColor(pdf, [100, 116, 139], 'draw');
    pdf.setLineWidth(0.2);
    pdf.rect(MARGIN, y, CONTENT_W, 52);

    setColor(pdf, TEXT_MID, 'text');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('OVERALL MATURITY SCORE', MARGIN + 8, y + 10);

    setColor(pdf, maturityColor, 'text');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(38);
    pdf.text(`${overallScore.toFixed(2)}`, MARGIN + 8, y + 36);
    pdf.setFontSize(14);
    pdf.text('/ 5.0', MARGIN + 48, y + 36);

    setColor(pdf, maturityColor, 'fill');
    pdf.roundedRect(PAGE_W - MARGIN - 58, y + 18, 58, 16, 3, 3, 'F');
    setColor(pdf, [255, 255, 255], 'text');
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(maturityLabel, PAGE_W - MARGIN - 29, y + 28, { align: 'center' });

    // Domain summary table
    y = 150;
    setColor(pdf, TEXT_DARK, 'text');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text('Domain Scores', MARGIN, y);
    hRule(pdf, y + 3, { color: BRAND_BLUE, width: 0.5 });
    y += 12;

    for (const d of domainRows) {
      if (y > PAGE_H - MARGIN - 10) break;
      setColor(pdf, TEXT_DARK, 'text');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const label = d.score > 0 ? `${d.score.toFixed(2)} / 5.0  (${this.getMaturityLevel(d.score)})` : 'No data';
      pdf.text(d.title, MARGIN, y);
      setColor(pdf, TEXT_MID, 'text');
      pdf.text(label, PAGE_W - MARGIN, y, { align: 'right' });
      scoreBar(pdf, MARGIN, y + 2, d.score);
      y += 15;
    }

    addPageFooter(pdf, 1, totalPages);

    // ────────────────────────────────────────────────────────────────────────
    // PAGE 2: Executive Summary
    // ────────────────────────────────────────────────────────────────────────
    pdf.addPage();
    let pageNum = 2;
    addPageFooter(pdf, pageNum, totalPages);

    y = MARGIN;
    y = sectionHeader(pdf, y, 1, 'Executive Summary');

    // Score interpretation
    setColor(pdf, TEXT_DARK, 'text');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('Maturity Assessment', MARGIN, y);
    y += 8;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const interpText = scoreInterpretation(overallScore);
    const interpLines = pdf.splitTextToSize(interpText, CONTENT_W);
    setColor(pdf, TEXT_DARK, 'text');
    pdf.text(interpLines, MARGIN, y);
    y += interpLines.length * 5 + 10;

    // Maturity distribution
    setColor(pdf, TEXT_DARK, 'text');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('Maturity Distribution', MARGIN, y);
    y += 8;

    const levels = ['Not Implemented', 'Initial', 'Defined', 'Managed', 'Optimized'];
    const levelCounts = {};
    levels.forEach(l => { levelCounts[l] = 0; });

    for (const [, domain] of Object.entries(domains)) {
      for (const category of Object.values(domain.categories || {})) {
        for (const q of (category.questions || [])) {
          const ans = answers[q.id];
          if (ans && ans > 0) {
            const lv = this.getMaturityLevel(ans);
            if (lv in levelCounts) levelCounts[lv]++;
          }
        }
      }
    }

    const totalAnswered = Object.values(levelCounts).reduce((s, v) => s + v, 0);
    const barMaxW = CONTENT_W - 60;

    for (const level of levels) {
      const count = levelCounts[level];
      const pct = totalAnswered > 0 ? count / totalAnswered : 0;
      const color = MATURITY_COLORS[level] || TEXT_MID;

      setColor(pdf, TEXT_DARK, 'text');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(level, MARGIN, y + 3);

      fillRect(pdf, MARGIN + 36, y - 1, barMaxW, 7, BORDER);
      fillRect(pdf, MARGIN + 36, y - 1, barMaxW * pct, 7, color);

      setColor(pdf, TEXT_MID, 'text');
      pdf.text(`${count}`, PAGE_W - MARGIN, y + 3, { align: 'right' });

      y += 12;
    }

    y += 6;

    // Top gaps table
    if (topGaps.length > 0) {
      ({ y, pageNum } = ensureSpace(pdf, y, 20, pageNum, totalPages));

      setColor(pdf, TEXT_DARK, 'text');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('Priority Improvement Areas', MARGIN, y);
      y += 8;

      fillRect(pdf, MARGIN, y - 4, CONTENT_W, 8, [241, 245, 249]);
      setColor(pdf, TEXT_MID, 'text');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.text('Area', MARGIN + 2, y + 1);
      pdf.text('Domain', MARGIN + 100, y + 1);
      pdf.text('Current', MARGIN + 136, y + 1);
      pdf.text('Gap', PAGE_W - MARGIN - 2, y + 1, { align: 'right' });
      y += 10;

      for (const gap of topGaps) {
        ({ y, pageNum } = ensureSpace(pdf, y, 14, pageNum, totalPages));

        const questionLines = pdf.splitTextToSize(gap.text, 94);
        const rowH = questionLines.length * 5 + 4;

        setColor(pdf, TEXT_DARK, 'text');
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.text(questionLines, MARGIN + 2, y);

        setColor(pdf, TEXT_MID, 'text');
        pdf.setFontSize(8.5);
        pdf.text(pdf.splitTextToSize(gap.domain, 30)[0], MARGIN + 100, y);
        pdf.text(`${gap.ans}/5`, MARGIN + 136, y);

        const gapColor = gap.gap >= 3 ? [185, 28, 28] : gap.gap >= 2 ? [161, 98, 7] : [22, 163, 74];
        setColor(pdf, gapColor, 'text');
        pdf.setFont('helvetica', 'bold');
        pdf.text(`-${gap.gap}`, PAGE_W - MARGIN - 2, y, { align: 'right' });

        hRule(pdf, y + rowH - 1, { color: BORDER, width: 0.2 });
        y += rowH;
      }
    }

    // ────────────────────────────────────────────────────────────────────────
    // PAGE 3+: Detailed Results
    // ────────────────────────────────────────────────────────────────────────
    pdf.addPage();
    pageNum = 3;
    addPageFooter(pdf, pageNum, totalPages);

    y = MARGIN;
    y = sectionHeader(pdf, y, 2, 'Detailed Assessment Results');

    for (const [, domain] of Object.entries(domains)) {
      ({ y, pageNum } = ensureSpace(pdf, y, 22, pageNum, totalPages));

      // Domain header: navy-blue left border + title
      const domScore = this.calculateDomainScore(domain, answers);
      fillRect(pdf, MARGIN, y - 4, 4, 14, BRAND_BLUE);
      fillRect(pdf, MARGIN + 4, y - 4, CONTENT_W - 4, 14, [238, 242, 255]);

      setColor(pdf, TEXT_DARK, 'text');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text(domain.title, MARGIN + 8, y + 4);

      if (domScore > 0) {
        const dLabel = `${domScore.toFixed(2)} / 5.0  —  ${this.getMaturityLevel(domScore)}`;
        setColor(pdf, BRAND_BLUE, 'text');
        pdf.setFontSize(9);
        pdf.text(dLabel, PAGE_W - MARGIN, y + 4, { align: 'right' });
      }
      y += 16;

      for (const [, category] of Object.entries(domain.categories || {})) {
        // Category subheading
        if (category.title || category.name) {
          ({ y, pageNum } = ensureSpace(pdf, y, 10, pageNum, totalPages));
          setColor(pdf, TEXT_MID, 'text');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.text((category.title || category.name || '').toUpperCase(), MARGIN + 6, y);
          y += 7;
        }

        for (const question of (category.questions || [])) {
          const ans = answers[question.id];
          if (ans === undefined) continue;

          ({ y, pageNum } = ensureSpace(pdf, y, 14, pageNum, totalPages));

          const ansLabel = ans === 0 ? 'N/A' : `${ans}/5 — ${this.getMaturityLevel(ans)}`;
          const qColor = ans === 0 ? TEXT_LIGHT
                       : ans >= 4 ? [22, 163, 74]
                       : ans >= 3 ? [161, 98, 7]
                       : [185, 28, 28];

          // Question ID
          setColor(pdf, TEXT_MID, 'text');
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.text(question.id.toUpperCase(), MARGIN + 3, y);

          // Question text (wrapped, up to 2 lines)
          setColor(pdf, TEXT_DARK, 'text');
          pdf.setFontSize(9);
          const lines = pdf.splitTextToSize(question.text || '', CONTENT_W - 52);
          const displayLines = lines.slice(0, 2);
          pdf.text(displayLines, MARGIN + 18, y);
          if (lines.length > 2) {
            setColor(pdf, TEXT_LIGHT, 'text');
            pdf.setFontSize(7);
            pdf.text('…', MARGIN + 18, y + displayLines.length * 4.5);
          }

          // Maturity badge
          setColor(pdf, qColor, 'text');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          const textY = y + (displayLines.length > 1 ? 0 : 0);
          pdf.text(ansLabel, PAGE_W - MARGIN, textY, { align: 'right' });

          y += displayLines.length * 4.5 + 4;

          // Assessor comment
          const note = comments?.[question.id];
          if (note?.trim()) {
            ({ y, pageNum } = ensureSpace(pdf, y, 8, pageNum, totalPages));
            setColor(pdf, [79, 70, 229], 'text');
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(8);
            const noteLines = pdf.splitTextToSize(`Note: ${note}`, CONTENT_W - 10);
            noteLines.slice(0, 3).forEach(line => {
              ({ y, pageNum } = ensureSpace(pdf, y, 6, pageNum, totalPages));
              pdf.text(line, MARGIN + 6, y);
              y += 5;
            });
          }

          // Evidence text
          const ev = evidence?.[question.id];
          if (ev?.text) {
            ({ y, pageNum } = ensureSpace(pdf, y, 8, pageNum, totalPages));
            setColor(pdf, TEXT_LIGHT, 'text');
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(8);
            const evLines = pdf.splitTextToSize(`Evidence: ${ev.text}`, CONTENT_W - 10);
            evLines.slice(0, 3).forEach(line => {
              ({ y, pageNum } = ensureSpace(pdf, y, 6, pageNum, totalPages));
              pdf.text(line, MARGIN + 6, y);
              y += 5;
            });
          }

          // Evidence images
          if (ev?.images?.length > 0) {
            for (let i = 0; i < ev.images.length; i++) {
              const imgData = ev.images[i];
              const imgUrl = typeof imgData === 'string' ? imgData : imgData?.data;
              if (!imgUrl) continue;
              try {
                ({ y, pageNum } = ensureSpace(pdf, y, 65, pageNum, totalPages));
                const base64 = await loadImageAsBase64(imgUrl);
                const { width: iw, height: ih } = await new Promise(res => {
                  const img = new Image();
                  img.onload = () => {
                    const ar = img.width / img.height;
                    const w = Math.min(70, CONTENT_W / 2);
                    res({ width: w, height: w / ar });
                  };
                  img.onerror = () => res({ width: 70, height: 52 });
                  img.src = base64;
                });
                pdf.addImage(base64, 'JPEG', MARGIN + 6, y, iw, ih);
                if (imgData.name) {
                  setColor(pdf, TEXT_LIGHT, 'text');
                  pdf.setFontSize(7);
                  pdf.setFont('helvetica', 'normal');
                  pdf.text(imgData.name, MARGIN + 6, y + ih + 3);
                }
                y += ih + 8;
              } catch {
                setColor(pdf, TEXT_LIGHT, 'text');
                pdf.setFontSize(8);
                pdf.text(`(Image ${i + 1} unavailable)`, MARGIN + 6, y);
                y += 6;
              }
            }
          }
        }
      }
      y += 8;
    }

    // ── Visual Analysis ─────────────────────────────────────────────────────
    await this.addChartsToPage(pdf, domains, answers, pageNum, totalPages, options?.chartSnapshots);

    // ── Compliance Frameworks ───────────────────────────────────────────────
    if (complianceFrameworks) {
      const enabled = Object.entries(complianceFrameworks).filter(([, f]) => f.enabled);
      if (enabled.length > 0) {
        pdf.addPage();
        pageNum++;
        addPageFooter(pdf, pageNum, totalPages);
        y = MARGIN;

        y = sectionHeader(pdf, y, 4, 'Compliance Framework Scores');

        for (const [key, fw] of enabled) {
          ({ y, pageNum } = ensureSpace(pdf, y, 22, pageNum, totalPages));
          setColor(pdf, TEXT_DARK, 'text');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(11);
          pdf.text(fw.name || key, MARGIN, y);

          if (fw.score !== undefined) {
            const sc = fw.score >= 80 ? [22, 163, 74] : fw.score >= 60 ? [161, 98, 7] : [185, 28, 28];
            setColor(pdf, sc, 'text');
            pdf.text(`${fw.score.toFixed(1)}%`, PAGE_W - MARGIN, y, { align: 'right' });
          }
          scoreBar(pdf, MARGIN, y + 3, (fw.score || 0) / 20, { barW: CONTENT_W, max: 5 });
          y += 18;
        }
      }
    }

    return pdf;
  },

  async addChartsToPage(pdf, _domains, _answers, pageNum, totalPages, chartSnapshots = {}) {
    try {
      // Build list of {img: dataUrl, title} — prefer pre-captured snapshots over DOM queries
      const toRender = [
        { key: 'heatmap', selector: '[data-testid="domain-heatmap"]',  title: 'Assessment Heatmap' },
        { key: 'radar',   selector: '[data-testid="radar-chart"]',     title: 'Domain Radar Chart' },
        { key: 'bar',     selector: '[data-testid="bar-chart"]',       title: 'Domain Bar Chart' }
      ].map(c => {
        const img = chartSnapshots[c.key]
          || (document.querySelector(c.selector)?.querySelector('canvas'))?.toDataURL('image/png');
        return img ? { img, title: c.title } : null;
      }).filter(Boolean);

      if (toRender.length === 0) return;

      pdf.addPage();
      pageNum++;
      addPageFooter(pdf, pageNum, totalPages);
      let y = MARGIN;

      y = sectionHeader(pdf, y, 3, 'Visual Analysis');

      const maxH = PAGE_H - MARGIN * 2 - 30;

      for (const { img, title } of toRender) {
        // Determine aspect ratio from the data URL via a temporary image element
        const ar = await new Promise(res => {
          const i = new Image();
          i.onload = () => res(i.width / i.height || 1);
          i.onerror = () => res(1);
          i.src = img;
        });
        let iw = CONTENT_W;
        let ih = iw / ar;
        if (ih > maxH) { ih = maxH; iw = ih * ar; }

        if (y + ih + 15 > PAGE_H - MARGIN) {
          pdf.addPage();
          pageNum++;
          addPageFooter(pdf, pageNum, totalPages);
          y = MARGIN;
        }

        setColor(pdf, TEXT_MID, 'text');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text(title, MARGIN, y);
        y += 6;

        pdf.addImage(img, 'PNG', MARGIN, y, iw, ih);
        y += ih + 14;
      }
    } catch (err) {
      console.error('Error adding charts to PDF:', err);
    }
  },

  async downloadPDF(pdf, filename = 'maturity-assessment-report.pdf') {
    pdf.save(filename);
  }
};
