import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ─── Design tokens ────────────────────────────────────────────────────────────
const BRAND_PURPLE  = [102, 126, 234];
const BRAND_DARK    = [118,  75, 162];
const TEXT_DARK     = [ 31,  41,  55];
const TEXT_MID      = [107, 114, 128];
const TEXT_LIGHT    = [156, 163, 175];
const SURFACE_GRAY  = [249, 250, 251];
const BORDER_GRAY   = [229, 231, 235];

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
  if (type === 'text')   pdf.setTextColor(...rgb);
  else if (type === 'draw')  pdf.setDrawColor(...rgb);
  else if (type === 'fill')  pdf.setFillColor(...rgb);
}

/** Draw a horizontal rule */
function hRule(pdf, y, { color = BORDER_GRAY, width = 0.3 } = {}) {
  setColor(pdf, color, 'draw');
  pdf.setLineWidth(width);
  pdf.line(MARGIN, y, PAGE_W - MARGIN, y);
}

/** Draw a filled rect */
function fillRect(pdf, x, y, w, h, color) {
  setColor(pdf, color, 'fill');
  pdf.rect(x, y, w, h, 'F');
}

/** Draw a score bar (0-5 scale) */
function scoreBar(pdf, x, y, score, { barH = 3, barW = 40, max = 5 } = {}) {
  const pct = Math.min(score / max, 1);
  const color = score >= 4 ? [34, 197, 94]
              : score >= 3 ? [234, 179, 8]
              : score >= 2 ? [249, 115, 22]
              : [239, 68, 68];

  fillRect(pdf, x, y, barW, barH, BORDER_GRAY);
  fillRect(pdf, x, y, barW * pct, barH, color);
}

/** Ensure there's room for `needed` mm; adds a page and resets y if not */
function ensureSpace(pdf, y, needed, pageNum, totalPages) {
  if (y + needed > PAGE_H - MARGIN) {
    pageNum++;
    pdf.addPage();
    addPageFooter(pdf, pageNum, totalPages);
    return { y: MARGIN + 10, pageNum };
  }
  return { y, pageNum };
}

