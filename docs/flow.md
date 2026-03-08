# Application Flow

This app runs entirely in the browser — no backend, no database.
All data is stored in the user's browser:
- **localStorage** — question answers (keyed per user)
- **IndexedDB** (via LocalForage) — evidence files (text + images)

Nothing leaves the device unless the user explicitly exports a file.

---

## Overall Workflow

```mermaid
flowchart TD
    START([Open app in browser]) --> SEL[User Selection Screen]

    SEL -->|Click assessor card| ASSESS[Assessment View]
    SEL -->|Click admin card| ADMIN[Admin Dashboard]

    subgraph Assessor Journey
        ASSESS --> Q[Answer questions\n1 = Not Implemented → 5 = Optimized]
        Q --> E[Add evidence\ntext notes + photos]
        E --> SAVE[(Answers → localStorage\nEvidence → IndexedDB)]
        SAVE --> Q
        Q --> RES[View Results\ndomain scores, charts]
        Q --> EXP[Export My Data\ndownloads JSON file]
        EXP --> LOGOUT_U[Logout]
        RES --> LOGOUT_U
    end

    subgraph Admin Journey
        ADMIN --> TAB_DASH[Dashboard tab\nAggregate charts across all assessors]
        ADMIN --> TAB_ASSIGN[Assignments tab\nAssign questions to assessors]
        ADMIN --> TAB_FW[Frameworks tab\nEnable frameworks + map questions]
        ADMIN --> TAB_DATA[Data Management tab\nImport assessor exports / Export all data]
        ADMIN --> TAB_COMP[Compliance tab\nView framework compliance scores]
        ADMIN --> LOGOUT_A[Logout]

        TAB_DATA -->|Import assessor JSON| MERGE[(Merge answers into\nper-user localStorage)]
        MERGE --> TAB_DASH
    end

    LOGOUT_U --> SEL
    LOGOUT_A --> SEL
```

---

## Storage Architecture

```mermaid
flowchart LR
    subgraph Browser Storage
        LS[(localStorage)]
        IDB[(IndexedDB\nvia LocalForage)]
    end

    subgraph Keys in localStorage
        A1[assessmentData_user1]
        A2[assessmentData_user2]
        AN[assessmentData_userN]
        CFG[adminAssignments]
        MAP[frameworkMappings]
        CUR[currentUser]
    end

    subgraph IndexedDB store: evidence
        EV[questionId → text + images]
    end

    LS --- A1 & A2 & AN & CFG & MAP & CUR
    IDB --- EV
```

---

## Multi-Assessor Data Collection

Because the app has no server, the typical workflow for collecting responses
from multiple people is one of these:

### Option A — Shared device (pass the laptop/tablet)
1. Admin sets up question assignments
2. Each assessor selects their name, answers their questions, exports their JSON, logs out
3. Admin logs in, imports each JSON export via **Data Management → Import**
4. Admin views consolidated results in **Dashboard** and **Compliance** tabs

### Option B — Individual devices
1. Each assessor opens the GitHub Pages URL on their own device
2. They answer questions and export their JSON
3. They send the JSON file to the admin
4. Admin imports each file as above

### Data never leaves the browser automatically
- Answers are saved to `localStorage` on every keystroke — no submit needed
- Evidence images are stored in IndexedDB as base64
- Export is explicit: user clicks "Export My Data" to produce a portable JSON snapshot

---

## Route Map

| URL hash            | View                                      |
|---------------------|-------------------------------------------|
| *(none)*            | User Selection Screen (no user logged in) |
| `#`                 | Assessment (question answering)           |
| `#results`          | Personal results with charts              |
| `#admin`            | Admin → Domains tab                       |
| `#admin/frameworks` | Admin → Frameworks + question mapping     |
| `#admin/users`      | Admin → User management                   |
| `#admin/questions`  | Admin → Question management               |
| `#admin/assignments`| Admin → Assign questions to assessors     |
| `#admin/dashboard`  | Admin → Aggregate maturity charts         |
| `#admin/compliance` | Admin → Compliance framework scores       |
| `#admin/data-management` | Admin → Import / Export / Clear     |

All routing is hash-based — compatible with static GitHub Pages hosting.
