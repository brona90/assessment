# Technology Assessment Framework

A structured maturity assessment tool for data & engineering teams. Runs entirely in the browser — no server, no accounts, no data ever leaves your machine.

**Live app:** https://brona90.github.io/assessment

---

## Privacy first: where your data lives

Everything you enter stays on your device.

- **Answers and comments** are written to your browser's `localStorage` the moment you click a rating.
- **Evidence** (images and text notes) is stored in your browser's `IndexedDB`.
- **Nothing is transmitted** — there is no backend, no database, no analytics.
- Clearing your browser data removes all assessment data permanently.
- Exporting a PDF or JSON file is the only way to take your data out.

---

## Running an assessment: participant guide

### Step 1 — Open the app and select your name

The first screen shows a list of assessors. Click your name. You do not need a password. If your name is not listed, ask your admin to add you.

### Step 2 — Work through the questions

Your questions are grouped into domains (tabs at the top) and categories (sections within each tab).

For each question, select a maturity rating:

| Score | Label | What it means |
|-------|-------|---------------|
| 1 | Not Implemented | Nothing in place |
| 2 | Initial | Ad hoc, inconsistent |
| 3 | Defined | Documented, repeatable |
| 4 | Managed | Measured, proactively managed |
| 5 | Optimized | Continuously improved |

You can also mark a question **N/A** if it does not apply to your role or team.

**Your answers save automatically** as you go — you do not need to click a save button. You can close the browser and return later; your progress will still be there.

### Step 3 — Add evidence (optional)

Click the evidence icon on any question to attach supporting material:

- Upload screenshots, architecture diagrams, or other images
- Type free-text notes, links, or justifications

Evidence helps reviewers understand the context behind a score and is included in the PDF report.

### Step 4 — View your results

Once you have answered your questions, click **View Results**. The results screen shows:

- Your overall maturity score and level
- Domain-by-domain scores compared against the **2025 industry average** and **top-quartile benchmark** from published research (FinOps Foundation, McKinsey, DORA, Gartner, and others)
- Four interactive charts — radar, bar, heatmap, and trend over time — each expandable to fullscreen with filter and export controls
- Compliance framework status cards showing how your scores map to frameworks like SOX, ISO 27001, NIST CSF, and GDPR

### Step 5 — Download the report

Click **Download Report** to generate a PDF. The report includes a cover page, executive summary with top gaps, detailed domain breakdowns, and a compliance summary. Charts are embedded from the live canvas.

---

## Admin guide: how data flows through the tool

As admin you configure the tool, run the assessment cycle, and collect the results. Here is the end-to-end flow.

```
Static JSON files          Admin configures          Participants answer
(shipped with app)    →    users & questions    →    in their browsers
      ↓                           ↓                         ↓
questions.json             localStorage                 localStorage
users.json              (adminAssignments)           (per-user answers)
compliance.json                                        IndexedDB (evidence)
benchmarks.json
                                                            ↓
                                               Admin aggregates in Overview tab
                                                            ↓
                                               Export PDF / JSON / CSV
```

### Phase 1 — Set up the assessment

Navigate to the admin dashboard (`#admin`) and go to the **Configure** tab.

**People sub-tab:**
1. Add each participant as a user (name, email, role).
2. Assign questions to each user. You can give everyone the same full set, or scope different domains to different roles (e.g. FinOps questions only to the cloud team).

**Content sub-tab:**
Review the default question set — 48 questions across four domains and twelve categories. Edit questions or add new ones to fit your organisation's context.

**Frameworks sub-tab:**
Enable the compliance frameworks relevant to your organisation (SOX, GDPR, HIPAA, PCI DSS, ISO 27001, NIST CSF, FedRAMP). For each framework you can:
- Set the pass threshold (a 1–5 maturity score — e.g. 4.0 means 80% required to pass)
- Edit the requirements list shown on each compliance card
- Adjust which questions are mapped to the framework

### Phase 2 — Share the app URL

Send participants the URL. Because there is no login system, each person simply clicks their name on the first screen. All they need is a browser — no install, no account.

If participants are on different machines, their answers stay on their own machine. You will need to collect their data via JSON export (see Phase 3).

### Phase 3 — Collect results

**If everyone is on the same machine** (e.g. a workshop setting): go to the **Overview** tab. It aggregates all users' answers and shows the full team picture immediately.

**If participants are on different machines**: ask each person to export their data via **Download My Data** (JSON) from the results screen, then use the **Data** tab → JSON import to load each export into the admin instance. The admin instance merges all imports and the Overview updates.

### Phase 4 — Review the aggregated dashboard

The **Overview** tab shows:

- **Completion table** — each user × each question, colour-coded by score, so you can see at a glance where gaps and unanswered questions are
- **Domain charts** — radar and bar charts aggregated across all participants against industry benchmarks
- **Assessment heatmap** — all questions ranked by average score; lowest-scoring questions surface at the bottom
- **Compliance framework cards** — team-level scores against each enabled framework's pass threshold

### Phase 5 — Export

From the **Data** tab:
- **Export JSON** — full snapshot of all configuration and answers; use this to back up or hand off to another admin
- **Export CSV** — separate files for questions, users, domains, and frameworks; useful for editing in a spreadsheet and re-importing
- **Generate PDF** — from the results screen; one report per user, or run as admin to get the aggregated view

### Phase 6 — Reset for the next cycle

When you are ready to run the assessment again (e.g. quarterly), go to the **Data** tab → Danger Zone → **Clear All Data**. This wipes all answers and evidence from the browser and returns the app to a clean state. Configuration (users, questions, frameworks) is also cleared, so export your JSON first if you want to restore the setup.

---

## Benchmark reference

Scores are compared against industry averages and top-quartile (75th percentile) figures derived from published research across 17 sources including:

- FinOps Foundation State of FinOps (2024–2026)
- McKinsey State of AI (2024, March 2025, November 2025)
- DORA Accelerate State of DevOps (2024, 2025)
- Grafana Labs Observability Survey 2025
- Gartner AI-Ready Data & AI Maturity surveys 2025
- Red Hat State of Platform Engineering 2025
- Catchpoint SRE Report 2025

Historical data covers 2020–2026. Full citations are in `public/data/benchmarks.json` and visible in the chart Sources panel.

---

## Tech stack

| | |
|--|--|
| UI | React 19 + Vite |
| Charts | Chart.js |
| Client storage | localStorage + IndexedDB (LocalForage) |
| PDF | jsPDF |
| Tests | Vitest + React Testing Library + Cucumber/Playwright |
| Hosting | GitHub Pages |

---

## Development

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # 790 unit tests
npm run test:coverage  # Coverage report (95% minimum)
npm run cucumber     # BDD/E2E tests
npm run build        # Production build → dist/
npm run deploy       # Deploy to GitHub Pages
```

---

## Project structure

```
public/data/
  questions.json      domains → categories → questions
  users.json          user list and roles
  compliance.json     frameworks, thresholds, question mappings
  benchmarks.json     industry scores + source citations

src/
  components/         React UI (UserView, ResultsView, FullScreenAdminView, ...)
  hooks/              Domain logic (useAssessment, useUser, useRouter, ...)
  services/           Storage, PDF, compliance scoring, data loading
  utils/              Score calculator, CSV helpers, chart theme

features/             Cucumber BDD scenarios
```

---

## License

MIT