/** Page footer: page number + report title */
function addPageFooter(pdf, pageNum, totalPages) {
  setColor(pdf, TEXT_LIGHT, 'text');
  pdf.setFontSize(8);
  pdf.text('Technology Maturity Assessment Report', MARGIN, PAGE_H - 10);
  pdf.text(`Page ${pageNum} of ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 10, { align: 'right' });
  hRule(pdf, PAGE_H - 14, { color: BORDER_GRAY, width: 0.2 });
}

// ─── Helper: load image as base64 ─────────────────────────────────────────────
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

// ─── Main service ─────────────────────────────────────────────────────────────

export const pdfService = {
  // Expose for backwards-compat and unit tests
  getMaturityLevel(score) {
    if (score >= 4.5) return 'Optimized';
    if (score >= 3.5) return 'Managed';
    if (score >= 2.5) return 'Defined';
    if (score >= 1.5) return 'Initial';
    return 'Not Implemented';
  },

  calculateDomainScore(domain, answers) {
    const questions = [];
    Object.values(domain.categories || {}).forEach(cat => {
      if (cat.questions) questions.push(...cat.questions);
    });
    if (questions.length === 0) return 0;
    let total = 0, count = 0;
    questions.forEach(q => {
      if (answers[q.id] !== undefined && answers[q.id] !== 0) {
        total += answers[q.id]; count++;
      }
    });
    return count > 0 ? total / count : 0;
  },

  calculateOverallScore(domains, answers) {
    let weighted = 0, weight = 0;
    Object.values(domains).forEach(domain => {
      const score = this.calculateDomainScore(domain, answers);
      if (score > 0) {
        weighted += score * (domain.weight || 1);
        weight   += (domain.weight || 1);
      }
    });
    return weight > 0 ? weighted / weight : 0;
  },

  async generatePDF(domains, answers, evidence, complianceFrameworks, options = {}) {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const { orgName = 'Organisation', reportTitle = 'Technology Maturity Assessment' } = options || {};

    // ── Pre-calculate data ────────────────────────────────────────────────────
    const overallScore = this.calculateOverallScore(domains, answers);
    const maturityLabel = this.getMaturityLevel(overallScore);
    const maturityColor = MATURITY_COLORS[maturityLabel] || BRAND_PURPLE;

    const domainRows = Object.entries(domains).map(([key, domain]) => ({
      key, title: domain.title,
      score: this.calculateDomainScore(domain, answers),
      weight: domain.weight || 1
    }));

    // Estimate total pages (cover + exec + detail + compliance)
    const totalPages = 3 + Math.ceil(domainRows.length / 2);

    // ── PAGE 1: Cover ─────────────────────────────────────────────────────────
    // Header band
    fillRect(pdf, 0, 0, PAGE_W, 60, BRAND_PURPLE);
    // Accent strip
    fillRect(pdf, 0, 58, PAGE_W, 4, BRAND_DARK);

    // Title text
    setColor(pdf, [255, 255, 255], 'text');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.text(reportTitle, MARGIN, 28);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(orgName, MARGIN, 40);

    pdf.setFontSize(10);
    setColor(pdf, [200, 210, 255], 'text');
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, MARGIN, 52);

    // Overall score spotlight
    let y = 80;
    fillRect(pdf, MARGIN, y, CONTENT_W, 50, SURFACE_GRAY);
    setColor(pdf, TEXT_MID, 'text');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('OVERALL MATURITY SCORE', MARGIN + 8, y + 10);

    setColor(pdf, maturityColor, 'text');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(36);
    pdf.text(`${overallScore.toFixed(2)}`, MARGIN + 8, y + 32);
    pdf.setFontSize(14);
    pdf.text('/ 5.0', MARGIN + 40, y + 32);

    setColor(pdf, maturityColor, 'fill');
    pdf.roundedRect(PAGE_W - MARGIN - 55, y + 18, 55, 14, 3, 3, 'F');
    setColor(pdf, [255, 255, 255], 'text');
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(maturityLabel, PAGE_W - MARGIN - 27.5, y + 27, { align: 'center' });

    // Domain summary
    y = 148;
    setColor(pdf, TEXT_DARK, 'text');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text('Domain Scores', MARGIN, y);
    hRule(pdf, y + 3, { color: BRAND_PURPLE, width: 0.5 });
    y += 12;

    for (const d of domainRows) {
      setColor(pdf, TEXT_DARK, 'text');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const label = d.score > 0 ? `${d.score.toFixed(2)} / 5.0  (${this.getMaturityLevel(d.score)})` : 'No data';
      pdf.text(d.title, MARGIN, y);
      setColor(pdf, TEXT_MID, 'text');
      pdf.text(label, PAGE_W - MARGIN, y, { align: 'right' });
      scoreBar(pdf, MARGIN, y + 2, d.score);
      y += 14;
    }

    addPageFooter(pdf, 1, totalPages);

    // ── PAGE 2: Detailed Results ───────────────────────────────────────────────
    pdf.addPage();
    let pageNum = 2;
    addPageFooter(pdf, pageNum, totalPages);

    y = MARGIN;
    setColor(pdf, BRAND_PURPLE, 'text');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('Detailed Assessment Results', MARGIN, y);
    hRule(pdf, y + 4, { color: BRAND_PURPLE, width: 0.5 });
    y += 16;

    for (const [, domain] of Object.entries(domains)) {
      ({ y, pageNum } = ensureSpace(pdf, y, 20, pageNum, totalPages));

      // Domain header
      fillRect(pdf, MARGIN, y - 4, CONTENT_W, 12, SURFACE_GRAY);
      setColor(pdf, TEXT_DARK, 'text');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text(domain.title, MARGIN + 3, y + 4);
      y += 14;

      for (const category of Object.values(domain.categories || {})) {
        for (const question of (category.questions || [])) {
          const ans = answers[question.id];
          if (ans === undefined) continue;

          ({ y, pageNum } = ensureSpace(pdf, y, 12, pageNum, totalPages));

          const ansLabel = ans === 0 ? 'N/A' : `${ans}/5 — ${this.getMaturityLevel(ans)}`;
          const qColor = ans === 0 ? TEXT_LIGHT : (ans >= 4 ? [22, 163, 74] : ans >= 3 ? [161, 98, 7] : [185, 28, 28]);

          setColor(pdf, TEXT_MID, 'text');
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          const idLabel = question.id.toUpperCase();
          pdf.text(idLabel, MARGIN + 3, y);

          setColor(pdf, TEXT_DARK, 'text');
          pdf.setFontSize(9);
          const lines = pdf.splitTextToSize(question.text || '', CONTENT_W - 50);
          pdf.text(lines[0], MARGIN + 18, y);
          if (lines.length > 1) { y += 5; pdf.text(lines[1], MARGIN + 18, y); }

          setColor(pdf, qColor, 'text');
          pdf.setFont('helvetica', 'bold');
          pdf.text(ansLabel, PAGE_W - MARGIN, y - (lines.length > 1 ? 5 : 0), { align: 'right' });

          y += 7;

          // Evidence text
          const ev = evidence?.[question.id];
          if (ev?.text) {
            ({ y, pageNum } = ensureSpace(pdf, y, 8, pageNum, totalPages));
            setColor(pdf, TEXT_LIGHT, 'text');
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(8);
            const evLines = pdf.splitTextToSize(`Evidence: ${ev.text}`, CONTENT_W - 6);
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
      y += 6;
    }

    // ── Page 3+: Charts ────────────────────────────────────────────────────────
    await this.addChartsToPage(pdf, domains, answers, pageNum, totalPages);

    // ── Compliance page ────────────────────────────────────────────────────────
    if (complianceFrameworks) {
      const enabled = Object.entries(complianceFrameworks).filter(([, f]) => f.enabled);
      if (enabled.length > 0) {
        pdf.addPage();
        pageNum++;
        addPageFooter(pdf, pageNum, totalPages);
        y = MARGIN;

        setColor(pdf, BRAND_PURPLE, 'text');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.text('Compliance Framework Scores', MARGIN, y);
        hRule(pdf, y + 4, { color: BRAND_PURPLE, width: 0.5 });
        y += 18;

        for (const [key, fw] of enabled) {
          ({ y, pageNum } = ensureSpace(pdf, y, 20, pageNum, totalPages));
          setColor(pdf, TEXT_DARK, 'text');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(11);
          pdf.text(fw.name || key, MARGIN, y);
          if (fw.score !== undefined) {
            const scoreText = `${fw.score.toFixed(1)}%`;
            const sc = fw.score >= 80 ? [22, 163, 74] : fw.score >= 60 ? [161, 98, 7] : [185, 28, 28];
            setColor(pdf, sc, 'text');
            pdf.text(scoreText, PAGE_W - MARGIN, y, { align: 'right' });
          }
          // Compliance progress bar
          scoreBar(pdf, MARGIN, y + 3, (fw.score || 0) / 20, { barW: CONTENT_W, max: 5 });
          y += 16;
        }
      }
    }

    return pdf;
  },

  async addChartsToPage(pdf, _domains, _answers, pageNum, totalPages) {
    try {
      const containers = [
        { selector: '[data-testid="domain-heatmap"]',  title: 'Assessment Heatmap' },
        { selector: '[data-testid="radar-chart"]',     title: 'Domain Radar Chart' },
        { selector: '[data-testid="bar-chart"]',       title: 'Domain Bar Chart' }
      ];

      const toRender = containers
        .map(c => ({ ...c, el: document.querySelector(c.selector)?.querySelector('canvas') }))
        .filter(c => c.el);

      if (toRender.length === 0) return;

      pdf.addPage();
      pageNum++;
      addPageFooter(pdf, pageNum, totalPages);
      let y = MARGIN;

      setColor(pdf, BRAND_PURPLE, 'text');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('Visual Analysis', MARGIN, y);
      hRule(pdf, y + 4, { color: BRAND_PURPLE, width: 0.5 });
      y += 16;

      for (const { el, title } of toRender) {
        const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
        const img = canvas.toDataURL('image/png');
        const ar = canvas.width / canvas.height;
        const iw = CONTENT_W;
        const ih = iw / ar;

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
