# Technology Assessment Framework

A client-side React SPA for running structured data & engineering maturity assessments across teams. No backend — all data lives in the browser.

**Live app:** https://brona90.github.io/assessment

---

## What it does

The app guides one or more assessors through a scored questionnaire covering four maturity domains:

| Domain | Focus |
|--------|-------|
| Data Platform & Observability | Data quality, pipelines, observability tooling |
| FinOps & Data Management | Cloud cost management, data governance |
| Analytics & AI/ML Capabilities | ML adoption, GenAI, analytics maturity |
| Engineering Culture & Operations | DevOps, platform engineering, reliability |

Each question is scored on a 1–5 maturity scale (Not Implemented → Optimized). The app calculates domain and overall scores, benchmarks them against published industry data, maps them to compliance frameworks, and generates a PDF report.

---

## Assessment workflow

### 1. Select a user

The login screen lists all configured assessors. Click a name to begin. Each assessor sees only the questions assigned to them by the admin.

### 2. Answer questions

Questions are grouped by domain (tabs across the top) and category (sections within each tab). For each question:

- Select a maturity rating from 1 (Not Implemented) to 5 (Optimized), or mark N/A
- Optionally add a comment
- Optionally attach evidence — images or text notes — via the evidence button

Progress is tracked per domain and overall. Answers save automatically to `localStorage` as you go.

### 3. View results

Click **View Results** (or navigate to `#results`) once you have answered enough questions. The results screen shows:

- **Overall maturity score** and maturity level label
- **Domain scores** compared against the 2025 industry average and top-quartile benchmark
- **Four charts** — radar, bar, heatmap, and trend line — all expandable to fullscreen with toolbar controls (filter by domain, adjust target score, toggle benchmark datasets, export PNG)
- **Compliance framework status** — cards showing your score against each enabled framework's pass threshold, expandable to see per-question breakdown

### 4. Export a PDF report

Click **Download Report** from the results screen. The PDF includes:

- Cover page
- Executive summary with maturity distribution and top gaps
- Detailed domain pages with category breakdowns
- Compliance page with framework scores

Charts are captured from the live canvas and embedded in the report.

---

## Admin workflow

Navigate to `#admin` and select an admin user at the login screen.

### Overview tab
The default view shows a completion table (all users × all questions), domain charts aggregated across all users, and the compliance framework status for the whole team.

### Configure tab
Three sub-tabs for setup tasks:

- **People** — add/edit/delete users, assign questions to each user
- **Content** — add/edit/delete domains and questions
- **Frameworks** — enable/disable compliance frameworks, edit name/description/threshold/requirements, map questions to each framework

### Data tab
- **CSV import/export** — download or upload questions, users, domains, and frameworks as CSV files
- **JSON import/export** — full bulk export of all app state; re-import to restore
- **Danger zone** — clear all data (with confirmation)

---

## Compliance frameworks

Seven frameworks are pre-configured: SOX, PII/GDPR, HIPAA, PCI DSS, ISO 27001, NIST CSF, and FedRAMP. Each has:

- A set of mapped questions relevant to that framework's controls
- A pass threshold on the 1–5 maturity scale (e.g. 4.0 = 80%)
- A requirements list shown in the expanded compliance card

Admins can enable/disable frameworks, adjust mappings, and edit thresholds.

---

## Benchmark data

Industry average and top-quartile (75th percentile) scores are drawn from published annual research (2020–2026), including:

- FinOps Foundation State of FinOps (2024–2026)
- McKinsey State of AI (2024, March 2025, November 2025)
- DORA Accelerate State of DevOps (2024, 2025)
- Grafana Labs Observability Survey 2025
- Gartner AI-Ready Data & AI Maturity surveys 2025
- Red Hat State of Platform Engineering 2025
- Catchpoint SRE Report 2025
- Databricks State of Data + AI 2024
- TDWI BI & AI Maturity Assessment 2025
- Monte Carlo Data Quality Statistics 2025

Sources are cited in `public/data/benchmarks.json` and displayed in the chart header via the Sources panel.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| UI | React 19 + Vite |
| Charts | Chart.js via react-chartjs-2 |
| Storage | localStorage (answers/settings) + IndexedDB via LocalForage (evidence) |
| PDF | jsPDF |
| Testing | Vitest + React Testing Library + Cucumber/Playwright (E2E) |
| Hosting | GitHub Pages |

---

## Getting started

```bash
npm install
npm run dev          # http://localhost:5173
```

### Commands

```bash
npm run dev           # Dev server
npm run build         # Production build → dist/
npm run preview       # Preview production build
npm run lint          # ESLint
npm test              # Unit/component tests (Vitest)
npm run test:ui       # Interactive Vitest UI
npm run test:coverage # Coverage report (95% minimum threshold)
npm run cucumber      # BDD/E2E tests (5 parallel workers)
npm run deploy        # Build + push to gh-pages
```

Run a single test file:
```bash
npx vitest run src/components/ComplianceCard.test.jsx
```

---

## Project structure

```
public/
└── data/
    ├── questions.json     # Domains, categories, questions
    ├── users.json         # Users and roles
    ├── compliance.json    # Frameworks, thresholds, question mappings
    └── benchmarks.json    # Industry benchmark scores + sources

src/
├── components/            # React UI components
│   ├── UserView.jsx       # Assessment (questions + tabs)
│   ├── ResultsView.jsx    # Scores + charts + compliance cards
│   ├── FullScreenAdminView.jsx  # Admin dashboard (3-tab)
│   ├── ComplianceCard.jsx # Expandable framework status card
│   ├── ChartFullscreenView.jsx  # Fullscreen chart with toolbar
│   ├── CSVImportExport.jsx      # CSV import/export UI
│   ├── EvidenceModal.jsx  # Evidence (images + text) capture
│   └── Domain*Chart.jsx   # Radar / bar / heatmap / trend charts
├── hooks/                 # Custom hooks (one per domain slice)
│   ├── useAssessment.js   # Answers, evidence, comments
│   ├── useUser.js         # Auth and roles
│   ├── useRouter.js       # Hash-based routing
│   ├── useCompliance.js   # Framework score calculation
│   └── useDataStore.js    # Questions, users, frameworks
├── services/
│   ├── storageService.js  # localStorage / IndexedDB abstraction
│   ├── dataStore.js       # In-memory data model + persistence
│   ├── pdfService.js      # PDF generation (jsPDF)
│   ├── complianceService.js  # Framework scoring
│   └── dataService.js     # Static JSON loader
└── utils/
    ├── scoreCalculator.js # Maturity scoring and progress
    ├── csvUtils.js        # CSV parse/generate/download
    └── chartTheme.js      # Shared Chart.js dark theme config

features/                  # Cucumber BDD scenarios + step definitions
```

---

## Routing

Hash-based routing, no server configuration required:

| Hash | View |
|------|------|
| `#` | Assessment (question answering) |
| `#results` | Results (scores + charts) |
| `#results/chart/radar` | Fullscreen radar chart |
| `#results/chart/bar` | Fullscreen bar chart |
| `#results/chart/heatmap` | Fullscreen heatmap |
| `#results/chart/trend` | Fullscreen trend chart |
| `#admin` | Admin dashboard (Overview) |
| `#admin/overview` | Overview tab |
| `#admin/configure` | Configure tab |
| `#admin/data` | Data tab |

---

## Testing

790 unit and component tests across 33 test files. 95% coverage threshold enforced on all metrics.

```bash
npm run test:coverage
```

E2E/BDD tests use Cucumber + Playwright and cover the full assessment workflow, PDF export, compliance framework behaviour, and chart interactions.

---

## License

MIT
