# Feature Reference

All features run entirely in the browser. No server, no database.

---

## Assessor Features

### 5-Point Maturity Scale
Questions are rated 1–5:

| Score | Label                |
|-------|----------------------|
| 1     | Not Implemented      |
| 2     | Initial / Ad-hoc     |
| 3     | Defined / Repeatable |
| 4     | Managed / Measured   |
| 5     | Optimized / Innovating |

Scores are averaged within each domain; the overall score is a weighted average of domain scores.

### N/A Option
Any question can be marked **Not Applicable**. N/A answers:
- Count as "answered" in the progress bar (the assessor made a deliberate choice)
- Are **excluded** from score averages and compliance calculations
- Are stored as `0` in `localStorage`

### Evidence Capture
Each question has an **Add Evidence** button that opens a modal where you can:
- Write free-text notes
- Upload photos (stored as base64 in IndexedDB)

The progress bar shows how many answered questions have evidence attached (e.g. `4/12 with evidence`).

### Results View
After answering, tap **View Results** to see:

- **Overall Maturity Score** with maturity-level label (e.g. "Managed")
- **Domain Breakdown** — per-domain scores and labels
- **Charts** — Heatmap (default), Radar, and Bar chart
  - Radar and Bar charts overlay an **Industry Benchmark** line from `public/data/benchmarks.json`
- **Fix These First** — gap analysis panel:
  - Lists answered questions that haven't reached the target score (4.0)
  - Sorted by weighted priority score: `gap × domain_weight`
  - Each item shows a color-coded, icon-prefixed badge: **⚠ High**, **◎ Medium**, **✓ Low**
  - Shows maturity label for current score

### Export
**Export My Data** downloads a JSON snapshot of your answers and evidence. This file can be imported by the admin.

---

## Admin Features

### Dashboard Tab (`#admin/dashboard`)
- **Participant Completion table** — shows each assessor's name, assigned question count, how many they've answered, percentage complete, and last-active timestamp
- Aggregate charts (heatmap, radar, bar) across all assessors

### Assignments Tab (`#admin/assignments`)
Assign subsets of questions to specific assessors. Assignments persist in `localStorage['adminAssignments']` and survive page reload.

### Frameworks Tab (`#admin/frameworks`)
Enable compliance frameworks and map questions to them. Mappings persist in `localStorage['frameworkMappings']`.

### Compliance Tab (`#admin/compliance`)
Per-framework compliance scores. A score is the average of mapped questions' answers, normalized to 0–100%. N/A answers are excluded.

### Data Management Tab (`#admin/data-management`)
- **Import** — merge one or more assessor JSON exports into local storage
- **Export** — download all user answers as a single JSON file
- **Clear** — wipe all stored data

---

## Scoring Logic (`src/utils/scoreCalculator.js`)

| Function | Description |
|---|---|
| `calculateDomainScore(questions, answers)` | Average of answered, non-N/A question scores in a domain |
| `calculateOverallScore(domains, answers)` | Weighted average across domains (skips domains with no answers) |
| `calculateProgressFromQuestions(questions, answers, evidence?)` | `{ answered, total, percentage, withEvidence }` |
| `getMaturityLevel(score)` | Maps score → label string |
| `calculatePriorityScore(score, domainWeight, target?)` | `max(0, target - score) × weight` — used to rank gap analysis |
| `calculateComplianceScore(framework, _, answers)` | Average of mapped questions as 0–100%, N/A excluded |

---

## Storage Keys

| Key | Type | Description |
|-----|------|-------------|
| `assessmentData_{userId}` | localStorage | User's answers `{ questionId: 1–5 or 0 }` |
| `adminAssignments` | localStorage | `{ userId: [questionId, …] }` |
| `frameworkMappings` | localStorage | `{ frameworkId: [questionId, …] }` |
| `lastActive_{userId}` | localStorage | ISO 8601 timestamp of last answer save |
| IndexedDB `evidence` store | IndexedDB | `questionId → { text, images: [{name, data, size}] }` |

---

## Data Files (`public/data/`)

| File | Purpose |
|------|---------|
| `questions.json` | Domain → category → question tree; source of truth for all questions |
| `users.json` | Assessor list with `id`, `name`, `role` |
| `compliance.json` | Compliance frameworks with `enabled`, `threshold`, `mappedQuestions` |
| `benchmarks.json` | Industry average scores by domain and category; quarterly history; target scores |
| `services.json` | Tool-specific benchmark data (Snowflake, Talend, etc.) |

Changes to these files take effect on next page load (no build step needed — served directly from GitHub Pages).
